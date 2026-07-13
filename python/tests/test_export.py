"""ZIP export layout matches the extension's WebForge_<domain>/ structure."""

import json
import zipfile

from webforge import CapturedPage, CaptureResult, CrawlResult


def _names(path):
    with zipfile.ZipFile(path) as zf:
        return set(zf.namelist())


def test_single_capture_zip_layout(tmp_path):
    cap = CaptureResult(
        url="https://example.com",
        title="Example",
        captured_at="2026-01-01T00:00:00+00:00",
        screenshots={"desktop": b"img1", "tablet": b"img2", "mobile": b"img3"},
        colors=["#fff"],
        fonts=["Inter"],
        image_format="jpeg",
    )
    out = tmp_path / "cap.zip"
    cap.to_zip(str(out))
    names = _names(out)
    assert "WebForge_example_com/desktop.jpg" in names
    assert "WebForge_example_com/tablet.jpg" in names
    assert "WebForge_example_com/mobile.jpg" in names
    assert "WebForge_example_com/metadata.json" in names
    # sanity: metadata parses
    with zipfile.ZipFile(out) as zf:
        json.loads(zf.read("WebForge_example_com/metadata.json"))


def test_multipage_crawl_zip_layout(tmp_path):
    crawl = CrawlResult(
        domain="example.com",
        pages=[
            CapturedPage("https://example.com/", "/", "Home", screenshots={"desktop": b"a"}),
            CapturedPage("https://example.com/about", "/about", "About", screenshots={"desktop": b"b"}),
        ],
        sitemap=["https://example.com/", "https://example.com/about"],
    )
    out = tmp_path / "site.zip"
    crawl.to_zip(str(out))
    names = _names(out)
    assert "WebForge_example_com/pages/home/desktop.jpg" in names
    assert "WebForge_example_com/pages/about/desktop.jpg" in names
    assert "WebForge_example_com/sitemap.json" in names
    assert "WebForge_example_com/metadata.json" in names


def test_single_page_crawl_flattens(tmp_path):
    crawl = CrawlResult(
        domain="example.com",
        pages=[CapturedPage("https://example.com/", "/", "Home", screenshots={"desktop": b"a"})],
        sitemap=["https://example.com/"],
    )
    out = tmp_path / "one.zip"
    crawl.to_zip(str(out))
    names = _names(out)
    # A single-page crawl has no pages/ subtree and no global sitemap.json.
    assert "WebForge_example_com/desktop.jpg" in names
    assert not any("/pages/" in n for n in names)
    assert "WebForge_example_com/sitemap.json" not in names
