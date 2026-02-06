import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-crimson/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Variants
          {
            // Primary - crimson button
            primary: [
              'bg-crimson text-white font-semibold',
              'hover:shadow-[0_0_20px_rgba(228,15,58,0.4)] hover:-translate-y-0.5',
              'active:bg-burgundy',
            ],
            // Secondary - teal/green accent
            secondary: [
              'bg-accent-teal text-bg-primary',
              'hover:bg-accent-secondary',
            ],
            // Outline
            outline: [
              'border border-border-default bg-transparent text-text-primary',
              'hover:border-crimson hover:text-crimson',
            ],
            // Ghost
            ghost: [
              'bg-transparent text-text-secondary',
              'hover:bg-bg-hover hover:text-text-primary',
            ],
          }[variant],

          // Sizes
          {
            sm: 'h-8 px-3 text-sm gap-1.5',
            md: 'py-3 px-5 text-sm gap-2',
            lg: 'h-12 px-6 text-base gap-2',
          }[size],

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
