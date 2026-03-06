import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import type { PermissionKey } from '../../lib/permissions';

interface PermissionGuardProps {
    permission: PermissionKey | PermissionKey[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * A security component that conditionally renders children based on user permissions.
 * Supports single or multiple permission checks.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    requireAll = false,
    fallback = null,
    children
}) => {
    const { check, loading, user } = usePermissions();

    if (loading) return null; // Or a skeleton/spinner if preferred
    if (!user) return <>{fallback}</>;

    const permissions = Array.isArray(permission) ? permission : [permission];

    const hasAccess = requireAll
        ? permissions.every(p => check(p))
        : permissions.some(p => check(p));

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
