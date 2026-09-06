import React from 'react';

interface HeroTransitionCurtainProps {
  targetHero: 'ironman' | 'spiderman' | 'captainamerica' | null;
}

export const HeroTransitionCurtain: React.FC<HeroTransitionCurtainProps> = ({ targetHero }) => {
  if (!targetHero) return null;

  const isIronMan = targetHero === 'ironman';
  const isCap = targetHero === 'captainamerica';

  const getBackgroundClass = () => {
    if (isIronMan) {
      return 'bg-gradient-to-b from-[#0A0B10]/95 via-[#1A0C0E]/95 to-[#0A0B10]/95';
    }
    if (isCap) {
      return 'bg-gradient-to-b from-[#070B14]/95 via-[#0C1A30]/95 to-[#070B14]/95';
    }
    return 'bg-gradient-to-b from-[#07090E]/95 via-[#0C1524]/95 to-[#07090E]/95';
  };

  const getScanlineColor = () => {
    if (isIronMan) return '#D4A22F';
    if (isCap) return '#38BDF8';
    return '#00B4D8';
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden animate-fadeIn duration-200">
      {/* Background Wipe Panels */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-in-out ${getBackgroundClass()} backdrop-blur-2xl`}
      />

      {/* Dynamic Scanlines */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${getScanlineColor()}, ${getScanlineColor()} 1px, transparent 1px, transparent 4px)`,
        }}
      />

      {/* Central Hero Emblem & HUD Reticle */}
      <div className="relative z-10 flex flex-col items-center gap-6 p-8">
        {isIronMan ? (
          <>
            {/* Stark Arc Reactor Reticle */}
            <div className="relative flex items-center justify-center">
              <div className="h-28 w-28 rounded-full border-2 border-[#D4A22F]/60 animate-ping opacity-75" />
              <div className="absolute h-20 w-20 rounded-full border-2 border-dashed border-[#38BDF8] animate-spin" />
              <div className="absolute h-10 w-10 rounded-full bg-[#38BDF8] shadow-[0_0_35px_#38BDF8]" />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#D4A22F] animate-pulse">
                STARK INDUSTRIES // OS v85.4
              </span>
              <h2 className="font-sans text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                MARK LXXXV ONLINE
              </h2>
              <span className="font-mono text-[11px] text-zinc-400">
                Nanotech Assembled · Arc Reactor 100% · Repulsors Primed
              </span>
            </div>
          </>
        ) : isCap ? (
          <>
            {/* Vibranium Star & Shield Reticle */}
            <div className="relative flex items-center justify-center">
              <div className="h-32 w-32 rounded-full border-4 border-[#E23636]/80 animate-ping opacity-75" />
              <div className="absolute h-24 w-24 rounded-full border-2 border-[#FFFFFF]/80" />
              <div className="absolute h-16 w-16 rounded-full border-2 border-[#E23636]" />
              <div className="absolute h-10 w-10 rounded-full bg-[#1E3A8A] flex items-center justify-center shadow-[0_0_35px_rgba(59,130,246,0.9)]">
                <span className="text-white text-xs font-black">★</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#60A5FA] animate-pulse">
                PROJECT REBIRTH // SSR-1941 COMMAND
              </span>
              <h2 className="font-sans text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                CAPTAIN AMERICA
              </h2>
              <span className="font-mono text-[11px] text-zinc-300">
                Vibranium Shield 100% · Super-Soldier Serum Active · Tactical Lead
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Spider-Man Precognitive Burst */}
            <div className="relative flex items-center justify-center">
              <div className="h-28 w-28 rounded-full border-2 border-[#E62429]/60 animate-ping opacity-75" />
              <div className="absolute h-20 w-20 rounded-full border-2 border-dashed border-[#00B4D8] animate-spin" />
              <div className="absolute h-10 w-10 rounded-full bg-[#E62429] shadow-[0_0_35px_#E62429]" />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.35em] text-[#00B4D8] animate-pulse">
                PARKER SENSE PROTOCOL // ACTIVE
              </span>
              <h2 className="font-sans text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                SPIDER-MAN: BRAND NEW DAY
              </h2>
              <span className="font-mono text-[11px] text-zinc-400">
                Queens to Manhattan · 120 PSI Web Cartridge · NYPD 460.125 MHz
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
