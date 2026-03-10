import { render, screen } from '@testing-library/react';
import { TaskHeader } from './TaskHeader';
import { describe, it, expect, vi } from 'vitest';

// Mock usePermissions to allow task:create
vi.mock('../hooks/usePermissions', () => ({
    usePermissions: () => ({
        user: { id: 'user-1', role: 'HEAD', permissions: ['task:create'] },
        loading: false,
        check: () => true,
        hasPermission: () => true,
    })
}));

describe('TaskHeader', () => {
    const mockProps = {
        currentView: 'dashboard'
    };

    it('renders titles correctly', () => {
        render(<TaskHeader {...mockProps} />);
        expect(screen.getByText(/Workflow Management/i)).toBeInTheDocument();
        expect(screen.getByText(/Manage and track your team's progress/i)).toBeInTheDocument();
    });
});
