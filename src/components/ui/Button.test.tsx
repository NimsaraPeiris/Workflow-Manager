import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button', () => {
    it('renders with children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when loading prop is true', () => {
        render(<Button loading>Submit</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Submit</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders left icon when provided', () => {
        const Icon = <span data-testid="test-icon">icon</span>;
        render(<Button leftIcon={Icon}>With Icon</Button>);
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
        const { rerender } = render(<Button variant="danger">Danger</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-rose-600');

        rerender(<Button variant="primary">Primary</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-orange-600');
    });

    it('applies size classes correctly', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-3');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('px-8');
    });
});
