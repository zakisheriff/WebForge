import React from 'react';

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">WebForge</div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#blueprints">Blueprints</a></li>
          <li><a href="#releases">Releases</a></li>
          <li><a href="#docs">Documentation</a></li>
          <li><a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-nav-primary">Install WebForge</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">
          Web capture and <span>visual blueprints</span> that put clarity in AI context
        </h1>
        <div className="hero-desc">
          AI agents require clear visual references to recreate frontend layouts accurately. WebForge scrolls, resizes, and compiles any page into a structured, code-ready design specification package.
        </div>
      </header>

      {/* Main Banner Container */}
      <section className="banner-container">
        <div className="dark-banner">
          <h2 className="banner-title">WebForge is built on clear structure.</h2>
          <a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-banner">
            Get Chrome Extension <span>&rarr;</span>
          </a>

          <div className="banner-footer">
            <div className="banner-footer-item">
              <h4>Incremental Stitching</h4>
              <p>Hides scrollbars, scroll-triggers lazy elements, and removes sticky duplication.</p>
            </div>
            <div className="banner-footer-item">
              <h4>Viewport Emulation</h4>
              <p>Resizes the tab window to capture authentic CSS media queries across devices.</p>
            </div>
            <div className="banner-footer-item">
              <h4>Domain Crawling</h4>
              <p>Traverses page hierarchies to compile sitemaps and visual indexes instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Releases Section */}
      <section id="releases" className="releases-section">
        <div className="section-label">Latest releases</div>
        <div className="cards-grid">
          {/* Card 1 */}
          <div className="card">
            <div>
              <h3 className="card-title">Introducing WebForge 1.0</h3>
              <p className="card-body">
                The complete visual capture and blueprint generation extension is now live. Build high-fidelity PNG packages, design tokens, and sitemaps instantly.
              </p>
            </div>
            <div>
              <div className="card-metadata">
                <div className="card-meta-item">
                  Date
                  <span>July 11, 2026</span>
                </div>
                <div className="card-meta-item">
                  Category
                  <span>Announcements</span>
                </div>
              </div>
              <a href="#releases" className="btn-card">Read announcement &rarr;</a>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card">
            <div>
              <h3 className="card-title">Visual Layout Stitcher</h3>
              <p className="card-body">
                Stitch multiple screenshot viewports into a single clean blueprint. Handles lazy loaded elements and removes duplication from fixed positioning.
              </p>
            </div>
            <div>
              <div className="card-metadata">
                <div className="card-meta-item">
                  Date
                  <span>July 08, 2026</span>
                </div>
                <div className="card-meta-item">
                  Category
                  <span>Core Engine</span>
                </div>
              </div>
              <a href="#releases" className="btn-card">Explore features &rarr;</a>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card">
            <div>
              <h3 className="card-title">Design Token Extraction</h3>
              <p className="card-body">
                Extract active fonts and color palettes dynamically. Feed them straight to coding agents to ensure high-fidelity layouts without CSS drift.
              </p>
            </div>
            <div>
              <div className="card-metadata">
                <div className="card-meta-item">
                  Date
                  <span>July 05, 2026</span>
                </div>
                <div className="card-meta-item">
                  Category
                  <span>AI Blueprints</span>
                </div>
              </div>
              <a href="#releases" className="btn-card">View guide &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* List / Publications Section */}
      <section id="features" className="list-section">
        <div className="list-section-left">
          <h3>At WebForge, we build tools to serve AI-driven development.</h3>
        </div>
        <div className="list-container">
          <div className="list-item">
            <span className="list-item-title">Core Views on AI Contexts</span>
            <span className="list-item-tag">Announcements</span>
          </div>
          <div className="list-item">
            <span className="list-item-title">Structure and Sitemap Indexing</span>
            <span className="list-item-tag">Technical Specs</span>
          </div>
          <div className="list-item">
            <span className="list-item-title">Window Dimension Resizing Policy</span>
            <span className="list-item-tag">Documentation</span>
          </div>
          <div className="list-item">
            <span className="list-item-title">JSON Metadata Schemas</span>
            <span className="list-item-tag">AI Input Specifications</span>
          </div>
          <div className="list-item">
            <span className="list-item-title">WebForge Constitution</span>
            <span className="list-item-tag">Principles</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">WebForge</div>
          
          <div className="footer-col">
            <h5>Products</h5>
            <ul className="footer-links">
              <li><a href="#features">Chrome Extension</a></li>
              <li><a href="#blueprints">Blueprint Schema</a></li>
              <li><a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer">GitHub Release</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Developer Tools</h5>
            <ul className="footer-links">
              <li><a href="#features">Zip Exporter</a></li>
              <li><a href="#features">Token Extractor</a></li>
              <li><a href="#features">Crawl Sandbox</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Documentation</h5>
            <ul className="footer-links">
              <li><a href="#docs">API Guide</a></li>
              <li><a href="#docs">Host Permissions</a></li>
              <li><a href="#docs">AEO Guidelines</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Company</h5>
            <ul className="footer-links">
              <li><a href="https://github.com/zakisheriff" target="_blank" rel="noreferrer">Developer Profile</a></li>
              <li><a href="mailto:zaki@theoneatom.com">Contact Sales</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2026 WebForge. All rights reserved.</div>
          <div className="social-links">
            <a href="https://github.com/zakisheriff" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    </>
  );
}
