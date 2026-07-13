/**
 * WebForge — capture a website's visual blueprint for AI coding agents.
 *
 * Screenshots any URL across desktop, tablet and mobile viewports, extracts its
 * design tokens (area-weighted colour palette, top fonts, image assets),
 * optionally crawls a whole domain, and packages everything into a clean ZIP
 * blueprint that tools like Claude Code, Cursor or Codex can use to rebuild
 * sites with pixel fidelity. Powered by Puppeteer.
 *
 * @example
 * ```ts
 * import { capture } from "webforge-theatom";
 * const result = await capture("anthropic.com");
 * console.log(result.colors, result.fonts);
 * await result.toZip("anthropic.zip");
 * ```
 */
export { capture, crawl } from "./capture";
export type { CaptureOptions, CrawlOptions } from "./capture";
export {
  CaptureResult,
  CapturedPage,
  CrawlResult,
  DEFAULT_VIEWPORTS,
} from "./models";
export type { Viewport, Tokens } from "./models";
export {
  WebForgeError,
  InvalidURLError,
  BrowserNotInstalledError,
  CaptureError,
} from "./errors";
