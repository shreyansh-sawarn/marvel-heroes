import React, { useRef, useEffect, useState } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { LivingSymbioteCanvas } from '../spiderman/LivingSymbioteCanvas';
import {
  Biohazard,
  Skull,
  Globe,
} from 'lucide-react';

interface VenomProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onOpenSelector: () => void;
  onToggleSymbiote: () => void;
}

export const VenomSymbioteExperience: React.FC<VenomProps> = ({
  hero,
  isSymbioteSurge,
  onOpenSelector,
  onToggleSymbiote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hungerLevel, setHungerLevel] = useState(88);
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false });

  // Fullscreen Living Symbiote Apex Beast Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const img = new Image();
    img.src = '/assets/venom_hero.png';

    // Organic tendrils erupting from the center
    const tendrilCount = 24;
    const tendrils = Array.from({ length: tendrilCount }).map((_, i) => ({
      angle: (i / tendrilCount) * Math.PI * 2,
      baseLength: 140 + Math.random() * 180,
      curlSpeed: 0.03 + Math.random() * 0.05,
      curlOffset: Math.random() * Math.PI * 2,
      width: 8 + Math.random() * 14,
    }));

    const onPointerMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.isHovering = true;
    };
    window.addEventListener('mousemove', onPointerMove);

    let time = 0;

    const render = () => {
      time += 0.04;
      ctx.fillStyle = '#030305';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.45;

      // Draw Viscous Living Tendrils
      ctx.save();
      tendrils.forEach((t) => {
        const targetX = mouseRef.current.isHovering ? mouseRef.current.x : centerX;
        const targetY = mouseRef.current.isHovering ? mouseRef.current.y : centerY;
        const dx = targetX - centerX;
        const dy = targetY - centerY;
        const mouseAngle = Math.atan2(dy, dx);
        const mouseDist = Math.hypot(dx, dy);
        const steerFactor = mouseRef.current.isHovering && mouseDist > 20 ? 0.35 : 0;

        // Tendril blends towards mouse
        const currentAngle = t.angle * (1 - steerFactor) + mouseAngle * steerFactor + Math.sin(time + t.curlOffset) * 0.4;
        const len = t.baseLength + Math.sin(time * 2 + t.curlOffset) * 30;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);

        const segments = 12;
        let px = centerX;
        let py = centerY;
        const segLen = len / segments;

        for (let s = 1; s <= segments; s++) {
          const wave = Math.sin(time * 3 + s * 0.5 + t.curlOffset) * 14;
          const a = currentAngle + (wave * Math.PI) / 180;
          px += Math.cos(a) * segLen;
          py += Math.sin(a) * segLen;
          ctx.lineTo(px, py);
        }

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = t.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; // Venom acidic green sheen
        ctx.lineWidth = t.width * 0.3;
        ctx.stroke();
      });
      ctx.restore();

      // Draw Venom Beast Hero (Proportionally scaled to dominate viewport)
      const scale = 0.98 + scrollProgress * 0.25;

      if (img.complete && img.naturalWidth > 0) {
        const targetHeight = Math.min(height * 0.8, 680);
        const ratio = targetHeight / img.naturalHeight;
        const renderW = img.naturalWidth * ratio;
        const renderH = targetHeight;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 35;
        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();
      } else {
        // High-impact Procedural Venom Maw & Eyes
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // Obsidian Mass Head
        ctx.fillStyle = '#060608';
        ctx.beginPath();
        ctx.ellipse(0, 0, 75, 95, 0, 0, Math.PI * 2);
        ctx.fill();

        // Massive Jagged White Eyes
        ctx.fillStyle = '#F8FAFC';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 25;

        // Left Eye
        ctx.beginPath();
        ctx.moveTo(-15, -45);
        ctx.quadraticCurveTo(-60, -25, -55, 15);
        ctx.quadraticCurveTo(-35, 5, -15, -15);
        ctx.closePath();
        ctx.fill();

        // Right Eye
        ctx.beginPath();
        ctx.moveTo(15, -45);
        ctx.quadraticCurveTo(60, -25, 55, 15);
        ctx.quadraticCurveTo(35, 5, 15, -15);
        ctx.closePath();
        ctx.fill();

        // Razor Sharp Teeth & Open Maw
        ctx.fillStyle = '#0F0305';
        ctx.beginPath();
        ctx.ellipse(0, 40, 50, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sharp White Teeth
        ctx.fillStyle = '#F8FAFC';
        for (let i = -40; i <= 40; i += 10) {
          ctx.beginPath();
          ctx.moveTo(i, 25);
          ctx.lineTo(i + 5, 42);
          ctx.lineTo(i + 10, 25);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onPointerMove);
    };
  }, [scrollProgress]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = rect.height - window.innerHeight;
      if (totalH > 0) {
        setScrollProgress(Math.max(0, Math.min(1, -rect.top / totalH)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerRoar = () => {
    soundEngine.playSymbioteRoar();
    setHungerLevel((prev) => Math.min(100, prev + 5));
  };

  return (
    <div className="relative text-white">
      {/* 1. STICKY LIVING VENOM BEAST CHAPTER */}
      <div ref={containerRef} className="relative h-[250vh] w-full bg-[#030305]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Vignette */}
          <div className="absolute inset-0 symbiote-vignette pointer-events-none" />

          {/* TOP HUD: Venom Status */}
          <div className="relative z-20 pt-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-black/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 max-w-md shadow-2xl">
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{hero.earthDesignation} // {hero.universe.toUpperCase()}</span>
              </div>
              <h1 className="font-comic text-4xl sm:text-6xl text-white tracking-wide">
                {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
              </h1>
              <p className="text-xs text-zinc-300 font-mono mt-1">
                {hero.name} · {hero.tagline}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center space-x-2">
              <button
                onClick={triggerRoar}
                className="px-4 py-2 rounded-2xl bg-black border border-emerald-500/60 hover:bg-emerald-950 text-emerald-300 text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              >
                <Skull className="w-4 h-4 text-emerald-400" />
                <span>BEAST ROAR</span>
              </button>

              <button
                onClick={onOpenSelector}
                className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>WARP</span>
              </button>

              <button
                onClick={onToggleSymbiote}
                className={`px-3 py-2 rounded-2xl border text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95 ${
                  isSymbioteSurge
                    ? 'bg-purple-600/80 border-purple-400 text-white'
                    : 'bg-black/60 border-purple-500/40 text-purple-300 hover:bg-purple-950/60'
                }`}
              >
                <Biohazard className="w-4 h-4" />
                <span>{isSymbioteSurge ? 'PURGE' : 'INFEST'}</span>
              </button>
            </div>
          </div>

          {/* BOTTOM TELEMETRY */}
          <div className="relative z-20 pb-8 px-6 sm:px-12 flex flex-wrap items-end justify-between gap-4 pointer-events-none">
            <div className="pointer-events-auto bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest block mb-1">
                SYMBIOTIC EVOLUTION //
              </span>
              <div className="font-comic text-2xl text-white tracking-wide">
                {scrollProgress < 0.35
                  ? '01 // CELLULAR FUSION'
                  : scrollProgress < 0.75
                  ? '02 // VISCOUS TENDRIL OUTBREAK'
                  : '03 // APEX FEAST'}
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Organic tendrils track pointer movement and lash out in hunger.
              </p>
            </div>

            <div className="pointer-events-auto bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-6 text-xs font-mono">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">BIOMASS MASS:</span>
                <span className="text-emerald-400 font-extrabold text-base">520 LBS</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">HIVE HUNGER:</span>
                <span className="text-purple-400 font-extrabold text-base">{hungerLevel}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVING SYMBIOTE SIMULATOR & SONIC TUNING FORK LAB */}
      <section className="relative z-30 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <LivingSymbioteCanvas isSymbioteSurge={true} />
      </section>
    </div>
  );
};
