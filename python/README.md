# WebForge (Python)

**Capture any website's visual blueprint — screenshots + design tokens — for AI coding agents.**

WebForge screenshots a URL across **desktop, tablet, and mobile** viewports, extracts its **design tokens** (an area-weighted colour palette, top fonts, and image assets), optionally **crawls a whole domain**, and packages everything into a clean **ZIP blueprint** that tools like Claude Code, Cursor, or Codex can use to rebuild sites with pixel fidelity.

This is the Python port of the [WebForge Chrome extension](https://github.com/zakisheriff/WebForge)'s capture engine, powered by [Playwright](https://playwright.dev/python/).

---

## Installation

```bash
pip install webforge
```

WebForge drives a real Chromium browser, so after installing the package you need Playwright's browser binary **once**:

```bash
playwright install chromium
```

> Installing from a local checkout during development:
> ```bash
> cd python
> pip install -e .
> playwright install chromium
> ```

---

## Quick start

```python
import webforge

# Capture a single page across desktop, tablet and mobile.
result = webforge.capture("example.com")

print(result.title)     # "Example Domain"
print(result.colors)    # ['#ffffff', '#000000', ...]  (prominence-ordered)
print(result.fonts)     # ['Inter', 'Outfit', ...]
print(result.images)    # image URLs + inline data-URIs

# Save a ZIP blueprint (screenshots + metadata.json).
result.to_zip("example.zip")

# ...or write the raw files to a folder.
result.save("example/")
```

Crawl a whole domain:

```python
site = webforge.crawl("example.com", max_pages=10)
print(len(site.pages), "pages captured")
site.to_zip("example-site.zip")
```

---

## Command line

```bash
webforge example.com                    # capture -> WebForge_example.com.zip
webforge example.com -o out.zip         # choose the output path
webforge example.com --desktop          # desktop viewport only
webforge example.com --png              # PNG instead of JPEG
webforge example.com --crawl --max 10   # crawl up to 10 pages
webforge --version
```

---

## API reference

### `webforge.capture(url, *, mode="all", viewports=None, extract_hover=True, image_format="jpeg", quality=62, timeout=15.0, executable_path=None, headless=True) -> CaptureResult`

Capture a single page.

| Argument | Default | Description |
| --- | --- | --- |
| `url` | — | Target URL; a missing scheme becomes `https://`. |
| `mode` | `"all"` | `"all"` = desktop + tablet + mobile; `"desktop"` = 1440 only. |
| `viewports` | `None` | Explicit iterable of `Viewport` (overrides `mode`). |
| `extract_hover` | `True` | Prime hover to surface sprite/hover-only artwork. |
| `image_format` | `"jpeg"` | `"jpeg"` (smaller) or `"png"`. |
| `quality` | `62` | JPEG quality 0–100 (ignored for PNG). |
| `timeout` | `15.0` | Navigation timeout (seconds); on timeout it captures current state. |
| `executable_path` | `None` | Custom Chromium binary; defaults to Playwright's. |
| `headless` | `True` | Run the browser headless. |

### `webforge.crawl(url, *, max_pages=5, custom_urls=None, mode="desktop", ...) -> CrawlResult`

Breadth-first crawl of same-origin links, capturing each page (up to `max_pages`). Accepts the same capture options.

### Result objects

- **`CaptureResult`** — `url`, `title`, `captured_at`, `screenshots` (`{viewport: bytes}`), `colors`, `fonts`, `images`. Methods: `.to_zip(path)`, `.save(dir)`, `.metadata()`.
- **`CrawlResult`** — `domain`, `pages` (`list[CapturedPage]`), `sitemap`. Methods: `.to_zip(path)`, `.design_tokens()`, `.metadata()`.
- **`Viewport`** — `key`, `width`, `height`. The defaults are in `webforge.DEFAULT_VIEWPORTS`.

### Errors

All inherit from `webforge.WebForgeError`:

- `InvalidURLError` — empty or non-http(s) URL.
- `BrowserNotInstalledError` — Playwright/Chromium missing (run `playwright install chromium`).
- `CaptureError` — navigation, render, or screenshot failed.

---

## ZIP blueprint layout

**Single page**

```
WebForge_<domain>/
├── desktop.jpg
├── tablet.jpg
├── mobile.jpg
└── metadata.json
```

**Crawl (multi-page)**

```
WebForge_<domain>/
├── sitemap.json
├── metadata.json          # domain-wide design tokens
└── pages/
    ├── home/
    │   ├── desktop.jpg
    │   └── metadata.json
    └── <slug>/
        └── ...
```

This mirrors the layout produced by the WebForge browser extension.

---

## Configuration examples

```python
# Fast desktop-only PNG capture, no hover pass, short timeout.
webforge.capture(
    "example.com",
    mode="desktop",
    image_format="png",
    extract_hover=False,
    timeout=8.0,
)

# Custom viewport set.
from webforge import Viewport
webforge.capture("example.com", viewports=[Viewport("wide", 1920, 1080)])

# Point at a system Chrome instead of Playwright's bundled Chromium.
webforge.capture("example.com", executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
```

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `BrowserNotInstalledError` / "Executable doesn't exist" | Run `playwright install chromium`. |
| Capture times out on heavy pages | Increase `timeout=`; WebForge still returns the current state rather than failing. |
| A site blocks automated visits (Cloudflare, bot walls) | WebForge already spoofs a real user agent and hides the WebDriver flag, but some sites can't be captured headless — try `headless=False`, or use the browser extension which runs in your own session. |
| Missing colours/fonts | Some tokens live in cross-origin stylesheets the browser won't expose; this matches the extension's behaviour. |
| Empty/black screenshots | The page likely needs longer to render — raise `timeout=`. |

---

## Development

```bash
cd python
pip install -e ".[dev]"
playwright install chromium

pytest -m "not integration"   # fast unit tests, no browser
pytest -m integration         # end-to-end (needs Chromium)
```

---

## License

MIT © Zaki Sheriff
