import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HudFrame } from '../ui/HudFrame';
import { soundEngine } from '../../services/soundEngine';

const TOTAL_FRAMES = 64;

export const CaptainAmericaHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const scrollRatioRef = useRef(0);

  const isVisibleRef = useRef(true);
  const isDirtyRef = useRef(true);
  const animIdRef = useRef<number | null>(null);

  // Store preloaded 64 film frames + hero follow-through image
  const framesRef = useRef<HTMLImageElement[]>([]);
  const heroImageRef = useRef<HTMLImageElement | null>(null);

  // 3D Gyroscopic Mouse Parallax
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Audio trigger debounces
  const soundFiredRef = useRef({ throw: false, clang: false });

  // Preload authentic 64-frame cinematic sequence + Steve Rogers battle stance
  useEffect(() => {
    let loadedCount = 0;
    const frameImages: HTMLImageElement[] = [];

    // Preload hero follow-through image
    const heroImg = new Image();
    heroImg.src = '/assets/cap_steve_raw.png';
    heroImg.onload = () => {
      heroImageRef.current = heroImg;
      isDirtyRef.current = true;
    };

    // Preload 64 WebP frames
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = i.toString().padStart(2, '0');
      img.src = `/cap_throw/throw_${numStr}.webp`;

      img.onload = () => {
        loadedCount++;
        // As soon as the first frame is ready, immediately unlock view
        if (i === 0 || loadedCount >= 4) {
          setIsReady(true);
          isDirtyRef.current = true;
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (i === 0 || loadedCount >= 4) {
          setIsReady(true);
          isDirtyRef.current = true;
        }
      };

      frameImages.push(img);
    }

    framesRef.current = frameImages;
  }, []);

  // High-performance canvas rendering
  const renderFrame = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    const gyroPanX = mouseRef.current.x * 22 * dpr;
    const gyroPanY = mouseRef.current.y * 14 * dpr;
    const gyroRot = mouseRef.current.x * 0.012;

    // Timeline Progression:
    // Phase 1: Authentic Film Shield Throw Sequence (0.00 -> 0.72)
    // Phase 2: Supersonic Impact / Screen Shake / Vibranium Flash (0.70 -> 0.76)
    // Phase 3: Steve Rogers Battle Ready Stance & Tactical Telemetry (0.72 -> 1.00)
    const throwProgress = Math.min(1, Math.max(0, progress / 0.72));
    const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(throwProgress * TOTAL_FRAMES));

    // Audio triggers mapped to film choreography
    if (throwProgress >= 0.38 && !soundFiredRef.current.throw) {
      soundEngine.playShieldThrow();
      soundFiredRef.current.throw = true;
    } else if (progress <= 0.15) {
      soundFiredRef.current.throw = false;
    }

    if (throwProgress >= 0.88 && !soundFiredRef.current.clang) {
      soundEngine.playShieldClang();
      soundFiredRef.current.clang = true;
    } else if (progress <= 0.50) {
      soundFiredRef.current.clang = false;
    }

    // Screen Shake at peak shield impact / flyby
    let shakeX = 0;
    let shakeY = 0;
    if (throwProgress >= 0.84 && throwProgress <= 0.98) {
      const shakeIntensity = (1 - Math.abs(throwProgress - 0.91) / 0.07) * 16 * dpr;
      shakeX = (Math.random() - 0.5) * shakeIntensity;
      shakeY = (Math.random() - 0.5) * shakeIntensity;
    }

    // 1. Draw Film Shield Throw Frame (Widescreen cinematic aspect-ratio preserving)
    const currentFrame = framesRef.current[frameIndex] || framesRef.current[0];
    if (currentFrame && currentFrame.complete) {
      ctx.save();
      const fAspect = currentFrame.naturalWidth / currentFrame.naturalHeight;
      const canvasAspect = w / h;

      let drawW: number;
      let drawH: number;

      if (canvasAspect > fAspect) {
        drawW = w;
        drawH = w / fAspect;
      } else {
        drawH = h;
        drawW = h * fAspect;
      }

      // Cinematic camera push-in as shield flies toward viewer
      const camZoom = 1.0 + throwProgress * 0.09;
      drawW *= camZoom;
      drawH *= camZoom;

      const offsetX = (w - drawW) / 2 + gyroPanX * 0.35 + shakeX;
      // Headroom anchor: 40% from top keeps Steve's upper body and the flying shield centered
      const offsetY = (h - drawH) * 0.40 + gyroPanY * 0.35 + shakeY;

      ctx.translate(w / 2, h / 2);
      ctx.rotate(gyroRot);
      ctx.translate(-w / 2, -h / 2);

      // Fade out slightly when transitioning to hero stance
      const filmAlpha = progress > 0.74 ? Math.max(0, 1 - (progress - 0.74) / 0.16) : 1;
      ctx.globalAlpha = filmAlpha;

      ctx.drawImage(currentFrame, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    }

    // 2. Kinetic Impact Vibranium Shockwave Flash (at throwProgress ~ 0.90 -> 1.00)
    if (throwProgress > 0.82 && throwProgress < 1.0) {
      const flashT = (throwProgress - 0.82) / 0.18;
      const flashAlpha = Math.sin(flashT * Math.PI);

      ctx.save();
      // Expanding golden-blue sonic wave
      const waveRadius = (flashT * 0.65 + 0.1) * Math.max(w, h);
      const waveGrad = ctx.createRadialGradient(
        w / 2 + shakeX,
        h / 2 + shakeY,
        waveRadius * 0.8,
        w / 2 + shakeX,
        h / 2 + shakeY,
        waveRadius
      );
      waveGrad.addColorStop(0, 'rgba(59, 130, 246, 0)');
      waveGrad.addColorStop(0.5, `rgba(245, 158, 11, ${0.45 * flashAlpha})`);
      waveGrad.addColorStop(0.8, `rgba(59, 130, 246, ${0.6 * flashAlpha})`);
      waveGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');

      ctx.fillStyle = waveGrad;
      ctx.beginPath();
      ctx.arc(w / 2 + shakeX, h / 2 + shakeY, waveRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Phase 3: Transition to Steve Rogers Combat Ready Stance (0.72 -> 1.00)
    if (progress > 0.72 && heroImageRef.current && heroImageRef.current.complete) {
      const hero = heroImageRef.current;
      const heroAlpha = Math.min(1, (progress - 0.72) / 0.16);

      ctx.save();
      ctx.globalAlpha = heroAlpha;

      const heroAspect = hero.naturalWidth / hero.naturalHeight;
      const heroH = h * 0.90;
      const heroW = heroH * heroAspect;
      const heroX = (w - heroW) / 2 + gyroPanX * 0.5 + shakeX * 0.4;
      const heroY = (h - heroH) * 0.45 + gyroPanY * 0.5 + shakeY * 0.4;

      ctx.drawImage(hero, heroX, heroY, heroW, heroH);

      // Resonant Vibranium Rim Pulse
      const pulseTime = Date.now() / 600;
      const pulse = (Math.sin(pulseTime) + 1) * 0.5;
      const shieldCenterX = heroX + heroW * 0.52;
      const shieldCenterY = heroY + heroH * 0.58;
      const pulseRadius = (heroW * 0.38) * (1 + pulse * 0.06);

      ctx.strokeStyle = `rgba(59, 130, 246, ${0.35 + pulse * 0.25})`;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(shieldCenterX, shieldCenterY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // 4. Blockbuster Anamorphic Letterbox Vignette
    const vignette = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.38,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.95
    );
    vignette.addColorStop(0, 'rgba(6, 7, 12, 0)');
    vignette.addColorStop(0.65, 'rgba(6, 6, 10, 0.32)');
    vignette.addColorStop(1, 'rgba(4, 4, 7, 0.92)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }, []);

  // Performance Boost: On-Demand Render Scheduler
  // Halts rAF loop completely when user is idle, off-screen, or tab is hidden!
  const scheduleRender = useCallback(() => {
    if (!isVisibleRef.current || document.hidden) return;
    if (animIdRef.current !== null) return;

    animIdRef.current = requestAnimationFrame(() => {
      animIdRef.current = null;

      // Lerp gyro parallax with smooth damping
      const dx = mouseRef.current.targetX - mouseRef.current.x;
      const dy = mouseRef.current.targetY - mouseRef.current.y;
      const isMouseMoving = Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001;

      if (isMouseMoving) {
        mouseRef.current.x += dx * 0.08;
        mouseRef.current.y += dy * 0.08;
        isDirtyRef.current = true;
      }

      if (isDirtyRef.current) {
        renderFrame(scrollRatioRef.current);
        isDirtyRef.current = false;

        // Keep running until mouse lerp settles
        if (isMouseMoving) {
          scheduleRender();
        }
      }
    });
  }, [renderFrame]);

  // Viewport Culling via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            isDirtyRef.current = true;
            scheduleRender();
          }
        });
      },
      { threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [scheduleRender]);

  // Tab Visibility Culling
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden && isVisibleRef.current) {
        isDirtyRef.current = true;
        scheduleRender();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [scheduleRender]);

  // Mouse move listener with dirty flag
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
      isDirtyRef.current = true;
      scheduleRender();
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [scheduleRender]);

  // Scroll scrubbing listener with dirty flag
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const progress = Math.min(1, Math.max(0, -rect.top / totalScroll));
      scrollRatioRef.current = progress;
      setScrollRatio(progress);
      isDirtyRef.current = true;
      scheduleRender();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scheduleRender]);

  // Render whenever isReady changes
  useEffect(() => {
    if (isReady) {
      isDirtyRef.current = true;
      scheduleRender();
    }
  }, [isReady, scheduleRender]);

  const introOpacity = Math.max(0, Math.min(1, (0.22 - scrollRatio) / 0.12));
  const quote1Active = scrollRatio > 0.18 && scrollRatio < 0.48;
  const quote2Active = scrollRatio >= 0.48 && scrollRatio < 0.78;
  const quote3Active = scrollRatio >= 0.78;

  // Dynamic throw velocity for HUD telemetry readout
  const throwSpeedKmh = Math.round(Math.min(168, Math.max(0, (scrollRatio / 0.72) * 168)));

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[380vh] bg-[#07080D]"
      id="captainamerica-hero"
    >
      {/* STICKY FULLSCREEN VIEWPORT */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#07080D]">
        {/* Main 4K Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover cursor-default"
        />

        {/* HUD Corner Brackets */}
        <div className="pointer-events-none absolute left-6 top-20 text-[#3B82F6] md:left-10 md:top-24">
          <HudFrame corner="top-left" />
        </div>
        <div className="pointer-events-none absolute right-6 top-20 text-[#3B82F6] md:right-10 md:top-24">
          <HudFrame corner="top-right" />
        </div>
        <div className="pointer-events-none absolute bottom-14 left-6 text-[#3B82F6] md:bottom-16 md:left-10">
          <HudFrame corner="bottom-left" />
        </div>
        <div className="pointer-events-none absolute bottom-14 right-6 text-[#3B82F6] md:bottom-16 md:right-10">
          <HudFrame corner="bottom-right" />
        </div>

        {/* Telemetry Top Badges */}
        <div className="pointer-events-none absolute left-6 top-16 z-10 flex items-center gap-2 md:left-10 md:top-20">
          <div className="h-px w-8 bg-[#3B82F6]/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            S.S.R. // STRATEGIC SCIENTIFIC RESERVE // LIVE
          </span>
        </div>
        <div className="pointer-events-none absolute right-6 top-16 z-10 flex items-center gap-3 md:right-10 md:top-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            Ballistic Velocity
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3B82F6] font-bold">
            {throwSpeedKmh} KM/H
          </span>
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.9)] animate-pulse"
          />
        </div>

        {/* Intro Hero Typography */}
        <div
          className="absolute left-6 bottom-16 md:left-12 md:bottom-20 z-10 flex flex-col items-start gap-2.5 p-5 md:p-6 rounded-2xl border border-white/10 bg-[#080B12]/80 backdrop-blur-md shadow-2xl pointer-events-none transition-all duration-150 max-w-sm"
          style={{
            opacity: introOpacity,
            transform: `translateY(${(1 - introOpacity) * 20}px)`,
          }}
        >
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[#3B82F6]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            AVENGERS LEADERSHIP // STEVE ROGERS
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tracking-tight text-white">
            Captain America
          </h1>

          <p className="font-mono text-[11px] text-zinc-400 tracking-wide">
            Vibranium Shield · Super-Soldier Serum · Kinetic Ricochet
          </p>

          <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="h-1 w-1 rounded-full bg-[#3B82F6]" />
            Scroll down to throw shield
          </div>
        </div>

        {/* MINIMAL SLEEK FLOATING QUOTE CAPSULES */}
        <div className="pointer-events-none absolute bottom-16 right-6 md:right-12 z-20 max-w-md transition-all duration-300">
          {quote1Active && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#080B12]/85 backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#3B82F6] font-bold">CAP:</span> “Whatever it takes.”
              </p>
            </div>
          )}

          {quote2Active && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#080B12]/85 backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-[#DC2626] shadow-[0_0_8px_#DC2626] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#DC2626] font-bold">STEVE:</span> “I can do this all day.”
              </p>
            </div>
          )}

          {quote3Active && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#080B12]/85 backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-white font-bold">CAPTAIN:</span> “Avengers... Assemble.”
              </p>
            </div>
          )}
        </div>

        {/* Bottom Scrubber & Diagnostic Tracker */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-6 mb-2 h-0.5 bg-white/10 md:mx-10 overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]"
              style={{ width: `${scrollRatio * 100}%` }}
            />
          </div>
          <div className="mx-6 flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 md:mx-10">
            <span>PROJECT REBIRTH // 4K TACTICAL COMMAND</span>
            <span className="hidden sm:inline">VIBRANIUM SHIELD KINETIC TRAJECTORY</span>
            <span className="animate-bounce">Scroll to Throw Shield ↓</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {!isReady && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#07080D] px-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#3B82F6]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.85)] animate-ping" />
              INITIALIZING S.S.R. REBIRTH PROTOCOLS
            </span>
            <div className="h-1 w-64 bg-white/10 md:w-80 rounded-full overflow-hidden">
              <div className="h-full bg-[#3B82F6] animate-pulse w-full" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
              Loading Film Shield Throw Sequence...
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
