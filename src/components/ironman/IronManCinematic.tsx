import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HudFrame } from '../ui/HudFrame';

const TOTAL_FRAMES = 169;
const getFrameSrc = (index: number) =>
  `/frames2/frame_${String(index + 1).padStart(4, '0')}.jpg`;

export const IronManCinematic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [scrollRatio, setScrollRatio] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Preload all 169 frames for sequence 2
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
        if (count >= TOTAL_FRAMES) {
          setIsReady(true);
        }
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

  const snapTitle1Opacity = Math.max(0, Math.min(1, (0.52 - scrollRatio) / 0.12));
  const snapTitle2Opacity = Math.max(0, Math.min(1, (scrollRatio - 0.48) / 0.12));

  // Quote visibility thresholds on Left side
  const quote1Opacity = scrollRatio > 0.12 && scrollRatio < 0.38 ? 1 : 0;
  const quote2Opacity = scrollRatio >= 0.42 && scrollRatio < 0.65 ? 1 : 0;
  const quote3Opacity = scrollRatio >= 0.68 && scrollRatio < 0.92 ? 1 : 0;

  return (
    <section
      id="cinematic-chapter"
      ref={containerRef}
      className="relative w-full h-[400vh] bg-[#0A0A0B] border-t border-white/5"
    >
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
              'radial-gradient(120% 80% at 50% 90%, transparent 30%, rgba(10,10,11,0.45) 70%, rgba(10,10,11,0.85) 100%)',
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

        {/* Top Telemetry Links */}
        <div className="pointer-events-none absolute left-6 top-16 z-10 flex items-center gap-2 md:left-10 md:top-20">
          <div className="h-px w-8 bg-[#D4A22F]/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
            Flight Log — Archived
          </span>
        </div>
        <div className="pointer-events-none absolute right-6 top-16 z-10 flex items-center gap-3 md:right-10 md:top-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#D4A22F]">
            SEQ {String(currentFrame + 1).padStart(3, '0')} / {TOTAL_FRAMES}
          </span>
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4A22F] shadow-[0_0_10px_rgba(212,162,47,0.85)]"
          />
        </div>

        {/* Right Top Title — The Snap */}
        <div className="pointer-events-none absolute right-6 top-24 z-10 flex max-w-[46ch] flex-col items-end gap-3 text-right md:right-12 md:top-28">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#D4A22F] backdrop-blur-md"
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px -8px rgba(212,162,47,0.25)',
            }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4A22F] shadow-[0_0_10px_rgba(212,162,47,0.85)]" />
            TITAN II // FINAL FRAME
          </span>

          <div className="relative self-stretch h-28 md:h-36">
            <h2
              className="font-sans text-4xl font-extrabold leading-[0.98] tracking-tighter text-white md:text-6xl lg:text-7xl transition-opacity duration-200"
              style={{ opacity: snapTitle1Opacity }}
            >
              I am<br />
              <span className="text-[#D4A22F]">Inevitable.</span>
            </h2>

            <h2
              className="absolute inset-0 font-sans text-4xl font-extrabold leading-[0.98] tracking-tighter text-white md:text-6xl lg:text-7xl transition-opacity duration-200"
              style={{ opacity: snapTitle2Opacity }}
            >
              And I am<br />
              <span className="text-[#D4A22F]">Iron Man.</span>
            </h2>
          </div>

          <p className="max-w-[40ch] font-sans text-xs md:text-sm leading-relaxed text-zinc-400">
            Endgame — the snap heard across the universe. J.A.R.V.I.S. held the last frame so we could rebuild from it.
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
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#D4A22F] block mb-2">
              01 — IGNITION
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “Yeah, I can fly.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Tony Stark</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                IRON MAN — 2008
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
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#D4A22F] block mb-2">
              02 — SYNC
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “The suit and I are one.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Tony Stark</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                IRON MAN 3 — 2013
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
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#D4A22F] block mb-2">
              03 — AFTERMATH
            </span>
            <blockquote className="font-sans text-xl font-medium leading-snug tracking-tight text-white">
              “It's not about how much we lost. It's about how much we have left.”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-sans text-sm text-zinc-300">Tony Stark</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                AVENGERS: ENDGAME — 2019
              </span>
            </figcaption>
          </div>
        </div>

        {/* Bottom Scrubber */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-6 mb-2 h-0.5 bg-white/10 md:mx-10 overflow-hidden">
            <div
              className="h-full bg-[#D4A22F] shadow-[0_0_8px_#D4A22F]"
              style={{ width: `${scrollRatio * 100}%` }}
            />
          </div>
          <div className="mx-6 flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 md:mx-10">
            <span>MARK III // ARCHIVE</span>
            <span className="hidden sm:inline">J.A.R.V.I.S. // PLAYBACK</span>
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
              FLIGHT LOG // RESTORING
            </span>

            <div className="h-1 w-64 bg-white/10 md:w-80 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4A22F] transition-all duration-150 ease-out"
                style={{ width: `${(loadedCount / TOTAL_FRAMES) * 100}%` }}
              />
            </div>

            <p className="font-mono text-xs uppercase tracking-[0.28em] text-zinc-400">
              Rendering Mark III · {Math.floor((loadedCount / TOTAL_FRAMES) * 100)}%
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
