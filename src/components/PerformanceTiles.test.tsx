import { render, screen } from '@testing-library/react';
import { PerformanceTiles } from './PerformanceTiles';
import { describe, it, expect, vi } from 'vitest';
import type { Task } from '../types';

// Mock framer-motion to avoid issues with animations in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    }
}));

describe('PerformanceTiles', () => {
    const mockTasks: Task[] = [
        { id: '1', title: 'Task 1', status: 'APPROVED', priority: 'HIGH', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '', due_date: '', updated_at: '' },
        { id: '2', title: 'Task 2', status: 'IN_PROGRESS', priority: 'MEDIUM', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '', due_date: '', updated_at: '' },
        { id: '3', title: 'Task 3', status: 'SUBMITTED', priority: 'LOW', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '', due_date: '', updated_at: '' },
        { id: '4', title: 'Task 4', status: 'REJECTED', priority: 'HIGH', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '', due_date: '', updated_at: '' },
    ];

    it('renders all 6 performance metric labels', () => {
        render(<PerformanceTiles tasks={mockTasks} />);
        expect(screen.getByText(/Total Scope/i)).toBeInTheDocument();
        expect(screen.getByText(/Completion/i)).toBeInTheDocument();
        expect(screen.getByText(/Active/i)).toBeInTheDocument();
        expect(screen.getByText(/Critical/i)).toBeInTheDocument();
        expect(screen.getByText(/Pending Review/i)).toBeInTheDocument();
        expect(screen.getByText(/Revisions/i)).toBeInTheDocument();
    });

    it('calculates metrics correctly for the provided tasks', () => {
        render(<PerformanceTiles tasks={mockTasks} />);

        // Total Scope: 4
        expect(screen.getByText('4')).toBeInTheDocument();

        // Completion: 1 approved out of 4 = 25%
        expect(screen.getByText('25%')).toBeInTheDocument();

        // Active: Task 2, 3, 4 are active. Count = 3.
        const activeMatches = screen.getAllByText('3');
        expect(activeMatches.length).toBeGreaterThanOrEqual(1);

        // Critical: Task 1 and 4 are High Priority. Count = 2.
        const criticalMatches = screen.getAllByText('2');
        expect(criticalMatches.length).toBeGreaterThanOrEqual(1);

        // Pending Review (SUBMITTED) should be 1
        // Revisions (REJECTED) should be 1
        // Completed Tasks should be 1
        const matchesOfOne = screen.getAllByText(/1/);
        expect(matchesOfOne.length).toBeGreaterThanOrEqual(3);
    });

    it('handles empty task list gracefully', () => {
        render(<PerformanceTiles tasks={[]} />);
        expect(screen.getByText('0%')).toBeInTheDocument();
        const zeros = screen.getAllByText('0');
        // Total Scope, Active, Critical, Pending Review, Revisions are 0
        expect(zeros.length).toBeGreaterThanOrEqual(5);
    });
});
