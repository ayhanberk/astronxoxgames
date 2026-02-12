'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLobbyStore, GameType } from '@/store/useLobbyStore';
import { Button, Card } from '@/components/ui/core';
import { Plus, Search, RefreshCw, ArrowLeft, Gamepad2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLobbySync } from '@/hooks/useLobbySync';

export default function GameLobbyPage() {
    const params = useParams();
    const router = useRouter();
    const gameType = (params.gameType as string).toUpperCase() as GameType; // 'XOX' or 'OKEY101'

    // Validate game type
    const isValidGame = gameType === 'XOX' || gameType === 'OKEY101';

    const { currentUser, rooms, createRoom, joinRoom, currentRoomId } = useLobbyStore();
    const [newRoomName, setNewRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Enable sync
    useLobbySync();

    // Redirect if not logged in
    useEffect(() => {
        if (!currentUser) router.push('/');
    }, [currentUser, router]);

    // Handle room join redirection
    useEffect(() => {
        if (currentRoomId && currentUser) {
            // Find the room to know its type if we didn't just create it
            // But we can assume if we are in this lobby, we want to go to this game type
            // Or better, check the actual room's game type from store
            const room = rooms.find(r => r.id === currentRoomId);
            if (room) {
                const typeHref = room.gameType === 'OKEY101' ? 'okey101' : 'xox';
                router.push(`/game/${typeHref}/${currentRoomId}`);
            }
        }
    }, [currentRoomId, currentUser, router, rooms]);

    if (!currentUser || !isValidGame) return null;

    const filteredRooms = rooms.filter(r => r.gameType === gameType);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRoomName.trim()) {
            createRoom(newRoomName, gameType);
            setIsCreating(false);
            // Redirection handled by useEffect above upon room_joined event (which updates currentRoomId)
        }
    };

    return (
        <div className="min-h-screen bg-background relative flex flex-col overflow-hidden">
            {/* Decorative Background */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto p-4 md:p-8 relative z-10 max-w-6xl">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/lobbies')} className="hidden md:flex">
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                                {gameType === 'XOX' ? 'XOX Arena' : 'Okey 101'}
                                <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded ml-2">LOBBY</span>
                            </h1>
                            <p className="opacity-50">
                                {filteredRooms.length} active rooms • {currentUser.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            className={cn("rounded-xl", isRefreshing && "animate-spin")}
                        >
                            <RefreshCw size={20} />
                        </Button>
                        <Button onClick={() => setIsCreating(true)} size="lg" className="rounded-xl shadow-lg shadow-primary/20 gap-2">
                            <Plus size={20} /> Create Room
                        </Button>
                    </div>
                </header>

                {/* Create Room Section */}
                {isCreating && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="overflow-hidden mb-8"
                    >
                        <Card className="p-6 bg-primary/5 border-primary/20">
                            <form onSubmit={handleCreateRoom} className="flex gap-4 items-center">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={`Name your ${gameType} room...`}
                                    className="flex-1 bg-transparent border-b-2 border-primary/30 py-2 px-2 text-xl font-bold focus:outline-none focus:border-primary transition-colors"
                                    value={newRoomName}
                                    onChange={e => setNewRoomName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    <Button type="submit" disabled={!newRoomName.trim()}>Start Match</Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map((room) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
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
                                    </div>
                                    <p className="text-xs opacity-50 uppercase tracking-wider flex items-center gap-1">
                                        Hosted by <span className="font-bold text-foreground">{room.players[0].name}</span>
                                    </p>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div className="flex -space-x-2">
                                        {room.players.map((p) => (
                                            <div key={p.id} className="w-8 h-8 rounded-full bg-foreground/10 border-2 border-background flex items-center justify-center text-xs font-bold" title={p.name}>
                                                {p.name.charAt(0)}
                                            </div>
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

                    {filteredRooms.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center">
                            <Gamepad2 size={48} className="mb-4" />
                            <p className="text-xl font-bold">No active rooms found</p>
                            <p>Be the first to create a {gameType} room!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
