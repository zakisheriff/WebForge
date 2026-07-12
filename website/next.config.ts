import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the headless-browser binaries out of the bundler so the Chromium
  // executable resolves correctly inside the Vercel serverless function.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
