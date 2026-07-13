"""Internal Playwright engine: browser lifecycle and in-page routines.

This is the Python port of the WebForge website's serverless capture route
(``website/src/app/api/capture/route.ts``). Public callers should use
:func:`webforge.capture` / :func:`webforge.crawl`, not this module.
"""

from __future__ import annotations

import re
import time
from importlib import resources
from urllib.parse import urlparse, urlunparse

from .errors import BrowserNotInstalledError, CaptureError

# User-agent + headers mirror the route so bot-detection / Cloudflare behave the
# same way they do for the hosted "Try on any URL" tool.
_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)
_EXTRA_HEADERS = {
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,image/apng,*/*;q=0.8"
    ),
}
_LAUNCH_ARGS = ["--disable-blink-features=AutomationControlled"]

# JS that hides the WebDriver flag, injected before any page script runs.
_STEALTH_INIT = "Object.defineProperty(navigator, 'webdriver', { get: () => false });"

# Selector for elements that tend to swap in artwork on hover (run cycles,
# alt sprite frames, etc.). Kept identical to the route.
_HOVER_SELECTOR = (
    "a, button, img, svg, canvas, [role='button'], [class*='sprite'], "
    "[class*='char'], [class*='avatar'], [class*='hover'], [class*='pixel']"
)


def _load_extract_js() -> str:
    """Read the bundled token-extractor JS shipped as package data."""
    return (
        resources.files("webforge._resources")
        .joinpath("extract_tokens.js")
        .read_text(encoding="utf-8")
    )


# Cached so we only touch the filesystem once per process.
_EXTRACT_JS = _load_extract_js()


# Matches a leading URL scheme, e.g. "http:", "ftp:", "javascript:".
_SCHEME_RE = re.compile(r"^([a-zA-Z][a-zA-Z0-9+.\-]*):")


def normalize_url(raw: str) -> str | None:
    """Add a scheme if missing and reject anything that isn't a valid http(s) URL.

    Mirrors ``normalizeUrl`` in the route, but rejects non-http(s) schemes
    (``ftp:``, ``javascript:``) and hosts containing whitespace up front so
    bad input fails fast instead of reaching the browser.
    """
    raw = (raw or "").strip()
    if not raw:
        return None

    scheme_match = _SCHEME_RE.match(raw)
    if scheme_match:
        if scheme_match.group(1).lower() not in ("http", "https"):
            return None
        with_scheme = raw
    else:
        with_scheme = f"https://{raw}"

    try:
        parsed = urlparse(with_scheme)
    except ValueError:
        return None
    if parsed.scheme not in ("http", "https"):
        return None
    host = parsed.netloc
    if not host or any(ch.isspace() for ch in host):
        return None
    return urlunparse(parsed)


class _Session:
    """A launched Chromium instance and one reusable page.

    Used as a context manager so the browser is always closed::

        with _Session() as session:
            session.goto(url)
            ...
    """

    def __init__(self, *, executable_path: str | None = None, headless: bool = True):
        self._executable_path = executable_path
        self._headless = headless
        self._pw = None
        self._browser = None
        self.page = None

    def __enter__(self) -> "_Session":
        try:
            from playwright.sync_api import sync_playwright
        except ImportError as exc:  # pragma: no cover - import guard
            raise BrowserNotInstalledError(
                "Playwright is not installed. Install it with:\n"
                "    pip install webforge-theatom\n"
                "then download the browser binary:\n"
                "    playwright install chromium"
            ) from exc

        from playwright.sync_api import Error as PlaywrightError

        self._pw = sync_playwright().start()
        try:
            self._browser = self._pw.chromium.launch(
                headless=self._headless,
                args=_LAUNCH_ARGS,
                executable_path=self._executable_path,
            )
        except PlaywrightError as exc:
            self._pw.stop()
            self._pw = None
            raise BrowserNotInstalledError(
                "Could not launch Chromium. Download the browser binary with:\n"
                "    playwright install chromium\n"
                f"(original error: {exc})"
            ) from exc

        self.page = self._browser.new_page(user_agent=_USER_AGENT)
        self.page.add_init_script(_STEALTH_INIT)
        self.page.set_extra_http_headers(_EXTRA_HEADERS)
        return self

    def __exit__(self, *exc) -> None:
        if self._browser is not None:
            try:
                self._browser.close()
            except Exception:
                pass
        if self._pw is not None:
            try:
                self._pw.stop()
            except Exception:
                pass

    # -- in-page routines --------------------------------------------------

    def goto(self, url: str, timeout: float) -> None:
        """Navigate, tolerating slow pages the way the route does.

        On timeout we don't fail: we pause briefly and capture the current
        state, matching the "proceed with current state" behaviour that keeps
        the hosted tool from returning gateway timeouts.
        """
        from playwright.sync_api import Error as PlaywrightError

        self.page.set_viewport_size({"width": 1440, "height": 900})
        try:
            self.page.goto(url, wait_until="load", timeout=timeout * 1000)
        except PlaywrightError:
            time.sleep(2.0)

    def title(self, fallback: str) -> str:
        try:
            return self.page.title() or fallback
        except Exception:
            return fallback

    def auto_scroll(self) -> None:
        """Scroll to the bottom in steps to trigger lazy-loaded assets."""
        self.page.evaluate(
            """
            async () => {
              await new Promise((resolve) => {
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
            }
            """
        )
        time.sleep(0.3)

    def extract_tokens(self) -> dict:
        """Run the bundled extractor in the page and return colours/fonts/images."""
        return self.page.evaluate(_EXTRACT_JS)

    def _dispatch_hover(self, events: list[str]) -> None:
        self.page.evaluate(
            """
            ({ selector, types }) => {
              const els = Array.from(document.querySelectorAll(selector)).slice(0, 400);
              for (const el of els) {
                for (const t of types) {
                  try {
                    el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true }));
                  } catch {}
                }
              }
            }
            """,
            {"selector": _HOVER_SELECTOR, "types": events},
        )

    def prime_hover(self) -> None:
        """Fire synthetic hover so JS-driven sprite swaps load their assets."""
        self._dispatch_hover(["pointerover", "mouseover", "pointerenter", "mouseenter"])
        time.sleep(0.5)

    def reset_hover(self) -> None:
        """Undo hover priming so screenshots reflect the page at rest."""
        self._dispatch_hover(["pointerout", "mouseout", "pointerleave", "mouseleave"])
        time.sleep(0.2)

    def screenshot(self, viewport, image_format: str, quality: int) -> bytes:
        """Full-page screenshot at ``viewport``; returns raw image bytes."""
        self.page.set_viewport_size({"width": viewport.width, "height": viewport.height})
        time.sleep(0.45)  # let responsive layout settle
        fmt = "jpeg" if image_format.lower() in ("jpg", "jpeg") else "png"
        kwargs = {"full_page": True, "type": fmt}
        if fmt == "jpeg":
            kwargs["quality"] = quality
        try:
            return self.page.screenshot(**kwargs)
        except Exception as exc:  # pragma: no cover - defensive
            raise CaptureError(f"Screenshot failed for {viewport.key}: {exc}") from exc

    def same_origin_links(self, origin: str) -> list[str]:
        """Collect de-duplicated same-origin http(s) links (hashes stripped)."""
        return self.page.evaluate(
            """
            (origin) => {
              const out = new Set();
              for (const a of Array.from(document.querySelectorAll('a'))) {
                try {
                  const url = new URL(a.href, window.location.href);
                  if (url.origin !== origin) continue;
                  if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;
                  url.hash = '';
                  out.add(url.toString());
                } catch {}
              }
              return Array.from(out);
            }
            """,
            origin,
        )
