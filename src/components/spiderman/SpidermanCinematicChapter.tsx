import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SpidermanHudFrame } from '../ui/SpidermanHudFrame';

export const SpidermanCinematicChapter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollProgressRef = useRef(0);
  const [isReady, setIsReady] = useState(false);

  const isVisibleRef = useRef(false);
  const isDirtyRef = useRef(true);
  const animIdRef = useRef<number | null>(null);

  // 5K Non-Repeated Patrol Asset
  const patrolImgRef = useRef<HTMLImageElement | null>(null);

  // 3D Gyroscopic Mouse Parallax
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const patrol = new Image();
    patrol.src = '/assets/spidey_patrol_raw.jpg';
    patrol.onload = () => {
      patrolImgRef.current = patrol;
      setIsReady(true);
      isDirtyRef.current = true;
    };
  }, []);

  const drawCinematic = useCallback((p: number) => {
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

    // Lerp mouse parallax for 3D depth
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
    const gyroPanX = mouseRef.current.x * 28 * dpr;
    const gyroPanY = mouseRef.current.y * 18 * dpr;
    const gyroRot = mouseRef.current.x * 0.01;

    // Single unified 5K photo girder patrol zoom & parallax
    const patrol = patrolImgRef.current;
    if (patrol && patrol.complete) {
      const zoom = 1.0 + p * 0.06;
      const panY = gyroPanY + p * -25 * dpr;
      const panX = gyroPanX;

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(gyroRot);
      ctx.scale(zoom, zoom);

      const imgAspect = patrol.naturalWidth / patrol.naturalHeight;
      const canvasAspect = w / h;
      let drawW = w;
      let drawH = h;
      if (canvasAspect > imgAspect) {
        drawW = w;
        drawH = w / imgAspect;
      } else {
        drawH = h;
        drawW = h * imgAspect;
      }

      ctx.drawImage(patrol, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);
      ctx.restore();
    }

    // Atmospheric city glow & tactical scanner grading
    const grad = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.35,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.9
    );
    grad.addColorStop(0, 'rgba(8, 10, 16, 0)');
    grad.addColorStop(0.7, 'rgba(6, 8, 14, 0.4)');
    grad.addColorStop(1, 'rgba(4, 5, 8, 0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle tactical scanline overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 180, 216, 0.03)';
    for (let y = 0; y < h; y += 8 * dpr) {
      ctx.fillRect(0, y, w, 1 * dpr);
    }
    ctx.restore();
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
        drawCinematic(scrollProgressRef.current);
        isDirtyRef.current = false;

        if (isMouseMoving) {
          scheduleRender();
        }
      }
    });
  }, [drawCinematic]);

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
      scrollProgressRef.current = progress;
      setScrollProgress(progress);
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

  const quote1Active = scrollProgress < 0.35;
  const quote2Active = scrollProgress >= 0.35 && scrollProgress < 0.7;
  const quote3Active = scrollProgress >= 0.7;

  return (
    <section
      id="cinematic-chapter"
      ref={containerRef}
      className="relative w-full h-[350vh] bg-[#0A0A0C] border-t border-white/5"
    >
      {/* STICKY FULLSCREEN VIEWPORT */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#0A0A0C]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* HUD Spider Corner Brackets */}
        <div className="pointer-events-none absolute left-6 top-20 text-[#00B4D8] md:left-10 md:top-24">
          <SpidermanHudFrame corner="top-left" color="cyan" />
        </div>
        <div className="pointer-events-none absolute right-6 top-20 text-[#00B4D8] md:right-10 md:top-24">
          <SpidermanHudFrame corner="top-right" color="cyan" />
        </div>
        <div className="pointer-events-none absolute bottom-14 left-6 text-[#E62429] md:bottom-16 md:left-10">
          <SpidermanHudFrame corner="bottom-left" color="red" />
        </div>
        <div className="pointer-events-none absolute bottom-14 right-6 text-[#E62429] md:bottom-16 md:right-10">
          <SpidermanHudFrame corner="bottom-right" color="red" />
        </div>

        {/* Top Telemetry */}
        <div className="pointer-events-none absolute left-6 top-16 z-10 flex items-center gap-2 md:left-10 md:top-20">
          <div className="h-px w-8 bg-[#00B4D8]/70" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            NYPD Police Band 460.125 MHz — Live
          </span>
        </div>
        <div className="pointer-events-none absolute right-6 top-16 z-10 flex items-center gap-3 md:right-10 md:top-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00B4D8]">
            CHAPTER 02 // GIRDER PATROL
          </span>
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#00B4D8] shadow-[0_0_10px_rgba(0,180,216,0.85)] animate-pulse"
          />
        </div>

        {/* Sleek Minimalist Top-Right Recon Badge (Decluttered, 85%+ Visual Freedom) */}
        <div className="pointer-events-none absolute right-6 top-24 z-10 hidden sm:flex flex-col items-end gap-1.5 p-4 rounded-xl border border-white/10 bg-[#0A0A0C]/70 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#00B4D8] uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00B4D8] animate-ping" />
            ELEVATION 840 FT // EMPIRE STATE SECTOR
          </div>
          <p className="font-mono text-[11px] text-zinc-400">
            Scanner Feed: Hell's Kitchen & Mid-Town Patrol
          </p>
        </div>

        {/* SINGLE SLEEK DYNAMIC RADIO INTERCEPT CAPSULE (Bottom-Left) */}
        <div className="pointer-events-none absolute bottom-16 left-6 md:left-12 z-20 max-w-lg transition-all duration-300">
          {quote1Active && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-[#00B4D8] shadow-[0_0_8px_#00B4D8] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#00B4D8] font-bold">SCANNER:</span> “All units, 10-33 in progress near Midtown.”
              </p>
            </div>
          )}

          {quote2Active && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-[#E62429] shadow-[0_0_8px_#E62429] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#E62429] font-bold">PETER:</span> “Someone has to look out for the little guy.”
              </p>
            </div>
          )}

          {quote3Active && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md shadow-xl">
              <span className="h-2 w-2 rounded-full bg-[#F3D403] shadow-[0_0_8px_#F3D403] animate-pulse" />
              <p className="font-mono text-xs text-zinc-200 tracking-wide">
                <span className="text-[#F3D403] font-bold">RESOLVE:</span> “They don't know who's under the mask. This is my fresh start.”
              </p>
            </div>
          )}
        </div>

        {/* Bottom Scrubber */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-6 mb-2 h-0.5 bg-white/10 md:mx-10 overflow-hidden">
            <div
              className="h-full bg-[#00B4D8] shadow-[0_0_8px_#00B4D8]"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
          <div className="mx-6 flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 md:mx-10">
            <span>MANHATTAN GIRDER PATROL // 5K UHD</span>
            <span className="hidden sm:inline">POLICE SCANNER MONITORING</span>
            <span className="animate-bounce">Scroll ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
};
