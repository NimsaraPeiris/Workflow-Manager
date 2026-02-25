import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { describe, it, expect, vi } from 'vitest';

// Basic props for testing
const mockProps = {
    departments: [],
    taskCounts: {},
    selectedDeptId: null,
    onDeptSelect: vi.fn(),
    highPriorityCount: 0,
    isOpen: true,
    onClose: vi.fn(),
    onViewChange: vi.fn(),
    currentView: 'dashboard' as const,
};

describe('Sidebar', () => {
    it('renders overview button', () => {
        render(<Sidebar {...mockProps} />);
        expect(screen.getByText(/Overview/i)).toBeInTheDocument();
    });

    it('shows System Audit Logs only for SUPER_ADMIN', () => {
        const { rerender } = render(<Sidebar {...mockProps} userRole="SUPER_ADMIN" />);
        expect(screen.getByText(/System Audit Logs/i)).toBeInTheDocument();

        rerender(<Sidebar {...mockProps} userRole="EMPLOYEE" />);
        expect(screen.queryByText(/System Audit Logs/i)).not.toBeInTheDocument();
    });

    it('calls onViewChange when clicking System Audit Logs', () => {
        render(<Sidebar {...mockProps} userRole="SUPER_ADMIN" />);
        const auditBtn = screen.getByText(/System Audit Logs/i);
        fireEvent.click(auditBtn);
        expect(mockProps.onViewChange).toHaveBeenCalledWith('audit');
    });
});
