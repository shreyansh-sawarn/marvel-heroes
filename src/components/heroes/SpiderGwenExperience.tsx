import React, { useRef, useEffect, useState } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { SpiderGwenRhythmStage } from '../spiderman/SpiderGwenRhythmStage';
import {
  Music,
  Heart,
  Disc3,
  Wind,
  Globe,
  Biohazard,
} from 'lucide-react';

interface GwenExperienceProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onOpenSelector: () => void;
  onToggleSymbiote: () => void;
}

export const SpiderGwenExperience: React.FC<GwenExperienceProps> = ({
  hero,
  isSymbioteSurge,
  onOpenSelector,
  onToggleSymbiote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [emotionalState, setEmotionalState] = useState<'CALM' | 'RESOLUTE' | 'ANXIOUS' | 'BALLETIC'>('CALM');

  // Earth-65 Watercolor Bleed Fluid Simulation
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
    img.src = '/assets/gwen_hero.png';

    // Watercolor brush blobs
    const blobs = Array.from({ length: 18 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 120 + Math.random() * 200,
      color: Math.random() > 0.5 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(45, 212, 191, 0.12)',
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6,
    }));

    const render = () => {
      // Fade out background slightly to leave watercolor stains
      ctx.fillStyle = '#0F091E';
      ctx.fillRect(0, 0, width, height);

      // Watercolor Blobs drifting
      blobs.forEach((b) => {
        b.x += b.speedX;
        b.y += b.speedY;
        if (b.x < -100) b.x = width + 100;
        if (b.x > width + 100) b.x = -100;
        if (b.y < -100) b.y = height + 100;
        if (b.y > height + 100) b.y = -100;

        const radial = ctx.createRadialGradient(b.x, b.y, 10, b.x, b.y, b.r);
        radial.addColorStop(0, b.color);
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Spider-Gwen Hero
      const centerX = width / 2;
      const centerY = height * 0.45;
      const gwenScale = 0.9 + scrollProgress * 0.2;

      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(gwenScale, gwenScale);
        ctx.drawImage(img, -200, -200, 400, 400);
        ctx.restore();
      } else {
        // High-impact artistic Ghost-Spider silhouette
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(gwenScale, gwenScale);

        // Neon Pink / Teal Halo
        ctx.beginPath();
        ctx.arc(0, 0, 110, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
        ctx.shadowColor = '#F43F5E';
        ctx.shadowBlur = 35;
        ctx.fill();

        // White Mask with Iconic Teal Hood Lining
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#2DD4BF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 48, 70, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Distinctive Ghost-Spider Eyes
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath();
        ctx.ellipse(-18, -4, 8, 22, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(18, -4, 8, 22, 0.2, 0, Math.PI * 2);
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
        const p = Math.max(0, Math.min(1, -rect.top / totalH));
        setScrollProgress(p);
        if (p < 0.3) setEmotionalState('CALM');
        else if (p < 0.6) setEmotionalState('RESOLUTE');
        else if (p < 0.85) setEmotionalState('ANXIOUS');
        else setEmotionalState('BALLETIC');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative text-white">
      {/* 1. STICKY WATERCOLOR MOOD RING CHAPTER */}
      <div ref={containerRef} className="relative h-[250vh] w-full bg-[#120B20]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Comic Halftone Overlay */}
          <div className="absolute inset-0 comic-halftone-pink opacity-20 pointer-events-none" />

          {/* TOP HUD: Gwen Stacy Status */}
          <div className="relative z-20 pt-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-black/80 backdrop-blur-md border border-pink-500/30 rounded-2xl p-4 max-w-md shadow-2xl">
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-pink-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
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
              <div className="px-3.5 py-1.5 rounded-2xl bg-black/80 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold flex items-center space-x-2">
                <Heart className="w-3.5 h-3.5 fill-teal-400" />
                <span>MOOD RING: {emotionalState}</span>
              </div>

              <button
                onClick={() => {
                  soundEngine.playGwenBeat('snare');
                }}
                className="px-4 py-2 rounded-2xl bg-pink-600/80 hover:bg-pink-500 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95 shadow-lg"
              >
                <Music className="w-4 h-4" />
                <span>DRUM BEAT</span>
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
            <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md">
              <span className="text-[10px] font-mono text-pink-400 uppercase font-bold tracking-widest block mb-1">
                BALLETIC PROGRESSION //
              </span>
              <div className="font-comic text-2xl text-white tracking-wide">
                {scrollProgress < 0.35
                  ? '01 // WATERCOLOR ROOFTOP PERCH'
                  : scrollProgress < 0.75
                  ? '02 // BALLETIC SILK RIBBON SWING'
                  : '03 // ACOUSTIC DRUM SHOCKWAVE'}
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Earth-65 realities react emotionally to rhythm and acoustic percussion.
              </p>
            </div>

            <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-6 text-xs font-mono">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">BALLETIC AGILITY:</span>
                <span className="text-teal-400 font-extrabold text-base flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5" /> 99.4%
                </span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">TEMPO:</span>
                <span className="text-pink-400 font-extrabold text-base flex items-center gap-1">
                  <Disc3 className="w-3.5 h-3.5 animate-spin" /> 142 BPM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GWEN'S DRUM STAGE */}
      <section className="relative z-30 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <SpiderGwenRhythmStage />
      </section>
    </div>
  );
};
