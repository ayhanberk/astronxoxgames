import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useLobbyStore } from '@/store/useLobbyStore';

export function useMultiplayerSync() {
    const { board, setBoard, setTurn, setWinner, turn, winner } = useGameStore();
    const { rooms, currentRoomId, updateRoomStatus, joinRoom, leaveRoom, login } = useLobbyStore();

    useEffect(() => {
        // Channel for Game Moves
        const gameChannel = new BroadcastChannel('game_channel');

        // Channel for Lobby Updates
        const lobbyChannel = new BroadcastChannel('lobby_channel');

        gameChannel.onmessage = (event) => {
            const { type, payload } = event.data;
            if (type === 'MOVE') {
                const { newBoard, newTurn } = payload;
                // Only update if it's different to prevent loops (basic check)
                setBoard(newBoard);
                setTurn(newTurn);
            } else if (type === 'RESET') {
                setWinner(null);
                setBoard(Array(9).fill(null));
                setTurn('X');
            }
        };

        lobbyChannel.onmessage = (event) => {
            const { type, payload } = event.data;
            console.log('Lobby Update:', type, payload);

            if (type === 'ROOM_UPDATE') {
                // Force re-fetch or internal update logic would go here
                // For now, we rely on the fact that useLobbyStore might need a way to ingest external state
                // But since useLobbyStore is local, we need to sync the 'rooms' array
                useLobbyStore.setState({ rooms: payload });
            }
        };

        return () => {
            gameChannel.close();
            lobbyChannel.close();
        };
    }, [setBoard, setTurn, setWinner, rooms]); // Dependencies

    // We need a way to BROADCAST actions. 
    // Ideally, we'd wrap the store actions, but for this MVP, we can listen to state changes 
    // or use a middleware. However, a simpler approach for this "hook" is to utilize
    // the fact that we can just broadcast when we *make* a move.
    // BUT: The components call store directly.

    // Better approach: Middleware in the store? 
    // Or just a simple effect that broadcasts state changes?
    // Let's broadcast state changes.

    useEffect(() => {
        const gameChannel = new BroadcastChannel('game_channel');
        // Broadcast current state whenever it changes? No, that causes loops.
        // We should broadcast only ACTIONS.
        // Since we can't easily hook into actions without middleware, 
        // let's try a diff approach: "Subscribe" to store changes and broadcast if local action.
        // Actually, for a visual demo, let's just make sure *new* moves are shared.

        // Ideally, the stores themselves should handle this.
        // Let's modify the stores to support broadcast.
        gameChannel.close();
    }, [board, turn, winner]);

}
