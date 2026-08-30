import React from 'react';
import { ArrowUpRight, Cpu, Shield, Zap, Compass } from 'lucide-react';

export const IronManSystems: React.FC = () => {
  return (
    <section
      id="systems"
      className="relative border-t border-white/5 bg-[#0A0A0B] px-6 pb-28 pt-24 md:px-12 md:pb-40 md:pt-32 text-white"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-16 md:grid md:grid-cols-[5fr_4fr] md:gap-20">
        {/* Left Column: Story & Lore */}
        <div className="flex flex-col gap-6">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#D4A22F] backdrop-blur-md"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(212,162,47,0.25)',
              }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4A22F] shadow-[0_0_10px_rgba(212,162,47,0.85)]" />
              J.A.R.V.I.S. // SYSTEMS NOMINAL
            </span>
          </div>

          <h2 className="font-sans text-4xl font-extrabold leading-[0.98] tracking-tighter text-white md:text-6xl">
            “And I… am… <span className="text-[#D4A22F]">Iron Man.</span>”
          </h2>

          <p className="max-w-[48ch] font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            A snap heard around the universe. The Mark LXXXV was engineered in six hours and retired in seconds — its final moment, the reason any of us are still here. Every readout below is what J.A.R.V.I.S. logged in the last frame before the blast.
          </p>

          <div className="pt-2">
            <a
              href="#footer"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-white backdrop-blur-md transition-all duration-200 hover:bg-white/[0.1] active:translate-y-[1px]"
            >
              Open Suit Archive
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Right Column: Telemetry Specs Matrix */}
        <div className="flex flex-col divide-y divide-white/10 border-t border-white/10 font-mono">
          {/* Metric 1 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#D4A22F]" /> Suit Integrity
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Nanoparticle titanium lattice
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              99.2%
            </span>
          </div>

          {/* Metric 2 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#D4A22F]" /> Arc Output
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Cold-fused, Vibranium core
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              3.4 GJ/s
            </span>
          </div>

          {/* Metric 3 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#D4A22F]" /> Flight Ceiling
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Stratospheric assist & thrusters
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              72.8 km
            </span>
          </div>

          {/* Metric 4 */}
          <div className="flex items-baseline justify-between gap-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#D4A22F]" /> Neural Response Time
              </span>
              <span className="font-sans text-xs text-zinc-400">
                Direct cranial link, J.A.R.V.I.S.
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              0.018 s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
