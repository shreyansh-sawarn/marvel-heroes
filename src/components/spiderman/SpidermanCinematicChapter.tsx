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
    leap.src = '/assets/scene_leap_16x9.jpg';
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

    // 16:9 Widescreen dive zoom
    const leap = leapImgRef.current;
    if (leap && leap.complete) {
      const zoom = 1.0 + p * 0.08;
      const panY = p * -30 * dpr;
      const rot = Math.sin(p * Math.PI) * 0.02;

      ctx.save();
      ctx.translate(w / 2, h / 2 + panY);
      ctx.rotate(rot);
      ctx.scale(zoom, zoom);

      const imgAspect = leap.naturalWidth / leap.naturalHeight; // 1920 / 1080
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
            Spider-Verse Sync — Live
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
        <div className="pointer-events-none absolute right-6 top-24 z-10 flex max-w-[46ch] flex-col items-end gap-3 text-right md:right-12 md:top-28">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#00B4D8] backdrop-blur-md"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(0,180,216,0.25)',
            }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00B4D8] shadow-[0_0_10px_rgba(0,180,216,0.85)]" />
            THE WEB OF DESTINY
          </span>

          <div className="relative self-stretch h-28 md:h-36">
            <h2
              className="font-sans text-4xl font-extrabold leading-[0.98] tracking-tighter text-white md:text-6xl lg:text-7xl transition-opacity duration-200"
              style={{ opacity: snapTitle1Opacity }}
            >
              What's up,<br />
              <span className="text-[#00B4D8]">Danger?</span>
            </h2>

            <h2
              className="absolute inset-0 font-sans text-4xl font-extrabold leading-[0.98] tracking-tighter text-white md:text-6xl lg:text-7xl transition-opacity duration-200"
              style={{ opacity: snapTitle2Opacity }}
            >
              It's a<br />
              <span className="text-[#E62429]">Leap of Faith.</span>
            </h2>
          </div>

          <p className="max-w-[40ch] font-sans text-xs md:text-sm leading-relaxed text-zinc-400">
            A freefall through the Manhattan skyline. Every leap, every swing is a test of precision, reflexes, and raw determination.
          </p>
        </div>

        {/* Left Side Quote Cards */}
        {/* Quote 1 */}
        <div
          className="pointer-events-none absolute top-[24%] left-6 md:left-14 z-20 w-[380px] max-w-[90vw] transition-all duration-300"
          style={{
            opacity: quote1Opacity,
            transform: `translateY(${(1 - quote1Opacity) * 20}px)`,
          }}
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#00B4D8] block mb-2">
              01 — COURAGE
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “When will I know I'm ready? You won't. It's a leap of faith.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Peter B. Parker</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                INTO THE SPIDER-VERSE
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
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E62429] block mb-2">
              02 — INCLUSION
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “Anyone can wear the mask. You could wear the mask.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Miles Morales</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                ACROSS THE SPIDER-VERSE
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
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#F3D403] block mb-2">
              03 — PURPOSE
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “We're the only ones who can save the city. Let's make it count.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Spider-Man</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                EARTH-616
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
