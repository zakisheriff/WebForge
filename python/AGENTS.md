# WebForge Python package — agent guide

This directory is the **`webforge-theatom`** PyPI package: a Playwright-powered
Python port of the WebForge capture engine. Import name is `webforge`; the
distribution/install name is `webforge-theatom`.

## Layout
- `src/webforge/` — package source.
  - `__init__.py` — public API surface (`capture`, `crawl`, models, errors).
  - `capture.py` — `capture()` / `crawl()` entry points.
  - `_engine.py` — Playwright session, scrolling, token extraction.
  - `models.py` — `CaptureResult`, `CapturedPage`, `CrawlResult`, `Viewport`.
  - `export.py` — ZIP blueprint writers.
  - `cli.py` — the `webforge` command.
  - `_version.py` — **single source of truth for the version**.
- `tests/` — unit tests + browser-gated `integration` tests.

## Conventions
- Keep the public API in sync with `__init__.py`'s `__all__` and the docstring.
- User-facing docs live in `README.md`; update it when the API changes.
- Errors must inherit from `WebForgeError`.
- Match the browser extension's behaviour (viewports, token extraction, ZIP
  layout) — this package is a faithful port, not a redesign.

## Dev & tests
```bash
pip install -e ".[dev]"
playwright install chromium
pytest -m "not integration"   # fast, no browser
pytest -m integration         # end-to-end (needs Chromium)
```

## Releasing (see RELEASING.md for detail)
1. Bump `__version__` in `src/webforge/_version.py` (SemVer). **Never reuse a
   published version — PyPI rejects re-uploads with a 400.**
2. Add a dated entry to `CHANGELOG.md`.
3. `rm -rf dist build && python -m build && python -m twine check dist/*`
4. `python -m twine upload dist/*` (real PyPI) — needs a pypi.org API token.
   The "environment not supported for trusted publishing" line is a harmless
   warning on local uploads.
