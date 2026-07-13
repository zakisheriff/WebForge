import { InvalidURLError } from "./errors";
import { Session, normalizeUrl } from "./engine";
import {
  CaptureResult,
  CapturedPage,
  CrawlResult,
  DEFAULT_VIEWPORTS,
  Viewport,
} from "./models";

export interface CaptureOptions {
  /** "all" = desktop + tablet + mobile; "desktop" = 1440 only. */
  mode?: "all" | "desktop";
  /** Explicit viewports (overrides `mode`). */
  viewports?: Viewport[];
  /** Prime hover to surface sprite/hover-only artwork (default true). */
  extractHover?: boolean;
  imageFormat?: "jpeg" | "png";
  /** JPEG quality 0–100 (ignored for PNG). Default 62. */
  quality?: number;
  /** Navigation timeout in seconds. Default 15. */
  timeout?: number;
  /** Custom Chromium/Chrome binary; defaults to Puppeteer's bundled browser. */
  executablePath?: string;
  /** Run headless (default true). */
  headless?: boolean;
}

export interface CrawlOptions extends CaptureOptions {
  /** Maximum number of pages to capture. Default 5. */
  maxPages?: number;
  /** URLs to seed the queue with first. */
  customUrls?: string[];
}

function resolveViewports(mode: string, viewports?: Viewport[]): Viewport[] {
  if (viewports && viewports.length) return viewports;
  if (mode === "desktop") return DEFAULT_VIEWPORTS.filter((v) => v.key === "desktop");
  return DEFAULT_VIEWPORTS;
}

function slugForPage(url: string, index: number): string {
  try {
    const p = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
    const s = p.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    return s || (index === 0 ? "home" : `page-${index}`);
  } catch {
    return index === 0 ? "home" : `page-${index}`;
  }
}

/** Capture a single page's visual blueprint. */
export async function capture(
  url: string,
  options: CaptureOptions = {},
): Promise<CaptureResult> {
  const target = normalizeUrl(url);
  if (!target) throw new InvalidURLError(`Not a valid website URL: ${url}`);

  const {
    mode = "all",
    viewports,
    extractHover = true,
    imageFormat = "jpeg",
    quality = 62,
    timeout = 15,
    executablePath,
    headless = true,
  } = options;

  const picked = resolveViewports(mode, viewports);
  const session = new Session({ headless, executablePath });
  await session.start();
  try {
    await session.goto(target, timeout * 1000);

    const result = new CaptureResult({
      url: target,
      title: await session.title(target),
      capturedAt: new Date().toISOString(),
      imageFormat,
    });

    await session.autoScroll();

    const rest = await session.extract();
    result.colors = rest.colors;
    result.fonts = rest.fonts;

    const images = [...rest.images];
    if (extractHover) {
      await session.primeHover();
      const hovered = await session.extract();
      await session.resetHover();
      for (const img of hovered.images) {
        if (!images.includes(img)) images.push(img);
      }
    }
    images.sort(
      (a, b) => (a.startsWith("data:") ? 0 : 1) - (b.startsWith("data:") ? 0 : 1),
    );
    result.images = images.slice(0, 40);

    for (const vp of picked) {
      result.screenshots[vp.key] = await session.screenshot(vp, imageFormat, quality);
    }
    return result;
  } finally {
    await session.close();
  }
}

/** Crawl a domain (breadth-first, same-origin), capturing each page. */
export async function crawl(
  url: string,
  options: CrawlOptions = {},
): Promise<CrawlResult> {
  const start = normalizeUrl(url);
  if (!start) throw new InvalidURLError(`Not a valid website URL: ${url}`);

  const {
    maxPages = 5,
    customUrls = [],
    mode = "desktop",
    viewports,
    imageFormat = "jpeg",
    quality = 62,
    timeout = 15,
    executablePath,
    headless = true,
  } = options;

  const origin = new URL(start).origin;
  const picked = resolveViewports(mode, viewports);
  const session = new Session({ headless, executablePath });
  await session.start();

  const crawlRes = new CrawlResult({ domain: new URL(start).hostname });
  const seeds = customUrls
    .map((u) => normalizeUrl(u))
    .filter((u): u is string => Boolean(u));
  const queue: string[] = [...seeds, start];
  const seen = new Set<string>();

  try {
    while (queue.length && crawlRes.pages.length < maxPages) {
      const nextRaw = queue.shift()!;
      const next = nextRaw.split("#")[0];
      if (seen.has(next)) continue;
      seen.add(next);

      try {
        await session.goto(next, timeout * 1000);
      } catch {
        continue; // skip pages that don't load
      }

      await session.autoScroll();
      const rest = await session.extract();
      const page = new CapturedPage({
        url: next,
        slug: slugForPage(next, crawlRes.pages.length),
        title: await session.title(next),
        colors: rest.colors,
        fonts: rest.fonts,
        imageFormat,
      });
      for (const vp of picked) {
        page.screenshots[vp.key] = await session.screenshot(vp, imageFormat, quality);
      }
      crawlRes.pages.push(page);
      crawlRes.sitemap.push(next);

      const links: string[] = await session.page.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]")).map(
          (a) => (a as HTMLAnchorElement).href,
        ),
      );
      for (const l of links) {
        try {
          const lu = new URL(l);
          if (lu.origin !== origin) continue;
          const clean = lu.origin + lu.pathname;
          if (!seen.has(clean)) queue.push(clean);
        } catch {
          /* ignore bad hrefs */
        }
      }
    }
    return crawlRes;
  } finally {
    await session.close();
  }
}
