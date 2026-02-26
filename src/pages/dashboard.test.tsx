import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from './dashboard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabaseClient';

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn().mockResolvedValue({ data: [], error: null })
                    })),
                    or: vi.fn().mockResolvedValue({ data: [], error: null }),
                    mockResolvedValue: vi.fn().mockResolvedValue({ data: [], error: null })
                })),
                order_minimal: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
        }))
    }
}));

// Helper to mock a chainable supabase query
const createMockSupabase = (data: any) => {
    const mockObj: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data, error: null }),
    };
    return mockObj;
};

describe('DashboardPage', () => {
    const mockUser = {
        id: 'user-123',
        user_metadata: {
            role: 'HEAD',
            department_id: 'dept-1'
        }
    };

    const mockProps = {
        onTaskClick: vi.fn(),
        currentUser: mockUser,
        filterDeptId: null,
        onRefreshStats: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock responses
        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'tasks') return createMockSupabase([]);
            if (table === 'departments') return createMockSupabase([]);
            if (table === 'profiles') return createMockSupabase([]);
            return createMockSupabase([]);
        });
    });

    it('renders header and titles', async () => {
        render(<DashboardPage {...mockProps} />);

        await waitFor(() => {
            expect(screen.getByText(/General Tasks/i)).toBeInTheDocument();
        });
    });

    it('opens create task modal when clicking new task button', async () => {
        render(<DashboardPage {...mockProps} />);

        // TaskHeader should have New Task button
        const newBtn = screen.getByText(/New Task/i);
        fireEvent.click(newBtn);

        expect(screen.getByRole('heading', { name: /create task/i })).toBeInTheDocument();
    });

    it('filters tasks based on search query', async () => {
        const mockTasks = [
            { id: '1', title: 'Find Me', description: '', status: 'CREATED', priority: 'MEDIUM' },
            { id: '2', title: 'Other', description: '', status: 'CREATED', priority: 'MEDIUM' }
        ];

        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'tasks') return createMockSupabase(mockTasks);
            return createMockSupabase([]);
        });

        render(<DashboardPage {...mockProps} />);

        await waitFor(() => {
            expect(screen.getByText('Find Me')).toBeInTheDocument();
            expect(screen.getByText('Other')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/Search tasks/i);
        fireEvent.change(searchInput, { target: { value: 'Find' } });

        expect(screen.getByText('Find Me')).toBeInTheDocument();
        expect(screen.queryByText('Other')).not.toBeInTheDocument();
    });
});
