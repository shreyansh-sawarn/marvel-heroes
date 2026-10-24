import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MarvelHeroMeta, MarvelHeroChapter } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { Activity, Sparkles, ChevronDown, Compass } from 'lucide-react';

interface CinematicCanvasSequencerProps {
  hero: MarvelHeroMeta;
  imagePaths: string[];
}

export const CinematicCanvasSequencer: React.FC<CinematicCanvasSequencerProps> = ({
  hero,
  imagePaths,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const scrollProgressRef = useRef(0);
  const lastCrossedChapterRef = useRef<number>(-1);
  const speedLinesRef = useRef<{ x: number; y: number; length: number; speed: number; alpha: number }[]>([]);

  // Preload images for this hero
  useEffect(() => {
    setIsLoaded(false);
    setLoadedCount(0);
    imagesRef.current = [];

    let count = 0;
    const loadedImages: HTMLImageElement[] = [];

    imagePaths.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        count++;
        setLoadedCount(count);
        loadedImages[idx] = img;
        if (count >= imagePaths.length) {
          imagesRef.current = loadedImages;
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        count++;
        setLoadedCount(count);
        if (count >= imagePaths.length) {
          imagesRef.current = loadedImages;
          setIsLoaded(true);
        }
      };
    });

    // Initialize speed lines
    speedLinesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 15 + 10,
      alpha: Math.random() * 0.4 + 0.1,
    }));
  }, [imagePaths]);

  // Apple-grade Canvas Rendering Loop with Fluid Camera Choreography & Speed Lines
  const drawFrame = useCallback(
    (progress: number) => {
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

      const images = imagesRef.current.filter((img) => img && img.complete && img.naturalWidth > 0);
      if (images.length === 0) return;

      const numScenes = images.length;
      const segment = 1 / Math.max(1, numScenes - 1);
      const sceneIndex = Math.min(numScenes - 2, Math.max(0, Math.floor(progress / segment)));
      const subT = Math.max(0, Math.min(1, (progress - sceneIndex * segment) / segment));

      const imgA = images[sceneIndex] || images[0];
      const imgB = images[sceneIndex + 1] || imgA;

      // Dynamic Camera Motion: Continuous zoom from 1.0 to 1.14
      const baseZoom = 1.0 + progress * 0.14;
      // Camera pan tracks scroll journey smoothly with zero mouse jitter or tilt
      const panY = -progress * 40 * dpr;

      // Helper to draw image with object-fit: cover and stable camera transforms
      const drawCover = (img: HTMLImageElement, alpha: number, scaleMultiplier = 1.0) => {
        if (!img || alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        ctx.translate(w / 2, h / 2 + panY);

        const scale = baseZoom * scaleMultiplier;
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

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      };

      // Continuous cinematic cross-fade with smooth easing
      if (sceneIndex === numScenes - 1 || imgA === imgB) {
        drawCover(imgA, 1.0);
      } else {
        // Hermite smoothstep for butter-smooth transition
        const easeBlend = subT * subT * (3 - 2 * subT);
        drawCover(imgA, 1.0 - easeBlend);
        drawCover(imgB, easeBlend, 1.01);
      }

      // Procedural High-Velocity Speed Lines (Active in Act 2 & 3)
      if (progress > 0.28) {
        const intensity = Math.min(1, (progress - 0.28) / 0.4);
        ctx.save();
        ctx.strokeStyle = hero.primaryColor;
        ctx.lineWidth = 1.5 * dpr;
        ctx.shadowColor = hero.primaryColor;
        ctx.shadowBlur = 8;

        speedLinesRef.current.forEach((line) => {
          line.y += line.speed * (1 + intensity * 2);
          if (line.y > h) {
            line.y = -line.length;
            line.x = Math.random() * w;
          }

          ctx.globalAlpha = line.alpha * intensity * 0.65;
          ctx.beginPath();
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x, line.y + line.length);
          ctx.stroke();
        });
        ctx.restore();
      }

      // Atmospheric Vignette & Contrast Grading
      const vignette = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.35,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.85
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
      vignette.addColorStop(0.65, 'rgba(0, 0, 0, 0.45)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.94)');

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // Hero primary accent glow wash from bottom
      const glow = ctx.createLinearGradient(0, h * 0.68, 0, h);
      glow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      glow.addColorStop(1, `${hero.primaryColor}28`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, h * 0.68, w, h * 0.32);
    },
    [hero.primaryColor]
  );

  // Scroll listener tracking progression through 450vh section
  useEffect(() => {
    let animId: number;

    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const rawProgress = -rect.top / totalScroll;
      const progress = Math.min(1, Math.max(0, rawProgress));
      scrollProgressRef.current = progress;
      setScrollProgress(progress);

      // Audio feedback when crossing chapter thresholds
      const currentChapterIdx = Math.min(
        hero.chapters.length - 1,
        Math.floor(progress * hero.chapters.length)
      );
      if (currentChapterIdx !== lastCrossedChapterRef.current) {
        lastCrossedChapterRef.current = currentChapterIdx;
        soundEngine.playWhoosh(1.2);
      }
    };

    const renderLoop = () => {
      drawFrame(scrollProgressRef.current);
      animId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    renderLoop();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, [drawFrame, hero.chapters.length]);

  // Jump to specific chapter on click
  const scrollToChapter = (index: number) => {
    const el = containerRef.current;
    if (!el) return;
    soundEngine.playHudClick();
    const totalScroll = el.offsetHeight - window.innerHeight;
    const targetP = (index + 0.5) / hero.chapters.length;
    const dest = el.offsetTop + totalScroll * targetP;
    window.scrollTo({ top: dest, behavior: 'smooth' });
  };

  // Helper to compute individual chapter opacity and transform
  const getChapterTransform = (index: number, total: number) => {
    const center = (index + 0.5) / total;
    const span = 1 / total;
    const dist = Math.abs(scrollProgress - center);

    // Fade in when within span, peak at center
    const opacity = Math.max(0, Math.min(1, (span * 0.6 - dist) / (span * 0.35)));
    // Float upward: +40px when entering, 0px at center, -40px when exiting
    const translateY = (center - scrollProgress) * 120;
    // Subtle scale
    const scale = 1.0 - Math.abs(center - scrollProgress) * 0.12;

    return { opacity, translateY, scale, isVisible: opacity > 0.01 };
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[450vh] bg-black text-white"
    >
      {/* STICKY 100vh FULLSCREEN VIEWPORT */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black flex flex-col justify-between p-6 md:p-12 select-none">
        {/* Background 60fps Scrollytelling Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Tactical HUD Corner Brackets */}
        <div className="pointer-events-none absolute left-8 top-24 w-12 h-12 border-t-2 border-l-2 border-white/20" />
        <div className="pointer-events-none absolute right-8 top-24 w-12 h-12 border-t-2 border-r-2 border-white/20" />
        <div className="pointer-events-none absolute left-8 bottom-20 w-12 h-12 border-b-2 border-l-2 border-white/20" />
        <div className="pointer-events-none absolute right-8 bottom-20 w-12 h-12 border-b-2 border-r-2 border-white/20" />

        {/* TOP STATUS BAR: Hero Identity & Telemetry */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-16 pointer-events-none">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: hero.primaryColor }}
            />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              {hero.era} // {hero.team.toUpperCase()}
            </span>
          </div>

          {/* Dynamic Real-Time Telemetry Capsule */}
          <div className="flex items-center gap-3 bg-black/70 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl pointer-events-auto shadow-2xl">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="text-[11px] font-mono text-zinc-300">
              <span className="text-zinc-500">DYNAMIC TELEMETRY: </span>
              <span className="font-bold text-white">
                {Math.round(scrollProgress * 100)}% KINETIC DISCHARGE
              </span>
            </div>
          </div>
        </div>

        {/* CENTER EDITORIAL TYPOGRAPHY: SEPARATE INDEPENDENT CHAPTER OVERLAYS */}
        <div className="relative z-10 max-w-4xl w-full my-auto pointer-events-none">
          {hero.chapters.map((chapter: MarvelHeroChapter, idx: number) => {
            const { opacity, translateY, scale, isVisible } = getChapterTransform(
              idx,
              hero.chapters.length
            );

            if (!isVisible) return null;

            return (
              <div
                key={chapter.id}
                style={{
                  opacity,
                  transform: `translateY(${translateY}px) scale(${scale})`,
                  transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
                }}
                className="flex flex-col gap-6"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono tracking-widest uppercase text-zinc-200 w-fit shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: hero.primaryColor }} />
                  <span>{chapter.stageName}</span>
                </div>

                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white whitespace-pre-line drop-shadow-2xl">
                  {chapter.title}
                </h1>

                <p className="text-zinc-300 text-sm sm:text-lg max-w-xl leading-relaxed drop-shadow-md">
                  {chapter.subtitle}
                </p>

                {/* Floating Glass Quote Card */}
                <div className="mt-2 bg-black/75 backdrop-blur-2xl border border-white/15 p-6 rounded-3xl max-w-lg shadow-2xl pointer-events-auto">
                  <p className="text-sm md:text-base italic text-zinc-200 font-serif leading-snug">
                    {chapter.quote}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-zinc-400 uppercase">
                    <span className="font-bold text-white">{chapter.quoteAuthor}</span>
                    <span style={{ color: hero.primaryColor }}>{chapter.quoteSource}</span>
                  </div>
                </div>

                {/* Live Chapter Telemetry Readout */}
                <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-zinc-300 pt-2">
                  <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                    <span className="text-zinc-500">{chapter.telemetry.labelA}: </span>
                    <strong className="text-white">{chapter.telemetry.valueA}</strong>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                    <span className="text-zinc-500">{chapter.telemetry.labelB}: </span>
                    <strong className="text-white">{chapter.telemetry.valueB}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM HUD: Interactive Chapter Navigation & Progress Scrubber */}
        <div className="relative z-10 flex flex-col gap-3.5 pointer-events-none pb-2">
          {/* Chapter Quick-Jump Buttons */}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1 pointer-events-auto">
            <div className="flex items-center gap-2">
              {hero.chapters.map((ch, idx) => {
                const isActive =
                  Math.min(
                    hero.chapters.length - 1,
                    Math.floor(scrollProgress * hero.chapters.length)
                  ) === idx;
                return (
                  <button
                    key={ch.id}
                    onClick={() => scrollToChapter(idx)}
                    className={`px-3 py-1 rounded-lg border transition text-[11px] uppercase tracking-wider flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white/20 text-white border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                        : 'bg-black/50 text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <span>ACT 0{idx + 1}</span>
                    <span className="hidden sm:inline opacity-70">· {ch.title.split('\n')[0]}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-zinc-400 animate-pulse hidden sm:flex">
              <span>Scroll to scrub</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Apple-style Progress Scrubber Bar */}
          <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${Math.round(scrollProgress * 100)}%`,
                backgroundColor: hero.primaryColor,
                boxShadow: `0 0 16px ${hero.primaryColor}`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-1">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-red-500" />
              <span>{hero.alias} // CINEMATIC SCROLLYTELLING EXPERIENCE</span>
            </span>
            <span>{Math.round(scrollProgress * 100)}% PLAYBACK PROGRESS</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center gap-4">
            <div
              className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: hero.primaryColor, borderTopColor: 'transparent' }}
            />
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              Calibrating {hero.alias} Frame Pipeline ({loadedCount}/{imagePaths.length})
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
