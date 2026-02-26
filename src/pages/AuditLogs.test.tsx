import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuditLogsPage from './AuditLogs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabaseClient';

vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
        }))
    }
}));

vi.mock('framer-motion', () => ({
    motion: {
        tr: ({ children, className }: any) => <tr className={className}>{children}</tr>
    }
}));

describe('AuditLogsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders page titles', async () => {
        render(<AuditLogsPage />);
        expect(screen.getByText('System Audit Vault')).toBeInTheDocument();
    });

    it('shows empty state when no logs', async () => {
        render(<AuditLogsPage />);
        await waitFor(() => {
            expect(screen.getByText('No encrypted audit trails found')).toBeInTheDocument();
        });
    });

    it('renders logs list when data is available', async () => {
        const mockLogs = [
            {
                id: 'log-1',
                action: 'USER_LOGIN',
                created_at: new Date().toISOString(),
                entity_type: 'System',
                profile: { full_name: 'John Doe' }
            }
        ];

        vi.mocked(supabase.from).mockImplementation(() => ({
            select: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({ data: mockLogs, error: null })
            }))
        } as any));

        render(<AuditLogsPage />);

        await waitFor(() => {
            expect(screen.getByText('USER LOGIN')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });
    });

    it('filters logs by search input', async () => {
        const mockLogs = [
            { id: '1', action: 'CREATE_TASK', entity_type: 'Task', created_at: new Date().toISOString() },
            { id: '2', action: 'UPDATE_USER', entity_type: 'Profile', created_at: new Date().toISOString() }
        ];

        vi.mocked(supabase.from).mockImplementation(() => ({
            select: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({ data: mockLogs, error: null })
            }))
        } as any));

        render(<AuditLogsPage />);

        await waitFor(() => {
            expect(screen.getByText('CREATE TASK')).toBeInTheDocument();
            expect(screen.getByText('UPDATE USER')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/Filter by action/i);
        fireEvent.change(searchInput, { target: { value: 'CREATE' } });

        expect(screen.getByText('CREATE TASK')).toBeInTheDocument();
        expect(screen.queryByText('UPDATE USER')).not.toBeInTheDocument();
    });
});
