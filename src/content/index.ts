// WebForge Content Script

// Helper: Convert RGB/RGBA to Hex. Returns null for fully transparent colors.
function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(',').map(s => parseFloat(s.trim()));
  const [r, g, b, a = 1] = parts;
  if (!Number.isFinite(r) || a === 0) return null;
  const h = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

// Extract design tokens (fonts & colors).
// Colors are weighted by the on-screen AREA they cover, not by element count,
// so a page's true background + primary text surface first — instead of
// whatever tag simply repeats most often. Near-identical shades are merged.
function extractDesignTokens() {
  const fontCount = new Map<string, number>();
  const colorWeight = new Map<string, number>();

  const bump = (map: Map<string, number>, key: string, w: number) => {
    if (!key || w <= 0) return;
    map.set(key, (map.get(key) || 0) + w);
  };

  const elements = Array.from(document.querySelectorAll('*')).slice(0, 6000);

  elements.forEach((el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const area = Math.max(0, rect.width) * Math.max(0, rect.height);
    if (area <= 0) return;

    // Fonts
    const fontFamily = style.fontFamily;
    if (fontFamily) {
      const clean = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      if (clean && !['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'inherit'].includes(clean)) {
        bump(fontCount, clean, 1);
      }
    }

    // Background color weighted by the full box it paints.
    const bgHex = rgbToHex(style.backgroundColor);
    if (bgHex) bump(colorWeight, bgHex, area);

    // Text color only where the element holds its own text, at a fraction of
    // area so large empty containers don't dominate the palette.
    const hasOwnText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && (n.textContent || '').trim().length > 0,
    );
    if (hasOwnText) {
      const textHex = rgbToHex(style.color);
      if (textHex) bump(colorWeight, textHex, area * 0.4);
    }
  });

  // Build the palette: most-prominent first, dropping shades that are
  // visually within touching distance of one already chosen.
  const hexToRgb = (hex: string) =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const near = (a: string, b: string) => {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    return Math.abs(A[0] - B[0]) + Math.abs(A[1] - B[1]) + Math.abs(A[2] - B[2]) < 22;
  };
  const rankedColors = Array.from(colorWeight.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
  const colors: string[] = [];
  for (const c of rankedColors) {
    if (colors.some((p) => near(p, c))) continue;
    colors.push(c);
    if (colors.length >= 12) break;
  }

  const fonts = Array.from(fontCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k]) => k);

  return { fonts, colors };
}

// Discover same-domain links
function extractLinks(): string[] {
  const origin = window.location.origin;
  const links = Array.from(document.querySelectorAll('a'))
    .map(a => a.href)
    .filter(href => {
      try {
        const url = new URL(href, window.location.href);
        // Only crawl same domain and http/https links
        return url.origin === origin && (url.protocol === 'http:' || url.protocol === 'https:');
      } catch {
        return false;
      }
    })
    .map(href => {
      const url = new URL(href);
      url.hash = ''; // ignore hashes
      return url.toString();
    });
  
  return Array.from(new Set(links));
}

let hiddenElements: { element: HTMLElement; originalStyle: string }[] = [];

// Prepare the page for screenshot capture (hiding fixed/sticky headers & scrollbars)
function preparePage() {
  hiddenElements = [];

  // Always scroll to absolute top before starting capture so the first strip is the page header
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // Hide scrollbars
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  
  // Find fixed/sticky elements
  const allElements = Array.from(document.querySelectorAll('*')) as HTMLElement[];
  allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' || style.position === 'sticky') {
      hiddenElements.push({
        element: el,
        originalStyle: el.style.visibility
      });
      // We temporarily hide sticky elements during scrolling to avoid repeating them in stitched images
      el.style.visibility = 'hidden';
    }
  });

  // Inject floating warning banner so user does not touch or close the tab
  const overlay = document.createElement('div');
  overlay.id = 'webforge-capture-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #d96b43;
      color: white;
      padding: 12px 24px;
      border-radius: 30px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 99999999;
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
      white-space: nowrap;
    ">
      WebForge is capturing this page. Please DO NOT touch, scroll, or switch tabs!
    </div>
  `;
  document.body.appendChild(overlay);
  
  return {
    totalWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, window.innerWidth),
    totalHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, window.innerHeight),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1
  };
}

// Restore page states
function restorePage() {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  
  hiddenElements.forEach(({ element, originalStyle }) => {
    element.style.visibility = originalStyle;
  });
  hiddenElements = [];

  const overlay = document.getElementById('webforge-capture-overlay');
  if (overlay) overlay.remove();
}

// Main message router
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'PREPARE_CAPTURE') {
    const metrics = preparePage();
    sendResponse(metrics);
  } else if (message.action === 'SCROLL_TO') {
    window.scrollTo(message.x, message.y);
    
    // Wait slightly for lazy loaded content & rendering layout to settle
    setTimeout(() => {
      sendResponse({ status: 'scrolled' });
    }, 250);
    return true; // Keep channel open
  } else if (message.action === 'RESTORE_PAGE') {
    restorePage();
    sendResponse({ status: 'restored' });
  } else if (message.action === 'HIDE_OVERLAY') {
    const overlay = document.getElementById('webforge-capture-overlay');
    if (overlay) overlay.style.display = 'none';
    sendResponse({ status: 'hidden' });
  } else if (message.action === 'SHOW_OVERLAY') {
    const overlay = document.getElementById('webforge-capture-overlay');
    if (overlay) overlay.style.display = 'block';
    sendResponse({ status: 'shown' });
  } else if (message.action === 'EXTRACT_METADATA') {
    const tokens = extractDesignTokens();
    const links = extractLinks();
    
    // Harvest page source markup, styles, scripts, and media assets
    const inlineStyles = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML);
    const externalStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((l: any) => l.href)
      .filter(Boolean);
    const inlineScripts = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.innerHTML);
    const externalScripts = Array.from(document.querySelectorAll('script[src]'))
      .map((s: any) => s.src)
      .filter(Boolean);
      
    const media = Array.from(document.querySelectorAll('img, video, source, svg')).map(el => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'svg') {
        return { type: 'svg', content: el.outerHTML };
      }
      const src = (el as any).src || (el as any).currentSrc || el.getAttribute('src');
      if (!src) return null;
      try {
        const absUrl = new URL(src, window.location.href).toString();
        const type = tag === 'video' || (tag === 'source' && el.parentElement?.tagName.toLowerCase() === 'video') ? 'video' : 'image';
        return { type, url: absUrl };
      } catch {
        return null;
      }
    }).filter(Boolean);

    sendResponse({
      title: document.title,
      url: window.location.href,
      fonts: tokens.fonts,
      colors: tokens.colors,
      links: links,
      assets: {
        html: document.documentElement.outerHTML,
        inlineStyles,
        externalStyles,
        inlineScripts,
        externalScripts,
        media
      }
    });
  }
});
