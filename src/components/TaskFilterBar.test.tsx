import { render, screen, fireEvent } from '@testing-library/react';
import { TaskFilterBar } from './TaskFilterBar';
import { describe, it, expect, vi } from 'vitest';

describe('TaskFilterBar', () => {
    const mockDepartments = [
        { id: '1', name: 'Engineering' },
        { id: '2', name: 'Design' }
    ];

    const mockProps = {
        searchQuery: '',
        setSearchQuery: vi.fn(),
        statusFilter: 'ALL',
        setStatusFilter: vi.fn(),
        departments: mockDepartments,
        filterDeptId: null,
        onDeptSelect: vi.fn(),
        currentView: 'dashboard',
        onNewTask: vi.fn()
    };

    it('renders filters correctly', () => {
        render(<TaskFilterBar {...mockProps} />);
        expect(screen.getByText('DEPT: ALL SYSTEMS')).toBeInTheDocument();
        expect(screen.getByText('STATUS: ANY')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search for intelligence/i)).toBeInTheDocument();
    });

    it('calls setSearchQuery on input change', () => {
        render(<TaskFilterBar {...mockProps} />);
        const input = screen.getByPlaceholderText(/Search for intelligence/i);
        fireEvent.change(input, { target: { value: 'test' } });
        expect(mockProps.setSearchQuery).toHaveBeenCalledWith('test');
    });

    it('calls onDeptSelect when department changes', () => {
        render(<TaskFilterBar {...mockProps} />);
        const select = screen.getByDisplayValue('DEPT: ALL SYSTEMS');
        fireEvent.change(select, { target: { value: '1' } });
        expect(mockProps.onDeptSelect).toHaveBeenCalledWith('1');
    });

    it('calls onNewTask when Initiate Terminal button is clicked', () => {
        render(<TaskFilterBar {...mockProps} />);
        const btn = screen.getByText(/Initiate Terminal/i);
        fireEvent.click(btn);
        expect(mockProps.onNewTask).toHaveBeenCalled();
    });

    it('hides Initiate Terminal button on non-dashboard views', () => {
        render(<TaskFilterBar {...mockProps} currentView="audit" />);
        expect(screen.queryByText(/Initiate Terminal/i)).not.toBeInTheDocument();
    });
});
