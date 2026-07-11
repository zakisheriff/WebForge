import React from 'react';

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">WebForge</div>
        <ul className="nav-links">
          <li><a href="#features">How It Works</a></li>
          <li><a href="#structure">Blueprint Structure</a></li>
          <li><a href="#releases">Releases</a></li>
          <li><a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-nav-primary">Get Extension</a></li>
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
              <a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-card">Get WebForge &rarr;</a>
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
              <a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-card">Explore Code &rarr;</a>
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
              <a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-card">View guide &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiated Structure: Blueprint Output Explorer */}
      <section id="structure" className="list-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '60px' }}>
        <div className="list-section-left">
          <h3>Generated Output Package Structure</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
            Every capture complies with the WebForge context specification. It packages visual layouts alongside structural tokens so AI agents can reconstruct frontend code with high precision.
          </p>
        </div>
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '8px',
          padding: '24px 32px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: '1.7',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ color: 'var(--accent-color)', fontWeight: 600, marginBottom: '10px' }}>WebForge_Project/</div>
          <div style={{ paddingLeft: '20px' }}>├── pages/</div>
          <div style={{ paddingLeft: '40px' }}>├── home/</div>
          <div style={{ paddingLeft: '60px', color: 'var(--text-secondary)' }}>├── desktop.png <span style={{ opacity: 0.5 }}>(1440x900 full page)</span></div>
          <div style={{ paddingLeft: '60px', color: 'var(--text-secondary)' }}>├── tablet.png <span style={{ opacity: 0.5 }}>(768x1024 full page)</span></div>
          <div style={{ paddingLeft: '60px', color: 'var(--text-secondary)' }}>└── mobile.png <span style={{ opacity: 0.5 }}>(390x844 full page)</span></div>
          <div style={{ paddingLeft: '40px' }}>└── about/</div>
          <div style={{ paddingLeft: '60px', color: 'var(--text-secondary)' }}>├── desktop.png</div>
          <div style={{ paddingLeft: '60px', color: 'var(--text-secondary)' }}>└── metadata.json</div>
          <div style={{ paddingLeft: '20px' }}>├── sitemap.json <span style={{ opacity: 0.5 }}>(Discovered domain tree)</span></div>
          <div style={{ paddingLeft: '20px' }}>└── metadata.json <span style={{ opacity: 0.5 }}>(Global colors, fonts & timestamps)</span></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">WebForge</div>
          
          <div className="footer-col">
            <h5>Product</h5>
            <ul className="footer-links">
              <li><a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer">Chrome Extension</a></li>
              <li><a href="#structure">Blueprint Schema</a></li>
              <li><a href="https://github.com/zakisheriff/WebForge/releases" target="_blank" rel="noreferrer">GitHub Releases</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Creator</h5>
            <ul className="footer-links">
              <li><a href="https://github.com/zakisheriff" target="_blank" rel="noreferrer">Developer Profile</a></li>
              <li><a href="mailto:zaki@theoneatom.com">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2026 WebForge. Created by Zaki Sheriff.</div>
          <div className="social-links">
            <a href="https://github.com/zakisheriff" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
