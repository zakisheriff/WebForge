# WebForge (Node)

**Capture any website's visual blueprint — screenshots + design tokens — for AI coding agents.**

WebForge screenshots a URL across **desktop, tablet, and mobile** viewports, extracts its **design tokens** (an area-weighted colour palette, top fonts, and image assets), optionally **crawls a whole domain**, and packages everything into a clean **ZIP blueprint** that tools like Claude Code, Cursor, or Codex can use to rebuild sites with pixel fidelity.

This is the Node port of the [WebForge Chrome extension](https://github.com/zakisheriff/WebForge)'s capture engine, powered by [Puppeteer](https://pptr.dev/). A [Python package](https://pypi.org/project/webforge-theatom/) with the same API is also available.

---

## Installation

```bash
npm install webforge-theatom
```

Puppeteer downloads a Chromium build on install, so there's usually nothing else to do. If your environment skipped that download, run:

```bash
npx puppeteer browsers install chrome
```

---

## Quick start

```ts
import { capture, crawl } from "webforge-theatom";

// Capture a single page across desktop, tablet and mobile.
const result = await capture("anthropic.com");   // scheme optional; http fallback built in

console.log(result.title);    // "Home \ Anthropic"
console.log(result.colors);   // ['#f0eee6', '#141413', ...] prominence-ordered
console.log(result.fonts);    // ['Anthropic Sans', ...]
console.log(result.images);   // image URLs + inline data-URIs

await result.toZip("anthropic.zip");   // ZIP blueprint (screenshots + metadata.json)
result.save("anthropic_out/");         // ...or raw files into a folder

// Whole domain
const site = await crawl("example.com", { maxPages: 10 });
console.log(site.pages.length, "pages");
await site.toZip("example-site.zip");
```

CommonJS works too:

```js
const { capture } = require("webforge-theatom");
```

---

## Command line

```bash
webforge anthropic.com                  # → WebForge_anthropic.com.zip
webforge example.com -o out.zip         # choose the output path
webforge example.com --desktop          # desktop viewport only
webforge example.com --png              # PNG instead of JPEG
webforge example.com --crawl --max 10   # crawl up to 10 pages
webforge --version
```

---

## API

### `capture(url, options?) => Promise<CaptureResult>`

| Option | Default | Description |
| --- | --- | --- |
| `mode` | `"all"` | `"all"` = desktop + tablet + mobile; `"desktop"` = 1440 only. |
| `viewports` | — | Explicit `Viewport[]` (overrides `mode`). |
| `extractHover` | `true` | Prime hover to surface sprite/hover-only artwork. |
| `imageFormat` | `"jpeg"` | `"jpeg"` (smaller) or `"png"`. |
| `quality` | `62` | JPEG quality 0–100 (ignored for PNG). |
| `timeout` | `15` | Navigation timeout in **seconds**. |
| `headless` | `true` | Run the browser headless. Set `false` for stubborn sites. |
| `executablePath` | — | Custom Chrome/Chromium binary. |

### `crawl(url, options?) => Promise<CrawlResult>`

Same options as `capture`, plus `maxPages` (default 5) and `customUrls` (seed the queue first). Breadth-first over same-origin links.

### Result objects

- **`CaptureResult`** — `url`, `title`, `capturedAt`, `screenshots` (`Record<viewport, Buffer>`), `colors`, `fonts`, `images`. Methods: `toZip(path)`, `save(dir)`, `metadata()`.
- **`CrawlResult`** — `domain`, `pages` (`CapturedPage[]`), `sitemap`. Methods: `toZip(path)`, `metadata()`.

### Errors

All extend `WebForgeError`: `InvalidURLError`, `BrowserNotInstalledError`, `CaptureError`.

---

## Notes on tricky sites

- **http-only redirect hosts** (e.g. `anthropic.ai`, whose HTTPS port is dead and which 301s over HTTP) are handled automatically — WebForge retries over http and follows the redirect.
- **Bot-protected sites** (aggressive Cloudflare challenges) may return a blank/challenge page in headless mode — try `{ headless: false }`, or use the browser extension, which runs in your real browser.
- If a host is genuinely unreachable, `capture()` throws a `CaptureError` explaining why instead of returning a blank image.

---

## License

MIT © Zaki Sheriff
