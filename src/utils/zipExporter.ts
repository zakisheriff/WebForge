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

  const isSinglePage = pages.length === 1;

  let pagesFolder: JSZip | null = null;
  if (!isSinglePage) {
    pagesFolder = root.folder("pages");
    if (!pagesFolder) throw new Error("Could not create pages folder");
  }

  // Gather unique colors and fonts for global metadata
  const globalColors = new Set<string>();
  const globalFonts = new Set<string>();

  for (const page of pages) {
    let pageFolder: JSZip;
    if (isSinglePage) {
      pageFolder = root;
    } else {
      const pageSlug = page.slug === '' || page.slug === '/' ? 'home' : page.slug.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9-_]/g, '_');
      const f = pagesFolder!.folder(pageSlug);
      if (!f) continue;
      pageFolder = f;
    }

    // Save screenshots
    for (const [key, dataUrl] of Object.entries(page.screenshots)) {
      if (!dataUrl) continue;
      const base64Data = dataUrl.split(',')[1];
      if (base64Data) {
        pageFolder.file(`${key}.png`, base64Data, { base64: true });
      }
    }

    // Save page metadata with debug asset metadata
    const debugMetadata = {
      ...page.metadata,
      _debug_assets: page.assets ? {
        has_assets: true,
        html_size: page.assets.html?.length || 0,
        inlineStyles_count: page.assets.inlineStyles?.length || 0,
        externalStyles_count: page.assets.externalStyles?.length || 0,
        inlineScripts_count: page.assets.inlineScripts?.length || 0,
        externalScripts_count: page.assets.externalScripts?.length || 0,
        media_count: page.assets.media?.length || 0
      } : { has_assets: false }
    };
    pageFolder.file("metadata.json", JSON.stringify(debugMetadata, null, 2));

    // Save page source assets if present (NO nested "source" folder anymore!)
    if (page.assets) {
      pageFolder.file("debug_assets.json", JSON.stringify(page.assets, null, 2));
      if (page.assets.html) {
        pageFolder.file("index.html", page.assets.html);
      }

      // CSS Stylesheets
      const stylesFolder = pageFolder.folder("styles");
      if (stylesFolder) {
        page.assets.inlineStyles?.forEach((style, i) => {
          stylesFolder.file(`inline_${i}.css`, style);
        });
        page.assets.externalStyles?.forEach((style, i) => {
          stylesFolder.file(`external_${i}.css`, style);
        });
      }

      // JS Scripts
      const scriptsFolder = pageFolder.folder("scripts");
      if (scriptsFolder) {
        page.assets.inlineScripts?.forEach((script, i) => {
          scriptsFolder.file(`inline_${i}.js`, script);
        });
        page.assets.externalScripts?.forEach((script, i) => {
          scriptsFolder.file(`external_${i}.js`, script);
        });
      }

      // Media resources
      const mediaFolder = pageFolder.folder("media");
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

    page.metadata.colors.forEach(c => globalColors.add(c));
    page.metadata.fonts.forEach(f => globalFonts.add(f));
  }

  // Create global sitemap.json and global metadata.json only if multi-page
  if (!isSinglePage) {
    root.file("sitemap.json", JSON.stringify(sitemap, null, 2));

    const globalMetadata = {
      domain,
      exportedAt: new Date().toISOString(),
      sitemap: sitemap,
      designTokens: {
        colors: Array.from(globalColors),
        fonts: Array.from(globalFonts)
      }
    };
    root.file("metadata.json", JSON.stringify(globalMetadata, null, 2));
  }

  return await zip.generateAsync({ type: "blob" });
}
