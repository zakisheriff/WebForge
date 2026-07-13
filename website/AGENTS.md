<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# WebForge website (`webforge.theatom.lk`)

Marketing site + free online capture tool for WebForge. Next.js 16 App Router, TypeScript, plain CSS in `src/app/globals.css` (CSS variables, no Tailwind). Deployed on Vercel.

## Layout

- `src/app/page.tsx` — homepage. A single `"use client"` component (hero, live `CaptureTool`, packages + `CodeDemo`, About, How It Works / What It Does, blueprint structure, FAQ, blog teaser, contact, footer). Section content is authored inline as mapped arrays.
- `src/app/CaptureTool.tsx` — the interactive "paste a URL" capture widget.
- `src/app/api/capture/route.ts` — serverless capture endpoint (headless Chromium via `@sparticuz/chromium`).
- `src/app/blog/` — `posts.ts` is the single source of blog content; `page.tsx` is the index; `[slug]/page.tsx` is the dynamic post route with `generateStaticParams` + `generateMetadata`; `layout.tsx` is the shared blog nav/footer.
- `src/app/layout.tsx` — root metadata (SEO/OG/Twitter/keywords) and `<StructuredData />`.
- `src/app/structured-data.tsx` — one JSON-LD `@graph` (Organization, WebSite, SoftwareApplication, WebApplication, FAQPage, HowTo, Blog, BreadcrumbList).
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts` — generated SEO files.
- `public/llms.txt`, `public/llms-full.txt` — GEO context for LLM crawlers.

## Keep in sync (SEO/AEO/GEO)

These describe the same facts in multiple places — change them together:

- **FAQ**: visible list in `page.tsx` (`id="faq"`) **and** `FAQPage.mainEntity` in `structured-data.tsx`.
- **Blog**: adding a post to `blog/posts.ts` auto-wires the route, sitemap entry, homepage teaser and `Blog` JSON-LD — no other file needs editing.
- **Product claims** (viewports, tokens, output schema): `page.tsx`, `structured-data.tsx`, `llms.txt`, and the root `README.md`.
- Don't fabricate `aggregateRating` values — update them only from genuine reviews.

## Conventions

- Match the existing inline-style + CSS-variable pattern; reuse `--font-sans`, `--font-serif`, `--font-mono`, `--accent-color`, `--card-bg`, `--border-color`.
- Section headings use `var(--font-sans)` at weight 800 with tight letter-spacing (matches the hero). The serif is reserved for the hero/editorial voice.
- No em dashes in user-facing marketing copy.
- Verify with `npx tsc --noEmit` and `npx next build`, then drive the page (`npx next start`) before committing.

## Commit workflow

After every change, commit with a conventional prefix (`feat:` / `fix:` / `style:` / `docs:`) and push. Do **not** add a Claude co-author line.
