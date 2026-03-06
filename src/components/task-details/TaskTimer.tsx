import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TaskTimerProps {
    totalTimeSpent: number; // in seconds
    timerStartedAt: string | null;
    status: string;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ totalTimeSpent, timerStartedAt, status }) => {
    const [currentTime, setCurrentTime] = useState<number>(0);

    useEffect(() => {
        let interval: any;

        if (status === 'IN_PROGRESS' && timerStartedAt) {
            const startTime = new Date(timerStartedAt).getTime();

            // Initial calculation
            const updateTimer = () => {
                const now = new Date().getTime();
                const elapsedSinceStart = Math.floor((now - startTime) / 1000);
                setCurrentTime(totalTimeSpent + elapsedSinceStart);
            };

            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else {
            setCurrentTime(totalTimeSpent);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [totalTimeSpent, timerStartedAt, status]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-2 px-4 py-2 border font-mono text-lg font-black transition-all ${status === 'IN_PROGRESS'
            ? 'bg-orange-500 text-white border-orange-600 animate-pulse shadow-lg'
            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
            }`}>
            <Clock size={20} className={status === 'IN_PROGRESS' ? 'animate-spin-slow' : ''} />
            <span>{formatTime(currentTime)}</span>
            {status === 'PAUSED' && (
                <span className="ml-2 text-[10px] uppercase tracking-widest text-orange-600 dark:text-orange-500 font-bold">Paused</span>
            )}
        </div>
    );
};
