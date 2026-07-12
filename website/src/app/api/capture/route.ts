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
  let body: { url?: string };
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

    // Extract design tokens + images from the rendered DOM.
    const extracted = await page.evaluate(() => {
      const colorCount = new Map<string, number>();
      const fontCount = new Map<string, number>();
      const imageSet = new Set<string>();

      const bump = (map: Map<string, number>, key: string) => {
        if (!key) return;
        map.set(key, (map.get(key) || 0) + 1);
      };

      const isVisibleColor = (c: string) =>
        c &&
        c !== "rgba(0, 0, 0, 0)" &&
        c !== "transparent" &&
        !c.startsWith("rgba(0, 0, 0, 0)");

      const nodes = Array.from(document.querySelectorAll("*")).slice(0, 4000);
      for (const el of nodes) {
        const cs = getComputedStyle(el as Element);
        if (isVisibleColor(cs.color)) bump(colorCount, cs.color);
        if (isVisibleColor(cs.backgroundColor)) bump(colorCount, cs.backgroundColor);
        const family = cs.fontFamily?.split(",")[0]?.replace(/["']/g, "").trim();
        if (family) bump(fontCount, family);

        const bg = cs.backgroundImage;
        if (bg && bg !== "none") {
          const m = bg.match(/url\(["']?(.*?)["']?\)/);
          if (m && m[1] && !m[1].startsWith("data:")) {
            try {
              imageSet.add(new URL(m[1], location.href).href);
            } catch {}
          }
        }
      }

      for (const img of Array.from(document.images)) {
        if (img.src && !img.src.startsWith("data:")) imageSet.add(img.src);
      }

      const topN = (map: Map<string, number>, n: number) =>
        Array.from(map.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, n)
          .map(([k]) => k);

      return {
        colors: topN(colorCount, 12),
        fonts: topN(fontCount, 8),
        images: Array.from(imageSet).slice(0, 40),
      };
    });

    result.colors = extracted.colors;
    result.fonts = extracted.fonts;
    result.images = extracted.images;

    // Full-page screenshot per viewport.
    for (const vp of VIEWPORTS) {
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
