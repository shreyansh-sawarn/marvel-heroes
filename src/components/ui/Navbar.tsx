import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowUpRight, Zap, Flame, Shield } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface NavbarProps {
  scrollProgress: number;
  activeHero: 'spiderman' | 'ironman' | 'captainamerica';
  onOpenHeroSelector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scrollProgress,
  activeHero,
  onOpenHeroSelector,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());

  const handleToggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleOpenSelector = () => {
    soundEngine.playHudClick();
    onOpenHeroSelector();
  };

  const isIronMan = activeHero === 'ironman';
  const isCap = activeHero === 'captainamerica';

  const getProgressBarClass = () => {
    if (isIronMan) {
      return 'bg-gradient-to-r from-amber-500 via-yellow-400 to-sky-400 shadow-[0_0_12px_rgba(212,162,47,0.9)]';
    }
    if (isCap) {
      return 'bg-gradient-to-r from-red-600 via-sky-400 to-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.9)]';
    }
    return 'bg-gradient-to-r from-marvel-red via-[#00B4D8] to-marvel-red shadow-[0_0_12px_rgba(230,36,41,0.9)]';
  };

  const getLogoBadgeClass = () => {
    if (isIronMan) return 'bg-[#D4A22F] text-black';
    if (isCap) return 'bg-[#1E3A8A] text-white border border-blue-400/40 shadow-[0_0_12px_rgba(59,130,246,0.5)]';
    return 'bg-marvel-red text-white';
  };

  const getHeroDotClass = () => {
    if (isIronMan) return 'bg-amber-400 shadow-[0_0_14px_rgba(212,162,47,1)]';
    if (isCap) return 'bg-blue-400 shadow-[0_0_14px_rgba(59,130,246,1)]';
    return 'bg-marvel-red shadow-[0_0_14px_rgba(230,36,41,1)]';
  };

  const getHeroTitle = () => {
    if (isIronMan) return 'Stark / Industries';
    if (isCap) return 'Captain America / Steve Rogers';
    return 'Spider-Man / Brand New Day';
  };

  const getSoundButtonClass = () => {
    if (isMuted) return 'bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-300';
    if (isIronMan) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(212,162,47,0.3)]';
    }
    if (isCap) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]';
    }
    return 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_12px_rgba(230,36,41,0.3)]';
  };

  const getRosterButtonClass = () => {
    if (isIronMan) {
      return 'border-amber-500/40 bg-amber-950/40 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(212,162,47,0.35)]';
    }
    if (isCap) {
      return 'border-blue-500/40 bg-blue-950/40 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]';
    }
    return 'border-red-500/40 bg-red-950/40 hover:border-red-400 hover:shadow-[0_0_15px_rgba(230,36,41,0.35)]';
  };

  return (
    <>
      {/* Top Dynamic Superhero Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/80 z-50">
        <div
          className={`h-full transition-all duration-75 ${getProgressBarClass()}`}
          style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
        />
      </div>

      {/* Main Header */}
      <header className="fixed top-0 inset-x-0 z-40 px-5 py-3.5 md:px-10 md:py-4 flex items-center justify-between pointer-events-auto bg-[#08090E]/85 backdrop-blur-xl border-b border-white/10 transition-colors duration-300">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div
            className={`font-display font-black text-lg md:text-xl px-2.5 py-0.5 tracking-tighter shadow-md transition-colors ${getLogoBadgeClass()}`}
          >
            MARVEL
          </div>

          <button
            onClick={handleOpenSelector}
            className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-white hover:text-amber-300 transition text-left group"
          >
            <span
              aria-hidden="true"
              className={`inline-block h-2.5 w-2.5 rounded-full animate-pulse transition-all ${getHeroDotClass()}`}
            />
            <span>{getHeroTitle()}</span>
            <span className="text-[9px] text-zinc-400 group-hover:text-white border border-white/15 px-1.5 py-0.5 rounded bg-white/5 transition">
              SWITCH
            </span>
          </button>
        </div>

        {/* Section Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
          {isIronMan ? (
            <>
              <a href="#ironman-hero" className="hover:text-amber-300 transition-colors">
                Mark LXXXV
              </a>
              <a href="#cinematic-chapter" className="hover:text-amber-300 transition-colors">
                Unibeam
              </a>
              <a href="#systems" className="hover:text-amber-300 transition-colors">
                JARVIS Specs
              </a>
            </>
          ) : isCap ? (
            <>
              <a href="#cap-hero" className="hover:text-blue-300 transition-colors">
                The First Avenger
              </a>
              <a href="#cap-cinematic" className="hover:text-blue-300 transition-colors">
                Tactical Ricochet
              </a>
              <a href="#cap-systems" className="hover:text-blue-300 transition-colors">
                Serum &amp; Shield
              </a>
            </>
          ) : (
            <>
              <a href="#spiderman-hero" className="hover:text-cyan-300 transition-colors">
                Patrol
              </a>
              <a href="#cinematic-chapter" className="hover:text-cyan-300 transition-colors">
                Brand New Day
              </a>
              <a href="#systems" className="hover:text-cyan-300 transition-colors">
                Suit Specs
              </a>
            </>
          )}
          <a href="#upcoming-heroes" className="hover:text-white transition-colors">
            Roadmap
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 md:space-x-3">
          {/* Web Audio SFX Toggle */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-all ${getSoundButtonClass()}`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            )}
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
          </button>

          {/* Roster Modal Button */}
          <button
            onClick={handleOpenSelector}
            className={`group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:translate-y-[1px] ${getRosterButtonClass()}`}
          >
            {isIronMan ? (
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            ) : isCap ? (
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
            )}
            <span>Avengers Roster</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </header>
    </>
  );
};
