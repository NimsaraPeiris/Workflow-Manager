import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { describe, it, expect, vi } from 'vitest';

describe('Header', () => {
    const mockUser = {
        user_metadata: {
            email: 'test@example.com',
            role: 'HEAD',
            full_name: 'John Doe'
        }
    };

    const mockProps = {
        user: mockUser,
        onLogout: vi.fn(),
        onToggleSidebar: vi.fn()
    };

    it('renders user information correctly', () => {
        render(<Header {...mockProps} />);
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText(/Head • John Doe/i)).toBeInTheDocument();
    });

    it('shows "Employee" if role is not HEAD', () => {
        const employeeUser = {
            user_metadata: {
                email: 'emp@example.com',
                role: 'EMPLOYEE',
                full_name: 'Jane Smith'
            }
        };
        render(<Header {...mockProps} user={employeeUser} />);
        expect(screen.getByText(/Employee • Jane Smith/i)).toBeInTheDocument();
    });

    it('calls onLogout when logout button is clicked', () => {
        render(<Header {...mockProps} />);
        const logoutBtn = screen.getByTitle(/Logout/i);
        fireEvent.click(logoutBtn);
        expect(mockProps.onLogout).toHaveBeenCalled();
    });

    it('calls onToggleSidebar when menu button is clicked', () => {
        render(<Header {...mockProps} />);
        const menuBtn = screen.getAllByRole('button')[0]; // First button is usually the toggle
        fireEvent.click(menuBtn);
        expect(mockProps.onToggleSidebar).toHaveBeenCalled();
    });
});
