import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagementPage from './UserManagement';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../lib/supabaseClient';

vi.mock('../../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
                insert: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: '1', name: 'Test' }, error: null })
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: { id: '1', name: 'Test' }, error: null })
                }))
            }))
        })),
        auth: {
            signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null })
        }
    }
}));

vi.mock('../../lib/auditLogger', () => ({
    auditLogger: {
        log: vi.fn().mockResolvedValue(null)
    }
}));

// Mock framer-motion as it might cause issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('UserManagementPage', () => {
    const mockUser = { id: 'user-1', email: 'admin@example.com', full_name: 'Admin', role: 'SUPER_ADMIN', department_id: 'dept-1' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders page titles and buttons', () => {
        render(<UserManagementPage currentUser={mockUser} />);
        expect(screen.getByText('Organization Management')).toBeInTheDocument();
        expect(screen.getByText('New Dept')).toBeInTheDocument();
        expect(screen.getByText('Add User / Head')).toBeInTheDocument();
    });

    it('shows loading state initially', async () => {
        render(<UserManagementPage currentUser={mockUser} />);
        expect(screen.getByText('Loading organization data...')).toBeInTheDocument();
    });

    it('renders data when loaded', async () => {
        const mockDepts = [{ id: '1', name: 'Engineering', created_at: '2023-01-01' }];
        const mockUsers = [{ id: 'u1', full_name: 'Developer One', role: 'EMPLOYEE', department_id: '1' }];

        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'departments') {
                return {
                    select: vi.fn(() => ({
                        order: vi.fn().mockResolvedValue({ data: mockDepts, error: null })
                    }))
                } as any;
            }
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
                } as any;
            }
            return {} as any;
        });

        render(<UserManagementPage currentUser={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('Engineering')).toBeInTheDocument();
            expect(screen.getByText('Developer One')).toBeInTheDocument();
        });
    });

    it('opens and closes create department modal', async () => {
        render(<UserManagementPage currentUser={mockUser} />);

        const newDeptBtn = screen.getByText('New Dept');
        fireEvent.click(newDeptBtn);

        expect(screen.getByPlaceholderText('e.g. Sales & Marketing')).toBeInTheDocument();

        const cancelBtn = screen.getByText('Cancel');
        fireEvent.click(cancelBtn);

        await waitFor(() => {
            expect(screen.queryByPlaceholderText('e.g. Sales & Marketing')).not.toBeInTheDocument();
        });
    });

    it('opens and closes create user modal', async () => {
        render(<UserManagementPage currentUser={mockUser} />);

        const addUserBtn = screen.getByText('Add User / Head');
        fireEvent.click(addUserBtn);

        expect(screen.getByPlaceholderText('Employee Name')).toBeInTheDocument();

        const cancelBtn = screen.getByText('Cancel');
        fireEvent.click(cancelBtn);

        await waitFor(() => {
            expect(screen.queryByPlaceholderText('Employee Name')).not.toBeInTheDocument();
        });
    });
});
