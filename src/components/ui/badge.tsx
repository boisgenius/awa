import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'live' | 'dev' | 'high' | 'medium' | 'emerging' | 'default';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-3 py-1 text-[10px] font-semibold uppercase',
        'border transition-colors',
        {
          // Live status - green with background
          live: 'border-accent-secondary/30 text-accent-secondary bg-accent-secondary/10',
          // Dev status - yellow with background
          dev: 'border-accent-warning/30 text-accent-warning bg-accent-warning/10',
          // High priority - crimson outline only
          high: 'border-crimson text-crimson bg-transparent',
          // Medium priority - warning outline only
          medium: 'border-accent-warning text-accent-warning bg-transparent',
          // Emerging - info outline only
          emerging: 'border-accent-info text-accent-info bg-transparent',
          // Default
          default: 'border-border-default text-text-secondary bg-bg-tertiary',
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
