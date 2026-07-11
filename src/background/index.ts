// WebForge Background Script

interface CaptureMetrics {
  totalWidth: number;
  totalHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
}

// Helper: Convert Data URL to ImageBitmap
async function dataUrlToImageBitmap(dataUrl: string): Promise<ImageBitmap> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return await createImageBitmap(blob);
}

// Stitch screenshots into one PNG data URL
async function captureFullPage(tabId: number, windowId: number): Promise<string> {
  // 1. Prepare page with dynamic script injection fallback
  let metrics: CaptureMetrics;
  try {
    metrics = await chrome.tabs.sendMessage(tabId, { action: 'PREPARE_CAPTURE' });
  } catch (err) {
    // Inject content script on demand if tab doesn't have it running
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    await new Promise(r => setTimeout(r, 200));
    metrics = await chrome.tabs.sendMessage(tabId, { action: 'PREPARE_CAPTURE' });
  }
  const { totalWidth, totalHeight, viewportHeight, devicePixelRatio } = metrics;

  // 2. Setup canvas
  const canvas = new OffscreenCanvas(totalWidth * devicePixelRatio, totalHeight * devicePixelRatio);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get OffscreenCanvas 2D context');

  try {
    // 3. Scroll and capture
    let currentY = 0;
    while (currentY < totalHeight) {
      let scrollY = currentY;
      // Handle overlapping bottom section
      if (scrollY + viewportHeight > totalHeight) {
        scrollY = Math.max(0, totalHeight - viewportHeight);
      }

      // Scroll to position
      await chrome.tabs.sendMessage(tabId, { action: 'SCROLL_TO', x: 0, y: scrollY });
      
      // Delay to allow rendering to settle and prevent MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND quota limit
      await new Promise(r => setTimeout(r, 350));

      // Capture visible viewport
      const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
      const bitmap = await dataUrlToImageBitmap(dataUrl);

      // Draw on stitched canvas
      ctx.drawImage(
        bitmap,
        0,
        0,
        bitmap.width,
        bitmap.height,
        0,
        scrollY * devicePixelRatio,
        totalWidth * devicePixelRatio,
        viewportHeight * devicePixelRatio
      );

      bitmap.close();

      if (currentY + viewportHeight >= totalHeight) {
        break;
      }
      currentY += viewportHeight;
    }

    // 4. Convert stitched canvas back to base64 URL
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  } finally {
    // ALWAYS restore page scroll state even if screenshot capture fails
    await chrome.tabs.sendMessage(tabId, { action: 'RESTORE_PAGE' }).catch(() => {});
  }
}

// Resize window helper
async function resizeWindow(windowId: number, width: number, height: number) {
  await chrome.windows.update(windowId, { width, height, state: 'normal' });
  // Wait for layout resize to apply
  await new Promise(r => setTimeout(r, 600));
}

// Global active crawl / capture states
let activeJob: {
  status: 'idle' | 'capturing' | 'crawling';
  progress: number;
  total: number;
  message: string;
} = { status: 'idle', progress: 0, total: 0, message: '' };

function updateStatus(status: typeof activeJob.status, progress: number, total: number, message: string) {
  activeJob = { status, progress, total, message };
  chrome.runtime.sendMessage({ action: 'CAPTURE_PROGRESS', ...activeJob }).catch(() => {});
}

// Listen to incoming messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'GET_STATUS') {
    sendResponse(activeJob);
  } else if (message.action === 'START_SINGLE_CAPTURE') {
    (async () => {
      try {
        updateStatus('capturing', 10, 100, 'Preparing page for full capture...');
        let targetTabId = message.tabId;
        let tab: chrome.tabs.Tab | undefined;
        if (targetTabId) {
          tab = await chrome.tabs.get(targetTabId);
        } else {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          tab = activeTab;
        }
        if (!tab || !tab.id || !tab.windowId) throw new Error('No active tab found');

        const senderTabId = _sender.tab?.id;
        
        // Active target tab for captures
        await chrome.tabs.update(tab.id, { active: true });
        await new Promise(r => setTimeout(r, 250));

        const screenshot = await captureFullPage(tab.id, tab.windowId);
        updateStatus('capturing', 90, 100, 'Extracting page metadata...');
        const metadata = await chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_METADATA' });

        // Restore active focus to dashboard
        if (senderTabId) {
          await chrome.tabs.update(senderTabId, { active: true });
        }

        updateStatus('idle', 100, 100, 'Capture complete.');
        sendResponse({ success: true, screenshot, metadata });
      } catch (err: any) {
        updateStatus('idle', 0, 100, `Error: ${err.message}`);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  } else if (message.action === 'START_RESPONSIVE_CAPTURE') {
    (async () => {
      try {
        let targetTabId = message.tabId;
        let tab: chrome.tabs.Tab | undefined;
        if (targetTabId) {
          tab = await chrome.tabs.get(targetTabId);
        } else {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          tab = activeTab;
        }
        if (!tab || !tab.id || !tab.windowId) throw new Error('No active tab found');

        const senderTabId = _sender.tab?.id;

        // Activate target tab temporarily
        await chrome.tabs.update(tab.id, { active: true });
        await new Promise(r => setTimeout(r, 250));

        const originalWindow = await chrome.windows.get(tab.windowId);
        const screenshots: Record<string, string> = {};

        const viewports = [
          { name: 'desktop', width: 1440, height: 900 },
          { name: 'tablet', width: 768, height: 1024 },
          { name: 'mobile', width: 390, height: 844 }
        ];

        for (let i = 0; i < viewports.length; i++) {
          const vp = viewports[i];
          updateStatus('capturing', Math.floor((i / viewports.length) * 100), 100, `Resizing window for ${vp.name}...`);
          await resizeWindow(tab.windowId, vp.width, vp.height);
          
          updateStatus('capturing', Math.floor(((i + 0.5) / viewports.length) * 100), 100, `Capturing full-page ${vp.name}...`);
          screenshots[vp.name] = await captureFullPage(tab.id, tab.windowId);
        }

        // Restore window
        updateStatus('capturing', 95, 100, 'Restoring browser window...');
        await chrome.windows.update(tab.windowId, {
          width: originalWindow.width || 1280,
          height: originalWindow.height || 800,
          state: originalWindow.state || 'normal'
        });

        const metadata = await chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_METADATA' });

        // Switch back to sender tab
        if (senderTabId) {
          await chrome.tabs.update(senderTabId, { active: true });
        }

        updateStatus('idle', 100, 100, 'Responsive captures completed.');
        sendResponse({ success: true, screenshots, metadata });
      } catch (err: any) {
        updateStatus('idle', 0, 100, `Error: ${err.message}`);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  } else if (message.action === 'START_CRAWL') {
    (async () => {
      const { startUrl, maxPages = 5 } = message;
      try {
        updateStatus('crawling', 0, maxPages, `Initializing crawler at ${startUrl}...`);
        
        const origin = new URL(startUrl).origin;
        const discoveredUrls = [startUrl];
        const crawledPages: any[] = [];
        const visited = new Set<string>();
        // Create a temporary window to capture crawled pages cleanly
        const tempWindow = await chrome.windows.create({
          url: 'about:blank',
          width: 1440,
          height: 900,
          focused: true
        });

        if (!tempWindow || tempWindow.id === undefined) {
          throw new Error('Failed to create temporary crawler window');
        }
        const tempWindowId = tempWindow.id;

        while (discoveredUrls.length > 0 && crawledPages.length < maxPages) {
          const currentUrl = discoveredUrls.shift()!;
          if (visited.has(currentUrl)) continue;
          visited.add(currentUrl);

          updateStatus(
            'crawling',
            crawledPages.length,
            maxPages,
            `Crawling (${crawledPages.length + 1}/${maxPages}): ${new URL(currentUrl).pathname}`
          );

          // Update temporary tab
          const [tempTab] = await chrome.tabs.query({ windowId: tempWindowId });
          await chrome.tabs.update(tempTab.id!, { url: currentUrl });

          // Wait for page load
          await new Promise<void>((resolve) => {
            const listener = (tabId: number, changeInfo: any) => {
              if (tabId === tempTab.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                // Extra delay for dynamic scripts/images to finish loading
                setTimeout(resolve, 1500);
              }
            };
            chrome.tabs.onUpdated.addListener(listener);
          });

          // Inject content script if needed (in case content script didn't run automatically)
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tempTab.id! },
              files: ['content.js']
            });
          } catch {
            // Already injected or unable
          }

          // Capture
          const screenshot = await captureFullPage(tempTab.id!, tempWindowId);
          const meta = await chrome.tabs.sendMessage(tempTab.id!, { action: 'EXTRACT_METADATA' });

          // Add child links to discovery queue
          if (meta.links) {
            meta.links.forEach((link: string) => {
              if (!visited.has(link) && !discoveredUrls.includes(link) && new URL(link).origin === origin) {
                discoveredUrls.push(link);
              }
            });
          }

          crawledPages.push({
            url: currentUrl,
            slug: new URL(currentUrl).pathname,
            screenshots: { desktop: screenshot },
            metadata: {
              title: meta.title || currentUrl,
              viewport: '1440x900',
              timestamp: new Date().toISOString(),
              fonts: meta.fonts || [],
              colors: meta.colors || []
            }
          });
        }

        // Close temp window
        await chrome.windows.remove(tempWindowId);

        updateStatus('idle', maxPages, maxPages, 'Crawl complete.');
        sendResponse({ success: true, pages: crawledPages, sitemap: Array.from(visited) });
      } catch (err: any) {
        updateStatus('idle', 0, maxPages, `Crawl error: ${err.message}`);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});
