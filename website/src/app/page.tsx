'use client';

import React, { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Navigation Header */}
      <div className="navbar-container">
        <nav className="navbar">
          {/* Logo styled similar to A\ */}
          <div className="nav-brand">W\</div>
          
          {/* Desktop Menu */}
          <ul className="nav-menu-desktop">
            <li><a href="#features">How It Works</a></li>
            <li><a href="#structure">Blueprint Structure</a></li>
            <li><a href="https://github.com/zakisheriff/WebForge/releases" target="_blank" rel="noreferrer">Releases</a></li>
            <li>
              <a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-nav-split">
                Install WebForge <span>&or;</span>
              </a>
            </li>
          </ul>

          {/* Mobile Menu Toggle Button */}
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsMenuOpen(false)}></div>
          <div className="drawer-content">
            <div>
              <div className="drawer-header">
                <div className="nav-brand">W\</div>
                <button className="drawer-close-btn" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">&times;</button>
              </div>
              <ul className="drawer-links">
                <li><a href="#features" onClick={() => setIsMenuOpen(false)}>How It Works</a></li>
                <li><a href="#structure" onClick={() => setIsMenuOpen(false)}>Blueprint Structure</a></li>
                <li><a href="https://github.com/zakisheriff/WebForge/releases" target="_blank" rel="noreferrer" onClick={() => setIsMenuOpen(false)}>Releases</a></li>
              </ul>
            </div>
            
            <div className="drawer-footer">
              <a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-drawer-primary">
                Install WebForge
              </a>
              <a href="https://github.com/zakisheriff" target="_blank" rel="noreferrer" className="btn-drawer-secondary">
                Developer Profile
              </a>
            </div>
          </div>
        </>
      )}

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

      {/* Output Package Structure Visualizer */}
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
          border: '1px solid var(--border-color)',
          overflowX: 'auto'
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

      {/* How It Works List Section */}
      <section id="features" className="list-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '60px' }}>
        <div className="list-section-left">
          <h3>At WebForge, we build tools to serve AI-driven development.</h3>
        </div>
        <div className="list-container" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Core Views on AI Contexts</span>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Workflow</span>
          </div>
          <div className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Structure and Sitemap Indexing</span>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Technical Specs</span>
          </div>
          <div className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Window Dimension Resizing Policy</span>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Documentation</span>
          </div>
          <div className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '15px', fontWeight: 500 }}>JSON Metadata Schemas</span>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>AI Input Specs</span>
          </div>
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
