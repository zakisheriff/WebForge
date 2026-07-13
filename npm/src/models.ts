import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";

export interface Viewport {
  key: string;
  width: number;
  height: number;
}

/** Desktop + tablet + mobile — mirrors the WebForge extension's matrix. */
export const DEFAULT_VIEWPORTS: Viewport[] = [
  { key: "desktop", width: 1440, height: 900 },
  { key: "tablet", width: 768, height: 1024 },
  { key: "mobile", width: 390, height: 844 },
];

export interface Tokens {
  colors: string[];
  fonts: string[];
  images: string[];
}

function extFor(fmt: string): string {
  return fmt.toLowerCase() === "png" ? "png" : "jpg";
}

export function slugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const s = (u.hostname || "capture")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    return s || "capture";
  } catch {
    return "capture";
  }
}

/** Result of capturing a single page: screenshots + design tokens. */
export class CaptureResult {
  url: string;
  title: string;
  capturedAt: string;
  /** Raw image bytes keyed by viewport ("desktop" | "tablet" | "mobile"). */
  screenshots: Record<string, Buffer>;
  colors: string[];
  fonts: string[];
  images: string[];
  imageFormat: string;

  constructor(init: {
    url: string;
    title: string;
    capturedAt: string;
    screenshots?: Record<string, Buffer>;
    colors?: string[];
    fonts?: string[];
    images?: string[];
    imageFormat?: string;
  }) {
    this.url = init.url;
    this.title = init.title;
    this.capturedAt = init.capturedAt;
    this.screenshots = init.screenshots ?? {};
    this.colors = init.colors ?? [];
    this.fonts = init.fonts ?? [];
    this.images = init.images ?? [];
    this.imageFormat = init.imageFormat ?? "jpeg";
  }

  metadata(): Record<string, unknown> {
    return {
      url: this.url,
      title: this.title,
      capturedAt: this.capturedAt,
      colors: this.colors,
      fonts: this.fonts,
      images: this.images,
    };
  }

  /** Write screenshots + metadata.json into `dir` (created if needed). */
  save(dir: string): string {
    fs.mkdirSync(dir, { recursive: true });
    const ext = extFor(this.imageFormat);
    for (const [key, bytes] of Object.entries(this.screenshots)) {
      fs.writeFileSync(path.join(dir, `${key}.${ext}`), bytes);
    }
    fs.writeFileSync(
      path.join(dir, "metadata.json"),
      JSON.stringify(this.metadata(), null, 2),
    );
    return dir;
  }

  /** Package everything into a ZIP blueprint at `outPath`. */
  async toZip(outPath: string): Promise<string> {
    const zip = new JSZip();
    const folder = zip.folder(`WebForge_${slugFromUrl(this.url)}`)!;
    const ext = extFor(this.imageFormat);
    for (const [key, bytes] of Object.entries(this.screenshots)) {
      folder.file(`${key}.${ext}`, bytes);
    }
    folder.file("metadata.json", JSON.stringify(this.metadata(), null, 2));
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync(outPath, buf);
    return outPath;
  }
}

/** A single page captured during a crawl. */
export class CapturedPage {
  url: string;
  slug: string;
  title: string;
  screenshots: Record<string, Buffer>;
  colors: string[];
  fonts: string[];
  imageFormat: string;

  constructor(init: {
    url: string;
    slug: string;
    title: string;
    screenshots?: Record<string, Buffer>;
    colors?: string[];
    fonts?: string[];
    imageFormat?: string;
  }) {
    this.url = init.url;
    this.slug = init.slug;
    this.title = init.title;
    this.screenshots = init.screenshots ?? {};
    this.colors = init.colors ?? [];
    this.fonts = init.fonts ?? [];
    this.imageFormat = init.imageFormat ?? "jpeg";
  }
}

/** Result of crawling a domain. */
export class CrawlResult {
  domain: string;
  pages: CapturedPage[];
  sitemap: string[];

  constructor(init: { domain: string; pages?: CapturedPage[]; sitemap?: string[] }) {
    this.domain = init.domain;
    this.pages = init.pages ?? [];
    this.sitemap = init.sitemap ?? [];
  }

  metadata(): Record<string, unknown> {
    const colors = new Set<string>();
    const fonts = new Set<string>();
    for (const p of this.pages) {
      p.colors.forEach((c) => colors.add(c));
      p.fonts.forEach((f) => fonts.add(f));
    }
    return {
      domain: this.domain,
      pageCount: this.pages.length,
      colors: [...colors].slice(0, 12),
      fonts: [...fonts].slice(0, 10),
    };
  }

  async toZip(outPath: string): Promise<string> {
    const zip = new JSZip();
    const root = zip.folder(`WebForge_${this.domain.replace(/[^a-z0-9]+/gi, "-")}`)!;
    root.file("sitemap.json", JSON.stringify(this.sitemap, null, 2));
    root.file("metadata.json", JSON.stringify(this.metadata(), null, 2));
    const pagesDir = root.folder("pages")!;
    for (const p of this.pages) {
      const pd = pagesDir.folder(p.slug)!;
      const ext = extFor(p.imageFormat);
      for (const [key, bytes] of Object.entries(p.screenshots)) {
        pd.file(`${key}.${ext}`, bytes);
      }
      pd.file(
        "metadata.json",
        JSON.stringify(
          { url: p.url, title: p.title, colors: p.colors, fonts: p.fonts },
          null,
          2,
        ),
      );
    }
    const buf = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync(outPath, buf);
    return outPath;
  }
}
