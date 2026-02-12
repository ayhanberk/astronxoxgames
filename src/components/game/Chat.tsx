'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLobbyStore } from '@/store/useLobbyStore';
import { useGameStore } from '@/store/useGameStore';
import { Button, Card, Input } from '@/components/ui/core';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Chat() {
    const { messages, sendMessage, currentUser } = useLobbyStore();
    const { theme } = useGameStore();
    const [text, setText] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Dynamic UI Styles based on Theme
    const getThemeStyles = () => {
        const lightThemes = ['light', 'winter', 'beach', 'candy', 'glass'];
        const isLight = lightThemes.includes(theme);

        return {
            text: isLight ? 'text-slate-900' : 'text-white',
            textMuted: isLight ? 'text-slate-500' : 'text-white/60',
            bg: isLight ? 'bg-white/60' : 'bg-black/60',
            border: isLight ? 'border-black/10' : 'border-white/10',
            hover: isLight ? 'hover:bg-black/5' : 'hover:bg-white/10',
            subtext: isLight ? 'text-slate-600' : 'text-white/70',
            inputBg: isLight ? 'bg-black/5' : 'bg-black/20',
        };
    };

    const ui = getThemeStyles();

    // Track previous message count to detect incoming
    const lastMsgCountRef = useRef(messages.length);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll & Unread Logic
    useEffect(() => {
        const newCount = messages.length;
        const diff = newCount - lastMsgCountRef.current;

        if (diff > 0) {
            // New message arrived
            if (!isOpen) {
                setUnreadCount(prev => prev + diff);
            }

            // Scroll to bottom if open
            if (isOpen && scrollRef.current) {
                setTimeout(() => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                }, 100);
            }
        }

        lastMsgCountRef.current = newCount;
    }, [messages, isOpen]);

    // Reset unread on open
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            // Scroll to bottom immediately on open
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [isOpen]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (text.trim()) {
            sendMessage(text);
            setText('');
            // Focus keep?
        }
    };

    return (
        <>
            {/* Toggle Button (Mobile/Desktop) */}
            <motion.div
                className="fixed bottom-6 right-6 z-[60]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="relative">
                    <Button
                        size="icon"
                        variant={isOpen ? 'primary' : 'glass'}
                        className={`rounded-full h-14 w-14 shadow-2xl border backdrop-blur-md ${!isOpen && `${ui.bg} ${ui.border} ${ui.hover}`}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <MessageSquare size={24} className={isOpen ? 'text-white' : `text-primary ${!isOpen && ui.text}`} />
                    </Button>

                    {/* Unread Badge */}
                    <AnimatePresence>
                        {unreadCount > 0 && !isOpen && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 ring-2 ring-black"
                            >
                                <span className="text-[10px] font-bold text-white leading-none">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Chat Box */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, originX: 1, originY: 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-6 w-80 sm:w-96 z-[60]"
                    >
                        <Card className={`flex flex-col h-[400px] glass-morphism border-primary/20 shadow-2xl overflow-hidden rounded-3xl backdrop-blur-xl ring-1 ring-white/10 ${ui.bg}`}>
                            {/* Header */}
                            <div className={`p-4 border-b flex justify-between items-center backdrop-blur-md ${ui.border} ${ui.bg}`}>
                                <span className={`font-bold text-sm flex items-center gap-2 ${ui.text}`}>
                                    <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                                        <MessageSquare size={16} />
                                    </div>
                                    Live Chat
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${ui.textMuted}`}>Online</span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent" ref={scrollRef}>
                                {messages.length === 0 && (
                                    <div className={`flex flex-col items-center justify-center h-full text-center opacity-40 space-y-2 ${ui.textMuted}`}>
                                        <MessageSquare size={32} />
                                        <p className="text-xs">No messages yet.<br />Start the conversation!</p>
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isMe = msg.senderId === currentUser?.id;
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-end gap-2 max-w-[85%]">
                                                {!isMe && (
                                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 mb-1 ${ui.bg} ${ui.border} ${ui.text}`}>
                                                        {msg.senderName.charAt(0)}
                                                    </div>
                                                )}
                                                <div className={`
                                                    px-4 py-2.5 rounded-2xl text-xs shadow-sm
                                                    ${isMe
                                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                        : `${ui.bg} ${ui.text} backdrop-blur-md rounded-tl-none border ${ui.border}`}
                                                `}>
                                                    {/* {!isMe && <span className="block text-[9px] font-bold opacity-50 mb-1">{msg.senderName}</span>} */}
                                                    {msg.message}
                                                </div>
                                            </div>
                                            <span className={`text-[9px] opacity-30 mt-1 px-1 ${isMe ? 'mr-1' : 'ml-9'} ${ui.text}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/5">
                                <div className="relative flex items-center gap-2">
                                    <Input
                                        className="h-10 pl-4 pr-10 text-xs bg-black/20 border-white/10 focus:border-primary/50 focus:ring-0 rounded-xl"
                                        placeholder="Type a message..."
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                    <div className="absolute right-1 top-1">
                                        <Button
                                            size="icon"
                                            className="h-8 w-8 rounded-lg"
                                            type="submit"
                                            disabled={!text.trim()}
                                            variant={text.trim() ? 'primary' : 'ghost'}
                                        >
                                            <Send size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
