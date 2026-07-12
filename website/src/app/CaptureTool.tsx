"use client";

import React, { useState } from "react";

type ViewportKey = "desktop" | "tablet" | "mobile";

interface CaptureResult {
  url: string;
  title: string;
  capturedAt: string;
  screenshots: Partial<Record<ViewportKey, string>>;
  colors: string[];
  fonts: string[];
  images: string[];
}

const VIEWPORT_LABELS: Record<ViewportKey, string> = {
  desktop: "Desktop · 1440",
  tablet: "Tablet · 768",
  mobile: "Mobile · 390",
};

export default function CaptureTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [active, setActive] = useState<ViewportKey>("desktop");
  const [zipping, setZipping] = useState(false);

  const runCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Capture failed.");
      } else {
        setResult(data as CaptureResult);
        const first = (["desktop", "tablet", "mobile"] as ViewportKey[]).find(
          (k) => (data as CaptureResult).screenshots[k],
        );
        if (first) setActive(first);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadZip = async () => {
    if (!result || zipping) return;
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const safeName =
        result.title.replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "capture";

      const pages = zip.folder("pages")!;
      (Object.entries(result.screenshots) as [ViewportKey, string][]).forEach(
        ([key, dataUrl]) => {
          const base64 = dataUrl.split(",")[1];
          pages.file(`${key}.jpeg`, base64, { base64: true });
        },
      );

      zip.file(
        "metadata.json",
        JSON.stringify(
          {
            url: result.url,
            title: result.title,
            capturedAt: result.capturedAt,
            colors: result.colors,
            fonts: result.fonts,
            images: result.images,
            note: "Single-page capture via WebForge web preview. Install the extension for full-site crawl.",
          },
          null,
          2,
        ),
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `webforge-${safeName}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setZipping(false);
    }
  };

  return (
    <section id="try" className="capture reveal">
      <div className="capture-head">
        <span className="capture-tag">Live preview · runs on this site</span>
        <h3 className="capture-title">Try WebForge on any URL</h3>
        <p className="capture-sub">
          Paste a link and capture it right here — multi-viewport screenshots
          plus extracted colors, fonts and images. A single-page taste of the
          full extension.
        </p>
      </div>

      <form className="capture-form" onSubmit={runCapture}>
        <input
          type="text"
          className="capture-input"
          placeholder="anthropic.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          aria-label="Website URL to capture"
        />
        <button type="submit" className="capture-btn" disabled={loading}>
          {loading ? "Capturing…" : "Capture"}
        </button>
      </form>

      {loading && (
        <div className="capture-status">
          Rendering across desktop, tablet & mobile and extracting design
          tokens… this can take up to a minute.
        </div>
      )}

      {error && <div className="capture-error">{error}</div>}

      {result && (
        <div className="capture-result">
          <div className="capture-tabs">
            {(["desktop", "tablet", "mobile"] as ViewportKey[])
              .filter((k) => result.screenshots[k])
              .map((k) => (
                <button
                  key={k}
                  className={`capture-tab ${active === k ? "active" : ""}`}
                  onClick={() => setActive(k)}
                >
                  {VIEWPORT_LABELS[k]}
                </button>
              ))}
          </div>

          {result.screenshots[active] && (
            <div className="capture-shot-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="capture-shot"
                src={result.screenshots[active]}
                alt={`${active} screenshot of ${result.title}`}
              />
            </div>
          )}

          <div className="capture-tokens">
            <div className="token-block">
              <h4>Colors</h4>
              <div className="swatches">
                {result.colors.map((c, i) => (
                  <span
                    key={i}
                    className="swatch"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
            <div className="token-block">
              <h4>Fonts</h4>
              <ul className="font-list">
                {result.fonts.map((f, i) => (
                  <li key={i} style={{ fontFamily: `"${f}", sans-serif` }}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="token-block">
              <h4>Images · {result.images.length}</h4>
              <div className="img-grid">
                {result.images.slice(0, 12).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" loading="lazy" />
                ))}
              </div>
            </div>
          </div>

          <button
            className="capture-download"
            onClick={downloadZip}
            disabled={zipping}
          >
            {zipping ? "Building ZIP…" : "Download ZIP package"}
          </button>
        </div>
      )}

      <div className="capture-upsell">
        <strong>Want the full picture?</strong> This web preview captures a
        single page. The WebForge extension runs in your own browser to crawl
        the entire domain, reach login-protected and bot-guarded pages, and
        export pixel-perfect blueprints — everything, unlocked.
        <a
          href="https://github.com/zakisheriff/WebForge"
          target="_blank"
          rel="noreferrer"
          className="capture-upsell-link"
        >
          Install the extension →
        </a>
      </div>
    </section>
  );
}
