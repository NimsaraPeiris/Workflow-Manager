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
            in: vi.fn(() => chain),
            limit: vi.fn(() => chain),
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            neq: vi.fn(() => chain),
            order: vi.fn(() => Promise.resolve({ data: Array.isArray(data) ? data : [], error: null })),
            single: vi.fn(() => Promise.resolve({ data: Array.isArray(data) ? null : data, error: null })),
            update: vi.fn(() => chain),
            insert: vi.fn(() => Promise.resolve({ error: null })),
            delete: vi.fn(() => chain),
        };
        return chain;
    };

    return {
        supabase: {
            from: vi.fn((table: string) => {
                if (!chains[table]) {
                    if (table === 'profiles') chains[table] = createChain([{ id: 'worker-1', role: 'EMPLOYEE', full_name: 'Jane Worker' }]);
                    else if (table === 'departments') chains[table] = createChain([{ id: 'dept-1', name: 'Engineering' }]);
                    else if (table === 'teams') chains[table] = createChain([]);
                    else chains[table] = createChain({});
                }
                return chains[table];
            }),
            auth: {
                getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
                onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
            },
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
        div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
        span: ({ children, className }: any) => <span className={className}>{children}</span>,
        p: ({ children, className }: any) => <p className={className}>{children}</p>,
        button: ({ children, className, onClick }: any) => <button className={className} onClick={onClick}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('TaskDetailsPage', () => {
    const mockTaskId = 'task-123';
    const mockOnBack = vi.fn();
    const mockCurrentUser = {
        id: 'user-1',
        role: 'HEAD',
        department_id: 'dept-1',
        user_metadata: { role: 'HEAD', department_id: 'dept-1' },
        permissions: ['task:view_dept', 'task:approve', 'task:assign', 'task:create', 'user:view', 'team:view_dept', 'team:manage']
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
        total_time_spent: 0,
        creator: { full_name: 'John Creator' },
        assignee: { full_name: 'Jane Assignee' },
        department: { name: 'Engineering' },
        sub_tasks: [],
        activities: []
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
            role: 'SUPER_ADMIN',
            user_metadata: { role: 'SUPER_ADMIN' },
            permissions: []
        };
        const taskNotCreatedByAdmin = { ...mockTask, creator_id: 'other-user' };

        // Mock auth to return the admin user for PermissionGuard
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: { user: adminUser } }
        } as any);

        const chain = (supabase.from('tasks') as any);
        chain.single.mockResolvedValue({ data: taskNotCreatedByAdmin, error: null });
        // profiles chain needs to return the admin profile for usePermissions
        const profilesChain = (supabase.from('profiles') as any);
        profilesChain.maybeSingle.mockResolvedValue({ data: { ...adminUser, id: 'admin-1', role: 'SUPER_ADMIN' }, error: null });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={adminUser} />);

        await waitFor(() => {
            expect(screen.getByText(/Cancel Task/i)).toBeInTheDocument();
        });
    });

    it('shows "Request Cancellation" for HEAD role if not creator', async () => {
        const headUser = {
            id: 'head-1',
            role: 'HEAD',
            department_id: 'dept-1',
            user_metadata: { role: 'HEAD', department_id: 'dept-1' },
            permissions: ['task:view_dept', 'task:approve', 'task:assign', 'task:create']
        };
        const taskNotCreatedByHead = { ...mockTask, creator_id: 'other-user', department_id: 'dept-1', sub_tasks: [], activities: [] };

        // Mock auth to return the head user for PermissionGuard
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: { user: headUser } }
        } as any);

        const chain = (supabase.from('tasks') as any);
        chain.single.mockResolvedValue({ data: taskNotCreatedByHead, error: null });
        const profilesChain = (supabase.from('profiles') as any);
        profilesChain.maybeSingle.mockResolvedValue({ data: { ...headUser, id: 'head-1' }, error: null });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={headUser} />);

        await waitFor(() => {
            expect(screen.getByText(/Request Cancellation/i)).toBeInTheDocument();
        });
    });

    it('shows "Approve" and "Reject" for Super Admin even if not creator', async () => {
        const adminUser = {
            id: 'admin-1',
            role: 'SUPER_ADMIN',
            user_metadata: { role: 'SUPER_ADMIN' },
            permissions: []
        };
        const taskSubmittedByOther = { ...mockTask, creator_id: 'other-user', status: 'SUBMITTED', sub_tasks: [], activities: [] };

        vi.mocked(supabase.auth.getSession).mockResolvedValue({
            data: { session: { user: adminUser } }
        } as any);

        const chain = (supabase.from('tasks') as any);
        chain.single.mockResolvedValue({ data: taskSubmittedByOther, error: null });
        const profilesChain = (supabase.from('profiles') as any);
        profilesChain.maybeSingle.mockResolvedValue({ data: { ...adminUser, id: 'admin-1', role: 'SUPER_ADMIN' }, error: null });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={adminUser} />);

        await waitFor(() => {
            expect(screen.getByText(/Approve/i)).toBeInTheDocument();
            expect(screen.getByText(/Reject/i)).toBeInTheDocument();
        });
    });
});
