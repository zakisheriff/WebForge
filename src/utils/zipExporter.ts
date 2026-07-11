import JSZip from 'jszip';

export interface CapturedPage {
  url: string;
  slug: string;
  screenshots: {
    desktop?: string; // base64 Data URL
    tablet?: string; // base64 Data URL
    mobile?: string; // base64 Data URL
  };
  metadata: {
    title: string;
    viewport: string;
    timestamp: string;
    fonts: string[];
    colors: string[];
  };
  assets?: {
    html?: string;
    inlineStyles?: string[];
    externalStyles?: string[];
    inlineScripts?: string[];
    externalScripts?: string[];
    media?: {
      type: 'image' | 'video' | 'svg';
      filename?: string;
      content?: string;
      data?: string;
    }[];
  };
}

export async function generateProjectZip(
  domain: string,
  pages: CapturedPage[],
  sitemap: string[]
): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder("WebForge_Project");
  if (!root) throw new Error("Could not create WebForge_Project folder");

  const pagesFolder = root.folder("pages");
  if (!pagesFolder) throw new Error("Could not create pages folder");

  // Gather unique colors and fonts for global metadata
  const globalColors = new Set<string>();
  const globalFonts = new Set<string>();

  for (const page of pages) {
    const pageSlug = page.slug === '' || page.slug === '/' ? 'home' : page.slug.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    const pageFolder = pagesFolder.folder(pageSlug);
    if (!pageFolder) continue;

    // Save screenshots
    for (const [key, dataUrl] of Object.entries(page.screenshots)) {
      if (!dataUrl) continue;
      const base64Data = dataUrl.split(',')[1];
      if (base64Data) {
        pageFolder.file(`${key}.png`, base64Data, { base64: true });
      }
    }

    // Save page metadata
    pageFolder.file("metadata.json", JSON.stringify(page.metadata, null, 2));

    // Save page source assets if present
    if (page.assets) {
      const sourceFolder = pageFolder.folder("source");
      if (sourceFolder) {
        if (page.assets.html) {
          sourceFolder.file("index.html", page.assets.html);
        }

        // CSS Stylesheets
        const stylesFolder = sourceFolder.folder("styles");
        if (stylesFolder) {
          page.assets.inlineStyles?.forEach((style, i) => {
            stylesFolder.file(`inline_${i}.css`, style);
          });
          page.assets.externalStyles?.forEach((style, i) => {
            stylesFolder.file(`external_${i}.css`, style);
          });
        }

        // JS Scripts
        const scriptsFolder = sourceFolder.folder("scripts");
        if (scriptsFolder) {
          page.assets.inlineScripts?.forEach((script, i) => {
            scriptsFolder.file(`inline_${i}.js`, script);
          });
          page.assets.externalScripts?.forEach((script, i) => {
            scriptsFolder.file(`external_${i}.js`, script);
          });
        }

        // Media resources
        const mediaFolder = sourceFolder.folder("media");
        if (mediaFolder) {
          page.assets.media?.forEach((item, i) => {
            if (item.type === 'svg' && item.content) {
              mediaFolder.file(`vector_${i}.svg`, item.content);
            } else if (item.data) {
              const base64Data = item.data.split(',')[1] || item.data;
              const ext = item.filename?.split('.').pop() || 'png';
              mediaFolder.file(`media_${i}.${ext}`, base64Data, { base64: true });
            }
          });
        }
      }
    }

    page.metadata.colors.forEach(c => globalColors.add(c));
    page.metadata.fonts.forEach(f => globalFonts.add(f));
  }

  // Create global sitemap.json
  root.file("sitemap.json", JSON.stringify(sitemap, null, 2));

  // Create global metadata.json
  const globalMetadata = {
    website: domain,
    title: pages[0]?.metadata?.title || domain,
    pages: pages.map(p => ({ url: p.url, slug: p.slug })),
    timestamp: new Date().toISOString(),
    fonts: Array.from(globalFonts),
    colors: Array.from(globalColors)
  };

  root.file("metadata.json", JSON.stringify(globalMetadata, null, 2));

  return await zip.generateAsync({ type: "blob" });
}
