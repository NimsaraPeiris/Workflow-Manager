import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskDetailsPage from './taskDetails';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabaseClient';

// Mock Supabase with a consistent chain pattern
vi.mock('../lib/supabaseClient', () => {
    const chains: Record<string, any> = {};
    const createChain = (data: any = {}) => {
        const chain: any = {
            select: vi.fn(() => chain),
            eq: vi.fn(() => chain),
            or: vi.fn(() => chain),
            order: vi.fn(() => Promise.resolve({ data: Array.isArray(data) ? data : [], error: null })),
            single: vi.fn(() => Promise.resolve({ data: Array.isArray(data) ? null : data, error: null })),
            update: vi.fn(() => chain),
            insert: vi.fn(() => Promise.resolve({ error: null })),
        };
        return chain;
    };

    return {
        supabase: {
            from: vi.fn((table: string) => {
                if (!chains[table]) {
                    if (table === 'profiles') chains[table] = createChain([{ id: 'worker-1', role: 'EMPLOYEE', full_name: 'Jane Worker' }]);
                    else if (table === 'departments') chains[table] = createChain([{ id: 'dept-1', name: 'Engineering' }]);
                    else chains[table] = createChain({});
                }
                return chains[table];
            }),
            storage: {
                from: vi.fn(() => ({
                    upload: vi.fn().mockResolvedValue({ error: null }),
                    getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://example.com' } }))
                }))
            }
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
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('TaskDetailsPage', () => {
    const mockTaskId = 'task-123';
    const mockOnBack = vi.fn();
    const mockCurrentUser = {
        id: 'user-1',
        user_metadata: { role: 'HEAD', department_id: 'dept-1' }
    };

    const mockTask = {
        id: 'task-123',
        title: 'Learn Vitest',
        description: 'Testing is fun',
        status: 'CREATED',
        priority: 'HIGH',
        department_id: 'dept-1',
        creator_id: 'user-1',
        assignee_id: 'user-2',
        due_date: '2025-12-31',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        activities: [],
        creator: { full_name: 'John Creator' },
        assignee: { full_name: 'Jane Assignee' },
        department: { name: 'Engineering' }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders task details correctly', async () => {
        const chain = (supabase.from('tasks') as any);
        chain.single.mockResolvedValue({ data: mockTask, error: null });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={mockCurrentUser} />);

        await waitFor(() => {
            expect(screen.getByText('Learn Vitest')).toBeInTheDocument();
            expect(screen.getByText('Testing is fun')).toBeInTheDocument();
        });
    });

    it('shows error if task is not found', async () => {
        const chain = (supabase.from('tasks') as any);
        chain.single.mockResolvedValue({ data: null, error: { message: 'Not Found' } });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={mockCurrentUser} />);

        await waitFor(() => {
            expect(screen.getByText('Error Loading Task')).toBeInTheDocument();
            // Match the custom error phrase from taskDetails.tsx
            expect(screen.getByText(/Unauthorized Access/i)).toBeInTheDocument();
        });
    });

    it('calls onBack when back arrow is clicked', async () => {
        const chain = (supabase.from('tasks') as any);
        chain.single.mockResolvedValue({ data: mockTask, error: null });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={mockCurrentUser} />);

        await waitFor(() => {
            const backBtn = screen.getAllByRole('button')[0];
            fireEvent.click(backBtn);
            expect(mockOnBack).toHaveBeenCalled();
        });
    });

    it('shows "Cancel Task" directly for Super Admin even if not creator', async () => {
        const adminUser = {
            id: 'admin-1',
            user_metadata: { role: 'SUPER_ADMIN' }
        };
        const taskNotCreatedByAdmin = { ...mockTask, creator_id: 'other-user' };

        const chain = (supabase.from('tasks') as any);
        chain.single.mockResolvedValue({ data: taskNotCreatedByAdmin, error: null });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={adminUser} />);

        await waitFor(() => {
            expect(screen.getByText(/Cancel Task/i)).toBeInTheDocument();
            expect(screen.queryByText(/Request Cancellation/i)).not.toBeInTheDocument();
        });
    });

    it('shows "Request Cancellation" for HEAD role if not creator', async () => {
        const headUser = {
            id: 'head-1',
            user_metadata: { role: 'HEAD', department_id: 'dept-1' }
        };
        const taskNotCreatedByHead = { ...mockTask, creator_id: 'other-user', department_id: 'dept-1' };

        const chain = (supabase.from('tasks') as any);
        chain.single.mockResolvedValue({ data: taskNotCreatedByHead, error: null });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={headUser} />);

        await waitFor(() => {
            expect(screen.getByText(/Request Cancellation/i)).toBeInTheDocument();
            expect(screen.queryByText(/Cancel Task/i)).not.toBeInTheDocument();
        });
    });

    it('shows "Approve" and "Reject" for Super Admin even if not creator', async () => {
        const adminUser = {
            id: 'admin-1',
            user_metadata: { role: 'SUPER_ADMIN' }
        };
        const taskSubmittedByOther = { ...mockTask, creator_id: 'other-user', status: 'SUBMITTED' };

        const chain = (supabase.from('tasks') as any);
        chain.single.mockResolvedValue({ data: taskSubmittedByOther, error: null });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={adminUser} />);

        await waitFor(() => {
            expect(screen.getByText(/Approve/i)).toBeInTheDocument();
            expect(screen.getByText(/Reject/i)).toBeInTheDocument();
        });
    });
});
