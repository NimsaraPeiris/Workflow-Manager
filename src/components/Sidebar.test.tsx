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
        expect(screen.getByText(/Organization Overview/i)).toBeInTheDocument();
    });

    it('shows Security Logs only for SUPER_ADMIN', () => {
        const { rerender } = render(<Sidebar {...mockProps} userRole="SUPER_ADMIN" />);
        expect(screen.getByText(/Security Logs/i)).toBeInTheDocument();

        rerender(<Sidebar {...mockProps} userRole="EMPLOYEE" />);
        expect(screen.queryByText(/Security Logs/i)).not.toBeInTheDocument();
    });

    it('calls onViewChange when clicking Security Logs', () => {
        render(<Sidebar {...mockProps} userRole="SUPER_ADMIN" />);
        const auditBtn = screen.getByText(/Security Logs/i);
        fireEvent.click(auditBtn);
        expect(mockProps.onViewChange).toHaveBeenCalledWith('audit');
    });

    it('renders history and log buttons', () => {
        render(<Sidebar {...mockProps} />);
        expect(screen.getByText(/Approved History/i)).toBeInTheDocument();
        expect(screen.getByText(/Cancelled Log/i)).toBeInTheDocument();
    });

    it('calls onViewChange when clicking Approved History', () => {
        render(<Sidebar {...mockProps} />);
        const approvedBtn = screen.getByText(/Approved History/i);
        fireEvent.click(approvedBtn);
        expect(mockProps.onViewChange).toHaveBeenCalledWith('approved');
    });
});
