import React from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  Volume2,
  VolumeX,
  Compass,
  Radio,
  ShieldAlert,
} from 'lucide-react';

interface SpiderNavbarProps {
  scrollProgress: number;
  activeHero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onToggleSymbioteSurge: () => void;
  onOpenMultiverseModal: () => void;
}

export const SpiderNavbar: React.FC<SpiderNavbarProps> = ({
  scrollProgress,
  activeHero,
  isSymbioteSurge,
  onToggleSymbioteSurge,
  onOpenMultiverseModal,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundEngine.getIsMuted());

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Tensile Web-Line Scroll Indicator */}
      <div className="w-full h-[3px] bg-white/5 relative overflow-hidden">
        <div
          className="h-full transition-all duration-100 ease-out shadow-[0_0_12px_var(--hero-glow)]"
          style={{
            width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%`,
            backgroundColor: isSymbioteSurge ? '#A855F7' : activeHero.primaryColor,
          }}
        />
      </div>

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 px-4 py-2.5 shadow-2xl transition-all">
          {/* Left: Brand & Earth Designation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundEngine.playSpiderSense();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-2.5 group focus:outline-none"
            >
              {/* Spider Emblem Mask Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 ${
                  isSymbioteSurge
                    ? 'bg-purple-950/80 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                    : 'bg-black/90 border-white/20 group-hover:border-hero-primary'
                }`}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-6 h-6 transition-colors duration-300"
                  style={{
                    fill: isSymbioteSurge ? '#FFFFFF' : activeHero.primaryColor,
                  }}
                >
                  <path d="M50 15 L66 40 L50 88 L34 40 Z" />
                  <ellipse cx="43" cy="42" rx="4.5" ry="8" fill="#FFFFFF" transform="rotate(-15 43 42)" />
                  <ellipse cx="57" cy="42" rx="4.5" ry="8" fill="#FFFFFF" transform="rotate(15 57 42)" />
                  <path d="M34 38 Q15 25 10 40 Q25 45 36 44" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                  <path d="M66 38 Q85 25 90 40 Q75 45 64 44" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                  <path d="M35 48 Q10 50 8 70 Q28 65 37 55" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                  <path d="M65 48 Q90 50 92 70 Q72 65 63 55" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                </svg>
              </div>

              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5 font-comic text-lg leading-tight tracking-wide text-white group-hover:text-hero-primary transition">
                  <span>SPIDER-VERSE</span>
                  <span className="text-zinc-500 font-sans text-xs font-mono font-bold tracking-widest">// NEXUS</span>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span className="text-white font-bold">{activeHero.earthDesignation}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="truncate max-w-[120px]">{activeHero.alias}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Center: Multiverse Dimensional Anchor */}
          <div className="hidden md:flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-hero-accent animate-pulse" />
            <span className="text-zinc-400">ANOMALY DETECTOR:</span>
            <span
              className="font-bold tracking-wider"
              style={{ color: isSymbioteSurge ? '#C084FC' : activeHero.accentColor }}
            >
              {isSymbioteSurge ? 'KLYNTAR INFECTION DETECTED' : 'TIMELINE STABLE'}
            </span>
          </div>

          {/* Right: Controls & Warping */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* SYMBIOTE SURGE BUTTON */}
            <button
              onClick={() => {
                soundEngine.playHudClick();
                onToggleSymbioteSurge();
              }}
              title={isSymbioteSurge ? 'Purge Symbiote' : 'Trigger Symbiote Surge'}
              className={`relative group px-3 py-1.5 rounded-xl font-mono text-xs font-black transition-all flex items-center space-x-1.5 border ${
                isSymbioteSurge
                  ? 'bg-purple-950 text-purple-200 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.7)] animate-pulse'
                  : 'bg-black/60 text-zinc-300 border-white/15 hover:border-purple-500/70 hover:text-purple-300 hover:bg-purple-950/30'
              }`}
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${isSymbioteSurge ? 'text-purple-400 animate-spin' : 'text-zinc-400 group-hover:text-purple-400'}`} />
              <span className="tracking-wide uppercase text-[11px]">
                {isSymbioteSurge ? 'SYMBIOTE SURGE' : 'INFEST SUIT'}
              </span>
            </button>

            {/* MULTIVERSE WARP MODAL TRIGGER */}
            <button
              onClick={() => {
                soundEngine.playHudClick();
                onOpenMultiverseModal();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-hero-primary hover:brightness-110 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_var(--hero-glow)] flex items-center space-x-1.5 active:scale-95 border border-white/20"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase hidden sm:inline">WARP REALITY</span>
              <span className="sm:hidden font-mono text-[10px]">WARP</span>
            </button>

            {/* Audio Mute Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Unmute Procedural Audio' : 'Mute Audio'}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition active:scale-90"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-hero-accent" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
