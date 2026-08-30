import React from 'react';
import { SpiderStage } from '../../types';
import { Activity, Gauge, Navigation2, Zap } from 'lucide-react';

interface SpideyTelemetryHUDProps {
  stage: SpiderStage;
  progress: number;
  isSpiderSenseActive: boolean;
}

export const SpideyTelemetryHUD: React.FC<SpideyTelemetryHUDProps> = ({
  stage,
  progress,
  isSpiderSenseActive,
}) => {
  // Compute realistic dynamic telemetry stats based on stage & progress
  const getTelemetry = () => {
    switch (stage) {
      case 'perch':
        return {
          velocity: 0,
          altitude: 860,
          gForce: 1.0,
          webTension: 0,
          threatLevel: 'MONITORING',
        };
      case 'dive': {
        const subP = (progress - 0.15) / 0.25;
        return {
          velocity: Math.floor(35 + subP * 65),
          altitude: Math.floor(860 - subP * 480),
          gForce: (1.0 + subP * 1.8).toFixed(1),
          webTension: Math.floor(subP * 6500),
          threatLevel: 'TARGET ACQUIRED',
        };
      }
      case 'swing': {
        const subP = (progress - 0.4) / 0.3;
        const swingArc = Math.sin(subP * Math.PI);
        return {
          velocity: Math.floor(100 + swingArc * 28),
          altitude: Math.floor(380 - swingArc * 140),
          gForce: (2.8 + swingArc * 2.2).toFixed(1),
          webTension: Math.floor(12000 + swingArc * 7500),
          threatLevel: 'MAX VELOCITY',
        };
      }
      case 'apex': {
        const subP = (progress - 0.7) / 0.15;
        return {
          velocity: Math.floor(75 - subP * 35),
          altitude: Math.floor(520 + subP * 110),
          gForce: (1.8 - subP * 0.8).toFixed(1),
          webTension: 0,
          threatLevel: 'APEX ROTATION',
        };
      }
      case 'wallstick':
      default:
        return {
          velocity: 0,
          altitude: 630,
          gForce: 1.0,
          webTension: 0,
          threatLevel: 'SECURED ON TARGET',
        };
    }
  };

  const tele = getTelemetry();

  return (
    <div className="fixed top-16 left-4 md:left-8 z-30 pointer-events-none hidden sm:block font-mono text-xs">
      <div className="bg-[#0B1020]/80 border border-cyan-500/40 rounded-xl p-3 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-md text-cyan-300 w-52">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-1.5 mb-2">
          <span className="flex items-center gap-1 font-bold tracking-widest text-[10px] text-white">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" /> SPIDEY HUD v4.2
          </span>
          <span className="text-[9px] text-emerald-400 font-bold">ONLINE</span>
        </div>

        {/* Live Metrics */}
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-yellow-400" /> Velocity:
            </span>
            <span className="font-bold text-white">{tele.velocity} <span className="text-[9px] text-gray-400">MPH</span></span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1">
              <Navigation2 className="w-3 h-3 text-blue-400" /> Altitude:
            </span>
            <span className="font-bold text-white">{tele.altitude} <span className="text-[9px] text-gray-400">FT</span></span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Web Tension:
            </span>
            <span className="font-bold text-white">{tele.webTension} <span className="text-[9px] text-gray-400">N</span></span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">G-Force:</span>
            <span className="font-bold text-cyan-400">{tele.gForce}G</span>
          </div>
        </div>

        {/* Threat Level Banner */}
        <div className="mt-2 pt-1.5 border-t border-cyan-900/60 flex items-center justify-between text-[10px]">
          <span className="text-gray-400">STATUS:</span>
          <span
            className={`font-bold ${
              isSpiderSenseActive
                ? 'text-yellow-400 animate-bounce'
                : stage === 'swing'
                ? 'text-red-400'
                : 'text-emerald-400'
            }`}
          >
            {isSpiderSenseActive ? '⚠️ DANGER DETECTED' : tele.threatLevel}
          </span>
        </div>
      </div>
    </div>
  );
};
