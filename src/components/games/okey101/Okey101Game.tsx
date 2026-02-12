'use client';

import React from 'react';
import { useLobbyStore } from '@/store/useLobbyStore';
import { useOkeyStore } from '@/store/useOkeyStore';
import { Button, Card } from '@/components/ui/core';
import { Chat } from '@/components/game/Chat';
import { Notifications } from '@/components/ui/Notifications';
import { OkeyTable3D } from './components/OkeyTable3D';

export function Okey101Game() {
    const { currentUser, currentRoomId, leaveRoom, rooms } = useLobbyStore();
    const { initializeGame } = useOkeyStore();
    const currentRoom = rooms.find(r => r.id === currentRoomId);

    // Auto-start for dev/testing
    React.useEffect(() => {
        initializeGame();
    }, []);

    return (
        <div className="relative w-full h-full min-h-screen bg-zinc-900 flex flex-col overflow-hidden">
            {/* 3D Game Layer */}
            <div className="absolute inset-0 z-0">
                <OkeyTable3D />
            </div>

            {/* UI Overlay */}
            <div className="absolute top-6 left-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <Card className="glass-morphism p-4 flex justify-between items-center gap-4 min-w-[240px] pointer-events-auto">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5 opacity-50">Room</div>
                        <div className="font-black text-lg">{currentRoom?.name || 'Unknown'}</div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => leaveRoom()}>Leave</Button>
                </Card>
            </div>

            {/* Social Features */}
            <div className="absolute bottom-6 left-6 z-50 pointer-events-auto">
                <Chat />
            </div>
            <div className="absolute top-6 right-6 z-50 pointer-events-auto">
                <Notifications />
            </div>
        </div>
    );
}
