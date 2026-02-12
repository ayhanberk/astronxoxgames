'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button, Card } from '@/components/ui/core';
import { Trophy, RotateCcw, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function WinnerModal() {
    const { winner, resetGame } = useGameStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Confetti Logic
    useEffect(() => {
        if (winner && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const particles: any[] = [];
            const colors = ['#f43f5e', '#ec4899', '#d946ef', '#8b5cf6', '#6366f1'];

            for (let i = 0; i < 150; i++) {
                particles.push({
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15,
                    size: Math.random() * 8 + 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 100
                });
            }

            const animate = () => {
                if (!ctx) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                let active = false;

                particles.forEach(p => {
                    if (p.life > 0) {
                        active = true;
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy += 0.2; // Gravity
                        p.life--;
                        p.size *= 0.96;

                        ctx.fillStyle = p.color;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });

                if (active) requestAnimationFrame(animate);
            };

            animate();
        }
    }, [winner]);

    return (
        <AnimatePresence>
            {winner && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 50 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="relative z-10 w-full max-w-md"
                    >
                        <Card className="glass-morphism p-8 flex flex-col items-center text-center gap-6 border-primary/20 bg-background/40 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg animate-bounce">
                                {winner === 'Draw' ? (
                                    <XCircle size={48} className="text-white" />
                                ) : (
                                    <Trophy size={48} className="text-white" />
                                )}
                            </div>

                            <div>
                                <h2 className="text-4xl font-black mb-2 tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                                    {winner === 'Draw' ? 'GAME DRAW!' : `${winner} WINS!`}
                                </h2>
                                <p className="text-lg opacity-70">
                                    {winner === 'Draw' ? "No one takes the crown." : "Victory worthy of a champion."}
                                </p>
                            </div>

                            <div className="flex gap-4 w-full">
                                <Button
                                    size="lg"
                                    className="w-full text-lg h-14 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                    onClick={resetGame}
                                >
                                    <RotateCcw className="mr-2" /> Play Again
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
