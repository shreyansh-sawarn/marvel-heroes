import React, { useState } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  ShieldAlert,
  Cpu,
  AlertTriangle,
} from 'lucide-react';

interface CanonEventTerminalProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
}

interface CanonNode {
  id: string;
  code: string;
  title: string;
  comicReference: string;
  description: string;
  severity: 'CRITICAL' | 'STABLE' | 'ANOMALY';
  integrity: number; // 0-100%
  consequence: string;
}

const CANON_EVENTS: CanonNode[] = [
  {
    id: 'genesis',
    code: 'CANON-01',
    title: 'The Radioactive Arachnid Genesis',
    comicReference: 'Amazing Fantasy #15 / Ultimate #1',
    description: 'A genetically modified or irradiated arachnid bites an ordinary youth, transferring wall-crawling precognitive bio-mechanics.',
    severity: 'STABLE',
    integrity: 99.4,
    consequence: 'Anchor of all Spider-totem identities across the Web of Life & Destiny.',
  },
  {
    id: 'uncle_ben',
    code: 'CANON-02',
    title: 'The Uncle Ben Lesson (Great Responsibility)',
    comicReference: 'Earth-616 Prime Canon / All Realities',
    description: 'An unavoidable loss born of youthful hubris instills the sacred immutable moral code: With great power comes great responsibility.',
    severity: 'STABLE',
    integrity: 98.7,
    consequence: 'Universal catalyst converting self-interest into lifelong selfless heroism.',
  },
  {
    id: 'captain',
    code: 'CANON-03',
    title: 'The Fall of the Police Captain',
    comicReference: 'Amazing Spider-Man #90 / Across the Spider-Verse',
    description: 'A close police captain ally sacrifices their life protecting a child while the Spider-Hero battles a supervillain.',
    severity: 'CRITICAL',
    integrity: 94.1,
    consequence: 'Interfering or saving the Captain causes total universe unraveling and dimensional collapse.',
  },
  {
    id: 'symbiote',
    code: 'CANON-04',
    title: 'Klyntar Symbiote First Contact',
    comicReference: 'Secret Wars #8 / Web of Shadows',
    description: 'Exposure to an extraterrestrial living amorphous organism grants phenomenal aggression and organic webbing.',
    severity: 'ANOMALY',
    integrity: 88.5,
    consequence: 'Bifurcates hero psychology between dark vengeance and moral redemption.',
  },
  {
    id: 'collider',
    code: 'CANON-05',
    title: 'The Supercollider Multiverse Rupture',
    comicReference: 'Into the Spider-Verse / ATSV',
    description: 'Alchemax quantum accelerator overloads, pulling disparate multiversal Spider-Heroes into a single reality sector.',
    severity: 'ANOMALY',
    integrity: 82.3,
    consequence: 'Creates localized quantum glitches and introduces The Spot as an existential threat.',
  },
];

export const CanonEventTerminal: React.FC<CanonEventTerminalProps> = ({
  hero,
  isSymbioteSurge,
}) => {
  const [selectedNode, setSelectedNode] = useState<CanonNode>(CANON_EVENTS[2]); // Captain Stacy default
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [containmentActive, setContainmentActive] = useState(false);
  const [integrityState, setIntegrityState] = useState<Record<string, number>>({
    genesis: 99.4,
    uncle_ben: 98.7,
    captain: 94.1,
    symbiote: 88.5,
    collider: 82.3,
  });

  const triggerDisruption = () => {
    setIsAlarmActive(true);
    soundEngine.playCanonAlarm();

    setIntegrityState((prev) => ({
      ...prev,
      [selectedNode.id]: Math.max(12, prev[selectedNode.id] - 45),
    }));
  };

  const deployContainment = () => {
    soundEngine.playLaserWeb();
    setContainmentActive(true);
    setIsAlarmActive(false);

    setTimeout(() => {
      setIntegrityState((prev) => ({
        ...prev,
        [selectedNode.id]: 99.9,
      }));
      setContainmentActive(false);
      soundEngine.playVictoryFanfare();
    }, 1200);
  };

  const currentIntegrity = integrityState[selectedNode.id] || selectedNode.integrity;

  return (
    <div className={`rounded-3xl border transition-all duration-500 bg-[#060914] p-6 sm:p-10 shadow-2xl relative overflow-hidden ${
      isAlarmActive
        ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.4)] animate-pulse'
        : 'border-white/10'
    }`}>
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Terminal Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full border border-[#00F0FF]/20 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>SPIDER-SOCIETY HQ // NUEVA YORK 2099 // CANON TERMINAL</span>
          </div>
          <h2 className="font-comic text-3xl sm:text-4xl text-white tracking-wide">
            CANON EVENT <span className="text-[#FF0055]">PRESERVATION MATRIX</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            "We make the hard choices so the multiverse doesn't unravel. You cannot disrupt the canon." — Miguel O'Hara (Earth-928)
          </p>
        </div>

        {/* Observer Info & Lyla Holographic Assistant Tag */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto font-mono text-xs">
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hero.primaryColor }} />
            <span className="text-zinc-400">OBSERVER: <strong className="text-white">{hero.alias}</strong> ({hero.earthDesignation})</span>
          </div>

          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
            <span className="text-zinc-300">LYLA AI: <strong className="text-[#00F0FF]">ONLINE</strong></span>
          </div>

          {isSymbioteSurge && (
            <div className="bg-purple-950/60 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-2xl">
              <span>⚠ KLYNTAR HIVE INTERFERENCE</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Canon Event Nodes */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase text-zinc-400 mb-2 flex items-center justify-between">
            <span>CANONICAL NEXUS REGISTRY</span>
            <span>5 ANCHORS MONITORED</span>
          </div>

          {CANON_EVENTS.map((node) => {
            const isSelected = selectedNode.id === node.id;
            const integrity = integrityState[node.id] || node.integrity;
            const isDisrupted = integrity < 50;

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNode(node);
                  soundEngine.playHudClick();
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isDisrupted
                    ? 'border-red-500 bg-red-950/40 text-red-200'
                    : isSelected
                    ? 'border-[#00F0FF] bg-[#00F0FF]/10 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                    : 'border-white/10 bg-[#0B0E1D] hover:border-white/30 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                  <span className="font-bold text-[#00F0FF]">{node.code}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isDisrupted
                        ? 'bg-red-900 text-red-200 animate-pulse'
                        : integrity > 90
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-yellow-950 text-yellow-400 border border-yellow-500/30'
                    }`}
                  >
                    {isDisrupted ? 'ANOMALY DETECTED' : `${integrity.toFixed(1)}% INTEGRITY`}
                  </span>
                </div>
                <h4 className="font-comic text-lg text-white tracking-wide">{node.title}</h4>
                <p className="text-[11px] text-zinc-400 font-sans line-clamp-1 mt-0.5">
                  {node.comicReference}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Node Dossier & Disruption Simulation */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#0B0E1D] p-6 sm:p-8 rounded-2xl border border-white/10">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-mono text-[#00F0FF] tracking-wider block">
                  INSPECTING CANONICAL ANCHOR
                </span>
                <h3 className="font-comic text-2xl sm:text-3xl text-white tracking-wide">
                  {selectedNode.title}
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                {selectedNode.comicReference}
              </span>
            </div>

            <p className="text-zinc-300 text-xs sm:text-sm font-sans leading-relaxed mb-6">
              {selectedNode.description}
            </p>

            <div className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-xs space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-zinc-400">MULTIVERSAL STABILITY:</span>
                <strong
                  className={
                    currentIntegrity < 50
                      ? 'text-red-400 animate-pulse font-bold'
                      : 'text-emerald-400'
                  }
                >
                  {currentIntegrity.toFixed(1)}%
                </strong>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentIntegrity < 50
                      ? 'bg-red-500'
                      : currentIntegrity < 85
                      ? 'bg-yellow-400'
                      : 'bg-[#00F0FF]'
                  }`}
                  style={{ width: `${currentIntegrity}%` }}
                />
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-zinc-400 leading-relaxed font-sans">
                <strong className="text-white font-mono">CANON DISRUPTION RISK:</strong>{' '}
                {selectedNode.consequence}
              </div>
            </div>
          </div>

          {/* Action Simulation Controls */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
            {currentIntegrity >= 50 ? (
              <button
                onClick={triggerDisruption}
                className="px-5 py-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 font-mono text-xs font-bold hover:bg-red-600/30 active:scale-95 transition flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>SIMULATE CANON DISRUPTION</span>
              </button>
            ) : (
              <button
                onClick={deployContainment}
                disabled={containmentActive}
                className="px-6 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-mono text-xs font-bold shadow-[0_0_25px_rgba(0,240,255,0.4)] active:scale-95 transition flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>
                  {containmentActive
                    ? 'DEPLOYING GO-HOME FORCEFIELD...'
                    : 'DEPLOY GO-HOME FORCEFIELD'}
                </span>
              </button>
            )}

            <div className="text-[11px] font-mono text-zinc-500">
              {isAlarmActive ? (
                <span className="text-red-400 font-bold animate-pulse">
                  ⚠ ANOMALY DETECTED BY MIGUEL O'HARA!
                </span>
              ) : (
                <span>Web of Destiny Status: SECURE</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
