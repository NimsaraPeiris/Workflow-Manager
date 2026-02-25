import { supabase } from './supabaseClient';

export type AuditAction =
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'TASK_CREATE'
    | 'TASK_UPDATE'
    | 'TASK_STATUS_UPDATE'
    | 'TASK_ASSIGN'
    | 'TASK_DELETE'
    | 'DEPT_CREATE'
    | 'DEPT_UPDATE'
    | 'DEPT_DELETE'
    | 'ROLE_CHANGE';

/**
 * Utility to log sensitive system actions for auditing purposes.
 * Currently uses Supabase client to interact with the audit_logs table.
 */
export const auditLogger = {
    async log(params: {
        userId: string | null;
        action: AuditAction;
        entityType: 'Profile' | 'Task' | 'Department' | 'System';
        entityId?: string;
        oldData?: any;
        newData?: any;
    }) {
        try {
            const { error } = await supabase
                .from('audit_logs')
                .insert([{
                    user_id: params.userId,
                    action: params.action,
                    entity_type: params.entityType,
                    entity_id: params.entityId,
                    old_data: params.oldData,
                    new_data: params.newData
                }]);

            if (error) {
                console.error('Audit Log Error:', error.message);
            }
        } catch (err) {
            console.error('Failed to create audit log:', err);
        }
    }
};
