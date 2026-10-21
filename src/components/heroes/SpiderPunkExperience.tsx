import React, { useRef, useEffect, useState } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { SpiderPunkAnarchyStage } from '../spiderman/SpiderPunkAnarchyStage';
import { LivingSymbioteCanvas } from '../spiderman/LivingSymbioteCanvas';
import {
  Zap,
  Globe,
  Biohazard,
} from 'lucide-react';

interface SpiderPunkProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onOpenSelector: () => void;
  onToggleSymbiote: () => void;
}

export const SpiderPunkExperience: React.FC<SpiderPunkProps> = ({
  hero,
  isSymbioteSurge,
  onOpenSelector,
  onToggleSymbiote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 8 FPS Stop-Motion Punk Zine Canvas
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
    img.src = '/assets/punk_hero.png';

    let lastDrawTime = 0;
    const targetFps = 8; // 8 FPS authentic punk stop-motion
    const frameInterval = 1000 / targetFps;

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      if (time - lastDrawTime < frameInterval) return;
      lastDrawTime = time;

      ctx.fillStyle = isSymbioteSurge ? '#08020F' : '#0F0918';
      ctx.fillRect(0, 0, width, height);

      // Random Zine Collage Paper Slits & Safety Pins
      ctx.save();
      for (let i = 0; i < 8; i++) {
        const px = Math.random() * width;
        const py = Math.random() * height;
        const pw = 120 + Math.random() * 200;
        const ph = 40 + Math.random() * 60;

        ctx.fillStyle = isSymbioteSurge
          ? (i % 2 === 0 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(234, 179, 8, 0.12)')
          : (i % 2 === 0 ? 'rgba(236, 72, 153, 0.15)' : 'rgba(234, 179, 8, 0.15)');
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((Math.random() - 0.5) * 0.4);
        ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
        ctx.restore();
      }
      ctx.restore();

      // Draw Hobie Brown Punk Hero (Proportionally scaled to viewport)
      const centerX = width / 2;
      const centerY = height * 0.48;
      const jitterRot = (Math.random() - 0.5) * 0.05;
      const scale = 0.95 + scrollProgress * 0.2;

      // Chaotic Symbiote Spikes & Tendril Eruption
      if (isSymbioteSurge) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const tendrilCount = 8;
        for (let t = 0; t < tendrilCount; t++) {
          const angle = (t / tendrilCount) * Math.PI * 2;
          const len = 125 + Math.sin(t * 1.8) * 40;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#EC4899';
          ctx.shadowBlur = 20;
          ctx.stroke();

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (img.complete && img.naturalWidth > 0) {
        const targetHeight = Math.min(height * 0.74, 620);
        const ratio = targetHeight / img.naturalHeight;
        const renderW = img.naturalWidth * ratio;
        const renderH = targetHeight;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(jitterRot);
        ctx.scale(scale, scale);
        ctx.shadowColor = isSymbioteSurge ? '#A855F7' : '#EC4899';
        ctx.shadowBlur = isSymbioteSurge ? 55 : 35;
        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);

        // Symbiote Punk Tint Overlay
        if (isSymbioteSurge) {
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
          ctx.fillRect(-renderW / 2, -renderH / 2, renderW, renderH);
          ctx.restore();
        }

        ctx.restore();
      } else {
        // High-impact Spiked Mohawk Mask Silhouette
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(jitterRot);
        ctx.scale(scale, scale);

        // Mask Base
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 72, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spiked Mohawk along top
        ctx.fillStyle = '#EAB308';
        for (let sx = -30; sx <= 30; sx += 12) {
          ctx.beginPath();
          ctx.moveTo(sx - 5, -60);
          ctx.lineTo(sx, -95);
          ctx.lineTo(sx + 5, -60);
          ctx.fill();
        }

        // Punk Angled White Lenses
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-18, -10, 10, 24, -0.3, 0, Math.PI * 2);
        ctx.ellipse(18, -10, 10, 24, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
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
      {/* 1. STICKY PUNK ZINE COLLAGE CHAPTER */}
      <div ref={containerRef} className="relative h-[250vh] w-full bg-[#10081C]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Symbiote Vignette when Surge is active */}
          {isSymbioteSurge && (
            <div className="absolute inset-0 symbiote-vignette pointer-events-none z-10" />
          )}

          {/* TOP HUD: Punk Status */}
          <div className="relative z-20 pt-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-black/90 backdrop-blur-md border border-pink-500/40 rounded-2xl p-4 max-w-md shadow-2xl punk-rip-border">
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-pink-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                <span>{hero.earthDesignation} // {hero.universe.toUpperCase()}</span>
              </div>
              <h1 className="font-comic text-4xl sm:text-6xl text-white tracking-wide">
                {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
              </h1>
              <p className="text-xs text-yellow-300 font-mono mt-1">
                {hero.name} · {hero.tagline}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center space-x-2">
              <button
                onClick={() => soundEngine.playPunkDistortion()}
                className="px-4 py-2 rounded-2xl bg-pink-600 hover:bg-pink-500 text-yellow-300 text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95 shadow-[0_0_30px_rgba(236,72,153,0.8)]"
              >
                <Zap className="w-4 h-4 fill-yellow-300" />
                <span>SHRED RIFF</span>
              </button>

              <button
                onClick={onOpenSelector}
                className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95"
              >
                <Globe className="w-4 h-4 text-pink-400" />
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
              <span className="text-[10px] font-mono text-pink-400 uppercase font-bold tracking-widest block mb-1">
                RIOT PROGRESSION //
              </span>
              <div className="font-comic text-2xl text-white tracking-wide">
                {scrollProgress < 0.35
                  ? '01 // BASEMENT CLUB SOUNDCHECK'
                  : scrollProgress < 0.75
                  ? '02 // GUITAR AMP SONIC SHOCK'
                  : '03 // SMASH THE SURVEILLANCE STATE'}
              </div>
            </div>

            <div className="pointer-events-auto bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-6 text-xs font-mono">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">AMP POWER:</span>
                <span className="text-pink-400 font-extrabold text-base">15,000 WATTS</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">FRAME RATE:</span>
                <span className="text-yellow-400 font-extrabold text-base">8 FPS (PUNK)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PUNK FUZZ PEDALBOARD STAGE */}
      <section className="relative z-30 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <SpiderPunkAnarchyStage />
      </section>

      {/* 3. ANARCHY SYMBIOTE INFESTATION LAB (Active during Symbiote Infestation Surge) */}
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
