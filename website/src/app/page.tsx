"use client";

import React, { useState, useEffect, useRef } from "react";
import CaptureTool from "./CaptureTool";

const REPO_URL = "https://github.com/zakisheriff/WebForge";
const CONTACT_EMAIL = "connect.theatom@gmail.com";

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
          Web capture and <span>visual blueprints</span> that put clarity in AI
          context
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
          borderTop: "1px solid var(--border-color)",
          paddingTop: "60px",
          marginTop: "60px",
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
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              color: "var(--text-primary)",
              marginBottom: "10px",
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
            The same capture engine as a library + CLI for your scripts,
            notebooks, and AI agent pipelines — same API for Python and Node.
          </p>
          <div
            style={{
              display: "grid",
              gap: "18px",
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
                <pre
                  style={{
                    background: "#191919",
                    color: "#e8e6df",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    overflowX: "auto",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  <code>{p.cmd}</code>
                </pre>
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
          borderTop: "1px solid var(--border-color)",
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

      {/* How It Works List Section */}
      <section
        id="features"
        className="list-section reveal"
        style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "60px",
        }}
      >
        <div className="list-section-left">
          <h3>At WebForge, we build tools to serve AI-driven development.</h3>
        </div>
        <div
          className="list-container"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div
            className="list-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: "1px solid var(--border-color)",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 500 }}>
              Core Views on AI Contexts
            </span>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--text-secondary)",
              }}
            >
              Workflow
            </span>
          </div>
          <div
            className="list-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 500 }}>
              Structure and Sitemap Indexing
            </span>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--text-secondary)",
              }}
            >
              Technical Specs
            </span>
          </div>
          <div
            className="list-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 500 }}>
              Window Dimension Resizing Policy
            </span>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--text-secondary)",
              }}
            >
              Documentation
            </span>
          </div>
          <div
            className="list-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 0",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 500 }}>
              JSON Metadata Schemas
            </span>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--text-secondary)",
              }}
            >
              AI Input Specs
            </span>
          </div>
        </div>
      </section>

      {/* FAQ Section — mirrors FAQPage JSON-LD for AEO / answer engines */}
      <section
        id="faq"
        className="list-section reveal"
        style={{
          borderTop: "1px solid var(--border-color)",
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
              a: "Unlike a plain screenshot extension, WebForge captures multiple viewports, crawls the whole domain, and exports a structured package containing screenshots plus JSON metadata of colors, fonts and sitemap — everything an AI agent needs to reconstruct the frontend code.",
            },
            {
              q: "What does the exported WebForge package contain?",
              a: "Each export is a ZIP containing a pages/ folder with desktop.png, tablet.png and mobile.png per page, a per-page metadata.json (title, URL, fonts, colors), a global metadata.json with combined design tokens and timestamps, and a sitemap.json of the discovered domain tree.",
            },
            {
              q: "Can I try WebForge without installing the extension?",
              a: "Yes. The WebForge website has a free online capture tool — paste any website URL and it instantly returns multi-viewport full-page screenshots (desktop, tablet, mobile) plus extracted colors, fonts and images, downloadable as a ZIP. The online tool captures a single page; installing the extension unlocks full-domain crawling, login and bot-protected pages, and pixel-perfect fidelity.",
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
