const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let rooms = [];
const players = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('login', ({ name }) => {
        const player = { id: socket.id, name, score: 0, roomId: null };
        players.set(socket.id, player);
        socket.emit('login_success', player);
        socket.emit('sync_rooms', rooms);
    });

    socket.on('create_room', (roomName) => {
        const player = players.get(socket.id);
        if (!player) return;

        const newRoom = {
            id: Math.random().toString(36).substr(2, 9),
            name: roomName,
            hostId: player.id,
            players: [player],
            spectators: [],
            status: 'waiting',
            board: Array(9).fill(null),
            turn: 'X',
            starter: 'X',
            theme: 'dark'
        };

        player.roomId = newRoom.id;
        rooms.push(newRoom);
        socket.join(newRoom.id);
        io.emit('sync_rooms', rooms);
        socket.emit('room_joined', newRoom);
    });

    socket.on('join_room', (roomId) => {
        const player = players.get(socket.id);
        if (!player || player.roomId) return;

        const room = rooms.find(r => r.id === roomId);
        if (room) {
            if (room.players.length < 2) {
                room.players.push(player);
                if (room.players.length === 2) room.status = 'playing';
            } else {
                if (!room.spectators.some(p => p.id === player.id)) {
                    room.spectators.push(player);
                }
            }
            player.roomId = roomId;
            socket.join(roomId);
            io.emit('sync_rooms', rooms);
            io.to(roomId).emit('room_updated', room);
            socket.emit('room_joined', room);
        }
    });

    socket.on('leave_room', () => {
        handleLeaveRoom(socket);
    });

    socket.on('make_move', ({ index }) => {
        const player = players.get(socket.id);
        if (!player || !player.roomId) return;

        const room = rooms.find(r => r.id === player.roomId);
        if (!room || room.status !== 'playing') return;

        // Check player mark (X or O)
        const playerMark = (room.players[0].id === player.id) ? 'X' :
            (room.players[1] && room.players[1].id === player.id ? 'O' : null);

        if (!playerMark || room.turn !== playerMark) return;
        if (room.board[index] !== null) return;

        // Apply Move
        room.board[index] = playerMark;
        room.turn = (playerMark === 'X') ? 'O' : 'X';

        // Win/Draw Check
        const winner = checkWinner(room.board);
        if (winner) {
            room.status = 'finished';
            if (winner === 'X') room.players[0].score += 1;
            if (winner === 'O' && room.players[1]) room.players[1].score += 1;
        } else if (!room.board.includes(null)) {
            room.status = 'finished'; // Draw
        }

        io.to(room.id).emit('room_updated', room);
    });

    socket.on('reset_game', () => {
        const player = players.get(socket.id);
        if (!player || !player.roomId) return;
        const room = rooms.find(r => r.id === player.roomId);
        if (room) {
            room.starter = room.starter === 'X' ? 'O' : 'X';
            room.board = Array(9).fill(null);
            room.status = 'playing';
            room.turn = room.starter;
            io.to(room.id).emit('room_updated', room);
        }
    });

    socket.on('change_theme', ({ theme }) => {
        const player = players.get(socket.id);
        if (!player || !player.roomId) return;
        const room = rooms.find(r => r.id === player.roomId);
        if (room && room.hostId === player.id) {
            room.theme = theme;
            io.to(room.id).emit('room_updated', room);
        }
    });

    socket.on('send_message', ({ roomId, message }) => {
        const player = players.get(socket.id);
        if (!player || !player.roomId || player.roomId !== roomId) return;
        const msgPayload = {
            id: Math.random().toString(36).substr(2, 9),
            senderId: player.id,
            senderName: player.name,
            message,
            timestamp: new Date().toISOString()
        };
        io.to(roomId).emit('receive_message', msgPayload);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        handleLeaveRoom(socket);
        players.delete(socket.id);
    });
});

function handleLeaveRoom(socket) {
    const player = players.get(socket.id);
    if (!player || !player.roomId) return;

    const roomId = player.roomId;
    let room = rooms.find(r => r.id === roomId);

    if (room) {
        // Remove from players or spectators
        room.players = room.players.filter(p => p.id !== player.id);
        room.spectators = room.spectators.filter(p => p.id !== player.id);
        player.roomId = null;
        socket.leave(roomId);

        if (room.players.length === 0 && room.spectators.length === 0) {
            rooms = rooms.filter(r => r.id !== roomId);
        } else {
            room.status = 'waiting';
            room.board = Array(9).fill(null);
            room.turn = 'X';
            io.to(roomId).emit('room_updated', room);
        }
        io.emit('sync_rooms', rooms);
    }
}

function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Socket.io server running on http://localhost:${PORT}`);
});
