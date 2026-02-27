import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { describe, it, expect, vi } from 'vitest';
import type { Task } from '../types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, onClick, className }: any) => (
            <div onClick={onClick} className={className}>{children}</div>
        )
    }
}));

describe('TaskCard', () => {
    const mockTask: Task = {
        id: '12345678',
        title: 'Test Task',
        description: 'Test Description',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        due_date: '2025-12-31',
        created_at: '',
        creator_id: 'user-1',
        department_id: 'dept-1',
        assignee_id: 'user-2',
        updated_at: '',
        creator: { full_name: 'John Creator' },
        assignee: { full_name: 'Jane Assignee' },
        department: { name: 'Engineering' }
    };

    it('renders task details correctly', () => {
        render(<TaskCard task={mockTask} onClick={vi.fn()} />);
        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        // Since we now do .replace('_', ' '), it should be "IN PROGRESS"
        expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
        expect(screen.getByText(/Dec 31/i)).toBeInTheDocument();
        expect(screen.getByText('John Creator')).toBeInTheDocument();
        expect(screen.getByText('Jane Assignee')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('calls onClick with task id when clicked', () => {
        const handleClick = vi.fn();
        render(<TaskCard task={mockTask} onClick={handleClick} />);
        fireEvent.click(screen.getByText('Test Task'));
        expect(handleClick).toHaveBeenCalledWith('12345678');
    });

    it('applies priority color correctly', () => {
        const { container, rerender } = render(<TaskCard task={mockTask} onClick={vi.fn()} />);
        // High priority should have bg-rose-500
        expect(container.querySelector('.bg-rose-500')).toBeInTheDocument();

        rerender(<TaskCard task={{ ...mockTask, priority: 'LOW' }} onClick={vi.fn()} />);
        expect(container.querySelector('.bg-green-500')).toBeInTheDocument();

        rerender(<TaskCard task={{ ...mockTask, priority: 'MEDIUM' }} onClick={vi.fn()} />);
        expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument();
    });

    it('shows overdue indicator when task is past due date', () => {
        const overdueTask = {
            ...mockTask,
            due_date: '2020-01-01', // Definitely in the past
            status: 'IN_PROGRESS' as const
        };
        render(<TaskCard task={overdueTask} onClick={vi.fn()} />);
        expect(screen.getByText(/OVERDUE/i)).toBeInTheDocument();
    });

    it('renders initials correctly', () => {
        render(<TaskCard task={mockTask} onClick={vi.fn()} />);
        // John Creator -> JC
        expect(screen.getByText('JC')).toBeInTheDocument();
        // Jane Assignee -> JA
        expect(screen.getByText('JA')).toBeInTheDocument();
    });
});
