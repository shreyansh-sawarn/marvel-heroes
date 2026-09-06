import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crosshair, Shield, Sparkles, Cpu, RotateCcw } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

type WebMode = 'strand' | 'grenade' | 'ricochet';

export const SpidermanSystems: React.FC = () => {
  const [activeMode, setActiveMode] = useState<WebMode>('strand');
  const [fluidLevel, setFluidLevel] = useState<number>(88);
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const benchCanvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive Web-Shooter Test Bench Ballistic Simulation
  const fireWebShooter = useCallback(() => {
    if (fluidLevel <= 5 || isFiring) {
      soundEngine.playHudClick();
      return;
    }

    setIsFiring(true);
    setFluidLevel((prev) => Math.max(0, prev - 12));
    soundEngine.playWebBallistic(activeMode);

    const canvas = benchCanvasRef.current;
    if (!canvas) {
      setIsFiring(false);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsFiring(false);
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    let frame = 0;
    const maxFrames = 25;

    const animateBallistic = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const progress = frame / maxFrames;

      if (activeMode === 'strand') {
        // High-Tensile Strand: Straight dynamic spear web with glowing nodes
        const targetX = w * progress;
        const targetY = h * 0.5 + Math.sin(progress * Math.PI * 4) * (1 - progress) * 15;

        ctx.beginPath();
        ctx.moveTo(10, h * 0.5);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = 'rgba(0, 180, 216, 0.8)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(10, h * 0.5);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tip Flare
        ctx.beginPath();
        ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00B4D8';
        ctx.shadowColor = '#00B4D8';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (activeMode === 'grenade') {
        // Impact Web Grenade: expanding web cluster
        const centerX = w * 0.7;
        const centerY = h * 0.5;
        const blastRadius = progress * 60;

        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(angle) * blastRadius, centerY + Math.sin(angle) * blastRadius);
          ctx.strokeStyle = 'rgba(230, 36, 41, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, blastRadius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (activeMode === 'ricochet') {
        // Ricochet Web: Multi-bounce trajectory
        const pt1 = { x: 10, y: h * 0.5 };
        const pt2 = { x: w * 0.45, y: h * 0.15 };
        const pt3 = { x: w * 0.75, y: h * 0.85 };
        const pt4 = { x: w * 0.95, y: h * 0.35 };

        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        if (progress > 0.3) ctx.lineTo(pt3.x, pt3.y);
        if (progress > 0.6) ctx.lineTo(pt4.x, pt4.y);
        ctx.strokeStyle = '#F3D403';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#F3D403';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (frame < maxFrames) {
        requestAnimationFrame(animateBallistic);
      } else {
        setIsFiring(false);
      }
    };

    requestAnimationFrame(animateBallistic);
  }, [activeMode, fluidLevel, isFiring]);

  // Initial draw of static grid on bench canvas
  useEffect(() => {
    const canvas = benchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Default targeting crosshair
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.4)';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 28, 0, Math.PI * 2);
    ctx.stroke();
  }, [activeMode]);

  const reloadCartridge = () => {
    soundEngine.playHudClick();
    setFluidLevel(100);
  };

  return (
    <section
      id="systems"
      className="relative border-t border-white/5 bg-[#0A0A0C] px-6 pb-24 pt-20 md:px-12 md:pb-32 md:pt-24 text-white"
    >
      <div className="mx-auto max-w-[1300px] flex flex-col gap-14">
        {/* Header: Clean & Compact */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#00B4D8] mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
              PARKER LABS // WEAPONS & BALLISTICS
            </div>
            <h2 className="font-sans text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Suit Systems & <span className="text-[#E62429]">Web-Shooter Test Bench</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-400 max-w-sm">
            Handmade Parker Gen-4 polymer canisters. Select ballistic profile and test fire live acoustic discharge.
          </p>
        </div>

        {/* Interactive Test Bench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
          {/* Left Column: Interactive Ballistic Test Bench */}
          <div className="flex flex-col gap-5 p-6 rounded-2xl border border-white/10 bg-[#0E1015]/90 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#00B4D8] flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#00B4D8]" /> Interactive Web-Shooter Test Bench
              </span>
              <button
                onClick={reloadCartridge}
                title="Reload Cartridge"
                className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> RELOAD
              </button>
            </div>

            {/* Mode Selectors */}
            <div className="grid grid-cols-3 gap-2">
              {(['strand', 'grenade', 'ricochet'] as WebMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setActiveMode(mode);
                    soundEngine.playHudClick();
                  }}
                  className={`py-2 px-3 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all ${
                    activeMode === mode
                      ? mode === 'strand'
                        ? 'bg-[#00B4D8]/20 border border-[#00B4D8] text-[#00B4D8]'
                        : mode === 'grenade'
                        ? 'bg-[#E62429]/20 border border-[#E62429] text-[#E62429]'
                        : 'bg-[#F3D403]/20 border border-[#F3D403] text-[#F3D403]'
                      : 'bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {mode === 'strand' ? 'Strand' : mode === 'grenade' ? 'Grenade' : 'Ricochet'}
                </button>
              ))}
            </div>

            {/* Simulated Radar / Ballistics Canvas */}
            <div className="relative w-full h-44 bg-[#050608] rounded-xl border border-white/10 overflow-hidden">
              <canvas
                ref={benchCanvasRef}
                width={480}
                height={176}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                BALLISTIC PROFILE: {activeMode.toUpperCase()}
              </div>
              <div className="absolute top-2 right-3 font-mono text-[9px] text-[#00B4D8]">
                CHAMBER: 120 PSI
              </div>
            </div>

            {/* Fluid Gauge & Trigger Button */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400 uppercase tracking-wider">Web-Fluid Cartridge</span>
                <span className="text-[#00B4D8] font-bold">{fluidLevel}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    fluidLevel < 20 ? 'bg-[#E62429]' : 'bg-[#00B4D8]'
                  }`}
                  style={{ width: `${fluidLevel}%` }}
                />
              </div>

              <button
                onClick={fireWebShooter}
                disabled={fluidLevel <= 5 || isFiring}
                className="mt-2 w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-[0.24em] transition-all bg-[#E62429] hover:bg-[#ff3b41] active:scale-[0.99] text-white shadow-[0_0_20px_rgba(230,36,41,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isFiring ? 'DISCHARGING...' : 'TEST FIRE [THWIP!]'}
              </button>
            </div>
          </div>

          {/* Right Column: Sleek Spec Grid (Decluttered) */}
          <div className="flex flex-col divide-y divide-white/10 font-mono">
            {/* Metric 1 */}
            <div className="flex items-baseline justify-between gap-6 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#E62429]" /> Suit Fabric Weave
                </span>
                <span className="font-sans text-xs text-zinc-400">
                  Handmade metallic-sheen spandex with reinforced seam stitching
                </span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                CLASSIC <span className="text-sm text-zinc-500 font-normal">v1.0</span>
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex items-baseline justify-between gap-6 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#00B4D8]" /> Shear Tensile Strength
                </span>
                <span className="font-sans text-xs text-zinc-400">
                  Parker Gen-4 polymer (dissolves harmlessly after 120 minutes)
                </span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#00B4D8]">
                120 <span className="text-sm font-normal">PSI</span>
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex items-baseline justify-between gap-6 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F3D403]" /> Spider-Sense Reaction
                </span>
                <span className="font-sans text-xs text-zinc-400">
                  Organic precognitive neural instinct alerting to imminent danger
                </span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#F3D403]">
                0.0015 <span className="text-sm font-normal">s</span>
              </span>
            </div>

            {/* Single Punchy Peter Quote */}
            <div className="pt-5">
              <blockquote className="border-l-2 border-[#00B4D8] pl-4 font-sans text-sm text-zinc-300 italic">
                “With great power, there must also come great responsibility.”
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
