import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './registerPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabaseClient';

vi.mock('../lib/supabaseClient', () => {
    const mockFrom = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [{ id: '1', name: 'Design' }], error: null })
    };
    return {
        supabase: {
            auth: {
                signUp: vi.fn()
            },
            from: vi.fn(() => mockFrom)
        }
    };
});

vi.mock('../lib/auditLogger', () => ({
    auditLogger: {
        log: vi.fn()
    }
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className }: any) => <div className={className}>{children}</div>
    }
}));

describe('RegisterPage', () => {
    const mockOnSwitchToLogin = vi.fn();
    const mockOnRegisterSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders registration form', async () => {
        render(<RegisterPage onSwitchToLogin={mockOnSwitchToLogin} onRegisterSuccess={mockOnRegisterSuccess} />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('yourname@fochant.lk')).toBeInTheDocument();
        });
    });

    it('validates organization email', async () => {
        render(<RegisterPage onSwitchToLogin={mockOnSwitchToLogin} onRegisterSuccess={mockOnRegisterSuccess} />);

        // Wait for departments to load
        await waitFor(() => {
            expect(screen.getByText('Design')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('yourname@fochant.lk'), { target: { value: 'test@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(screen.getByText(/Please use your organization email/i)).toBeInTheDocument();
        });
    });

    it('handles successful registration', async () => {
        vi.mocked(supabase.auth.signUp).mockResolvedValue({
            data: { user: { id: 'user-123' }, session: { access_token: 'tok' } },
            error: null
        } as any);

        render(<RegisterPage onSwitchToLogin={mockOnSwitchToLogin} onRegisterSuccess={mockOnRegisterSuccess} />);

        // Wait for departments to load
        await waitFor(() => {
            expect(screen.getByText('Design')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('yourname@fochant.lk'), { target: { value: 'john@fochant.lk' } });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalled();
            expect(mockOnRegisterSuccess).toHaveBeenCalled();
        });
    });
});
