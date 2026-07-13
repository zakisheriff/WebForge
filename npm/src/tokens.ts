import type { Tokens } from "./models";

/**
 * Runs inside the page: weights colours by rendered area, ranks fonts, and
 * harvests images from <img>, backgrounds and stylesheet rules. Returns a
 * prominence-ordered palette, top fonts, and a de-duplicated image list.
 *
 * Ported verbatim from the WebForge website capture route so the Node, Python
 * and extension engines all extract identical tokens.
 */
export function extractTokens(): Tokens {
  const colorWeight = new Map<string, number>();
  const fontCount = new Map<string, number>();
  const imageSet = new Set<string>();

  const toHex = (c: string): string | null => {
    if (!c) return null;
    const m = c.match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    const [r, g, b, a = 1] = parts;
    if (!Number.isFinite(r) || a === 0) return null;
    const h = (n: number) =>
      Math.max(0, Math.min(255, Math.round(n)))
        .toString(16)
        .padStart(2, "0");
    return `#${h(r)}${h(g)}${h(b)}`;
  };

  const bumpWeight = (map: Map<string, number>, key: string | null, w: number) => {
    if (!key || w <= 0) return;
    map.set(key, (map.get(key) || 0) + w);
  };
  const bump = (map: Map<string, number>, key: string) => {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  };

  const MAX_DATA_URL = 1_500_000;
  const MIN_RASTER_DATA_URL = 2500;
  const acceptSrc = (s: string): boolean => {
    if (!s) return false;
    if (s.startsWith("data:")) {
      if (!s.startsWith("data:image/")) return false;
      if (s.length >= MAX_DATA_URL) return false;
      const isSvg = s.startsWith("data:image/svg");
      return s.length > (isSvg ? 120 : MIN_RASTER_DATA_URL);
    }
    return true;
  };

  const addImg = (raw: string) => {
    if (!raw || !acceptSrc(raw)) return;
    if (raw.startsWith("data:")) {
      imageSet.add(raw);
    } else {
      try {
        imageSet.add(new URL(raw, location.href).href);
      } catch {
        /* ignore */
      }
    }
  };

  const looksLikeImage = (u: string) =>
    /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)(\?|#|$)/i.test(u);

  const addUrlsFrom = (cssText: string, strict = false) => {
    if (!cssText || !cssText.includes("url(")) return;
    const re = /url\(\s*["']?([^"')]+)["']?\s*\)/g;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(cssText))) {
      const u = mm[1];
      if (strict && !u.startsWith("data:") && !looksLikeImage(u)) continue;
      addImg(u);
    }
  };

  const nodes = Array.from(document.querySelectorAll("*")).slice(0, 6000);
  for (const el of nodes) {
    const cs = getComputedStyle(el as Element);
    if (cs.backgroundImage && cs.backgroundImage !== "none") {
      addUrlsFrom(cs.backgroundImage);
    }
    const rect = (el as Element).getBoundingClientRect();
    const area = Math.max(0, rect.width) * Math.max(0, rect.height);
    if (area <= 0) continue;
    bumpWeight(colorWeight, toHex(cs.backgroundColor), area);
    const hasOwnText = Array.from((el as Element).childNodes).some(
      (n) => n.nodeType === 3 && (n.textContent || "").trim().length > 0,
    );
    if (hasOwnText) bumpWeight(colorWeight, toHex(cs.color), area * 0.4);
    const family = cs.fontFamily?.split(",")[0]?.replace(/["']/g, "").trim();
    if (family) bump(fontCount, family);
  }

  for (const img of Array.from(document.images)) {
    if (acceptSrc(img.src)) imageSet.add(img.src);
  }

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      addUrlsFrom(rule.cssText || "", true);
    }
  }

  const hexToRgb = (hex: string) =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const near = (a: string, b: string) => {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    return (
      Math.abs(A[0] - B[0]) + Math.abs(A[1] - B[1]) + Math.abs(A[2] - B[2]) < 22
    );
  };
  const ranked = Array.from(colorWeight.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
  const palette: string[] = [];
  for (const c of ranked) {
    if (palette.some((p) => near(p, c))) continue;
    palette.push(c);
    if (palette.length >= 10) break;
  }

  const topN = (map: Map<string, number>, n: number) =>
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
