import React from 'react';
import { ArrowUpRight, Activity, Shield, Sparkles, Cpu } from 'lucide-react';

export const SpidermanSystems: React.FC = () => {
  return (
    <section
      id="systems"
      className="relative border-t border-white/5 bg-[#0A0A0C] px-6 pb-28 pt-24 md:px-12 md:pb-40 md:pt-32 text-white"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-16 md:grid md:grid-cols-[5fr_4fr] md:gap-20">
        {/* Left Column: Lore & Identity */}
        <div className="flex flex-col gap-6">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#00B4D8] backdrop-blur-md"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(0,180,216,0.25)',
              }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00B4D8] shadow-[0_0_10px_rgba(0,180,216,0.85)]" />
              PETER PARKER // FRESH START SUIT & TELEMETRY
            </span>
          </div>

          <h2 className="font-sans text-4xl font-extrabold leading-[0.98] tracking-tighter text-white md:text-6xl">
            “No Stark Tech. No Safety Nets. <span className="text-[#E62429]">Pure Spider-Man.</span>”
          </h2>

          <p className="max-w-[48ch] font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            Operating from a humble New York apartment, Peter Parker protects the city as a dedicated, street-level vigilante. Armed with a hand-stitched classic red & blue suit, homemade web fluid cartridges, and a tuned NYPD radio scanner — backed by pure organic arachnid agility, instincts, and Spider-Sense.
          </p>

          <div className="pt-2">
            <a
              href="#footer"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-white backdrop-blur-md transition-all duration-200 hover:bg-white/[0.1] active:translate-y-[1px]"
            >
              Open Hero Archive
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Right Column: Telemetry & Chemical Matrix */}
        <div className="flex flex-col divide-y divide-white/10 border-t border-white/10 font-mono">
          {/* Metric 1 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#E62429]" /> Suit Construction
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Hand-stitched metallic sheen weave & classic mechanical eye lenses
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              CLASSIC <span className="text-lg text-zinc-500 font-normal">v1.0</span>
            </span>
          </div>

          {/* Metric 2 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#00B4D8]" /> Web Fluid Chemistry
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Parker Polymer Gen-4 (Shear-thickening synthetic tensile fluid)
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              120 <span className="text-lg text-[#00B4D8] font-normal">PSI</span>
            </span>
          </div>

          {/* Metric 3 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F3D403]" /> Spider-Sense Precognition
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Pure organic neural instinct & omnidirectional threat detection
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              0.0015 <span className="text-lg text-zinc-500 font-normal">s</span>
            </span>
          </div>

          {/* Metric 4 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#E62429]" /> NYPD Police Band Comms
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Live shortwave scanner monitoring Manhattan emergency channels
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              460.125 <span className="text-lg text-zinc-500 font-normal">MHz</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
