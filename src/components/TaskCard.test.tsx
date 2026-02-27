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
        creator_id: '',
        department_id: '',
        assignee_id: '',
        updated_at: ''
    };

    it('renders task details correctly', () => {
        render(<TaskCard task={mockTask} onClick={vi.fn()} />);
        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
        expect(screen.getByText('12/31/2025')).toBeInTheDocument();
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
        expect(container.querySelector('.bg-emerald-500')).toBeInTheDocument();

        rerender(<TaskCard task={{ ...mockTask, priority: 'MEDIUM' }} onClick={vi.fn()} />);
        expect(container.querySelector('.bg-amber-500')).toBeInTheDocument();
    });

    it('renders abbreviated ID', () => {
        render(<TaskCard task={mockTask} onClick={vi.fn()} />);
        // First 2 chars of '12345678' is '12'
        expect(screen.getByText('12')).toBeInTheDocument();
    });
});
