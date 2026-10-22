import React, { useEffect, useRef, useState } from 'react';
import { SpiderHeroId } from '../types';
import { soundEngine } from '../services/soundEngine';
import { Volume2, VolumeX, Play, Square, Disc3, Radio } from 'lucide-react';

interface AudioDockProps {
  activeHeroId: SpiderHeroId;
}

const OST_TITLES: Record<SpiderHeroId, { title: string; style: string }> = {
  spiderman: {
    title: 'Queens Rooftop Swing',
    style: 'Classic Brass & Dynamic Jazz Fusion',
  },
  miles: {
    title: 'Brooklyn 808s & Bio-Pulse',
    style: 'High-Voltage Trap & Sub-Bass Synths',
  },
  gwen: {
    title: 'The Mary Janes Drumline',
    style: 'Punk-Pop Drums & Neon Synthwaves',
  },
  spider2099: {
    title: 'Nueva York Cyber Glitch',
    style: 'Hard-Light Dystopian Industrial Beats',
  },
  spidernoir: {
    title: '1933 Great Depression Blues',
    style: 'Pulp Noir Saxophone & Rainy Vinyl Crackle',
  },
  venom: {
    title: 'Viscous Obsidian Resonance',
    style: 'Sub-Sonic Klyntar Hive Drone & Growls',
  },
  carnage: {
    title: 'Maximum Symbiote Chaos',
    style: 'Distorted Crimson Noise & Fast Arpeggios',
  },
  spiderpunk: {
    title: '15,000-Watt Overdrive Fuzz',
    style: 'Raw Anarchy Guitar Chords & Tube Screamer',
  },
};

export const AudioDock: React.FC<AudioDockProps> = ({ activeHeroId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());
  const [volume, setVolume] = useState(soundEngine.getOSTVolume() || 0.3);
  const [isExpanded, setIsExpanded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync OST track if active hero changes while playing
  useEffect(() => {
    if (isPlaying) {
      soundEngine.startMultiverseOST(activeHeroId);
    }
  }, [activeHeroId, isPlaying]);

  const handleToggleOst = () => {
    const next = soundEngine.toggleMultiverseOST(activeHeroId);
    setIsPlaying(next);
  };

  const handleToggleMute = () => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    soundEngine.setOSTVolume(newVol);
  };

  // Real-time canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const freqData = soundEngine.getAudioFrequencyData();
      const numBars = 16;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        // Average a small band of frequencies
        const rawVal = freqData[i * 2] || 0;
        const normalized = rawVal / 255;
        const barHeight = Math.max(3, normalized * height * 0.9);

        // Color based on activity or subtle idle pulse
        const isLive = isPlaying && !isMuted && rawVal > 10;
        ctx.fillStyle = isLive ? '#EF4444' : 'rgba(255, 255, 255, 0.15)';

        ctx.fillRect(
          i * (barWidth + 2),
          height - barHeight,
          barWidth,
          barHeight
        );
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, isMuted]);

  const currentTrack = OST_TITLES[activeHeroId] || OST_TITLES.spiderman;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expanded Control Pod */}
      {isExpanded && (
        <div className="mb-3 w-72 bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                Procedural Multiverse OST
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">WEB AUDIO API</span>
          </div>

          {/* Track Info */}
          <div className="my-3">
            <div className="text-sm font-bold text-white tracking-wide truncate">
              {currentTrack.title}
            </div>
            <div className="text-[11px] font-mono text-red-400 mt-0.5">
              {currentTrack.style}
            </div>
          </div>

          {/* Frequency Canvas */}
          <div className="w-full h-12 bg-black/60 rounded-xl overflow-hidden border border-zinc-800/80 mb-3 flex items-center justify-center p-1">
            <canvas ref={canvasRef} width={260} height={40} className="w-full h-full block" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handleToggleOst}
              className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>STOP OST</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>START OST</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border transition ${
                isMuted
                  ? 'bg-red-950/60 border-red-500/40 text-red-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Volume Slider */}
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            <span>VOL</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-red-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="w-6 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-950/90 border border-zinc-800 hover:border-red-500/50 text-white shadow-xl backdrop-blur-xl transition group"
      >
        <Disc3
          className={`w-4 h-4 text-red-500 transition-transform duration-700 ${
            isPlaying ? 'animate-spin' : 'group-hover:rotate-45'
          }`}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-wider uppercase">
            {isPlaying ? 'OST PLAYING' : 'AUDIO DECK'}
          </span>
          <div className="flex items-center gap-0.5">
            <span className={`w-1 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`} />
            <span className={`w-1 h-4 rounded-full ${isPlaying ? 'bg-red-400 animate-pulse delay-75' : 'bg-zinc-700'}`} />
            <span className={`w-1 h-2 rounded-full ${isPlaying ? 'bg-red-600 animate-pulse delay-150' : 'bg-zinc-700'}`} />
          </div>
        </div>
      </button>
    </div>
  );
};
