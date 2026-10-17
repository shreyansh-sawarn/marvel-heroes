import React, { useRef, useEffect, useState } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { Crosshair, RefreshCw, Gauge, Zap } from 'lucide-react';

interface WebAnchor {
  x: number;
  y: number;
  radius: number;
  label: string;
}

interface WebStrand {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  sag: number;
  tensileStrength: number;
  alpha: number;
}

interface ComicExclamation {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  scale: number;
  alpha: number;
}

export const WebShooterPhysicsPlayground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fluidPsi, setFluidPsi] = useState(300);
  const [tensileLoad, setTensileLoad] = useState(12.4); // kN
  const [activeFormula, setActiveFormula] = useState<'Standard Poly-Synthetic' | 'Impact Webbing' | 'Electrified Web'>('Standard Poly-Synthetic');
  const [shotCount, setShotCount] = useState(0);

  const strandsRef = useRef<WebStrand[]>([]);
  const burstsRef = useRef<ComicExclamation[]>([]);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Fixed Anchor pegs representing building perches
  const anchorsRef = useRef<WebAnchor[]>([
    { x: 120, y: 80, radius: 14, label: 'CHRYSLER TOWER CORNICE' },
    { x: 380, y: 60, radius: 14, label: 'EMPIRE STATE SPIRE' },
    { x: 650, y: 100, radius: 14, label: 'DAILY BUGLE SIGN' },
    { x: 220, y: 320, radius: 14, label: 'QUEENSBORO GIRDER' },
    { x: 540, y: 340, radius: 14, label: 'BROADWAY WATER TOWER' },
  ]);

  const addComicBurst = (x: number, y: number, text: string) => {
    const colors = ['#E23636', '#F3D403', '#00B4D8', '#FFFFFF'];
    burstsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: 0.5,
      alpha: 1,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 420);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 420;
    };
    window.addEventListener('resize', handleResize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.fillStyle = '#080A12';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Anchor Pegs
      anchorsRef.current.forEach((anchor) => {
        // Pulsing glow
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, anchor.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 180, 216, 0.12)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, anchor.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0B3C5D';
        ctx.strokeStyle = '#00B4D8';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Inner metallic core
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Anchor text label
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(anchor.label, anchor.x - 40, anchor.y + 24);
      });

      // Draw Active Web Strands
      strandsRef.current.forEach((strand) => {
        // Subtle sag physics
        strand.sag = Math.sin(Date.now() * 0.003 + strand.id) * 3;

        ctx.beginPath();
        ctx.moveTo(strand.startX, strand.startY);

        const midX = (strand.startX + strand.endX) / 2;
        const midY = (strand.startY + strand.endY) / 2 + strand.sag + 8;
        ctx.quadraticCurveTo(midX, midY, strand.endX, strand.endY);

        ctx.strokeStyle = `rgba(255, 255, 255, ${strand.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00B4D8';
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Spiral cross-webbing micro-nodes
        const count = 5;
        for (let i = 1; i < count; i++) {
          const t = i / count;
          const px = (1 - t) * (1 - t) * strand.startX + 2 * (1 - t) * t * midX + t * t * strand.endX;
          const py = (1 - t) * (1 - t) * strand.startY + 2 * (1 - t) * t * midY + t * t * strand.endY;

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }
      });

      // Draw Current Dragging Web Line
      if (isDraggingRef.current && dragStartRef.current) {
        ctx.beginPath();
        ctx.moveTo(dragStartRef.current.x, dragStartRef.current.y);
        ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
        ctx.strokeStyle = '#F3D403';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Crosshair reticle
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#E23636';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Comic Popups ("THWIP!")
      burstsRef.current.forEach((b, idx) => {
        b.scale += 0.04;
        b.alpha -= 0.02;

        if (b.alpha <= 0) {
          burstsRef.current.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(b.scale, b.scale);
        ctx.font = 'bold 24px Bangers, sans-serif';
        ctx.fillStyle = b.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.globalAlpha = b.alpha;
        ctx.strokeText(b.text, -20, 0);
        ctx.fillText(b.text, -20, 0);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    dragStartRef.current = { x, y };
    isDraggingRef.current = true;
    mouseRef.current = { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || !dragStartRef.current) return;

    soundEngine.playWebShoot();

    // Add new permanent tensile strand
    const newStrand: WebStrand = {
      id: Date.now(),
      startX: dragStartRef.current.x,
      startY: dragStartRef.current.y,
      endX: mouseRef.current.x,
      endY: mouseRef.current.y,
      sag: 0,
      tensileStrength: 15.2,
      alpha: 0.95,
    };

    strandsRef.current.push(newStrand);

    const words = ['THWIP!', 'SNAP!', 'ZIPPP!', 'TWANG!'];
    const word = words[Math.floor(Math.random() * words.length)];
    addComicBurst(mouseRef.current.x, mouseRef.current.y, word);

    setShotCount((c) => c + 1);
    setFluidPsi((prev) => Math.max(40, prev - 8));
    setTensileLoad((prev) => +(prev + 1.2).toFixed(1));

    isDraggingRef.current = false;
    dragStartRef.current = null;
  };

  const clearWebs = () => {
    soundEngine.playHudClick();
    strandsRef.current = [];
    burstsRef.current = [];
    setFluidPsi(300);
    setTensileLoad(12.4);
    setShotCount(0);
  };

  return (
    <div className="relative rounded-3xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
      {/* Top Diagnostics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-black/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-marvel-red shadow-[0_0_15px_rgba(226,54,54,0.4)]">
            <Crosshair className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-comic text-xl text-white tracking-wide">
                WEB-SHOOTER BALLISTICS &amp; TENSILE LAB
              </span>
              <span className="text-[10px] font-mono font-bold bg-white/10 text-cyan-300 px-2 py-0.5 rounded-full">
                PARKER INDUSTRIES BIO-TECH
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Click and drag to fire high-tensile shear web filaments between skyline anchors.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>FLUID PRESSURE:</span>
            <span className="text-cyan-400 font-bold">{fluidPsi} PSI</span>
          </div>

          <div className="flex items-center space-x-1.5 text-zinc-400">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>LOAD TENSION:</span>
            <span className="text-yellow-400 font-bold">{tensileLoad} kN</span>
          </div>

          <button
            onClick={clearWebs}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-400 hover:text-white transition"
            title="Reset Web Matrix"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Web Canvas */}
      <div className="relative w-full h-[420px] bg-[#070912] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />

        {/* Floating Instruction Banner */}
        <div className="absolute top-4 left-6 pointer-events-none bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-zinc-300 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>CLICK &amp; DRAG TO FIRE TENSION WEBS · TOTAL STRANDS: {shotCount}</span>
        </div>

        {/* Formula Selector (Bottom Left) */}
        <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center space-x-2 text-xs font-mono">
          <span className="text-zinc-500 uppercase text-[10px]">COMPOUND:</span>
          {(['Standard Poly-Synthetic', 'Impact Webbing', 'Electrified Web'] as const).map((form) => (
            <button
              key={form}
              onClick={() => {
                soundEngine.playHudClick();
                setActiveFormula(form);
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeFormula === form
                  ? 'bg-red-500/20 border border-red-500 text-red-300 font-bold'
                  : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {form}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
