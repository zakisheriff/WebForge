import type { NextRequest } from "next/server";
import type { Browser } from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Viewports mirror the WebForge extension's capture matrix.
const VIEWPORTS = [
  { key: "desktop", width: 1440, height: 900 },
  { key: "tablet", width: 768, height: 1024 },
  { key: "mobile", width: 390, height: 844 },
] as const;

type ViewportKey = (typeof VIEWPORTS)[number]["key"];

interface CaptureResult {
  url: string;
  title: string;
  capturedAt: string;
  screenshots: Partial<Record<ViewportKey, string>>; // base64 jpeg data URLs
  colors: string[];
  fonts: string[];
  images: string[];
}

// Launch Chromium: bundled Linux binary on Vercel, local Chrome in dev.
async function launchBrowser(): Promise<Browser> {
  const isServerless = Boolean(process.env.VERCEL);
  const puppeteer = await import("puppeteer-core");

  if (isServerless) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: null,
      executablePath: await chromium.executablePath(),
      headless: true,
    }) as unknown as Promise<Browser>;
  }

  // Local development: use an installed Chrome/Chromium.
  const localCandidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter(Boolean) as string[];

  return puppeteer.launch({
    executablePath: localCandidates[0],
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  }) as unknown as Promise<Browser>;
}

function normalizeUrl(raw: string): string | null {
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withProtocol);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: { url?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const targetUrl = normalizeUrl((body.url || "").trim());
  if (!targetUrl) {
    return Response.json(
      { error: "Please enter a valid website URL." },
      { status: 400 },
    );
  }

  // "desktop" → just the 1440 shot; "all" → desktop, tablet & mobile.
  // Design tokens (colors, fonts, images) are extracted either way.
  const mode = body.mode === "desktop" ? "desktop" : "all";
  const viewports =
    mode === "desktop"
      ? VIEWPORTS.filter((v) => v.key === "desktop")
      : VIEWPORTS;

  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    );

    const result: CaptureResult = {
      url: targetUrl,
      title: targetUrl,
      capturedAt: new Date().toISOString(),
      screenshots: {},
      colors: [],
      fonts: [],
      images: [],
    };

    // Prime the page at desktop width, then reuse it for each viewport.
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(targetUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    result.title = (await page.title()) || targetUrl;

    // Nudge lazy-loaded content into view before capturing.
    await autoScroll(page);

    // Extract tokens from the page at rest — this captures the default artwork
    // (e.g. a character's standing pose), colours and fonts.
    const rest = await page.evaluate(extractTokens);

    // Some artwork only appears once you hover it — a run cycle, an alt frame.
    // Hovering swaps those in (and can replace the resting art), so we prime
    // hover, extract again purely for the extra images, then reset the page so
    // the screenshots still show it at rest. Colours/fonts stay from `rest`.
    await primeHover(page);
    const hovered = await page.evaluate(extractTokens);
    await resetHover(page);

    result.colors = rest.colors;
    result.fonts = rest.fonts;
    // Union of both states keeps the default art AND the hover frames, with
    // inline data-image sprites surfaced first.
    result.images = Array.from(new Set([...rest.images, ...hovered.images]))
      .sort(
        (a, b) =>
          (b.startsWith("data:") ? 1 : 0) - (a.startsWith("data:") ? 1 : 0),
      )
      .slice(0, 40);

    // Full-page screenshot per selected viewport.
    for (const vp of viewports) {
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
      });
      // Let responsive layout settle.
      await new Promise((r) => setTimeout(r, 450));
      const shot = await page.screenshot({
        fullPage: true,
        type: "jpeg",
        quality: 62,
      });
      // puppeteer returns a Uint8Array; wrap in Buffer for real base64.
      const base64 = Buffer.from(shot).toString("base64");
      result.screenshots[vp.key] = `data:image/jpeg;base64,${base64}`;
    }

    await browser.close();
    browser = null;

    return Response.json(result);
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    const message =
      err instanceof Error ? err.message : "Capture failed unexpectedly.";
    return Response.json(
      {
        error:
          "Couldn't capture that page. Some sites block automated visits — " +
          "the WebForge extension runs in your own browser and handles those. " +
          `(${message})`,
      },
      { status: 502 },
    );
  }
}

// Scroll to the bottom in steps to trigger lazy-loaded assets, capped for time.
async function autoScroll(page: import("puppeteer-core").Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let total = 0;
      const step = 600;
      const maxScroll = 12000; // hard cap so we never stall on huge pages
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (
          total >= document.body.scrollHeight ||
          total >= maxScroll
        ) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 120);
    });
  });
  await new Promise((r) => setTimeout(r, 300));
}

// Candidate selector for elements that tend to swap in artwork on hover.
const HOVER_SELECTOR =
  "a, button, img, svg, canvas, [role='button'], [class*='sprite'], " +
  "[class*='char'], [class*='avatar'], [class*='hover'], [class*='pixel']";

// Fire synthetic hover events across likely-interactive elements so any
// JS-driven sprite swaps load their assets into the DOM.
async function primeHover(page: import("puppeteer-core").Page): Promise<void> {
  await page.evaluate((selector) => {
    const els = Array.from(document.querySelectorAll(selector)).slice(0, 400);
    const types = ["pointerover", "mouseover", "pointerenter", "mouseenter"];
    for (const el of els) {
      for (const t of types) {
        try {
          el.dispatchEvent(
            new MouseEvent(t, { bubbles: true, cancelable: true }),
          );
        } catch {}
      }
    }
  }, HOVER_SELECTOR);
  await new Promise((r) => setTimeout(r, 500));
}

// Undo the hover priming so the screenshots reflect the page at rest.
async function resetHover(page: import("puppeteer-core").Page): Promise<void> {
  await page.evaluate((selector) => {
    const els = Array.from(document.querySelectorAll(selector)).slice(0, 400);
    const types = ["pointerout", "mouseout", "pointerleave", "mouseleave"];
    for (const el of els) {
      for (const t of types) {
        try {
          el.dispatchEvent(
            new MouseEvent(t, { bubbles: true, cancelable: true }),
          );
        } catch {}
      }
    }
  }, HOVER_SELECTOR);
  await new Promise((r) => setTimeout(r, 200));
}

// Runs in the page: weights colours by rendered area, ranks fonts, and
// harvests images from <img>, backgrounds and stylesheet rules. Returns a
// prominence-ordered palette, top fonts, and a de-duplicated image list.
function extractTokens() {
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

  const bumpWeight = (
    map: Map<string, number>,
    key: string | null,
    w: number,
  ) => {
    if (!key || w <= 0) return;
    map.set(key, (map.get(key) || 0) + w);
  };
  const bump = (map: Map<string, number>, key: string) => {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  };

  // Accept normal image URLs and inline data-image URLs (pixel-art sprites,
  // etc.). Raster data-images must clear a size floor so tiny spinners,
  // blur-up placeholders and 1×1 pixels don't count as real artwork; small
  // inline SVGs (often logos) are kept.
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
      } catch {}
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

    // Background images: collect even from zero-area / hidden elements,
    // since animation sprites are often parked on off-screen nodes.
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

  // Scan stylesheet rules — catches sprites referenced only in CSS.
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
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
        (a, b) =>
          (b.startsWith("data:") ? 1 : 0) - (a.startsWith("data:") ? 1 : 0),
      )
      .slice(0, 40),
  };
}

