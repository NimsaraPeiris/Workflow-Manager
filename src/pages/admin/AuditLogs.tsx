import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Search,
    Filter,
    User as UserIcon,
    RefreshCw,
    Info,
    History
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { AuditLog } from '../../types';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('audit_logs')
            .select(`
                *,
                profile:profiles(full_name)
            `)
            .order('created_at', { ascending: false });

        if (data) setLogs(data);
        setLoading(false);
    };

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (action.includes('DELETE')) return 'bg-rose-50 text-rose-700 border-rose-100';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-50 text-blue-700 border-blue-100';
        if (action.includes('LOGIN')) return 'bg-orange-50 text-orange-700 border-orange-100';
        return 'bg-slate-50 text-slate-700 border-slate-100';
    };

    const formatDetail = (log: any) => {
        if (log.action === 'USER_LOGIN') return 'User logged into the system';

        // Handle Task Status Updates
        if (log.action === 'TASK_STATUS_UPDATE') {
            return `Status: ${log.old_data?.status || 'N/A'} → ${log.new_data?.status || 'N/A'}`;
        }

        // Handle Task Assignments
        if (log.action === 'TASK_ASSIGN') {
            return `Assigned to user ID: ${log.new_data?.assignee_id || 'N/A'}`;
        }

        // Handle generic creates/updates
        if (log.old_data && log.new_data) {
            const changedKeys = Object.keys(log.new_data).filter(k =>
                JSON.stringify(log.old_data[k]) !== JSON.stringify(log.new_data[k])
            );
            if (changedKeys.length > 0) {
                return `Updated: ${changedKeys.join(', ')}`;
            }
        }

        if (log.new_data && log.action.includes('CREATE')) {
            return `Created new ${log.entity_type}: ${log.new_data.title || log.new_data.name || 'Details in expanded view'}`;
        }

        return 'Administrative action recorded';
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
            (log.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (log.entity_id || '').toLowerCase().includes(search.toLowerCase());

        const matchesType = filterType === 'ALL' || log.entity_type === filterType;

        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-slate-900 text-white rounded">
                            <ShieldCheck size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Vault</h2>
                    </div>
                    <p className="text-slate-500 text-sm">Read-only immutable sequence of all administrative events</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-sm transition-all"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh Logs
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Filter by action, user or ID..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-slate-400 shrink-0" size={18} />
                    <select
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm cursor-pointer"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="ALL">All Categories</option>
                        <option value="Task">Workflow Tasks</option>
                        <option value="Profile">User Accounts</option>
                        <option value="Department">Departments</option>
                        <option value="System">System Access</option>
                    </select>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Time</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initiator</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operation</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Component</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Summary</th>
                                <th className="px-4 py-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <History size={48} className="mx-auto mb-4 text-slate-200" />
                                        <p className="text-slate-400 font-medium">No encrypted audit trails found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                            className={`group cursor-pointer transition-colors ${expandedLogId === log.id ? 'bg-orange-50/30' : 'hover:bg-slate-50/50'}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                        <UserIcon size={14} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-700 leading-none mb-1">
                                                            {log.profile?.full_name || 'System'}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-mono tracking-tighter">
                                                            {log.user_id ? `${log.user_id.slice(0, 8)}...` : 'AUTO_PROC'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-[9px] font-black border uppercase tracking-widest ${getActionColor(log.action)}`}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-600">{log.entity_type}</span>
                                                    {log.entity_id && (
                                                        <span className="text-[9px] font-mono text-slate-400">
                                                            ID: {log.entity_id.slice(0, 12)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-medium text-slate-600">
                                                        {formatDetail(log)}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Info size={16} className={`mx-auto transition-colors ${expandedLogId === log.id ? 'text-orange-500' : 'text-slate-300 group-hover:text-slate-400'}`} />
                                            </td>
                                        </tr>

                                        {expandedLogId === log.id && (
                                            <motion.tr
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-slate-50/80 border-x border-slate-100"
                                            >
                                                <td colSpan={6} className="px-12 py-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                                                Raw Metadata Snapshot
                                                            </h4>
                                                            <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-inner overflow-hidden">
                                                                <pre className="text-[10px] font-mono text-slate-500 whitespace-pre-wrap">
                                                                    {JSON.stringify({
                                                                        id: log.id,
                                                                        actor_id: log.user_id,
                                                                        entity: `${log.entity_type}:${log.entity_id}`,
                                                                        timestamp: log.created_at
                                                                    }, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                                                Data Transformation
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {log.old_data && (
                                                                    <div className="bg-rose-50/50 border border-rose-100/50 p-3 rounded-lg">
                                                                        <span className="text-[9px] font-bold text-rose-600 uppercase mb-2 block">Previous State</span>
                                                                        <pre className="text-[10px] font-mono text-rose-700/70">
                                                                            {JSON.stringify(log.old_data, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {log.new_data && (
                                                                    <div className="bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-lg">
                                                                        <span className="text-[9px] font-bold text-emerald-600 uppercase mb-2 block">New State</span>
                                                                        <pre className="text-[10px] font-mono text-emerald-700/70">
                                                                            {JSON.stringify(log.new_data, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {!log.old_data && !log.new_data && (
                                                                    <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
                                                                        <p className="text-[10px] text-slate-400 font-medium italic">No dynamic data mutation recorded for this event</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center">
                Audit records are tamper-proof and stored permanently for compliance.
            </p>
        </div>
    );
}
