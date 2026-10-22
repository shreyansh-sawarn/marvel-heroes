import React from 'react';
import { SpiderHeroMeta } from '../types';
import { soundEngine } from '../services/soundEngine';
import {
  Volume2,
  VolumeX,
  Compass,
  ShieldAlert,
  Flame,
  Radio,
} from 'lucide-react';

interface SpiderNavbarProps {
  activeHero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onToggleSymbiote: () => void;
  onOpenSelector: () => void;
}

export const SpiderNavbar: React.FC<SpiderNavbarProps> = ({
  activeHero,
  isSymbioteSurge,
  onToggleSymbiote,
  onOpenSelector,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundEngine.getIsMuted());

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto pointer-events-none">
      <div className="pointer-events-auto bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between transition-all">
        {/* Left: Brand & Earth Designation */}
        <div className="flex items-center space-x-3.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-comic text-xl text-white shadow-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: isSymbioteSurge ? '#6B21A8' : activeHero.primaryColor,
              boxShadow: `0 0 20px ${isSymbioteSurge ? 'rgba(168,85,247,0.7)' : activeHero.glowColor}`,
            }}
          >
            🕷
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-comic text-xl tracking-wider text-white">
                SPIDER-VERSE
              </span>
              <span className="text-[10px] font-mono text-zinc-500">//</span>
              <span className="text-[11px] font-mono font-bold text-hero-primary uppercase">
                {activeHero.earthDesignation}
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-ping"
                style={{ backgroundColor: isSymbioteSurge ? '#A855F7' : '#10B981' }}
              />
              <span>
                {isSymbioteSurge
                  ? 'KLYNTAR INFECTION DETECTED // 100% ORGANIC SURGE'
                  : 'TIMELINE STABLE // CANON EVENT LOCKED'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls (Infest/Purge, Reality Warp, Sound) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Spider-Sense Chime */}
          <button
            onClick={() => soundEngine.playSpiderSense()}
            title="Precognitive Spider-Sense Chime"
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-yellow-500/30 text-yellow-300 font-mono text-xs font-bold transition active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>SENSE</span>
          </button>

          {/* Reality Warp Trigger */}
          <button
            onClick={() => {
              soundEngine.playHudClick();
              onOpenSelector();
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold transition active:scale-95 shadow-md"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">WARP REALITY</span>
            <span className="sm:hidden">WARP</span>
          </button>

          {/* Master Infest / Purge Toggle */}
          <button
            onClick={onToggleSymbiote}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl font-mono text-xs font-black transition-all active:scale-95 border shadow-xl ${
              isSymbioteSurge
                ? 'bg-purple-950 hover:bg-purple-900 border-purple-500 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.7)]'
                : 'bg-black/90 hover:bg-black border-purple-500/50 hover:border-purple-400 text-purple-300'
            }`}
          >
            {isSymbioteSurge ? (
              <>
                <Flame className="w-3.5 h-3.5 text-yellow-400" />
                <span>PURGE SYMBIOTE</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>INFEST SUIT</span>
              </>
            )}
          </button>

          {/* Audio Mute Button */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
