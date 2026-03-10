import { render, screen, fireEvent } from '@testing-library/react';
import DashboardPage from './dashboard';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Minimal Supabase mock to prevent crashes, but we won't test its calls directly here
vi.mock('../lib/supabaseClient', () => {
    const chain: any = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        or: vi.fn(() => chain),
        neq: vi.fn(() => chain),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        insert: vi.fn(() => chain),
    };
    return {
        supabase: {
            from: vi.fn(() => chain),
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
                getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1', user_metadata: { role: 'HEAD' } } } } }),
                onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
            }
        }
    };
});

// Mock usePermissions to always allow for test purposes
vi.mock('../hooks/usePermissions', () => ({
    usePermissions: () => ({
        user: { id: 'user-1', role: 'HEAD', permissions: ['task:create', 'task:view_dept', 'task:approve', 'task:assign'] },
        loading: false,
        check: (perm: string) => ['task:create', 'task:view_dept', 'task:approve', 'task:assign'].includes(perm),
        hasPermission: (perm: string) => ['task:create', 'task:view_dept', 'task:approve', 'task:assign'].includes(perm),
    })
}));

describe('DashboardPage UI & Logic', () => {
    const mockUserHead = {
        id: 'user-1',
        role: 'HEAD',
        department_id: 'dept-1',
        user_metadata: { role: 'HEAD', department_id: 'dept-1' },
        permissions: ['task:create', 'task:view_dept']
    };


    const mockProps = {
        onTaskClick: vi.fn(),
        currentUser: mockUserHead,
        filterDeptId: null,
        filterTeamId: null,
        onDeptSelect: vi.fn(),
        onOpenCreateModal: vi.fn(),
        currentView: 'dashboard' as const
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the Dashboard header titles', async () => {
        render(<DashboardPage {...mockProps} />);
        expect(await screen.findByText(/Workflow Management/i)).toBeInTheDocument();
        expect(screen.getByText(/Manage and track your team's progress/i)).toBeInTheDocument();
    });

    it('conditionally renders "Initiate Terminal" button based on role', async () => {
        render(<DashboardPage {...mockProps} />);
        expect(await screen.findByText(/Initiate Terminal/i)).toBeInTheDocument();
    });

    it('updates the search input when typing', async () => {
        render(<DashboardPage {...mockProps} />);
        const searchInput = await screen.findByPlaceholderText(/Search for intelligence/i);

        fireEvent.change(searchInput, { target: { value: 'Draft' } });
        expect(searchInput).toHaveValue('Draft');
    });

    it('calls onOpenCreateModal when the Initiate Terminal button is clicked', async () => {
        render(<DashboardPage {...mockProps} />);

        const newBtn = await screen.findByText(/Initiate Terminal/i);
        fireEvent.click(newBtn);

        expect(mockProps.onOpenCreateModal).toHaveBeenCalled();
    });
});
