import React, { useState } from 'react';
import { Shield, Zap, Sparkles, Activity, Award, RotateCcw } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface SpiderStatsProps {
  visible: boolean;
  onReplay: () => void;
  onNextHero?: () => void;
}

export const SpiderStats: React.FC<SpiderStatsProps> = ({ visible, onReplay, onNextHero }) => {
  const [webFluid, setWebFluid] = useState(88);

  if (!visible) return null;

  const handleShootWeb = () => {
    soundEngine.playWebShoot();
    setWebFluid((prev) => Math.max(12, prev - 8));
  };

  const handleRefill = () => {
    soundEngine.playSpiderSense();
    setWebFluid(100);
  };

  return (
    <div className="relative z-30 max-w-xl mx-auto p-4 md:p-6 bg-[#0E1222]/95 border-2 border-marvel-red rounded-xl shadow-[0_0_50px_rgba(226,54,54,0.4)] backdrop-blur-md animate-thwipPop">
      {/* Top Badge & Corner Marvel Tag */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="bg-marvel-red text-white font-comic text-sm px-2 py-0.5 rounded tracking-wider shadow">
            MARVEL DOSSIER
          </span>
          <span className="text-xs text-yellow-400 font-mono tracking-wider font-bold">
            ARCHIVE #001
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleShootWeb}
            className="flex items-center space-x-1 text-xs bg-marvel-red/20 hover:bg-marvel-red/40 text-marvel-red border border-marvel-red/40 px-2 py-1 rounded transition-colors"
            title="Shoot Web"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="font-bold">THWIP!</span>
          </button>
          <button
            onClick={() => soundEngine.playSpiderSense()}
            className="flex items-center space-x-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/40 px-2 py-1 rounded transition-colors"
            title="Trigger Spider-Sense"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-bold">SENSE</span>
          </button>
        </div>
      </div>

      {/* Hero Header with 3D Render Thumbnail */}
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-marvel-red shadow-[0_0_20px_rgba(226,54,54,0.6)] flex-shrink-0">
          <img
            src="/assets/spidey_crouch.jpg"
            alt="Spider-Man 3D Avatar"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-comic text-2xl md:text-4xl text-marvel-red tracking-wider">
              SPIDER-MAN
            </h3>
            <div className="text-right">
              <span className="text-[10px] md:text-xs font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE ON PATROL
              </span>
            </div>
          </div>
          <p className="text-gray-300 text-xs md:text-sm font-semibold">
            Identity: <span className="text-white">Peter Parker</span> | Queens, New York
          </p>
          <div className="text-[11px] font-mono text-gray-400 mt-0.5">
            Class: Enhanced Mutate • Superhuman Agility & Reflexes
          </div>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="mt-3 p-2.5 bg-marvel-red/10 border-l-4 border-marvel-red rounded-r">
        <p className="text-xs md:text-sm italic text-gray-200 font-medium">
          "With great power comes great responsibility."
        </p>
      </div>

      {/* Power Stats Matrix */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        {/* Agility */}
        <div className="bg-[#151B33] p-2.5 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between text-gray-300 mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Agility & Reflexes
            </span>
            <span className="font-mono text-cyan-400 font-bold">10 / 10</span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full w-[100%] rounded-full" />
          </div>
        </div>

        {/* Spider-Sense */}
        <div className="bg-[#151B33] p-2.5 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between text-gray-300 mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Spider-Sense
            </span>
            <span className="font-mono text-yellow-400 font-bold">10 / 10</span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-yellow-400 h-full w-[100%] rounded-full" />
          </div>
        </div>

        {/* Web Tensile Strength */}
        <div className="bg-[#151B33] p-2.5 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between text-gray-300 mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Shield className="w-3.5 h-3.5 text-blue-400" /> Web Tensile Strength
            </span>
            <span className="font-mono text-blue-400 font-bold">9.5 / 10</span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full w-[95%] rounded-full" />
          </div>
        </div>

        {/* Superhuman Strength */}
        <div className="bg-[#151B33] p-2.5 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between text-gray-300 mb-1">
            <span className="flex items-center gap-1 font-bold">
              <Award className="w-3.5 h-3.5 text-red-400" /> Superhuman Strength
            </span>
            <span className="font-mono text-red-400 font-bold">8.5 / 10</span>
          </div>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-400 h-full w-[85%] rounded-full" />
          </div>
        </div>
      </div>

      {/* Web Cartridge Fluid Gauge */}
      <div className="mt-3 bg-[#13172c] p-2.5 rounded-lg border border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono text-gray-300">
            Web-Shooter Cartridge: <strong className="text-cyan-400">{webFluid}%</strong>
          </span>
        </div>
        {webFluid < 50 && (
          <button
            onClick={handleRefill}
            className="text-[11px] font-mono text-yellow-300 bg-yellow-500/20 hover:bg-yellow-500/30 px-2 py-0.5 rounded border border-yellow-500/40"
          >
            Refill Fluid
          </button>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
        <button
          onClick={onReplay}
          className="flex items-center space-x-1.5 text-xs font-bold text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-700 px-3 py-1.5 rounded transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-marvel-red" />
          <span>Replay Swing from Top</span>
        </button>

        {onNextHero ? (
          <button
            onClick={onNextHero}
            className="text-[11px] font-mono text-gray-400 hover:text-yellow-400 transition"
          >
            Scroll to <span className="text-yellow-400 font-bold underline decoration-dotted">Upcoming Avengers</span> ↓
          </button>
        ) : (
          <div className="text-[11px] font-mono text-gray-400">
            Scroll down for <span className="text-yellow-400 font-bold">Upcoming Avengers</span> ↓
          </div>
        )}
      </div>
    </div>
  );
};
