'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  count?: number;
}

const browseItems: NavItem[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/marketplace', label: 'All Skills', icon: '📦', count: 142 },
  { href: '/trending', label: 'Trending', icon: '🔥' },
  { href: '/top-rated', label: 'Top Rated', icon: '⭐' },
];

const categoryItems: NavItem[] = [
  { href: '/category/research', label: 'Research', icon: '🔬' },
  { href: '/category/finance', label: 'Finance', icon: '📈' },
  { href: '/category/coding', label: 'Coding', icon: '💻' },
  { href: '/category/security', label: 'Security', icon: '🛡️' },
  { href: '/category/creative', label: 'Creative', icon: '🎨' },
];

const accountItems: NavItem[] = [
  { href: '/saved', label: 'Saved', icon: '💾' },
  { href: '/purchased', label: 'Purchased', icon: '🛒' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      <div className="px-5 py-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
        {title}
      </div>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all relative',
              isActive
                ? 'text-crimson bg-crimson/10'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-crimson rounded-r" />
            )}
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
            {item.count && (
              <span className="ml-auto bg-crimson text-white text-[11px] px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-sidebar border-r border-border-default bg-bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border-default flex items-center gap-3">
        <span className="text-2xl">🦞</span>
        <span className="text-base font-bold">
          <span className="text-crimson">CLAW</span>
          <span className="text-text-primary">ACADEMY</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <NavSection title="Browse" items={browseItems} />
        <NavSection title="Categories" items={categoryItems} />
        <NavSection title="My Account" items={accountItems} />
      </nav>

      {/* Token Widget */}
      <div className="m-4 p-4 rounded-lg bg-gradient-to-br from-crimson/15 to-crimson/5 border border-crimson/30">
        <div className="flex items-center gap-2 mb-2">
          <span>⚡</span>
          <span className="font-semibold text-sm">$AWA</span>
          <span className="ml-auto text-xs text-accent-secondary">+12.4%</span>
        </div>
        <div className="text-2xl font-bold text-crimson mb-3">$0.0847</div>
        <div className="flex gap-4 text-xs text-text-muted">
          <span>MCap <span className="text-text-primary font-medium">$8.4M</span></span>
          <span>Vol 24h <span className="text-text-primary font-medium">$847K</span></span>
        </div>
      </div>
    </aside>
  );
}
