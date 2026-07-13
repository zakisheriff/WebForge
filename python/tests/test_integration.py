"""End-to-end capture against a real page.

Skipped automatically unless Playwright *and* a Chromium build are available,
so the fast unit suite still runs everywhere. Run explicitly with::

    playwright install chromium
    pytest -m integration
"""

import http.server
import threading
from importlib import resources

import pytest

pytestmark = pytest.mark.integration

_HTML = b"""<!doctype html><html><head><title>WebForge Test</title>
<style>body{background:#fafafa;color:#222;font-family:Inter,sans-serif}
h1{background:#3366cc;color:#fff}</style></head>
<body><h1>Hello</h1><p>Some text on a test page.</p>
<a href="/about">About</a><img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>"></body></html>"""


def _browser_available() -> bool:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return False
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(headless=True)
            b.close()
        return True
    except Exception:
        return False


needs_browser = pytest.mark.skipif(
    not _browser_available(), reason="Playwright Chromium not installed"
)


def test_extract_js_resource_present():
    # This must ship inside the wheel; guard against it going missing.
    text = resources.files("webforge._resources").joinpath("extract_tokens.js").read_text()
    assert "colors" in text and "fonts" in text and "images" in text


@pytest.fixture
def local_server():
    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(_HTML)

        def log_message(self, *args):
            pass

    server = http.server.HTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{server.server_address[1]}"
    server.shutdown()


@needs_browser
def test_capture_real_page(local_server, tmp_path):
    import webforge

    result = webforge.capture(local_server, mode="desktop", timeout=10)
    assert result.title == "WebForge Test"
    assert "desktop" in result.screenshots
    assert result.screenshots["desktop"][:2] == b"\xff\xd8"  # JPEG magic
    # The blue heading + light background should surface in the palette.
    assert any(c.lower() == "#3366cc" for c in result.colors)
    assert "Inter" in result.fonts

    out = tmp_path / "cap.zip"
    result.to_zip(str(out))
    assert out.exists() and out.stat().st_size > 0


@needs_browser
def test_crawl_real_site(local_server, tmp_path):
    import webforge

    result = webforge.crawl(local_server, max_pages=2, mode="desktop", timeout=10)
    assert len(result.pages) >= 1
    assert result.sitemap
