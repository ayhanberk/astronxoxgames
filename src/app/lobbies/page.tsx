'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/core';
import { Gamepad2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLobbyStore } from '@/store/useLobbyStore';

export default function LobbiesPage() {
    const router = useRouter();
    const { currentUser } = useLobbyStore();

    if (!currentUser) {
        router.push('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Decorative Background */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl w-full space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">Select Game Mode</h1>
                    <p className="opacity-60 text-lg">Choose your arena and start competing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* XOX Card */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/lobbies/xox')}
                        className="cursor-pointer"
                    >
                        <Card className="h-64 relative overflow-hidden group border-white/10 hover:border-primary/50 transition-colors bg-gradient-to-br from-card to-card/50">
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                            <div className="relative p-8 flex flex-col h-full justify-between">
                                <div>
                                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                        <Gamepad2 size={32} />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">XOX Arena</h2>
                                    <p className="opacity-60">Classic 3D Tic-Tac-Toe with a futuristic twist. Challenge friends in real-time.</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Enter Arena <span>→</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Okey 101 Card */}
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/lobbies/okey101')}
                        className="cursor-pointer"
                    >
                        <Card className="h-64 relative overflow-hidden group border-white/10 hover:border-blue-500/50 transition-colors bg-gradient-to-br from-card to-card/50">
                            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                            <div className="relative p-8 flex flex-col h-full justify-between">
                                <div>
                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <div className="flex gap-1">
                                            <div className="w-3 h-5 bg-red-500 rounded-sm" />
                                            <div className="w-3 h-5 bg-black rounded-sm" />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">Okey 101</h2>
                                    <p className="opacity-60">Traditional tile-based strategy game for 4 players. (Beta)</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Join Table <span>→</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
