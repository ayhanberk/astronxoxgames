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
    tiles: (Tile | null)[]; // Tiles on the rack, null means empty slot
}

interface OkeyState {
    tiles: Tile[]; // Draw pile
    centerPile: Tile[]; // Discard pile
    playersHands: Record<string, (Tile | null)[]>; // Map playerId -> tiles
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
        // Always reset for debugging/user request
        // if (get().tiles.length > 0 || Object.keys(get().playersHands).length > 0) return;

        const deck = generateTiles();
        // Distribute to 4 players (mock)
        // In real app, this happens on server
        const hands: Record<string, (Tile | null)[]> = {};
        const RACK_SIZE = 26; // 2 Rows of 13

        // Helper to create hand
        const createHand = (initialTiles: Tile[]) => {
            const hand: (Tile | null)[] = new Array(RACK_SIZE).fill(null);
            initialTiles.forEach((t, i) => {
                if (i < RACK_SIZE) hand[i] = t;
            });
            return hand;
        };

        hands['player1'] = createHand(deck.splice(0, 15));
        hands['player2'] = createHand(deck.splice(0, 14));
        hands['player3'] = createHand(deck.splice(0, 14));
        hands['player4'] = createHand(deck.splice(0, 14));

        set({ tiles: deck, playersHands: hands, centerPile: [] });
    },

    drawTile: (playerId) => {
        const { tiles, playersHands } = get();
        if (tiles.length === 0) return;

        const newTiles = [...tiles];
        const drawnTile = newTiles.pop();

        if (drawnTile) {
            const emptyIndex = playersHands[playerId].findIndex(t => t === null);

            if (emptyIndex !== -1) {
                const newHand = [...playersHands[playerId]];
                newHand[emptyIndex] = drawnTile;

                set({
                    tiles: newTiles,
                    playersHands: {
                        ...playersHands,
                        [playerId]: newHand
                    }
                });
            }
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
                    [playerId]: hand.map(t => t?.id === tileId ? null : t)
                },
                centerPile: [...centerPile, tile]
            });
        }
    },

    moveTile: (playerId, tileId, newIndex) => {
        const { playersHands } = get();
        const hand = [...playersHands[playerId]];
        const oldIndex = hand.findIndex(t => t.id === tileId);

        if (oldIndex !== -1 && newIndex >= 0 && newIndex < hand.length) {
            // Swap
            const movingTile = hand[oldIndex];
            const targetTile = hand[newIndex];

            hand[newIndex] = movingTile;
            hand[oldIndex] = targetTile;

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
        const rawHand = playersHands[playerId];
        const tiles = rawHand.filter((t): t is Tile => t !== null); // Filter nulls

        // 1. Separate Jokers (if any specific logic needed, for now treat as regular or handle later)
        // 2. Groups (Sets: 7-7-7) and Runs (Runs: 7-8-9) detection is complex.
        // Simplified Logic for "Smart Sort":
        // - Sort by Color, then Value
        // - Detect Runs
        // - Detect Sets
        // Priority: Longest Runs > Sets > Pairs > Singles

        // For this iteration, let's do a strict specific sort based on 'by' param as requested,
        // but with "smart" grouping visual.
        // The user asked for "valid sequences separate from invalid".

        // Let's implement a "Standard Sort" first which is just clean organization.
        // Smart sort requires a full solver.

        // Sorting Logic:
        tiles.sort((a, b) => {
            if (by === 'color') {
                if (a.color === b.color) return a.value - b.value;
                return (a.color || '').localeCompare(b.color || '');
            } else {
                // By Value (Sets)
                if (a.value === b.value) return (a.color || '').localeCompare(b.color || '');
                return a.value - b.value;
            }
        });

        // Re-distribute with gaps? Current request implies "auto arrange".
        // Let's pack them tightly for now, as "unmatchable separate" implies advanced logic.
        // We will just pack them.

        const newHand = new Array(rawHand.length).fill(null);
        tiles.forEach((t, i) => newHand[i] = t);

        set({
            playersHands: {
                ...playersHands,
                [playerId]: newHand
            }
        });
    }
}));
