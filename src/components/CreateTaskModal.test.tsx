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
        employees: [{ id: 'emp-1', full_name: 'John Doe', departments: { name: 'Design' } }],
        currentUser: { id: 'user-1', user_metadata: { role: 'HEAD', department_id: 'dept-1' } }
    };

    it('renders correctly when open', () => {
        render(<CreateTaskModal {...mockProps} />);
        expect(screen.getByRole('heading', { name: /create task/i, level: 2 })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. Design Landing Page')).toBeInTheDocument();
    });

    it('calls onClose when close button or backdrop is clicked', () => {
        render(<CreateTaskModal {...mockProps} />);
        // Click the X button (the only button without text or with a specific aria name if any)
        // From code: <X size={24} /> is in a button.
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
        // The header "Create Task" still exists
        expect(screen.getByRole('heading', { name: /create task/i, level: 2 })).toBeInTheDocument();
        // But the button text should be gone
        const submitBtn = screen.getAllByRole('button')[1]; // Second button is submit
        expect(submitBtn).toBeDisabled();
        expect(submitBtn).not.toHaveTextContent('Create Task');
    });

    it('shows error message if provided', () => {
        render(<CreateTaskModal {...mockProps} error="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});
