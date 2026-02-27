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

        rerender(<Badge variant="green">Green</Badge>);
        expect(screen.getByText(/Green/i)).toHaveClass('bg-green-50', 'text-green-600');

        rerender(<Badge variant="yellow">Yellow</Badge>);
        expect(screen.getByText(/Yellow/i)).toHaveClass('bg-yellow-50', 'text-yellow-600');

        rerender(<Badge variant="rose">Rose</Badge>);
        expect(screen.getByText(/Rose/i)).toHaveClass('bg-rose-50', 'text-rose-600');
    });

    it('applies custom className', () => {
        render(<Badge className="custom-test">Custom</Badge>);
        expect(screen.getByText(/Custom/i)).toHaveClass('custom-test');
    });
});
