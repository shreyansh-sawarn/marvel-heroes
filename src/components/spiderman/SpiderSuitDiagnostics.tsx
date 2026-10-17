import React, { useState } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { Cpu, Activity } from 'lucide-react';

interface SpiderSuitDiagnosticsProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
}

export const SpiderSuitDiagnostics: React.FC<SpiderSuitDiagnosticsProps> = ({
  hero,
  isSymbioteSurge,
}) => {
  const [activeModule, setActiveModule] = useState<number>(0);

  const modules = isSymbioteSurge
    ? [
        {
          title: 'SYMBIOTIC TENDRIL GENERATION',
          description: 'Amorphous cellular tendrils sprout directly from host epidermis, eliminating need for mechanical web fluid or cartridges.',
          spec: 'UNLIMITED BIOMASS',
          efficiency: '100% ORGANIC',
        },
        {
          title: 'NEURAL MALICE SYNCHRONIZATION',
          description: 'Symbiote merges with host motor cortex, boosting muscular contraction velocity by 340% at the cost of emotional stability.',
          spec: '3.4x ADRENALINE SURGE',
          efficiency: 'DANGEROUS COGNITION',
        },
        {
          title: 'CELLULAR CAMOUFLAGE MORPH',
          description: 'Pigment and texture refraction mimics any fabric, civilian clothing, or complete optical transparency.',
          spec: '99.8% REFRACTION',
          efficiency: 'CHAMELEON GRADE',
        },
      ]
    : [
        {
          title: 'POLY-SYNTHETIC WEB MATRIX',
          description: 'Polyvinyl alcohol and nylon polymers compressed under 300 PSI. Cures instantly upon atmospheric contact into high-tensile shear cables.',
          spec: '120 LBS / SQ INCH TENSILE',
          efficiency: '99.4% SHEAR RETENTION',
        },
        {
          title: 'SPIDER-SENSE PRECOGNITION RADAR',
          description: 'Subconscious autonomic warning reflex detected 0.38 seconds prior to incoming ballistic or blunt trauma vectors.',
          spec: '380ms PRE-STRIKE WINDOW',
          efficiency: 'OMNIDIRECTIONAL',
        },
        {
          title: 'WALL-CRAWLING VAN DER WAALS FORCES',
          description: 'Sub-atomic inter-molecular attraction generated at will through palms and soles, supporting up to 10 tons of shear load.',
          spec: '10-TON STATIC LOAD',
          efficiency: 'SUB-ATOMIC ATTRACTION',
        },
      ];

  return (
    <div className="relative rounded-3xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl p-6 sm:p-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
        {/* Left: Section Header & Blueprint Selector */}
        <div className="lg:w-1/2 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 text-hero-primary font-mono text-xs px-3.5 py-1.5 rounded-full shadow-md">
            <Cpu className="w-3.5 h-3.5" />
            <span>BIOMETRIC &amp; SUIT DIAGNOSTICS</span>
          </div>

          <h2 className="font-comic text-4xl sm:text-5xl text-white tracking-wide leading-none">
            {isSymbioteSurge ? 'KLYNTAR SYMBIOTE PHYSIOLOGY' : `${hero.name.toUpperCase()} TECHNICAL BLUEPRINT`}
          </h2>

          <p className="text-zinc-400 text-sm leading-relaxed font-mono">
            {isSymbioteSurge
              ? hero.symbioteDescription
              : `Deep diagnostic readouts on ${hero.alias}'s signature bio-engineering, gear configuration, and tactical combat tolerances.`}
          </p>

          {/* Module Selector Buttons */}
          <div className="space-y-2.5 pt-4">
            {modules.map((mod, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundEngine.playHudClick();
                  setActiveModule(idx);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  activeModule === idx
                    ? 'bg-white/10 border-hero-primary shadow-[0_0_20px_var(--hero-glow)]'
                    : 'bg-black/50 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                    SYSTEM 0{idx + 1}
                  </span>
                  <span className="font-sans font-extrabold text-sm text-white">{mod.title}</span>
                </div>
                <span className="text-xs font-mono font-bold text-hero-accent">{mod.efficiency}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Technical Blueprint Card */}
        <div className="lg:w-1/2 w-full bg-[#0A0D18] border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between min-h-[320px]">
          <div className="absolute inset-0 spider-web-grid opacity-20 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-hero-primary" /> ACTIVE DIAGNOSTIC FOCUS
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                OPERATIONAL
              </span>
            </div>

            <h3 className="font-comic text-2xl text-white tracking-wide mb-2">
              {modules[activeModule].title}
            </h3>

            <p className="text-zinc-300 text-xs sm:text-sm font-mono leading-relaxed mb-6">
              {modules[activeModule].description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
            <div className="bg-black/60 p-3 rounded-xl border border-white/5">
              <span className="text-zinc-500 uppercase block text-[10px]">OUTPUT SPEC:</span>
              <span className="text-white font-bold">{modules[activeModule].spec}</span>
            </div>
            <div className="bg-black/60 p-3 rounded-xl border border-white/5">
              <span className="text-zinc-500 uppercase block text-[10px]">TOLERANCE EFFICIENCY:</span>
              <span className="text-hero-accent font-bold">{modules[activeModule].efficiency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
