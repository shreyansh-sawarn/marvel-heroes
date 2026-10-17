import React, { useState } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { Zap, Skull, Flame } from 'lucide-react';

export const SpiderPunkAnarchyStage: React.FC = () => {
  const [shredCount, setShredCount] = useState(0);
  const [isStomping, setIsStomping] = useState(false);

  const stompPedal = () => {
    soundEngine.playPunkDistortion();
    setIsStomping(true);
    setShredCount((c) => c + 1);

    setTimeout(() => {
      setIsStomping(false);
    }, 200);
  };

  return (
    <div className="relative rounded-3xl border-2 border-pink-500/40 bg-black/90 overflow-hidden shadow-2xl punk-rip-border">
      {/* Top Diagnostics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-pink-500/30 bg-[#160D24]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/30 border border-pink-400 flex items-center justify-center text-pink-300">
            <Skull className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-comic text-xl text-white tracking-wide">
                SPIDER-PUNK: 15,000-WATT ANARCHY AMP
              </span>
              <span className="text-[10px] font-mono font-bold bg-pink-600 text-white px-2 py-0.5 rounded">
                EARTH-138 // RIOT
              </span>
            </div>
            <p className="text-xs font-mono text-pink-200/80">
              Stomp the custom fuzz pedal to blast anti-corporate power chord feedback through the screen.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-pink-300">
            <Flame className="w-3.5 h-3.5 text-yellow-400" />
            <span>POWER CHORD SHREDS:</span>
            <span className="text-yellow-400 font-bold">{shredCount} RIFFS</span>
          </div>
        </div>
      </div>

      {/* Main Amp & Stompbox Floor */}
      <div className="p-8 bg-gradient-to-br from-[#1F112D] via-[#100918] to-[#08050D] min-h-[360px] flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 comic-dots-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          {/* Fuzz Stompbox Pedal */}
          <button
            onClick={stompPedal}
            className={`p-8 rounded-3xl border-4 transition-all transform active:scale-90 shadow-2xl flex flex-col items-center justify-center ${
              isStomping
                ? 'scale-110 border-yellow-400 bg-pink-600 text-yellow-300 shadow-[0_0_60px_rgba(236,72,153,0.9)]'
                : 'border-pink-500 bg-black/80 text-pink-400 hover:border-yellow-400 hover:text-yellow-300'
            }`}
          >
            <Zap className={`w-12 h-12 mb-2 ${isStomping ? 'animate-bounce fill-current' : ''}`} />
            <span className="font-comic text-3xl tracking-wide uppercase">
              {isStomping ? 'SHREEEED!' : 'STOMP FUZZ PEDAL'}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase mt-1">
              CUSTOM OVERDRIVE TONE
            </span>
          </button>

          <p className="text-xs font-mono text-zinc-400 mt-6 leading-relaxed">
            "Music is our weapon against Osborn's police state. Turn it up until the speaker cones tear."
          </p>
        </div>
      </div>
    </div>
  );
};
