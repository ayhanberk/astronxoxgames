'use client';

import React, { useState } from 'react';
import { useLobbyStore, Room } from '@/store/useLobbyStore';
import { Button, Card } from '@/components/ui/core';
import { Users, Plus, LogIn, Trophy, DoorOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Lobby() {
    const { currentUser, rooms, currentRoomId, login, createRoom, joinRoom, leaveRoom } = useLobbyStore();
    const [username, setUsername] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) login(username);
    };

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRoomName.trim()) {
            createRoom(newRoomName);
            setIsCreating(false);
            setNewRoomName('');
        }
    };

    if (!currentUser) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                <Card className="max-w-sm w-full p-8 text-center space-y-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <Users size={48} className="text-primary" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold">Welcome Player</h2>
                    <p className="text-foreground/60">Enter your name to enter the arena.</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Your Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/10 focus:outline-none focus:border-primary transition-colors text-center font-bold text-lg"
                            autoFocus
                        />
                        <Button type="submit" size="lg" className="w-full" disabled={!username.trim()}>
                            <LogIn size={20} className="mr-2" /> Enter Lobby
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    if (currentRoomId) {
        const room = rooms.find(r => r.id === currentRoomId);
        if (!room) return null;

        return (
            <div className="absolute top-4 left-4 z-40">
                <Card className="p-4 glass-morphism min-w-[200px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">{room.name}</h3>
                        <Button variant="ghost" size="icon" onClick={leaveRoom} title="Leave Room">
                            <DoorOpen size={18} className="text-red-500" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {room.players.map((p, i) => (
                            <div key={p.id} className="flex items-center justify-between text-sm bg-foreground/5 p-2 rounded-lg">
                                <span className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-red-500'}`} />
                                    {p.name} {p.id === currentUser.id && '(You)'}
                                </span>
                                <span className="font-bold flex items-center gap-1">
                                    <Trophy size={12} className="text-amber-500" /> {p.score}
                                </span>
                            </div>
                        ))}
                        {room.players.length < 2 && (
                            <div className="text-center text-xs opacity-50 italic py-2">
                                Waiting for opponent...
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4">
            <div className="max-w-4xl w-full space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black">Lobby</h1>
                        <p className="opacity-60">Join a game or create your own.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm opacity-60">Logged in as</p>
                            <p className="font-bold text-xl">{currentUser.name}</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Create Room Card */}
                    <Card className="p-6 border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group" onClick={() => setIsCreating(true)}>
                        <div className="p-4 rounded-full bg-primary/10 group-hover:scale-110 transition-transform mb-4">
                            <Plus size={32} className="text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">Create New Room</h3>
                        <p className="text-sm opacity-60">Host a game and invite others</p>
                    </Card>

                    {/* Room List */}
                    {rooms.map(room => (
                        <Card key={room.id} className="p-6 hover:border-primary/50 transition-colors group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-primary">{room.name}</h3>
                                    <p className="text-xs opacity-60">Host: {room.players[0]?.name}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${room.status === 'waiting' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {room.status === 'waiting' ? 'WAITING' : 'PLAYING'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-6">
                                <Users size={16} className="opacity-50" />
                                <span className="text-sm font-medium">{room.players.length} / 2 Players</span>
                            </div>

                            <Button
                                className="w-full"
                                disabled={room.status !== 'waiting'}
                                onClick={() => joinRoom(room.id)}
                            >
                                {room.status === 'waiting' ? 'Join Game' : 'Spectate (Soon)'}
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Create Room Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <Card className="w-full max-w-sm p-6">
                                <h3 className="text-xl font-bold mb-4">Create Room</h3>
                                <form onSubmit={handleCreateRoom} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Room Name"
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 focus:outline-none focus:border-primary"
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                        <Button type="submit" disabled={!newRoomName.trim()}>Create</Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
