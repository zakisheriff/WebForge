"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);

  // Prevent background scrolling when menu drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
    }, 300); // Matches CSS slideUp animation duration
  };

  const handleLinkClick = (hash: string) => {
    closeMenu();
    // Smooth scroll to target anchor
    const el = document.getElementById(hash.replace("#", ""));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleHomeClick = () => {
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <span style={{ fontWeight: 700, letterSpacing: "-0.5px" }}>
              WebForge
            </span>
          </div>

          {/* Desktop Menu */}
          <ul className="nav-menu-desktop">
            <li>
              <a href="#features">How It Works</a>
            </li>
            <li>
              <a href="#structure">Blueprint Structure</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <li>
              <a
                href="https://github.com/zakisheriff/WebForge/releases"
                target="_blank"
                rel="noreferrer"
              >
                Releases
              </a>
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
            <li>
              <a
                href="https://github.com/zakisheriff/WebForge"
                target="_blank"
                rel="noreferrer"
                className="btn-nav-split"
              >
                Install WebForge Extension
              </a>
            </li>
          </ul>

          {/* Mobile Menu Toggle Button */}
          <button
            className={`hamburger-btn ${isMenuOpen ? "is-open" : ""}`}
            onClick={() => (isMenuOpen ? closeMenu() : setIsMenuOpen(true))}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>

      {/* Mobile floating menu card (morphs out of the hamburger) */}
      {(isMenuOpen || isMenuClosing) && (
        <>
          <div
            className={`menu-scrim ${isMenuClosing ? "closing" : ""}`}
            onClick={closeMenu}
          ></div>
          <div
            className={`menu-card ${isMenuClosing ? "closing" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <button
              className="menu-card-close"
              onClick={closeMenu}
              aria-label="Close menu"
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
            <nav className="menu-card-links">
              <a className="active" href="#top" onClick={handleHomeClick}>
                Home
              </a>
              <a href="#features" onClick={() => handleLinkClick("#features")}>
                How It Works
              </a>
              <a href="#structure" onClick={() => handleLinkClick("#structure")}>
                Blueprint Structure
              </a>
              <a href="#faq" onClick={() => handleLinkClick("#faq")}>
                FAQ
              </a>
              <a
                href="https://github.com/zakisheriff/WebForge/releases"
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
              >
                Releases
              </a>
              <a
                href="https://buymeacoffee.com/theoneatom"
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
              >
                Buy Me a Coffee
              </a>
            </nav>
            <a
              href="https://github.com/zakisheriff/WebForge"
              target="_blank"
              rel="noreferrer"
              className="menu-card-cta"
              onClick={closeMenu}
            >
              Install WebForge Extension
            </a>
          </div>
        </>
      )}

      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">
          Web capture and <span>visual blueprints</span> that put clarity in AI
          context
        </h1>
        <div className="hero-desc">
          AI agents require clear visual references to recreate frontend layouts
          accurately. WebForge scrolls, resizes, and compiles any page into a
          structured, code-ready design specification package.
        </div>
      </header>

      {/* Main Banner Container */}
      <section className="banner-container">
        <div className="dark-banner">
          <h2 className="banner-title">
            Get WebForge Extension.
          </h2>
          <a
            href="https://github.com/zakisheriff/WebForge"
            target="_blank"
            rel="noreferrer"
            className="btn-banner"
          >
            Install WebForge Extension
          </a>
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
                <a href="mailto:zaki@theoneatom.com">Contact Support</a>
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
          <div>&copy; 2026 WebForge by The Atom. Created by Zaki Sheriff.</div>
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
