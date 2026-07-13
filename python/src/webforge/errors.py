"""Exception types raised by WebForge."""

from __future__ import annotations

__all__ = ["WebForgeError", "InvalidURLError", "BrowserNotInstalledError", "CaptureError"]


class WebForgeError(Exception):
    """Base class for all errors raised by this package."""


class InvalidURLError(WebForgeError, ValueError):
    """The supplied URL was empty or not a valid http(s) address."""


class BrowserNotInstalledError(WebForgeError, RuntimeError):
    """Playwright or its Chromium binary is missing.

    Fix with::

        pip install webforge
        playwright install chromium
    """


class CaptureError(WebForgeError, RuntimeError):
    """The page could not be captured (navigation, render, or screenshot failed)."""
