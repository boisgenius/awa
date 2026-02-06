import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Live</Badge>);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('applies live variant styles', () => {
    render(<Badge variant="live">Live</Badge>);
    const badge = screen.getByText('Live');
    expect(badge).toHaveClass('text-accent-secondary');
  });

  it('applies dev variant styles', () => {
    render(<Badge variant="dev">Dev</Badge>);
    const badge = screen.getByText('Dev');
    expect(badge).toHaveClass('text-accent-warning');
  });

  it('applies high variant styles', () => {
    render(<Badge variant="high">High</Badge>);
    const badge = screen.getByText('High');
    expect(badge).toHaveClass('text-crimson');
  });

  it('applies default variant when no variant specified', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('text-text-secondary');
  });
});
