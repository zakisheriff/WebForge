"""Command-line interface: ``webforge <url> [options]``.

Examples::

    webforge example.com                     # capture, write WebForge_example.com.zip
    webforge example.com -o out.zip --png    # choose output + format
    webforge example.com --desktop           # desktop viewport only
    webforge example.com --crawl --max 10    # crawl up to 10 pages
"""

from __future__ import annotations

import argparse
import sys
from urllib.parse import urlparse

from . import __version__, capture, crawl
from .errors import WebForgeError


def _default_output(url: str, *, is_crawl: bool) -> str:
    domain = urlparse(url if "://" in url else f"https://{url}").netloc or "site"
    suffix = "_site" if is_crawl else ""
    return f"WebForge_{domain}{suffix}.zip"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="webforge",
        description="Capture a website's visual blueprint for AI coding agents.",
    )
    parser.add_argument("url", help="Target website URL (scheme optional).")
    parser.add_argument("-o", "--output", help="Output ZIP path.")
    parser.add_argument(
        "--desktop",
        action="store_true",
        help="Capture the desktop viewport only (default: desktop+tablet+mobile).",
    )
    parser.add_argument("--png", action="store_true", help="Save PNG instead of JPEG.")
    parser.add_argument(
        "--quality", type=int, default=62, help="JPEG quality 0-100 (default: 62)."
    )
    parser.add_argument(
        "--no-hover",
        action="store_true",
        help="Skip hover priming (faster; may miss hover-only artwork).",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=15.0,
        help="Navigation timeout in seconds (default: 15).",
    )
    parser.add_argument("--crawl", action="store_true", help="Crawl the whole domain.")
    parser.add_argument(
        "--max",
        type=int,
        default=5,
        dest="max_pages",
        help="Max pages to crawl (default: 5).",
    )
    parser.add_argument(
        "--version", action="version", version=f"webforge {__version__}"
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    mode = "desktop" if args.desktop else "all"
    image_format = "png" if args.png else "jpeg"

    try:
        if args.crawl:
            print(f"Crawling {args.url} (up to {args.max_pages} pages)...", file=sys.stderr)
            result = crawl(
                args.url,
                max_pages=args.max_pages,
                mode="all" if not args.desktop else "desktop",
                image_format=image_format,
                quality=args.quality,
                timeout=args.timeout,
            )
            out = args.output or _default_output(args.url, is_crawl=True)
            result.to_zip(out)
            print(
                f"Captured {len(result.pages)} page(s) -> {out}", file=sys.stderr
            )
        else:
            print(f"Capturing {args.url}...", file=sys.stderr)
            result = capture(
                args.url,
                mode=mode,
                extract_hover=not args.no_hover,
                image_format=image_format,
                quality=args.quality,
                timeout=args.timeout,
            )
            out = args.output or _default_output(args.url, is_crawl=False)
            result.to_zip(out)
            print(
                f"Captured {len(result.screenshots)} viewport(s), "
                f"{len(result.colors)} colours, {len(result.fonts)} fonts -> {out}",
                file=sys.stderr,
            )
    except WebForgeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:  # pragma: no cover
        print("aborted", file=sys.stderr)
        return 130
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
