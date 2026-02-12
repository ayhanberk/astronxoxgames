import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { socket } from '@/lib/socket';

export interface Player {
    id: string;
    name: string;
    score: number;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
}

export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export type GameType = 'XOX' | 'OKEY101';

export interface Room {
    id: string;
    name: string;
    hostId: string;
    gameType: GameType;
    players: Player[];
    spectators: Player[]; // New field
    status: 'waiting' | 'playing' | 'finished';
    board: (string | null)[];
    turn: 'X' | 'O';
    starter: 'X' | 'O';
    theme: string;
}

interface LobbyState {
    currentUser: Player | null;
    rooms: Room[];
    currentRoomId: string | null;

    // Social State
    messages: ChatMessage[];
    notifications: Notification[];

    // Actions
    login: (name: string) => void;
    createRoom: (roomName: string, gameType: GameType) => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
    makeMove: (index: number) => void;
    resetGame: () => void;
    setTheme: (theme: string) => void;

    // Social Actions
    sendMessage: (message: string) => void;
    addNotification: (message: string, type: Notification['type']) => void;
    removeNotification: (id: string) => void;

    // Socket Sync Actions (called by listeners)
    setRooms: (rooms: Room[]) => void;
    setCurrentUser: (user: Player) => void;
    setCurrentRoomId: (id: string | null) => void;
    addMessage: (msg: ChatMessage) => void;
}

// Initial mock rooms
const initialRooms: Room[] = [];

export const useLobbyStore = create<LobbyState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            rooms: initialRooms,
            currentRoomId: null,
            messages: [],
            notifications: [],

            login: (name) => {
                socket.emit('login', { name });
            },

            createRoom: (roomName, gameType) => {
                const fullName = `${roomName}|${gameType}`;
                socket.emit('create_room', fullName);
            },

            joinRoom: (roomId) => {
                socket.emit('join_room', roomId);
            },

            leaveRoom: () => {
                socket.emit('leave_room');
                set({ currentRoomId: null, messages: [] }); // Clear messages on leave
            },

            makeMove: (index) => {
                socket.emit('make_move', { index });
            },

            resetGame: () => {
                socket.emit('reset_game');
            },

            setTheme: (theme) => {
                socket.emit('change_theme', { theme });
            },

            sendMessage: (message) => {
                const { currentRoomId } = get();
                if (currentRoomId) {
                    socket.emit('send_message', { roomId: currentRoomId, message });
                }
            },

            addNotification: (message, type) => {
                const id = Math.random().toString(36).substr(2, 9);
                set(state => ({ notifications: [...state.notifications, { id, message, type }] }));

                // Auto dismiss
                setTimeout(() => {
                    get().removeNotification(id);
                }, 3000); // 3 seconds
            },

            removeNotification: (id) => {
                set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
            },

            // Setters for socket events
            setRooms: (rooms) => set({ rooms }),
            setCurrentUser: (user) => set({ currentUser: user }),
            setCurrentRoomId: (id) => set({ currentRoomId: id }),
            addMessage: (msg) => set(state => ({ messages: [...state.messages, msg] })),
        }),
        {
            name: 'lobby-storage-user',
            storage: createJSONStorage(() => localStorage), // Valid usage for web
            partialize: (state) => ({ currentUser: state.currentUser }),
            skipHydration: false
        }
    )
);

// --- Socket Listeners Setup ---
// Ensure this code only runs on the client side
if (typeof window !== 'undefined') {
    socket.on('connect', () => {
        console.log('Connected to socket server:', socket.id);

        // Auto-login if we have a saved user
        const user = useLobbyStore.getState().currentUser;
        if (user) {
            console.log('Auto-logging in as:', user.name);
            socket.emit('login', { name: user.name });
        }
    });

    socket.on('login_success', (user: Player) => {
        // We update the store with the NEW socket ID (and same name)
        useLobbyStore.getState().setCurrentUser(user);
        if (!useLobbyStore.getState().currentUser) {
            useLobbyStore.getState().addNotification(`Welcome, ${user.name}!`, 'success');
        }
    });

    socket.on('sync_rooms', (rooms: any[]) => {
        const parsedRooms = rooms.map((room: any) => {
            const parts = room.name.split('|');
            let gameType: GameType = 'XOX';
            let name = room.name;

            if (parts.length > 1) {
                const lastPart = parts[parts.length - 1];
                if (lastPart === 'XOX' || lastPart === 'OKEY101') {
                    gameType = lastPart as GameType;
                    name = parts.slice(0, -1).join('|');
                }
            }

            return { ...room, name, gameType };
        });

        useLobbyStore.getState().setRooms(parsedRooms);

        // Self-Healing: Reconnect to active room if needed
        const { currentUser, currentRoomId } = useLobbyStore.getState();
        if (currentUser && !currentRoomId) {
            const myRoom = parsedRooms.find((r: Room) => r.players.some(p => p.id === socket.id));
            if (myRoom) {
                useLobbyStore.getState().setCurrentRoomId(myRoom.id);
                useLobbyStore.getState().addNotification('Reconnected to room', 'info');
            }
        }
    });

    socket.on('room_joined', (room: any) => {
        // Parse single room
        const parts = room.name.split('|');
        let gameType: GameType = 'XOX';
        let name = room.name;
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            if (lastPart === 'XOX' || lastPart === 'OKEY101') {
                gameType = lastPart as GameType;
                name = parts.slice(0, -1).join('|');
            }
        }
        const parsedRoom = { ...room, name, gameType };

        useLobbyStore.getState().setCurrentRoomId(parsedRoom.id);
        useLobbyStore.getState().addNotification(`Joined room: ${parsedRoom.name}`, 'success');

        useLobbyStore.setState((state) => ({
            rooms: state.rooms.map(r => r.id === parsedRoom.id ? parsedRoom : r),
        }));
    });

    socket.on('room_updated', (updatedRoom: any) => {
        const parts = updatedRoom.name.split('|');
        let gameType: GameType = 'XOX';
        let name = updatedRoom.name;
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            if (lastPart === 'XOX' || lastPart === 'OKEY101') {
                gameType = lastPart as GameType;
                name = parts.slice(0, -1).join('|');
            }
        }
        const parsedRoom = { ...updatedRoom, name, gameType };

        useLobbyStore.setState((state) => ({
            rooms: state.rooms.map(r => r.id === parsedRoom.id ? parsedRoom : r),
        }));
    });

    socket.on('receive_message', (msg: ChatMessage) => {
        useLobbyStore.getState().addMessage(msg);
    });
}
