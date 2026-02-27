import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './loginPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabaseClient';

// Mock supabase and auditLogger
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn()
        },
        from: vi.fn(() => ({
            insert: vi.fn().mockResolvedValue({ error: null })
        }))
    }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: any) => <div className={className}>{children}</div>
    }
}));

describe('LoginPage', () => {
    const mockOnLogin = vi.fn();
    const mockOnSwitchToRegister = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', () => {
        render(<LoginPage onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);
        expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('calls onSwitchToRegister when clicking register link', () => {
        render(<LoginPage onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);
        fireEvent.click(screen.getByText('Register Now'));
        expect(mockOnSwitchToRegister).toHaveBeenCalled();
    });

    it('handles successful login', async () => {
        const mockUser = { id: 'user-123' };
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
            data: { user: mockUser },
            error: null
        } as any);

        render(<LoginPage onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);

        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        // Use submit on the form or click the button
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
            expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
        });
    });

    it('shows error message on failed login', async () => {
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid credentials' }
        } as any);

        render(<LoginPage onLogin={mockOnLogin} onSwitchToRegister={mockOnSwitchToRegister} />);

        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        // Increase timeout for motion or other async effects
        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
