import { useState, useEffect } from "react";
import {
  Camera,
  Monitor,
  Globe,
  LayoutGrid,
  ExternalLink,
  ShieldAlert,
  Coffee,
  Plus,
  X,
} from "lucide-react";

export default function PopupView() {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [crawlDepth, setCrawlDepth] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [customUrls, setCustomUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        if (
          tab &&
          tab.url &&
          (tab.url.startsWith("http://") || tab.url.startsWith("https://"))
        ) {
          setActiveTab(tab);
        } else {
          setError("WebForge requires an active HTTP/HTTPS webpage to run.");
        }
      });
    }
  }, []);

  const openDashboard = (action: string, extraParams = "") => {
    if (!activeTab || !activeTab.url) return;
    const url = chrome.runtime.getURL(
      `index.html?mode=dashboard&action=${action}&targetTabId=${activeTab.id}&targetUrl=${encodeURIComponent(activeTab.url)}${extraParams}`,
    );
    chrome.tabs.create({ url });
    window.close();
  };

  const addCustomUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      if (!customUrls.includes(parsed.href)) {
        setCustomUrls([...customUrls, parsed.href]);
      }
    } catch {
      // invalid URL, ignore
    }
    setUrlInput("");
  };

  const removeCustomUrl = (idx: number) => {
    setCustomUrls(customUrls.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addCustomUrl();
  };

  const buildCrawlParams = (responsive = false) => {
    const base = `&depth=${crawlDepth}${responsive ? "&responsive=1" : ""}`;
    if (customUrls.length > 0) {
      return base + `&customUrls=${encodeURIComponent(JSON.stringify(customUrls))}`;
    }
    return base;
  };

  const btnBase: React.CSSProperties = {
    justifyContent: "flex-start",
    padding: "11px 14px",
    borderRadius: "12px",
    width: "100%",
    gap: "10px",
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border-color)",
    background: "var(--bg-card)",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.15s, border-color 0.15s",
  };

  return (
    <div
      style={{
        width: "380px",
        padding: "18px",
        background: "var(--bg-app)",
        fontFamily: "var(--font-sans)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        borderRadius: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "12px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img
              src="/icons/icon128.png"
              alt="WebForge Logo"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                flexShrink: 0,
              }}
            />
            WebForge{" "}
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                fontWeight: 400,
              }}
            >
              by The Atom
            </span>
          </h2>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
            AI-Ready Website Capture Engine
          </p>
        </div>
        <button
          onClick={() => openDashboard("view")}
          className="button"
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Workspace <ExternalLink size={12} />
        </button>
      </div>

      {error ? (
        <div
          className="card"
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "start",
            borderColor: "#e0b3b3",
            background: "rgba(224,179,179,0.1)",
          }}
        >
          <ShieldAlert
            size={18}
            style={{ color: "#c0392b", flexShrink: 0, marginTop: "2px" }}
          />
          <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>
            {error}
          </div>
        </div>
      ) : (
        <>
          {/* Active site banner */}
          <div
            className="card"
            style={{
              padding: "9px 12px",
              background: "var(--bg-card)",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}
            >
              Target Website
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "var(--accent-color)",
              }}
            >
              {activeTab ? new URL(activeTab.url!).hostname : "Detecting page..."}
            </div>
          </div>

          {/* Capture Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

            {/* ── Single Page ─────────────────────────────── */}
            <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", paddingLeft: "2px" }}>
              Current Page
            </div>

            <button
              className="button button-primary"
              style={{ ...btnBase, border: "none" }}
              onClick={() => openDashboard("capture")}
            >
              <Camera size={16} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Capture Current Page</div>
                <div style={{ fontSize: "11px", opacity: 0.85 }}>Full-page screenshot at desktop</div>
              </div>
            </button>

            <button
              style={{ ...btnBase }}
              onClick={() => openDashboard("responsive")}
            >
              <Monitor size={16} style={{ flexShrink: 0, color: "var(--text-secondary)" }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Capture Current Page + Responsive</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Desktop, Tablet &amp; Mobile viewports</div>
              </div>
            </button>

            {/* ── Website Pages ────────────────────────────── */}
            <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", paddingLeft: "2px", marginTop: "4px" }}>
              Website Pages
            </div>

            <button
              style={{ ...btnBase }}
              onClick={() => openDashboard("crawl", buildCrawlParams(false))}
            >
              <Globe size={16} style={{ flexShrink: 0, color: "var(--text-secondary)" }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Capture Website Pages</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Auto-crawl &amp; capture linked pages</div>
              </div>
            </button>

            <button
              style={{ ...btnBase }}
              onClick={() => openDashboard("crawl", buildCrawlParams(true))}
            >
              <LayoutGrid size={16} style={{ flexShrink: 0, color: "var(--text-secondary)" }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Capture Website Pages + Responsive</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Crawl pages with all 3 viewports each</div>
              </div>
            </button>

            {/* ── Crawl settings ────────────────────────────── */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {/* Pages limit row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "11px", fontWeight: 500 }}>
                  Pages limit
                </span>
                <select
                  value={crawlDepth}
                  onChange={(e) => setCrawlDepth(Number(e.target.value))}
                  style={{
                    background: "var(--bg-app)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    padding: "3px 7px",
                    color: "var(--text-primary)",
                    outline: "none",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  <option value={1}>1 page</option>
                  <option value={2}>2 pages</option>
                  <option value={3}>3 pages</option>
                  <option value={5}>5 pages</option>
                  <option value={10}>10 pages</option>
                  <option value={20}>20 pages</option>
                  <option value={50}>50 pages</option>
                </select>
              </div>

              {/* Custom URLs */}
              <div>
                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--accent-color)",
                    padding: 0,
                  }}
                >
                  <Plus size={12} />
                  Add specific page URLs to crawl
                  {customUrls.length > 0 && (
                    <span style={{
                      background: "var(--accent-color)",
                      color: "#fff",
                      borderRadius: "10px",
                      padding: "1px 6px",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}>
                      {customUrls.length}
                    </span>
                  )}
                </button>

                {showUrlInput && (
                  <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="https://example.com/about"
                        style={{
                          flex: 1,
                          fontSize: "11px",
                          padding: "5px 8px",
                          border: "1px solid var(--border-color)",
                          borderRadius: "7px",
                          background: "var(--bg-app)",
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={addCustomUrl}
                        style={{
                          background: "var(--accent-color)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "7px",
                          padding: "0 10px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Add
                      </button>
                    </div>

                    {customUrls.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {customUrls.map((u, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "var(--bg-app)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              fontSize: "10px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                              {u}
                            </span>
                            <button
                              onClick={() => removeCustomUrl(i)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "0 0 0 6px",
                                color: "var(--text-muted)",
                                flexShrink: 0,
                              }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          These URLs will be crawled first, then auto-discovery continues up to the page limit.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Buy Me a Coffee */}
            <a
              href="https://buymeacoffee.com/theoneatom"
              target="_blank"
              rel="noreferrer"
              className="button"
              style={{
                justifyContent: "center",
                gap: "6px",
                padding: "10px 12px",
                borderRadius: "12px",
                background: "rgba(217, 107, 67, 0.12)",
                color: "var(--accent-color)",
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <Coffee size={14} />
              Buy Me a Coffee
            </a>
          </div>
        </>
      )}
    </div>
  );
}
