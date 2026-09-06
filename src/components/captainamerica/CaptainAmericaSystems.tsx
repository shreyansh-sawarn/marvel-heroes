import React from 'react';
import { Shield, Zap, Crosshair, Cpu, Activity } from 'lucide-react';

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
    id: 'shield-matrix',
    icon: <Shield className="w-4 h-4 text-[#3B82F6]" />,
    title: 'Vibranium Absorption Matrix',
    category: 'METALLURGY // VIBRANIUM ISOTOPE',
    accentColor: '#3B82F6',
    specs: [
      { label: 'ABSORPTION', value: '100% Kinetic' },
      { label: 'RECOIL', value: 'Zero Transfer' },
      { label: 'AERODYNAMICS', value: 'Concentric' },
    ],
    description:
      'Extruded circular vibranium disc designed by Howard Stark. Absorbs all kinetic impact energy directly into molecular bonds with zero inertia transfer to the wielder.',
  },
  {
    id: 'serum-bio',
    icon: <Zap className="w-4 h-4 text-[#DC2626]" />,
    title: 'Project Rebirth Serum',
    category: 'BIO-ENHANCEMENT // SSR-1941',
    accentColor: '#DC2626',
    specs: [
      { label: 'METABOLISM', value: '3× Human Max' },
      { label: 'FATIGUE', value: 'Lactic Immune' },
      { label: 'CELLULAR', value: 'Hyper-Regen' },
    ],
    description:
      'Dr. Erskine’s super-soldier serum treated with Vita-Rays. Enhances human physical attributes to apex potential, granting superhuman stamina and accelerated healing.',
  },
  {
    id: 'tactical-cqc',
    icon: <Crosshair className="w-4 h-4 text-white" />,
    title: 'Tactical Threat Triage & CQC',
    category: 'COMBAT COGNITION // LEADERSHIP',
    accentColor: '#FFFFFF',
    specs: [
      { label: 'RICOCHET', value: 'Calculated' },
      { label: 'TRIAGE', value: 'Multi-Target' },
      { label: 'DISARM', value: 'Sub-Second' },
    ],
    description:
      'Unmatched mastery of geometrical deflection. Calculates multi-angle ricochet arcs instinctively to neutralize hostile targets before returning to forearm magnetic lock.',
  },
  {
    id: 'scale-armor',
    icon: <Cpu className="w-4 h-4 text-[#3B82F6]" />,
    title: 'Nomex Scale-Mail Armor',
    category: 'TACTICAL WEAR // ENDGAME PATTERN',
    accentColor: '#3B82F6',
    specs: [
      { label: 'WEAVE', value: 'Ballistic Nomex' },
      { label: 'SCALES', value: 'Duralumin Plating' },
      { label: 'HARNESS', value: 'Magnetic Gauntlet' },
    ],
    description:
      'Articulated carbon-fiber and duralumin scale-mail backed by puncture-resistant Nomex weave. Equipped with electromagnetic forearm gauntlets for instantaneous shield recall.',
  },
];

export const CaptainAmericaSystems: React.FC = () => {
  return (
    <section
      id="systems"
      className="relative border-t border-white/5 bg-[#07080D] px-6 pb-28 pt-20 md:px-12 md:pb-36 md:pt-24 text-white overflow-hidden"
    >
      {/* Subtle Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#3B82F6]/5 blur-[120px] rounded-full"
      />

      <div className="relative mx-auto max-w-[1240px] flex flex-col gap-12">
        {/* Section Header: Clean, Sleek & Minimal */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#3B82F6] mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              S.S.R. ARCHIVES // SERUM & VIBRANIUM
            </div>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Captain America <span className="text-[#3B82F6]">Tactical Systems</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-400 max-w-md leading-relaxed">
            Project Rebirth physiology, molecular vibranium energy absorption, and tactical battlefield triage.
          </p>
        </div>

        {/* 4 Spacious Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TELEMETRY_CARDS.map((card) => (
            <div
              key={card.id}
              className="flex flex-col justify-between gap-5 p-6 md:p-7 rounded-2xl border border-white/10 bg-[#0A0D15]/80 backdrop-blur-md shadow-xl hover:border-white/20 transition-all duration-300"
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6 rounded-2xl border border-white/10 bg-[#080A10]/80 backdrop-blur-md">
          <blockquote className="border-l-2 border-[#3B82F6] pl-4 font-sans text-sm text-zinc-300 italic">
            “I don't like bullies; I don't care where they're from.”
          </blockquote>
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 uppercase tracking-widest shrink-0">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>COMMAND ACTIVE // AVENGERS COALITION</span>
          </div>
        </div>
      </div>
    </section>
  );
};
