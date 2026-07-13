# Changelog

All notable changes to the WebForge Python package (`webforge-theatom`) are
documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.3] - 2026-07-13

### Fixed
- Follow client-side redirects and let JS-rendered pages paint before scraping.
  `goto()` now waits for the network to go idle and re-settles if the URL bounces
  (e.g. a "Loading…" redirect stub or an apex→www hop), so captures land on the
  final page instead of an intermediate blank/loading screen.

### Notes
- Sites behind aggressive bot protection (e.g. Cloudflare challenges) may still
  return a blank or challenge page in headless mode — a limitation shared by all
  headless capture tools. Use the browser extension for those.

## [0.1.2] - 2026-07-13

### Fixed
- `capture()` / `crawl()` no longer crash with "Execution context was destroyed"
  when a site redirects (apex/www or JS redirect) mid-capture. In-page passes
  (auto-scroll, token extraction, hover priming) now tolerate a navigation,
  wait for the page to re-settle, and retry once before continuing.

## [0.1.1] - 2026-07-13

First public release on **PyPI** — `pip install webforge-theatom`.

### Changed
- Published to PyPI (0.1.0 was validated on TestPyPI only). No API or behaviour
  changes from 0.1.0.

## [0.1.0] - 2026-07-13

Initial release — a Playwright-powered Python port of the WebForge capture engine.

### Added
- `webforge.capture(url)` — screenshot a single page across desktop, tablet and
  mobile viewports and extract its design tokens.
- `webforge.crawl(url)` — breadth-first same-origin crawl capturing each page.
- Area-weighted colour palette, ranked font list, and image-asset harvesting,
  ported faithfully from the WebForge website capture route.
- Hover priming so sprite / hover-only artwork loads before capture.
- ZIP blueprint export (`.to_zip()`) mirroring the browser extension's
  `WebForge_<domain>/` layout, plus `.save()` to a folder.
- Result models: `CaptureResult`, `CapturedPage`, `CrawlResult`, `Viewport`.
- Typed error hierarchy: `WebForgeError`, `InvalidURLError`,
  `BrowserNotInstalledError`, `CaptureError`.
- `webforge` command-line interface.
- Unit test suite plus browser-gated integration tests.

[Unreleased]: https://github.com/zakisheriff/WebForge/compare/py-v0.1.3...HEAD
[0.1.3]: https://github.com/zakisheriff/WebForge/releases/tag/py-v0.1.3
[0.1.2]: https://github.com/zakisheriff/WebForge/releases/tag/py-v0.1.2
[0.1.1]: https://github.com/zakisheriff/WebForge/releases/tag/py-v0.1.1
[0.1.0]: https://github.com/zakisheriff/WebForge/releases/tag/py-v0.1.0
