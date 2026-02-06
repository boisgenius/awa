import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function Pill({ className, active = false, children, ...props }: PillProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium',
        'border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-crimson/50',
        active
          ? 'border-crimson bg-crimson text-white'
          : 'border-border-default bg-transparent text-text-secondary hover:border-crimson hover:text-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { Pill };
