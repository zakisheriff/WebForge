// WebForge design-token extractor.
//
// This is a faithful port of `extractTokens` from the WebForge website's
// serverless capture route (website/src/app/api/capture/route.ts). It runs
// inside the target page via Playwright's page.evaluate() and returns a
// prominence-ordered colour palette, the top fonts, and a de-duplicated image
// list. Colours are weighted by the on-screen AREA they cover so a page's true
// background + primary text surface first, rather than whatever tag repeats
// most often. Near-identical shades are merged.
//
// Keep this behaviourally in sync with the extension/website so all three
// WebForge surfaces extract tokens the same way.
() => {
  const colorWeight = new Map();
  const fontCount = new Map();
  const imageSet = new Set();

  const toHex = (c) => {
    if (!c) return null;
    const m = c.match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    const [r, g, b, a = 1] = parts;
    if (!Number.isFinite(r) || a === 0) return null;
    const h = (n) =>
      Math.max(0, Math.min(255, Math.round(n)))
        .toString(16)
        .padStart(2, "0");
    return `#${h(r)}${h(g)}${h(b)}`;
  };

  const bumpWeight = (map, key, w) => {
    if (!key || w <= 0) return;
    map.set(key, (map.get(key) || 0) + w);
  };
  const bump = (map, key) => {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  };

  // Accept normal image URLs and inline data-image URLs (pixel-art sprites,
  // etc.). Raster data-images must clear a size floor so tiny spinners,
  // blur-up placeholders and 1x1 pixels don't count as real artwork; small
  // inline SVGs (often logos) are kept.
  const MAX_DATA_URL = 1_500_000;
  const MIN_RASTER_DATA_URL = 2500;
  const acceptSrc = (s) => {
    if (!s) return false;
    if (s.startsWith("data:")) {
      if (!s.startsWith("data:image/")) return false;
      if (s.length >= MAX_DATA_URL) return false;
      const isSvg = s.startsWith("data:image/svg");
      return s.length > (isSvg ? 120 : MIN_RASTER_DATA_URL);
    }
    return true;
  };

  const addImg = (raw) => {
    if (!raw || !acceptSrc(raw)) return;
    if (raw.startsWith("data:")) {
      imageSet.add(raw);
    } else {
      try {
        imageSet.add(new URL(raw, location.href).href);
      } catch {}
    }
  };

  const looksLikeImage = (u) =>
    /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)(\?|#|$)/i.test(u);

  const addUrlsFrom = (cssText, strict = false) => {
    if (!cssText || !cssText.includes("url(")) return;
    const re = /url\(\s*["']?([^"')]+)["']?\s*\)/g;
    let mm;
    while ((mm = re.exec(cssText))) {
      const u = mm[1];
      if (strict && !u.startsWith("data:") && !looksLikeImage(u)) continue;
      addImg(u);
    }
  };

  const nodes = Array.from(document.querySelectorAll("*")).slice(0, 6000);
  for (const el of nodes) {
    const cs = getComputedStyle(el);

    // Background images: collect even from zero-area / hidden elements,
    // since animation sprites are often parked on off-screen nodes.
    if (cs.backgroundImage && cs.backgroundImage !== "none") {
      addUrlsFrom(cs.backgroundImage);
    }

    const rect = el.getBoundingClientRect();
    const area = Math.max(0, rect.width) * Math.max(0, rect.height);
    if (area <= 0) continue;

    bumpWeight(colorWeight, toHex(cs.backgroundColor), area);

    const hasOwnText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && (n.textContent || "").trim().length > 0,
    );
    if (hasOwnText) bumpWeight(colorWeight, toHex(cs.color), area * 0.4);

    const family = cs.fontFamily?.split(",")[0]?.replace(/["']/g, "").trim();
    if (family) bump(fontCount, family);
  }

  for (const img of Array.from(document.images)) {
    if (acceptSrc(img.src)) imageSet.add(img.src);
  }

  // Scan stylesheet rules -- catches sprites referenced only in CSS.
  for (const sheet of Array.from(document.styleSheets)) {
    let rules = null;
    try {
      rules = sheet.cssRules; // throws for cross-origin sheets
    } catch {
      continue;
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      addUrlsFrom(rule.cssText || "", true);
    }
  }

  const hexToRgb = (hex) =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const near = (a, b) => {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    return (
      Math.abs(A[0] - B[0]) + Math.abs(A[1] - B[1]) + Math.abs(A[2] - B[2]) < 22
    );
  };
  const ranked = Array.from(colorWeight.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
  const palette = [];
  for (const c of ranked) {
    if (palette.some((p) => near(p, c))) continue;
    palette.push(c);
    if (palette.length >= 10) break;
  }

  const topN = (map, n) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k);

  return {
    colors: palette,
    fonts: topN(fontCount, 8),
    images: Array.from(imageSet)
      .sort(
        (a, b) => (b.startsWith("data:") ? 1 : 0) - (a.startsWith("data:") ? 1 : 0),
      )
      .slice(0, 40),
  };
}
