import React, { useState } from 'react';
import { SpiderHeroId, SpiderHeroMeta } from '../../types';
import { SPIDER_HERO_LIST } from '../../data/spiderHeroes';
import { soundEngine } from '../../services/soundEngine';
import {
  X,
  Zap,
  Globe,
  Radio,
  CheckCircle2,
  Biohazard,
} from 'lucide-react';

interface MultiverseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHero: (heroId: SpiderHeroId) => void;
  currentHeroId: SpiderHeroId;
  isSymbioteSurge: boolean;
}

export const MultiverseSelectorModal: React.FC<MultiverseSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectHero,
  currentHeroId,
  isSymbioteSurge,
}) => {
  const [hoveredHero, setHoveredHero] = useState<SpiderHeroMeta>(
    SPIDER_HERO_LIST.find((h) => h.id === currentHeroId) || SPIDER_HERO_LIST[0]
  );
  const [showSymbioteVariants, setShowSymbioteVariants] = useState(isSymbioteSurge);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Background Web Matrix */}
      <div className="absolute inset-0 spider-web-grid opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#090B12] border border-white/15 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-hero-primary/20 border border-hero-primary/50 flex items-center justify-center text-hero-primary shadow-[0_0_15px_var(--hero-glow)]">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-comic text-2xl tracking-wide text-white">MULTIVERSE REALITY SELECTOR</span>
                <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-zinc-300">
                  WEB OF DESTINY
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400">
                Select an anomaly signature or Klyntar organism to initialize dimensional jump.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Toggle Symbiote Variant Preview */}
            <button
              onClick={() => {
                soundEngine.playHudClick();
                setShowSymbioteVariants(!showSymbioteVariants);
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition ${
                showSymbioteVariants
                  ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Biohazard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SYMBIOTE CODEX:</span>
              <span className="font-extrabold">{showSymbioteVariants ? 'INFESTED' : 'STANDARD'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                soundEngine.playHudClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (Grid + Sidebar Preview) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Character Cards Grid (8 cols on lg) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SPIDER_HERO_LIST.map((hero) => {
              const isActive = hero.id === currentHeroId;
              const isSelectedPreview = hero.id === hoveredHero.id;

              return (
                <div
                  key={hero.id}
                  data-hero-card={hero.id}
                  onMouseEnter={() => {
                    setHoveredHero(hero);
                  }}
                  onClick={() => {
                    onSelectHero(hero.id);
                  }}
                  className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isActive
                      ? 'bg-[#151226] border-hero-primary shadow-[0_0_30px_var(--hero-glow)] ring-1 ring-hero-primary/50'
                      : isSelectedPreview
                      ? 'bg-[#101424] border-white/30'
                      : 'bg-[#0B0E1A]/80 border-white/10 hover:border-white/20 hover:bg-[#0E1220]'
                  }`}
                >
                  {/* Subtle dimension watermark */}
                  <span className="absolute -right-2 -bottom-4 font-mono font-black text-5xl text-white/[0.03] pointer-events-none select-none">
                    {hero.earthDesignation.replace('Earth-', 'E-')}
                  </span>

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: hero.primaryColor }}
                        />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                          {hero.earthDesignation}
                        </span>
                      </div>

                      {isActive ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                          {hero.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-comic text-2xl text-white tracking-wide group-hover:text-hero-primary transition">
                      {showSymbioteVariants ? hero.symbioteVariantName : hero.alias}
                    </h3>
                    <p className="text-xs font-semibold text-zinc-400 mb-1">
                      {hero.name} · <span className="text-zinc-500 font-mono text-[11px]">{hero.universe}</span>
                    </p>

                    <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                      {showSymbioteVariants ? hero.symbioteDescription : hero.tagline}
                    </p>
                  </div>

                  {/* Power Gauge Mini Preview */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Agility: <strong className="text-white">{hero.agility}%</strong></span>
                    <span className="text-zinc-500">Power: <strong className="text-white">{hero.strength}%</strong></span>
                    <span
                      className="font-bold group-hover:underline text-[11px]"
                      style={{ color: hero.primaryColor }}
                    >
                      {isActive ? 'CURRENT REALITY' : 'WARP HERE →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active / Hovered Hero Deep Inspection Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4 bg-[#0B0E1A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2">
                <Radio className="w-3 h-3 text-hero-primary animate-pulse" />
                <span>MULTIVERSE TELEMETRY // INSPECTION</span>
              </div>

              <div className="p-3 bg-black/60 rounded-xl border border-white/10 mb-4">
                <span className="text-[10px] font-mono font-bold text-hero-accent uppercase block">
                  {hoveredHero.earthDesignation}
                </span>
                <h4 className="font-comic text-2xl text-white tracking-wide">
                  {showSymbioteVariants ? hoveredHero.symbioteVariantName : hoveredHero.alias}
                </h4>
                <p className="text-xs text-zinc-400 italic mt-1 font-serif">
                  {hoveredHero.quote}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>AGILITY / ACROBATICS</span>
                    <span className="text-white font-bold">{hoveredHero.agility}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${hoveredHero.agility}%`, backgroundColor: hoveredHero.primaryColor }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>STRENGTH / MASS</span>
                    <span className="text-white font-bold">{hoveredHero.strength}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${hoveredHero.strength}%`, backgroundColor: hoveredHero.accentColor }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>SPIDER-SENSE REFLEX</span>
                    <span className="text-white font-bold">{hoveredHero.spiderSense}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${hoveredHero.spiderSense}%`, backgroundColor: '#FACC15' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>BIO-ELECTRIC / SYMBIOTE</span>
                    <span className="text-white font-bold">{hoveredHero.biotechBioelectric}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${hoveredHero.biotechBioelectric}%`, backgroundColor: '#A855F7' }}
                    />
                  </div>
                </div>
              </div>

              {/* Signature Arsenal */}
              <div className="mt-5 space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                  SIGNATURE ARSENAL:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hoveredHero.weapons.map((w, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 text-[11px] font-mono"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arch Nemesis */}
              <div className="mt-4 space-y-1.5 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                  CANON NEMESES:
                </span>
                <p className="text-zinc-400 font-mono text-[11px]">
                  {hoveredHero.archNemesis.join(' • ')}
                </p>
              </div>
            </div>

            {/* Launch Reality Button */}
            <button
              onClick={() => onSelectHero(hoveredHero.id)}
              className="mt-6 w-full py-3 rounded-xl bg-hero-primary hover:brightness-110 text-white font-mono text-xs font-black uppercase tracking-widest transition shadow-[0_0_20px_var(--hero-glow)] flex items-center justify-center space-x-2 active:scale-98"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>ENGAGE DIMENSIONAL JUMP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
