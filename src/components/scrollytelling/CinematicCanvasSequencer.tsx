import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MarvelHeroMeta, MarvelHeroChapter } from '../../types';
import { Activity, Sparkles, ChevronDown } from 'lucide-react';

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
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

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
  }, [imagePaths]);

  // Subtle mouse parallax listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Apple-grade Canvas Rendering Loop
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

      // Mouse smoothing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const numScenes = images.length;
      const segment = 1 / Math.max(1, numScenes - 1);
      const sceneIndex = Math.min(numScenes - 2, Math.floor(progress / segment));
      const subT = Math.max(0, Math.min(1, (progress - sceneIndex * segment) / segment));

      const imgA = images[sceneIndex] || images[0];
      const imgB = images[sceneIndex + 1] || imgA;

      // Camera motion: zoom and parallax pan
      const baseZoom = 1.0 + progress * 0.06;
      const panX = mouseRef.current.x * 20 * dpr;
      const panY = mouseRef.current.y * 12 * dpr;

      // Draw helper with object-fit: cover
      const drawCover = (img: HTMLImageElement, alpha: number, scaleBoost = 1.0) => {
        if (!img || alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        const scale = baseZoom * scaleBoost;
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

        const offsetX = (w - drawW) / 2 + panX;
        const offsetY = (h - drawH) / 2 + panY;

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        ctx.restore();
      };

      // Cross-fade between Scene A and Scene B
      if (sceneIndex === numScenes - 1 || imgA === imgB) {
        drawCover(imgA, 1.0);
      } else {
        drawCover(imgA, 1.0 - subT);
        drawCover(imgB, subT, 1.01);
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
      const glow = ctx.createLinearGradient(0, h * 0.7, 0, h);
      glow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      glow.addColorStop(1, `${hero.primaryColor}25`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
    },
    [hero.primaryColor]
  );

  // Scroll listener tracking progression through 300vh section
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
      setScrollProgress(progress);

      const numChapters = hero.chapters.length;
      const chapterIdx = Math.min(
        numChapters - 1,
        Math.floor(progress * numChapters)
      );
      setActiveChapterIndex(chapterIdx);
    };

    const renderLoop = () => {
      drawFrame(scrollProgress);
      animId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    renderLoop();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, [drawFrame, hero.chapters.length, scrollProgress]);

  const activeChapter: MarvelHeroChapter =
    hero.chapters[activeChapterIndex] || hero.chapters[0];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[320vh] bg-black text-white"
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

          {/* Telemetry Capsule */}
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl pointer-events-auto shadow-2xl">
            <Activity className="w-4 h-4 text-emerald-400" />
            <div className="text-[11px] font-mono text-zinc-300">
              <span className="text-zinc-500">{activeChapter.telemetry.labelA}: </span>
              <span className="font-bold text-white">{activeChapter.telemetry.valueA}</span>
            </div>
          </div>
        </div>

        {/* CENTER EDITORIAL TYPOGRAPHY & STORYTELLING */}
        <div className="relative z-10 max-w-4xl flex flex-col gap-6 pointer-events-none my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono tracking-widest uppercase text-zinc-300 w-fit">
            <Sparkles className="w-3.5 h-3.5" style={{ color: hero.primaryColor }} />
            <span>{activeChapter.stageName}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white whitespace-pre-line drop-shadow-2xl">
            {activeChapter.title}
          </h1>

          <p className="text-zinc-300 text-sm sm:text-lg max-w-xl leading-relaxed drop-shadow-md">
            {activeChapter.subtitle}
          </p>

          {/* Floating Quote Card */}
          <div className="mt-2 bg-black/70 backdrop-blur-xl border border-white/10 p-5 rounded-3xl max-w-lg shadow-2xl pointer-events-auto">
            <p className="text-sm md:text-base italic text-zinc-200 font-serif leading-snug">
              {activeChapter.quote}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] font-mono text-zinc-400 uppercase">
              <span className="font-bold text-white">{activeChapter.quoteAuthor}</span>
              <span style={{ color: hero.primaryColor }}>{activeChapter.quoteSource}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM HUD: Telemetry Ticker & Scroll Scrubber */}
        <div className="relative z-10 flex flex-col gap-3 pointer-events-none pb-2">
          {/* Secondary Telemetry Strip */}
          <div className="hidden sm:flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-zinc-600">{activeChapter.telemetry.labelB}: </span>
                <span className="text-zinc-300 font-bold">{activeChapter.telemetry.valueB}</span>
              </div>
              <div>
                <span className="text-zinc-600">{activeChapter.telemetry.labelC}: </span>
                <span className="text-zinc-300 font-bold">{activeChapter.telemetry.valueC}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-400 animate-pulse">
              <span>Scroll to scrub</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Apple-style Progress Scrubber Bar */}
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${Math.round(scrollProgress * 100)}%`,
                backgroundColor: hero.primaryColor,
                boxShadow: `0 0 12px ${hero.primaryColor}`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-1">
            <span>{hero.alias} // CINEMATIC SCROLLYTELLING</span>
            <span>{Math.round(scrollProgress * 100)}% PLAYBACK</span>
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
