'use client';

import { useMemo } from 'react';

// Purely decorative floating gold-dust motes + glow, used behind hero content.
// Deterministic pseudo-random positions so server/client render match (no Math.random in render).
export default function AmbientBackground({ density = 24 }: { density?: number }) {
  const motes = useMemo(() => {
    return Array.from({ length: density }, (_, i) => {
      const seed = i * 137.5;
      return {
        left: (seed % 100),
        top: ((seed * 1.7) % 100),
        size: 1 + (i % 3),
        delay: (i % 10) * 0.6,
        duration: 6 + (i % 6),
      };
    });
  }, [density]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px] animate-pulse-glow" />
      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold/60 animate-float-slow"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
            boxShadow: '0 0 6px 1px rgba(212,175,55,0.6)',
          }}
        />
      ))}
    </div>
  );
}
