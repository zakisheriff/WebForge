"""Data model behaviour: metadata, disk save, token union."""

import json

from webforge import DEFAULT_VIEWPORTS, CapturedPage, CaptureResult, CrawlResult, Viewport


def _sample_capture():
    return CaptureResult(
        url="https://example.com",
        title="Example",
        captured_at="2026-01-01T00:00:00+00:00",
        screenshots={"desktop": b"\xff\xd8fakejpeg", "mobile": b"\xff\xd8fakejpeg2"},
        colors=["#ffffff", "#000000"],
        fonts=["Inter", "Outfit"],
        images=["https://example.com/a.png", "data:image/png;base64,AAAA"],
        image_format="jpeg",
    )


def test_default_viewports_shape():
    assert [v.key for v in DEFAULT_VIEWPORTS] == ["desktop", "tablet", "mobile"]
    assert all(isinstance(v, Viewport) for v in DEFAULT_VIEWPORTS)
    assert DEFAULT_VIEWPORTS[0].width == 1440


def test_capture_metadata_excludes_bytes():
    meta = _sample_capture().metadata()
    assert meta["url"] == "https://example.com"
    assert meta["viewports"] == ["desktop", "mobile"]
    assert meta["colors"] == ["#ffffff", "#000000"]
    # metadata must be JSON serialisable (no raw bytes)
    json.dumps(meta)


def test_capture_save_writes_files(tmp_path):
    out = _sample_capture().save(str(tmp_path / "cap"))
    files = {p.name for p in (tmp_path / "cap").iterdir()}
    assert files == {"desktop.jpg", "mobile.jpg", "metadata.json"}
    written = json.loads((tmp_path / "cap" / "metadata.json").read_text())
    assert written["title"] == "Example"
    assert out.endswith("cap")


def test_png_format_uses_png_extension(tmp_path):
    cap = _sample_capture()
    cap.image_format = "png"
    cap.save(str(tmp_path / "p"))
    assert (tmp_path / "p" / "desktop.png").exists()


def test_crawl_design_tokens_are_unioned():
    result = CrawlResult(
        domain="example.com",
        pages=[
            CapturedPage("https://example.com/", "/", "Home", colors=["#111"], fonts=["Inter"]),
            CapturedPage("https://example.com/a", "/a", "A", colors=["#111", "#222"], fonts=["Outfit"]),
        ],
        sitemap=["https://example.com/", "https://example.com/a"],
    )
    tokens = result.design_tokens()
    assert tokens["colors"] == ["#111", "#222"]
    assert tokens["fonts"] == ["Inter", "Outfit"]
