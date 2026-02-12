'use client';

import React from 'react';
import { useLobbyStore } from '@/store/useLobbyStore';
import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

export function Notifications() {
    const { notifications, removeNotification } = useLobbyStore();
    const { theme } = useGameStore();

    // Dynamic UI Styles based on Theme
    const getThemeStyles = () => {
        const lightThemes = ['light', 'winter', 'beach', 'candy', 'glass'];
        const isLight = lightThemes.includes(theme);

        return {
            text: isLight ? 'text-slate-900' : 'text-foreground',
            bg: isLight ? 'bg-white/80' : 'bg-black/60',
            border: isLight ? 'border-black/10' : 'border-white/10',
        };
    };

    const ui = getThemeStyles();

    return (
        <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-80">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        layout
                        className={`
                            pointer-events-auto
                            flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md
                            ${notif.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-200' :
                                notif.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' :
                                    `${ui.bg} ${ui.border} ${ui.text}`}
                        `}
                    >
                        {notif.type === 'success' && <CheckCircle size={18} className="text-green-400 shrink-0" />}
                        {notif.type === 'error' && <XCircle size={18} className="text-red-400 shrink-0" />}
                        {notif.type === 'info' && <Info size={18} className="text-blue-400 shrink-0" />}

                        <div className="flex-1 text-sm font-medium">
                            {notif.message}
                        </div>

                        <button
                            onClick={() => removeNotification(notif.id)}
                            className="bg-transparent hover:bg-white/10 rounded p-1 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
