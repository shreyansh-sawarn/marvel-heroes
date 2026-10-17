import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundEngine } from '../../services/soundEngine';
import { Biohazard, Volume2, Zap } from 'lucide-react';

interface LivingSymbioteCanvasProps {
  isSymbioteSurge: boolean;
  onToggleSurge?: () => void;
}

interface Tendril {
  x: number;
  y: number;
  originX: number;
  originY: number;
  length: number;
  targetLength: number;
  angle: number;
  curl: number;
  curlSpeed: number;
  width: number;
  color: string;
}

interface SlimeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const LivingSymbioteCanvas: React.FC<LivingSymbioteCanvasProps> = ({
  isSymbioteSurge,
  onToggleSurge,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sonicFreq, setSonicFreq] = useState(440);
  const [symbioteAgony, setSymbioteAgony] = useState(0); // 0 to 1
  const [feedLevel, setFeedLevel] = useState(78);

  const tendrilsRef = useRef<Tendril[]>([]);
  const particlesRef = useRef<SlimeParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false, isDown: false });

  // Spawn initial tendrils along canvas borders
  const initTendrils = useCallback((width: number, height: number) => {
    const list: Tendril[] = [];
    const count = isSymbioteSurge ? 36 : 18;

    for (let i = 0; i < count; i++) {
      // Pick random edge
      const side = Math.floor(Math.random() * 4);
      let ox = 0;
      let oy = 0;
      let angle = 0;

      if (side === 0) { // top
        ox = Math.random() * width;
        oy = 0;
        angle = Math.PI / 2;
      } else if (side === 1) { // right
        ox = width;
        oy = Math.random() * height;
        angle = Math.PI;
      } else if (side === 2) { // bottom
        ox = Math.random() * width;
        oy = height;
        angle = -Math.PI / 2;
      } else { // left
        ox = 0;
        oy = Math.random() * height;
        angle = 0;
      }

      const colors = isSymbioteSurge
        ? ['#030305', '#0f051d', '#2e1065', '#a855f7', '#dc2626']
        : ['#05070e', '#090d1a', '#1e1b4b', '#38bdf8'];

      list.push({
        x: ox,
        y: oy,
        originX: ox,
        originY: oy,
        length: 20,
        targetLength: 80 + Math.random() * 180,
        angle: angle + (Math.random() - 0.5) * 0.8,
        curl: Math.random() * Math.PI * 2,
        curlSpeed: 0.02 + Math.random() * 0.04,
        width: 6 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    tendrilsRef.current = list;
  }, [isSymbioteSurge]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 480);

    initTendrils(width, height);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 480;
      initTendrils(width, height);
    };

    window.addEventListener('resize', handleResize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear with dark atmospheric fade
      ctx.fillStyle = 'rgba(5, 6, 10, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const targetX = mouseRef.current.isHovering ? mouseRef.current.x : width / 2;
      const targetY = mouseRef.current.isHovering ? mouseRef.current.y : height / 2;

      // Animate Tendrils
      tendrilsRef.current.forEach((t) => {
        // Agony reaction shrinks tendrils
        const shrink = 1 - symbioteAgony * 0.7;

        // Angle towards mouse or default
        const dx = targetX - t.originX;
        const dy = targetY - t.originY;
        const targetAngle = Math.atan2(dy, dx);

        // Interpolate angle towards cursor
        const angleDiff = targetAngle - t.angle;
        t.angle += Math.sin(angleDiff) * (mouseRef.current.isHovering ? 0.04 : 0.01);
        t.curl += t.curlSpeed;

        // Animate length
        t.length += (t.targetLength * shrink - t.length) * 0.05;

        // Draw segmented tentacle
        const segments = 14;
        let currentX = t.originX;
        let currentY = t.originY;
        const segLength = t.length / segments;

        ctx.beginPath();
        ctx.moveTo(currentX, currentY);

        for (let i = 0; i < segments; i++) {
          const progress = i / segments;
          const wave = Math.sin(t.curl + i * 0.4) * (1 - progress) * 16;
          const segAngle = t.angle + (wave * Math.PI) / 180;

          currentX += Math.cos(segAngle) * segLength;
          currentY += Math.sin(segAngle) * segLength;

          ctx.lineTo(currentX, currentY);
        }

        ctx.strokeStyle = t.color;
        ctx.lineWidth = Math.max(1, t.width * (1 - symbioteAgony * 0.5));
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = isSymbioteSurge ? '#A855F7' : '#00B4D8';
        ctx.shadowBlur = isSymbioteSurge ? 12 : 6;
        ctx.stroke();

        // Tip blob
        ctx.beginPath();
        ctx.arc(currentX, currentY, Math.max(2, t.width * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = isSymbioteSurge ? '#FFFFFF' : t.color;
        ctx.fill();
      });

      // Update & Draw Slime Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= 0.015;

        if (p.alpha <= 0) {
          particlesRef.current.splice(idx, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [initTendrils, isSymbioteSurge, symbioteAgony]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.isHovering = true;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    soundEngine.playSymbioteTendril();

    // Spawn burst of viscous slime particles
    const newParticles: SlimeParticle[] = [];
    const color = isSymbioteSurge ? '#A855F7' : '#10B981';

    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      newParticles.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: 2 + Math.random() * 6,
        alpha: 1,
        color: i % 2 === 0 ? '#FFFFFF' : color,
      });
    }

    particlesRef.current.push(...newParticles);
    setFeedLevel((prev) => Math.min(100, prev + 2));
  };

  // Trigger high pitch sonic blast to repel / test symbiote weakness
  const triggerSonicTest = () => {
    soundEngine.playSonicScreech(sonicFreq);
    setSymbioteAgony(1);

    setTimeout(() => {
      const timer = setInterval(() => {
        setSymbioteAgony((prev) => {
          if (prev <= 0.05) {
            clearInterval(timer);
            return 0;
          }
          return prev - 0.05;
        });
      }, 50);
    }, 400);
  };

  return (
    <div className="relative rounded-3xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
      {/* Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-black/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <Biohazard className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-comic text-xl text-white tracking-wide">
                KLYNTAR LIVING SYMBIOTE SIMULATOR
              </span>
              <span className="text-[10px] font-mono font-bold bg-purple-900/60 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-full">
                ORGANIC FLUID PHYSICS
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Interactive organic tendril mesh. Click canvas to provoke symbiotic strikes or test sonic resonance.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <span>BIOMASS INTEGRITY:</span>
            <span className="text-purple-400 font-bold">{feedLevel}%</span>
          </div>
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <span>SONIC VULNERABILITY:</span>
            <span className="text-red-400 font-bold">{Math.round(symbioteAgony * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="relative w-full h-[460px] bg-[#030408] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            mouseRef.current.isHovering = false;
          }}
          onPointerDown={handlePointerDown}
          className="w-full h-full block"
        />

        {/* Ambient Overlay Vignette */}
        <div className="absolute inset-0 pointer-events-none symbiote-vignette opacity-80" />

        {/* Center Prompt Overlay */}
        <div className="absolute top-4 left-6 pointer-events-none bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-zinc-300 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>CURSOR TRACKING ACTIVE · CLICK ANYWHERE TO LASH TENDRILS</span>
        </div>

        {/* Sonic Weakness Control Panel (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-4 max-w-xs shadow-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-yellow-400" /> SONIC TUNING FORK:
            </span>
            <span className="text-yellow-400 font-bold">{sonicFreq} Hz</span>
          </div>

          <input
            type="range"
            min="220"
            max="1760"
            step="20"
            value={sonicFreq}
            onChange={(e) => setSonicFreq(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={triggerSonicTest}
              className="flex-1 py-2 px-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>TEST ACOUSTIC SCREECH</span>
            </button>

            {onToggleSurge && (
              <button
                onClick={onToggleSurge}
                className="py-2 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-300 font-mono text-xs font-bold transition active:scale-95"
              >
                {isSymbioteSurge ? 'PURGE' : 'SURGE'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
