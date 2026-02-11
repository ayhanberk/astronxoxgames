import { create } from 'zustand';

export type Player = 'X' | 'O' | null;
export type GameView = '2D' | '3D';
export type Theme = 'light' | 'dark' | 'neon' | 'glass';

interface GameState {
  board: Player[];
  xIsNext: boolean;
  winner: Player | 'Draw' | null;
  winningLine: number[] | null;
  view: GameView;
  theme: Theme;
  scores: { X: number; O: number };

  // Actions
  makeMove: (index: number) => void;
  resetGame: () => void;
  toggleView: () => void;
  setTheme: (theme: Theme) => void;
}

const checkWinner = (squares: Player[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  if (squares.every(s => s !== null)) return { winner: 'Draw' as const, line: null };
  return null;
};

export const useGameStore = create<GameState>((set) => ({
  board: Array(9).fill(null),
  xIsNext: true,
  winner: null,
  winningLine: null,
  view: '2D',
  theme: 'dark',
  scores: { X: 0, O: 0 },

  makeMove: (index) => set((state) => {
    if (state.board[index] || state.winner) return state;

    const newBoard = [...state.board];
    newBoard[index] = state.xIsNext ? 'X' : 'O';

    const result = checkWinner(newBoard);

    if (result) {
      const newScores = { ...state.scores };
      if (result.winner === 'X') newScores.X += 1;
      if (result.winner === 'O') newScores.O += 1;

      return {
        board: newBoard,
        winner: result.winner,
        winningLine: result.line,
        scores: newScores,
      };
    }

    return {
      board: newBoard,
      xIsNext: !state.xIsNext,
    };
  }),

  resetGame: () => set((state) => ({
    board: Array(9).fill(null),
    xIsNext: true,
    winner: null,
    winningLine: null,
  })),

  toggleView: () => set((state) => ({
    view: state.view === '2D' ? '3D' : '2D'
  })),

  setTheme: (theme) => set({ theme }),
}));
