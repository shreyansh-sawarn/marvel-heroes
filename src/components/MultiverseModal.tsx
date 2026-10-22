import React, { useEffect } from 'react';
import { SpiderHeroId } from '../types';
import { SPIDER_HERO_LIST } from '../data/spiderHeroes';
import { soundEngine } from '../services/soundEngine';
import { X, Sparkles, Zap, Shield, Activity, Compass, ArrowRight } from 'lucide-react';

interface MultiverseModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeHeroId: SpiderHeroId;
  onSelectHero: (heroId: SpiderHeroId) => void;
}

export const MultiverseModal: React.FC<MultiverseModalProps> = ({
  isOpen,
  onClose,
  activeHeroId,
  onSelectHero,
}) => {
  // Handle ESC key press
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-black/80 to-black pointer-events-none" />

      {/* Main Modal Box */}
      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-zinc-950/90 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Compass className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
                  Multiverse Dimensional Nexus
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest">
                  8 Realities Active
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Select an alternate timeline to warp reality, physics shaders, audio stems, and suit blueprints.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playHudClick();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Realities Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPIDER_HERO_LIST.map((hero) => {
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
                    ? 'bg-zinc-900/90 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.25)] scale-[1.02]'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
                style={{
                  borderLeftColor: hero.primaryColor,
                  borderLeftWidth: '4px',
                }}
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{
                        backgroundColor: `${hero.primaryColor}20`,
                        color: hero.primaryColor,
                        border: `1px solid ${hero.primaryColor}40`,
                      }}
                    >
                      {hero.earthDesignation}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono bg-red-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                        CURRENT REALITY
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-red-400 transition">
                    {hero.name}
                  </h3>
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wide">
                    {hero.alias}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                    {hero.tagline}
                  </p>
                </div>

                {/* Stat Radars */}
                <div className="my-4 flex flex-col gap-1.5 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" /> Agility
                    </span>
                    <span className="text-zinc-300 font-bold">{hero.agility}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${hero.agility}%`, backgroundColor: hero.primaryColor }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-400" /> Strength
                    </span>
                    <span className="text-zinc-300 font-bold">{hero.strength}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${hero.strength}%`, backgroundColor: hero.accentColor }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-red-400" /> Spider-Sense
                    </span>
                    <span className="text-zinc-300 font-bold">{hero.spiderSense}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${hero.spiderSense}%`, backgroundColor: hero.primaryColor }}
                    />
                  </div>
                </div>

                {/* Bottom Warp Button */}
                <button
                  className={`w-full py-2 px-3 rounded-xl font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition ${
                    isCurrent
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      : 'bg-zinc-800 group-hover:bg-red-600 text-white border border-zinc-700 group-hover:border-red-500'
                  }`}
                >
                  <span>{isCurrent ? 'ACTIVE TIMELINE' : 'WARP REALITY'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div>
            PRESS <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">ESC</kbd> TO DISMISS MATRIX
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>ALCHEMAX TEMPORAL STABILIZER NOMINAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
