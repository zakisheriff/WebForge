"""Public capture orchestration: :func:`capture` and :func:`crawl`.

These are re-exported at the top level, so the intended usage is simply::

    import webforge

    result = webforge.capture("example.com")
    result.to_zip("example.zip")
"""

from __future__ import annotations

from datetime import datetime, timezone
from urllib.parse import urlparse

from ._engine import _Session, normalize_url
from .errors import InvalidURLError
from .models import DEFAULT_VIEWPORTS, CapturedPage, CaptureResult, CrawlResult, Viewport

__all__ = ["capture", "crawl"]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _resolve_viewports(mode: str, viewports) -> tuple[Viewport, ...]:
    """Turn a ``mode`` / explicit ``viewports`` argument into a viewport tuple."""
    if viewports is not None:
        resolved = tuple(viewports)
        if not resolved:
            raise ValueError("viewports must not be empty")
        return resolved
    if mode == "desktop":
        return tuple(v for v in DEFAULT_VIEWPORTS if v.key == "desktop")
    if mode == "all":
        return DEFAULT_VIEWPORTS
    raise ValueError(f"mode must be 'all' or 'desktop', got {mode!r}")


def _slug_from(url: str) -> str:
    path = urlparse(url).path
    return path or "/"


def capture(
    url: str,
    *,
    mode: str = "all",
    viewports=None,
    extract_hover: bool = True,
    image_format: str = "jpeg",
    quality: int = 62,
    timeout: float = 15.0,
    executable_path: str | None = None,
    headless: bool = True,
) -> CaptureResult:
    """Capture a single page's visual blueprint.

    Args:
        url: Target URL. A missing scheme defaults to ``https://``.
        mode: ``"all"`` captures desktop + tablet + mobile; ``"desktop"`` only
            the 1440-wide shot. Ignored when ``viewports`` is given.
        viewports: Optional explicit iterable of :class:`~webforge.Viewport`.
        extract_hover: Also prime hover to surface sprite/hover-only artwork.
        image_format: ``"jpeg"`` (default, smaller) or ``"png"``.
        quality: JPEG quality 0-100 (ignored for PNG).
        timeout: Seconds to wait for navigation before capturing current state.
        executable_path: Custom Chromium binary; defaults to Playwright's.
        headless: Run the browser headless (default ``True``).

    Returns:
        A :class:`~webforge.CaptureResult` with screenshots, colours, fonts and images.

    Raises:
        InvalidURLError: If ``url`` is empty or not http(s).
        BrowserNotInstalledError: If Playwright/Chromium is unavailable.
    """
    target = normalize_url(url)
    if target is None:
        raise InvalidURLError(f"Not a valid website URL: {url!r}")

    picked = _resolve_viewports(mode, viewports)

    with _Session(executable_path=executable_path, headless=headless) as session:
        session.goto(target, timeout=timeout)
        result = CaptureResult(
            url=target,
            title=session.title(target),
            captured_at=_now_iso(),
            image_format=image_format,
        )

        session.auto_scroll()

        # Tokens at rest give the default artwork, colours and fonts.
        rest = session.extract_tokens()
        result.colors = rest["colors"]
        result.fonts = rest["fonts"]

        images = list(rest["images"])
        if extract_hover:
            # Hovering can swap art in (and replace resting art), so we prime
            # hover purely for the extra images, then reset before screenshots.
            session.prime_hover()
            hovered = session.extract_tokens()
            session.reset_hover()
            for img in hovered["images"]:
                if img not in images:
                    images.append(img)

        # data-URIs first, capped at 40 -- matches the route's ordering.
        images.sort(key=lambda s: 0 if s.startswith("data:") else 1)
        result.images = images[:40]

        for vp in picked:
            result.screenshots[vp.key] = session.screenshot(vp, image_format, quality)

    return result


def crawl(
    url: str,
    *,
    max_pages: int = 5,
    custom_urls=None,
    mode: str = "desktop",
    viewports=None,
    image_format: str = "jpeg",
    quality: int = 62,
    timeout: float = 15.0,
    executable_path: str | None = None,
    headless: bool = True,
) -> CrawlResult:
    """Crawl a domain, capturing each page it reaches (breadth-first).

    Only same-origin http(s) links are followed, matching the extension's
    crawler. ``custom_urls`` are visited first, then the start URL, then links
    discovered along the way, until ``max_pages`` pages are captured.

    Args:
        url: The start URL (its origin bounds the crawl).
        max_pages: Maximum number of pages to capture.
        custom_urls: Optional iterable of URLs to seed the queue with first.
        mode: ``"desktop"`` (default) or ``"all"`` viewports per page.
        viewports: Optional explicit viewports (overrides ``mode``).
        image_format, quality, timeout, executable_path, headless: As :func:`capture`.

    Returns:
        A :class:`~webforge.CrawlResult` with every captured page and the sitemap.

    Raises:
        InvalidURLError: If ``url`` is empty or not http(s).
    """
    start = normalize_url(url)
    if start is None:
        raise InvalidURLError(f"Not a valid website URL: {url!r}")

    picked = _resolve_viewports(mode, viewports)
    origin = urlparse(start).scheme + "://" + urlparse(start).netloc

    seeded = list(custom_urls or [])
    if start not in seeded:
        seeded.append(start)

    queue: list[str] = list(seeded)
    visited: set[str] = set()
    result = CrawlResult(domain=urlparse(start).netloc)

    with _Session(executable_path=executable_path, headless=headless) as session:
        while queue and len(result.pages) < max_pages:
            current = queue.pop(0)
            if current in visited:
                continue
            visited.add(current)

            session.goto(current, timeout=timeout)
            session.auto_scroll()
            tokens = session.extract_tokens()

            page = CapturedPage(
                url=current,
                slug=_slug_from(current),
                title=session.title(current),
                colors=tokens["colors"],
                fonts=tokens["fonts"],
                image_format=image_format,
            )
            for vp in picked:
                page.screenshots[vp.key] = session.screenshot(vp, image_format, quality)
            result.pages.append(page)

            # Discover more same-origin links to keep crawling.
            for link in session.same_origin_links(origin):
                if link not in visited and link not in queue:
                    queue.append(link)

    result.sitemap = sorted(visited)
    return result
