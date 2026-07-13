import Link from "next/link";

const CONTACT_EMAIL = "connect.theatom@gmail.com";

/** Shared chrome (nav + footer) for every /blog route. */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="navbar-container">
        <nav className="navbar">
          <Link
            href="/"
            className="nav-brand"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <img
              src="/Logo-WebForge.png"
              alt="WebForge Logo"
              style={{ width: "44px", height: "44px", borderRadius: "4px" }}
            />
            <span
              className="nav-brand-text"
              style={{ fontWeight: 700, letterSpacing: "-0.5px" }}
            >
              WebForge
            </span>
          </Link>

          <ul className="nav-menu-desktop">
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <Link href="/#try" className="btn-nav-split">
                Try It Free
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <main className="blog-main">{children}</main>

      <footer className="footer">
        <div className="footer-bottom" style={{ marginTop: 0 }}>
          <div>&copy; 2026 WebForge by The Atom.</div>
          <div className="social-links" style={{ display: "flex", gap: "18px" }}>
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
            <a
              href="https://github.com/zakisheriff/WebForge"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
