"""CLI argument parsing and output-name defaults (no browser involved)."""

import pytest

from webforge.cli import _default_output, build_parser


def test_parser_defaults():
    args = build_parser().parse_args(["example.com"])
    assert args.url == "example.com"
    assert args.desktop is False
    assert args.png is False
    assert args.crawl is False
    assert args.max_pages == 5
    assert args.quality == 62


def test_parser_flags():
    args = build_parser().parse_args(
        ["example.com", "--crawl", "--max", "12", "--png", "--desktop", "-o", "x.zip"]
    )
    assert args.crawl is True
    assert args.max_pages == 12
    assert args.png is True
    assert args.desktop is True
    assert args.output == "x.zip"


@pytest.mark.parametrize(
    "url,is_crawl,expected",
    [
        ("example.com", False, "WebForge_example.com.zip"),
        ("https://example.com/path", False, "WebForge_example.com.zip"),
        ("example.com", True, "WebForge_example.com_site.zip"),
    ],
)
def test_default_output(url, is_crawl, expected):
    assert _default_output(url, is_crawl=is_crawl) == expected


def test_version_flag_exits(capsys):
    with pytest.raises(SystemExit) as exc:
        build_parser().parse_args(["--version"])
    assert exc.value.code == 0
    assert "webforge" in capsys.readouterr().out
