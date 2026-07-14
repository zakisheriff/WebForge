"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Meowdoku from "./Meowdoku";

type ViewportKey = "desktop" | "tablet" | "mobile";
type CaptureMode = "desktop" | "all";

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

// True device widths — display each shot at its real size so mobile/tablet
// don't get stretched (and look zoomed) inside the wide preview panel.
const VIEWPORT_WIDTHS: Record<ViewportKey, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
};

// Rotating captions shown while the capture runs — mirrors what the backend
// is actually doing so the wait feels alive instead of a frozen spinner.
const buildLoadingSteps = (mode: CaptureMode) => [
  "Rendering desktop · 1440",
  ...(mode === "all"
    ? ["Rendering tablet · 768", "Rendering mobile · 390"]
    : []),
  "Extracting the colour palette",
  "Collecting typography",
  "Gathering images",
  "Packaging design tokens",
];

function CaptureLoading({ mode }: { mode: CaptureMode }) {
  const steps = buildLoadingSteps(mode);
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 1400);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div className="capture-loading" role="status" aria-live="polite">
      <div className="capture-loading-status">
        <span className="cl-spinner" />
        <span className="cl-step">{steps[step]}…</span>
      </div>
      <p className="capture-loading-play">This can take a moment. Play a round while you wait 🐾</p>
      <Meowdoku />
    </div>
  );
}

export default function CaptureTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<CaptureMode>("all");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [active, setActive] = useState<ViewportKey>("desktop");
  const [zipping, setZipping] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lightboxClosing, setLightboxClosing] = useState(false);

  const closeLightbox = () => {
    setLightboxClosing(true);
    setTimeout(() => {
      setLightbox(null);
      setLightboxClosing(false);
    }, 220);
  };

  // Let Escape close the full-size image viewer.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const runCapture = async (mode: CaptureMode) => {
    if (!url.trim() || loading) return;
    setLoadingMode(mode);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode }),
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
        <h3 className="capture-title">Try WebForge on any URL</h3>
      </div>

      <form
        className="capture-form"
        onSubmit={(e) => {
          e.preventDefault();
          runCapture("all");
        }}
      >
        <input
          type="text"
          className="capture-input"
          placeholder="anthropic.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          aria-label="Website URL to capture"
        />
      </form>

      <div className="capture-modes">
        <button
          type="button"
          className="capture-btn capture-btn-secondary"
          onClick={() => runCapture("desktop")}
          disabled={loading}
        >
          {loading && loadingMode === "desktop"
            ? "Capturing…"
            : "Capture Desktop"}
        </button>
        <button
          type="button"
          className="capture-btn"
          onClick={() => runCapture("all")}
          disabled={loading}
        >
          {loading && loadingMode === "all"
            ? "Capturing…"
            : "Desktop · Tablet · Mobile"}
        </button>
      </div>

      {loading && <CaptureLoading mode={loadingMode} />}

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
                style={{ maxWidth: `${VIEWPORT_WIDTHS[active]}px` }}
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
                  <button
                    key={i}
                    type="button"
                    className="img-thumb"
                    onClick={() => setLightbox(src)}
                    aria-label="Open image full size"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="capture-actions">
            <a
              href="https://buymeacoffee.com/theoneatom"
              target="_blank"
              rel="noreferrer"
              className="capture-coffee"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
              Buy Me a Coffee
            </a>
            <button
              className="capture-download"
              onClick={downloadZip}
              disabled={zipping}
            >
              {zipping ? "Building ZIP…" : "Download ZIP package"}
            </button>
          </div>
        </div>
      )}

      <div className="capture-upsell">
        <p className="capture-upsell-text">
          Preview captures one page. Full site crawls land in the{" "}
          <a
            href="https://github.com/zakisheriff/WebForge"
            target="_blank"
            rel="noreferrer"
            className="capture-upsell-link"
          >
            extension, coming soon
          </a>
          .
        </p>
      </div>

      {lightbox &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`capture-lightbox ${lightboxClosing ? "closing" : ""}`}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            <button
              type="button"
              className="capture-lightbox-close"
              onClick={closeLightbox}
              aria-label="Close preview"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="capture-lightbox-img"
              src={lightbox}
              alt="Full-size preview"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </section>
  );
}
