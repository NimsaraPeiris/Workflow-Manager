import { render, screen, fireEvent } from '@testing-library/react';
import { TaskActivityTimeline } from './TaskActivityTimeline';
import { describe, it, expect, vi } from 'vitest';

describe('TaskActivityTimeline', () => {
    const mockActivities = [
        {
            id: '1',
            activity_type: 'COMMENT',
            content: 'This is a comment',
            created_at: '2025-01-01T10:00:00Z',
            profile: { full_name: 'John Doe' }
        },
        {
            id: '2',
            activity_type: 'ATTACHMENT',
            file_name: 'test.pdf',
            file_url: 'http://example.com/test.pdf',
            created_at: '2025-01-01T11:00:00Z',
            profile: { full_name: 'Jane Smith' }
        }
    ];

    const mockProps = {
        activities: mockActivities,
        uploading: false,
        onFileUpload: vi.fn(),
        onAddComment: vi.fn()
    };

    it('renders activities correctly', () => {
        render(<TaskActivityTimeline {...mockProps} />);
        expect(screen.getByText('This is a comment')).toBeInTheDocument();
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('calls onAddComment when comment is sent', () => {
        render(<TaskActivityTimeline {...mockProps} />);
        const input = screen.getByPlaceholderText('Write a comment...');
        fireEvent.change(input, { target: { value: 'New Comment' } });

        // The send button is the one with the Send icon
        const sendBtn = screen.getAllByRole('button').find(b => b.querySelector('svg'));
        if (sendBtn) fireEvent.click(sendBtn);

        expect(mockProps.onAddComment).toHaveBeenCalledWith('New Comment');
    });

    it('shows "Uploading..." when uploading is true', () => {
        render(<TaskActivityTimeline {...mockProps} uploading={true} />);
        expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('renders empty state when no activities', () => {
        render(<TaskActivityTimeline {...mockProps} activities={[]} />);
        expect(screen.getByText('No activity recorded yet.')).toBeInTheDocument();
    });
});
