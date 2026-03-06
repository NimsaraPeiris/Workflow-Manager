export const PERMISSION_MAP = {
    departments: {
        label: 'Department Management',
        micro: [
            { key: 'dept:view', label: 'View Departments' },
            { key: 'dept:create', label: 'Create Department' },
            { key: 'dept:edit', label: 'Edit Department' },
            { key: 'dept:delete', label: 'Delete Department' },
        ]
    },
    tasks: {
        label: 'Task Management',
        micro: [
            { key: 'task:view', label: 'View All Tasks (Global)' },
            { key: 'task:view_dept', label: 'View Department Tasks' },
            { key: 'task:create', label: 'Create New Tasks' },
            { key: 'task:edit', label: 'Modify Task Details' },
            { key: 'task:delete', label: 'Delete/Cancel Tasks' },
            { key: 'task:assign', label: 'Assign Employees' },
            { key: 'task:approve', label: 'Approve Submissions' },
        ]
    },
    users: {
        label: 'User Management',
        micro: [
            { key: 'user:view', label: 'View Staff List' },
            { key: 'user:create', label: 'Onboard New Staff' },
            { key: 'user:edit', label: 'Edit User Roles' },
            { key: 'user:delete', label: 'Offboard Staff' },
        ]
    },
    teams: {
        label: 'Squad & Team Management',
        micro: [
            { key: 'team:view_dept', label: 'View Department Squads' },
            { key: 'team:manage', label: 'Manage Squad Rosters' },
        ]
    },
    system: {
        label: 'System & Security',
        micro: [
            { key: 'audit:view', label: 'View Security Logs' },
            { key: 'settings:manage', label: 'System Settings' },
        ]
    }
} as const;

export type PermissionKey =
    | 'dept:view' | 'dept:create' | 'dept:edit' | 'dept:delete'
    | 'task:view' | 'task:view_dept' | 'task:create' | 'task:edit' | 'task:delete' | 'task:assign' | 'task:approve'
    | 'user:view' | 'user:create' | 'user:edit' | 'user:delete'
    | 'team:view_dept' | 'team:manage'
    | 'audit:view' | 'settings:manage';

/**
 * Checks if a user has a specific permission.
 * Supports both manual metadata and Super Admin overrides.
 */
export const hasPermission = (user: any, permission: PermissionKey): boolean => {
    if (!user) return false;

    // Super-access for SUPER_ADMIN role
    // We check both the database profile role and user_metadata
    // We ignore 'authenticated' which is a technical Supabase role
    const appRole = (user.role && user.role !== 'authenticated')
        ? user.role
        : user.user_metadata?.role;

    if (appRole === 'SUPER_ADMIN') return true;

    // Head of Department auto-permissions
    if (appRole === 'DEP_HEAD' || appRole === 'HEAD') {
        if (permission === 'task:view_dept') return true;
        if (permission === 'user:view') return true;
        if (permission === 'team:view_dept') return true;
    }

    const permissions = user.permissions || user.user_metadata?.permissions || [];
    if (!Array.isArray(permissions)) return false;
    return permissions.includes(permission);
};

/**
 * Helper to get all keys for a specific category
 */
export const getCategoryKeys = (category: keyof typeof PERMISSION_MAP) => {
    return PERMISSION_MAP[category].micro.map(p => p.key);
};
