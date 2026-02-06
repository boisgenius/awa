import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-border-default',
          'bg-bg-secondary px-4 py-3 text-[13px] text-text-primary font-mono',
          'placeholder:text-text-muted',
          'focus:outline-none focus:border-crimson focus:shadow-[0_0_0_3px_rgba(228,15,58,0.1)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-150',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
