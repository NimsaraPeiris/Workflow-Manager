import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from './dashboard';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Minimal Supabase mock to prevent crashes, but we won't test its calls directly here
vi.mock('../lib/supabaseClient', () => {
    const chain: any = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        or: vi.fn(() => chain),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        insert: vi.fn(() => chain),
    };
    return {
        supabase: {
            from: vi.fn(() => chain),
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
            }
        }
    };
});

describe('DashboardPage UI & Logic', () => {
    const mockUserHead = {
        id: 'user-1',
        user_metadata: { role: 'HEAD', department_id: 'dept-1' }
    };

    const mockUserEmployee = {
        id: 'user-2',
        user_metadata: { role: 'EMPLOYEE', department_id: 'dept-1' }
    };

    const mockProps = {
        onTaskClick: vi.fn(),
        currentUser: mockUserHead,
        filterDeptId: null,
        onRefreshStats: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the Dashboard header titles', () => {
        render(<DashboardPage {...mockProps} />);
        expect(screen.getByText('Tasks')).toBeInTheDocument();
        expect(screen.getByText(/Manage and track your team's progress/i)).toBeInTheDocument();
    });

    it('conditionally renders "New Task" button based on role', () => {
        const { rerender } = render(<DashboardPage {...mockProps} />);
        expect(screen.getByText(/New Task/i)).toBeInTheDocument();

        rerender(<DashboardPage {...mockProps} currentUser={mockUserEmployee} />);
        expect(screen.queryByText(/New Task/i)).not.toBeInTheDocument();
    });

    it('updates the search input when typing', () => {
        render(<DashboardPage {...mockProps} />);
        const searchInput = screen.getByPlaceholderText(/Search tasks/i);

        fireEvent.change(searchInput, { target: { value: 'Draft' } });
        expect(searchInput).toHaveValue('Draft');
    });

    it('shows the Create Task modal when the New Task button is clicked', async () => {
        render(<DashboardPage {...mockProps} />);

        const newBtn = screen.getByText(/New Task/i);
        fireEvent.click(newBtn);

        expect(screen.getByText(/Task Title/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g. Design Landing Page/i)).toBeInTheDocument();
    });
});
