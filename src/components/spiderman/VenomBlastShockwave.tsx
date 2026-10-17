import React, { useRef, useEffect, useState } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { Zap, EyeOff, Eye, BatteryCharging, Sparkles } from 'lucide-react';

interface LightningBolt {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  segments: { x: number; y: number }[];
  color: string;
  width: number;
}

export const VenomBlastShockwave: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chargePercent, setChargePercent] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [isCamouflaged, setIsCamouflaged] = useState(false);
  const [lastBlastDamage, setLastBlastDamage] = useState(0);

  const boltsRef = useRef<LightningBolt[]>([]);
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate recursive lightning branch
  const generateLightning = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string = '#FACC15',
    width: number = 3
  ): LightningBolt => {
    const segments: { x: number; y: number }[] = [{ x: x1, y: y1 }];
    const steps = 12;
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;

    for (let i = 1; i < steps; i++) {
      const jitter = (Math.random() - 0.5) * 36;
      segments.push({
        x: x1 + dx * i + jitter,
        y: y1 + dy * i + jitter,
      });
    }
    segments.push({ x: x2, y: y2 });

    return { x1, y1, x2, y2, segments, color, width };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 420);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 420;
    };
    window.addEventListener('resize', handleResize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.fillStyle = isCamouflaged ? 'rgba(10, 15, 30, 0.4)' : '#080A12';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Center Capacitor Ring
      const radius = 60 + (chargePercent / 100) * 20;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = isCamouflaged ? 'rgba(56, 189, 248, 0.4)' : 'rgba(250, 204, 21, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Outer Bio-Electric Arc Glow
      if (chargePercent > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(250, 204, 21, ${chargePercent / 100})`;
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 25;
        ctx.stroke();
      }

      // Draw branching lightning bolts
      boltsRef.current.forEach((bolt) => {
        ctx.beginPath();
        ctx.moveTo(bolt.segments[0].x, bolt.segments[0].y);
        for (let i = 1; i < bolt.segments.length; i++) {
          ctx.lineTo(bolt.segments[i].x, bolt.segments[i].y);
        }
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = bolt.width;
        ctx.shadowColor = bolt.color;
        ctx.shadowBlur = 16;
        ctx.stroke();
      });

      // Decay bolts gradually
      if (Math.random() < 0.4) {
        boltsRef.current = boltsRef.current.slice(1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [chargePercent, isCamouflaged]);

  const startCharging = () => {
    setIsCharging(true);
    soundEngine.playVenomBlast(0.4);

    chargeIntervalRef.current = setInterval(() => {
      setChargePercent((prev) => {
        const next = Math.min(100, prev + 4);
        if (next % 20 === 0) {
          soundEngine.playVenomBlast(next / 100);
        }

        // Spawn electrical lightning arcs
        const canvas = canvasRef.current;
        if (canvas) {
          const width = canvas.width;
          const height = canvas.height;
          const cx = width / 2;
          const cy = height / 2;
          const targetX = Math.random() * width;
          const targetY = Math.random() * height;
          const colors = ['#FACC15', '#EF4444', '#06B6D4', '#FFFFFF'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          boltsRef.current.push(generateLightning(cx, cy, targetX, targetY, color, 3));
        }

        return next;
      });
    }, 45);
  };

  const releaseVenomBlast = () => {
    setIsCharging(false);
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }

    if (chargePercent > 15) {
      soundEngine.playVenomBlast(chargePercent / 100);
      setLastBlastDamage(Math.round(chargePercent * 18.5));

      // Massive lightning eruption across all corners
      const canvas = canvasRef.current;
      if (canvas) {
        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;

        const bolts: LightningBolt[] = [];
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2;
          const dist = 320;
          bolts.push(
            generateLightning(
              cx,
              cy,
              cx + Math.cos(angle) * dist,
              cy + Math.sin(angle) * dist,
              '#FACC15',
              5
            )
          );
        }
        boltsRef.current = bolts;
      }
    }

    setChargePercent(0);
  };

  const toggleCamouflage = () => {
    soundEngine.playCamouflage();
    setIsCamouflaged(!isCamouflaged);
  };

  return (
    <div className="relative rounded-3xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
      {/* Top Diagnostics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-black/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-comic text-xl text-white tracking-wide">
                MILES MORALES: BIO-ELECTRIC VENOM CHARGER
              </span>
              <span className="text-[10px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                VOLTAIC CELL // E-1610
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Press and hold the capacitor trigger to store bio-electricity, then release to unleash a full EMP Venom Blast!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <BatteryCharging className="w-3.5 h-3.5 text-yellow-400" />
            <span>CHARGE LEVEL:</span>
            <span className="text-yellow-400 font-bold">{chargePercent}%</span>
          </div>

          {lastBlastDamage > 0 && (
            <div className="flex items-center space-x-1.5 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>DISCHARGE OUTPUT:</span>
              <span className="text-emerald-400 font-bold">{lastBlastDamage} MEGAJOULES</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="relative w-full h-[420px] bg-[#070912]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Camouflage Status Tag */}
        <div className="absolute top-4 left-6 pointer-events-none bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-zinc-300 flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isCamouflaged ? 'bg-cyan-400 animate-ping' : 'bg-yellow-400'}`} />
          <span>STEALTH MESH: {isCamouflaged ? 'PHOTONIC CLOAK ACTIVE' : 'VISIBLE'}</span>
        </div>

        {/* Center Hold-to-Charge Button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <button
            onPointerDown={startCharging}
            onPointerUp={releaseVenomBlast}
            onPointerLeave={releaseVenomBlast}
            className={`pointer-events-auto px-8 py-5 rounded-2xl font-comic text-2xl tracking-wider transition-all transform active:scale-95 shadow-2xl flex items-center space-x-3 border-2 ${
              isCharging
                ? 'bg-yellow-500 text-black border-yellow-300 shadow-[0_0_50px_rgba(250,204,21,0.9)] scale-105'
                : 'bg-black/80 text-yellow-400 border-yellow-500/60 hover:bg-yellow-500/20'
            }`}
          >
            <Zap className={`w-6 h-6 ${isCharging ? 'animate-bounce fill-black' : 'fill-yellow-400'}`} />
            <span>{isCharging ? `CHARGING (${chargePercent}%) ... RELEASE TO FIRE!` : 'HOLD TO CHARGE VENOM BLAST'}</span>
          </button>
          <span className="text-[11px] font-mono text-zinc-400 mt-3 pointer-events-none">
            {isCharging ? 'Keep holding to max capacitor capacity' : 'Press and hold button to generate electric charge'}
          </span>
        </div>

        {/* Camouflage Toggle Button (Bottom Left) */}
        <div className="absolute bottom-4 left-4">
          <button
            onClick={toggleCamouflage}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border transition-all flex items-center space-x-2 shadow-lg ${
              isCamouflaged
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                : 'bg-black/80 border-white/15 text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {isCamouflaged ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
            <span>{isCamouflaged ? 'DISENGAGE CAMOUFLAGE' : 'ACTIVATE INVISIBILITY'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
