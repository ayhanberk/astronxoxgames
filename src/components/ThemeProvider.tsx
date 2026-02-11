'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useGameStore, Theme } from '@/store/useGameStore';

const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useGameStore();

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', theme);

        // Smooth transition between themes
        root.classList.add('theme-transition');
        const timer = setTimeout(() => {
            root.classList.remove('theme-transition');
        }, 300);

        return () => clearTimeout(timer);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div className={`min-h-screen transition-colors duration-300 ${theme === 'glass' ? 'premium-gradient' : ''}`}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
