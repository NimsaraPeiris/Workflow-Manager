import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';
import { describe, it, expect, vi } from 'vitest';
import type { Task } from '../types';

// Mock TaskCard to avoid complex sub-rendering issues for list unit tests
vi.mock('./TaskCard', () => ({
    TaskCard: ({ task, onClick }: any) => (
        <div data-testid="task-card" onClick={() => onClick(task.id)}>
            {task.title}
        </div>
    )
}));

describe('TaskList', () => {
    const mockTasks: Task[] = [
        { id: '1', title: 'Task 1', status: 'APPROVED', priority: 'HIGH', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '', due_date: '', updated_at: '' },
        { id: '2', title: 'Task 2', status: 'IN_PROGRESS', priority: 'MEDIUM', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '', due_date: '', updated_at: '' },
    ];

    it('renders loader when loading is true', () => {
        render(<TaskList tasks={[]} loading={true} searchQuery="" onTaskClick={vi.fn()} />);
        expect(screen.getByText(/Fetching tasks.../i)).toBeInTheDocument();
    });

    it('renders empty state when no tasks are found', () => {
        render(<TaskList tasks={[]} loading={false} searchQuery="" onTaskClick={vi.fn()} />);
        expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
        expect(screen.getByText(/Get started by creating your first task/i)).toBeInTheDocument();
    });

    it('renders search empty state when search query exists', () => {
        render(<TaskList tasks={[]} loading={false} searchQuery="nonsense" onTaskClick={vi.fn()} />);
        expect(screen.getByText(/We couldn't find any tasks matching your search/i)).toBeInTheDocument();
    });

    it('renders a list of tasks', () => {
        render(<TaskList tasks={mockTasks} loading={false} searchQuery="" onTaskClick={vi.fn()} />);
        expect(screen.getAllByTestId('task-card')).toHaveLength(2);
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    it('calls onTaskClick when a task card is clicked', () => {
        const onTaskClick = vi.fn();
        render(<TaskList tasks={mockTasks} loading={false} searchQuery="" onTaskClick={onTaskClick} />);
        const firstCard = screen.getAllByTestId('task-card')[0];
        firstCard.click();
        expect(onTaskClick).toHaveBeenCalledWith('1');
    });
});
