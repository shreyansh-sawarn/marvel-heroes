import React, { useRef, useEffect, useState } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { Spider2099GlitchNexus } from '../spiderman/Spider2099GlitchNexus';
import { LivingSymbioteCanvas } from '../spiderman/LivingSymbioteCanvas';
import {
  Zap,
  Globe,
  Biohazard,
} from 'lucide-react';

interface Spider2099Props {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onOpenSelector: () => void;
  onToggleSymbiote: () => void;
}

export const Spider2099Experience: React.FC<Spider2099Props> = ({
  hero,
  isSymbioteSurge,
  onOpenSelector,
  onToggleSymbiote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 3D Cyberpunk Wireframe Perspective Canvas
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
    img.src = '/assets/spider2099_hero.png';

    const symbioteImg = new Image();
    symbioteImg.src = '/assets/spider2099_symbiote_hero.png';

    const bgImg = new Image();
    bgImg.src = '/assets/cyberpunk_2099_bg.jpg';

    let gridOffset = 0;

    const render = () => {
      gridOffset = (gridOffset + 2) % 40;

      ctx.fillStyle = '#030612';
      ctx.fillRect(0, 0, width, height);

      // Cyberpunk Nueva York Megacity Backdrop
      if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        const bgScale = Math.max(width / bgImg.naturalWidth, height / bgImg.naturalHeight);
        const bw = bgImg.naturalWidth * bgScale;
        const bh = bgImg.naturalHeight * bgScale;
        ctx.drawImage(bgImg, (width - bw) / 2, (height - bh) / 2, bw, bh);

        // Cyberpunk blue-violet scanline wash
        ctx.fillStyle = 'rgba(5, 11, 30, 0.55)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Cyberpunk / Klyntar 3D Perspective Floor & Ceiling
      ctx.save();
      const horizonY = height * 0.55;
      const fov = 350;

      // Vertical perspective lines (infected with purple symbiote when surge)
      ctx.strokeStyle = isSymbioteSurge ? 'rgba(168, 85, 247, 0.35)' : 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 1;
      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(width / 2, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width / 2, horizonY);
        ctx.lineTo(x, 0);
        ctx.stroke();
      }

      // Horizontal depth lines
      for (let z = 10; z < fov; z += 25) {
        const lineZ = (z + gridOffset) % fov;
        const screenY = horizonY + (lineZ / fov) * (height - horizonY);
        const topY = horizonY - (lineZ / fov) * horizonY;

        ctx.strokeStyle = isSymbioteSurge
          ? `rgba(220, 38, 38, ${0.5 * (lineZ / fov)})`
          : `rgba(255, 0, 85, ${0.45 * (lineZ / fov)})`;
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(width, screenY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, topY);
        ctx.lineTo(width, topY);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Miguel O'Hara 2099 Hero (Proportionally scaled to viewport)
      const centerX = width / 2;
      const centerY = height * 0.48;
      const scale = 0.95 + scrollProgress * 0.25;

      // Draw Living Bio-Mechanical Tendrils / Wings for Symbiote 2099
      if (isSymbioteSurge) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const tendrilCount = 8;
        for (let t = 0; t < tendrilCount; t++) {
          const side = t % 2 === 0 ? 1 : -1;
          const angle = (side * Math.PI * 0.3) + Math.sin(gridOffset * 0.1 + t) * 0.25;
          const len = 140 + Math.sin(gridOffset * 0.15 + t) * 35;
          ctx.beginPath();
          ctx.moveTo(0, -20);
          const cpx = Math.cos(angle) * (len * 0.6) * side;
          const cpy = Math.sin(angle) * (len * 0.6);
          const endX = Math.cos(angle) * len * side;
          const endY = Math.sin(angle) * len;
          ctx.quadraticCurveTo(cpx, cpy, endX, endY);
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#FF0055';
          ctx.shadowBlur = 20;
          ctx.stroke();

          ctx.strokeStyle = '#050B1E';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      }

      const activeImg = isSymbioteSurge ? symbioteImg : img;

      if (activeImg.complete && activeImg.naturalWidth > 0) {
        const targetHeight = Math.min(height * 0.72, 600);
        const ratio = targetHeight / activeImg.naturalHeight;
        const renderW = activeImg.naturalWidth * ratio;
        const renderH = targetHeight;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.shadowColor = isSymbioteSurge ? '#A855F7' : '#FF0055';
        ctx.shadowBlur = isSymbioteSurge ? 55 : 35;
        ctx.drawImage(activeImg, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();

        // Draw Solid-Light Laser Webs / Corrupted Symbiotic Webs connecting to sky spires
        ctx.strokeStyle = isSymbioteSurge ? '#A855F7' : '#00F0FF';
        ctx.lineWidth = 3;
        ctx.shadowColor = isSymbioteSurge ? '#A855F7' : '#00F0FF';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(-renderW * 0.32, -renderH * 0.12);
        ctx.lineTo(-width * 0.45, -height * 0.4);
        ctx.moveTo(renderW * 0.32, -renderH * 0.12);
        ctx.lineTo(width * 0.45, -height * 0.4);
        ctx.stroke();

        ctx.restore();
      } else {
        // High-impact Cyberpunk 2099 Skull Spider Mask
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // Cyber Aura
        ctx.beginPath();
        ctx.arc(0, 0, 110, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 85, 0.2)';
        ctx.shadowColor = '#FF0055';
        ctx.shadowBlur = 40;
        ctx.fill();

        // Dark Navy Mask Shell
        ctx.fillStyle = '#050B1E';
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 52, 74, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Iconic Red Skull Spider Markings
        ctx.fillStyle = '#FF0055';
        ctx.beginPath();
        ctx.moveTo(0, -50);
        ctx.lineTo(-24, 0);
        ctx.lineTo(-12, 45);
        ctx.lineTo(0, 60);
        ctx.lineTo(12, 45);
        ctx.lineTo(24, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
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

  return (
    <div className="relative text-white">
      {/* 1. STICKY CYBERPUNK 3D NUEVA YORK CHAPTER */}
      <div ref={containerRef} className="relative h-[250vh] w-full bg-[#030612]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Symbiote Vignette when Surge is active */}
          {isSymbioteSurge && (
            <div className="absolute inset-0 symbiote-vignette pointer-events-none z-10" />
          )}

          {/* TOP HUD: 2099 Status */}
          <div className="relative z-20 pt-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-black/80 backdrop-blur-md border border-red-500/40 rounded-2xl p-4 max-w-md shadow-2xl">
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-red-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{hero.earthDesignation} // {hero.universe.toUpperCase()}</span>
              </div>
              <h1 className="font-comic text-4xl sm:text-6xl text-white tracking-wide">
                {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
              </h1>
              <p className="text-xs text-cyan-300 font-mono mt-1">
                {hero.name} · {hero.tagline}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center space-x-2">
              <button
                onClick={() => soundEngine.play2099Glitch()}
                className="px-4 py-2 rounded-2xl bg-red-600/80 hover:bg-red-500 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95 shadow-[0_0_20px_rgba(255,0,85,0.6)]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>HARD-LIGHT WEBS</span>
              </button>

              <button
                onClick={onOpenSelector}
                className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
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
            <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md">
              <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-widest block mb-1">
                TEMPORAL CO-ORDINATE //
              </span>
              <div className="font-comic text-2xl text-white tracking-wide">
                LEVEL {Math.round(500 - scrollProgress * 300)} // STRATOSPHERE
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Hard-light laser filaments secure the perimeter around multiversal rifts.
              </p>
            </div>

            <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-6 text-xs font-mono">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">LASER FREQ:</span>
                <span className="text-cyan-400 font-extrabold text-base">928.4 THz</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">CANON STABILITY:</span>
                <span className="text-emerald-400 font-extrabold text-base">100.0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ALCHEMAX GLITCH STABILIZER LAB */}
      <section className="relative z-30 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <Spider2099GlitchNexus />
      </section>

      {/* 3. ALCHEMAX KLYNTAR SYMBIOTE RESEARCH (Active during Symbiote Infestation Surge) */}
      {isSymbioteSurge && (
        <section className="relative z-30 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <LivingSymbioteCanvas
            isSymbioteSurge={isSymbioteSurge}
            onToggleSurge={onToggleSymbiote}
          />
        </section>
      )}
    </div>
  );
};
