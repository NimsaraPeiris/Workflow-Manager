import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskDetailsPage from './taskDetails';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabaseClient';

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
        activities: []
    };

    const createMock = (data: any) => {
        const mock: any = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data, error: null }),
            order: vi.fn().mockResolvedValue({ data, error: null }),
            insert: vi.fn().mockResolvedValue({ data, error: null }),
            update: vi.fn().mockReturnThis(),
        };
        return mock;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'tasks') return createMock(mockTask) as any;
            return createMock([]) as any;
        });
    });

    it('renders task details correctly', async () => {
        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={mockCurrentUser} />);

        await waitFor(() => {
            expect(screen.getByText('Learn Vitest')).toBeInTheDocument();
            expect(screen.getByText('Testing is fun')).toBeInTheDocument();
        });
    });

    it('shows error if task is not found', async () => {
        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'tasks') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not Found' } })
                } as any;
            }
            return createMock([]) as any;
        });

        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={mockCurrentUser} />);

        await waitFor(() => {
            expect(screen.getByText('Error Loading Task')).toBeInTheDocument();
            expect(screen.getByText('Not Found')).toBeInTheDocument();
        });
    });

    it('calls onBack when back arrow is clicked', async () => {
        render(<TaskDetailsPage taskId={mockTaskId} onBack={mockOnBack} currentUser={mockCurrentUser} />);

        await waitFor(() => {
            const backBtn = screen.getAllByRole('button')[0];
            fireEvent.click(backBtn);
            expect(mockOnBack).toHaveBeenCalled();
        });
    });
});
