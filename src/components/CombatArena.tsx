import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SpiderHeroId } from '../types';
import { soundEngine } from '../services/soundEngine';
import { Shield, Zap, Sparkles, AlertTriangle, Swords, RotateCcw, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CombatArenaProps {
  activeHeroId: SpiderHeroId;
  isSymbioteSurge: boolean;
}

interface Boss {
  id: 'spot' | 'kingpin' | 'miguel' | 'knull';
  name: string;
  earth: string;
  title: string;
  maxHp: number;
  attackInterval: number;
  color: string;
  accent: string;
  description: string;
  icon: string;
}

const BOSSES: Boss[] = [
  {
    id: 'spot',
    name: 'The Spot',
    earth: 'Earth-1610',
    title: 'Multiversal Void Anomaly',
    maxHp: 1200,
    attackInterval: 3200,
    color: '#000000',
    accent: '#38BDF8',
    description: 'Dr. Johnathan Ohnn. Creates living dark matter portals connecting alternate dimensions.',
    icon: '🌀',
  },
  {
    id: 'kingpin',
    name: 'Wilson Fisk',
    earth: 'Earth-616',
    title: 'Seismic Underworld Baron',
    maxHp: 1800,
    attackInterval: 4000,
    color: '#E2E8F0',
    accent: '#EF4444',
    description: '350 pounds of solid muscle fortified with cybernetic kinetic dampeners.',
    icon: '🥊',
  },
  {
    id: 'miguel',
    name: "Miguel O'Hara",
    earth: 'Earth-928',
    title: 'Temporal Canon Enforcer',
    maxHp: 1500,
    attackInterval: 2800,
    color: '#00F0FF',
    accent: '#FF0055',
    description: 'Leader of the Spider-Society. Uses hard-light laser webbing and talon strikes to preserve canon events.',
    icon: '⚡',
  },
  {
    id: 'knull',
    name: 'Knull',
    earth: 'Abyssal Hive',
    title: 'Lord of the All-Black Necrosword',
    maxHp: 2500,
    attackInterval: 2400,
    color: '#A855F7',
    accent: '#DC2626',
    description: 'Primordial God of the Void and creator of the Klyntar symbiote race. Wields cosmic necrotic blades.',
    icon: '🗡️',
  },
];

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  isSymbiote: boolean;
  damage: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
  vy: number;
  scale: number;
}

interface SpotPortal {
  x: number;
  y: number;
  radius: number;
  angle: number;
  spinSpeed: number;
  linkedX: number;
  linkedY: number;
}

export const CombatArena: React.FC<CombatArenaProps> = ({ isSymbioteSurge }) => {
  const [selectedBossIndex, setSelectedBossIndex] = useState(0);
  const boss = BOSSES[selectedBossIndex];

  // Game state
  const [bossHp, setBossHp] = useState(boss.maxHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [ultimateMeter, setUltimateMeter] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isTelegraphing, setIsTelegraphing] = useState(false);
  const [isStunned, setIsStunned] = useState(false);
  const [gameResult, setGameResult] = useState<'playing' | 'victory' | 'defeat'>('playing');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const portalsRef = useRef<SpotPortal[]>([]);
  const nextTextId = useRef(1);

  // Boss position on canvas
  const bossPosRef = useRef({ x: 400, y: 220, targetX: 400, targetY: 220, bob: 0 });

  // Reset arena on boss change
  const handleReset = useCallback(() => {
    setBossHp(boss.maxHp);
    setPlayerHp(100);
    setUltimateMeter(0);
    setComboCount(0);
    setScore(0);
    setIsTelegraphing(false);
    setIsStunned(false);
    setGameResult('playing');
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    // Initialize Spot Portals if boss is Spot
    if (boss.id === 'spot') {
      portalsRef.current = [
        { x: 180, y: 140, radius: 28, angle: 0, spinSpeed: 0.05, linkedX: 620, linkedY: 300 },
        { x: 620, y: 300, radius: 28, angle: 0, spinSpeed: -0.04, linkedX: 180, linkedY: 140 },
        { x: 260, y: 340, radius: 34, angle: 0, spinSpeed: 0.03, linkedX: 540, linkedY: 130 },
        { x: 540, y: 130, radius: 34, angle: 0, spinSpeed: -0.05, linkedX: 260, linkedY: 340 },
      ];
    } else {
      portalsRef.current = [];
    }
  }, [boss]);

  useEffect(() => {
    handleReset();
  }, [handleReset, selectedBossIndex]);

  // Spawn floating damage text
  const addFloatingText = (text: string, x: number, y: number, color: string = '#FACC15', scale: number = 1) => {
    floatingTextsRef.current.push({
      id: nextTextId.current++,
      text,
      x,
      y,
      alpha: 1,
      color,
      vy: -1.8,
      scale,
    });
  };

  // Web Shot Attack (Click or Q)
  const handleWebShot = useCallback((targetX?: number, targetY?: number) => {
    if (gameResult !== 'playing') return;

    soundEngine.playWebShoot();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = canvas.width / 2;
    const startY = canvas.height - 40;
    const destX = targetX ?? bossPosRef.current.x;
    const destY = targetY ?? bossPosRef.current.y;

    const dx = destX - startX;
    const dy = destY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 16;

    const damage = isSymbioteSurge ? 180 : 95;
    projectilesRef.current.push({
      x: startX,
      y: startY,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      color: isSymbioteSurge ? '#DC2626' : '#38BDF8',
      radius: isSymbioteSurge ? 8 : 5,
      isSymbiote: isSymbioteSurge,
      damage,
    });

    // Recoil particles at launch
    for (let i = 0; i < 6; i++) {
      particlesRef.current.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 4,
        alpha: 1,
        color: isSymbioteSurge ? '#EF4444' : '#E0F2FE',
        size: Math.random() * 3 + 2,
        life: 0,
        maxLife: 20,
      });
    }
  }, [gameResult, isSymbioteSurge]);

  // Miles Venom EMP Blast (W / Space)
  const handleVenomBlast = useCallback(() => {
    if (gameResult !== 'playing') return;

    soundEngine.playVenomBlast(1.2);
    setIsStunned(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const bX = bossPosRef.current.x;
    const bY = bossPosRef.current.y;

    // Shockwave particles
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const speed = Math.random() * 8 + 6;
      particlesRef.current.push({
        x: canvas.width / 2,
        y: canvas.height - 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        alpha: 1,
        color: i % 2 === 0 ? '#FACC15' : '#06B6D4',
        size: Math.random() * 5 + 3,
        life: 0,
        maxLife: 35,
      });
    }

    // Direct boss damage
    const stunDamage = 240;
    setBossHp((prev) => {
      const next = Math.max(0, prev - stunDamage);
      if (next === 0) setGameResult('victory');
      return next;
    });

    setComboCount((c) => c + 2);
    setScore((s) => s + 500);
    setUltimateMeter((m) => Math.min(100, m + 25));
    addFloatingText(`⚡ EMP STUN! -${stunDamage}`, bX, bY - 40, '#FACC15', 1.3);

    // Release stun after 2.2s
    setTimeout(() => {
      setIsStunned(false);
    }, 2200);
  }, [gameResult]);

  // Spider-Sense Reflex Dodge (E / Shift)
  const handleDodge = useCallback(() => {
    if (gameResult !== 'playing') return;

    soundEngine.playSpiderSense();

    if (isTelegraphing) {
      // Perfect counter dodge!
      setIsTelegraphing(false);
      setComboCount((c) => c + 3);
      setScore((s) => s + 800);
      setUltimateMeter((m) => Math.min(100, m + 30));
      addFloatingText('🔥 PERFECT COUNTER DODGE! +800', bossPosRef.current.x, bossPosRef.current.y - 60, '#22C55E', 1.4);

      // Counter strike
      setBossHp((prev) => {
        const next = Math.max(0, prev - 220);
        if (next === 0) setGameResult('victory');
        return next;
      });

      // Sparks
      for (let i = 0; i < 25; i++) {
        particlesRef.current.push({
          x: bossPosRef.current.x,
          y: bossPosRef.current.y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          alpha: 1,
          color: '#22C55E',
          size: Math.random() * 4 + 2,
          life: 0,
          maxLife: 30,
        });
      }
    } else {
      addFloatingText('SWIFT DODGE', bossPosRef.current.x, bossPosRef.current.y + 40, '#94A3B8', 0.9);
    }
  }, [gameResult, isTelegraphing]);

  // Multiverse Ultimate / Canon Shatter (R)
  const handleUltimate = useCallback(() => {
    if (gameResult !== 'playing' || ultimateMeter < 100) return;

    setUltimateMeter(0);
    soundEngine.play2099Glitch();
    soundEngine.playSymbioteRoar();

    // Ultimate particle barrage
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 14 + 4;
        particlesRef.current.push({
          x: bossPosRef.current.x,
          y: bossPosRef.current.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          alpha: 1,
          color: ['#FF0055', '#00F0FF', '#FACC15', '#EC4899', '#A855F7'][i % 5],
          size: Math.random() * 6 + 3,
          life: 0,
          maxLife: 45,
        });
      }
    }

    const ultDmg = 650;
    setBossHp((prev) => {
      const next = Math.max(0, prev - ultDmg);
      if (next === 0) setGameResult('victory');
      return next;
    });

    setComboCount((c) => c + 10);
    setScore((s) => s + 2500);
    addFloatingText(`💥 MULTIVERSE CANON SHATTER! -${ultDmg}`, bossPosRef.current.x, bossPosRef.current.y - 80, '#FF0055', 1.8);
  }, [gameResult, ultimateMeter]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'q' || e.key === 'Q') {
        handleWebShot();
      } else if (e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        handleVenomBlast();
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Shift') {
        e.preventDefault();
        handleDodge();
      } else if (e.key === 'r' || e.key === 'R') {
        handleUltimate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleWebShot, handleVenomBlast, handleDodge, handleUltimate]);

  // Victory celebration trigger
  useEffect(() => {
    if (gameResult === 'victory') {
      soundEngine.playSpiderSense();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#E23636', '#00B4D8', '#F3D403', '#FFFFFF'],
      });
    }
  }, [gameResult]);

  // Boss attack AI loop
  useEffect(() => {
    if (gameResult !== 'playing') return;

    const interval = setInterval(() => {
      if (isStunned) return;

      // Telegraph attack to player
      setIsTelegraphing(true);
      soundEngine.playSpiderSense();

      // Telegraph duration before strike
      setTimeout(() => {
        setIsTelegraphing((currentTelegraph) => {
          if (currentTelegraph) {
            // Player failed to dodge!
            setPlayerHp((prev) => {
              const damage = Math.floor(Math.random() * 15 + 18);
              const next = Math.max(0, prev - damage);
              if (next === 0) setGameResult('defeat');
              return next;
            });
            setComboCount(0);
            addFloatingText('💔 HIT! -20 HP', bossPosRef.current.x, bossPosRef.current.y + 60, '#EF4444', 1.2);
          }
          return false;
        });
      }, 1200);
    }, boss.attackInterval);

    return () => clearInterval(interval);
  }, [boss.attackInterval, gameResult, isStunned]);

  // Canvas render & animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateDimensions();

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Arena Grid Cyber Floor
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Spot portals if present
      portalsRef.current.forEach((portal) => {
        portal.angle += portal.spinSpeed;
        ctx.save();
        ctx.translate(portal.x, portal.y);
        ctx.rotate(portal.angle);

        // Dark void gradient
        const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, portal.radius);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.7, '#0f172a');
        grad.addColorStop(1, '#38bdf8');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, portal.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing portal event horizon
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      });

      // Boss position floating & bobbing
      bossPosRef.current.bob += 0.04;
      const bobOffset = Math.sin(bossPosRef.current.bob) * 10;
      const bX = bossPosRef.current.x;
      const bY = bossPosRef.current.y + bobOffset;

      // Telegraph warning glow
      if (isTelegraphing) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(bX, bY, 85 + Math.sin(Date.now() * 0.02) * 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Spider-Sense exclamation lines above boss
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        for (let i = -2; i <= 2; i++) {
          const angle = (i * 0.25) - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(bX + Math.cos(angle) * 75, bY + Math.sin(angle) * 75);
          ctx.lineTo(bX + Math.cos(angle) * 110, bY + Math.sin(angle) * 110);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Stunned electrical rings
      if (isStunned) {
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 3; i++) {
          const r = 50 + i * 16 + Math.sin(Date.now() * 0.01 + i) * 6;
          ctx.beginPath();
          ctx.arc(bX, bY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Render Boss Core Silhouette
      ctx.save();
      ctx.shadowColor = boss.accent;
      ctx.shadowBlur = 24;

      // Outer aura ring
      const auraGrad = ctx.createRadialGradient(bX, bY, 15, bX, bY, 65);
      auraGrad.addColorStop(0, boss.color);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(bX, bY, 65, 0, Math.PI * 2);
      ctx.fill();

      // Main Boss Avatar Disc
      ctx.fillStyle = '#090D16';
      ctx.strokeStyle = boss.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(bX, bY, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Boss Icon Emoji
      ctx.font = '38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(boss.icon, bX, bY);
      ctx.restore();

      // Projectiles update & render
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const p = projectilesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;

        // Check Spot portal deflection
        if (boss.id === 'spot') {
          for (const portal of portalsRef.current) {
            const pdx = p.x - portal.x;
            const pdy = p.y - portal.y;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < portal.radius) {
              p.x = portal.linkedX;
              p.y = portal.linkedY;
              p.vx = -p.vx * 1.1;
              p.vy = -p.vy * 1.1;
              soundEngine.play2099Glitch();
              break;
            }
          }
        }

        // Draw projectile
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Projectile tail line
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.radius * 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5);
        ctx.stroke();
        ctx.restore();

        // Boss collision check
        const cdx = p.x - bX;
        const cdy = p.y - bY;
        const distToBoss = Math.sqrt(cdx * cdx + cdy * cdy);

        if (distToBoss < 52) {
          // HIT!
          const dmg = p.damage;
          setBossHp((prev) => {
            const next = Math.max(0, prev - dmg);
            if (next === 0) setGameResult('victory');
            return next;
          });

          setComboCount((c) => c + 1);
          setScore((s) => s + dmg * 2);
          setUltimateMeter((m) => Math.min(100, m + 8));

          // Impact sparks
          for (let k = 0; k < 12; k++) {
            particlesRef.current.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              alpha: 1,
              color: p.color,
              size: Math.random() * 4 + 2,
              life: 0,
              maxLife: 20,
            });
          }

          addFloatingText(p.isSymbiote ? `🩸 -${dmg}` : `THWIP! -${dmg}`, p.x, p.y - 20, p.color, 1.1);

          // Remove projectile
          projectilesRef.current.splice(i, 1);
          continue;
        }

        // Remove if offscreen
        if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
          projectilesRef.current.splice(i, 1);
        }
      }

      // Particles update & render
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;
        pt.alpha = 1 - pt.life / pt.maxLife;

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (pt.life >= pt.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Floating texts update & render
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y += ft.vy;
        ft.alpha -= 0.025;

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = `bold ${Math.round(18 * ft.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();

        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [boss, isTelegraphing, isStunned]);

  // Click on canvas to shoot web directly towards mouse pointer
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleWebShot(x, y);
  };

  const hpPercent = Math.round((bossHp / boss.maxHp) * 100);

  return (
    <section className="relative w-full min-h-screen py-16 px-4 md:px-8 bg-zinc-950 text-white flex flex-col items-center justify-center overflow-hidden border-t border-zinc-800">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-zinc-950 to-black pointer-events-none" />

      {/* Header & Boss Selection */}
      <div className="relative z-10 max-w-5xl w-full text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono tracking-widest uppercase mb-3">
          <Swords className="w-3.5 h-3.5 text-red-400 animate-spin" />
          Multiverse Crisis Combat Arena
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
          Arcade <span className="text-red-500">Showdown</span>
        </h2>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mt-2">
          Harness your multiversal web alchemy, bio-electric capacitors, and matrix reflexes. Click the arena or use hotkeys to eliminate multiverse threats!
        </p>

        {/* Boss Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {BOSSES.map((b, idx) => {
            const isSelected = idx === selectedBossIndex;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBossIndex(idx)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl font-mono text-xs md:text-sm tracking-wider uppercase transition-all duration-200 border ${
                  isSelected
                    ? 'bg-zinc-800 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-105'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span className="text-base">{b.icon}</span>
                <span>{b.name}</span>
                <span className="text-[10px] text-zinc-500 hidden sm:inline">{b.earth}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Combat Card */}
      <div className="relative z-10 max-w-5xl w-full bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
        {/* Boss Status Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{boss.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg md:text-xl text-white tracking-wide">{boss.name}</h3>
                  <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                    {boss.earth}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{boss.title}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-sm md:text-base font-bold text-red-400">
                {bossHp} / {boss.maxHp} HP
              </span>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{hpPercent}% VITALITY</p>
            </div>
          </div>

          {/* Segmented HP Progress Bar */}
          <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                hpPercent < 25 ? 'bg-red-600 animate-pulse' : hpPercent < 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Live Combat Canvas */}
        <div className="relative w-full h-[420px] md:h-[480px] bg-black/90 rounded-2xl overflow-hidden border border-zinc-800 cursor-crosshair">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full block"
          />

          {/* Spider-Sense Telegraph Banner */}
          {isTelegraphing && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-600/90 text-white font-mono font-black text-xs md:text-sm tracking-widest uppercase px-5 py-2 rounded-full border border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-bounce flex items-center gap-2 pointer-events-none">
              <AlertTriangle className="w-4 h-4 text-yellow-300 animate-spin" />
              INCOMING HEAVY STRIKE! PRESS [SHIFT / E] TO DODGE!
            </div>
          )}

          {/* Stunned Banner */}
          {isStunned && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-black font-mono font-black text-xs md:text-sm tracking-widest uppercase px-5 py-2 rounded-full border border-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.8)] flex items-center gap-2 pointer-events-none">
              <Zap className="w-4 h-4 fill-current" />
              BOSS DISRUPTED & PARALYZED! STRIKE FREELY!
            </div>
          )}

          {/* HUD Overlay Stats (Top Left) */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
            <div className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              SCORE: <span className="text-white font-bold">{score}</span>
            </div>
            {comboCount > 1 && (
              <div className="font-mono text-sm font-black text-yellow-400 tracking-wider">
                {comboCount}x COMBO! {comboCount >= 8 ? '🔥 UNSTOPPABLE!' : comboCount >= 4 ? 'AMAZING!' : 'GREAT!'}
              </div>
            )}
          </div>

          {/* HUD Overlay Player Health (Bottom Left) */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-zinc-950/80 px-3.5 py-2 rounded-xl border border-zinc-800 pointer-events-none">
            <Shield className={`w-4 h-4 ${playerHp < 30 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">SUIT INTEGRITY</div>
              <div className="font-mono text-xs font-bold text-white">{playerHp}%</div>
            </div>
          </div>

          {/* Ultimate Meter (Bottom Right) */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-zinc-950/80 px-3.5 py-2 rounded-xl border border-zinc-800 pointer-events-none">
            <Sparkles className={`w-4 h-4 ${ultimateMeter >= 100 ? 'text-pink-400 animate-bounce' : 'text-zinc-500'}`} />
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">MULTIVERSE CANON [R]</div>
              <div className="w-24 h-2 bg-zinc-900 rounded-full overflow-hidden mt-1 border border-zinc-800">
                <div
                  className={`h-full transition-all duration-200 ${
                    ultimateMeter >= 100 ? 'bg-gradient-to-r from-pink-500 via-cyan-400 to-yellow-400 animate-pulse' : 'bg-pink-500'
                  }`}
                  style={{ width: `${ultimateMeter}%` }}
                />
              </div>
            </div>
          </div>

          {/* Victory Overlay */}
          {gameResult === 'victory' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-3xl mb-3 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                🏆
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
                ANOMALY NEUTRALIZED!
              </h3>
              <p className="text-zinc-400 text-sm max-w-md mt-2">
                You successfully defended the multiverse timeline against {boss.name}. Canon event stabilized!
              </p>
              <div className="font-mono text-yellow-400 text-lg font-bold my-4">
                FINAL SCORE: {score}
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-sm tracking-wider uppercase transition shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                ENGAGE NEXT TIMELINE
              </button>
            </div>
          )}

          {/* Defeat Overlay */}
          {gameResult === 'defeat' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-3xl mb-3 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                💀
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
                CANON RUPTURE DETECTED
              </h3>
              <p className="text-zinc-400 text-sm max-w-md mt-2">
                Your suit suffered catastrophic integrity failure against {boss.name}. Re-synchronize suit telemetry to try again!
              </p>
              <button
                onClick={handleReset}
                className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-sm tracking-wider uppercase transition border border-zinc-700"
              >
                <RotateCcw className="w-4 h-4" />
                REBOOT TIMELINE SIMULATION
              </button>
            </div>
          )}
        </div>

        {/* Action Controls & Hotkey Deck */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleWebShot()}
            disabled={gameResult !== 'playing'}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 transition active:scale-95 disabled:opacity-50 group"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 group-hover:text-white">
              <Crosshair className="w-3.5 h-3.5 text-blue-400" />
              <span>WEB SHOT</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] border border-zinc-700">Q</kbd>
            </div>
            <span className="text-[11px] text-zinc-400">High-velocity adhesive projectile</span>
          </button>

          <button
            onClick={handleVenomBlast}
            disabled={gameResult !== 'playing'}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 transition active:scale-95 disabled:opacity-50 group"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 group-hover:text-white">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>VENOM EMP</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] border border-zinc-700">W / SPACE</kbd>
            </div>
            <span className="text-[11px] text-zinc-400">Bio-electric field paralysis stun</span>
          </button>

          <button
            onClick={handleDodge}
            disabled={gameResult !== 'playing'}
            className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 transition active:scale-95 disabled:opacity-50 group"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 group-hover:text-white">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>REFLEX DODGE</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] border border-zinc-700">E / SHIFT</kbd>
            </div>
            <span className="text-[11px] text-zinc-400">Spider-Sense matrix counter</span>
          </button>

          <button
            onClick={handleUltimate}
            disabled={gameResult !== 'playing' || ultimateMeter < 100}
            className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border transition active:scale-95 group ${
              ultimateMeter >= 100
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 border-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] animate-pulse'
                : 'bg-zinc-800/40 border-zinc-800 text-zinc-500 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CANON ULTIMATE</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] border border-white/20">R</kbd>
            </div>
            <span className="text-[11px] opacity-80">
              {ultimateMeter >= 100 ? 'READY TO STRIKE!' : `${ultimateMeter}% CHARGED`}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
