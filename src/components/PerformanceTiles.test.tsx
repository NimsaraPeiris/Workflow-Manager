import { render, screen } from '@testing-library/react';
import { PerformanceTiles } from './PerformanceTiles';
import { describe, it, expect } from 'vitest';
import type { Task } from '../types';

describe('PerformanceTiles', () => {
    const mockTasks: Task[] = [
        { id: '1', title: 'Task 1', status: 'APPROVED', priority: 'HIGH', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '' },
        { id: '2', title: 'Task 2', status: 'IN_PROGRESS', priority: 'MEDIUM', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '' },
        { id: '3', title: 'Task 3', status: 'CREATED', priority: 'LOW', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '' },
        { id: '4', title: 'Task 4', status: 'APPROVED', priority: 'HIGH', created_at: '', creator_id: '', department_id: '', description: '', assignee_id: '' },
    ];

    it('calculates completion rate correctly', () => {
        render(<PerformanceTiles tasks={mockTasks} />);
        // 2 approved out of 4 = 50%
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('calculates active workflows correctly', () => {
        render(<PerformanceTiles tasks={mockTasks} />);
        // All are active (not APPROVED or CANCELLED) except Task 1 and 4.
        // Wait, the code says: const pendingTasks = tasks.filter(t => !['APPROVED', 'CANCELLED'].includes(t.status)).length;
        // So Task 2 and 3 are pending. Count = 2.
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('calculates critical load correctly', () => {
        render(<PerformanceTiles tasks={mockTasks} />);
        // Task 1 and 4 have HIGH priority. Count = 2.
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('shows efficiency as moderate for 50% completion', () => {
        render(<PerformanceTiles tasks={mockTasks} />);
        expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('shows 0% and 0 labels when no tasks', () => {
        render(<PerformanceTiles tasks={[]} />);
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getAllByText('0')).toHaveLength(2); // Active Workflows and Critical Load
    });
});
