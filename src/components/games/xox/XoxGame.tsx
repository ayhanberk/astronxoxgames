'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button, Card } from '@/components/ui/core';
import { Board2D } from '@/components/game/Board2D';
import { Board3D } from '@/components/game/Board3D';
import { WinnerModal } from '@/components/game/WinnerModal';
import { useLobbyStore } from '@/store/useLobbyStore';
import { Box, RotateCcw, Sun, Moon, Zap, Sparkles, Snowflake, Umbrella, Rocket, Cpu, Candy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chat } from '@/components/game/Chat';
import { Notifications } from '@/components/ui/Notifications';

export function XoxGame() {
    const { view, toggleView, theme, setTheme, resetGame, scores, pendingMove, setPendingMove, confirmMove } = useGameStore();
    const { currentUser, currentRoomId, leaveRoom, rooms } = useLobbyStore();

    const currentRoom = rooms.find(r => r.id === currentRoomId);

    const themes: { name: string; value: typeof theme; icon: React.ElementType }[] = [
        { name: 'Light', value: 'light', icon: Sun },
        { name: 'Dark', value: 'dark', icon: Moon },
        { name: 'Neon', value: 'neon', icon: Zap },
        { name: 'Glass', value: 'glass', icon: Sparkles },
        { name: 'Winter', value: 'winter', icon: Snowflake },
        { name: 'Beach', value: 'beach', icon: Umbrella },
        { name: 'Space', value: 'space', icon: Rocket },
        { name: 'Cyber', value: 'cyberpunk', icon: Cpu },
        { name: 'Candy', value: 'candy', icon: Candy },
    ];

    // Dynamic UI Styles based on Theme
    const getThemeStyles = () => {
        const lightThemes = ['light', 'winter', 'beach', 'candy', 'glass'];
        const isLight = lightThemes.includes(theme);

        return {
            text: isLight ? 'text-slate-900' : 'text-white',
            textMuted: isLight ? 'text-slate-500' : 'text-white/60',
            bg: isLight ? 'bg-white/60' : 'bg-black/60',
            border: isLight ? 'border-black/10' : 'border-white/10',
            hover: isLight ? 'hover:bg-black/5' : 'hover:bg-white/10',
            subtext: isLight ? 'text-slate-600' : 'text-white/70',
            label: isLight ? 'text-slate-400' : 'text-white/50',
        };
    };

    const ui = getThemeStyles();

    return (
        <div className="relative w-full h-full">
            {/* 3D Canvas Background - Fixed Layer */}
            {view === '3D' && (
                <div className="fixed inset-0 z-0 pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                    >
                        <Board3D />
                    </motion.div>
                </div>
            )}

            {/* Enable pointer events for UI children */}
            <div className="contents [&>*]:pointer-events-auto relative z-50">

                {/* Room Info & User List Panel */}
                <div className="absolute top-6 left-6 z-[100] flex flex-col gap-3 pointer-events-none">
                    {/* Room Name & Leave */}
                    <Card className={`glass-morphism p-4 pointer-events-auto flex justify-between items-center gap-4 min-w-[240px] backdrop-blur-2xl shadow-2xl ${ui.bg} ${ui.border}`}>
                        <div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${ui.label}`}>ARENA</div>
                            <div className={`font-black text-lg truncate max-w-[140px] ${ui.text}`}>{currentRoom?.name || 'Unknown'}</div>
                        </div>
                        <Button
                            size="xs"
                            variant="destructive"
                            className="h-8 px-4 text-[10px] uppercase font-bold tracking-wider hover:bg-red-500/20 text-red-500 border border-red-500/20"
                            onClick={(e) => { e.stopPropagation(); leaveRoom(); }}
                        >
                            Leave
                        </Button>
                    </Card>

                    {/* Players List */}
                    <Card className={`glass-morphism p-4 pointer-events-auto flex flex-col gap-3 min-w-[240px] backdrop-blur-2xl shadow-xl animate-in slide-in-from-left-4 fade-in duration-500 ${ui.bg} ${ui.border}`}>
                        <div className={`text-[10px] font-bold opacity-50 uppercase tracking-widest border-b pb-2 ${ui.text} ${ui.border}`}>Players</div>

                        {/* Player X */}
                        <div className="flex items-center justify-between text-sm group">
                            <div className="flex items-center gap-3">
                                <span className="font-black text-primary bg-primary/10 w-6 h-6 rounded flex items-center justify-center">X</span>
                                <span className={currentRoom?.players[0] ? `${ui.text} font-medium` : `${ui.textMuted} italic`}>
                                    {currentRoom?.players[0]?.name || 'Waiting...'}
                                </span>
                            </div>
                            {currentRoom?.turn === 'X' && <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
                        </div>

                        {/* Player O */}
                        <div className="flex items-center justify-between text-sm group">
                            <div className="flex items-center gap-3">
                                <span className="font-black text-amber-500 bg-amber-500/10 w-6 h-6 rounded flex items-center justify-center">O</span>
                                <span className={currentRoom?.players[1] ? `${ui.text} font-medium` : `${ui.textMuted} italic`}>
                                    {currentRoom?.players[1]?.name || 'Waiting...'}
                                </span>
                            </div>
                            {currentRoom?.turn === 'O' && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />}
                        </div>
                    </Card>

                    {/* Spectators List */}
                    {currentRoom?.spectators && currentRoom.spectators.length > 0 && (
                        <Card className={`glass-morphism p-4 pointer-events-auto flex flex-col gap-2 min-w-[240px] backdrop-blur-2xl shadow-xl animate-in slide-in-from-left-4 fade-in duration-700 ${ui.bg} ${ui.border}`}>
                            <div className={`flex justify-between items-center border-b pb-2 mb-1 ${ui.border}`}>
                                <span className={`text-[10px] font-bold opacity-50 uppercase tracking-widest ${ui.text}`}>Spectators</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${ui.textMuted} ${ui.hover}`}>{currentRoom.spectators.length}</span>
                            </div>
                            <div className="max-h-[100px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                                {currentRoom.spectators.map((spec) => (
                                    <div key={spec.id} className={`text-[11px] flex items-center gap-2 py-0.5 ${ui.subtext}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${ui.textMuted}`} />
                                        {spec.name}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Control Bar - Centered Top */}
                <div className="flex flex-col items-center gap-4 mb-8 z-[90] relative pointer-events-auto mt-8">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`glass-morphism rounded-full p-2 flex gap-2 backdrop-blur-md shadow-2xl ${ui.bg} ${ui.border}`}
                    >
                        <Button
                            size="icon"
                            variant={view === '2D' ? 'primary' : 'ghost'}
                            className={`rounded-full w-12 h-12 transition-all ${view === '2D' ? 'shadow-lg scale-105' : `opacity-50 hover:opacity-100 ${ui.hover} ${ui.text}`}`}
                            onClick={() => toggleView()}
                        >
                            <div className="font-black text-sm">2D</div>
                        </Button>
                        <Button
                            size="icon"
                            variant={view === '3D' ? 'primary' : 'ghost'}
                            className={`rounded-full w-12 h-12 transition-all ${view === '3D' ? 'shadow-lg scale-105' : `opacity-50 hover:opacity-100 ${ui.hover} ${ui.text}`}`}
                            onClick={() => toggleView()}
                        >
                            <Box size={20} />
                        </Button>

                        {(currentUser?.id === currentRoom?.hostId) && (
                            <>
                                <div className={`w-[1px] h-8 mx-1 self-center ${ui.border}`} />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="rounded-full w-12 h-12 opacity-80 hover:opacity-100 hover:bg-red-500/20"
                                    onClick={resetGame}
                                >
                                    <RotateCcw size={18} />
                                </Button>
                            </>
                        )}
                    </motion.div>

                    {/* Scoreboard - Moved Below Controls */}
                    <div className="flex flex-col items-center gap-2">
                        <Card className={`flex items-center gap-8 py-3 px-8 rounded-full bg-black/60 backdrop-blur-xl shadow-2xl relative overflow-hidden ${ui.bg} ${ui.border}`}>
                            {/* Turn Indicator Background */}
                            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-transform duration-1000 ${currentRoom?.turn === 'X' ? '-translate-x-full' : 'translate-x-full'}`} />

                            <div className={`flex flex-col items-center gap-0.5 transition-opacity ${currentRoom?.turn === 'X' ? 'opacity-100 scale-105' : 'opacity-50'}`}>
                                <span className={`text-[9px] font-bold uppercase tracking-wider opacity-60 ${ui.text}`}>Player X</span>
                                <span className="text-3xl font-black tabular-nums text-primary drop-shadow-sm">{scores.X}</span>
                            </div>

                            <div className={`w-[1px] h-8 ${ui.border}`} />

                            <div className={`flex flex-col items-center gap-0.5 transition-opacity ${currentRoom?.turn === 'O' ? 'opacity-100 scale-105' : 'opacity-50'}`}>
                                <span className={`text-[9px] font-bold uppercase tracking-wider opacity-60 ${ui.text}`}>Player O</span>
                                <span className="text-3xl font-black tabular-nums text-primary drop-shadow-sm">{scores.O}</span>
                            </div>
                        </Card>
                        {/* Status Text */}
                        <div className="glass-morphism px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 border-primary/20 text-white shadow-lg animate-in fade-in slide-in-from-top-2">
                            {currentRoom?.turn === (currentUser?.id === currentRoom?.players[0]?.id ? 'X' : 'O')
                                ? "It's Your Turn!"
                                : "Opponent's Turn"}
                        </div>
                    </div>
                </div>

                {/* Game Area - 2D Board - STRICTLY REMOVED IN 3D TO PREVENT BLOCKING */}
                {view === '2D' && (
                    <div className="relative z-50 w-full max-w-[400px] aspect-square mx-auto my-auto">
                        <motion.div
                            className="w-full h-full"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                        >
                            <Board2D />
                        </motion.div>
                    </div>
                )}

                {/* ... 3D Controls ... */}

                {/* Theme Selector - Host Only */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-auto pt-6 flex flex-col items-center gap-2 w-full z-50 relative pointer-events-auto pb-8"
                >
                    {currentUser?.id !== currentRoom?.hostId && (
                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            Only Host can change theme
                        </div>
                    )}
                    <div className={`glass-morphism p-2 rounded-2xl flex flex-wrap justify-center gap-2 backdrop-blur-xl ${currentUser?.id !== currentRoom?.hostId ? 'opacity-50 pointer-events-none grayscale' : ''} ${ui.bg} ${ui.border}`}>
                        {themes.map((t) => (
                            <Button
                                key={t.value}
                                variant={theme === t.value ? 'primary' : 'ghost'}
                                disabled={currentUser?.id !== currentRoom?.hostId}
                                className={`rounded-xl px-4 py-3 flex flex-col items-center gap-2 min-w-[70px] transition-all ${theme === t.value ? 'shadow-lg scale-105' : `${ui.hover} ${ui.text}`} `}
                                onClick={() => setTheme(t.value)}
                            >
                                <t.icon size={20} className={theme === t.value ? 'text-primary-foreground' : `opacity-60 ${ui.text}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === t.value ? 'text-primary-foreground' : ui.text}`}>{t.name}</span>
                            </Button>
                        ))}
                    </div>
                </motion.div>

                {/* Move Confirmation Modal (for 3D) - CENTERED BUT NON-BLOCKING */}
                <AnimatePresence>
                    {pendingMove !== null && view === '3D' && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="pointer-events-auto flex flex-col gap-4 bg-black/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] min-w-[280px]"
                            >
                                <div className="text-white text-center">
                                    <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1 text-primary">Confirm Move</div>
                                    <div className="text-sm font-medium">Place your piece here?</div>
                                </div>
                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                                        onClick={() => setPendingMove(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1 rounded-xl px-8 shadow-lg shadow-primary/20 transition-transform active:scale-95"
                                        onClick={() => confirmMove()}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <WinnerModal />

                {/* Social Features */}
                <Chat />
                <Notifications />
            </div>
        </div>
    );
}
