import { io } from 'socket.io-client';

// Compute the URL dynamically.
// If we are on localhost, it uses localhost.
// If we are on 192.168.x.x, it uses 192.168.x.x
const getSocketUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3001'; // SSR fallback

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    // Assume port 3001 for socket server, regardless of frontend port
    return `${protocol}//${hostname}:3001`;
};

export const socket = io(getSocketUrl(), {
    autoConnect: true,
    transports: ['websocket', 'polling'] // Add polling for broader compatibility
});
