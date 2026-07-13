import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, POSTS, type Block } from "../posts";

const SITE_URL = "https://webforge.theatom.lk";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: ["Zaki Sheriff"],
      tags: post.tags,
      images: [`${SITE_URL}/og-image.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className="post-h2">
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p key={i} className="post-p">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="post-ul">
          {block.items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre key={i} className="post-code">
          <code>{block.text}</code>
        </pre>
      );
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en",
    keywords: post.tags.join(", "),
    wordCount: post.body.reduce(
      (n, b) =>
        n + ("text" in b ? b.text.split(/\s+/).length : "items" in b ? b.items.join(" ").split(/\s+/).length : 0),
      0,
    ),
    author: { "@type": "Person", name: "Zaki Sheriff", url: "https://github.com/zakisheriff" },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": `${SITE_URL}/blog#blog` },
    image: `${SITE_URL}/og-image.png`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="blog-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav className="post-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/blog">Blog</Link>
      </nav>

      <header className="post-header">
        <div className="blog-card-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
        <h1 className="post-h1">{post.title}</h1>
        <p className="post-lead">{post.description}</p>
        <div className="blog-tags">
          {post.tags.map((t) => (
            <span key={t} className="blog-tag">
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="post-body">{post.body.map(renderBlock)}</div>

      <div className="post-cta">
        <h3>Turn any website into an AI-ready blueprint</h3>
        <p>
          Paste a URL into the free online tool, or install the extension for
          full-domain crawls.
        </p>
        <div className="post-cta-actions">
          <Link href="/#try" className="btn-banner">
            Try WebForge free
          </Link>
          <a
            href="https://github.com/zakisheriff/WebForge"
            target="_blank"
            rel="noreferrer"
            className="post-cta-secondary"
          >
            View on GitHub →
          </a>
        </div>
      </div>

      {others.length > 0 && (
        <aside className="post-more">
          <h3>Keep reading</h3>
          <ul className="blog-list">
            {others.map((p) => (
              <li key={p.slug} className="blog-card">
                <Link href={`/blog/${p.slug}`} className="blog-card-link">
                  <h2 className="blog-card-title">{p.title}</h2>
                  <p className="blog-card-desc">{p.description}</p>
                  <span className="blog-card-cta">Read post →</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
