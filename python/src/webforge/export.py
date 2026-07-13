"""ZIP blueprint export.

Mirrors the WebForge extension's ``zipExporter.ts`` layout so packages produced
by the Python library are laid out the same way agents already expect:

Single page::

    WebForge_<domain>/
        desktop.jpg
        tablet.jpg
        mobile.jpg
        metadata.json

Crawl (multi-page)::

    WebForge_<domain>/
        sitemap.json
        metadata.json
        pages/
            home/
                desktop.jpg
                metadata.json
            <slug>/
                ...

Uses only the standard library (``zipfile``) -- no third-party dependency.
"""

from __future__ import annotations

import json
import re
import zipfile
from datetime import datetime, timezone

from .models import CaptureResult, CrawlResult, _ext_for

__all__ = ["export_zip", "export_crawl_zip"]

_SAFE = re.compile(r"[^a-zA-Z0-9\-_]")


def _safe(name: str) -> str:
    return _SAFE.sub("_", name)


def _root_name(domain: str) -> str:
    return f"WebForge_{_safe(domain)}"


def _slug_folder(slug: str) -> str:
    if slug in ("", "/"):
        return "home"
    return _safe(slug.strip("/")) or "home"


def export_zip(result: CaptureResult, path: str) -> str:
    """Write a single :class:`~webforge.CaptureResult` to a blueprint ZIP.

    Returns ``path``.
    """
    from urllib.parse import urlparse

    domain = urlparse(result.url).netloc or "site"
    root = _root_name(domain)
    ext = _ext_for(result.image_format)

    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
        for key, data in result.screenshots.items():
            zf.writestr(f"{root}/{key}.{ext}", data)
        zf.writestr(
            f"{root}/metadata.json",
            json.dumps(result.metadata(), indent=2),
        )
    return path


def export_crawl_zip(result: CrawlResult, path: str) -> str:
    """Write a multi-page :class:`~webforge.CrawlResult` to a blueprint ZIP.

    Returns ``path``.
    """
    root = _root_name(result.domain)

    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
        single = len(result.pages) == 1
        for page in result.pages:
            if single:
                base = root
            else:
                base = f"{root}/pages/{_slug_folder(page.slug)}"
            ext = _ext_for(page.image_format)
            for key, data in page.screenshots.items():
                zf.writestr(f"{base}/{key}.{ext}", data)
            zf.writestr(f"{base}/metadata.json", json.dumps(page.metadata(), indent=2))

        # Global sitemap + design tokens for multi-page blueprints.
        if not single:
            zf.writestr(f"{root}/sitemap.json", json.dumps(result.sitemap, indent=2))
            global_meta = {
                "domain": result.domain,
                "exportedAt": datetime.now(timezone.utc).isoformat(),
                "sitemap": result.sitemap,
                "designTokens": result.design_tokens(),
            }
            zf.writestr(f"{root}/metadata.json", json.dumps(global_meta, indent=2))
    return path
