import { useState, useEffect } from 'react';
import { 
  Download, Loader2, Monitor, Tablet, Smartphone, 
  Type, Palette, ExternalLink, FileText, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { generateProjectZip } from '../utils/zipExporter';
import type { CapturedPage } from '../utils/zipExporter';

export default function DashboardView() {
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [jobType, setJobType] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'capturing' | 'crawling' | 'error' | 'success'>('idle');
  const [progressMsg, setProgressMsg] = useState<string>('Initializing...');
  const [progressBar, setProgressBar] = useState<number>(0);
  const [pages, setPages] = useState<CapturedPage[]>([]);
  const [sitemap, setSitemap] = useState<string[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [activeViewport, setActiveViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const url = params.get('targetUrl');
    const tabId = Number(params.get('targetTabId') || '0');
    const depth = Number(params.get('depth') || '5');

    if (!action || !url) {
      setStatus('idle');
      return;
    }

    setTargetUrl(url);
    setJobType(action);
    startJob(action, url, depth, tabId);
  }, []);

  // Listen to background progress messages
  useEffect(() => {
    const progressListener = (message: any) => {
      if (message.action === 'CAPTURE_PROGRESS') {
        setProgressMsg(message.message);
        if (message.status === 'capturing') {
          setStatus('capturing');
          setProgressBar(message.progress);
        } else if (message.status === 'crawling') {
          setStatus('crawling');
          setProgressBar(Math.floor((message.progress / message.total) * 100));
        }
      }
    };
    chrome.runtime.onMessage.addListener(progressListener);
    return () => chrome.runtime.onMessage.removeListener(progressListener);
  }, []);

  const startJob = async (action: string, url: string, depth: number, tabId: number) => {
    if (action === 'capture') {
      setStatus('capturing');
      setProgressMsg('Connecting to active page...');
      setProgressBar(10);
      const res = await chrome.runtime.sendMessage({ action: 'START_SINGLE_CAPTURE', tabId });
      if (res && res.success) {
        setPages([{
          url: res.metadata.url,
          slug: '/',
          screenshots: { desktop: res.screenshot },
          metadata: {
            title: res.metadata.title,
            viewport: '1440x900',
            timestamp: new Date().toISOString(),
            fonts: res.metadata.fonts,
            colors: res.metadata.colors
          },
          assets: res.assets
        }]);
        setSitemap([res.metadata.url]);
        setStatus('success');
      } else {
        handleError(res?.error || 'Failed to capture page.');
      }
    } else if (action === 'responsive') {
      setStatus('capturing');
      setProgressMsg('Connecting to active page...');
      setProgressBar(5);
      const res = await chrome.runtime.sendMessage({ action: 'START_RESPONSIVE_CAPTURE', tabId });
      if (res && res.success) {
        setPages([{
          url: res.metadata.url,
          slug: '/',
          screenshots: {
            desktop: res.screenshots.desktop,
            tablet: res.screenshots.tablet,
            mobile: res.screenshots.mobile
          },
          metadata: {
            title: res.metadata.title,
            viewport: 'Multiple',
            timestamp: new Date().toISOString(),
            fonts: res.metadata.fonts,
            colors: res.metadata.colors
          },
          assets: res.assets
        }]);
        setSitemap([res.metadata.url]);
        setStatus('success');
      } else {
        handleError(res?.error || 'Failed to resize browser and capture.');
      }
    } else if (action === 'crawl') {
      setStatus('crawling');
      setProgressMsg('Starting domain crawl...');
      setProgressBar(0);
      const res = await chrome.runtime.sendMessage({ action: 'START_CRAWL', startUrl: url, maxPages: depth });
      if (res && res.success) {
        setPages(res.pages);
        setSitemap(res.sitemap);
        setStatus('success');
      } else {
        handleError(res?.error || 'Failed during website crawling.');
      }
    }
  };

  const handleError = (msg: string) => {
    setStatus('error');
    setErrorMsg(msg);
  };

  const handleExportZip = async () => {
    if (pages.length === 0) return;
    try {
      const hostname = new URL(targetUrl).hostname;
      const blob = await generateProjectZip(hostname, pages, sitemap);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WebForge_${hostname.replace(/\./g, '_')}_blueprint.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const downloadSingleScreenshot = (dataUrl: string, suffix: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `webforge_${suffix}.png`;
    a.click();
  };

  const downloadSinglePdf = (dataUrl: string, suffix: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>WebForge - ${suffix}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; background: #fff; }
            img { max-width: 100%; height: auto; }
            @page { size: auto; margin: 0mm; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close()"/>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const activePage = pages[selectedPageIndex];

  // Helper to render responsive tabs
  const availableViewports = activePage ? Object.keys(activePage.screenshots).filter(k => activePage.screenshots[k as keyof typeof activePage.screenshots]) : [];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-app)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent-color)' }}>Web</span>Forge Workspace
          </h1>
          <span className="badge" style={{ textTransform: 'capitalize' }}>{jobType} Mode</span>
        </div>

        {status === 'success' && (
          <button onClick={handleExportZip} className="button button-primary" style={{ gap: '6px' }}>
            <Download size={14} /> Export Blueprint ZIP
          </button>
        )}
      </header>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Loading / Progress State */}
        {(status === 'capturing' || status === 'crawling') && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: '20px',
            background: 'var(--bg-app)'
          }}>
            <div className="card" style={{
              width: '420px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px'
            }}>
              <Loader2 size={36} className="animate-pulse" style={{ color: 'var(--accent-color)' }} />
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600 }}>Processing Site Capture</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{progressMsg}</p>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progressBar}%`,
                  height: '100%',
                  background: 'var(--accent-color)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Please keep this tab focused during the capture loop.
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <div className="card" style={{ width: '450px', padding: '24px', textAlign: 'center', borderColor: '#e0b3b3' }}>
              <AlertTriangle size={32} style={{ color: '#c0392b', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#c0392b', fontSize: '16px' }}>Capture Job Failed</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{errorMsg}</p>
              <button onClick={() => window.close()} className="button">Close Workspace</button>
            </div>
          </div>
        )}

        {/* Workspace Display State */}
        {status === 'success' && activePage && (
          <>
            {/* Sidebar - Captured pages list */}
            <aside style={{
              width: '280px',
              background: 'var(--bg-card)',
              borderRight: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Captured Pages ({pages.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedPageIndex(index);
                      // Set default active viewport based on what's available
                      const viewports = Object.keys(page.screenshots).filter(k => page.screenshots[k as keyof typeof page.screenshots]);
                      if (viewports.length > 0 && !viewports.includes(activeViewport)) {
                        setActiveViewport(viewports[0] as any);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: selectedPageIndex === index ? 'var(--bg-hover)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-color)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      outline: 'none'
                    }}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: selectedPageIndex === index ? 'var(--accent-color)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {page.metadata.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {page.slug === '/' ? '/' : page.slug}
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                ))}
              </div>
            </aside>

            {/* Viewport Editor / Main Screen */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Preview Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px',
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {availableViewports.includes('desktop') && (
                    <button 
                      onClick={() => setActiveViewport('desktop')}
                      className={`button ${activeViewport === 'desktop' ? 'button-primary' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Monitor size={14} /> Desktop (1440)
                    </button>
                  )}
                  {availableViewports.includes('tablet') && (
                    <button 
                      onClick={() => setActiveViewport('tablet')}
                      className={`button ${activeViewport === 'tablet' ? 'button-primary' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Tablet size={14} /> Tablet (768)
                    </button>
                  )}
                  {availableViewports.includes('mobile') && (
                    <button 
                      onClick={() => setActiveViewport('mobile')}
                      className={`button ${activeViewport === 'mobile' ? 'button-primary' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Smartphone size={14} /> Mobile (390)
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => downloadSingleScreenshot(activePage.screenshots[activeViewport]!, `${activeViewport}_screenshot`)}
                    className="button"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Download size={13} /> PNG
                  </button>
                  <button 
                    onClick={() => downloadSinglePdf(activePage.screenshots[activeViewport]!, `${activeViewport}_pdf`)}
                    className="button"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <FileText size={13} /> PDF
                  </button>
                </div>
              </div>

              {/* Stitched Image scroll canvas */}
              <div style={{
                flex: 1,
                padding: '24px',
                overflow: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                background: 'var(--bg-app)'
              }}>
                <div style={{
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  maxWidth: activeViewport === 'desktop' ? '1200px' : activeViewport === 'tablet' ? '768px' : '390px',
                  width: '100%',
                  background: '#ffffff'
                }}>
                  {activePage.screenshots[activeViewport] ? (
                    <img 
                      src={activePage.screenshots[activeViewport]} 
                      alt={`${activeViewport} full page render`}
                      style={{ width: '100%', display: 'block', height: 'auto' }}
                    />
                  ) : (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Viewport not captured. Start responsive scan to unlock this view.
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Design Tokens & Metadata Right Panel */}
            <aside style={{
              width: '320px',
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border-color)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              overflowY: 'auto'
            }}>
              {/* Metadata section */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Page Blueprint</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Title: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activePage.metadata.title}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>URL: </span>
                    <a href={activePage.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      Link <ExternalLink size={10} />
                    </a>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Captured: </span>
                    <span>{new Date(activePage.metadata.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Design Fonts */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Type size={14} /> Discovered Fonts
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activePage.metadata.fonts.length > 0 ? (
                    activePage.metadata.fonts.map((font, idx) => (
                      <span key={idx} className="badge" style={{ fontFamily: font }}>
                        {font}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No non-system fonts detected.</span>
                  )}
                </div>
              </div>

              {/* Design Colors */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={14} /> Discovered Colors
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {activePage.metadata.colors.length > 0 ? (
                    activePage.metadata.colors.map((color, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          navigator.clipboard.writeText(color);
                          alert(`Copied ${color} to clipboard!`);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          gap: '4px'
                        }}
                      >
                        <div style={{
                          width: '100%',
                          height: '32px',
                          background: color,
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)'
                        }} />
                        <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{color}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No colors parsed.</span>
                  )}
                </div>
              </div>

              {/* Sitemap & Robots.txt summary */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Global Domain Map</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {sitemap.map((url, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        fontSize: '11px',
                        padding: '4px 6px',
                        background: 'var(--bg-hover)',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {new URL(url).pathname}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
