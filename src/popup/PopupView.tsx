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

// Hover-aware button wrapper
function HoverButton({
  style,
  hoverStyle,
  onClick,
  children,
}: {
  style: React.CSSProperties;
  hoverStyle: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{ ...style, ...(hovered ? hoverStyle : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Hover-aware coffee link
function CoffeeLink() {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="https://buymeacoffee.com/theoneatom"
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "10px 12px",
        borderRadius: "12px",
        background: hovered ? "rgba(217,107,67,0.22)" : "rgba(217, 107, 67, 0.12)",
        color: "var(--accent-color)",
        textDecoration: "none",
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: "var(--font-sans)",
        transition: "background 0.15s",
      }}
    >
      <Coffee size={14} />
      Buy Me a Coffee
    </a>
  );
}

export default function PopupView() {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  const [crawlDepth, setCrawlDepth] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [customUrls, setCustomUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [wsHovered, setWsHovered] = useState(false);

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
      const full = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      const parsed = new URL(full);
      setCustomUrls((prev) => {
        if (prev.includes(parsed.href)) return prev;
        return [...prev, parsed.href];
      });
      setUrlInput("");
    } catch {
      // invalid url — silently ignore
    }
  };

  const removeCustomUrl = (idx: number) => {
    setCustomUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomUrl();
    }
  };

  const buildCrawlParams = (responsive = false) => {
    const base = `&depth=${crawlDepth}${responsive ? "&responsive=1" : ""}`;
    if (customUrls.length > 0) {
      return base + `&customUrls=${encodeURIComponent(JSON.stringify(customUrls))}`;
    }
    return base;
  };

  // Base styles
  const baseBtn: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "10px",
    width: "100%",
    padding: "11px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
    transition: "background 0.15s, opacity 0.15s",
  };

  const orangeBtn: React.CSSProperties = {
    ...baseBtn,
    border: "none",
    background: "var(--accent-color)",
    color: "#fff",
  };
  const orangeBtnHover: React.CSSProperties = { background: "#c25a33" };

  const blackBtn: React.CSSProperties = {
    ...baseBtn,
    border: "none",
    background: "#1a1a1a",
    color: "#fff",
  };
  const blackBtnHover: React.CSSProperties = { background: "#333333" };

  const secondaryBtn: React.CSSProperties = {
    ...baseBtn,
    border: "1px solid var(--border-color)",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
  };
  const secondaryBtnHover: React.CSSProperties = {
    background: "#ede8e3",
    borderColor: "#c8bfb5",
  };

  // Responsive variant — orange stroke
  const responsiveBtn: React.CSSProperties = {
    ...baseBtn,
    border: "1px solid rgba(217, 107, 67, 0.55)",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    outline: "none",
  };
  const responsiveBtnHover: React.CSSProperties = {
    background: "rgba(217,107,67,0.06)",
    border: "1px solid rgba(217, 107, 67, 1)",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--text-muted)",
    letterSpacing: "0.3px",
    paddingLeft: "2px",
    marginTop: "2px",
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
        gap: "12px",
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
              style={{ width: "40px", height: "40px", borderRadius: "8px", flexShrink: 0 }}
            />
            WebForge{" "}
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>
              by The Atom
            </span>
          </h2>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
            AI-Ready Website Capture Engine
          </p>
        </div>

        {/* Workspace button with hover */}
        <button
          onMouseEnter={() => setWsHovered(true)}
          onMouseLeave={() => setWsHovered(false)}
          onClick={() => openDashboard("view")}
          style={{
            padding: "6px 10px",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            background: wsHovered ? "#ede8e3" : "var(--bg-card)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            transition: "background 0.15s",
          }}
        >
          Workspace <ExternalLink size={12} />
        </button>
      </div>

      {error ? (
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "start",
            border: "1px solid #e0b3b3",
            background: "rgba(224,179,179,0.1)",
            borderRadius: "10px",
            padding: "10px 12px",
          }}
        >
          <ShieldAlert size={18} style={{ color: "#c0392b", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>{error}</div>
        </div>
      ) : (
        <>
          {/* Active site banner */}
          <div
            style={{
              padding: "9px 12px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "2px" }}>
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

          {/* ── Current Page ──────────────────────────────── */}
          <div style={sectionLabel}>Current page</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <HoverButton style={orangeBtn} hoverStyle={orangeBtnHover} onClick={() => openDashboard("capture")}>
              <Camera size={16} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Capture current page</div>
                <div style={{ fontSize: "11px", opacity: 0.85 }}>Full-page screenshot at desktop</div>
              </div>
            </HoverButton>

            <HoverButton style={responsiveBtn} hoverStyle={responsiveBtnHover} onClick={() => openDashboard("responsive")}>
              <Monitor size={16} style={{ flexShrink: 0, color: "var(--accent-color)" }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Capture current page + responsive</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  Desktop, Tablet &amp; Mobile viewports
                </div>
              </div>
            </HoverButton>
          </div>

          {/* ── Website Pages ──────────────────────────────── */}
          <div style={sectionLabel}>Website pages</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <HoverButton style={blackBtn} hoverStyle={blackBtnHover} onClick={() => openDashboard("crawl", buildCrawlParams(false))}>
              <Globe size={16} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Capture website pages</div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>Auto-crawl &amp; capture linked pages</div>
              </div>
            </HoverButton>

            <HoverButton style={secondaryBtn} hoverStyle={secondaryBtnHover} onClick={() => openDashboard("crawl", buildCrawlParams(true))}>
              <LayoutGrid size={16} style={{ flexShrink: 0, color: "var(--text-secondary)" }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>Capture website pages + responsive</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  Crawl pages with all 3 viewports each
                </div>
              </div>
            </HoverButton>

            {/* Crawl settings card */}
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
              {/* Pages limit */}
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
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <option value={2}>2 pages</option>
                  <option value={3}>3 pages</option>
                  <option value={5}>5 pages</option>
                  <option value={8}>8 pages</option>
                  <option value={10}>10 pages</option>
                  <option value={15}>15 pages</option>
                  <option value={20}>20 pages</option>
                </select>
              </div>

              {/* Custom URLs toggle */}
              <button
                onClick={() => setShowUrlInput((v) => !v)}
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
                  fontFamily: "var(--font-sans)",
                }}
              >
                <Plus size={12} />
                Add specific page URLs to crawl
                {customUrls.length > 0 && (
                  <span
                    style={{
                      background: "var(--accent-color)",
                      color: "#fff",
                      borderRadius: "10px",
                      padding: "1px 6px",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {customUrls.length}
                  </span>
                )}
              </button>

              {showUrlInput && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                        fontFamily: "var(--font-sans)",
                      }}
                    />
                    <button
                      onClick={addCustomUrl}
                      style={{
                        background: "var(--accent-color)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "7px",
                        padding: "0 12px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "var(--font-sans)",
                        flexShrink: 0,
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
                            background: "var(--bg-app)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            padding: "4px 6px 4px 8px",
                          }}
                        >
                          <span
                            style={{
                              flex: 1,
                              fontSize: "10px",
                              color: "var(--text-secondary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {u}
                          </span>
                          <button
                            onClick={() => removeCustomUrl(i)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "2px 4px",
                              color: "var(--text-muted)",
                              display: "flex",
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        These URLs are crawled first, then auto-discovery fills the rest.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Buy Me a Coffee */}
          <CoffeeLink />
        </>
      )}
    </div>
  );
}
