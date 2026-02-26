/**
 * DATA MODELS
 * All core entities and types for the Task Manager Application
 */

export type TaskStatus = 'CREATED' | 'ACCEPTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    department_id: string;
}

export interface Department {
    id: string;
    name: string;
    created_at?: string;
}

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
    | 'ROLE_CHANGE'
    | 'USER_CREATE';

export interface AuditLog {
    id: string;
    user_id: string | null;
    action: AuditAction;
    entity_type: 'Profile' | 'Task' | 'Department' | 'System';
    entity_id?: string;
    old_data?: any;
    new_data?: any;
    created_at: string;
    profile?: { full_name: string };
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: string;
    creator_id: string;
    assignee_id?: string;
    department_id?: string;
    due_date: string;
    created_at: string;
    updated_at: string;
    creator?: { full_name: string };
    assignee?: { full_name: string };
    comments?: any[];
}

export interface Comment {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: string;
}
