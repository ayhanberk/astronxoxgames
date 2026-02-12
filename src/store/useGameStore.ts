import { create } from 'zustand';
import { useLobbyStore } from './useLobbyStore';

type Player = 'X' | 'O' | null;
export type Theme = 'light' | 'dark' | 'neon' | 'glass' | 'winter' | 'beach' | 'space' | 'cyberpunk' | 'candy';
type GameView = '2D' | '3D';

interface GameState {
  board: Player[];
  turn: Player;
  winner: Player | 'Draw' | null;
  view: GameView;
  theme: Theme;
  scores: { X: number; O: number };
  pendingMove: number | null; // For move confirmation

  // Actions
  makeMove: (index: number) => void;
  confirmMove: () => void;
  setPendingMove: (index: number | null) => void;
  resetGame: () => void;
  toggleView: () => void;
  setTheme: (theme: Theme) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: Array(9).fill(null),
  turn: 'X',
  winner: null,
  view: '2D',
  theme: 'dark',
  scores: { X: 0, O: 0 },
  pendingMove: null,

  makeMove: (index) => {
    // We now use setPendingMove for 3D confirmation, 
    // but 2D might still want direct move. 
    // For consistency, let's keep makeMove as the "execute" action.
    useLobbyStore.getState().makeMove(index);
    set({ pendingMove: null });
  },

  setPendingMove: (index) => set({ pendingMove: index }),

  confirmMove: () => {
    const { pendingMove, makeMove } = get();
    if (pendingMove !== null) {
      makeMove(pendingMove);
    }
  },

  resetGame: () => {
    useLobbyStore.getState().resetGame();
  },

  toggleView: () => set((state) => ({ view: state.view === '2D' ? '3D' : '2D' })),
  setTheme: (theme) => {
    // Delegate to LobbyStore for global sync
    useLobbyStore.getState().setTheme(theme);
    // Optimistic update
    set({ theme });
  },
}));

// Sync GameStore with LobbyStore
useLobbyStore.subscribe((state) => {
  const currentRoom = state.rooms.find(r => r.id === state.currentRoomId);
  if (currentRoom) {
    // Check if theme changed to avoid redundant sets, but ensuring reactive update
    const nextTheme = (currentRoom.theme as Theme) || 'dark';

    useGameStore.setState({
      board: currentRoom.board as Player[],
      turn: currentRoom.turn as Player,
      theme: nextTheme,
      winner: calculateWinner(currentRoom.board as Player[], currentRoom.status),
      scores: {
        X: currentRoom.players[0]?.score || 0,
        O: currentRoom.players[1]?.score || 0
      }
    });
  } else {
    // Reset if no room
    useGameStore.setState({
      board: Array(9).fill(null),
      turn: 'X',
      winner: null,
      scores: { X: 0, O: 0 }
    });
  }
});

function calculateWinner(board: Player[], status: string): Player | 'Draw' | null {
  if (status !== 'finished') return null;

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes(null)) return 'Draw';
  return null;
}

