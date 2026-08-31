import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SpidermanHudFrame } from '../ui/SpidermanHudFrame';
import { SpiderStage } from '../../types';
import { soundEngine } from '../../services/soundEngine';

const STAGE_NAMES: Record<SpiderStage, string> = {
  perch: '01 // ROOFTOP PERCH & SPIDER-SENSE',
  dive: '02 // FREEFALL DIVE & WEB SHOT',
  swing: '03 // MANHATTAN CANYON ARC SWING',
  apex: '04 // APEX SOMERSAULT ROTATION',
  wallstick: '05 // GLASS WALL HERO LANDING',
};

export const SpidermanHeroSequencer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<SpiderStage>('perch');
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [webFluid, setWebFluid] = useState(94.8);

  const imagesRef = useRef<{
    perch?: HTMLImageElement;
    leap?: HTMLImageElement;
    swing?: HTMLImageElement;
  }>({});

  const lastStageRef = useRef<SpiderStage>('perch');

  // Preload single authentic high-resolution images (Zero stitching, zero seams)
  useEffect(() => {
    const assets = [
      { key: 'perch', src: '/assets/spidey_crouch_raw.jpg' },
      { key: 'leap', src: '/assets/spidey_leap_raw.jpg' },
      { key: 'swing', src: '/assets/spidey_swing_raw.jpg' },
    ];

    let loaded = 0;
    assets.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[key as keyof typeof imagesRef.current] = img;
        loaded++;
        setLoadedCount(loaded);
        if (loaded >= assets.length) {
          setIsReady(true);
        }
      };
      img.onerror = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded >= assets.length) setIsReady(true);
      };
    });
  }, []);

  // Single unified photographic canvas rendering with responsive framing
  const drawScene = useCallback((p: number) => {
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

    // Determine active scenes and cross-fade
    let imgA: HTMLImageElement | undefined;
    let imgB: HTMLImageElement | undefined;
    let blend = 0;
    let stage: SpiderStage = 'perch';

    // Dynamic cinematic camera motion
    let camScale = 1.0;
    let camPanX = 0;
    let camPanY = 0;

    if (p < 0.32) {
      stage = 'perch';
      const subT = p / 0.32;
      imgA = imagesRef.current.perch;
      imgB = imagesRef.current.leap;
      blend = subT > 0.72 ? (subT - 0.72) / 0.28 : 0;
      camScale = 1.0 + subT * 0.04;
      camPanX = subT * -15 * dpr;
      camPanY = subT * 8 * dpr;
    } else if (p < 0.68) {
      stage = 'dive';
      const subT = (p - 0.32) / 0.36;
      imgA = imagesRef.current.leap;
      imgB = imagesRef.current.swing;
      blend = subT > 0.72 ? (subT - 0.72) / 0.28 : 0;
      camScale = 1.02 + subT * 0.05;
      camPanX = -15 * dpr + subT * 30 * dpr;
      camPanY = 8 * dpr - subT * 16 * dpr;
    } else {
      stage = p < 0.88 ? 'swing' : 'apex';
      const subT = (p - 0.68) / 0.32;
      imgA = imagesRef.current.swing;
      imgB = imagesRef.current.swing;
      blend = 0;
      camScale = 1.03 + Math.sin(subT * Math.PI) * 0.03;
      camPanX = 15 * dpr - subT * 20 * dpr;
      camPanY = -8 * dpr + subT * 12 * dpr;
    }

    // Helper to draw a single unified photo with responsive object-fit: cover
    const drawUnifiedPhoto = (
      img: HTMLImageElement,
      opacity: number,
      scale: number,
      px: number,
      py: number,
      anchorY: number = 0.42
    ) => {
      if (!img || !img.complete || opacity <= 0) return { drawW: 0, drawH: 0, offsetX: 0, offsetY: 0 };
      ctx.save();
      ctx.globalAlpha = opacity;

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = w / h;
      let drawW: number;
      let drawH: number;

      if (canvasAspect > imgAspect) {
        drawW = w * scale;
        drawH = (w / imgAspect) * scale;
      } else {
        drawH = h * scale;
        drawW = (h * imgAspect) * scale;
      }

      const offsetX = (w - drawW) / 2 + px;
      const offsetY = (h - drawH) * anchorY + py;

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      return { drawW, drawH, offsetX, offsetY };
    };

    // 1. Draw Primary Scene A
    let activeBounds = { drawW: w, drawH: h, offsetX: 0, offsetY: 0 };
    if (imgA) {
      activeBounds = drawUnifiedPhoto(imgA, 1 - blend, camScale, camPanX, camPanY);
    }

    // 2. Draw Cross-faded Scene B
    if (imgB && blend > 0) {
      drawUnifiedPhoto(imgB, blend, camScale * 0.99, camPanX * 0.9, camPanY * 0.9);
    }

    // 3. Cinematic Atmospheric Left Vignette (enhances text legibility over natural night sky)
    const leftShadow = ctx.createLinearGradient(0, 0, w * 0.65, 0);
    leftShadow.addColorStop(0, 'rgba(8, 8, 12, 0.85)');
    leftShadow.addColorStop(0.45, 'rgba(8, 8, 12, 0.4)');
    leftShadow.addColorStop(1, 'rgba(8, 8, 12, 0)');
    ctx.fillStyle = leftShadow;
    ctx.fillRect(0, 0, w * 0.65, h);

    // Subtle edge grading
    const edgeGrad = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.45,
      w / 2, h / 2, Math.max(w, h) * 0.9
    );
    edgeGrad.addColorStop(0, 'rgba(5, 5, 8, 0)');
    edgeGrad.addColorStop(1, 'rgba(5, 5, 8, 0.7)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);

    // 4. Spider-Sense Precognitive Wave Arcs (Positioned right over Spider-Man's actual head)
    if (stage === 'perch' && p < 0.24) {
      ctx.save();
      const sensePulse = (Date.now() / 450) % 1;
      const headX = activeBounds.offsetX + activeBounds.drawW * 0.54;
      const headY = activeBounds.offsetY + activeBounds.drawH * 0.27;

      ctx.beginPath();
      ctx.arc(headX, headY, (24 + sensePulse * 20) * dpr, Math.PI * 1.1, Math.PI * 1.9);
      ctx.strokeStyle = `rgba(243, 212, 3, ${1 - sensePulse})`;
      ctx.lineWidth = 2.5 * dpr;
      ctx.shadowColor = '#F3D403';
      ctx.shadowBlur = 14 * dpr;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(headX, headY, (36 + sensePulse * 24) * dpr, Math.PI * 1.15, Math.PI * 1.85);
      ctx.strokeStyle = `rgba(230, 36, 41, ${(1 - sensePulse) * 0.85})`;
      ctx.lineWidth = 2 * dpr;
      ctx.shadowColor = '#E62429';
      ctx.shadowBlur = 12 * dpr;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Dynamic High-Tension Silk Web Line during Dive & Swing
    if (stage === 'dive') {
      ctx.save();
      const anchorX = w * 0.94;
      const anchorY = h * 0.06;
      const wristX = activeBounds.offsetX + activeBounds.drawW * 0.84;
      const wristY = activeBounds.offsetY + activeBounds.drawH * 0.25;

      // Anchor Flare
      ctx.beginPath();
      ctx.arc(anchorX, anchorY, 7 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#00B4D8';
      ctx.shadowBlur = 20 * dpr;
      ctx.fill();

      // Glow Line
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.quadraticCurveTo((anchorX + wristX) / 2, (anchorY + wristY) / 2 + 15 * dpr, wristX, wristY);
      ctx.strokeStyle = 'rgba(0, 180, 216, 0.7)';
      ctx.lineWidth = 5 * dpr;
      ctx.stroke();

      // Core
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.quadraticCurveTo((anchorX + wristX) / 2, (anchorY + wristY) / 2 + 15 * dpr, wristX, wristY);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2 * dpr;
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 10 * dpr;
      ctx.stroke();
      ctx.restore();
    } else if (stage === 'swing') {
      ctx.save();
      const anchorX = w * 0.86;
      const anchorY = h * 0.01;
      const handX = activeBounds.offsetX + activeBounds.drawW * 0.54;
      const handY = activeBounds.offsetY + activeBounds.drawH * 0.09;

      // Anchor Flare
      ctx.beginPath();
      ctx.arc(anchorX, anchorY, 7 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#00B4D8';
      ctx.shadowBlur = 20 * dpr;
      ctx.fill();

      // Glow Line
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.quadraticCurveTo((anchorX + handX) / 2, (anchorY + handY) / 2 - 8 * dpr, handX, handY);
      ctx.strokeStyle = 'rgba(0, 180, 216, 0.7)';
      ctx.lineWidth = 5 * dpr;
      ctx.stroke();

      // Core
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.quadraticCurveTo((anchorX + handX) / 2, (anchorY + handY) / 2 - 8 * dpr, handX, handY);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2 * dpr;
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 10 * dpr;
      ctx.stroke();
      ctx.restore();
    }

    setCurrentStage(stage);

    if (stage !== lastStageRef.current) {
      if (stage === 'dive') soundEngine.playWebShoot();
      if (stage === 'swing') soundEngine.playWhoosh(1.4);
      if (stage === 'apex') soundEngine.playWhoosh(1.0);
      if (stage === 'perch') soundEngine.playSpiderSense();
      lastStageRef.current = stage;
    }
  }, []);

  // Handle scroll scrubbing
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const progress = Math.min(1, Math.max(0, -rect.top / totalScroll));
      setScrollProgress(progress);
      setWebFluid(Math.max(12, 94.8 - progress * 16.4));
      drawScene(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => drawScene(scrollProgress), { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', () => drawScene(scrollProgress));
    };
  }, [drawScene, scrollProgress]);

  useEffect(() => {
    if (isReady) drawScene(0);
  }, [isReady, drawScene]);

  // Floating quote visibility thresholds (Stark style, positioned cleanly on left side during scroll)
  const quote1Opacity = scrollProgress > 0.16 && scrollProgress < 0.38 ? 1 : 0;
  const quote2Opacity = scrollProgress >= 0.44 && scrollProgress < 0.68 ? 1 : 0;
  const quote3Opacity = scrollProgress >= 0.72 && scrollProgress < 0.94 ? 1 : 0;

  const introOpacity = Math.max(0, 1 - scrollProgress / 0.14);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[400vh] bg-[#0A0A0C]"
      id="spiderman-hero"
    >
      {/* STICKY FULLSCREEN VIEWPORT */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#0A0A0C]">
        {/* Main 3D Canvas Stage */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* HUD Spider Corner Brackets */}
        <div className="pointer-events-none absolute left-6 top-20 text-[#E62429] md:left-10 md:top-24">
          <SpidermanHudFrame corner="top-left" color="red" />
        </div>
        <div className="pointer-events-none absolute right-6 top-20 text-[#E62429] md:right-10 md:top-24">
          <SpidermanHudFrame corner="top-right" color="red" />
        </div>
        <div className="pointer-events-none absolute bottom-14 left-6 text-[#00B4D8] md:bottom-16 md:left-10">
          <SpidermanHudFrame corner="bottom-left" color="cyan" />
        </div>
        <div className="pointer-events-none absolute bottom-14 right-6 text-[#00B4D8] md:bottom-16 md:right-10">
          <SpidermanHudFrame corner="bottom-right" color="cyan" />
        </div>

        {/* Top Telemetry Link */}
        <div className="pointer-events-none absolute left-6 top-16 z-10 flex items-center gap-2 md:left-10 md:top-20">
          <div className="h-px w-8 bg-[#E62429]/70" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            Spider-Sense Link — Active
          </span>
        </div>
        <div className="pointer-events-none absolute right-6 top-16 z-10 flex items-center gap-3 md:right-10 md:top-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            Web Cartridge
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#00B4D8] font-bold">
            {webFluid.toFixed(1)}%
          </span>
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-[#00B4D8] shadow-[0_0_10px_rgba(0,180,216,0.9)] animate-pulse"
          />
        </div>

        {/* Intro Hero Typography (Cleanly positioned on bottom-left) */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-3 px-6 pb-20 md:px-12 md:pb-24 pointer-events-none transition-all duration-150 max-w-xl"
          style={{
            opacity: introOpacity,
            transform: `translateY(${(1 - introOpacity) * 20}px)`,
          }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#E62429] backdrop-blur-md"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(230,36,41,0.3)',
            }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E62429] shadow-[0_0_10px_rgba(230,36,41,0.85)]" />
            PARKER PROTOCOL // WEB-SLINGER ONLINE
          </span>

          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[0.98] tracking-tighter text-white">
            The Amazing<br />
            <span className="text-[#E62429]">Spider-Man.</span>
          </h1>

          <p className="max-w-[38ch] font-sans text-xs md:text-sm leading-relaxed text-zinc-300">
            Peter Parker. Synthetic web-fluid polymer primed. Scroll down to dive off the rooftop and slingshot across the Manhattan skyline.
          </p>
        </div>

        {/* FLOATING SPIDER-MAN QUOTE CARDS (Positioned on Left/Center during scroll so they never block Spider-Man on the right) */}
        {/* Quote 1 */}
        <div
          className="pointer-events-none absolute top-[28%] left-6 md:left-14 z-20 w-[380px] max-w-[90vw] transition-all duration-300"
          style={{
            opacity: quote1Opacity,
            transform: `translateY(${(1 - quote1Opacity) * 20}px)`,
          }}
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E62429] block mb-2">
              01 — THE OATH
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “With great power comes great responsibility.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Peter Parker</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E62429]">
                AMAZING FANTASY #15
              </span>
            </figcaption>
          </div>
        </div>

        {/* Quote 2 */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-6 md:left-14 z-20 w-[380px] max-w-[90vw] transition-all duration-300"
          style={{
            opacity: quote2Opacity,
            transform: `translateY(${(1 - quote2Opacity) * 20}px)`,
          }}
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00B4D8] block mb-2">
              02 — RESILIENCE
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “No matter how many times I get hit, I always find a way to come back.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Peter Parker</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00B4D8]">
                INTO THE SPIDER-VERSE
              </span>
            </figcaption>
          </div>
        </div>

        {/* Quote 3 */}
        <div
          className="pointer-events-none absolute bottom-24 left-6 md:bottom-28 md:left-14 z-20 w-[380px] max-w-[90vw] transition-all duration-300"
          style={{
            opacity: quote3Opacity,
            transform: `translateY(${(1 - quote3Opacity) * 20}px)`,
          }}
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E62429] block mb-2">
              03 — NEIGHBORHOOD GUARDIAN
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “Your friendly neighborhood Spider-Man. Always watching over New York.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Peter Parker</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E62429]">
                THE AMAZING SPIDER-MAN
              </span>
            </figcaption>
          </div>
        </div>

        {/* Bottom Scrubber & Sequence Stage Indicator */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-6 mb-2 h-0.5 bg-white/10 md:mx-10 overflow-hidden">
            <div
              className="h-full bg-[#E62429] shadow-[0_0_8px_#E62429]"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
          <div className="mx-6 flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 md:mx-10">
            <span>{STAGE_NAMES[currentStage]}</span>
            <span className="hidden sm:inline">QUEENS TO MANHATTAN // PATROL</span>
            <span className="animate-bounce">Scroll ↓</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {!isReady && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#0A0A0C] px-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#E62429]"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(230,36,41,0.3)',
              }}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-[#E62429] shadow-[0_0_10px_rgba(230,36,41,0.85)] animate-ping" />
              WEB-SHOOTER PROTOCOL // CALIBRATING
            </span>

            <div className="h-1 w-64 bg-white/10 md:w-80 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E62429] transition-all duration-150 ease-out"
                style={{ width: `${(loadedCount / 3) * 100}%` }}
              />
            </div>

            <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
              Loading Spider-Man Engine · {Math.floor((loadedCount / 3) * 100)}%
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
