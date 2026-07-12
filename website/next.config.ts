import type { NextConfig } from "next";

// Content Security Policy.
// - script-src keeps 'unsafe-inline' because Next injects inline hydration
//   scripts without a nonce; va.vercel-scripts.com is Vercel Analytics.
// - style-src / font-src allow Google Fonts.
// - img-src allows https: + data: so captured third-party images and the
//   base64 screenshot previews in the capture tool render.
// - connect-src covers the same-origin /api/capture fetch and Vercel vitals.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Keep the headless-browser binaries out of the bundler so the Chromium
  // executable resolves correctly inside the Vercel serverless function.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  // The Chromium binaries in @sparticuz/chromium/bin are loaded at runtime,
  // so Next's file tracing can't see them. Force them into the capture
  // function's bundle or the executable won't exist on Vercel.
  outputFileTracingIncludes: {
    "/api/capture": ["./node_modules/@sparticuz/chromium/bin/**"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
