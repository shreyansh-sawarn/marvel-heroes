import React, { useRef, useEffect, useState } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { VenomBlastShockwave } from '../spiderman/VenomBlastShockwave';
import { LivingSymbioteCanvas } from '../spiderman/LivingSymbioteCanvas';
import {
  Zap,
  Paintbrush,
  Sparkles,
  Wind,
  Globe,
  Biohazard,
} from 'lucide-react';

interface MilesExperienceProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onOpenSelector: () => void;
  onToggleSymbiote: () => void;
}

export const MilesMoralesExperience: React.FC<MilesExperienceProps> = ({
  hero,
  isSymbioteSurge,
  onOpenSelector,
  onToggleSymbiote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graffitiCanvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [is12Fps, setIs12Fps] = useState(true);
  const [sprayColor, setSprayColor] = useState('#EF4444');
  const [sprayCount, setSprayCount] = useState(0);
  const [isSpraying, setIsSpraying] = useState(false);

  // Inverted Brooklyn Leap of Faith Scrollytelling Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const img = new Image();
    img.src = '/assets/miles_hero.png';

    const bgImg = new Image();
    bgImg.src = '/assets/nyc_skyline.jpg';

    let lastDrawTime = 0;
    const targetFps = is12Fps ? 12 : 60;
    const frameInterval = 1000 / targetFps;

    const render = (time: number) => {
      animId = requestAnimationFrame(render);

      if (time - lastDrawTime < frameInterval) return;
      lastDrawTime = time;

      ctx.clearRect(0, 0, width, height);

      // Deep Brooklyn Twilight or Abyssal Klyntar Atmosphere
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (isSymbioteSurge) {
        grad.addColorStop(0, '#040108');
        grad.addColorStop(0.4, '#130224');
        grad.addColorStop(0.7, '#240438');
        grad.addColorStop(1, '#050209');
      } else {
        grad.addColorStop(0, '#0A0518');
        grad.addColorStop(0.4, '#1C062E');
        grad.addColorStop(0.7, '#2D0A46');
        grad.addColorStop(1, '#05060E');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Inverted City Backdrop (What's Up Danger)
      if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = isSymbioteSurge ? 0.2 : 0.35;
        // Invert vertically so skyscrapers hang from the top of the sky
        ctx.translate(width / 2, height * 0.35);
        ctx.scale(1, -1);
        const bgScale = Math.max(width / bgImg.naturalWidth, (height * 0.7) / bgImg.naturalHeight);
        const bw = bgImg.naturalWidth * bgScale;
        const bh = bgImg.naturalHeight * bgScale;
        ctx.drawImage(bgImg, -bw / 2, -bh / 2, bw, bh);
        ctx.restore();
      }

      // Chromatic Glitch Offset
      const glitchX = (Math.random() - 0.5) * (scrollProgress > 0.4 ? 12 : 4);
      const glitchY = (Math.random() - 0.5) * (scrollProgress > 0.4 ? 12 : 4);

      // Stylized inverted high-rise silhouettes
      ctx.save();
      const buildingCount = 16;
      const bWidth = width / buildingCount;
      for (let i = 0; i < buildingCount; i++) {
        const bHeight = 160 + Math.sin(i * 1.4) * 110 + scrollProgress * 120;
        ctx.fillStyle = isSymbioteSurge ? '#05040B' : '#070914';
        ctx.fillRect(i * bWidth + glitchX, 0, bWidth - 4, bHeight);

        // Windows with neon cyan and yellow or corrupted purple/crimson lights
        ctx.fillStyle = isSymbioteSurge
          ? (i % 2 === 0 ? 'rgba(168, 85, 247, 0.65)' : 'rgba(239, 68, 68, 0.6)')
          : (i % 2 === 0 ? 'rgba(250, 204, 21, 0.45)' : 'rgba(6, 182, 212, 0.45)');
        for (let wy = 20; wy < bHeight - 20; wy += 24) {
          ctx.fillRect(i * bWidth + 8 + glitchX, wy, 5, 10);
          ctx.fillRect(i * bWidth + 18 + glitchX, wy, 5, 10);
        }
      }
      ctx.restore();

      // Draw Miles diving upside-down (Proportionally scaled to viewport)
      const centerX = width / 2;
      const centerY = height * 0.48 + Math.sin(scrollProgress * Math.PI) * 50;
      const milesScale = 0.95 + scrollProgress * 0.25;

      // Draw Living Symbiote Tendrils Erupting from Miles
      if (isSymbioteSurge) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const tendrilCount = 10;
        for (let t = 0; t < tendrilCount; t++) {
          const angle = (t / tendrilCount) * Math.PI * 2 + time * 0.0018;
          const len = 120 + Math.sin(time * 0.003 + t) * 45;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          const cpx = Math.cos(angle + 0.6) * (len * 0.7);
          const cpy = Math.sin(angle + 0.6) * (len * 0.7);
          const endX = Math.cos(angle) * len;
          const endY = Math.sin(angle) * len;
          ctx.quadraticCurveTo(cpx, cpy, endX, endY);
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 5;
          ctx.shadowColor = '#A855F7';
          ctx.shadowBlur = 25;
          ctx.stroke();

          // Obsidian inner core
          ctx.strokeStyle = '#05020A';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (img.complete && img.naturalWidth > 0) {
        const targetHeight = Math.min(height * 0.68, 580);
        const ratio = targetHeight / img.naturalHeight;
        const renderW = img.naturalWidth * ratio;
        const renderH = targetHeight;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(milesScale, milesScale);

        // Chromatic split (Spider-Verse 3D Comic Halftone Offset)
        ctx.globalAlpha = 0.5;
        ctx.drawImage(img, -renderW / 2 + glitchX * 2.5, -renderH / 2 + glitchY * 2.5, renderW, renderH);
        ctx.drawImage(img, -renderW / 2 - glitchX * 2.5, -renderH / 2 - glitchY * 2.5, renderW, renderH);

        ctx.globalAlpha = 1.0;
        ctx.shadowColor = isSymbioteSurge ? '#A855F7' : '#FACC15';
        ctx.shadowBlur = isSymbioteSurge ? 55 : (scrollProgress > 0.3 ? 35 : 15);
        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);

        // Symbiote Infestation Surge Shade Overlay
        if (isSymbioteSurge) {
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = 'rgba(147, 51, 234, 0.28)';
          ctx.fillRect(-renderW / 2, -renderH / 2, renderW, renderH);
          ctx.restore();
        }

        ctx.restore();
      } else {
        // High-impact SVG/Canvas procedural silhouette fallback if image loading
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(milesScale, milesScale);

        // Bio-Electric Aura
        ctx.beginPath();
        ctx.arc(0, 0, 90, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 30;
        ctx.fill();

        // Stylized Inverted Diving Mask Silhouette
        ctx.fillStyle = '#090A10';
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Red Web Pattern Lines
        ctx.beginPath();
        ctx.moveTo(0, -75);
        ctx.lineTo(0, 75);
        ctx.moveTo(-50, 0);
        ctx.lineTo(50, 0);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Angular White Lenses
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-12, -15);
        ctx.lineTo(-35, -5);
        ctx.lineTo(-15, 20);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(12, -15);
        ctx.lineTo(35, -5);
        ctx.lineTo(15, 20);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Bio-Electric Lightning Arcs sparking from Miles
      if (scrollProgress > 0.25 || isSymbioteSurge) {
        ctx.save();
        ctx.strokeStyle = isSymbioteSurge ? '#A855F7' : '#FACC15';
        ctx.lineWidth = 3;
        ctx.shadowColor = isSymbioteSurge ? '#A855F7' : '#FACC15';
        ctx.shadowBlur = 20;

        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          let lx = centerX + (Math.random() - 0.5) * 80;
          let ly = centerY + (Math.random() - 0.5) * 80;
          ctx.moveTo(lx, ly);
          for (let step = 0; step < 5; step++) {
            lx += (Math.random() - 0.5) * 60;
            ly += (Math.random() - 0.5) * 60;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [is12Fps, isSymbioteSurge, scrollProgress]);

  // Scroll listener for sticky dive
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = rect.height - window.innerHeight;
      if (totalH > 0) {
        setScrollProgress(Math.max(0, Math.min(1, -rect.top / totalH)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Graffiti Canvas Painting Logic
  const handleGraffitiPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isSpraying) return;
    const canvas = graffitiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Airbrush spray effect
    const radius = 18;
    for (let i = 0; i < 30; i++) {
      const offsetX = (Math.random() - 0.5) * radius * 2;
      const offsetY = (Math.random() - 0.5) * radius * 2;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fillStyle = sprayColor;
      ctx.globalAlpha = 0.35;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    setSprayCount((c) => c + 1);
  };

  return (
    <div className="relative text-white">
      {/* 1. STICKY INVERTED LEAP OF FAITH CHAPTER */}
      <div ref={containerRef} className="relative h-[250vh] w-full bg-[#090A14]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Comic Halftone Overlay */}
          <div className="absolute inset-0 comic-halftone-yellow opacity-25 pointer-events-none" />

          {/* Symbiote Vignette when Surge is active */}
          {isSymbioteSurge && (
            <div className="absolute inset-0 symbiote-vignette pointer-events-none z-10" />
          )}

          {/* TOP HUD: Miles Brooklyn Status */}
          <div className="relative z-20 pt-20 px-6 sm:px-12 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-black/80 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-4 max-w-md shadow-2xl">
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-yellow-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                <span>{hero.earthDesignation} // {hero.universe.toUpperCase()}</span>
              </div>
              <h1 className="font-comic text-4xl sm:text-6xl text-white tracking-wide">
                {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
              </h1>
              <p className="text-xs text-zinc-300 font-mono mt-1">
                {hero.name} · {hero.tagline}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center space-x-2">
              {/* 12 FPS vs 60 FPS Spider-Verse Toggle */}
              <button
                onClick={() => {
                  soundEngine.playHudClick();
                  setIs12Fps(!is12Fps);
                }}
                className={`px-3 py-2 rounded-2xl border text-xs font-mono font-bold transition active:scale-95 flex items-center space-x-1.5 ${
                  is12Fps
                    ? 'bg-yellow-500 text-black border-yellow-400 font-black shadow-[0_0_20px_rgba(250,204,21,0.6)]'
                    : 'bg-black/80 border-white/20 text-zinc-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{is12Fps ? '12 FPS (COMIC)' : '60 FPS (SMOOTH)'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playVenomBlast(0.8);
                }}
                className="px-4 py-2 rounded-2xl bg-black/80 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95"
              >
                <Zap className="w-4 h-4 animate-bounce fill-yellow-400" />
                <span>BIO-DISCHARGE</span>
              </button>

              <button
                onClick={onOpenSelector}
                className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95"
              >
                <Globe className="w-4 h-4 text-yellow-400" />
                <span>WARP</span>
              </button>

              <button
                onClick={onToggleSymbiote}
                className={`px-3 py-2 rounded-2xl border text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95 ${
                  isSymbioteSurge
                    ? 'bg-purple-600/80 border-purple-400 text-white'
                    : 'bg-black/60 border-purple-500/40 text-purple-300 hover:bg-purple-950/60'
                }`}
              >
                <Biohazard className="w-4 h-4" />
                <span>{isSymbioteSurge ? 'PURGE' : 'INFEST'}</span>
              </button>
            </div>
          </div>

          {/* BOTTOM TELEMETRY */}
          <div className="relative z-20 pb-8 px-6 sm:px-12 flex flex-wrap items-end justify-between gap-4 pointer-events-none">
            <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md">
              <span className="text-[10px] font-mono text-yellow-400 uppercase font-bold tracking-widest block mb-1">
                CINEMATIC SEQUENCE //
              </span>
              <div className="font-comic text-2xl text-white tracking-wide">
                {scrollProgress < 0.35
                  ? '01 // ROOFTOP GLASS SHATTER'
                  : scrollProgress < 0.75
                  ? '02 // INVERTED SKYLINE DIVE'
                  : '03 // BIO-ELECTRIC WEB SLINGSHOT'}
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Scroll down to experience the iconic leap of faith from Brooklyn to Manhattan.
              </p>
            </div>

            <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-6 text-xs font-mono">
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">FREEFALL:</span>
                <span className="text-yellow-400 font-extrabold text-base flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5" /> {Math.round(60 + scrollProgress * 120)} MPH
                </span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div>
                <span className="text-zinc-500 uppercase block text-[10px]">BIO-VOLTAIC:</span>
                <span className="text-cyan-400 font-extrabold text-base flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 840 VOLTS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BROOKLYN STREET ART & GRAFFITI TAGGING DECK */}
      <section className="relative z-30 py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-yellow-500/20 bg-black/90 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500">
                <Paintbrush className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-comic text-2xl text-white tracking-wide">
                    BROOKLYN GRAFFITI LAB &amp; STENCIL WORKSHOP
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white/10 text-yellow-300 px-2 py-0.5 rounded">
                    TAGGER MESH
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-400">
                  Click and drag across the subway brick wall to tag with aerosol spray paint.
                </p>
              </div>
            </div>

            {/* Spray Color Palette */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">SPRAY CAN:</span>
              {[
                { color: '#EF4444', label: 'Crimson Red' },
                { color: '#FACC15', label: 'Voltaic Yellow' },
                { color: '#06B6D4', label: 'Cyan Glow' },
                { color: '#A855F7', label: 'Prowler Purple' },
                { color: '#FFFFFF', label: 'Ghost White' },
              ].map((swatch) => (
                <button
                  key={swatch.color}
                  onClick={() => {
                    soundEngine.playHudClick();
                    setSprayColor(swatch.color);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition transform active:scale-90 ${
                    sprayColor === swatch.color ? 'scale-125 border-white shadow-lg' : 'border-black'
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  title={swatch.label}
                />
              ))}
            </div>
          </div>

          {/* Interactive Graffiti Wall Canvas */}
          <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-[#141218] border border-white/10 cursor-crosshair">
            <canvas
              ref={graffitiCanvasRef}
              width={1000}
              height={320}
              onPointerDown={() => setIsSpraying(true)}
              onPointerUp={() => setIsSpraying(false)}
              onPointerLeave={() => setIsSpraying(false)}
              onPointerMove={handleGraffitiPointer}
              className="w-full h-full block"
            />
            <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-zinc-500 bg-black/60 px-3 py-1 rounded-full border border-white/5">
              PAINT PARTICLES: {sprayCount * 30} · DRAG MOUSE TO SPRAY
            </div>
          </div>
        </div>
      </section>

      {/* 3. BIO-ELECTRIC VENOM CHARGER TOY */}
      <section className="relative z-30 py-8 px-4 sm:px-8 max-w-7xl mx-auto">
        <VenomBlastShockwave />
      </section>

      {/* 4. LIVING SYMBIOTE RESONANCE LAB (Active during Symbiote Infestation Surge) */}
      {isSymbioteSurge && (
        <section className="relative z-30 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <LivingSymbioteCanvas
            isSymbioteSurge={isSymbioteSurge}
            onToggleSurge={onToggleSymbiote}
          />
        </section>
      )}
    </div>
  );
};
