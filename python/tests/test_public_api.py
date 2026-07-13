"""The public surface: exports, version, and URL validation."""

import pytest

import webforge
from webforge._engine import normalize_url
from webforge.errors import InvalidURLError


def test_version_is_exposed():
    assert isinstance(webforge.__version__, str)
    assert webforge.__version__.count(".") >= 2


def test_all_names_are_importable():
    for name in webforge.__all__:
        assert hasattr(webforge, name), f"{name} missing from package"


def test_primary_api_is_callable():
    assert callable(webforge.capture)
    assert callable(webforge.crawl)


@pytest.mark.parametrize(
    "raw,expected_scheme",
    [
        ("example.com", "https"),
        ("http://example.com", "http"),
        ("https://example.com/path", "https"),
        ("  example.com  ", "https"),
    ],
)
def test_normalize_url_adds_scheme(raw, expected_scheme):
    out = normalize_url(raw)
    assert out is not None
    assert out.startswith(expected_scheme + "://")


@pytest.mark.parametrize("raw", ["", "   ", "ftp://example.com", "javascript:alert(1)", "not a url with spaces"])
def test_normalize_url_rejects_bad(raw):
    assert normalize_url(raw) is None


def test_capture_rejects_bad_url_without_launching_browser():
    # Invalid URL must fail fast, before any browser work.
    with pytest.raises(InvalidURLError):
        webforge.capture("ftp://nope")


def test_crawl_rejects_bad_url_without_launching_browser():
    with pytest.raises(InvalidURLError):
        webforge.crawl("")
