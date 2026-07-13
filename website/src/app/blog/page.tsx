import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "./posts";

const SITE_URL = "https://webforge.theatom.lk";

export const metadata: Metadata = {
  title: "Blog: AI website capture, visual blueprints and context for coding agents",
  description:
    "Guides on turning websites into AI-ready visual blueprints: screenshot-to-code done right, design-token extraction, and context packs for Claude Code, Cursor and Copilot.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: "WebForge Blog: AI website capture and visual blueprints",
    description:
      "Practical guides on capturing websites into AI-ready visual blueprints for modern coding agents.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: "WebForge Blog",
    description:
      "Guides on turning websites into AI-ready visual blueprints for coding agents.",
    url: `${SITE_URL}/blog`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `${SITE_URL}/blog/${p.slug}`,
      keywords: p.tags.join(", "),
    })),
  };

  return (
    <div className="blog-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />

      <header className="blog-header">
        <h1 className="blog-h1">
          Capturing the web for AI coding agents
        </h1>
        <p className="blog-lead">
          Practical guides on visual blueprints, design tokens, and giving
          Claude Code, Cursor and Copilot the context they need to rebuild
          websites accurately.
        </p>
      </header>

      <ul className="blog-list">
        {posts.map((post) => (
          <li key={post.slug} className="blog-card">
            <Link href={`/blog/${post.slug}`} className="blog-card-link">
              <div className="blog-card-meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>·</span>
                <span>{post.readingMinutes} min read</span>
              </div>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-desc">{post.description}</p>
              <div className="blog-tags">
                {post.tags.map((t) => (
                  <span key={t} className="blog-tag">
                    {t}
                  </span>
                ))}
              </div>
              <span className="blog-card-cta">Read post →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
