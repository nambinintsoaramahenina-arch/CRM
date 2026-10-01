"use client";

import React from 'react';
import { useTheme } from '@/components/layout/ThemeProvider';
import { SunIcon } from '@/components/ui/Icons';

// Moon icon inline (not yet in Icons.tsx)
const MoonIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

interface ThemeToggleProps {
  /** Variante visuelle selon le contexte (dark navbar, light card…) */
  variant?: 'dark' | 'light';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'dark' }) => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  const baseClasses =
    'relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/40';

  const variantClasses =
    variant === 'dark'
      ? 'bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white'
      : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900';

  return (
    <button
      onClick={toggleTheme}
      className={`${baseClasses} ${variantClasses}`}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode nuit'}
      id="theme-toggle-btn"
    >
      {isDark ? (
        <SunIcon size={17} className="text-amber-400" />
      ) : (
        <MoonIcon size={17} className="text-slate-500" />
      )}
    </button>
  );
};
