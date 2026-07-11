'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);

  // Prevent background scrolling when menu drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
    const el = document.getElementById(hash.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Navigation Header */}
      <div className="navbar-container">
        <nav className="navbar">
          {/* Logo styled similar to A\ */}
          <div className="nav-brand">WEBF\RGE</div>
          
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
      {(isMenuOpen || isMenuClosing) && (
        <>
          <div className={`drawer-overlay ${isMenuClosing ? 'closing' : ''}`} onClick={closeMenu}></div>
          <div className={`drawer-content ${isMenuClosing ? 'closing' : ''}`}>
            <div className="drawer-header">
              <div className="nav-brand">WEBF\RGE</div>
              <button className="drawer-close-btn" onClick={closeMenu} aria-label="Close menu">&times;</button>
            </div>
            <ul className="drawer-links" style={{ marginTop: 0 }}>
              <li><a href="#features" onClick={() => handleLinkClick('#features')}>How It Works</a></li>
              <li><a href="#structure" onClick={() => handleLinkClick('#structure')}>Blueprint Structure</a></li>
              <li><a href="https://github.com/zakisheriff/WebForge/releases" target="_blank" rel="noreferrer" onClick={closeMenu}>Releases</a></li>
            </ul>
            
            <div className="drawer-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
          {/* Network Graph Background Mock replicating Anthropic 1:1 */}
          <div className="network-graph">
            <svg className="graph-lines" xmlns="http://www.w3.org/2000/svg">
              <line x1="12%" y1="15%" x2="25%" y2="25%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="25%" y1="25%" x2="15%" y2="80%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="15%" y1="80%" x2="80%" y2="82%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="25%" y1="25%" x2="92%" y2="55%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="80%" y1="82%" x2="92%" y2="55%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="12%" y1="15%" x2="8%" y2="60%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <line x1="8%" y1="60%" x2="15%" y2="80%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            </svg>
            <div className="graph-node node-1">JSON Metadata</div>
            <div className="graph-node node-2">Stitched Chunks</div>
            <div className="graph-node node-3">Crawl Queue</div>
            <div className="graph-node node-4">CSS Variables</div>
            <div className="graph-node node-5">Font Families</div>
            <div className="graph-node node-6">Viewport Map</div>
          </div>

          <h2 className="banner-title">WebForge is built on clear structure.</h2>
          <p className="banner-subtext">
            Explore the architecture behind visual screenshot stitching, responsive device emulation, and automated domain tree mapping.
          </p>
          <a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-banner">
            Get Chrome Extension <span>&rarr;</span>
          </a>
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
          <div className="footer-logo">WEBF\RGE</div>
          
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
