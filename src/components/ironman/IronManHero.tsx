import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HudFrame } from '../ui/HudFrame';

const TOTAL_FRAMES = 169;
const getFrameSrc = (index: number) =>
  `/frames/frame_${String(index + 1).padStart(4, '0')}.jpg`;

export const IronManHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [scrollRatio, setScrollRatio] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Preload all 169 frames
  useEffect(() => {
    let count = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = () => {
        count++;
        setLoadedCount(count);
        if (count >= TOTAL_FRAMES) {
          setIsReady(true);
        }
      };
      img.onerror = () => {
        count++;
        setLoadedCount(count);
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // Draw frame to canvas
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width * dpr;
    const h = rect.height * dpr;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    // Calculate aspect fit/fill
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = w / h;

    let drawW = w;
    let drawH = h;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAspect > imgAspect) {
      drawW = w;
      drawH = w / imgAspect;
      offsetY = (h - drawH) / 2;
    } else {
      drawH = h;
      drawW = h * imgAspect;
      offsetX = (w - drawW) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
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
      setScrollRatio(progress);

      const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
      setCurrentFrame(frameIdx);
      renderFrame(frameIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => renderFrame(currentFrame), { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', () => renderFrame(currentFrame));
    };
  }, [renderFrame, currentFrame]);

  // Initial draw once ready
  useEffect(() => {
    if (isReady) {
      renderFrame(0);
    }
  }, [isReady, renderFrame]);

  // Quote visibility thresholds
  const quote1Opacity = scrollRatio > 0.15 && scrollRatio < 0.38 ? 1 : 0;
  const quote2Opacity = scrollRatio >= 0.42 && scrollRatio < 0.65 ? 1 : 0;
  const quote3Opacity = scrollRatio >= 0.68 && scrollRatio < 0.92 ? 1 : 0;

  const introOpacity = Math.max(0, 1 - scrollRatio / 0.12);

  return (
    <section ref={containerRef} className="relative w-full h-[400vh] bg-[#0A0A0B]">
      {/* STICKY FULLSCREEN VIEWPORT */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#0A0A0B] will-change-transform">
        {/* Main 3D Sequence Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'contents', transform: 'translateZ(0)' }}
        />

        {/* Cinematic Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 10%, transparent 30%, rgba(10,10,11,0.45) 70%, rgba(10,10,11,0.85) 100%)',
          }}
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
            Telemetry Link — Live
          </span>
        </div>
        <div className="pointer-events-none absolute right-6 top-16 z-10 flex items-center gap-3 md:right-10 md:top-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            Arc Reactor
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D4A22F]">
            {(87.3 + Math.sin(scrollRatio * Math.PI * 2) * 6.7).toFixed(1)}%
          </span>
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4A22F] shadow-[0_0_10px_rgba(212,162,47,0.85)]"
          />
        </div>

        {/* Intro Hero Typography (Fade out on scroll) */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-4 px-6 pb-20 md:px-12 md:pb-24 pointer-events-none transition-all duration-150"
          style={{
            opacity: introOpacity,
            transform: `translateY(${(1 - introOpacity) * 20}px)`,
          }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#D4A22F] backdrop-blur-md"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(212,162,47,0.3)',
            }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4A22F] shadow-[0_0_10px_rgba(212,162,47,0.85)]" />
            MARK LXXXV // STARK INDUSTRIES // ONLINE
          </span>

          <h1 className="font-sans text-5xl font-extrabold leading-[0.95] tracking-tighter text-white md:text-7xl lg:text-8xl">
            I am<br />
            <span className="text-[#D4A22F]">Iron Man.</span>
          </h1>

          <p className="max-w-[44ch] font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
            Mark LXXXV nanotech suit. Arc reactor calibrated. Scroll to engage the high-speed flight diagnostic — J.A.R.V.I.S. is holding on the line.
          </p>
        </div>

        {/* FLOATING STARK QUOTE CARDS (Desktop Right / Mobile Center) */}
        {/* Quote 1: 2008 */}
        <div
          className="pointer-events-none absolute top-[24%] right-6 md:right-14 z-20 w-[380px] max-w-[90vw] transition-all duration-300"
          style={{
            opacity: quote1Opacity,
            transform: `translateY(${(1 - quote1Opacity) * 20}px)`,
          }}
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#D4A22F] block mb-2">
              01 — PROTOCOL IGNITION
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “Sometimes you gotta run before you can walk.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Tony Stark</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#D4A22F]">
                IRON MAN — 2008
              </span>
            </figcaption>
          </div>
        </div>

        {/* Quote 2: 2012 */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-6 md:right-14 z-20 w-[380px] max-w-[90vw] transition-all duration-300"
          style={{
            opacity: quote2Opacity,
            transform: `translateY(${(1 - quote2Opacity) * 20}px)`,
          }}
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#D4A22F] block mb-2">
              02 — NEURAL SYNC
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “Genius. Billionaire. Playboy. Philanthropist.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Tony Stark</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#D4A22F]">
                THE AVENGERS — 2012
              </span>
            </figcaption>
          </div>
        </div>

        {/* Quote 3: 2019 */}
        <div
          className="pointer-events-none absolute bottom-24 right-6 md:bottom-28 md:right-14 z-20 w-[380px] max-w-[90vw] transition-all duration-300"
          style={{
            opacity: quote3Opacity,
            transform: `translateY(${(1 - quote3Opacity) * 20}px)`,
          }}
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-[#121318]/90 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#D4A22F] block mb-2">
              03 — THE ENDGAME
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “Part of the journey is the end.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Tony Stark</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#D4A22F]">
                AVENGERS: ENDGAME — 2019
              </span>
            </figcaption>
          </div>
        </div>

        {/* Bottom Scrubber & Sequence Counter */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-6 mb-2 h-0.5 bg-white/10 md:mx-10 overflow-hidden">
            <div
              className="h-full bg-[#D4A22F] shadow-[0_0_8px_#D4A22F]"
              style={{ width: `${scrollRatio * 100}%` }}
            />
          </div>
          <div className="mx-6 flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 md:mx-10">
            <span>
              SEQ {String(currentFrame + 1).padStart(3, '0')} / {TOTAL_FRAMES}
            </span>
            <span className="hidden sm:inline">J.A.R.V.I.S. // FLIGHT DIAGNOSTIC</span>
            <span className="animate-bounce">Scroll ↓</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {!isReady && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#0A0A0B] px-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#D4A22F]"
              style={{
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(212,162,47,0.3)',
              }}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-[#D4A22F] shadow-[0_0_10px_rgba(212,162,47,0.85)] animate-ping" />
              SUIT UP PROTOCOL // BOOTING
            </span>

            <div className="h-1 w-64 bg-white/10 md:w-80 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4A22F] transition-all duration-150 ease-out"
                style={{ width: `${(loadedCount / TOTAL_FRAMES) * 100}%` }}
              />
            </div>

            <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
              Loading Mark LXXXV · {Math.floor((loadedCount / TOTAL_FRAMES) * 100)}%
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
