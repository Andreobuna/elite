'use client';

import { useEffect, useState } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';

const storageKey = 'elite-theme';

type ThemeMode = 'light' | 'dark';

function resolveTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(storageKey);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = resolveTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={[
        'inline-flex items-center gap-2 rounded-full border border-gold/30 bg-charcoal/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-ivory transition-colors hover:border-gold hover:bg-gold/10',
        className,
      ].join(' ')}
    >
      {mounted && theme === 'dark' ? <SunMedium size={14} /> : <MoonStar size={14} />}
      <span>{mounted ? (theme === 'dark' ? 'Light' : 'Dark') : 'Theme'}</span>
    </button>
  );
}
