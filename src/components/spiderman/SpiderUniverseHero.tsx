import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SpiderHeroMeta, SpiderStage } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  Radio,
  Zap,
  Gauge,
  Wind,
  Compass,
  ShieldAlert,
} from 'lucide-react';

interface SpiderUniverseHeroProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onOpenSelector: () => void;
  onToggleSymbiote: () => void;
}

const STAGE_NAMES: Record<SpiderStage, string> = {
  perch: '01 // ROOFTOP PERCH & SPIDER-SENSE',
  dive: '02 // FREEFALL DIVE & WEB SHOT',
  swing: '03 // MANHATTAN CANYON ARC SWING',
  apex: '04 // APEX SOMERSAULT ROTATION',
  wallstick: '05 // GLASS WALL HERO LANDING',
};

export const SpiderUniverseHero: React.FC<SpiderUniverseHeroProps> = ({
  hero,
  isSymbioteSurge,
  onOpenSelector,
  onToggleSymbiote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<SpiderStage>('perch');
  const [isReady, setIsReady] = useState(false);
  const [spiderSenseActive, setSpiderSenseActive] = useState(false);

  const imagesRef = useRef<{
    perch?: HTMLImageElement;
    leap?: HTMLImageElement;
    swing?: HTMLImageElement;
    symbiote?: HTMLImageElement;
  }>({});

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Mouse Parallax Tracking
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  const triggerSpiderSense = useCallback(() => {
    setSpiderSenseActive(true);
    soundEngine.playSpiderSense();
    setTimeout(() => setSpiderSenseActive(false), 900);
  }, []);

  // Preload authentic high-resolution images
  useEffect(() => {
    const assets = [
      { key: 'perch', src: '/assets/spidey_crouch_raw.jpg' },
      { key: 'leap', src: '/assets/spidey_leap_raw.jpg' },
      { key: 'swing', src: '/assets/spidey_swing_raw.jpg' },
      { key: 'symbiote', src: '/assets/symbiote_black_hero.png' },
    ];

    let loaded = 0;
    assets.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[key as keyof typeof imagesRef.current] = img;
        loaded++;
        if (loaded >= assets.length) setIsReady(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= assets.length) setIsReady(true);
      };
    });
  }, []);

  // Render scene with 3D gyroscopic tilt and dynamic color tokens
  const drawScene = useCallback(
    (p: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width * dpr;
      const h = rect.height * dpr;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);

      // Lerp mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
      const gyroPanX = mouseRef.current.x * 24 * dpr;
      const gyroPanY = mouseRef.current.y * 16 * dpr;
      const gyroRot = mouseRef.current.x * 0.012;

      let stage: SpiderStage = 'perch';
      let imgA: HTMLImageElement | undefined = imagesRef.current.perch;
      let imgB: HTMLImageElement | undefined = undefined;
      let blend = 0;
      let camScale = 1.0;
      let camPanX = gyroPanX;
      let camPanY = gyroPanY;

      if (p < 0.32) {
        stage = 'perch';
        imgA = imagesRef.current.perch;
        const sub = p / 0.32;
        camScale = 1.0 + sub * 0.05;
        camPanY = gyroPanY + sub * -15 * dpr;
      } else if (p < 0.68) {
        stage = 'dive';
        const sub = (p - 0.32) / 0.36;
        imgA = imagesRef.current.leap;
        camScale = 1.05 + sub * 0.08;
        camPanY = gyroPanY + sub * 25 * dpr;
        if (sub < 0.12) {
          imgB = imagesRef.current.perch;
          blend = 1 - sub / 0.12;
        }
      } else {
        stage = 'swing';
        const sub = (p - 0.68) / 0.32;
        imgA = imagesRef.current.swing;
        camScale = 1.1 + sub * 0.06;
        camPanX = gyroPanX + Math.sin(sub * Math.PI) * 20 * dpr;
        camPanY = gyroPanY - sub * 12 * dpr;
        if (sub < 0.12) {
          imgB = imagesRef.current.leap;
          blend = 1 - sub / 0.12;
        }
      }

      if (stage !== currentStage) {
        setCurrentStage(stage);
      }

      const drawImageCover = (
        img: HTMLImageElement,
        scale: number,
        panX: number,
        panY: number,
        alpha: number = 1.0
      ) => {
        if (!img || !img.complete || img.naturalWidth === 0) return;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = w / h;

        let renderW = w;
        let renderH = h;
        if (canvasRatio > imgRatio) {
          renderH = w / imgRatio;
        } else {
          renderW = h * imgRatio;
        }

        renderW *= scale;
        renderH *= scale;

        const drawX = (w - renderW) / 2 + panX;
        const drawY = (h - renderH) / 2 + panY;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(gyroRot);
        ctx.translate(-w / 2, -h / 2);
        ctx.drawImage(img, drawX, drawY, renderW, renderH);

        // Symbiote Surge Dark Filter Overlay
        if (isSymbioteSurge) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(0, 0, w, h);
        }

        ctx.restore();
      };

      if (isSymbioteSurge && imagesRef.current.symbiote && imagesRef.current.symbiote.complete) {
        // Draw dramatic darkened background
        ctx.fillStyle = '#06040A';
        ctx.fillRect(0, 0, w, h);

        const symImg = imagesRef.current.symbiote;
        const symScale = (h * 0.85) / symImg.naturalHeight;
        const sW = symImg.naturalWidth * symScale;
        const sH = symImg.naturalHeight * symScale;

        ctx.save();
        ctx.translate(w / 2 + gyroPanX, h * 0.5 + gyroPanY);
        ctx.rotate(gyroRot * 0.5);
        ctx.shadowColor = '#A855F7';
        ctx.shadowBlur = 40 * dpr;
        ctx.drawImage(symImg, -sW / 2, -sH / 2, sW, sH);
        ctx.restore();
      } else {
        if (imgA) drawImageCover(imgA, camScale, camPanX, camPanY, 1.0);
        if (imgB && blend > 0.01) drawImageCover(imgB, camScale, camPanX, camPanY, blend);
      }

      // Spider-Sense Radial Warning Waves
      if (spiderSenseActive) {
        ctx.save();
        const centerX = w / 2 + gyroPanX;
        const centerY = h * 0.42 + gyroPanY;
        const glowColor = isSymbioteSurge ? '#A855F7' : hero.primaryColor;

        for (let ring = 1; ring <= 3; ring++) {
          const radius = ring * 65 * dpr;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 3 * dpr;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 20 * dpr;
          ctx.stroke();
        }
        ctx.restore();
      }
    },
    [currentStage, hero.primaryColor, isSymbioteSurge, spiderSenseActive]
  );

  // Scroll listener for sticky viewport
  useEffect(() => {
    let reqId: number;
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = rect.height - window.innerHeight;
      if (totalH > 0) {
        const scrolled = -rect.top;
        const p = Math.max(0, Math.min(1, scrolled / totalH));
        setScrollProgress(p);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const tick = () => {
      drawScene(scrollProgress);
      reqId = requestAnimationFrame(tick);
    };
    reqId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(reqId);
    };
  }, [drawScene, scrollProgress]);

  // Telemetry values derived from scroll
  const velocity = Math.round(45 + Math.sin(scrollProgress * Math.PI) * 78);
  const altitude = Math.round(850 - scrollProgress * 620);
  const gForce = (1.1 + Math.sin(scrollProgress * Math.PI) * 2.4).toFixed(1);

  return (
    <div ref={containerRef} className="relative h-[280vh] w-full bg-[#08090E]">
      {/* Sticky 100dvh Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Fullscreen Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* Dynamic Halftone / Comic Filter */}
        <div className="absolute inset-0 comic-halftone opacity-35 pointer-events-none" />

        {/* Symbiote Vignette when Surge is active */}
        {isSymbioteSurge && (
          <div className="absolute inset-0 symbiote-vignette pointer-events-none z-10" />
        )}

        {/* Loading Indicator */}
        {!isReady && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-hero-primary animate-ping" />
              <span>SYNCHRONIZING DIMENSIONAL FRAMES...</span>
            </div>
          </div>
        )}

        {/* TOP HUD HEADER */}
        <div className="relative z-20 pt-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md shadow-2xl">
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{hero.earthDesignation} // {hero.badge}</span>
            </div>
            <h1 className="font-comic text-4xl sm:text-5xl text-white tracking-wide leading-none">
              {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
            </h1>
            <p className="text-xs text-zinc-300 font-sans mt-1.5 font-semibold">
              {hero.name} · {hero.tagline}
            </p>
          </div>

          <div className="pointer-events-auto flex items-center space-x-2">
            {/* Quick Reality Warp */}
            <button
              onClick={onOpenSelector}
              className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-black/80 hover:bg-black border border-white/20 text-xs font-mono font-bold text-white transition active:scale-95"
            >
              <Compass className="w-4 h-4 text-hero-accent" />
              <span>WARP</span>
            </button>

            {/* Quick Symbiote Infest */}
            <button
              onClick={onToggleSymbiote}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-2xl border text-xs font-mono font-bold transition active:scale-95 ${
                isSymbioteSurge
                  ? 'bg-purple-950 border-purple-500 text-purple-200'
                  : 'bg-black/80 border-white/20 text-zinc-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>{isSymbioteSurge ? 'PURGE' : 'INFEST'}</span>
            </button>

            {/* Spider-Sense Quick Trigger Button */}
            <button
              onClick={triggerSpiderSense}
              className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-black/80 hover:bg-black border border-white/20 text-xs font-mono font-bold text-yellow-300 hover:text-yellow-200 transition shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95"
            >
              <Radio className="w-4 h-4 animate-pulse text-yellow-400" />
              <span className="hidden sm:inline">TRIGGER SPIDER-SENSE</span>
              <span className="sm:hidden">SENSE</span>
            </button>
          </div>
        </div>

        {/* BOTTOM HUD TELEMETRY FOOTER */}
        <div className="relative z-20 pb-8 px-6 sm:px-12 flex flex-wrap items-end justify-between gap-4 pointer-events-none">
          {/* Stage Name & Action Text */}
          <div className="pointer-events-auto bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md">
            <span className="text-[10px] font-mono text-hero-primary uppercase font-bold tracking-widest block mb-1">
              ACTIVE STAGE SEQUENCE:
            </span>
            <div className="font-comic text-2xl text-white tracking-wide">
              {STAGE_NAMES[currentStage]}
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Scroll down to scrub through the dimensional flight arc and acrobatic maneuvers.
            </p>
          </div>

          {/* Live Flight Telemetry Box */}
          <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-6 text-xs font-mono">
            <div>
              <span className="text-zinc-500 uppercase block text-[10px]">VELOCITY:</span>
              <span className="text-white font-extrabold text-base flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" /> {velocity} MPH
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            <div>
              <span className="text-zinc-500 uppercase block text-[10px]">ALTITUDE:</span>
              <span className="text-white font-extrabold text-base flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-yellow-400" /> {altitude} FT
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            <div>
              <span className="text-zinc-500 uppercase block text-[10px]">G-FORCE:</span>
              <span className="text-hero-primary font-extrabold text-base flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> {gForce} G
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
