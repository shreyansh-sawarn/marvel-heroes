import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HudFrame } from '../ui/HudFrame';

export const IronManHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const scrollRatioRef = useRef(0);

  const isVisibleRef = useRef(false);
  const isDirtyRef = useRef(true);
  const animIdRef = useRef<number | null>(null);

  const imagesRef = useRef<{
    mk85?: HTMLImageElement;
    flight?: HTMLImageElement;
  }>({});

  // 3D Gyroscopic Mouse Parallax
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Preload 4K authentic Marvel Studios Mark LXXXV assets
  useEffect(() => {
    const assets = [
      { key: 'mk85', src: '/assets/ironman_mk85_raw.jpg' },
      { key: 'flight', src: '/assets/ironman_flight_raw.jpg' },
    ];

    let loaded = 0;
    assets.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[key as 'mk85' | 'flight'] = img;
        loaded++;
        if (loaded >= assets.length) setIsReady(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= assets.length) setIsReady(true);
      };
    });
  }, []);

  // High-performance canvas rendering
  const renderFrame = useCallback((progress: number) => {
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

    // Lerp gyro parallax
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
    const gyroPanX = mouseRef.current.x * 26 * dpr;
    const gyroPanY = mouseRef.current.y * 18 * dpr;
    const gyroRot = mouseRef.current.x * 0.012;

    const mk85 = imagesRef.current.mk85;
    const flight = imagesRef.current.flight;

    // Transition progress between Studio Armor and Supersonic Flight Launch
    const blendFlight = Math.max(0, Math.min(1, (progress - 0.4) / 0.3));

    const drawPhoto = (
      img: HTMLImageElement,
      alpha: number,
      scale: number,
      panX: number,
      panY: number,
      anchorY: number = 0.5
    ) => {
      if (!img || !img.complete) return { drawW: w, drawH: h, offsetX: 0, offsetY: 0 };
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
      // Use anchorY so the head/helmet has generous breathing room and is never cut off
      const offsetY = (h - drawH) * anchorY + panY;

      ctx.translate(w / 2, h / 2);
      ctx.rotate(gyroRot);
      ctx.translate(-w / 2, -h / 2);

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      return { drawW, drawH, offsetX, offsetY };
    };

    // 1. Draw Mark LXXXV Studio Armor (with top anchor so helmet is fully visible)
    if (mk85 && blendFlight < 1) {
      const zoom = 1.0 + progress * 0.06;
      drawPhoto(mk85, 1 - blendFlight, zoom, gyroPanX, gyroPanY + progress * -20 * dpr, 0.12);
    }

    // 2. Draw Supersonic Launch
    if (flight && blendFlight > 0) {
      const zoom = 1.05 + (1 - blendFlight) * 0.05;
      drawPhoto(flight, blendFlight, zoom, gyroPanX, gyroPanY + (1 - blendFlight) * 20 * dpr, 0.4);
    }

    // 3. Cinematic Stark Atmospheric Vignette
    const vignette = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.4,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.95
    );
    vignette.addColorStop(0, 'rgba(8, 8, 12, 0)');
    vignette.addColorStop(0.7, 'rgba(6, 6, 10, 0.45)');
    vignette.addColorStop(1, 'rgba(3, 3, 5, 0.92)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }, []);

  // Performance Boost: On-demand render scheduler with off-screen culling
  const scheduleRender = useCallback(() => {
    if (!isVisibleRef.current || document.hidden) return;
    if (animIdRef.current !== null) return;

    animIdRef.current = requestAnimationFrame(() => {
      animIdRef.current = null;

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

  // Render when ready
  useEffect(() => {
    if (isReady) {
      isDirtyRef.current = true;
      scheduleRender();
    }
  }, [isReady, scheduleRender]);

  const introOpacity = Math.max(0, Math.min(1, (0.2 - scrollRatio) / 0.12));
  const quote1Active = scrollRatio > 0.15 && scrollRatio < 0.45;
  const quote2Active = scrollRatio >= 0.45 && scrollRatio < 0.75;
  const quote3Active = scrollRatio >= 0.75;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[380vh] bg-[#0A0A0C]"
      id="ironman-hero"
    >
      {/* STICKY FULLSCREEN VIEWPORT */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#0A0A0C]">
        {/* Main 4K Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover cursor-default"
        />

        {/* HUD Corner Brackets */}
        <div className="pointer-events-none absolute left-6 top-20 text-[#D4A22F] md:left-10 md:top-24">
          <HudFrame corner="top-left" />
        </div>
        <div className="pointer-events-none absolute right-6 top-20 text-[#D4A22F] md:right-10 md:top-24">
          <HudFrame corner="top-right" />
        </div>
        <div className="pointer-events-none absolute bottom-14 left-6 text-[#D4A22F] md:bottom-16 md:left-10">
          <HudFrame corner="bottom-left" />
        </div>
        <div className="pointer-events-none absolute bottom-14 right-6 text-[#D4A22F] md:bottom-16 md:right-10">
          <HudFrame corner="bottom-right" />
        </div>

        {/* Telemetry Top Badges */}
        <div className="pointer-events-none absolute left-6 top-16 z-10 flex items-center gap-2 md:left-10 md:top-20">
          <div className="h-px w-8 bg-[#D4A22F]/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            J.A.R.V.I.S. OS // LIVE
          </span>
        </div>
        <div className="pointer-events-none absolute right-6 top-16 z-10 flex items-center gap-3 md:right-10 md:top-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            Arc Reactor Core
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#38BDF8] font-bold">
            100%
          </span>
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.9)] animate-pulse"
          />
        </div>

        {/* Intro Hero Typography (Clean, Sleek & Compact) */}
        <div
          className="absolute left-6 bottom-16 md:left-12 md:bottom-20 z-10 flex flex-col items-start gap-2.5 p-5 md:p-6 rounded-2xl border border-white/10 bg-[#0A0A0C]/75 backdrop-blur-md shadow-2xl pointer-events-none transition-all duration-150 max-w-sm"
          style={{
            opacity: introOpacity,
            transform: `translateY(${(1 - introOpacity) * 20}px)`,
          }}
        >
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-[#D4A22F]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4A22F] animate-pulse" />
            STARK INDUSTRIES // MARK LXXXV
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tracking-tight text-white">
            Iron Man
          </h1>

          <p className="font-mono text-[11px] text-zinc-400 tracking-wide">
            Nanotech Refocuser · Triangular Arc Reactor · Mach 3.4
          </p>
        </div>

        {/* MINIMAL SLEEK FLOATING QUOTE CAPSULES (Uncluttered, 85%+ Visual Freedom) */}
        <div className="pointer-events-none absolute bottom-16 right-6 md:right-12 z-20 max-w-md transition-all duration-300">
          {quote1Active && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-[#D4A22F] shadow-[0_0_8px_#D4A22F] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#D4A22F] font-bold">TONY:</span> “Sometimes you gotta run before you can walk.”
              </p>
            </div>
          )}

          {quote2Active && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#38BDF8] font-bold">JARVIS:</span> “Repulsors online. Diverting power to forward thrusters.”
              </p>
            </div>
          )}

          {quote3Active && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-[#B91C1C] shadow-[0_0_8px_#B91C1C] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#B91C1C] font-bold">STARK:</span> “And I... am... Iron Man.”
              </p>
            </div>
          )}
        </div>

        {/* Bottom Scrubber & Diagnostic Tracker */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-6 mb-2 h-0.5 bg-white/10 md:mx-10 overflow-hidden">
            <div
              className="h-full bg-[#D4A22F] shadow-[0_0_8px_#D4A22F]"
              style={{ width: `${scrollRatio * 100}%` }}
            />
          </div>
          <div className="mx-6 flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 md:mx-10">
            <span>MARK LXXXV // 4K HIGH FIDELITY DIAGNOSTIC</span>
            <span className="hidden sm:inline">STARK INDUSTRIES HUD</span>
            <span className="animate-bounce">Scroll ↓</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {!isReady && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#0A0A0C] px-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#D4A22F]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#D4A22F] shadow-[0_0_10px_rgba(212,162,47,0.85)] animate-ping" />
              INITIALIZING MARK LXXXV SYSTEMS
            </span>
            <div className="h-1 w-64 bg-white/10 md:w-80 rounded-full overflow-hidden">
              <div className="h-full bg-[#D4A22F] animate-pulse w-full" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
              Synchronizing Nanotech Telemetry...
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
