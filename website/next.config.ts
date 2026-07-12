import type { NextConfig } from "next";

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
};

export default nextConfig;
