'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Input, IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';

interface NavTab {
  href: string;
  label: string;
}

const navTabs: NavTab[] = [
  { href: '/', label: 'Home' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/developers', label: 'Developers' },
];

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch = true }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-default bg-[rgba(10,10,12,0.95)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Nav Tabs */}
        <nav className="hidden md:flex items-center gap-2">
          {navTabs.map((tab) => {
            const isActive = pathname === tab.href ||
              (tab.href !== '/' && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-all border-b-2',
                  isActive
                    ? 'text-text-primary border-text-primary'
                    : 'text-text-secondary border-transparent hover:text-text-primary'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Search Box */}
          {showSearch && (
            <div className="relative w-60">
              <Input
                type="search"
                placeholder="Search skills..."
                className="pr-12 bg-bg-secondary border-border-default focus:border-crimson"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-bg-tertiary border border-border-default rounded px-1.5 py-0.5 text-[10px] text-text-muted">
                ⌘K
              </span>
            </div>
          )}

          {/* Connect Button */}
          <Button>Connect</Button>
        </div>
      </div>
    </header>
  );
}
