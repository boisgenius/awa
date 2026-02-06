import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-bg-secondary py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-crimson">Claw</span>
            <span className="text-lg font-bold text-text-primary">Academy</span>
            <span className="text-text-muted ml-4">
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/docs"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/support"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Support
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Twitter
            </Link>
            <Link
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Discord
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
