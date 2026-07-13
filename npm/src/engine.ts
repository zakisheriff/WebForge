import puppeteer, { Browser, Page } from "puppeteer";
import { BrowserNotInstalledError, CaptureError } from "./errors";
import { extractTokens } from "./tokens";
import type { Tokens, Viewport } from "./models";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const EXTRA_HEADERS: Record<string, string> = {
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9," +
    "image/avif,image/webp,image/apng,*/*;q=0.8",
};

const HOVER_SELECTOR =
  "a, button, img, svg, canvas, [role='button'], [class*='sprite'], " +
  "[class*='char'], [class*='avatar'], [class*='hover'], [class*='pixel']";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface SessionOptions {
  headless?: boolean;
  executablePath?: string;
}

/** Puppeteer browser lifecycle + in-page capture routines. */
export class Session {
  private browser: Browser | null = null;
  page!: Page;

  constructor(private opts: SessionOptions = {}) {}

  async start(): Promise<void> {
    const headless = this.opts.headless ?? true;
    const args = [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ];

    // First choice: the user's binary, else Puppeteer's bundled browser. If that
    // fails (bundled browser missing or broken), fall back to a system Chrome.
    const candidates: (string | undefined)[] = [this.opts.executablePath || undefined];
    if (!this.opts.executablePath) {
      for (const p of [
        process.env.CHROME_PATH,
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
      ]) {
        if (p) candidates.push(p);
      }
    }

    let lastErr: unknown;
    for (const executablePath of candidates) {
      try {
        this.browser = await puppeteer.launch({ headless, executablePath, args });
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!this.browser) {
      throw new BrowserNotInstalledError(
        "Could not launch Chromium. Install Puppeteer's browser with:\n" +
          "    npx puppeteer browsers install chrome\n" +
          "or pass executablePath pointing to a Chrome/Chromium binary.\n" +
          `(original error: ${(lastErr as Error)?.message ?? String(lastErr)})`,
      );
    }
    this.page = await this.browser.newPage();
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
    await this.page.setUserAgent(USER_AGENT);
    await this.page.setExtraHTTPHeaders(EXTRA_HEADERS);
    await this.page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch {
        /* ignore */
      }
      this.browser = null;
    }
  }

  /** Navigate + settle redirects; true if a real page loaded. */
  private async tryNavigate(url: string, timeoutMs: number): Promise<boolean> {
    try {
      await this.page.goto(url, { waitUntil: "load", timeout: timeoutMs });
    } catch {
      await sleep(1500);
    }
    // Follow client-side redirects ("Loading…" stubs, apex→www) and let JS
    // pages paint: wait for the network to settle, re-check if the URL bounced.
    for (let i = 0; i < 3; i++) {
      const prev = this.page.url();
      try {
        await this.page.waitForNetworkIdle({ idleTime: 600, timeout: 8000 });
      } catch {
        /* ignore */
      }
      await sleep(600);
      if (this.page.url() === prev) break;
    }
    const final = this.page.url() || "";
    return !(
      final.startsWith("chrome-error") ||
      final === "about:blank" ||
      final === ""
    );
  }

  /**
   * Navigate, with an automatic http fallback: some hosts answer only on port
   * 80 and 301 to their real https site (e.g. anthropic.ai →
   * https://www.anthropic.com), so if https never loads we retry over http.
   */
  async goto(url: string, timeoutMs: number): Promise<void> {
    if (await this.tryNavigate(url, timeoutMs)) return;
    if (url.toLowerCase().startsWith("https://")) {
      const httpUrl = "http://" + url.slice("https://".length);
      if (await this.tryNavigate(httpUrl, timeoutMs)) return;
    }
    throw new CaptureError(
      `Couldn't reach ${url} — the page never loaded. Common causes:\n` +
        "  • The host is down or unreachable from your network " +
        "(a plain request times out too, so it isn't a WebForge issue).\n" +
        "  • The URL is a redirect alias that doesn't respond — try the " +
        "site's primary domain instead (e.g. 'anthropic.com', not " +
        "'anthropic.ai').\n" +
        "  • The site refuses automated connections — try headless: false, " +
        "or the WebForge browser extension (it runs in your real browser).",
    );
  }

  async title(fallback: string): Promise<string> {
    try {
      return (await this.page.title()) || fallback;
    } catch {
      return fallback;
    }
  }

  async autoScroll(): Promise<void> {
    try {
      await this.page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let total = 0;
          const step = 600;
          const maxScroll = 12000;
          const timer = setInterval(() => {
            window.scrollBy(0, step);
            total += step;
            const bodyHeight = document.body ? document.body.scrollHeight : 0;
            if (total >= bodyHeight || total >= maxScroll) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 120);
        });
      });
    } catch {
      /* best-effort */
    }
    await sleep(300);
  }

  async extract(): Promise<Tokens> {
    try {
      return await this.page.evaluate(extractTokens);
    } catch {
      return { colors: [], fonts: [], images: [] };
    }
  }

  private async dispatchHover(types: string[]): Promise<void> {
    try {
      await this.page.evaluate(
        (selector, events) => {
          const els = Array.from(document.querySelectorAll(selector)).slice(0, 400);
          for (const el of els) {
            for (const t of events) {
              try {
                el.dispatchEvent(
                  new MouseEvent(t, { bubbles: true, cancelable: true }),
                );
              } catch {
                /* ignore */
              }
            }
          }
        },
        HOVER_SELECTOR,
        types,
      );
    } catch {
      /* best-effort */
    }
  }

  async primeHover(): Promise<void> {
    await this.dispatchHover(["pointerover", "mouseover", "pointerenter", "mouseenter"]);
    await sleep(500);
  }

  async resetHover(): Promise<void> {
    await this.dispatchHover(["pointerout", "mouseout", "pointerleave", "mouseleave"]);
    await sleep(200);
  }

  async screenshot(vp: Viewport, imageFormat: string, quality: number): Promise<Buffer> {
    await this.page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
    });
    await sleep(450);
    const fmt = imageFormat.toLowerCase() === "png" ? "png" : "jpeg";
    const shot = await this.page.screenshot(
      fmt === "jpeg"
        ? { fullPage: true, type: "jpeg", quality }
        : { fullPage: true, type: "png" },
    );
    return Buffer.from(shot as Uint8Array);
  }
}

export function normalizeUrl(raw: string): string | null {
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withProtocol);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
