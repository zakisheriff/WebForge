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
          <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/Logo-WebForge.png" alt="WebForge Logo" style={{ width: '22px', height: '22px', borderRadius: '4px' }} />
            <span style={{ fontWeight: 700, letterSpacing: '-0.5px' }}>WEBF\RGE</span> 
            <span style={{ fontSize: '11px', opacity: 0.6, fontWeight: 'normal', textTransform: 'none', letterSpacing: 'normal' }}>
              by The Atom
            </span>
          </div>
          
          {/* Desktop Menu */}
          <ul className="nav-menu-desktop">
            <li><a href="#features">How It Works</a></li>
            <li><a href="#structure">Blueprint Structure</a></li>
            <li><a href="https://github.com/zakisheriff/WebForge/releases" target="_blank" rel="noreferrer">Releases</a></li>
            <li><a href="https://buymeacoffee.com/theoneatom" target="_blank" rel="noreferrer">Buy Me a Coffee</a></li>
            <li>
              <a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-nav-split">
                Install WebForge
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
              <li><a href="https://buymeacoffee.com/theoneatom" target="_blank" rel="noreferrer" onClick={closeMenu}>Buy Me a Coffee</a></li>
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

          <h2 className="banner-title">WebForge is built on clear structure.</h2>
          <a href="https://github.com/zakisheriff/WebForge" target="_blank" rel="noreferrer" className="btn-banner">
            Get Chrome Extension
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
          <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/Logo-WebForge.png" alt="WebForge Logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
            <span style={{ fontWeight: 700, letterSpacing: '-0.5px' }}>WEBF\RGE</span>
          </div>
          
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
              <li><a href="https://buymeacoffee.com/theoneatom" target="_blank" rel="noreferrer">Buy Me a Coffee</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2026 WebForge by The Atom. Created by Zaki Sheriff.</div>
          <div className="social-links">
            <a href="https://github.com/zakisheriff" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
