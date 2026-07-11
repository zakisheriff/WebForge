import { useState, useEffect } from 'react';
import { Camera, Monitor, Compass, ExternalLink, Settings, ShieldAlert } from 'lucide-react';

export default function PopupView() {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [crawlDepth, setCrawlDepth] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        if (tab && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
          setActiveTab(tab);
        } else {
          setError('WebForge requires an active HTTP/HTTPS webpage to run.');
        }
      });
    }
  }, []);

  const openDashboard = (action: string, extraParams = '') => {
    if (!activeTab || !activeTab.url) return;
    const url = chrome.runtime.getURL(`index.html?mode=dashboard&action=${action}&targetTabId=${activeTab.id}&targetUrl=${encodeURIComponent(activeTab.url)}${extraParams}`);
    chrome.tabs.create({ url });
    window.close(); // Close extension popup
  };

  return (
    <div style={{
      width: '380px',
      padding: '20px',
      background: 'var(--bg-app)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>W</span>ebForge
          </h2>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>AI-Ready Website Capture Engine</p>
        </div>
        <button 
          onClick={() => openDashboard('view')}
          className="button"
          style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Workspace <ExternalLink size={12} />
        </button>
      </div>

      {error ? (
        <div className="card" style={{ display: 'flex', gap: '10px', alignItems: 'start', borderColor: '#e0b3b3', background: 'rgba(224,179,179,0.1)' }}>
          <ShieldAlert size={18} style={{ color: '#c0392b', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{error}</div>
        </div>
      ) : (
        <>
          {/* Active site banner */}
          <div className="card" style={{ padding: '10px 12px', background: 'var(--bg-card)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Website</div>
            <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--accent-color)' }}>
              {activeTab ? new URL(activeTab.url!).hostname : 'Detecting page...'}
            </div>
          </div>

          {/* Action List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="button button-primary" 
              style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
              onClick={() => openDashboard('capture')}
            >
              <Camera size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Capture Current Page</div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>Full-page screenshot capture</div>
              </div>
            </button>

            <button 
              className="button" 
              style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
              onClick={() => openDashboard('responsive')}
            >
              <Monitor size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Capture Responsive</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Desktop, Tablet, Mobile viewports</div>
              </div>
            </button>

            <div className="card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="button" 
                style={{ justifyContent: 'flex-start', padding: '8px 12px', width: '100%' }}
                onClick={() => openDashboard('crawl', `&depth=${crawlDepth}`)}
              >
                <Compass size={16} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Crawl & Capture Website</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Follow local sitemap links</div>
                </div>
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Crawl Depth:</span>
                <select 
                  value={crawlDepth} 
                  onChange={(e) => setCrawlDepth(Number(e.target.value))}
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value={1}>1 page</option>
                  <option value={5}>5 pages</option>
                  <option value={10}>10 pages</option>
                  <option value={20}>20 pages (Max)</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Settings size={12} /> WebForge v1.0.0</span>
        <span>Developer Tool</span>
      </div>
    </div>
  );
}
