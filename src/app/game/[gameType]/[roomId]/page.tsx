'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLobbyStore, GameType } from '@/store/useLobbyStore';
import { XoxGame } from '@/components/games/xox/XoxGame';
import dynamic from 'next/dynamic';
import { useLobbySync } from '@/hooks/useLobbySync';

// Lazy load Okey for performance
const Okey101Game = dynamic(() => import('@/components/games/okey101/Okey101Game').then(m => m.Okey101Game), {
    loading: () => <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">Loading Okey 101...</div>
});

export default function GamePage() {
    const params = useParams();
    const router = useRouter();
    const gameType = (params.gameType as string).toUpperCase() as GameType;
    const roomId = params.roomId as string;

    const { currentUser, currentRoomId, joinRoom, rooms } = useLobbyStore();

    // Enable socket sync
    useLobbySync();

    useEffect(() => {
        if (!currentUser) {
            router.push('/');
            return;
        }

        // If not in this room, try to join it
        if (currentRoomId !== roomId) {
            joinRoom(roomId);
        }
    }, [currentUser, roomId, currentRoomId, joinRoom, router]);

    // Safety check: verify we are in the correct room
    const validRoom = rooms.find(r => r.id === roomId);
    if (!currentUser || !validRoom) {
        return <div className="flex items-center justify-center h-screen bg-black text-white">Connecting to room...</div>;
    }

    if (gameType === 'XOX') {
        return <XoxGame />;
    } else if (gameType === 'OKEY101') {
        return <Okey101Game />;
    } else {
        return <div>Unknown Game Type</div>;
    }
}
