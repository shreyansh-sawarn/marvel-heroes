import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Compass } from 'lucide-react';
import { HudFrame } from '../ui/HudFrame';

export const CaptainAmericaCinematic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const scrollRatioRef = useRef(0);

  const isVisibleRef = useRef(false);
  const isDirtyRef = useRef(true);
  const animIdRef = useRef<number | null>(null);

  const imagesRef = useRef<{
    bg?: HTMLImageElement;
    steve?: HTMLImageElement;
    shield?: HTMLImageElement;
  }>({});

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const assets = [
      { key: 'bg', src: '/assets/cap_battlefield_raw.jpg' },
      { key: 'steve', src: '/assets/cap_cinematic_raw.png' },
      { key: 'shield', src: '/assets/cap_shield_raw.png' },
    ];

    let loaded = 0;
    assets.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[key as 'bg' | 'steve' | 'shield'] = img;
        loaded++;
        if (loaded >= assets.length) {
          setIsReady(true);
          isDirtyRef.current = true;
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= assets.length) {
          setIsReady(true);
          isDirtyRef.current = true;
        }
      };
    });
  }, []);

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

    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
    const gyroPanX = mouseRef.current.x * 24 * dpr;
    const gyroPanY = mouseRef.current.y * 16 * dpr;

    const bg = imagesRef.current.bg;
    const steve = imagesRef.current.steve;
    const shield = imagesRef.current.shield;

    // 1. Draw Battlefield Backdrop
    if (bg && bg.complete) {
      ctx.save();
      const bgAspect = bg.naturalWidth / bg.naturalHeight;
      const canvasAspect = w / h;
      let bW = w;
      let bH = h;
      if (canvasAspect > bgAspect) {
        bW = w;
        bH = w / bgAspect;
      } else {
        bH = h;
        bW = h * bgAspect;
      }
      bW *= 1.06;
      bH *= 1.06;
      const bX = (w - bW) / 2 + gyroPanX * 0.3;
      const bY = (h - bH) / 2 + gyroPanY * 0.3;
      ctx.drawImage(bg, bX, bY, bW, bH);
      ctx.restore();
    }

    // 2. Draw Cinematic Steve Rogers
    if (steve && steve.complete) {
      ctx.save();
      const sAspect = steve.naturalWidth / steve.naturalHeight;
      const sH = h * 0.92;
      const sW = sH * sAspect;
      const sX = (w - sW) / 2 + gyroPanX * 0.6;
      const sY = (h - sH) * 0.3 + gyroPanY * 0.6;

      ctx.drawImage(steve, sX, sY, sW, sH);
      ctx.restore();
    }

    // 3. Draw Tactical S.H.I.E.L.D. Ricochet Calculation Vectors
    ctx.save();
    const pt1 = { x: w * 0.2, y: h * 0.7 };
    const pt2 = { x: w * 0.45, y: h * 0.35 };
    const pt3 = { x: w * 0.8, y: h * 0.65 };

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([6 * dpr, 6 * dpr]);

    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    if (progress > 0.15) ctx.lineTo(pt2.x, pt2.y);
    if (progress > 0.5) ctx.lineTo(pt3.x, pt3.y);
    ctx.stroke();

    // Node target rings
    if (progress > 0.15) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(pt2.x, pt2.y, 14 * dpr, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (progress > 0.5) {
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)';
      ctx.beginPath();
      ctx.arc(pt3.x, pt3.y, 18 * dpr, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Kinetic Ricocheting Shield
    if (shield && shield.complete && progress > 0.05) {
      let curX = pt1.x;
      let curY = pt1.y;
      if (progress < 0.2) {
        curX = pt1.x;
        curY = pt1.y;
      } else if (progress < 0.55) {
        const t = (progress - 0.2) / 0.35;
        curX = pt1.x + (pt2.x - pt1.x) * t;
        curY = pt1.y + (pt2.y - pt1.y) * t;
      } else {
        const t = (progress - 0.55) / 0.45;
        curX = pt2.x + (pt3.x - pt2.x) * t;
        curY = pt2.y + (pt3.y - pt2.y) * t;
      }
      const shieldSize = 84 * dpr;
      ctx.save();
      ctx.translate(curX, curY);
      ctx.rotate(progress * 12 * Math.PI);
      ctx.shadowColor = 'rgba(59, 130, 246, 0.7)';
      ctx.shadowBlur = 16 * dpr;
      ctx.drawImage(shield, -shieldSize / 2, -shieldSize / 2, shieldSize, shieldSize);
      ctx.restore();
    }
    ctx.restore();

    // 4. Subtle Vignette
    const vignette = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.4,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.95
    );
    vignette.addColorStop(0, 'rgba(6, 8, 14, 0)');
    vignette.addColorStop(0.7, 'rgba(5, 7, 12, 0.38)');
    vignette.addColorStop(1, 'rgba(3, 4, 8, 0.92)');
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

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[320vh] bg-[#07080D]"
      id="captainamerica-cinematic"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#07080D]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover cursor-default"
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#07080D]/90 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin" />
              <span className="font-mono text-xs text-[#3B82F6] tracking-widest uppercase">
                CALIBRATING SATELLITE HUD...
              </span>
            </div>
          </div>
        )}

        {/* HUD Brackets */}
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

        {/* Tactical Scanner Intercept Pill */}
        <div className="pointer-events-none absolute left-6 bottom-16 md:left-12 md:bottom-20 z-10 max-w-sm">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-[#080B12]/85 backdrop-blur-md shadow-xl">
            <div className="p-2 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/40">
              <Compass className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="flex flex-col gap-0.5 font-mono">
              <span className="text-[9px] uppercase tracking-[0.24em] text-[#3B82F6]">
                TACTICAL BALLISTIC TRAJECTORY
              </span>
              <span className="text-xs text-zinc-300 font-sans">
                Parabolic Ricochet Vector · Zero Recoil Energy Return
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Scrubber */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-6 mb-2 h-0.5 bg-white/10 md:mx-10 overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]"
              style={{ width: `${scrollRatio * 100}%` }}
            />
          </div>
          <div className="mx-6 flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 md:mx-10">
            <span>CHAPTER 2 // STRATEGIC COMMAND</span>
            <span className="hidden sm:inline">VIBRANIUM RICOCHET</span>
            <span className="animate-bounce">Scroll ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
};
