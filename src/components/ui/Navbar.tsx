import React, { useState } from 'react';
import { MarvelHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { Volume2, VolumeX, Compass } from 'lucide-react';

interface NavbarProps {
  hero: MarvelHeroMeta;
  scrollProgress: number;
  onOpenSelector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hero,
  scrollProgress,
  onOpenSelector,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-5xl">
      <nav className="flex items-center justify-between px-5 py-3 rounded-full bg-black/75 backdrop-blur-2xl border border-white/10 shadow-2xl text-white">
        {/* Left: Brand & Hero Badge */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-md border"
            style={{
              backgroundColor: `${hero.primaryColor}25`,
              borderColor: hero.primaryColor,
              color: hero.primaryColor,
            }}
          >
            {hero.alias.slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wider uppercase text-white flex items-center gap-1.5">
              <span>{hero.alias}</span>
              <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                // {hero.name}
              </span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
              MARVEL CINEMATIC UNIVERSE
            </span>
          </div>
        </div>

        {/* Center: Scroll Scrubber Micro-Progress */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-24 h-1 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${Math.round(scrollProgress * 100)}%`,
                backgroundColor: hero.primaryColor,
              }}
            />
          </div>
          <span className="font-mono text-[10px] text-zinc-400">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hero Switcher Trigger */}
          <button
            onClick={() => {
              soundEngine.playHudClick();
              onOpenSelector();
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono font-bold uppercase transition active:scale-95"
          >
            <Compass className="w-3.5 h-3.5" style={{ color: hero.primaryColor }} />
            <span>HERO ROSTER</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition active:scale-95"
            title={isMuted ? 'Unmute Audio Engine' : 'Mute Audio Engine'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
          </button>
        </div>
      </nav>
    </header>
  );
};
