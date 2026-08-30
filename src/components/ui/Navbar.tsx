import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, ArrowUpRight } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface NavbarProps {
  scrollProgress: number;
  onOpenHeroSelector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scrollProgress,
  onOpenHeroSelector,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());

  const handleToggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <>
      {/* Top Red & Cyan Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/80 z-50">
        <div
          className="h-full bg-gradient-to-r from-marvel-red via-[#00B4D8] to-marvel-red shadow-[0_0_10px_#E23636] transition-all duration-75"
          style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
        />
      </div>

      {/* Main Header */}
      <header className="fixed top-0 inset-x-0 z-40 px-6 py-4 md:px-10 md:py-5 flex items-center justify-between pointer-events-auto bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/10">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-marvel-red text-white font-display font-black text-lg md:text-xl px-2.5 py-0.5 tracking-tighter shadow-md">
            MARVEL
          </div>

          <a
            href="/"
            className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-white hover:text-zinc-300 transition"
          >
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full bg-marvel-red shadow-[0_0_12px_rgba(230,36,41,0.9)] animate-pulse"
            />
            Parker / Technologies
          </a>
        </div>

        {/* Section Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#spiderman-hero"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-white"
          >
            Patrol
          </a>
          <a
            href="#cinematic-chapter"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-white"
          >
            Spider-Verse
          </a>
          <a
            href="#systems"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-white"
          >
            Bio-Tech Specs
          </a>
          <a
            href="#footer"
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-white"
          >
            Archive
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Web Audio SFX Toggle */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border transition-all ${
              !isMuted
                ? 'bg-white/10 text-white border-white/20 shadow-sm'
                : 'bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-300'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-marvel-red" />
            )}
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'SFX ON'}</span>
          </button>

          {/* Roster Modal Button */}
          <button
            onClick={onOpenHeroSelector}
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-md transition-all duration-200 hover:bg-white/[0.1] active:translate-y-[1px]"
          >
            <Shield className="w-3.5 h-3.5 text-yellow-300" />
            <span>Avengers</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </header>
    </>
  );
};
