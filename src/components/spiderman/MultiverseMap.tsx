import React, { useRef, useEffect } from 'react';
import { SpiderHeroId } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { Globe, Radio } from 'lucide-react';

interface MultiverseMapProps {
  currentHeroId: SpiderHeroId;
  onSelectHero: (heroId: SpiderHeroId) => void;
  isSymbioteSurge: boolean;
}

interface NodePosition {
  id: SpiderHeroId;
  x: number;
  y: number;
  label: string;
  dimension: string;
  color: string;
}

export const MultiverseMap: React.FC<MultiverseMapProps> = ({
  currentHeroId,
  onSelectHero,
  isSymbioteSurge,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const nodes: NodePosition[] = [
    { id: 'spiderman', x: 0.5, y: 0.5, label: 'Peter Parker', dimension: 'Earth-616 (Prime)', color: '#E23636' },
    { id: 'miles', x: 0.28, y: 0.3, label: 'Miles Morales', dimension: 'Earth-1610', color: '#FACC15' },
    { id: 'gwen', x: 0.72, y: 0.28, label: 'Spider-Gwen', dimension: 'Earth-65', color: '#F43F5E' },
    { id: 'spider2099', x: 0.82, y: 0.65, label: 'Spider-Man 2099', dimension: 'Earth-928', color: '#00F0FF' },
    { id: 'spidernoir', x: 0.18, y: 0.68, label: 'Spider-Man Noir', dimension: 'Earth-90214', color: '#E4E4E7' },
    { id: 'venom', x: 0.38, y: 0.85, label: 'Venom / Klyntar', dimension: 'Klyntar Hive', color: '#10B981' },
    { id: 'carnage', x: 0.62, y: 0.85, label: 'Carnage Psychosis', dimension: 'Red Mutagen', color: '#DC2626' },
    { id: 'spiderpunk', x: 0.5, y: 0.16, label: 'Spider-Punk', dimension: 'Earth-138', color: '#EC4899' },
  ];

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

    let pulse = 0;

    const render = () => {
      pulse += 0.03;
      ctx.fillStyle = '#06070E';
      ctx.fillRect(0, 0, width, height);

      // Spider Web Matrix Lines connecting all nodes to the Center (Peter) and each other
      const centerNode = nodes[0];
      const cx = centerNode.x * width;
      const cy = centerNode.y * height;

      // Draw concentric web rings
      for (let r = 50; r <= 220; r += 45) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.sin(pulse) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = isSymbioteSurge ? 'rgba(168, 85, 247, 0.12)' : 'rgba(0, 180, 216, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Web Radial Spoke Filaments
      nodes.forEach((n) => {
        const nx = n.x * width;
        const ny = n.y * height;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = isSymbioteSurge
          ? 'rgba(168, 85, 247, 0.25)'
          : n.id === currentHeroId
          ? 'rgba(255, 255, 255, 0.4)'
          : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = n.id === currentHeroId ? 2 : 1;
        ctx.stroke();

        // Animated signal packet traveling along web strand
        const packetT = (pulse * 0.4 + n.x) % 1;
        const px = cx + (nx - cx) * packetT;
        const py = cy + (ny - cy) * packetT;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = isSymbioteSurge ? '#A855F7' : n.color;
        ctx.fill();
      });

      // Draw Nodes
      nodes.forEach((n) => {
        const nx = n.x * width;
        const ny = n.y * height;
        const isCurrent = n.id === currentHeroId;

        // Outer glow
        ctx.beginPath();
        ctx.arc(nx, ny, isCurrent ? 18 : 12, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? `${n.color}44` : 'rgba(255, 255, 255, 0.05)';
        ctx.fill();

        // Node Circle
        ctx.beginPath();
        ctx.arc(nx, ny, isCurrent ? 10 : 7, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? '#FFFFFF' : n.color;
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = isCurrent ? '#FFFFFF' : '#94A3B8';
        ctx.fillText(n.dimension, nx - 35, ny + (isCurrent ? 26 : 22));
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentHeroId, isSymbioteSurge]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const width = canvas.width;
    const height = canvas.height;

    // Check hit test against nodes
    nodes.forEach((n) => {
      const nx = n.x * width;
      const ny = n.y * height;
      const dist = Math.hypot(clickX - nx, clickY - ny);
      if (dist < 30) {
        soundEngine.playHudClick();
        onSelectHero(n.id);
      }
    });
  };

  return (
    <div className="relative rounded-3xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-black/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-comic text-xl text-white tracking-wide">
                THE WEB OF LIFE &amp; DESTINY: MULTIVERSE MAP
              </span>
              <span className="text-[10px] font-mono font-bold bg-white/10 text-cyan-300 px-2 py-0.5 rounded-full">
                COSMIC WEAVE // E-001
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Interactive cosmic constellation connecting all Spider Totems and Klyntar strains across time and space. Click nodes to jump reality.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>CANON ANOMALIES: 0 DETECTED</span>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative w-full h-[420px] bg-[#06070E] cursor-pointer">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full block" />

        <div className="absolute bottom-4 left-6 pointer-events-none bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-zinc-400">
          CLICK ANY DIMENSIONAL NODE TO INITIALIZE REALITY JUMP
        </div>
      </div>
    </div>
  );
};
