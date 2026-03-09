import { render, screen, fireEvent } from '@testing-library/react';
import { TaskActionsSidebar } from './TaskActionsSidebar';
import { describe, it, expect, vi } from 'vitest';
import type { Task } from '../../types';

// Mock usePermissions to control what gets shown
vi.mock('../../hooks/usePermissions', () => ({
    usePermissions: () => ({
        user: { id: 'user-head', role: 'SUPER_ADMIN', permissions: [] },
        loading: false,
        check: () => true,
        hasPermission: () => true,
    })
}));

describe('TaskActionsSidebar', () => {
    const mockTask: Task = {
        id: 'task-1',
        title: 'Task 1',
        status: 'CREATED',
        priority: 'MEDIUM',
        created_at: '',
        creator_id: 'user-creator',
        department_id: 'dept-1',
        description: '',
        assignee_id: '',
        due_date: '',
        updated_at: '',
        total_time_spent: 0
    };

    const mockUser = {
        id: 'user-head',
        role: 'SUPER_ADMIN',
        department_id: 'dept-1',
        user_metadata: {
            role: 'SUPER_ADMIN',
            department_id: 'dept-1'
        }
    };

    const mockProps = {
        task: mockTask,
        currentUser: mockUser,
        updating: false,
        onUpdateStatus: vi.fn(),
        onShowAssignModal: vi.fn(),
        onShowDecisionModal: vi.fn()
    };

    it('shows "Accept Task" for admin in same department when status is CREATED', () => {
        render(<TaskActionsSidebar {...mockProps} />);
        expect(screen.getByText('Accept Task')).toBeInTheDocument();
    });

    it('shows "Assign" button for admin in same department', () => {
        render(<TaskActionsSidebar {...mockProps} />);
        expect(screen.getByText('Assign')).toBeInTheDocument();
    });

    it('shows "Start Working" for assignee when status is ASSIGNED', () => {
        const assignedTask = { ...mockTask, status: 'ASSIGNED' as const, assignee_id: 'user-emp' };
        const empUser = { id: 'user-emp', user_metadata: {} };
        render(<TaskActionsSidebar {...mockProps} task={assignedTask} currentUser={empUser} />);
        expect(screen.getByText('Start Working')).toBeInTheDocument();
    });

    it('shows "Approve" and "Reject" for admin when status is SUBMITTED', () => {
        const submittedTask = { ...mockTask, status: 'SUBMITTED' as const, creator_id: 'user-creator' };
        render(<TaskActionsSidebar {...mockProps} task={submittedTask} />);
        expect(screen.getByText('Approve')).toBeInTheDocument();
        expect(screen.getByText('Reject')).toBeInTheDocument();
    });

    it('calls onUpdateStatus when a status button is clicked', () => {
        render(<TaskActionsSidebar {...mockProps} />);
        fireEvent.click(screen.getByText('Accept Task'));
        expect(mockProps.onUpdateStatus).toHaveBeenCalledWith('ACCEPTED');
    });
});
