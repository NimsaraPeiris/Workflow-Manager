import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskDetailsPage from './taskDetails';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabaseClient';
import { auditLogger } from '../lib/auditLogger';

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

// Mock Audit Logger
vi.mock('../lib/auditLogger', () => ({
    auditLogger: {
        log: vi.fn()
    }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
        p: ({ children, className }: any) => <p className={className}>{children}</p>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('Task LifeCycle Integration (Requester Flow)', () => {
    const mockTaskId = 'task-456';
    const mockOnBack = vi.fn();
    const mockRequester = {
        id: 'creator-1',
        user_metadata: { role: 'HEAD', department_id: 'dept-1' }
    };

    const submittedTask = {
        id: 'task-456',
        title: 'Complete Integration Tests',
        description: 'Need to verify gaps are closed',
        status: 'SUBMITTED',
        priority: 'MEDIUM',
        department_id: 'dept-2',
        creator_id: 'creator-1',
        assignee_id: 'worker-1',
        due_date: '2025-12-31',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        activities: [],
        creator: { full_name: 'John Creator' },
        assignee: { full_name: 'Jane Worker' },
        department: { name: 'Engineering' }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('integration: requester can reject a submitted task with a mandatory comment', async () => {
        const taskChain = (supabase.from('tasks') as any);
        taskChain.single.mockResolvedValue({ data: submittedTask, error: null });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={mockRequester} />);

        // 1. Wait for task to load and check if Approve/Reject buttons are visible
        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
            expect(screen.getByText('Reject')).toBeInTheDocument();
        });

        // 2. Click Reject - Decision Modal should appear
        const rejectBtn = screen.getByText('Reject');
        fireEvent.click(rejectBtn);

        expect(screen.getByText('Reject Submission')).toBeInTheDocument();

        // 3. Try to confirm without a comment - should show validation error
        const confirmBtn = screen.getByText('Confirm Rejection');
        fireEvent.click(confirmBtn);
        expect(screen.getByText(/A comment is required for rejection/i)).toBeInTheDocument();

        // 4. Enter a rejection reason and confirm
        const textarea = screen.getByPlaceholderText(/describe the changes required/i);
        fireEvent.change(textarea, { target: { value: 'Incomplete implementation' } });
        fireEvent.click(confirmBtn);

        // 5. Verify the full integration chain:
        await waitFor(() => {
            // Check status update in Supabase
            expect(supabase.from).toHaveBeenCalledWith('tasks');
            // Check audit log was recorded with the comment
            expect(auditLogger.log).toHaveBeenCalledWith(expect.objectContaining({
                action: 'TASK_STATUS_UPDATE',
                newData: expect.objectContaining({
                    status: 'REJECTED',
                    reason: 'Incomplete implementation'
                })
            }));
            // Check activity timeline was updated with comment
            expect(supabase.from).toHaveBeenCalledWith('task_activities');
        });
    });
});
