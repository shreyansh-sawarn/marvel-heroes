import React from 'react';
import { SpiderHeroId } from '../../types';
import { SPIDER_HEROES } from '../../data/spiderHeroes';

interface HeroTransitionCurtainProps {
  targetHero: SpiderHeroId | null;
  isSymbioteSurge?: boolean;
}

export const HeroTransitionCurtain: React.FC<HeroTransitionCurtainProps> = ({
  targetHero,
  isSymbioteSurge = false,
}) => {
  if (!targetHero) return null;

  const hero = SPIDER_HEROES[targetHero] || SPIDER_HEROES.spiderman;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden animate-fadeIn duration-200">
      {/* Background Wipe Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-in-out backdrop-blur-3xl ${
          isSymbioteSurge || targetHero === 'venom' || targetHero === 'carnage'
            ? 'bg-gradient-to-b from-[#030305]/95 via-[#150722]/95 to-[#030305]/95'
            : 'bg-gradient-to-b from-[#060810]/95 via-[#0D152B]/95 to-[#060810]/95'
        }`}
      />

      {/* Spider-Web Reticle / Anomaly Ring */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${hero.accentColor}, ${hero.accentColor} 1px, transparent 1px, transparent 4px)`,
        }}
      />

      {/* Central Dimensional Warp Emblem */}
      <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-center">
        <div className="relative flex items-center justify-center">
          <div
            className="h-32 w-32 rounded-full border-2 animate-ping opacity-75"
            style={{ borderColor: isSymbioteSurge ? '#A855F7' : hero.primaryColor }}
          />
          <div
            className="absolute h-24 w-24 rounded-full border-2 border-dashed animate-spin"
            style={{ borderColor: isSymbioteSurge ? '#FFFFFF' : hero.accentColor }}
          />
          <div
            className="absolute h-12 w-12 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              backgroundColor: isSymbioteSurge ? '#A855F7' : hero.primaryColor,
              boxShadow: `0 0 35px ${isSymbioteSurge ? '#A855F7' : hero.glowColor}`,
            }}
          >
            <span className="text-white font-mono font-black text-xs">
              {hero.earthDesignation.replace('Earth-', 'E-')}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span
            className="font-mono text-xs uppercase tracking-[0.35em] animate-pulse"
            style={{ color: isSymbioteSurge ? '#C084FC' : hero.accentColor }}
          >
            {isSymbioteSurge ? 'KLYNTAR SYMBIOTE SURGE DETECTED' : 'MULTIVERSE ANOMALY LOCK'}
          </span>
          <h2 className="font-comic text-4xl md:text-6xl tracking-wide text-white uppercase">
            {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
          </h2>
          <span className="font-mono text-xs text-zinc-300 max-w-md">
            {hero.earthDesignation} · {hero.tagline}
          </span>
        </div>
      </div>
    </div>
  );
};
