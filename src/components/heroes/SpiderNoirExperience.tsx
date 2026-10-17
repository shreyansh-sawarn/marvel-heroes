import React, { useRef, useEffect, useState } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { SpiderNoirDetectiveOffice } from '../spiderman/SpiderNoirDetectiveOffice';
import {
  Flame,
  CloudRain,
  Globe,
  Biohazard,
} from 'lucide-react';

interface SpiderNoirProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onOpenSelector: () => void;
  onToggleSymbiote: () => void;
}

export const SpiderNoirExperience: React.FC<SpiderNoirProps> = ({
  hero,
  isSymbioteSurge,
  onOpenSelector,
  onToggleSymbiote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // 1933 Chiaroscuro Rain & Flashlight Spotlight Canvas
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
    img.src = '/assets/noir_hero.png';

    // Rain particles
    const raindrops = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 12 + Math.random() * 16,
      len: 15 + Math.random() * 25,
    }));

    const onPointerMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onPointerMove);

    const render = () => {
      // Very dark chiaroscuro backdrop
      ctx.fillStyle = '#050507';
      ctx.fillRect(0, 0, width, height);

      // Rain streaking
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.2;
      raindrops.forEach((r) => {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 3, r.y + r.len);
        ctx.stroke();

        r.y += r.speed;
        r.x -= 2;
        if (r.y > height) {
          r.y = -20;
          r.x = Math.random() * width;
        }
      });

      // Dramatic Flashlight Spotlight following Cursor
      const spotX = mouseRef.current.x || width / 2;
      const spotY = mouseRef.current.y || height / 2;
      const spotRadius = 180;

      const spotGrad = ctx.createRadialGradient(spotX, spotY, 20, spotX, spotY, spotRadius);
      spotGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)'); // Warm amber match light
      spotGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Spider-Man Noir Hero (Proportionally scaled to viewport)
      const centerX = width / 2;
      const centerY = height * 0.48;
      const scale = 0.95 + scrollProgress * 0.2;

      if (img.complete && img.naturalWidth > 0) {
        const targetHeight = Math.min(height * 0.72, 580);
        const ratio = targetHeight / img.naturalHeight;
        const renderW = img.naturalWidth * ratio;
        const renderH = targetHeight;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 30;
        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();
      } else {
        // High-impact Chiaroscuro Noir Fedora Mask Silhouette
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // Fedora Hat
        ctx.fillStyle = '#18181B';
        ctx.beginPath();
        ctx.ellipse(0, -65, 65, 12, 0, 0, Math.PI * 2); // Brim
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(-30, -100, 60, 40, [10, 10, 0, 0]); // Crown
        ctx.fill();

        // Round Aviation Goggles (Gleaming Amber)
        ctx.fillStyle = '#F59E0B';
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(-20, -35, 14, 0, Math.PI * 2);
        ctx.arc(20, -35, 14, 0, Math.PI * 2);
        ctx.fill();

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

  return (
    <div className="relative text-white noir-grain">
      {/* 1. STICKY 1933 RAIN & CHIAROSCURO CHAPTER */}
      <div ref={containerRef} className="relative h-[250vh] w-full bg-[#050507]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* TOP HUD: Noir 1933 Status */}
          <div className="relative z-20 pt-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/20 rounded-2xl p-4 max-w-md shadow-2xl">
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-1">
                <CloudRain className="w-3.5 h-3.5" />
                <span>{hero.earthDesignation} // {hero.universe.toUpperCase()}</span>
              </div>
              <h1 className="font-comic text-4xl sm:text-6xl text-white tracking-wide">
                {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
              </h1>
              <p className="text-xs text-zinc-300 font-serif italic mt-1">
                {hero.name} · {hero.tagline}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center space-x-2">
              <button
                onClick={() => soundEngine.playNoirMatchStrike()}
                className="px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95 shadow-lg"
              >
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>STRIKE MATCH</span>
              </button>

              <button
                onClick={onOpenSelector}
                className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95"
              >
                <Globe className="w-4 h-4 text-amber-400" />
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
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest block mb-1">
                CASE PROGRESSION //
              </span>
              <div className="font-comic text-2xl text-white tracking-wide">
                {scrollProgress < 0.35
                  ? '01 // LOWER EAST SIDE STAKEOUT'
                  : scrollProgress < 0.75
                  ? '02 // RAIN ON THE FIRE ESCAPE'
                  : '03 // MOB RECKONING'}
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Move cursor to cast the detective spotlight through the dark alleyway shadows.
              </p>
            </div>

            <div className="pointer-events-auto bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-6 text-xs font-mono">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">REVOLVER:</span>
                <span className="text-white font-extrabold text-base">.38 CALIBER (6/6)</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">PRESSURE:</span>
                <span className="text-amber-400 font-extrabold text-base">29.8 inHg (RAIN)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 1933 CRIME DOSSIER INVESTIGATION DESK */}
      <section className="relative z-30 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <SpiderNoirDetectiveOffice />
      </section>
    </div>
  );
};
