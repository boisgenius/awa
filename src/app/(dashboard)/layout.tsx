'use client';

import { Suspense, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTokenData } from '@/lib/token/use-token-data';
import { TOKEN_CONFIG } from '@/lib/token/config';

function formatUsd(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toPrecision(4)}`;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const { data: tokenData, loading: tokenLoading } = useTokenData();
  const tokenAvailable = tokenData?.available;

  const currentQuery = searchParams.get('q') || '';

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      const searchablePages = ['/', '/marketplace', '/trending', '/top-rated', '/leaderboard', '/saved'];
      const isSearchable = searchablePages.includes(pathname) || pathname.startsWith('/category/');
      const target = isSearchable ? pathname : '/marketplace';
      router.push(`${target}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Cmd+K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
              <Link href="/trending" className={`nav-item ${pathname === '/trending' ? 'active' : ''}`}>
                <span className="nav-item-icon">🔥</span> Trending
              </Link>
              <Link href="/top-rated" className={`nav-item ${pathname === '/top-rated' ? 'active' : ''}`}>
                <span className="nav-item-icon">⭐</span> Top Rated
              </Link>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">Categories</div>
              <Link href="/category/research" className={`nav-item ${pathname === '/category/research' ? 'active' : ''}`}>
                <span className="nav-item-icon">🔬</span> Research
              </Link>
              <Link href="/category/finance" className={`nav-item ${pathname === '/category/finance' ? 'active' : ''}`}>
                <span className="nav-item-icon">📈</span> Finance
              </Link>
              <Link href="/category/coding" className={`nav-item ${pathname === '/category/coding' ? 'active' : ''}`}>
                <span className="nav-item-icon">💻</span> Coding
              </Link>
              <Link href="/category/security" className={`nav-item ${pathname === '/category/security' ? 'active' : ''}`}>
                <span className="nav-item-icon">🛡️</span> Security
              </Link>
              <Link href="/category/creative" className={`nav-item ${pathname === '/category/creative' ? 'active' : ''}`}>
                <span className="nav-item-icon">🎨</span> Creative
              </Link>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">My Account</div>
              <Link href="/saved" className={`nav-item ${pathname === '/saved' ? 'active' : ''}`}>
                <span className="nav-item-icon">💾</span> Saved
              </Link>
              <Link href="/purchased" className={`nav-item ${pathname === '/purchased' ? 'active' : ''}`}>
                <span className="nav-item-icon">🛒</span> Purchased
              </Link>
              <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
                <span className="nav-item-icon">⚙️</span> Settings
              </Link>
            </div>
          </nav>

          {/* Token Widget */}
          {TOKEN_CONFIG.mintAddress ? (
            <a
              href={TOKEN_CONFIG.pumpFunUrl(TOKEN_CONFIG.mintAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="token-widget"
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <div className="token-header">
                <span>⚡</span>
                <span className="token-name">{TOKEN_CONFIG.symbol}</span>
                {tokenAvailable && tokenData.priceChange24h !== 0 && (
                  <span className={`token-change${tokenData.priceChange24h < 0 ? ' negative' : ''}`}>
                    {tokenData.priceChange24h > 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="token-price">
                {tokenLoading || !tokenAvailable ? '--' : formatUsd(tokenData.price)}
              </div>
              <div className="token-stats">
                <span>MCap <strong>{tokenLoading || !tokenAvailable ? '--' : formatUsd(tokenData.marketCap)}</strong></span>
                <span>Vol 24h <strong>{tokenLoading || !tokenAvailable ? '--' : formatUsd(tokenData.volume24h)}</strong></span>
              </div>
            </a>
          ) : (
            <div className="token-widget" style={{ opacity: 0.6 }}>
              <div className="token-header">
                <span>⚡</span>
                <span className="token-name">{TOKEN_CONFIG.symbol} · Coming Soon</span>
              </div>
              <div className="token-price">--</div>
              <div className="token-stats">
                <span>MCap <strong>--</strong></span>
                <span>Vol 24h <strong>--</strong></span>
              </div>
            </div>
          )}
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
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search skills..."
                  defaultValue={currentQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <span className="kbd">⌘K</span>
              </div>
            </div>
          </nav>

          {/* Page Content */}
          {children}

          {/* Footer */}
          <footer className="footer">
            <div className="footer-links">
              <Link href="/developers">Documentation</Link>
              <Link href="/openapi.yaml" target="_blank">API Spec</Link>
              <a href={process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.com'} target="_blank" rel="noopener noreferrer">Discord</a>
              <a href={process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com'} target="_blank" rel="noopener noreferrer">Twitter</a>
              <a href={process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com'} target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
            <div className="footer-copy">© 2026 Claw Academy · Built on OpenClaw</div>
          </footer>
        </main>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
