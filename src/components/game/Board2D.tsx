'use client';

import { useGameStore } from '@/store/useGameStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Board2D() {
    const { board, makeMove, winningLine, winner } = useGameStore();

    return (
        <div className="relative w-full h-full grid grid-cols-3 gap-4 p-4">
            {board.map((cell, i) => (
                <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={!cell && !winner ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
                    whileTap={!cell && !winner ? { scale: 0.95 } : {}}
                    onClick={() => makeMove(i)}
                    className={cn(
                        "relative aspect-square flex items-center justify-center rounded-2xl text-5xl font-black transition-all",
                        "bg-foreground/5 border border-foreground/10",
                        winningLine?.includes(i) && "bg-primary/20 border-primary shadow-[0_0_20px_rgba(37,99,235,0.3)]",
                        !cell && !winner && "cursor-pointer hover:border-foreground/20"
                    )}
                >
                    {cell && (
                        <motion.span
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className={cn(
                                cell === 'X' ? "text-primary" : "text-amber-500",
                                winningLine?.includes(i) && "scale-110"
                            )}
                        >
                            {cell}
                        </motion.span>
                    )}
                </motion.button>
            ))}

            {/* Grid Lines Overlay for extra premium feel */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 gap-4 p-4 opacity-10">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-foreground rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
