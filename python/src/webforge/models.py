"""Public data structures returned by the WebForge capture engine.

These are plain dataclasses so results are easy to inspect, serialise, and test.
Screenshots are held as raw image *bytes* (PNG or JPEG) rather than base64 data
URLs -- writing them to disk or a ZIP is then a direct byte copy.
"""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass, field

__all__ = [
    "Viewport",
    "DEFAULT_VIEWPORTS",
    "CaptureResult",
    "CapturedPage",
    "CrawlResult",
]


@dataclass(frozen=True)
class Viewport:
    """A named capture size, mirroring WebForge's desktop/tablet/mobile matrix."""

    key: str
    width: int
    height: int


#: The three viewports every WebForge surface captures, in capture order.
DEFAULT_VIEWPORTS: tuple[Viewport, ...] = (
    Viewport("desktop", 1440, 900),
    Viewport("tablet", 768, 1024),
    Viewport("mobile", 390, 844),
)


def _ext_for(image_format: str) -> str:
    fmt = image_format.lower()
    return "jpg" if fmt in ("jpg", "jpeg") else "png"


@dataclass
class CaptureResult:
    """The blueprint of a single captured page.

    Attributes:
        url: The (normalised) URL that was captured.
        title: The page's ``<title>`` at capture time.
        captured_at: ISO-8601 UTC timestamp of the capture.
        screenshots: Mapping of viewport key -> raw image bytes.
        colors: Prominence-ordered hex palette (area-weighted).
        fonts: Top font families found on the page.
        images: De-duplicated image URLs / inline data-URIs, data-URIs first.
        image_format: ``"jpeg"`` or ``"png"`` -- the encoding of ``screenshots``.
    """

    url: str
    title: str
    captured_at: str
    screenshots: dict[str, bytes] = field(default_factory=dict)
    colors: list[str] = field(default_factory=list)
    fonts: list[str] = field(default_factory=list)
    images: list[str] = field(default_factory=list)
    image_format: str = "jpeg"

    def metadata(self) -> dict:
        """Return the JSON-serialisable metadata (everything except image bytes)."""
        return {
            "url": self.url,
            "title": self.title,
            "capturedAt": self.captured_at,
            "viewports": sorted(self.screenshots),
            "colors": self.colors,
            "fonts": self.fonts,
            "images": self.images,
        }

    def save(self, directory: str) -> str:
        """Write screenshots + ``metadata.json`` into ``directory``.

        Returns the directory path. Creates it if needed.
        """
        os.makedirs(directory, exist_ok=True)
        ext = _ext_for(self.image_format)
        for key, data in self.screenshots.items():
            with open(os.path.join(directory, f"{key}.{ext}"), "wb") as fh:
                fh.write(data)
        with open(os.path.join(directory, "metadata.json"), "w", encoding="utf-8") as fh:
            json.dump(self.metadata(), fh, indent=2)
        return directory

    def to_zip(self, path: str) -> str:
        """Write this capture as a WebForge blueprint ZIP at ``path``."""
        from .export import export_zip

        return export_zip(self, path)


@dataclass
class CapturedPage:
    """One page within a multi-page crawl."""

    url: str
    slug: str
    title: str
    screenshots: dict[str, bytes] = field(default_factory=dict)
    colors: list[str] = field(default_factory=list)
    fonts: list[str] = field(default_factory=list)
    image_format: str = "jpeg"

    def metadata(self) -> dict:
        return {
            "title": self.title,
            "url": self.url,
            "slug": self.slug,
            "viewports": sorted(self.screenshots),
            "colors": self.colors,
            "fonts": self.fonts,
        }


@dataclass
class CrawlResult:
    """The blueprint of a whole domain: every captured page plus the sitemap."""

    domain: str
    pages: list[CapturedPage] = field(default_factory=list)
    sitemap: list[str] = field(default_factory=list)

    def design_tokens(self) -> dict:
        """Union of every page's colours and fonts."""
        colors: list[str] = []
        fonts: list[str] = []
        for page in self.pages:
            for c in page.colors:
                if c not in colors:
                    colors.append(c)
            for f in page.fonts:
                if f not in fonts:
                    fonts.append(f)
        return {"colors": colors, "fonts": fonts}

    def metadata(self) -> dict:
        return {
            "domain": self.domain,
            "pages": [p.metadata() for p in self.pages],
            "sitemap": self.sitemap,
            "designTokens": self.design_tokens(),
        }

    def to_zip(self, path: str) -> str:
        """Write this crawl as a WebForge blueprint ZIP at ``path``."""
        from .export import export_crawl_zip

        return export_crawl_zip(self, path)


def _to_dict(obj) -> dict:  # pragma: no cover - convenience only
    """Best-effort dataclass -> dict (drops raw bytes for readability)."""
    d = asdict(obj)
    if "screenshots" in d:
        d["screenshots"] = sorted(d["screenshots"])
    return d
