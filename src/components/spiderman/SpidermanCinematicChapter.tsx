import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SpidermanHudFrame } from '../ui/SpidermanHudFrame';

export const SpidermanCinematicChapter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const leapImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const leap = new Image();
    leap.src = '/assets/spidey_leap_raw.jpg';
    leap.onload = () => {
      leapImgRef.current = leap;
      setIsReady(true);
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

    // Single unified photo dive zoom
    const leap = leapImgRef.current;
    if (leap && leap.complete) {
      const zoom = 1.0 + p * 0.08;
      const panY = p * -30 * dpr;
      const rot = Math.sin(p * Math.PI) * 0.02;

      ctx.save();
      ctx.translate(w / 2, h / 2 + panY);
      ctx.rotate(rot);
      ctx.scale(zoom, zoom);

      const imgAspect = leap.naturalWidth / leap.naturalHeight;
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

      ctx.drawImage(leap, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // Atmospheric grading vignette
    const grad = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.35,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.85
    );
    grad.addColorStop(0, 'rgba(10, 10, 14, 0)');
    grad.addColorStop(0.7, 'rgba(8, 8, 12, 0.45)');
    grad.addColorStop(1, 'rgba(5, 5, 8, 0.92)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const progress = Math.min(1, Math.max(0, -rect.top / totalScroll));
      setScrollProgress(progress);
      drawCinematic(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => drawCinematic(scrollProgress), {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', () => drawCinematic(scrollProgress));
    };
  }, [drawCinematic, scrollProgress]);

  useEffect(() => {
    if (isReady) drawCinematic(0);
  }, [isReady, drawCinematic]);

  const snapTitle1Opacity = Math.max(
    0,
    Math.min(1, (0.52 - scrollProgress) / 0.12)
  );
  const snapTitle2Opacity = Math.max(
    0,
    Math.min(1, (scrollProgress - 0.48) / 0.12)
  );

  const quote1Opacity = scrollProgress > 0.12 && scrollProgress < 0.38 ? 1 : 0;
  const quote2Opacity =
    scrollProgress >= 0.42 && scrollProgress < 0.65 ? 1 : 0;
  const quote3Opacity =
    scrollProgress >= 0.68 && scrollProgress < 0.92 ? 1 : 0;

  return (
    <section
      id="cinematic-chapter"
      ref={containerRef}
      className="relative w-full h-[400vh] bg-[#0A0A0C] border-t border-white/5"
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
            CHAPTER 02 // VERTIGO DIVE
          </span>
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#00B4D8] shadow-[0_0_10px_rgba(0,180,216,0.85)]"
          />
        </div>

        {/* Top Right Title — Dual Morph */}
        <div className="pointer-events-none absolute right-4 top-16 left-4 md:left-auto md:right-12 md:top-24 z-10 flex max-w-[44ch] flex-col items-end gap-2 md:gap-3 text-right p-4 md:p-6 rounded-2xl border border-white/10 bg-[#0A0A0C]/80 backdrop-blur-xl shadow-2xl">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 md:px-3.5 md:py-1.5 font-mono text-[9px] md:text-[10px] font-medium uppercase tracking-[0.22em] text-[#00B4D8] backdrop-blur-md"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(0,180,216,0.25)',
            }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00B4D8] shadow-[0_0_10px_rgba(0,180,216,0.85)]" />
            NYC PATROL // POLICE SCANNER LIVE
          </span>

          <div className="relative self-stretch h-20 md:h-28">
            <h2
              className="font-sans text-2xl md:text-5xl lg:text-6xl font-extrabold leading-[0.98] tracking-tighter text-white transition-opacity duration-200"
              style={{ opacity: snapTitle1Opacity }}
            >
              A fresh start.<br />
              <span className="text-[#00B4D8]">Brand New Day.</span>
            </h2>

            <h2
              className="absolute inset-0 font-sans text-2xl md:text-5xl lg:text-6xl font-extrabold leading-[0.98] tracking-tighter text-white transition-opacity duration-200"
              style={{ opacity: snapTitle2Opacity }}
            >
              Friendly Neighborhood<br />
              <span className="text-[#E62429]">Spider-Man.</span>
            </h2>
          </div>

          <p className="max-w-[36ch] font-sans text-xs md:text-sm leading-relaxed text-zinc-300 hidden sm:block">
            Peter Parker diving through the Manhattan skyline. High-viscosity tensile webbing, classic pendulum swing dynamics, and raw street-level instincts.
          </p>
        </div>

        {/* Left Side Quote Cards */}
        {/* Quote 1 */}
        <div
          className="pointer-events-none absolute bottom-20 left-4 md:bottom-auto md:top-[24%] md:left-14 z-20 w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300"
          style={{
            opacity: quote1Opacity,
            transform: `translateY(${(1 - quote1Opacity) * 20}px)`,
          }}
        >
          <div className="p-5 md:p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#00B4D8] block mb-2">
              01 — IDENTITY
            </span>
            <blockquote className="font-sans text-lg md:text-xl font-medium leading-snug tracking-tight text-white">
              “They don't know who's under the mask anymore. And that's exactly why I have to keep fighting.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Peter Parker</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00B4D8]">
                SPIDER-MAN: BRAND NEW DAY
              </span>
            </figcaption>
          </div>
        </div>

        {/* Quote 2 */}
        <div
          className="pointer-events-none absolute bottom-20 left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-14 z-20 w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300"
          style={{
            opacity: quote2Opacity,
            transform: `translateY(${(1 - quote2Opacity) * 20}px)`,
          }}
        >
          <div className="p-5 md:p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E62429] block mb-2">
              02 — STREET PATROL
            </span>
            <blockquote className="font-sans text-lg md:text-xl font-medium leading-snug tracking-tight text-white">
              “Someone has to look out for the little guy. Especially when no one else is looking.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Peter Parker</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E62429]">
                SPIDER-MAN: BRAND NEW DAY
              </span>
            </figcaption>
          </div>
        </div>

        {/* Quote 3 */}
        <div
          className="pointer-events-none absolute bottom-20 left-4 md:bottom-28 md:left-14 z-20 w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300"
          style={{
            opacity: quote3Opacity,
            transform: `translateY(${(1 - quote3Opacity) * 20}px)`,
          }}
        >
          <div className="p-5 md:p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#F3D403] block mb-2">
              03 — RESOLVE
            </span>
            <blockquote className="font-sans text-lg md:text-xl font-medium leading-snug tracking-tight text-white">
              “Whatever comes our way... whatever battle we have raging inside us, we always have a choice. This is my brand new day.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Peter Parker</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#F3D403]">
                SPIDER-MAN: BRAND NEW DAY
              </span>
            </figcaption>
          </div>
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
            <span>SPIDER-VERSE PROTOCOL // PLAYBACK</span>
            <span className="hidden sm:inline">HIGH-ALTITUDE FREEFALL</span>
            <span className="animate-bounce">Scroll ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
};
