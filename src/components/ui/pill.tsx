import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: 'sm' | 'md';
  count?: number;
}

function Pill({ className, active = false, size = 'md', count, children, ...props }: PillProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        'border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-crimson/50',
        // Size variants
        size === 'sm'
          ? 'px-3 py-2 text-xs'
          : 'px-4 py-2 text-[13px]',
        // Active states
        active
          ? 'border-crimson bg-crimson text-white'
          : 'border-border-default bg-transparent text-text-secondary hover:border-crimson hover:text-text-primary',
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className="ml-2 text-[11px] opacity-70">{count}</span>
      )}
    </button>
  );
}

export { Pill };
