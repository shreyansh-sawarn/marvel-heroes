import React, { useState, useRef, useEffect } from 'react';
import { MarvelHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  Zap,
  Activity,
  Flame,
  Crosshair,
  Sliders,
  Shield,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeroInteractiveSystemsProps {
  hero: MarvelHeroMeta;
}

export const HeroInteractiveSystems: React.FC<HeroInteractiveSystemsProps> = ({ hero }) => {
  // 1. Iron Man Arc Reactor
  const [arcCharge, setArcCharge] = useState(0);
  const [isChargingArc, setIsChargingArc] = useState(false);
  const [unibeamFired, setUnibeamFired] = useState(false);
  const chargeIntervalRef = useRef<number | null>(null);

  // 2. Spider-Man Web Lab
  const [webFluidReserve, setWebFluidReserve] = useState(100);
  const [spiderSenseActive, setSpiderSenseActive] = useState(false);
  const spideyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const websRef = useRef<{ x1: number; y1: number; x2: number; y2: number; alpha: number }[]>([]);

  // 3. Captain America Shield Simulator
  const capCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const shieldRef = useRef({ x: 200, y: 150, vx: 0, vy: 0, spinning: false, angle: 0 });

  // 4. Thor Lightning Arena
  const thorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lightningBoltsRef = useRef<{ branches: { x: number; y: number }[]; alpha: number }[]>([]);

  // 5. Wolverine Berserker Rage
  const [clawsDrawn, setClawsDrawn] = useState(false);
  const [rageLevel, setRageLevel] = useState(20);

  // --- IRON MAN CHARGE LOGIC ---
  const handleStartArcCharge = () => {
    setIsChargingArc(true);
    soundEngine.playArcReactorCharge();
    chargeIntervalRef.current = window.setInterval(() => {
      setArcCharge((prev) => {
        if (prev >= 100) {
          if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  const handleReleaseArcCharge = () => {
    if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    setIsChargingArc(false);
    if (arcCharge >= 70) {
      soundEngine.playUnibeam();
      setUnibeamFired(true);
      setTimeout(() => setUnibeamFired(false), 800);
    } else {
      soundEngine.playRepulsor();
    }
    setArcCharge(0);
  };

  // --- SPIDER-MAN WEB CANVAS LOOP ---
  useEffect(() => {
    if (hero.id !== 'spiderman') return;
    const canvas = spideyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw web grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw webs
      for (let i = websRef.current.length - 1; i >= 0; i--) {
        const w = websRef.current[i];
        w.alpha -= 0.015;

        ctx.strokeStyle = `rgba(255, 255, 255, ${w.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00B4D8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(w.x1, w.y1);
        ctx.lineTo(w.x2, w.y2);
        ctx.stroke();

        if (w.alpha <= 0) {
          websRef.current.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [hero.id]);

  const handleSpideyCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = spideyCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    soundEngine.playWebShoot();
    setWebFluidReserve((r) => Math.max(0, r - 5));

    websRef.current.push({
      x1: canvas.width / 2,
      y1: canvas.height,
      x2: x,
      y2: y,
      alpha: 1,
    });
  };

  // --- CAPTAIN AMERICA SHIELD CANVAS LOOP ---
  useEffect(() => {
    if (hero.id !== 'captainamerica') return;
    const canvas = capCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const s = shieldRef.current;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update shield physics
      if (s.spinning) {
        s.x += s.vx;
        s.y += s.vy;
        s.angle += 0.25;

        // Bounce off walls
        const r = 24;
        let bounced = false;
        if (s.x - r < 0) {
          s.x = r;
          s.vx = -s.vx * 0.95;
          bounced = true;
        } else if (s.x + r > canvas.width) {
          s.x = canvas.width - r;
          s.vx = -s.vx * 0.95;
          bounced = true;
        }
        if (s.y - r < 0) {
          s.y = r;
          s.vy = -s.vy * 0.95;
          bounced = true;
        } else if (s.y + r > canvas.height) {
          s.y = canvas.height - r;
          s.vy = -s.vy * 0.95;
          bounced = true;
        }

        if (bounced) {
          soundEngine.playShieldClang();
        }

        // Friction slow down
        s.vx *= 0.99;
        s.vy *= 0.99;
        if (Math.abs(s.vx) < 0.2 && Math.abs(s.vy) < 0.2) {
          s.spinning = false;
        }
      }

      // Render Vibranium Shield Disc
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // Outer Red Ring
      ctx.fillStyle = '#E23636';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();

      // White Ring
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Inner Red Ring
      ctx.fillStyle = '#E23636';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      // Blue Center Disc
      ctx.fillStyle = '#0055A5';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Center Silver Star
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, 0.5);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [hero.id]);

  const handleThrowShield = () => {
    soundEngine.playShieldThrow();
    const s = shieldRef.current;
    s.vx = (Math.random() - 0.5) * 22;
    s.vy = -(Math.random() * 12 + 10);
    s.spinning = true;
  };

  // --- THOR LIGHTNING CANVAS LOOP ---
  useEffect(() => {
    if (hero.id !== 'thor') return;
    const canvas = thorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = lightningBoltsRef.current.length - 1; i >= 0; i--) {
        const bolt = lightningBoltsRef.current[i];
        bolt.alpha -= 0.04;

        ctx.strokeStyle = `rgba(56, 189, 248, ${bolt.alpha})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 18;

        ctx.beginPath();
        bolt.branches.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        if (bolt.alpha <= 0) {
          lightningBoltsRef.current.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [hero.id]);

  const handleSummonLightning = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = thorCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    soundEngine.playThunderClap();

    // Generate jagged lightning branch
    const startX = targetX + (Math.random() - 0.5) * 60;
    const startY = 0;
    const steps = 12;
    const branches = [{ x: startX, y: startY }];

    for (let i = 1; i <= steps; i++) {
      const prog = i / steps;
      const curX = startX + (targetX - startX) * prog + (Math.random() - 0.5) * 35;
      const curY = startY + (targetY - startY) * prog;
      branches.push({ x: curX, y: curY });
    }

    lightningBoltsRef.current.push({ branches, alpha: 1.0 });
  };

  // --- WOLVERINE CLAW TOGGLE ---
  const handleToggleClaws = () => {
    const nextState = !clawsDrawn;
    setClawsDrawn(nextState);
    if (nextState) {
      soundEngine.playClawSnikt();
      setRageLevel((r) => Math.min(100, r + 40));
    } else {
      soundEngine.playWhoosh(1.5);
    }
  };

  return (
    <section className="relative w-full py-20 px-6 md:px-12 bg-black border-t border-white/10 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
              <Sliders className="w-3.5 h-3.5" style={{ color: hero.primaryColor }} />
              <span>{hero.alias} // TACTICAL LAB &amp; WEAPONS BENCH</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              {hero.signatureSystems.systemName}
            </h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
              {hero.signatureSystems.systemDescription}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500 uppercase">SUIT LINEAGE:</span>
            <div className="flex flex-wrap gap-1.5">
              {hero.suits.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 1. IRON MAN INTERACTIVE WORKBENCH */}
        {hero.id === 'ironman' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-950/80 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex flex-col gap-5">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Tri-Beam Chest Arc Reactor (2.84 GW)
              </span>
              <h3 className="text-2xl font-bold uppercase tracking-wide">
                Unibeam Particle Lance Capacitor
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click and hold the Arc Reactor to spin up the repulsor core capacitors. Release above 70% to unleash a full concentrated Unibeam plasma blast!
              </p>

              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-75"
                  style={{
                    width: `${arcCharge}%`,
                    backgroundColor: arcCharge >= 70 ? '#00F0FF' : '#E62429',
                    boxShadow: arcCharge >= 70 ? '0 0 15px #00F0FF' : 'none',
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">CAPACITOR CHARGE:</span>
                <span className="font-bold text-cyan-400">{arcCharge}% GIGAWATTS</span>
              </div>

              <button
                onMouseDown={handleStartArcCharge}
                onMouseUp={handleReleaseArcCharge}
                onTouchStart={handleStartArcCharge}
                onTouchEnd={handleReleaseArcCharge}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono text-sm font-bold tracking-widest uppercase transition active:scale-95 shadow-xl select-none"
              >
                {isChargingArc ? `CHARGING (${arcCharge}%) ... RELEASE TO FIRE!` : 'HOLD TO CHARGE UNIBEAM'}
              </button>
            </div>

            {/* Arc Reactor Visualizer Pod */}
            <div className="relative h-64 bg-black/80 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
              {unibeamFired && (
                <div className="absolute inset-0 bg-cyan-400/30 animate-ping pointer-events-none" />
              )}
              {/* Outer Reactor Ring */}
              <div
                className={`w-36 h-36 rounded-full border-4 border-dashed border-cyan-400/40 flex items-center justify-center transition-transform duration-700 ${
                  isChargingArc ? 'animate-spin' : ''
                }`}
              >
                {/* Inner Core */}
                <div
                  className="w-24 h-24 rounded-full border-2 border-cyan-300 flex items-center justify-center shadow-[0_0_40px_#00F0FF]"
                  style={{
                    backgroundColor: `rgba(0, 240, 255, ${0.2 + arcCharge * 0.008})`,
                  }}
                >
                  <span className="text-xs font-mono font-black text-white">
                    {arcCharge > 0 ? `${arcCharge}%` : 'STARK'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SPIDER-MAN INTERACTIVE WORKBENCH */}
        {hero.id === 'spiderman' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-950/80 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex flex-col gap-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#00B4D8] flex items-center gap-2">
                <Crosshair className="w-4 h-4" />
                Twin Pneumatic Web-Shooter Test Bench
              </span>
              <h3 className="text-2xl font-bold uppercase tracking-wide">
                155,400 PSI Polymer Fluid Ballistics
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click anywhere on the targeting canvas to fire high-tensile elastic web strands with authentic pneumatic sound synthesis.
              </p>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">CARTRIDGE CAPACITY:</span>
                <span className="font-bold text-[#00B4D8]">{webFluidReserve}% FLUID</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    soundEngine.playSpiderSense();
                    setSpiderSenseActive(true);
                    setTimeout(() => setSpiderSenseActive(false), 1500);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{spiderSenseActive ? 'RADAR ACTIVE!' : 'TRIGGER SPIDER-SENSE'}</span>
                </button>
                <button
                  onClick={() => setWebFluidReserve(100)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono transition"
                  title="Reload Cartridges"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>

            {/* Spidey Interactive Web Canvas */}
            <div className="relative h-64 bg-black/90 rounded-2xl border border-white/10 overflow-hidden cursor-crosshair">
              <canvas
                ref={spideyCanvasRef}
                width={480}
                height={256}
                onClick={handleSpideyCanvasClick}
                className="w-full h-full block"
              />
              <div className="absolute top-3 left-3 text-[10px] font-mono text-zinc-500 uppercase pointer-events-none">
                CLICK TO FIRE WEB ANCHOR
              </div>
            </div>
          </div>
        )}

        {/* 3. CAPTAIN AMERICA INTERACTIVE WORKBENCH */}
        {hero.id === 'captainamerica' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-950/80 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex flex-col gap-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#0055A5] flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Wakandan Vibranium Kinetic Damping
              </span>
              <h3 className="text-2xl font-bold uppercase tracking-wide">
                Kinetic Ricochet Simulator
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click the launch button to throw Captain America’s 12-lb Vibranium disc. Listen as it bounces off boundaries with zero kinetic deformation and harmonic ringing clangs!
              </p>

              <button
                onClick={handleThrowShield}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm font-bold tracking-widest uppercase transition active:scale-95 shadow-xl flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>THROW VIBRANIUM SHIELD</span>
              </button>
            </div>

            {/* Cap Shield Physics Arena */}
            <div className="relative h-64 bg-black/90 rounded-2xl border border-white/10 overflow-hidden">
              <canvas
                ref={capCanvasRef}
                width={480}
                height={256}
                className="w-full h-full block"
              />
              <div className="absolute top-3 left-3 text-[10px] font-mono text-zinc-500 uppercase pointer-events-none">
                VIBRANIUM KINETIC BOUNCE CHAMBER
              </div>
            </div>
          </div>
        )}

        {/* 4. THOR INTERACTIVE WORKBENCH */}
        {hero.id === 'thor' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-950/80 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex flex-col gap-5">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Stormbreaker Bifrost Catalyst
              </span>
              <h3 className="text-2xl font-bold uppercase tracking-wide">
                Stellar Lightning Storm Harness
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click anywhere on the celestial tempest arena to channel stellar lightning strikes from the heavens through enchanted Nidavellir Uru metal!
              </p>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">POTENTIAL DIFFERENCE:</span>
                <span className="font-bold text-sky-400">1.21 BILLION VOLTS</span>
              </div>
            </div>

            {/* Thor Lightning Canvas */}
            <div className="relative h-64 bg-black/90 rounded-2xl border border-white/10 overflow-hidden cursor-pointer">
              <canvas
                ref={thorCanvasRef}
                width={480}
                height={256}
                onClick={handleSummonLightning}
                className="w-full h-full block"
              />
              <div className="absolute top-3 left-3 text-[10px] font-mono text-zinc-500 uppercase pointer-events-none">
                CLICK TO SUMMON LIGHTNING STRIKE
              </div>
            </div>
          </div>
        )}

        {/* 5. WOLVERINE INTERACTIVE WORKBENCH */}
        {hero.id === 'wolverine' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-950/80 border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex flex-col gap-5">
              <span className="text-xs font-mono uppercase tracking-widest text-yellow-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                Weapon X Adamantium Extraction &amp; Senses
              </span>
              <h3 className="text-2xl font-bold uppercase tracking-wide">
                Indestructible Retractable Claws
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Toggle Logan’s Adamantium claws to hear the signature razor-sharp &quot;SNIKT!&quot; and watch the Berserker Rage adrenaline meter spike!
              </p>

              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-red-600 transition-all duration-300"
                  style={{ width: `${rageLevel}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">BERSERKER RAGE:</span>
                <span className="font-bold text-red-400">{rageLevel}% ADRENALINE</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleClaws}
                  className={`flex-1 py-4 rounded-2xl font-mono text-sm font-bold tracking-widest uppercase transition active:scale-95 shadow-xl flex items-center justify-center gap-2 ${
                    clawsDrawn
                      ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{clawsDrawn ? 'SHEATHE CLAWS' : 'UNSHEATHE CLAWS (SNIKT!)'}</span>
                </button>
                <button
                  onClick={() => soundEngine.playBerserkerSlash()}
                  className="py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono font-bold uppercase tracking-wider transition"
                >
                  SLASH!
                </button>
              </div>
            </div>

            {/* Wolverine Claws Visualizer */}
            <div className="relative h-64 bg-black/80 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
              <div className="flex items-center gap-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-3 rounded-full bg-gradient-to-b from-white via-zinc-400 to-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-300 ${
                      clawsDrawn ? 'h-48' : 'h-8 opacity-20'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute bottom-4 text-[10px] font-mono text-zinc-500 uppercase">
                {clawsDrawn ? 'ADAMANTIUM LATTICE EXTENDED' : 'CLAWS CONCEALED IN FOREARM'}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
