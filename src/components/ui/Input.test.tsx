import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';
import { describe, it, expect, vi } from 'vitest';

describe('Input', () => {
    it('renders with label', () => {
        render(<Input label="Username" placeholder="Enter username" />);
        expect(screen.getByText(/Username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter username/i)).toBeInTheDocument();
    });

    it('renders as a textarea when "as" prop is "textarea"', () => {
        render(<Input as="textarea" label="Bio" />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        // and check it is indeed a textarea tag
        expect(screen.getByRole('textbox').tagName.toLowerCase()).toBe('textarea');
    });

    it('shows error message when error prop is provided', () => {
        render(<Input label="Email" error="Invalid email address" />);
        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveClass('border-rose-300');
    });

    it('handles change events', () => {
        const handleChange = vi.fn();
        render(<Input label="Name" onChange={handleChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'John Doe' } });
        expect(handleChange).toHaveBeenCalled();
    });

    it('applies base styles and custom className', () => {
        render(<Input label="Custom" className="custom-class" />);
        expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });
});
