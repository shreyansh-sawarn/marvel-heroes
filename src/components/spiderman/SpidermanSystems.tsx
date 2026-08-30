import React from 'react';
import { ArrowUpRight, Activity, Shield, Zap, Sparkles } from 'lucide-react';

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
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#E62429] backdrop-blur-md"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(230,36,41,0.25)',
              }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E62429] shadow-[0_0_10px_rgba(230,36,41,0.85)]" />
              PARKER INDUSTRIES // BIO-TECH SPECS
            </span>
          </div>

          <h2 className="font-sans text-4xl font-extrabold leading-[0.98] tracking-tighter text-white md:text-6xl">
            “Your Friendly Neighborhood <span className="text-[#E62429]">Spider-Man.</span>”
          </h2>

          <p className="max-w-[48ch] font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            Engineered with a synthetic fluid polymer and micro-cable carbon-fiber weave. Combined with precognitive arachnid reflexes, the suit delivers unprecedented agility, tensile resistance, and kinetic aerial control across the skyscrapers of New York City.
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
                <Shield className="w-3.5 h-3.5 text-[#E62429]" /> Web Tensile Strength
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Synthetic shear-thickening fluid polymer
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              120 <span className="text-lg text-zinc-500 font-normal">kg/mm²</span>
            </span>
          </div>

          {/* Metric 2 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F3D403]" /> Spider-Sense Neural Latency
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Precognitive sensory threat response
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              0.004 <span className="text-lg text-zinc-500 font-normal">s</span>
            </span>
          </div>

          {/* Metric 3 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#00B4D8]" /> Wall-Adhesion Force
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Sub-atomic Van der Waals electrostatic bond
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              1,000 <span className="text-lg text-zinc-500 font-normal">lbs/cm²</span>
            </span>
          </div>

          {/* Metric 4 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#E62429]" /> Peak Swing Velocity
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Gravitational pendulum acceleration
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              128 <span className="text-lg text-zinc-500 font-normal">MPH</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
