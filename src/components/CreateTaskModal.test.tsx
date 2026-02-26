import { render, screen, fireEvent } from '@testing-library/react';
import { CreateTaskModal } from './CreateTaskModal';
import { describe, it, expect, vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, onClick, className }: any) => (
            <div onClick={onClick} className={className}>{children}</div>
        )
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('CreateTaskModal', () => {
    const mockNewTask = {
        title: '',
        description: '',
        priority: 'LOW',
        due_date: '',
        department_id: '',
        assignee_id: ''
    };

    const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSubmit: vi.fn((e) => e.preventDefault()),
        loading: false,
        error: '',
        newTask: mockNewTask,
        setNewTask: vi.fn(),
        departments: [{ id: 'dept-1', name: 'Design' }],
        employees: [{ id: 'emp-1', full_name: 'John Doe', departments: { name: 'Design' } }]
    };

    it('renders correctly when open', () => {
        render(<CreateTaskModal {...mockProps} />);
        expect(screen.getByText('Create Task')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. Design Landing Page')).toBeInTheDocument();
    });

    it('calls onClose when close button or backdrop is clicked', () => {
        render(<CreateTaskModal {...mockProps} />);
        const closeBtn = screen.getByRole('button', { name: '' }); // Search for the X icon button
        // Looking at the code line 67: <X size={24} />
        // It's better to find by the text "Create Task" parent or just use getAllByRole('button')[0]
        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('calls setNewTask when inputs change', () => {
        render(<CreateTaskModal {...mockProps} />);
        const titleInput = screen.getByPlaceholderText('e.g. Design Landing Page');
        fireEvent.change(titleInput, { target: { value: 'New Test Task' } });
        expect(mockProps.setNewTask).toHaveBeenCalled();
    });

    it('shows loading state on submit button', () => {
        render(<CreateTaskModal {...mockProps} loading={true} />);
        const submitBtn = screen.getByRole('button', { name: /Create Task/i });
        // Wait, the loader replaces the text or is next to it?
        // Line 163: {loading? Loader : ... }
        // So the text "Create Task" won't be there.
        expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
    });

    it('shows error message if provided', () => {
        render(<CreateTaskModal {...mockProps} error="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});
