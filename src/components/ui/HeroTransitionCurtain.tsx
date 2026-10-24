import React from 'react';
import { MarvelHeroId } from '../../types';
import { MARVEL_HEROES } from '../../data/marvelHeroes';

interface HeroTransitionCurtainProps {
  targetHeroId: MarvelHeroId | null;
}

export const HeroTransitionCurtain: React.FC<HeroTransitionCurtainProps> = ({ targetHeroId }) => {
  if (!targetHeroId) return null;
  const hero = MARVEL_HEROES[targetHeroId];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden animate-in fade-in duration-300">
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at center, ${hero.primaryColor}55 0%, #000000 70%)`,
        }}
      />

      {/* Center Cinematic Title Card */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 animate-pulse">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400 mb-2">
          {hero.team.toUpperCase()} // INITIALIZING
        </span>
        <h1
          className="text-5xl sm:text-7xl font-black uppercase tracking-tighter"
          style={{ color: hero.primaryColor }}
        >
          {hero.alias}
        </h1>
        <p className="font-serif italic text-lg text-zinc-300 mt-2">
          {hero.quote}
        </p>
      </div>
    </div>
  );
};
