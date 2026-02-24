export type TaskStatus = 'CREATED' | 'ACCEPTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
    id: string;
    email: string;
    full_name?: string;
    role?: string;
    department_id?: string;
}

export interface Department {
    id: string;
    name: string;
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
}

export interface Comment {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: string;
}
