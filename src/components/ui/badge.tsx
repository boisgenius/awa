import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'live' | 'dev' | 'high' | 'medium' | 'emerging' | 'default';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        'border transition-colors',
        {
          // Live status - green
          live: 'border-accent-secondary/50 text-accent-secondary bg-accent-secondary/10',
          // Dev status - yellow
          dev: 'border-accent-warning/50 text-accent-warning bg-accent-warning/10',
          // High priority - crimson
          high: 'border-crimson/50 text-crimson bg-crimson/10',
          // Medium priority
          medium: 'border-accent-info/50 text-accent-info bg-accent-info/10',
          // Emerging
          emerging: 'border-accent-teal/50 text-accent-teal bg-accent-teal/10',
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
