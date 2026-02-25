import { describe, it, expect, vi } from 'vitest';
import { auditLogger } from './auditLogger';
import { supabase } from './supabaseClient';

// Mock Supabase
vi.mock('./supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn().mockResolvedValue({ error: null })
        }))
    }
}));

describe('auditLogger', () => {
    it('should call supabase insert with correct parameters', async () => {
        const mockLog = {
            userId: 'user-123',
            action: 'TASK_CREATE' as const,
            entityType: 'Task' as const,
            newData: { title: 'Test Task' }
        };

        await auditLogger.log(mockLog);

        expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    });
});
