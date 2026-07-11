import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebForge — AI-Ready Website Capture Engine",
  description: "Capture high-fidelity visual blueprints, multi-viewport designs, sitemaps, and CSS design tokens from any website. Optimized for Claude, Cursor, and AI coding agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
