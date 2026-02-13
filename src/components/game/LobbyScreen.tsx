'use client';

import React, { useState } from 'react';
import { useLobbyStore, GameType } from '@/store/useLobbyStore';
import { Button, Card } from '@/components/ui/core';
import { User, Plus, Search, Users, LogOut, Gamepad2, Trophy, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLobbySync } from '@/hooks/useLobbySync';

export function LobbyScreen() {
    const { currentUser, rooms, login, createRoom, joinRoom, leaveRoom } = useLobbyStore();
    const [newRoomName, setNewRoomName] = useState('');
    const [selectedGameType, setSelectedGameType] = useState<GameType>('XOX'); // Default to XOX
    const [isCreating, setIsCreating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Enable sync
    useLobbySync();

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Socket syncs automatically
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // If used directly via URL bypass or dev state
    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-background relative flex flex-col md:flex-row overflow-hidden">

            {/* Sidebar / User Panel */}
            <aside className="w-full md:w-80 glass-morphism border-r border-white/5 p-6 flex flex-col justify-between z-10 relative">
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <img src="/transparant_icon.png" alt="Logo" className="w-8 h-8 object-contain" /> ASTRON
                        </h2>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-widest pl-9">Lobby v1.0</p>
                    </div>

                    <Card className="p-4 bg-white/5 border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs opacity-50 uppercase font-bold">Player</p>
                            <p className="font-bold truncate text-lg leading-tight">{currentUser.name}</p>
                        </div>
                    </Card>

                    <nav className="space-y-2">
                        <div className="text-xs font-bold opacity-40 uppercase tracking-widest mb-4">Menu</div>
                        <Button variant="ghost" className="w-full justify-start text-left gap-3 bg-white/5">
                            <Trophy size={18} /> Leaderboard (Soon)
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-left gap-3">
                            <Users size={18} /> Friends (Soon)
                        </Button>
                    </nav>
                </div>

                <div className="pt-8 mt-auto border-t border-white/5">
                    <Button variant="ghost" className="w-full justify-start text-left gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                        <LogOut size={18} /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto relative scrollbar-hide">
                {/* Decorative Background */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Game Rooms</h1>
                            <p className="opacity-50">Join an active match or start your own.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRefresh}
                                className={cn("rounded-xl", isRefreshing && "animate-spin")}
                                title="Refresh Lobby"
                            >
                                <RefreshCw size={20} />
                            </Button>
                            <Button onClick={() => setIsCreating(true)} size="lg" className="rounded-xl shadow-lg shadow-primary/20 gap-2">
                                <Plus size={20} /> Create Room
                            </Button>
                        </div>
                    </header>

                    {/* Create Room Expansion */}
                    {isCreating && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="overflow-hidden"
                        >
                            <Card className="p-6 bg-primary/5 border-primary/20">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); if (newRoomName) { createRoom(newRoomName, selectedGameType); setIsCreating(false); } }}
                                    className="flex flex-col gap-4"
                                >
                                    <div className="flex gap-4">
                                        <div
                                            onClick={() => setSelectedGameType('XOX')}
                                            className={cn(
                                                "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2",
                                                selectedGameType === 'XOX' ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <Gamepad2 size={32} className={selectedGameType === 'XOX' ? "text-primary" : "opacity-50"} />
                                            <div className="font-bold">XOX Arena</div>
                                            <div className="text-xs opacity-60 text-center">Classic 3D Tic-Tac-Toe</div>
                                        </div>

                                        <div
                                            onClick={() => setSelectedGameType('OKEY101')}
                                            className={cn(
                                                "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2",
                                                selectedGameType === 'OKEY101' ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex gap-1">
                                                <div className="w-4 h-6 bg-red-500 rounded-sm" />
                                                <div className="w-4 h-6 bg-blue-500 rounded-sm" />
                                                <div className="w-4 h-6 bg-black rounded-sm" />
                                            </div>
                                            <div className="font-bold">Okey 101</div>
                                            <div className="text-xs opacity-60 text-center">4-Player Tile Game</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Give your arena a name..."
                                            className="flex-1 bg-transparent border-b-2 border-primary/30 py-2 px-2 text-xl font-bold focus:outline-none focus:border-primary transition-colors"
                                            value={newRoomName}
                                            onChange={e => setNewRoomName(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                            <Button type="submit" disabled={!newRoomName.trim()}>Start Match</Button>
                                        </div>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                transition={{ type: 'spring', damping: 20 }}
                            >
                                <Card className={cn(
                                    "relative overflow-hidden p-6 h-full flex flex-col justify-between border transition-all cursor-pointer group",
                                    room.status === 'playing' ? 'bg-background border-white/5 opacity-70' : 'bg-gradient-to-br from-card to-card/50 border-white/10 hover:border-primary/50'
                                )}>
                                    {/* Status Badge */}
                                    <div className={cn(
                                        "absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                                        room.status === 'playing' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                                    )}>
                                        {room.status}
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{room.name}</h3>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-white/70">
                                                {room.gameType || 'XOX'}
                                            </span>
                                        </div>
                                        <p className="text-xs opacity-50 uppercase tracking-wider flex items-center gap-1">
                                            Hosted by <span className="font-bold text-foreground">{room.players[0].name}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div className="flex -space-x-2">
                                            {room.players.map((p, i) => (
                                                <div key={p.id} className="w-8 h-8 rounded-full bg-foreground/10 border-2 border-background flex items-center justify-center text-xs font-bold" title={p.name}>
                                                    {p.name.charAt(0)}
                                                </div>
                                            ))}
                                            {Array(2 - room.players.length).fill(null).map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-dashed border-foreground/10 bg-transparent" />
                                            ))}
                                        </div>

                                        <Button
                                            size="sm"
                                            disabled={room.status !== 'waiting'}
                                            onClick={() => joinRoom(room.id)}
                                            className={cn(
                                                "rounded-lg",
                                                room.status === 'waiting' ? 'bg-foreground text-background hover:bg-foreground/90' : 'opacity-0'
                                            )}
                                        >
                                            Join
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}

                        {rooms.length === 0 && (
                            <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center">
                                <GameControllerOff size={48} className="mb-4" />
                                <p className="text-xl font-bold">No active arenas</p>
                                <p>Be the first to start a game!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function GameControllerOff({ className, size }: { className?: string, size?: number }) {
    return <Gamepad2 className={className} size={size} />;
}
