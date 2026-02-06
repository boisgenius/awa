'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement">
        🚀 Build skills for AI agents —{' '}
        <Link href="/developers">Get early access to our developer platform →</Link>
      </div>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <span className="logo-icon">🦞</span>
            <span className="logo-text">
              <span className="claw">CLAW</span>
              <span className="academy">ACADEMY</span>
            </span>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">Browse</div>
              <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
                <span className="nav-item-icon">🏠</span> Home
              </Link>
              <Link href="/marketplace" className={`nav-item ${pathname === '/marketplace' ? 'active' : ''}`}>
                <span className="nav-item-icon">📦</span> All Skills
                <span className="nav-item-count">142</span>
              </Link>
              <Link href="/trending" className="nav-item">
                <span className="nav-item-icon">🔥</span> Trending
              </Link>
              <Link href="/top-rated" className="nav-item">
                <span className="nav-item-icon">⭐</span> Top Rated
              </Link>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">Categories</div>
              <Link href="/category/research" className="nav-item">
                <span className="nav-item-icon">🔬</span> Research
              </Link>
              <Link href="/category/finance" className="nav-item">
                <span className="nav-item-icon">📈</span> Finance
              </Link>
              <Link href="/category/coding" className="nav-item">
                <span className="nav-item-icon">💻</span> Coding
              </Link>
              <Link href="/category/security" className="nav-item">
                <span className="nav-item-icon">🛡️</span> Security
              </Link>
              <Link href="/category/creative" className="nav-item">
                <span className="nav-item-icon">🎨</span> Creative
              </Link>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">My Account</div>
              <Link href="/saved" className="nav-item">
                <span className="nav-item-icon">💾</span> Saved
              </Link>
              <Link href="/purchased" className="nav-item">
                <span className="nav-item-icon">🛒</span> Purchased
              </Link>
              <Link href="/settings" className="nav-item">
                <span className="nav-item-icon">⚙️</span> Settings
              </Link>
            </div>
          </nav>

          <div className="token-widget">
            <div className="token-header">
              <span>⚡</span>
              <span className="token-name">$AWA</span>
              <span className="token-change">+12.4%</span>
            </div>
            <div className="token-price">$0.0847</div>
            <div className="token-stats">
              <span>MCap <span className="value">$8.4M</span></span>
              <span>Vol 24h <span className="value">$847K</span></span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main">
          {/* Top Navigation */}
          <nav className="top-nav">
            <div className="nav-tabs">
              <Link href="/" className={`nav-tab ${pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
              <Link href="/marketplace" className={`nav-tab ${pathname === '/marketplace' ? 'active' : ''}`}>
                Marketplace
              </Link>
              <Link href="/leaderboard" className={`nav-tab ${pathname === '/leaderboard' ? 'active' : ''}`}>
                Leaderboard
              </Link>
              <Link href="/developers" className="nav-tab">
                Developers
              </Link>
            </div>
            <div className="nav-right">
              <div className="search-box">
                <input type="text" placeholder="Search skills..." />
                <span className="kbd">⌘K</span>
              </div>
              <button className="connect-btn">Connect</button>
            </div>
          </nav>

          {/* Page Content */}
          {children}

          {/* Footer */}
          <footer className="footer">
            <div className="footer-links">
              <Link href="/docs">Documentation</Link>
              <Link href="/api-docs">API</Link>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
            <div className="footer-copy">© 2026 Claw Academy · Built on OpenClaw</div>
          </footer>
        </main>
      </div>
    </>
  );
}
