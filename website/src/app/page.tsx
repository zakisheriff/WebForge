"use client";

import React, { useState, useEffect, useRef } from "react";
import CaptureTool from "./CaptureTool";
import { POSTS } from "./blog/posts";

const REPO_URL = "https://github.com/zakisheriff/WebForge";
const CONTACT_EMAIL = "connect.theatom@gmail.com";

/* ── IDE-style code demo ─────────────────────────────────────────── */

const CODE_THEME = {
  bg: "#1e1e1e",
  bar: "#181818",
  border: "#2b2b2b",
  plain: "#d4d4d4",
  comment: "#6a9955",
  string: "#ce9178",
  keyword: "#569cd6",
  fn: "#dcdcaa",
  number: "#b5cea8",
  gutter: "#5a5a5a",
};

const HL_RE =
  /(#.*$|\/\/.*$)|("[^"]*"|'[^']*')|\b(import|from|const|await|async|function|return|new|let|var|print)\b|\b([A-Za-z_]\w*)(?=\s*\()|\b(\d+)\b/g;

function HighlightedLine({ line }: { line: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  HL_RE.lastIndex = 0;
  let i = 0;
  while ((m = HL_RE.exec(line)) !== null) {
    if (m.index > last) {
      nodes.push(
        <span key={`p${i}`} style={{ color: CODE_THEME.plain }}>
          {line.slice(last, m.index)}
        </span>,
      );
    }
    const color = m[1]
      ? CODE_THEME.comment
      : m[2]
        ? CODE_THEME.string
        : m[3]
          ? CODE_THEME.keyword
          : m[4]
            ? CODE_THEME.fn
            : CODE_THEME.number;
    nodes.push(
      <span key={`t${i}`} style={{ color }}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
    i += 1;
  }
  if (last < line.length) {
    nodes.push(
      <span key="tail" style={{ color: CODE_THEME.plain }}>
        {line.slice(last)}
      </span>,
    );
  }
  return <>{nodes.length ? nodes : " "}</>;
}

const CODE_DEMOS = {
  Python: {
    file: "capture.py",
    lang: "python",
    code: `import webforge

# Capture one page across desktop, tablet & mobile
result = webforge.capture("anthropic.com")

print(result.colors)   # ['#f0eee6', '#141413', ...]
print(result.fonts)    # ['Anthropic Sans', ...]
print(result.images)   # image URLs + inline data-URIs

# Crawl the whole domain, then save screenshots + tokens
site = webforge.crawl("anthropic.com", max_pages=10)
site.to_zip("anthropic.zip")`,
  },
  Node: {
    file: "capture.js",
    lang: "javascript",
    code: `import { capture, crawl } from "webforge-theatom";

// Capture one page across desktop, tablet & mobile
const result = await capture("anthropic.com");

console.log(result.colors);   // ['#f0eee6', '#141413', ...]
console.log(result.fonts);    // ['Anthropic Sans', ...]
console.log(result.images);   // image URLs + inline data-URIs

// Crawl the whole domain, then save screenshots + tokens
const site = await crawl("anthropic.com", { maxPages: 10 });
await site.toZip("anthropic.zip");`,
  },
} as const;

function CodeDemo() {
  const tabs = Object.keys(CODE_DEMOS) as (keyof typeof CODE_DEMOS)[];
  const [active, setActive] = useState<keyof typeof CODE_DEMOS>("Python");
  const [copied, setCopied] = useState(false);
  const demo = CODE_DEMOS[active];
  const lines = demo.code.split("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(demo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div
      style={{
        marginTop: "40px",
        borderRadius: "14px",
        overflow: "hidden",
        border: `1px solid ${CODE_THEME.border}`,
        background: CODE_THEME.bg,
        boxShadow: "0 24px 60px -30px rgba(0, 0, 0, 0.55)",
        textAlign: "left",
      }}
    >
      {/* Window / tab bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          background: CODE_THEME.bar,
          borderBottom: `1px solid ${CODE_THEME.border}`,
          padding: "0 14px",
          height: "44px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span
              key={c}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: "4px", marginLeft: "4px" }}>
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setActive(t);
                setCopied(false);
              }}
              style={{
                border: "none",
                cursor: "pointer",
                background: active === t ? CODE_THEME.bg : "transparent",
                color: active === t ? "#e8e6df" : "#8a8a8a",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: 500,
                padding: "6px 14px",
                borderRadius: "8px 8px 0 0",
              }}
            >
              {CODE_DEMOS[t].file}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          style={{
            marginLeft: "auto",
            border: `1px solid ${CODE_THEME.border}`,
            background: copied ? "var(--accent-color)" : "transparent",
            color: "#c9c9c9",
            borderRadius: "7px",
            padding: "5px 12px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code body */}
      <pre
        style={{
          margin: 0,
          padding: "20px 22px",
          overflowX: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: "16px",
          lineHeight: 1.7,
          tabSize: 2,
        }}
      >
        <code style={{ fontFamily: "inherit" }}>
          {lines.map((line, idx) => (
            <div key={idx} style={{ display: "flex" }}>
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: "2.2em",
                  flexShrink: 0,
                  textAlign: "right",
                  paddingRight: "1.2em",
                  color: CODE_THEME.gutter,
                  userSelect: "none",
                }}
              >
                {idx + 1}
              </span>
              <span style={{ whiteSpace: "pre" }}>
                <HighlightedLine line={line} />
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function CommandBlock({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <pre
        style={{
          background: "#191919",
          color: "#e8e6df",
          borderRadius: "10px",
          padding: "14px 56px 14px 16px",
          overflowX: "auto",
          fontSize: "13px",
          lineHeight: 1.5,
          margin: 0,
          fontFamily: "var(--font-mono)",
        }}
      >
        <code style={{ fontFamily: "inherit" }}>{cmd}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy command"}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          background: copied
            ? "var(--accent-color)"
            : "rgba(255, 255, 255, 0.08)",
          color: "#e8e6df",
          borderRadius: "7px",
          padding: "5px 10px",
          fontSize: "11px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.15s ease",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when the modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
    }, 260);
  };

  // Coming-soon CTA: open the modal instead of navigating away.
  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal();
  };

  // Reveal sections smoothly as they scroll into view
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Anthropic-style scroll expansion: the banner widens left & right as it
  // scrolls up into view, driven by a 0→1 --expand CSS variable.
  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = banner.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh; // top touching viewport bottom → collapsed
      const end = vh * 0.35; // top near upper third → fully expanded
      const p = (start - rect.top) / (start - end);
      banner.style.setProperty("--expand", Math.max(0, Math.min(1, p)).toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Navigation Header */}
      <div className="navbar-container">
        <nav className="navbar">
          {/* Logo styled similar to A\ */}
          <div
            className="nav-brand"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <img
              src="/Logo-WebForge.png"
              alt="WebForge Logo"
              style={{ width: "44px", height: "44px", borderRadius: "4px" }}
            />
            <span className="nav-brand-text" style={{ fontWeight: 700, letterSpacing: "-0.5px" }}>
              WebForge
            </span>
          </div>

          {/* Navigation Menu */}
          <ul className="nav-menu-desktop">
            <li>
              <a
                href="https://buymeacoffee.com/theoneatom"
                target="_blank"
                rel="noreferrer"
              >
                Buy Me a Coffee
              </a>
            </li>
            <li>
              <a
                href={REPO_URL}
                onClick={(e) => handleComingSoon(e)}
                className="btn-nav-split"
              >
                Install Extension
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">
          Turn any website into an <span>AI-ready visual blueprint</span>
        </h1>
      </header>

      {/* Coming-soon modal */}
      {(isModalOpen || isModalClosing) && (
        <div
          className={`modal-scrim ${isModalClosing ? "closing" : ""}`}
          onClick={closeModal}
        >
          <div
            className={`modal-card ${isModalClosing ? "closing" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Extension coming soon"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            </button>
            <h3 className="modal-title">The WebForge extension is launching soon</h3>
            <p className="modal-text">
              It isn’t on the Chrome Web Store just yet. Meanwhile, try the live
              capture tool on this page, or explore the full source code on
              GitHub.
            </p>
            <div className="modal-actions">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="modal-btn-primary"
              >
                View full code on GitHub
              </a>
              <button className="modal-btn-secondary" onClick={closeModal}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live capture tool — single-page taste of the extension */}
      <CaptureTool />

      {/* Packages — install via pip / npm */}
      <section
        id="packages"
        className="reveal"
        style={{
          paddingTop: "60px",
          marginTop: "60px",
          paddingBottom: "80px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "0 20px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1.9rem, 4.5vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              color: "var(--text-primary)",
              marginBottom: "12px",
            }}
          >
            Prefer code? Install the package.
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: "580px",
              margin: "0 auto 34px",
              lineHeight: 1.6,
            }}
          >
            The same capture engine as a library and CLI for your scripts,
            notebooks, and AI agent pipelines. One consistent API for both
            Python and Node.
          </p>
          <div
            style={{
              display: "grid",
              gap: "28px",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {[
              {
                label: "Python",
                cmd: "pip install webforge-theatom",
                href: "https://pypi.org/project/webforge-theatom/",
                link: "PyPI",
              },
              {
                label: "Node",
                cmd: "npm install webforge-theatom",
                href: "https://www.npmjs.com/package/webforge-theatom",
                link: "npm",
              },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "14px",
                  padding: "22px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <strong style={{ color: "var(--text-primary)" }}>
                    {p.label}
                  </strong>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "var(--accent-color)",
                      fontSize: "13px",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {p.link} ↗
                  </a>
                </div>
                <CommandBlock cmd={p.cmd} />
              </div>
            ))}
          </div>

          {/* Live code demo — same API in Python & Node */}
          <CodeDemo />
        </div>
      </section>

      {/* About WebForge — what it is, what it does, who it's for */}
      <section id="about" className="list-section reveal">
        <div className="list-section-left">
          <h3>A visual translator between live websites and AI coding agents.</h3>
        </div>
        <div className="about-body">
          <p className="about-lead">
            WebForge captures any website as an AI-ready visual blueprint: full
            page screenshots across desktop, tablet and mobile, an area-weighted
            colour palette, the fonts actually rendered, image assets, and a
            crawled sitemap. Instead of describing a design to your agent, you
            hand it the source of truth so it can rebuild the frontend without
            drift.
          </p>
          <p className="about-lead">
            It ships three ways from one capture engine: a free online tool on
            this page, a Chrome extension for full domain crawls, and the{" "}
            <code className="about-code">webforge-theatom</code> packages on
            PyPI and npm for scripts, notebooks and agent pipelines.
          </p>

          <div className="about-cards">
            {[
              {
                t: "What it does",
                d: "Turns a URL into a structured package of multi-viewport screenshots plus JSON design tokens: colours, fonts, images and sitemap.",
              },
              {
                t: "Who it's for",
                d: "Developers rebuilding, refactoring or studying sites with Claude Code, Cursor, Windsurf, Copilot, ChatGPT or Gemini.",
              },
              {
                t: "Why it's different",
                d: "Not one flat screenshot. Real breakpoints, exact hex values and full-domain context an agent can actually build against.",
              },
            ].map((c) => (
              <div key={c.t} className="about-card">
                <h4>{c.t}</h4>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Output Package Structure Visualizer */}
      <section
        id="structure"
        className="list-section reveal"
        style={{
          paddingTop: "60px",
        }}
      >
        <div className="list-section-left">
          <h3>Generated Output Package Structure</h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginTop: "12px",
              lineHeight: "1.6",
            }}
          >
            Every capture complies with the WebForge context specification. It
            packages visual layouts alongside structural tokens so AI agents can
            reconstruct frontend code with high precision.
          </p>
        </div>
        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: "8px",
            padding: "24px 32px",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            lineHeight: "1.7",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              color: "var(--accent-color)",
              fontWeight: 600,
              marginBottom: "10px",
            }}
          >
            WebForge_Project/
          </div>
          <div style={{ paddingLeft: "20px" }}>├── pages/</div>
          <div style={{ paddingLeft: "40px" }}>├── home/</div>
          <div style={{ paddingLeft: "60px", color: "var(--text-secondary)" }}>
            ├── desktop.png{" "}
            <span style={{ opacity: 0.5 }}>(1440x900 full page)</span>
          </div>
          <div style={{ paddingLeft: "60px", color: "var(--text-secondary)" }}>
            ├── tablet.png{" "}
            <span style={{ opacity: 0.5 }}>(768x1024 full page)</span>
          </div>
          <div style={{ paddingLeft: "60px", color: "var(--text-secondary)" }}>
            └── mobile.png{" "}
            <span style={{ opacity: 0.5 }}>(390x844 full page)</span>
          </div>
          <div style={{ paddingLeft: "40px" }}>└── about/</div>
          <div style={{ paddingLeft: "60px", color: "var(--text-secondary)" }}>
            ├── desktop.png
          </div>
          <div style={{ paddingLeft: "60px", color: "var(--text-secondary)" }}>
            └── metadata.json
          </div>
          <div style={{ paddingLeft: "20px" }}>
            ├── sitemap.json{" "}
            <span style={{ opacity: 0.5 }}>(Discovered domain tree)</span>
          </div>
          <div style={{ paddingLeft: "20px" }}>
            └── metadata.json{" "}
            <span style={{ opacity: 0.5 }}>
              (Global colors, fonts & timestamps)
            </span>
          </div>
        </div>
      </section>

      {/* How It Works — numbered capture pipeline */}
      <section id="features" className="list-section reveal">
        <div className="list-section-left">
          <h3>From a live URL to an AI-ready blueprint in four steps.</h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginTop: "12px",
              lineHeight: "1.6",
            }}
          >
            Every capture runs the same pipeline, whether you use the online
            tool, the extension, or the Python and Node packages.
          </p>
        </div>
        <ol className="how-steps">
          {[
            {
              n: "01",
              t: "Point it at a URL",
              d: "Paste a link into the online tool, open the extension on any tab, or call capture() from your script. No scheme needed, and an http fallback is built in.",
            },
            {
              n: "02",
              t: "Capture every viewport",
              d: "WebForge scrolls the full page past lazy-loaded content, hides sticky headers, and stitches high-fidelity screenshots at desktop (1440), tablet (768) and mobile (390).",
            },
            {
              n: "03",
              t: "Extract the design tokens",
              d: "It harvests an area-weighted colour palette as exact hex values, the fonts actually rendered, and image assets: the facts a vision model cannot read off a picture.",
            },
            {
              n: "04",
              t: "Export the package",
              d: "Screenshots, per-page metadata, a global token file and a crawled sitemap.json are bundled into a clean ZIP, ready to hand to your AI coding agent.",
            },
          ].map((s) => (
            <li key={s.n} className="how-step">
              <span className="how-step-n">{s.n}</span>
              <div>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* What It Does — capability grid */}
      <section className="list-section reveal">
        <div className="list-section-left">
          <h3>Everything an agent needs to rebuild a site.</h3>
        </div>
        <div className="what-grid">
          {[
            {
              t: "Multi-viewport capture",
              d: "Authentic desktop, tablet and mobile renders at real CSS breakpoints, not one arbitrary width.",
            },
            {
              t: "Full-page stitching",
              d: "Scrolls lazy-loaded content and hides fixed overlays for a seamless top-to-bottom screenshot.",
            },
            {
              t: "Design-token extraction",
              d: "Area-weighted colour palette in exact hex, plus the prominence-ordered font stack.",
            },
            {
              t: "Domain crawler",
              d: "Discovers and captures same-domain pages sequentially into a structured sitemap.",
            },
            {
              t: "Structured export",
              d: "A tidy ZIP of screenshots plus JSON metadata, designed for AI file tools, not just eyeballs.",
            },
            {
              t: "Library and CLI",
              d: "Same API on PyPI and npm for notebooks, scripts and agent pipelines.",
            },
          ].map((c) => (
            <div key={c.t} className="what-card">
              <h4>{c.t}</h4>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section — mirrors FAQPage JSON-LD for AEO / answer engines */}
      <section
        id="faq"
        className="list-section reveal"
        style={{
          paddingTop: "60px",
        }}
      >
        <div className="list-section-left">
          <h3>Frequently Asked Questions</h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginTop: "12px",
              lineHeight: "1.6",
            }}
          >
            Everything you need to know about capturing websites with WebForge
            for AI coding workflows.
          </p>
        </div>
        <div
          className="faq-list"
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          {[
            {
              q: "What is WebForge?",
              a: "WebForge is a free Chrome extension that captures any website into an AI-ready visual blueprint. It stitches full-page screenshots across desktop, tablet and mobile viewports, crawls same-domain pages, and extracts CSS design tokens, fonts and colors so AI coding agents can rebuild the layout accurately.",
            },
            {
              q: "Is WebForge free?",
              a: "Yes. WebForge is completely free to install and use. You can download it from GitHub and support development through Buy Me a Coffee.",
            },
            {
              q: "Which AI tools does WebForge work with?",
              a: "WebForge output is optimized for Claude Code, Cursor, Windsurf, GitHub Copilot, ChatGPT, Gemini, Lovable, Bolt.new, v0 and any AI coding workflow that accepts screenshots and design-token context.",
            },
            {
              q: "How is WebForge different from GoFullPage or a normal screenshot tool?",
              a: "Unlike a plain screenshot extension, WebForge captures multiple viewports, crawls the whole domain, and exports a structured package containing screenshots plus JSON metadata of colors, fonts and sitemap: everything an AI agent needs to reconstruct the frontend code.",
            },
            {
              q: "What does the exported WebForge package contain?",
              a: "Each export is a ZIP containing a pages/ folder with desktop.png, tablet.png and mobile.png per page, a per-page metadata.json (title, URL, fonts, colors), a global metadata.json with combined design tokens and timestamps, and a sitemap.json of the discovered domain tree.",
            },
            {
              q: "Can I try WebForge without installing the extension?",
              a: "Yes. The WebForge website has a free online capture tool. Paste any website URL and it instantly returns multi-viewport full-page screenshots (desktop, tablet, mobile) plus extracted colors, fonts and images, downloadable as a ZIP. The online tool captures a single page; installing the extension unlocks full-domain crawling, login and bot-protected pages, and pixel-perfect fidelity.",
            },
            {
              q: "Is there a Python or Node package?",
              a: "Yes. The same capture engine ships as webforge-theatom on both PyPI (pip install webforge-theatom) and npm (npm install webforge-theatom), with an identical capture() and crawl() API plus a webforge CLI, ideal for scripts, notebooks and AI agent pipelines.",
            },
            {
              q: "How does WebForge help AI coding agents rebuild sites accurately?",
              a: "Vision models are good at layout and poor at precision. WebForge pairs real multi-viewport screenshots with machine-readable design tokens (exact hex colours and the real font stack) so the agent reasons about layout from the image and pulls exact values from the metadata, eliminating colour drift and font guessing.",
            },
            {
              q: "Does WebForge store or send my captured data anywhere?",
              a: "No. The extension and packages run captures locally in your own browser or environment and export a ZIP to your machine. The free online tool captures a single page on-demand and returns the ZIP to you without retaining it.",
            },
          ].map((item) => (
            <details
              key={item.q}
              style={{
                borderBottom: "1px solid var(--border-color)",
                padding: "20px 0",
              }}
            >
              <summary
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                  listStyle: "none",
                }}
              >
                {item.q}
              </summary>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  marginTop: "12px",
                  lineHeight: "1.7",
                }}
              >
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* From the blog — links to /blog articles for SEO + engagement */}
      <section id="blog" className="list-section reveal">
        <div className="list-section-left">
          <h3>Guides for capturing the web for AI.</h3>
          <a
            href="/blog"
            className="blog-teaser-all"
            style={{ display: "inline-block", marginTop: "16px" }}
          >
            All posts →
          </a>
        </div>
        <div className="blog-teaser-grid">
          {[...POSTS]
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .slice(0, 3)
            .map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="blog-teaser-card"
              >
                <div className="blog-teaser-meta">
                  {post.readingMinutes} min read
                </div>
                <h4>{post.title}</h4>
                <p>{post.description}</p>
                <span className="blog-card-cta">Read post →</span>
              </a>
            ))}
        </div>
      </section>

      {/* Main Banner Container — expands left & right on scroll */}
      <section ref={bannerRef} className="banner-container reveal">
        <div className="dark-banner">
          <h2 className="banner-title">
            Get WebForge Extension.
          </h2>
          <a
            href={REPO_URL}
            onClick={(e) => handleComingSoon(e)}
            className="btn-banner"
          >
            Install WebForge Extension
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section reveal">
        <div className="contact-head">
          <h3 className="contact-title">Let’s connect</h3>
          <p className="contact-sub">
            Found a bug, want to partner, or just have a question? I read every
            message that lands at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="contact-inline-link">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>

        <div className="contact-grid">
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              "WebForge · Bug report",
            )}`}
            className="contact-card"
          >
            <h4>Report a bug</h4>
            <p>
              Something broke or a capture came out wrong? Send the details and
              I’ll get it fixed.
            </p>
          </a>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              "WebForge · Partnership",
            )}`}
            className="contact-card"
          >
            <h4>Partnerships & collabs</h4>
            <p>
              Building something WebForge could plug into, or want to work
              together? Let’s talk.
            </p>
          </a>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              "WebForge · General enquiry",
            )}`}
            className="contact-card"
          >
            <h4>Everything else</h4>
            <p>
              Feedback, feature ideas, press, or a plain hello. The inbox is
              always open.
            </p>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer reveal">
        <div className="footer-inner">
          <div
            className="footer-logo"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <img
              src="/Logo-WebForge.png"
              alt="WebForge Logo"
              style={{ width: "44px", height: "44px", borderRadius: "4px" }}
            />
            <span style={{ fontWeight: 700, letterSpacing: "-0.5px" }}>
              WebForge
            </span>
          </div>

          <div className="footer-col">
            <h5>Product</h5>
            <ul className="footer-links">
              <li>
                <a
                  href="https://github.com/zakisheriff/WebForge"
                  target="_blank"
                  rel="noreferrer"
                >
                  Chrome Extension
                </a>
              </li>
              <li>
                <a href="#structure">Blueprint Schema</a>
              </li>
              <li>
                <a href="#about">About WebForge</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a
                  href="https://pypi.org/project/webforge-theatom/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Python (PyPI)
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/webforge-theatom"
                  target="_blank"
                  rel="noreferrer"
                >
                  Node (npm)
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/zakisheriff/WebForge/releases"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub Releases
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Creator</h5>
            <ul className="footer-links">
              <li>
                <a
                  href="https://github.com/zakisheriff"
                  target="_blank"
                  rel="noreferrer"
                >
                  Developer Profile
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>Contact Support</a>
              </li>
              <li>
                <a
                  href="https://buymeacoffee.com/theoneatom"
                  target="_blank"
                  rel="noreferrer"
                >
                  Buy Me a Coffee
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2026 WebForge by The Atom.</div>
          <div className="social-links">
            <a
              href="https://github.com/zakisheriff"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
