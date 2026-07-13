"""WebForge -- capture a website's visual blueprint for AI coding agents.

WebForge screenshots any URL across desktop, tablet and mobile viewports,
extracts its design tokens (an area-weighted colour palette, top fonts and
image assets), optionally crawls a whole domain, and packages everything into a
clean ZIP blueprint that tools like Claude Code, Cursor or Codex can use to
rebuild sites with pixel fidelity.

This is the Python port of the WebForge Chrome extension's capture engine,
powered by Playwright.

Quick start::

    import webforge

    # Single page -> screenshots + colours + fonts + images
    result = webforge.capture("example.com")
    print(result.colors, result.fonts)
    result.to_zip("example.zip")

    # Whole domain
    site = webforge.crawl("example.com", max_pages=10)
    site.to_zip("example-site.zip")

Requires a one-time browser download after install::

    playwright install chromium
"""

from __future__ import annotations

from ._version import __version__
from .capture import capture, crawl
from .errors import (
    BrowserNotInstalledError,
    CaptureError,
    InvalidURLError,
    WebForgeError,
)
from .export import export_crawl_zip, export_zip
from .models import (
    DEFAULT_VIEWPORTS,
    CapturedPage,
    CaptureResult,
    CrawlResult,
    Viewport,
)

__all__ = [
    "__version__",
    # primary API
    "capture",
    "crawl",
    # export helpers
    "export_zip",
    "export_crawl_zip",
    # data models
    "Viewport",
    "DEFAULT_VIEWPORTS",
    "CaptureResult",
    "CapturedPage",
    "CrawlResult",
    # errors
    "WebForgeError",
    "InvalidURLError",
    "BrowserNotInstalledError",
    "CaptureError",
]
