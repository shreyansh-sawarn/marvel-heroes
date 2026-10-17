import React, { useState } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { Music, Disc3, Flame } from 'lucide-react';

interface RhythmBeat {
  id: string;
  label: string;
  type: 'kick' | 'snare' | 'hihat' | 'synth';
  keyBinding: string;
  color: string;
  glow: string;
}

export const SpiderGwenRhythmStage: React.FC = () => {
  const [combo, setCombo] = useState(0);
  const [activePad, setActivePad] = useState<string | null>(null);

  const pads: RhythmBeat[] = [
    { id: 'kick', label: 'BASS KICK', type: 'kick', keyBinding: 'Q', color: '#F43F5E', glow: 'rgba(244, 63, 94, 0.6)' },
    { id: 'snare', label: 'SNARE CRACK', type: 'snare', keyBinding: 'W', color: '#2DD4BF', glow: 'rgba(45, 212, 191, 0.6)' },
    { id: 'hihat', label: 'HI-HAT CHICK', type: 'hihat', keyBinding: 'E', color: '#FACC15', glow: 'rgba(250, 204, 21, 0.6)' },
    { id: 'synth', label: 'NEON CHORD', type: 'synth', keyBinding: 'R', color: '#C084FC', glow: 'rgba(192, 132, 252, 0.6)' },
  ];

  const handleTriggerPad = (pad: RhythmBeat) => {
    soundEngine.playGwenBeat(pad.type);
    setActivePad(pad.id);
    setCombo((c) => c + 1);

    setTimeout(() => {
      setActivePad(null);
    }, 150);
  };

  return (
    <div className="relative rounded-3xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
      {/* Top Diagnostics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-black/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-pink-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]">
            <Music className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-comic text-xl text-white tracking-wide">
                SPIDER-GWEN: EARTH-65 DRUM-LINE STAGE
              </span>
              <span className="text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">
                THE MARY JANES // BEAT LAB
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Tap the drum pads to compose real-time procedural rhythm tracks and trigger balletic acoustic shockwaves.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <Flame className="w-3.5 h-3.5 text-pink-400" />
            <span>RHYTHM COMBO:</span>
            <span className="text-pink-400 font-bold">{combo}x HITS</span>
          </div>
        </div>
      </div>

      {/* Main Drum Pad Layout */}
      <div className="relative p-8 bg-gradient-to-b from-[#130E20] to-[#0A0714] min-h-[380px] flex flex-col justify-center items-center">
        {/* Pastel Watercolor Ambient Rings */}
        <div className="absolute inset-0 comic-halftone-pink opacity-20 pointer-events-none" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl relative z-10">
          {pads.map((pad) => {
            const isHit = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handleTriggerPad(pad)}
                className={`p-6 rounded-3xl border-2 transition-all transform flex flex-col items-center justify-between h-44 active:scale-95 shadow-xl ${
                  isHit
                    ? 'scale-105 border-white bg-white/20'
                    : 'bg-black/60 border-white/10 hover:border-white/30 hover:bg-black/80'
                }`}
                style={{
                  boxShadow: isHit ? `0 0 40px ${pad.glow}` : undefined,
                  borderColor: isHit ? '#FFFFFF' : undefined,
                }}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 bg-white/10 px-2 py-0.5 rounded">
                    KEY [{pad.keyBinding}]
                  </span>
                  <Disc3 className="w-5 h-5 animate-spin" style={{ color: pad.color }} />
                </div>

                <div className="my-auto text-center">
                  <span
                    className="font-comic text-2xl tracking-wide block"
                    style={{ color: pad.color }}
                  >
                    {pad.label}
                  </span>
                </div>

                <div className="w-full flex items-center justify-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    TAP PAD
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-xs font-mono text-zinc-400 text-center relative z-10">
          Earth-65 sound design channels punk rock tempo and ethereal ribbon acrobatics.
        </p>
      </div>
    </div>
  );
};
