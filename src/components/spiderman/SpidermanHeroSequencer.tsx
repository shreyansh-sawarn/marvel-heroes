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

  // 3D Gyroscopic Mouse Parallax tracking
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [spiderSenseActive, setSpiderSenseActive] = useState(false);

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

    // Lerp mouse parallax for silky smooth gyro response
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
    const gyroPanX = mouseRef.current.x * 24 * dpr;
    const gyroPanY = mouseRef.current.y * 16 * dpr;
    const gyroRot = mouseRef.current.x * 0.012;

    // Stage definition
    let stage: SpiderStage = 'perch';
    let imgA: HTMLImageElement | undefined = imagesRef.current.perch;
    let imgB: HTMLImageElement | undefined = undefined;
    let blend = 0;
    let camScale = 1.0;
    let camPanX = gyroPanX;
    let camPanY = gyroPanY;

    if (p < 0.32) {
      // STAGE 1: ROOFTOP PERCH & PRECOGNITION
      stage = 'perch';
      imgA = imagesRef.current.perch;
      const sub = p / 0.32;
      camScale = 1.0 + sub * 0.05;
      camPanY = gyroPanY + sub * -15 * dpr;
    } else if (p < 0.68) {
      // STAGE 2: HIGH-ALTITUDE DIVE & HIGH-TENSILE WEB SHOT
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
      // STAGE 3: CANYON ARC SWING
      stage = 'swing';
      const sub = (p - 0.68) / 0.32;
      imgA = imagesRef.current.swing;
      camScale = 1.1 + sub * 0.06;
      camPanX = gyroPanX + Math.sin(sub * Math.PI) * 20 * dpr;
      camPanY = gyroPanY + sub * -20 * dpr;
      if (sub < 0.12) {
        imgB = imagesRef.current.leap;
        blend = 1 - sub / 0.12;
      }
    }

    setCurrentStage(stage);

    // High performance widescreen drawing helper with zero stretching
    const drawUnifiedPhoto = (
      img: HTMLImageElement,
      alpha: number,
      scale: number,
      panX: number,
      panY: number,
      focusAnchorY: number = 0.45
    ) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = w / h;

      let drawW: number;
      let drawH: number;

      if (canvasAspect > imgAspect) {
        drawW = w;
        drawH = w / imgAspect;
      } else {
        drawH = h;
        drawW = h * imgAspect;
      }

      drawW *= scale;
      drawH *= scale;

      const offsetX = (w - drawW) / 2 + panX;
      const offsetY = (h - drawH) * focusAnchorY + panY;

      ctx.translate(w / 2, h / 2);
      ctx.rotate(gyroRot);
      ctx.translate(-w / 2, -h / 2);

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      return { drawW, drawH, offsetX, offsetY };
    };

    // Stage-specific framing anchor
    const anchorY = stage === 'swing' ? 0.18 : 0.45;

    // 1. Draw Primary Scene A
    let activeBounds = { drawW: w, drawH: h, offsetX: 0, offsetY: 0 };
    if (imgA) {
      activeBounds = drawUnifiedPhoto(imgA, 1 - blend, camScale, camPanX, camPanY, anchorY);
    }

    // 2. Draw Cross-faded Scene B
    if (imgB && blend > 0) {
      drawUnifiedPhoto(imgB, blend, camScale * 0.99, camPanX * 0.9, camPanY * 0.9, anchorY);
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

    // 4. Spider-Sense Precognitive Wave Arcs (Positioned right over Spider-Man's actual head in Brand New Day spire perch)
    if ((stage === 'perch' && p < 0.24) || spiderSenseActive) {
      ctx.save();
      const sensePulse = (Date.now() / (spiderSenseActive ? 280 : 450)) % 1;
      const headX = activeBounds.offsetX + activeBounds.drawW * 0.535;
      const headY = activeBounds.offsetY + activeBounds.drawH * 0.23;

      const boost = spiderSenseActive ? 1.6 : 1.0;
      ctx.beginPath();
      ctx.arc(headX, headY, (28 + sensePulse * 36) * dpr * boost, Math.PI * 1.05, Math.PI * 1.95);
      ctx.strokeStyle = `rgba(243, 212, 3, ${1 - sensePulse})`;
      ctx.lineWidth = 3 * dpr;
      ctx.shadowColor = '#F3D403';
      ctx.shadowBlur = 18 * dpr;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(headX, headY, (44 + sensePulse * 48) * dpr * boost, Math.PI * 1.08, Math.PI * 1.92);
      ctx.strokeStyle = `rgba(230, 36, 41, ${(1 - sensePulse) * 0.95})`;
      ctx.lineWidth = 2.5 * dpr;
      ctx.shadowColor = '#E62429';
      ctx.shadowBlur = 16 * dpr;
      ctx.stroke();

      if (spiderSenseActive) {
        ctx.beginPath();
        ctx.arc(headX, headY, (65 + sensePulse * 70) * dpr, Math.PI * 1.0, Math.PI * 2.0);
        ctx.strokeStyle = `rgba(0, 180, 216, ${(1 - sensePulse) * 0.75})`;
        ctx.lineWidth = 2 * dpr;
        ctx.shadowColor = '#00B4D8';
        ctx.shadowBlur = 24 * dpr;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Dynamic High-Tension Silk Web Line during Dive & Swing
    if (stage === 'dive') {
      ctx.save();
      const anchorX = w * 0.88;
      const anchorY = h * 0.08;
      const wristX = activeBounds.offsetX + activeBounds.drawW * 0.44;
      const wristY = activeBounds.offsetY + activeBounds.drawH * 0.15;

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
      const anchorX = w * 0.82;
      const anchorY = h * 0.04;
      const handX = activeBounds.offsetX + activeBounds.drawW * 0.44;
      const handY = activeBounds.offsetY + activeBounds.drawH * 0.24;

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
          onClick={triggerSpiderSense}
          title="Click to trigger Spider-Sense"
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
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

        {/* Intro Hero Typography (Cleanly positioned on bottom-left, sleek & uncluttered) */}
        <div
          className="absolute left-6 bottom-16 md:left-12 md:bottom-20 z-10 flex flex-col items-start gap-2.5 p-5 md:p-6 rounded-2xl border border-white/10 bg-[#0A0A0C]/75 backdrop-blur-md shadow-2xl pointer-events-none transition-all duration-150 max-w-sm"
          style={{
            opacity: introOpacity,
            transform: `translateY(${(1 - introOpacity) * 20}px)`,
          }}
        >
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[#00B4D8]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
            EARTH-616 // BRAND NEW DAY
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tracking-tight text-white">
            Spider-Man
          </h1>

          <p className="font-mono text-[11px] text-zinc-400 tracking-wide">
            Classic Red & Blue · Manhattan Spire · NYPD 460.125 MHz
          </p>

          <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="h-1 w-1 rounded-full bg-[#E62429]" />
            Click canvas to trigger Spider-Sense
          </div>
        </div>

        {/* MINIMAL SLEEK FLOATING QUOTE CAPSULES (Uncluttered, 85%+ Visual Freedom) */}
        <div className="pointer-events-none absolute bottom-16 left-6 md:left-12 z-20 max-w-md transition-all duration-300">
          {quote1Opacity > 0 && (
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl transition-all duration-300"
              style={{
                opacity: quote1Opacity,
                transform: `translateY(${(1 - quote1Opacity) * 12}px)`,
              }}
            >
              <span className="h-2 w-2 rounded-full bg-[#00B4D8] shadow-[0_0_8px_#00B4D8] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#00B4D8] font-bold">PETER:</span> “NYC will always have Spider-Man.”
              </p>
            </div>
          )}

          {quote2Opacity > 0 && (
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl transition-all duration-300"
              style={{
                opacity: quote2Opacity,
                transform: `translateY(${(1 - quote2Opacity) * 12}px)`,
              }}
            >
              <span className="h-2 w-2 rounded-full bg-[#E62429] shadow-[0_0_8px_#E62429] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#E62429] font-bold">TACTICAL:</span> “No safety nets. Homemade web cartridges active.”
              </p>
            </div>
          )}

          {quote3Opacity > 0 && (
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl transition-all duration-300"
              style={{
                opacity: quote3Opacity,
                transform: `translateY(${(1 - quote3Opacity) * 12}px)`,
              }}
            >
              <span className="h-2 w-2 rounded-full bg-[#F3D403] shadow-[0_0_8px_#F3D403] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#F3D403] font-bold">MAY:</span> “With great power comes great responsibility.”
              </p>
            </div>
          )}
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
