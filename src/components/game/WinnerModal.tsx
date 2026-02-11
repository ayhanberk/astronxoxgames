'use client';

import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from '@/components/ui/core';
import { Trophy, Share2, RotateCcw } from 'lucide-react';

export function WinnerModal() {
    const { winner, resetGame } = useGameStore();

    return (
        <AnimatePresence>
            {winner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    >
                        <Card className="max-w-md w-full text-center p-8 border-primary/20 shadow-2xl relative overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />

                            <motion.div
                                initial={{ rotate: -10, scale: 0.5 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', damping: 10 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                            >
                                <Trophy size={40} className={winner === 'Draw' ? 'text-foreground/50' : 'text-primary'} />
                            </motion.div>

                            <h2 className="text-3xl font-black mb-2 italic">
                                {winner === 'Draw' ? "IT'S A DRAW!" : `${winner} WINS!`}
                            </h2>
                            <p className="text-foreground/60 mb-8 italic">
                                {winner === 'Draw' ? "Great match! No one gets the crown this time." : "An absolute masterclass in strategy."}
                            </p>

                            <div className="flex flex-col gap-3">
                                <Button size="lg" className="w-full gap-2 rounded-2xl" onClick={resetGame}>
                                    <RotateCcw size={18} /> Play Again
                                </Button>
                                <Button variant="ghost" className="w-full gap-2 rounded-2xl">
                                    <Share2 size={18} /> Share Result
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
