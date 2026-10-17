import React, { useRef, useEffect, useState } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { LivingSymbioteCanvas } from '../spiderman/LivingSymbioteCanvas';
import {
  Flame,
  Globe,
  Biohazard,
} from 'lucide-react';

interface CarnageProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onOpenSelector: () => void;
  onToggleSymbiote: () => void;
}

export const CarnageExperience: React.FC<CarnageProps> = ({
  hero,
  isSymbioteSurge,
  onOpenSelector,
  onToggleSymbiote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Psychotic Red Spikes Canvas
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
    img.src = '/assets/carnage_hero.png';

    let time = 0;

    const render = () => {
      time += 0.05;
      ctx.fillStyle = '#080202';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.45;

      // Chaotic jagged red spikes shooting across screen
      ctx.save();
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#DC2626';
      ctx.shadowBlur = 20;

      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2 + Math.sin(time + i) * 0.2;
        const len = 120 + Math.sin(time * 3 + i) * 80;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * len, centerY + Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Carnage Hero
      const scale = 0.95 + scrollProgress * 0.25;

      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -220, -220, 440, 440);
        ctx.restore();
      } else {
        // High-impact Carnage Silhouette
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // Blood Red Head
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.ellipse(0, 0, 70, 90, 0, 0, Math.PI * 2);
        ctx.fill();

        // Jagged Black Veins
        ctx.strokeStyle = '#050202';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-50, -30);
        ctx.lineTo(-20, 10);
        ctx.lineTo(-40, 40);
        ctx.moveTo(50, -30);
        ctx.lineTo(20, 10);
        ctx.lineTo(40, 40);
        ctx.stroke();

        // Psychotic Jagged White Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-22, -15, 12, 30, -0.4, 0, Math.PI * 2);
        ctx.ellipse(22, -15, 12, 30, 0.4, 0, Math.PI * 2);
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
      {/* 1. STICKY MAXIMUM CARNAGE RED CHAMBER */}
      <div ref={containerRef} className="relative h-[250vh] w-full bg-[#080202]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* TOP HUD: Carnage Status */}
          <div className="relative z-20 pt-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-black/90 backdrop-blur-md border border-red-600/40 rounded-2xl p-4 max-w-md shadow-2xl">
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-red-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>{hero.earthDesignation} // {hero.universe.toUpperCase()}</span>
              </div>
              <h1 className="font-comic text-4xl sm:text-6xl text-white tracking-wide">
                {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
              </h1>
              <p className="text-xs text-red-300 font-mono mt-1">
                {hero.name} · {hero.tagline}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center space-x-2">
              <button
                onClick={() => soundEngine.playSymbioteTendril()}
                className="px-4 py-2 rounded-2xl bg-red-700 hover:bg-red-600 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.7)]"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>BLOOD SPIKES</span>
              </button>

              <button
                onClick={onOpenSelector}
                className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95"
              >
                <Globe className="w-4 h-4 text-red-400" />
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
              <span className="text-[10px] font-mono text-red-500 uppercase font-bold tracking-widest block mb-1">
                PSYCHOPATHIC DRIFT //
              </span>
              <div className="font-comic text-2xl text-white tracking-wide">
                {scrollProgress < 0.35
                  ? '01 // CELLULAR MUTATION'
                  : scrollProgress < 0.75
                  ? '02 // RAZOR SCYTHE METAMORPHOSIS'
                  : '03 // UNCHECKED BLOODLUST'}
              </div>
            </div>

            <div className="pointer-events-auto bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-6 text-xs font-mono">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">SANITY INDEX:</span>
                <span className="text-red-500 font-extrabold text-base">0.00%</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">BLADE DENSITY:</span>
                <span className="text-orange-400 font-extrabold text-base">TITANIUM-BONE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVING SYMBIOTE TENDRILL LAB */}
      <section className="relative z-30 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <LivingSymbioteCanvas isSymbioteSurge={true} />
      </section>
    </div>
  );
};
