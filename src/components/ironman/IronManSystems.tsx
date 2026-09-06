import React, { useState } from 'react';
import { Cpu, Shield, Zap, Compass, Crosshair } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

type WeaponMode = 'refocuser' | 'blade' | 'missiles';

export const IronManSystems: React.FC = () => {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponMode>('refocuser');
  const [powerOutput, setPowerOutput] = useState<number>(100);

  const handleWeaponSelect = (mode: WeaponMode) => {
    setSelectedWeapon(mode);
    soundEngine.playHudClick();
    if (mode === 'refocuser') {
      soundEngine.playJarvisVoice("Nano lightning refocuser engaged. Thor resonance synchronized.");
    } else if (mode === 'blade') {
      soundEngine.playJarvisVoice("Nanotech energy blade materialized.");
    } else {
      soundEngine.playJarvisVoice("Micro missile array armed. Targeting locked.");
    }
  };

  const handlePowerChange = (val: number) => {
    setPowerOutput(val);
    if (val > 130) {
      soundEngine.playRepulsor();
    } else {
      soundEngine.playHudClick();
    }
  };

  return (
    <section
      id="systems"
      className="relative border-t border-white/5 bg-[#0A0A0B] px-6 pb-24 pt-20 md:px-12 md:pb-32 md:pt-24 text-white"
    >
      <div className="mx-auto max-w-[1300px] flex flex-col gap-14">
        {/* Header: Clean & Punchy */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#D4A22F] mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4A22F] animate-pulse" />
              STARK INDUSTRIES // TACTICAL WEAPON MATRIX
            </div>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Mark LXXXV <span className="text-[#D4A22F]">Nanotech Systems</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-400 max-w-sm">
            Autonomous particle lattice. Select weapon configuration and modulate Arc Reactor core power.
          </p>
        </div>

        {/* Interactive Weapon Matrix & Spec Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
          {/* Left Column: Interactive Weapon Array Console */}
          <div className="flex flex-col gap-5 p-6 rounded-2xl border border-white/10 bg-[#0F1116]/90 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#D4A22F] flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#D4A22F]" /> Nanotech Weapon Array
              </span>
              <span className="font-mono text-[10px] text-[#38BDF8]">
                J.A.R.V.I.S. ONLINE
              </span>
            </div>

            {/* Weapon Selector Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'refocuser', label: 'Refocuser' },
                  { id: 'blade', label: 'Energy Blade' },
                  { id: 'missiles', label: 'Missiles' },
                ] as const
              ).map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleWeaponSelect(w.id)}
                  className={`py-2 px-3 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all ${
                    selectedWeapon === w.id
                      ? 'bg-[#D4A22F]/20 border border-[#D4A22F] text-[#D4A22F]'
                      : 'bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {/* Live Telemetry Display for Selected Weapon */}
            <div className="p-4 rounded-xl border border-white/10 bg-[#06070A] flex flex-col gap-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-zinc-500 uppercase tracking-widest">ACTIVE HARDPOINT</span>
                <span className="text-[#38BDF8]">CALIBRATED</span>
              </div>
              <p className="font-mono text-xs text-zinc-200">
                {selectedWeapon === 'refocuser' && 'Nano-Lightning Refocuser: Deploys 6 dorsal energy collectors to siphon and magnify lightning or unibeam discharges.'}
                {selectedWeapon === 'blade' && 'High-Frequency Energy Blade: Cold-plasma cutting edge extruded directly from arm nanoparticle reservoir.'}
                {selectedWeapon === 'missiles' && 'Micro-Missile Battery: Smart-tracking kinetic mini-warheads with laser target designation.'}
              </p>
            </div>

            {/* Interactive Arc Output Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400 uppercase tracking-wider">Arc Core Power Output</span>
                <span className="text-[#D4A22F] font-bold">{(powerOutput * 0.034).toFixed(2)} GJ/s ({powerOutput}%)</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={powerOutput}
                onChange={(e) => handlePowerChange(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4A22F]"
              />
              <div className="flex justify-between font-mono text-[9px] text-zinc-500">
                <span>CONSERVE (50%)</span>
                <span>NOMINAL (100%)</span>
                <span>OVERCHARGE (150%)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Spec Grid (Decluttered) */}
          <div className="flex flex-col divide-y divide-white/10 font-mono">
            {/* Metric 1 */}
            <div className="flex items-baseline justify-between gap-6 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#D4A22F]" /> Suit Construction
                </span>
                <span className="font-sans text-xs text-zinc-400">
                  Nanoparticle gold-titanium alloy with shape-shifting molecular memory
                </span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                MARK <span className="text-sm text-[#D4A22F] font-normal">LXXXV</span>
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex items-baseline justify-between gap-6 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#38BDF8]" /> Arc Reactor Architecture
                </span>
                <span className="font-sans text-xs text-zinc-400">
                  Triangular vibranium cold-fusion core with quantum discharge containment
                </span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#38BDF8]">
                {(powerOutput * 0.034).toFixed(1)} <span className="text-sm font-normal">GJ/s</span>
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex items-baseline justify-between gap-6 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#D4A22F]" /> Flight Speed
                </span>
                <span className="font-sans text-xs text-zinc-400">
                  Dual hand & foot thrusters with variable-geometry aerodynamic vectoring
                </span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#D4A22F]">
                MACH <span className="text-sm font-normal">3.4</span>
              </span>
            </div>

            {/* Metric 4 */}
            <div className="flex items-baseline justify-between gap-6 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" /> Neural Response Latency
                </span>
                <span className="font-sans text-xs text-zinc-400">
                  Direct cranial neural interface synchronized with J.A.R.V.I.S.
                </span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                0.018 <span className="text-sm text-zinc-500 font-normal">s</span>
              </span>
            </div>

            {/* Single Punchy Stark Quote */}
            <div className="pt-5">
              <blockquote className="border-l-2 border-[#D4A22F] pl-4 font-sans text-sm text-zinc-300 italic">
                “I am Iron Man.”
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
