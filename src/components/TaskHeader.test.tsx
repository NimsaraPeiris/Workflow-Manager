import { render, screen, fireEvent } from '@testing-library/react';
import { TaskHeader } from './TaskHeader';
import { describe, it, expect, vi } from 'vitest';

describe('TaskHeader', () => {
    const mockProps = {
        searchQuery: '',
        setSearchQuery: vi.fn(),
        onNewTask: vi.fn(),
        userRole: 'HEAD'
    };

    it('renders titles correctly', () => {
        render(<TaskHeader {...mockProps} />);
        expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    it('shows New Task button only for HEAD role', () => {
        const { rerender } = render(<TaskHeader {...mockProps} />);
        expect(screen.getByText('New Task')).toBeInTheDocument();

        rerender(<TaskHeader {...mockProps} userRole="EMPLOYEE" />);
        expect(screen.queryByText('New Task')).not.toBeInTheDocument();
    });

    it('calls setSearchQuery on input change', () => {
        render(<TaskHeader {...mockProps} />);
        const input = screen.getByPlaceholderText(/Search tasks/i);
        fireEvent.change(input, { target: { value: 'test' } });
        expect(mockProps.setSearchQuery).toHaveBeenCalledWith('test');
    });

    it('calls onNewTask when button is clicked', () => {
        render(<TaskHeader {...mockProps} />);
        fireEvent.click(screen.getByText('New Task'));
        expect(mockProps.onNewTask).toHaveBeenCalled();
    });
});
