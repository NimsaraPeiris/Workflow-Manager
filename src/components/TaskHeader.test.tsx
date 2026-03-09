import { render, screen, fireEvent } from '@testing-library/react';
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
        searchQuery: '',
        setSearchQuery: vi.fn(),
        onNewTask: vi.fn(),
        currentView: 'dashboard'
    };

    it('renders titles correctly', () => {
        render(<TaskHeader {...mockProps} />);
        expect(screen.getByText('Workflow Management')).toBeInTheDocument();
    });

    it('shows Create Task button', () => {
        render(<TaskHeader {...mockProps} />);
        expect(screen.getByText(/Create Task/i)).toBeInTheDocument();
    });

    it('calls setSearchQuery on input change', () => {
        render(<TaskHeader {...mockProps} />);
        const input = screen.getByPlaceholderText(/Search tasks/i);
        fireEvent.change(input, { target: { value: 'test' } });
        expect(mockProps.setSearchQuery).toHaveBeenCalledWith('test');
    });

    it('calls onNewTask when button is clicked', () => {
        render(<TaskHeader {...mockProps} />);
        fireEvent.click(screen.getByText(/Create Task/i));
        expect(mockProps.onNewTask).toHaveBeenCalled();
    });
});
