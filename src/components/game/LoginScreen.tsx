'use client';

import React, { useState } from 'react';
import { useLobbyStore } from '@/store/useLobbyStore';
import { Button, Card } from '@/components/ui/core';
import { User, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginScreen() {
    const { login } = useLobbyStore();
    const [username, setUsername] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) login(username);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            {/* Background with gradient orb effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative"
            >
                <Card className="glass-morphism border border-white/10 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-neon-cyan flex items-center justify-center shadow-lg shadow-primary/30 mb-2">
                            <Sparkles size={40} className="text-white" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                ASTRON XOX
                            </h1>
                            <p className="text-sm font-medium text-foreground/50 uppercase tracking-widest">
                                Premium Gaming
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="w-full space-y-4 pt-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40 group-focus-within:text-primary transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-foreground/5 border border-foreground/10 focus:outline-none focus:border-primary/50 focus:bg-foreground/10 transition-all font-medium placeholder:text-foreground/30 text-lg"
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full rounded-xl py-6 text-lg group relative overflow-hidden"
                                disabled={!username.trim()}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Enter Arena <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-neon-cyan to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </Button>
                        </form>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
