'use client';

import { useGameStore } from '@/store/useGameStore';
import { Button, Card } from '@/components/ui/core';
import { Board2D } from '@/components/game/Board2D';
import { Board3D } from '@/components/game/Board3D';
import { WinnerModal } from '@/components/game/WinnerModal';
import { Monitor, Box, RotateCcw, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { view, toggleView, theme, setTheme, resetGame, scores } = useGameStore();

  const themes: { name: string; value: typeof theme }[] = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
    { name: 'Neon', value: 'neon' },
    { name: 'Glass', value: 'glass' },
  ];

  return (
    <main className="container mx-auto min-h-screen px-4 py-8 flex flex-col items-center">
      {/* Header Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full flex flex-wrap justify-between items-center gap-4 mb-12"
      >
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold tracking-tight">Astron XOX</h1>
          <p className="text-sm opacity-60">Premium 3D Gaming Experience</p>
        </div>

        <div className="flex items-center gap-3">
          <Card className="flex items-center gap-6 py-3 px-6 rounded-2xl">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider opacity-50">Player X</span>
              <span className="text-2xl font-black">{scores.X}</span>
            </div>
            <div className="w-[1px] h-8 bg-foreground/10" />
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider opacity-50">Player O</span>
              <span className="text-2xl font-black">{scores.O}</span>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Control Bar */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-morphism rounded-3xl p-2 flex gap-2 mb-8"
      >
        <Button
          variant={view === '2D' ? 'primary' : 'ghost'}
          className="rounded-2xl gap-2"
          onClick={() => view !== '2D' && toggleView()}
        >
          <Monitor size={18} /> 2D View
        </Button>
        <Button
          variant={view === '3D' ? 'primary' : 'ghost'}
          className="rounded-2xl gap-2"
          onClick={() => view !== '3D' && toggleView()}
        >
          <Box size={18} /> 3D View
        </Button>
        <div className="w-[1px] h-8 self-center bg-foreground/10 mx-1" />
        <Button variant="ghost" size="icon" className="rounded-2xl" onClick={resetGame}>
          <RotateCcw size={18} />
        </Button>
      </motion.div>

      {/* Game Area */}
      <div className="relative w-full max-w-[500px] aspect-square">
        <AnimatePresence mode="wait">
          {view === '2D' ? (
            <motion.div
              key="2d"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full h-full"
            >
              <Card className="w-full h-full flex items-center justify-center p-0 overflow-hidden">
                <Board2D />
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="3d"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full h-full"
            >
              <Card className="w-full h-full flex items-center justify-center p-0 overflow-hidden">
                <Board3D />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme Selector */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-auto pt-12 flex flex-wrap justify-center gap-4"
      >
        {themes.map((t) => (
          <Button
            key={t.value}
            variant={theme === t.value ? 'primary' : 'outline'}
            className="rounded-full px-6"
            onClick={() => setTheme(t.value)}
          >
            <Palette size={16} className="mr-2" />
            {t.name}
          </Button>
        ))}
      </motion.div>

      <WinnerModal />
    </main>
  );
}
