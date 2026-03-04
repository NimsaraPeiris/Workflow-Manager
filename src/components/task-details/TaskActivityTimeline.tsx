import React, { useState } from 'react';
import { History, Paperclip, MessageSquare, FileText, Download, Send } from 'lucide-react';
import { Input } from '../ui/Input';

interface TaskActivityTimelineProps {
    activities: any[];
    uploading: boolean;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddComment: (content: string) => void;
}

export const TaskActivityTimeline = ({
    activities,
    uploading,
    onFileUpload,
    onAddComment
}: TaskActivityTimelineProps) => {
    const [comment, setComment] = useState('');

    const handleSend = () => {
        if (comment.trim()) {
            onAddComment(comment.trim());
            setComment('');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 rounded-none transition-colors">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <History className="text-orange-600 dark:text-orange-500" size={20} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Activity Timeline</h3>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all uppercase tracking-widest rounded-none">
                    <Paperclip size={14} />
                    {uploading ? 'Uploading...' : 'Attach File'}
                    <input type="file" className="hidden" onChange={onFileUpload} disabled={uploading} />
                </label>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-100 dark:before:from-slate-800 before:via-slate-100 dark:before:via-slate-800 before:to-transparent">
                {activities && activities.length > 0 ? (
                    [...activities].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((act: any) => (
                        <div key={act.id} className="relative flex gap-6 group">
                            <div className={`mt-1 h-10 w-10 rounded-none flex items-center justify-center shrink-0 z-10 transition-all shadow-sm ${act.activity_type === 'COMMENT' ? 'bg-white dark:bg-slate-900 border-2 border-orange-500 text-orange-500' :
                                act.activity_type === 'ATTACHMENT' ? 'bg-white dark:bg-slate-900 border-2 border-blue-500 text-blue-500' :
                                    'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600'
                                }`}>
                                {act.activity_type === 'COMMENT' ? <MessageSquare size={16} /> :
                                    act.activity_type === 'ATTACHMENT' ? <Paperclip size={16} /> :
                                        <History size={16} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{act.profile?.full_name || 'System'}</p>
                                    <time className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black whitespace-nowrap">
                                        {new Date(act.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </time>
                                </div>
                                <div className={`p-4 border rounded-none transition-colors ${act.activity_type === 'COMMENT' ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300' :
                                    act.activity_type === 'ATTACHMENT' ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-900 dark:text-blue-200' :
                                        'bg-white dark:bg-slate-950/20 border-transparent text-slate-500 dark:text-slate-400 italic text-sm'
                                    }`}>
                                    {act.activity_type === 'ATTACHMENT' ? (
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 text-blue-500 rounded-none"><FileText size={20} /></div>
                                            <div className="flex-1 truncate">
                                                <p className="text-sm font-bold dark:text-slate-200 truncate">{act.file_name}</p>
                                                <a href={act.file_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 dark:text-blue-400 font-black hover:underline flex items-center gap-1 uppercase tracking-tighter mt-1">
                                                    <Download size={10} /> Download File
                                                </a>
                                            </div>
                                        </div>
                                    ) : <p className="text-sm leading-relaxed font-medium">{act.content}</p>}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-600 italic">No activity recorded yet.</div>
                )}
            </div>

            <div className="mt-12 relative flex items-center gap-2">
                <Input
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSend();
                        }
                    }}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 dark:text-white"
                />
                <button
                    onClick={handleSend}
                    className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-none transition-all active:scale-90 shadow-md shadow-orange-200 dark:shadow-none"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};
