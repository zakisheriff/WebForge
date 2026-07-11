// WebForge Content Script

// Helper: Convert RGB/RGBA to Hex
function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!match) return rgb;
  const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
  const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
  const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

// Extract design tokens (fonts & colors)
function extractDesignTokens() {
  const fonts = new Set<string>();
  const colors = new Set<string>();
  
  // Look at unique elements to collect styles
  const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, p, span, button, a, div, section'));
  
  // Limit parsing to 300 elements for performance
  const subset = elements.slice(0, 300);
  
  subset.forEach((el) => {
    const style = window.getComputedStyle(el);
    
    // Extract fonts
    const fontFamily = style.fontFamily;
    if (fontFamily) {
      fontFamily.split(',').forEach(font => {
        const clean = font.replace(/['"]/g, '').trim();
        if (clean && !['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'inherit'].includes(clean)) {
          fonts.add(clean);
        }
      });
    }
    
    // Extract text color
    const color = style.color;
    if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
      colors.add(rgbToHex(color));
    }
    
    // Extract background color
    const bgColor = style.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      colors.add(rgbToHex(bgColor));
    }
  });
  
  return {
    fonts: Array.from(fonts).slice(0, 8),
    colors: Array.from(colors).slice(0, 12)
  };
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
