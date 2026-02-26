import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskDetailsPage from './taskDetails';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabaseClient';
import { auditLogger } from '../lib/auditLogger';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(),
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://example.com' } }))
            }))
        }
    }
}));

// Mock Audit Logger to verify it's called
vi.mock('../lib/auditLogger', () => ({
    auditLogger: {
        log: vi.fn()
    }
}));

// Mock framer-motion to avoid animation issues in jsdom
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
        activities: []
    };

    const createSupabaseMock = (data: any) => {
        const mock: any = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data, error: null }),
            update: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            or: vi.fn().mockReturnThis(),
        };
        return mock;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup initial task query
        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'tasks') return createSupabaseMock(submittedTask) as any;
            return createSupabaseMock([]) as any;
        });
    });

    it('integration: requester can reject a submitted task with a mandatory comment', async () => {
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
        expect(screen.getByText(/providing clear feedback/i)).toBeInTheDocument();

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
