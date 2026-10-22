import React, { useRef, useEffect, useState } from 'react';
import { SpiderHeroMeta, SpiderStage } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  Wind,
  Gauge,
  Zap,
  Radio,
} from 'lucide-react';

interface SkylineFlightScrollerProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
}

const STAGES: { stage: SpiderStage; title: string; desc: string }[] = [
  {
    stage: 'perch',
    title: '01 // ROOFTOP PERCH & SPIDER-SENSE',
    desc: 'Crouched atop the Chrysler Building gargoyle, surveying Manhattan crime frequencies.',
  },
  {
    stage: 'dive',
    title: '02 // STRATOSPHERE FREEFALL DIVE',
    desc: 'Terminal velocity plunge between 5th Avenue high-rises at 115 MPH.',
  },
  {
    stage: 'swing',
    title: '03 // MANHATTAN CANYON ARC SWING',
    desc: 'High-tensile shear web line anchored to skyscraper cornices, pulling 3.4 Gs.',
  },
  {
    stage: 'apex',
    title: '04 // APEX SOMERSAULT ROTATION',
    desc: 'Inverted slingshot release into cloud layer with zero-gravity micro-moment.',
  },
  {
    stage: 'wallstick',
    title: '05 // GLASS WALL HERO LANDING',
    desc: 'Van der Waals sub-atomic attraction adherence to reflective high-rise glass.',
  },
];

export const SkylineFlightScroller: React.FC<SkylineFlightScrollerProps> = ({
  hero,
  isSymbioteSurge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [spiderSenseActive, setSpiderSenseActive] = useState(false);

  // Preloaded scene frames
  const imagesRef = useRef<{
    crouch?: HTMLImageElement;
    leap?: HTMLImageElement;
    swing?: HTMLImageElement;
    bg?: HTMLImageElement;
    symbiote?: HTMLImageElement;
  }>({});

  useEffect(() => {
    const assets = [
      { key: 'crouch', src: '/assets/spidey_crouch_cutout.png' },
      { key: 'leap', src: '/assets/spidey_leap_cutout.png' },
      { key: 'swing', src: '/assets/spidey_swing_cutout.png' },
      { key: 'bg', src: '/assets/nyc_skyline.jpg' },
      { key: 'symbiote', src: '/assets/symbiote_black_hero.png' },
    ];

    assets.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[key as keyof typeof imagesRef.current] = img;
      };
    });
  }, []);

  // Update scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = rect.height - window.innerHeight;
      if (totalH > 0) {
        const scrolled = -rect.top;
        const p = Math.max(0, Math.min(1, scrolled / totalH));
        setScrollProgress(p);

        const stageIdx = Math.min(
          STAGES.length - 1,
          Math.floor(p * STAGES.length)
        );
        setCurrentStageIdx(stageIdx);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Render Cinematic Scrollytelling Sequence
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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric twilight gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isSymbioteSurge) {
        bgGrad.addColorStop(0, '#040108');
        bgGrad.addColorStop(0.5, '#120224');
        bgGrad.addColorStop(1, '#050209');
      } else {
        bgGrad.addColorStop(0, '#070914');
        bgGrad.addColorStop(0.4, '#1A0C2E');
        bgGrad.addColorStop(0.8, '#2E1035');
        bgGrad.addColorStop(1, '#05060F');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Background NYC Skyline Parallax
      const bgImg = imagesRef.current.bg;
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = isSymbioteSurge ? 0.25 : 0.45;
        const bgScale = Math.max(width / bgImg.naturalWidth, height / bgImg.naturalHeight) * 1.15;
        const bw = bgImg.naturalWidth * bgScale;
        const bh = bgImg.naturalHeight * bgScale;
        const panY = scrollProgress * -120;
        ctx.drawImage(bgImg, (width - bw) / 2, (height - bh) / 2 + panY, bw, bh);
        ctx.restore();
      }

      // Procedural 3D Speed Lines during dive/swing
      if (scrollProgress > 0.15 && scrollProgress < 0.85) {
        ctx.save();
        ctx.strokeStyle = isSymbioteSurge ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        const lineCount = 20;
        for (let i = 0; i < lineCount; i++) {
          const x = (i / lineCount) * width + ((Date.now() * 0.5 + i * 40) % 80);
          const y = (Date.now() * 2 + i * 150) % height;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 60);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Active Character Frame Rendering
      const p = scrollProgress;
      let activeImg: HTMLImageElement | undefined = imagesRef.current.crouch;
      let scale = 0.95;
      let charY = height * 0.52;
      let rotation = 0;

      if (p < 0.28) {
        // Stage 1: Perch
        activeImg = isSymbioteSurge ? imagesRef.current.symbiote : imagesRef.current.crouch;
        scale = 0.9 + p * 0.2;
        charY = height * 0.52 + p * 20;
      } else if (p < 0.65) {
        // Stage 2 & 3: Dive & Swing
        const sub = (p - 0.28) / 0.37;
        activeImg = isSymbioteSurge ? imagesRef.current.symbiote : imagesRef.current.leap;
        scale = 1.0 + sub * 0.15;
        charY = height * 0.48 + Math.sin(sub * Math.PI) * 50;
        rotation = Math.sin(sub * Math.PI) * 0.12;
      } else {
        // Stage 4 & 5: Swing & Wallstick
        const sub = (p - 0.65) / 0.35;
        activeImg = isSymbioteSurge ? imagesRef.current.symbiote : imagesRef.current.swing;
        scale = 1.05 + sub * 0.1;
        charY = height * 0.5 - sub * 30;
        rotation = -sub * 0.15;
      }

      // Draw Hero
      if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
        const targetHeight = Math.min(height * 0.72, 600);
        const ratio = targetHeight / activeImg.naturalHeight;
        const renderW = activeImg.naturalWidth * ratio;
        const renderH = targetHeight;

        ctx.save();
        ctx.translate(width / 2, charY);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // Glow Aura
        ctx.shadowColor = isSymbioteSurge ? '#A855F7' : hero.primaryColor;
        ctx.shadowBlur = spiderSenseActive ? 55 : 25;

        ctx.drawImage(activeImg, -renderW / 2, -renderH / 2, renderW, renderH);

        // Web Line tethering to top sky during swing
        if (p > 0.45 && p < 0.88) {
          ctx.beginPath();
          ctx.moveTo(renderW * 0.15, -renderH * 0.15);
          ctx.lineTo(width * 0.4, -charY);
          ctx.strokeStyle = isSymbioteSurge ? '#A855F7' : '#00B4D8';
          ctx.lineWidth = 3;
          ctx.shadowColor = isSymbioteSurge ? '#A855F7' : '#00B4D8';
          ctx.shadowBlur = 15;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Spider-Sense Radial Waves
      if (spiderSenseActive) {
        ctx.save();
        ctx.translate(width / 2, charY - 60);
        for (let ring = 1; ring <= 3; ring++) {
          ctx.beginPath();
          ctx.arc(0, 0, ring * 60, 0, Math.PI * 2);
          ctx.strokeStyle = isSymbioteSurge ? '#A855F7' : '#FACC15';
          ctx.lineWidth = 3;
          ctx.shadowColor = isSymbioteSurge ? '#A855F7' : '#FACC15';
          ctx.shadowBlur = 20;
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStageIdx, hero.primaryColor, isSymbioteSurge, scrollProgress, spiderSenseActive]);

  // Derived telemetry
  const velocity = Math.round(45 + Math.sin(scrollProgress * Math.PI) * 82);
  const altitude = Math.round(850 - scrollProgress * 680);
  const gForce = (1.1 + Math.sin(scrollProgress * Math.PI) * 2.3).toFixed(1);

  return (
    <div ref={containerRef} className="relative h-[280vh] w-full bg-[#070914] select-none">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Fullscreen Sticky Viewport */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* TOP HUD: Stage Title & Narrative */}
        <div className="relative z-20 pt-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md shadow-2xl">
            <span className="text-[10px] font-mono text-hero-primary uppercase font-bold tracking-widest block mb-1">
              SCROLLYTELLING FLIGHT CORRIDOR //
            </span>
            <h2 className="font-comic text-2xl sm:text-3xl text-white tracking-wide">
              {STAGES[currentStageIdx].title}
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              {STAGES[currentStageIdx].desc}
            </p>
          </div>

          <div className="pointer-events-auto flex items-center space-x-2">
            <button
              onClick={() => {
                setSpiderSenseActive(true);
                soundEngine.playSpiderSense();
                setTimeout(() => setSpiderSenseActive(false), 800);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-black/80 hover:bg-black border border-yellow-500/50 text-yellow-300 font-mono text-xs font-bold transition shadow-lg active:scale-95"
            >
              <Radio className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span>SPIDER-SENSE</span>
            </button>
          </div>
        </div>

        {/* BOTTOM HUD: Flight Dynamics Telemetry */}
        <div className="relative z-20 pb-8 px-6 sm:px-12 flex flex-wrap items-end justify-between gap-4 pointer-events-none">
          <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-sm">
            <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>INERTIAL SCRUBBING ACTIVE</span>
            </div>
            <p className="text-xs font-mono text-zinc-300">
              Scroll up or down to scrub through high-velocity aerial maneuvers and skyscraper arc swings.
            </p>
          </div>

          <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-6 text-xs font-mono shadow-2xl">
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
