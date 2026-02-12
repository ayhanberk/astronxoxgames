import { create } from 'zustand';

export type TileColor = 'red' | 'blue' | 'black' | 'orange';
export type TileType = 'regular' | 'fake_joker';

export interface Tile {
    id: string;
    value: number; // 1-13
    color: TileColor | null; // null for fake joker
    type: TileType;
}

export interface PlayerHand {
    playerId: string;
    tiles: Tile[]; // Tiles on the rack
}

interface OkeyState {
    tiles: Tile[]; // Draw pile
    centerPile: Tile[]; // Discard pile
    playersHands: Record<string, Tile[]>; // Map playerId -> tiles
    cursorTile: Tile | null; // Tile currently being dragged/held

    // Actions
    initializeGame: () => void;
    drawTile: (playerId: string) => void;
    discardTile: (playerId: string, tileId: string) => void;
    moveTile: (playerId: string, tileId: string, newIndex: number) => void;
    sortHand: (playerId: string, by: 'color' | 'value') => void;
}

const COLORS: TileColor[] = ['red', 'blue', 'black', 'orange'];

const generateTiles = (): Tile[] => {
    let tiles: Tile[] = [];
    let idCounter = 0;

    // 2 sets of 1-13 for each color
    COLORS.forEach(color => {
        for (let i = 1; i <= 13; i++) {
            // Set 1
            tiles.push({ id: `tile-${idCounter++}`, value: i, color, type: 'regular' });
            // Set 2
            tiles.push({ id: `tile-${idCounter++}`, value: i, color, type: 'regular' });
        }
    });

    // 2 Fake Jokers
    tiles.push({ id: `tile-${idCounter++}`, value: 0, color: null, type: 'fake_joker' });
    tiles.push({ id: `tile-${idCounter++}`, value: 0, color: null, type: 'fake_joker' });

    return shuffle(tiles);
};

const shuffle = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

export const useOkeyStore = create<OkeyState>((set, get) => ({
    tiles: [],
    centerPile: [],
    playersHands: {},
    cursorTile: null,

    initializeGame: () => {
        // Prevent re-initialization if game is already active
        if (get().tiles.length > 0 || Object.keys(get().playersHands).length > 0) return;

        const deck = generateTiles();
        // Distribute to 4 players (mock)
        // In real app, this happens on server
        const hands: Record<string, Tile[]> = {};
        // taking 15 for player 1, 14 for others

        hands['player1'] = deck.splice(0, 15);
        hands['player2'] = deck.splice(0, 14);
        hands['player3'] = deck.splice(0, 14);
        hands['player4'] = deck.splice(0, 14);

        set({ tiles: deck, playersHands: hands, centerPile: [] });
    },

    drawTile: (playerId) => {
        const { tiles, playersHands } = get();
        if (tiles.length === 0) return;

        const newTiles = [...tiles];
        const drawnTile = newTiles.pop();

        if (drawnTile) {
            set({
                tiles: newTiles,
                playersHands: {
                    ...playersHands,
                    [playerId]: [...playersHands[playerId], drawnTile]
                }
            });
        }
    },

    discardTile: (playerId, tileId) => {
        const { playersHands, centerPile } = get();
        const hand = playersHands[playerId];
        const tile = hand.find(t => t.id === tileId);

        if (tile) {
            set({
                playersHands: {
                    ...playersHands,
                    [playerId]: hand.filter(t => t.id !== tileId)
                },
                centerPile: [...centerPile, tile]
            });
        }
    },

    moveTile: (playerId, tileId, newIndex) => {
        const { playersHands } = get();
        const hand = [...playersHands[playerId]];
        const oldIndex = hand.findIndex(t => t.id === tileId);

        if (oldIndex !== -1) {
            const [tile] = hand.splice(oldIndex, 1);
            hand.splice(newIndex, 0, tile);

            set({
                playersHands: {
                    ...playersHands,
                    [playerId]: hand
                }
            });
        }
    },

    sortHand: (playerId, by) => {
        const { playersHands } = get();
        const hand = [...playersHands[playerId]];

        hand.sort((a, b) => {
            if (by === 'color') {
                if (a.color === b.color) return a.value - b.value;
                return (a.color || '').localeCompare(b.color || '');
            } else {
                if (a.value === b.value) return (a.color || '').localeCompare(b.color || '');
                return a.value - b.value;
            }
        });

        set({
            playersHands: {
                ...playersHands,
                [playerId]: hand
            }
        });
    }
}));
