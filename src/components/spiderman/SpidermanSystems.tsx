import React from 'react';
import { Shield, Sparkles, Cpu, Eye, Activity } from 'lucide-react';

interface TelemetryCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  category: string;
  accentColor: string;
  specs: { label: string; value: string }[];
  description: string;
}

const TELEMETRY_CARDS: TelemetryCard[] = [
  {
    id: 'lenses',
    icon: <Eye className="w-4 h-4 text-[#00B4D8]" />,
    title: 'Acoustic & Iris Optics',
    category: 'SENSORY FILTER // SHUTTER IRIS',
    accentColor: '#00B4D8',
    specs: [
      { label: 'FOV', value: '140° Dynamic' },
      { label: 'GLARE FILTER', value: 'Polarized Mesh' },
      { label: 'RESPONSE', value: 'Instantaneous' },
    ],
    description:
      'Mechanical shutter diaphragm lenses modulate aperture width dynamically, dampening sensory overload and sharpening peripheral tracking during high-velocity freefalls.',
  },
  {
    id: 'web-fluid',
    icon: <Cpu className="w-4 h-4 text-[#E23636]" />,
    title: 'Parker Gen-4 Web-Fluid',
    category: 'BALLISTICS // SYNTHETIC POLYMER',
    accentColor: '#E23636',
    specs: [
      { label: 'SHEAR TENSILE', value: '120 PSI Rating' },
      { label: 'DISSOLUTION', value: '120 Minutes' },
      { label: 'HEAT THRESHOLD', value: '300°C Limit' },
    ],
    description:
      'Proprietary synthetic compound stored under high pressure in wrist cartridges. Solidifies into micro-fiber cables with shear strength rivaling tempered titanium alloy.',
  },
  {
    id: 'spider-sense',
    icon: <Sparkles className="w-4 h-4 text-[#F3D403]" />,
    title: 'Spider-Sense Neural Instinct',
    category: 'PRECOGNITION // BIOMETRIC',
    accentColor: '#F3D403',
    specs: [
      { label: 'NEURAL LATENCY', value: '0.0015s' },
      { label: 'COVERAGE', value: '360° Omnidirectional' },
      { label: 'TRIGGER', value: 'Kinetic & Hazard' },
    ],
    description:
      'Subconscious bio-electric danger reflex alerting to kinetic trajectories prior to ocular recognition, coupled directly to involuntary neuromuscular evasion impulses.',
  },
  {
    id: 'suit-weave',
    icon: <Shield className="w-4 h-4 text-[#00B4D8]" />,
    title: 'Reinforced Flexible Weave',
    category: 'TACTICAL WEAR // CLASSIC v1.0',
    accentColor: '#00B4D8',
    specs: [
      { label: 'CONSTRUCTION', value: 'Two-Ply Spandex' },
      { label: 'SEAMS', value: 'Double-Blind Stitch' },
      { label: 'TRACTION', value: 'Van der Waals' },
    ],
    description:
      'Custom breathable synthetic elastane tailored with reinforced seam stitching. Insulated against electrostatic disruption with friction-optimized palms and soles.',
  },
];

export const SpidermanSystems: React.FC = () => {

  return (
    <section
      id="systems"
      className="relative border-t border-white/5 bg-[#08090D] px-6 pb-28 pt-20 md:px-12 md:pb-36 md:pt-24 text-white overflow-hidden"
    >
      {/* Subtle Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#00B4D8]/5 blur-[120px] rounded-full"
      />

      <div className="relative mx-auto max-w-[1240px] flex flex-col gap-12">
        {/* Section Header: Clean, Sleek & Minimal */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#00B4D8] mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
              PARKER BIO-TECH // SUIT TELEMETRY
            </div>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Spider-Man <span className="text-[#E23636]">Bio-Tech Systems</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-400 max-w-md leading-relaxed">
            Handcrafted nano-weave acoustics, chemical web-fluid synthesis, and organic precognitive reflexes.
          </p>
        </div>

        {/* 4 Spacious, High-Tech Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TELEMETRY_CARDS.map((card) => (
            <div
              key={card.id}
              className="flex flex-col justify-between gap-5 p-6 md:p-7 rounded-2xl border border-white/10 bg-[#0E1015]/75 backdrop-blur-md shadow-xl hover:border-white/20 transition-all duration-300"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      {card.icon}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                      {card.category}
                    </span>
                  </div>
                  <span
                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: card.accentColor }}
                  />
                </div>

                <h3 className="font-sans text-xl font-bold tracking-tight text-white">
                  {card.title}
                </h3>

                <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Spec Pills */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 font-mono">
                {card.specs.map((s, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400">
                      {s.label}
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Status & Iconic Quote Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6 rounded-2xl border border-white/10 bg-[#0A0C10]/80 backdrop-blur-md">
          <blockquote className="border-l-2 border-[#00B4D8] pl-4 font-sans text-sm text-zinc-300 italic">
            “With great power, there must also come great responsibility.”
          </blockquote>
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 uppercase tracking-widest shrink-0">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>PATROL ACTIVE // NYC</span>
          </div>
        </div>
      </div>
    </section>
  );
};
