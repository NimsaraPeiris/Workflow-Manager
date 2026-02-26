import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';
import { describe, it, expect } from 'vitest';

describe('Badge', () => {
    it('renders children correctly', () => {
        render(<Badge>Active</Badge>);
        expect(screen.getByText(/Active/i)).toBeInTheDocument();
    });

    it('applies default slate variant', () => {
        render(<Badge>Default</Badge>);
        const badge = screen.getByText(/Default/i);
        expect(badge).toHaveClass('bg-slate-50', 'text-slate-600');
    });

    it('applies variants correctly', () => {
        const { rerender } = render(<Badge variant="orange">Orange</Badge>);
        expect(screen.getByText(/Orange/i)).toHaveClass('bg-orange-50', 'text-orange-600');

        rerender(<Badge variant="emerald">Emerald</Badge>);
        expect(screen.getByText(/Emerald/i)).toHaveClass('bg-emerald-50', 'text-emerald-600');

        rerender(<Badge variant="rose">Rose</Badge>);
        expect(screen.getByText(/Rose/i)).toHaveClass('bg-rose-50', 'text-rose-600');
    });

    it('applies custom className', () => {
        render(<Badge className="custom-test">Custom</Badge>);
        expect(screen.getByText(/Custom/i)).toHaveClass('custom-test');
    });
});
