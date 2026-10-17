import React, { useState, useEffect } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { ShieldAlert, Cpu, Sliders } from 'lucide-react';

export const Spider2099GlitchNexus: React.FC = () => {
  const [anomalyFrequency, setAnomalyFrequency] = useState(62);
  const targetSync = 88; // Target frequency to stabilize
  const isStabilized = Math.abs(anomalyFrequency - targetSync) <= 2;

  const handleSliderChange = (val: number) => {
    setAnomalyFrequency(val);
    if (Math.abs(val - targetSync) > 10) {
      soundEngine.play2099Glitch();
    }
  };

  useEffect(() => {
    if (isStabilized) {
      soundEngine.playSpiderSense();
    }
  }, [isStabilized]);

  return (
    <div className="relative rounded-3xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
      {/* Top Diagnostics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-black/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(255,0,85,0.5)]">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-comic text-xl text-white tracking-wide">
                SPIDER-MAN 2099: ALCHEMAX TEMPORAL ANOMALY STABILIZER
              </span>
              <span className="text-[10px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full">
                NUEVA YORK // E-928
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Multiverse timeline fracture detected. Calibrate temporal frequency to lock canon event coordinates.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>TIMELINE DISRUPTION:</span>
            <span className={isStabilized ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {isStabilized ? '0.00% (STABLE)' : `${Math.abs(anomalyFrequency - targetSync) * 3}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Glitch Chamber */}
      <div className="relative p-8 bg-[#04060F] min-h-[380px] flex flex-col justify-between overflow-hidden">
        {/* Holographic Wireframe Grid */}
        <div className="absolute inset-0 spider-web-grid opacity-20 pointer-events-none" />

        {/* Dynamic Glitching Hologram */}
        <div className="my-auto text-center relative z-10">
          <div
            className={`font-comic text-4xl sm:text-6xl tracking-wider transition-all ${
              !isStabilized ? 'glitch-text text-red-500' : 'text-cyan-300 drop-shadow-[0_0_20px_#00F0FF]'
            }`}
          >
            {isStabilized ? 'CANON EVENT LOCKED // TIMELINE SECURE' : 'ANOMALY DETECTED // MULTIVERSE RIFT'}
          </div>

          <p className="text-xs font-mono text-zinc-400 mt-3 max-w-md mx-auto">
            {isStabilized
              ? 'Temporal synchronization achieved. Hard-light laser web grids and dimensional day-pass protocols operational.'
              : 'Inter-dimensional disruption in sector 928-Alpha. Adjust the frequency dial to 88 MHz to synchronize timeline.'}
          </p>
        </div>

        {/* Frequency Slider */}
        <div className="relative z-10 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-xl mx-auto w-full">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> TEMPORAL FREQUENCY DIAL:
            </span>
            <span className={`font-bold ${isStabilized ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {anomalyFrequency} MHz (TARGET: 88 MHz)
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="120"
            value={anomalyFrequency}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-2">
            <span>0 MHz</span>
            <span className="text-cyan-400 font-bold">88 MHz [LOCK]</span>
            <span>120 MHz</span>
          </div>
        </div>
      </div>
    </div>
  );
};
