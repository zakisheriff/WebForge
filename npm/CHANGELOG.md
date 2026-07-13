# Changelog

All notable changes to the WebForge Node package (`webforge-theatom`) are
documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-07-13

Initial release — a Puppeteer-powered Node port of the WebForge capture engine,
mirroring the `webforge-theatom` Python package's API.

### Added
- `capture(url, options)` — screenshot a single page across desktop, tablet and
  mobile viewports and extract its design tokens.
- `crawl(url, options)` — breadth-first same-origin crawl capturing each page.
- Area-weighted colour palette, ranked font list, and image-asset harvesting,
  ported from the WebForge website capture route.
- Hover priming so sprite / hover-only artwork loads before capture.
- Automatic **http fallback**: hosts that answer only on port 80 and 301 to
  their real https site (e.g. `anthropic.ai` → `https://www.anthropic.com`) are
  followed instead of failing.
- Follows client-side redirects and waits for JS-rendered pages to paint.
- Raises `CaptureError` with clear guidance when a host is genuinely
  unreachable, instead of returning a blank capture.
- ZIP blueprint export (`.toZip()`) and `.save()` to a folder.
- Result types: `CaptureResult`, `CapturedPage`, `CrawlResult`, `Viewport`.
- Typed error hierarchy: `WebForgeError`, `InvalidURLError`,
  `BrowserNotInstalledError`, `CaptureError`.
- `webforge` command-line interface.

[Unreleased]: https://github.com/zakisheriff/WebForge/compare/npm-v0.1.0...HEAD
[0.1.0]: https://github.com/zakisheriff/WebForge/releases/tag/npm-v0.1.0
