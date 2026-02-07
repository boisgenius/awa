import Link from 'next/link';

const footerLinks = [
  { label: 'Documentation', href: '/docs' },
  { label: 'API', href: '/api-docs' },
  { label: 'Discord', href: process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.com' },
  { label: 'Twitter', href: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com' },
  { label: 'GitHub', href: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com' },
];

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-bg-secondary py-5 px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Links */}
        <nav className="flex items-center gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-[13px] text-text-muted hover:text-crimson transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <div className="text-xs text-text-muted">
          © 2026 Claw Academy · Built on OpenClaw
        </div>
      </div>
    </footer>
  );
}
