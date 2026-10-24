import React, { useEffect } from 'react';
import { MarvelHeroId } from '../../types';
import { MARVEL_HERO_LIST } from '../../data/marvelHeroes';
import { soundEngine } from '../../services/soundEngine';
import { X, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

interface HeroSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeHeroId: MarvelHeroId;
  onSelectHero: (heroId: MarvelHeroId) => void;
}

export const HeroSelectorModal: React.FC<HeroSelectorModalProps> = ({
  isOpen,
  onClose,
  activeHeroId,
  onSelectHero,
}) => {
  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-zinc-950/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                MARVEL HERO SELECTOR
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-widest">
                5 HEROES READY
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select an Avenger or mutant legend to launch their Apple-grade cinematic scrollytelling experience.
            </p>
          </div>

          <button
            onClick={() => {
              soundEngine.playHudClick();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {MARVEL_HERO_LIST.map((hero) => {
            const isCurrent = hero.id === activeHeroId;
            return (
              <div
                key={hero.id}
                onClick={() => {
                  onSelectHero(hero.id);
                  onClose();
                }}
                className={`relative group rounded-2xl p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isCurrent
                    ? 'bg-zinc-900/90 border-red-500 shadow-[0_0_30px_rgba(230,36,41,0.3)] scale-[1.02]'
                    : 'bg-zinc-900/40 border-white/10 hover:border-white/20 hover:bg-zinc-900/70'
                }`}
                style={{
                  borderTopColor: hero.primaryColor,
                  borderTopWidth: '4px',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase"
                      style={{
                        backgroundColor: `${hero.primaryColor}20`,
                        color: hero.primaryColor,
                        border: `1px solid ${hero.primaryColor}40`,
                      }}
                    >
                      {hero.team.split('/')[0].trim()}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono bg-red-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-red-400 transition">
                    {hero.alias}
                  </h3>
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wide">
                    {hero.name}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                    {hero.tagline}
                  </p>
                </div>

                {/* Radar Stat Bars */}
                <div className="my-4 flex flex-col gap-1.5 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" /> Power
                    </span>
                    <span className="text-zinc-300 font-bold">{hero.stats.power}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${hero.stats.power}%`, backgroundColor: hero.primaryColor }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-400" /> Combat
                    </span>
                    <span className="text-zinc-300 font-bold">{hero.stats.combat}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${hero.stats.combat}%`, backgroundColor: hero.accentColor }}
                    />
                  </div>
                </div>

                {/* Switch Button */}
                <button
                  className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition ${
                    isCurrent
                      ? 'bg-white/10 text-zinc-400'
                      : 'bg-white/10 group-hover:bg-red-600 text-white'
                  }`}
                >
                  <span>{isCurrent ? 'SELECTED' : 'LAUNCH EXPERIENCE'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-black flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div>PRESS <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-zinc-400">ESC</kbd> TO CLOSE</div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>MARVEL CINEMATIC EXPERIENCE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
