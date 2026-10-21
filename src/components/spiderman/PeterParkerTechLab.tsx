import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SpiderHeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  FlaskConical,
  Camera,
  Radio,
  Zap,
  Gauge,
  Sparkles,
  ShieldAlert,
  Play,
  CheckCircle2,
  Award,
  Sliders,
} from 'lucide-react';

interface PeterParkerTechLabProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
}

type LabTab = 'formula' | 'darkroom' | 'spidersense';

export const PeterParkerTechLab: React.FC<PeterParkerTechLabProps> = ({
  hero,
  isSymbioteSurge,
}) => {
  const [activeTab, setActiveTab] = useState<LabTab>('formula');

  // ==========================================
  // TAB 1: WEB FLUID ALCHEMY STATE
  // ==========================================
  const [polyurethane, setPolyurethane] = useState(72);
  const [nanotubes, setNanotubes] = useState(65);
  const [osmoticGel, setOsmoticGel] = useState(48);
  const [piezoAdditive, setPiezoAdditive] = useState(25);

  const tensileCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingString = useRef(false);
  const dragYRef = useRef(0);
  const stringVelocityRef = useRef(0);
  const stringDisplacementRef = useRef(0);

  // Determine current formula preset
  let formulaName = 'Parker Formula #3: Classic High-Tensile Webbing';
  let formulaCode = 'P-616-HT';
  let formulaColor = '#00B4D8';
  let formulaDesc = 'Standard high-yield shear resistance with 120,000 PSI tensile strength and 1.00 hr canonical auto-dissolve.';

  if (piezoAdditive > 65) {
    formulaName = 'Formula #8: Voltaic Taser Webbing';
    formulaCode = 'P-616-VOLT';
    formulaColor = '#FACC15';
    formulaDesc = 'Piezoelectric additives store and release a 50,000V non-lethal stunning shock upon target impact.';
  } else if (osmoticGel > 70) {
    formulaName = 'Formula #5: Impact Cocoon Webbing';
    formulaCode = 'P-616-IMPACT';
    formulaColor = '#E23636';
    formulaDesc = 'Instantaneous pneumatic ballistics; upon air exposure, polymerizes into a dense immobilizing cocoon.';
  } else if (isSymbioteSurge || (nanotubes > 80 && piezoAdditive > 50)) {
    formulaName = 'Formula #11: Sonic-Dissonance Anti-Symbiote Webbing';
    formulaCode = 'P-616-SONIC';
    formulaColor = '#A855F7';
    formulaDesc = 'Infused with piezoelectric micro-tuning crystals vibrating at 880Hz to disrupt Klyntar symbiote bonding.';
  }

  const tensileStrength = Math.round(75000 + polyurethane * 600 + nanotubes * 450);
  const elasticityPct = Math.round(25 + osmoticGel * 0.7);
  const dissolveTimerMin = Math.round(45 + (100 - polyurethane) * 0.45);

  // Interactive Tensile String Spring Physics
  useEffect(() => {
    const canvas = tensileCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let h = (canvas.height = 140);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.clientWidth;
      h = canvas.height = 140;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      // Spring physics
      if (!isDraggingString.current) {
        const k = 0.12; // spring constant
        const damping = 0.88; // damping factor
        const force = -k * stringDisplacementRef.current;
        stringVelocityRef.current = (stringVelocityRef.current + force) * damping;
        stringDisplacementRef.current += stringVelocityRef.current;
      }

      ctx.clearRect(0, 0, w, h);

      // Background guide lines
      ctx.fillStyle = '#060812';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const leftX = 40;
      const rightX = w - 40;
      const centerY = h / 2;
      const midX = w / 2;
      const midY = centerY + stringDisplacementRef.current;

      // Draw anchor pins
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(leftX, centerY, 6, 0, Math.PI * 2);
      ctx.arc(rightX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw Web Strand with quadratic curve
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(leftX, centerY);
      ctx.quadraticCurveTo(midX, midY, rightX, centerY);
      ctx.strokeStyle = formulaColor;
      ctx.lineWidth = Math.max(2, 6 - Math.abs(stringDisplacementRef.current) * 0.05);
      ctx.shadowColor = formulaColor;
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Draw secondary web silk filaments
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(leftX, centerY);
      ctx.quadraticCurveTo(midX, midY + (stringDisplacementRef.current > 0 ? -3 : 3), rightX, centerY);
      ctx.stroke();
      ctx.restore();

      // Display Tension Gauge
      const tensionN = Math.round(Math.abs(stringDisplacementRef.current) * 8.5);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px monospace';
      ctx.fillText(`TENSILE STRAIN: ${(Math.abs(stringDisplacementRef.current) / 45 * 100).toFixed(1)}%`, 45, 25);
      ctx.fillText(`CALCULATED FORCE: ${tensionN} N`, 45, 40);

      if (isDraggingString.current) {
        ctx.fillStyle = formulaColor;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`[PULLING STRAND // RELEASE TO OSCILLATE]`, midX - 110, h - 15);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [formulaColor]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingString.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    dragYRef.current = e.clientY - rect.top;
    soundEngine.playChemicalBubble();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingString.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentY = e.clientY - rect.top;
    const dy = currentY - rect.height / 2;
    // Cap displacement
    const clamped = Math.max(-55, Math.min(55, dy));
    stringDisplacementRef.current = clamped;

    if (Math.abs(clamped) > 50) {
      // Snap string
      isDraggingString.current = false;
      stringDisplacementRef.current = 0;
      soundEngine.playTensileSnap();
    }
  };

  const handlePointerUp = () => {
    if (isDraggingString.current) {
      isDraggingString.current = false;
      stringVelocityRef.current = -stringDisplacementRef.current * 0.45;
      soundEngine.playWebShoot();
    }
  };

  // Test fire web splatter
  const [splatActive, setSplatActive] = useState(false);
  const handleTestFire = () => {
    soundEngine.playWebShoot();
    setSplatActive(true);
    setTimeout(() => setSplatActive(false), 1600);
  };

  // ==========================================
  // TAB 2: DAILY BUGLE DARKROOM STATE
  // ==========================================
  const [photoFlash, setPhotoFlash] = useState(false);
  const [selectedPose, setSelectedPose] = useState<'perch' | 'dive' | 'swing'>('swing');
  const [customHeadline, setCustomHeadline] = useState('SPIDER-MAN: THREAT OR MENACE?!');
  const [jjjMenaceScore, setJjjMenaceScore] = useState(94);
  const [photoScore, setPhotoScore] = useState({ framing: 96, action: 99, lighting: 92 });

  const poseImages: Record<string, string> = {
    perch: '/assets/spidey_crouch_raw.jpg',
    dive: '/assets/spidey_leap_raw.jpg',
    swing: '/assets/spidey_swing_raw.jpg',
  };

  const handleSnapPhoto = () => {
    soundEngine.playPhotoShutter();
    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 200);

    const newFraming = Math.floor(90 + Math.random() * 10);
    const newAction = Math.floor(92 + Math.random() * 8);
    const newLighting = Math.floor(88 + Math.random() * 12);
    setPhotoScore({ framing: newFraming, action: newAction, lighting: newLighting });
    setJjjMenaceScore(Math.floor(75 + Math.random() * 24));
  };

  // ==========================================
  // TAB 3: SPIDER-SENSE REFLEX RADAR CHALLENGE
  // ==========================================
  const [reflexState, setReflexState] = useState<'IDLE' | 'WAITING' | 'TRIGGERED' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [reactionTimeMs, setReactionTimeMs] = useState<number | null>(null);
  const [bestReactionTime, setBestReactionTime] = useState<number | null>(164);
  const triggerTimeRef = useRef(0);
  const reflexTimerRef = useRef<number | null>(null);

  const startReflexTest = () => {
    setReflexState('WAITING');
    setReactionTimeMs(null);
    soundEngine.playHudClick();

    // Random delay between 1.5s and 4.0s
    const delay = 1500 + Math.random() * 2500;
    reflexTimerRef.current = window.setTimeout(() => {
      setReflexState('TRIGGERED');
      triggerTimeRef.current = performance.now();
      soundEngine.playSpiderSense();
    }, delay);
  };

  const handleReflexTrigger = useCallback(() => {
    if (reflexState === 'WAITING') {
      // Early trigger penalty
      if (reflexTimerRef.current) clearTimeout(reflexTimerRef.current);
      setReflexState('FAILED');
      soundEngine.playImpact();
      return;
    }

    if (reflexState === 'TRIGGERED') {
      const now = performance.now();
      const diff = Math.round(now - triggerTimeRef.current);
      setReactionTimeMs(diff);
      setReflexState('SUCCESS');
      soundEngine.playWebShoot();

      if (!bestReactionTime || diff < bestReactionTime) {
        setBestReactionTime(diff);
      }
    }
  }, [reflexState, bestReactionTime]);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (reflexTimerRef.current) clearTimeout(reflexTimerRef.current);
    };
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#070913] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Dynamic Halftone Background Overlay */}
      <div className="absolute inset-0 comic-halftone opacity-15 pointer-events-none" />

      {/* Lab Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-[#00B4D8] bg-[#00B4D8]/10 px-3 py-1 rounded-full border border-[#00B4D8]/20 mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{hero.name.toUpperCase()} BIO-TECH BENCH // HORIZON LABS // {hero.earthDesignation}</span>
          </div>
          <h2 className="font-comic text-3xl sm:text-4xl text-white tracking-wide">
            PARKER BIO-CHEMISTRY &amp; <span className="text-[#E23636]">DAILY BUGLE</span> SUITE
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            Formulate high-tensile shear polymer fluids, inspect microscopic silk cross-links, or snap Pulitzer-grade action photos for J. Jonah Jameson.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 self-start md:self-auto font-mono text-xs">
          <button
            onClick={() => {
              setActiveTab('formula');
              soundEngine.playHudClick();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'formula'
                ? 'bg-[#00B4D8] text-black font-bold shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>WEB ALCHEMY</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('darkroom');
              soundEngine.playHudClick();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'darkroom'
                ? 'bg-[#E23636] text-white font-bold shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>DAILY BUGLE</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('spidersense');
              soundEngine.playHudClick();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
              activeTab === 'spidersense'
                ? 'bg-[#FACC15] text-black font-bold shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SPIDER-SENSE</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WEB FORMULA ALCHEMY & TENSILE STRAND PLAYGROUND */}
      {/* ======================================================== */}
      {activeTab === 'formula' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Chemical Sliders Control Console */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#0B0E1D] p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#00B4D8]" /> Chemical Formula Synthesis
                </span>
                <span className="text-[10px] font-mono text-[#00B4D8] border border-[#00B4D8]/30 px-2 py-0.5 rounded-full bg-[#00B4D8]/10">
                  {formulaCode}
                </span>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                {/* 1. Polyurethane */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300">Polyurethane-B Polymerization:</span>
                    <span className="text-[#00B4D8] font-bold">{polyurethane}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={polyurethane}
                    onChange={(e) => {
                      setPolyurethane(Number(e.target.value));
                      soundEngine.playChemicalBubble();
                    }}
                    className="w-full accent-[#00B4D8] cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 font-sans">
                    Controls structural backbone density &amp; molecular cohesion.
                  </span>
                </div>

                {/* 2. Nanotubes */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300">Carbon Nanotube Cross-Linking:</span>
                    <span className="text-[#00B4D8] font-bold">{nanotubes}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={nanotubes}
                    onChange={(e) => {
                      setNanotubes(Number(e.target.value));
                      soundEngine.playChemicalBubble();
                    }}
                    className="w-full accent-[#00B4D8] cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 font-sans">
                    Amplifies sheer tensile strength against titan-class hydraulic load.
                  </span>
                </div>

                {/* 3. Osmotic Gel */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300">Osmotic Viscosity &amp; Gel Adhesion:</span>
                    <span className="text-[#E23636] font-bold">{osmoticGel}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={osmoticGel}
                    onChange={(e) => {
                      setOsmoticGel(Number(e.target.value));
                      soundEngine.playChemicalBubble();
                    }}
                    className="w-full accent-[#E23636] cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 font-sans">
                    Governs surface micro-suction grip on glass, steel, and concrete.
                  </span>
                </div>

                {/* 4. Piezo-Electric Additive */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300">Piezo-Charge / Micro-Crystals:</span>
                    <span className="text-[#FACC15] font-bold">{piezoAdditive}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={piezoAdditive}
                    onChange={(e) => {
                      setPiezoAdditive(Number(e.target.value));
                      soundEngine.playChemicalBubble();
                    }}
                    className="w-full accent-[#FACC15] cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 font-sans">
                    Allows electric conduction or acoustic resonance disruption.
                  </span>
                </div>
              </div>
            </div>

            {/* Live Formula Badge */}
            <div
              className="p-5 rounded-2xl border transition-all"
              style={{
                borderColor: `${formulaColor}40`,
                backgroundColor: `${formulaColor}0C`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4" style={{ color: formulaColor }} />
                <h3 className="font-comic text-lg text-white tracking-wide">{formulaName}</h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">{formulaDesc}</p>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/10 font-mono text-center">
                <div>
                  <div className="text-[10px] text-zinc-400">TENSILE LIMIT</div>
                  <div className="text-sm font-bold text-white">{tensileStrength.toLocaleString()} PSI</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400">ELASTICITY</div>
                  <div className="text-sm font-bold text-white">{elasticityPct}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400">DISSOLVE</div>
                  <div className="text-sm font-bold text-white">{dissolveTimerMin} MIN</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tensile Testing Caliper Canvas & Fire Button */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="bg-[#0B0E1D] p-6 rounded-2xl border border-white/10 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-400" /> Interactive Tensile Test Bench
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  CLICK &amp; DRAG STRAND TO TEST YIELD
                </span>
              </div>

              {/* Spring Canvas */}
              <div
                className="relative rounded-xl overflow-hidden border border-white/10 cursor-grab active:cursor-grabbing select-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <canvas ref={tensileCanvasRef} className="w-full block" />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
                <button
                  onClick={handleTestFire}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E23636] to-[#00B4D8] text-white font-mono font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition"
                >
                  <Zap className="w-4 h-4" />
                  <span>TEST FIRE WEB CARTRIDGE</span>
                </button>

                <div className="text-xs font-mono text-zinc-400">
                  Cartridge Chamber: <strong className="text-emerald-400">FULL (40/40)</strong>
                </div>
              </div>

              {/* Dynamic Splat Animation */}
              {splatActive && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/20 animate-pulse flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-comic text-xl text-[#00B4D8]">THWIP!</span>
                    <span className="text-xs font-mono text-zinc-300">
                      High-impact web splatter anchored to target surface. Tensile integrity optimal!
                    </span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DAILY BUGLE DARKROOM & FRONT PAGE GENERATOR */}
      {/* ======================================================== */}
      {activeTab === 'darkroom' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Camera Viewfinder Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#0B0E1D] p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#E23636]" /> 35mm Telephoto Viewfinder
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  SHUTTER READY
                </span>
              </div>

              {/* Pose Selection */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-mono text-zinc-300 block">Select Peter's Action Maneuver:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['perch', 'dive', 'swing'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedPose(p);
                        soundEngine.playHudClick();
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono uppercase transition ${
                        selectedPose === p
                          ? 'border-[#E23636] bg-[#E23636]/20 text-white font-bold'
                          : 'border-white/10 text-zinc-400 hover:bg-white/5'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline Input */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-mono text-zinc-300 block">Front-Page Scoop Headline:</label>
                <input
                  type="text"
                  value={customHeadline}
                  onChange={(e) => setCustomHeadline(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E23636]"
                />
              </div>

              {/* Shutter Button */}
              <button
                onClick={handleSnapPhoto}
                className="w-full py-3.5 rounded-xl bg-[#E23636] hover:bg-[#c92828] text-white font-comic text-lg tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(226,54,54,0.5)] active:scale-95 transition"
              >
                <Camera className="w-5 h-5" />
                <span>SNAP PICTURE! (J.J.J. EDITION)</span>
              </button>
            </div>

            {/* Photo Telemetry Ratings */}
            <div className="bg-[#0B0E1D] p-5 rounded-2xl border border-white/10 font-mono text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">ACTION DYNAMICS:</span>
                <strong className="text-white">{photoScore.action}/100</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">OPTICAL FRAMING:</span>
                <strong className="text-white">{photoScore.framing}/100</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">CHOSEN POSE:</span>
                <strong className="text-[#00B4D8] uppercase">{selectedPose}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-zinc-400">J.J. JAMESON'S FURY:</span>
                <strong className="text-[#E23636]">{jjjMenaceScore}% MENACE RATING</strong>
              </div>
            </div>
          </div>

          {/* Daily Bugle Authentic Front Page */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl bg-[#EFE9D9] text-[#1A1A1A] p-6 shadow-2xl border-4 border-[#1A1A1A] overflow-hidden select-none">
              {/* Halftone / Newsprint texture */}
              <div className="absolute inset-0 comic-halftone opacity-10 pointer-events-none" />

              {/* Camera Flash Animation */}
              {photoFlash && (
                <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90 pointer-events-none" />
              )}

              {/* Newspaper Header */}
              <div className="border-b-4 border-[#1A1A1A] pb-3 mb-4 text-center">
                <div className="flex justify-between items-center text-[10px] font-serif uppercase tracking-widest border-b border-[#1A1A1A] pb-1 mb-1 font-bold">
                  <span>NEW YORK'S GREATEST NEWSPAPER</span>
                  <span>PRICE: TEN CENTS</span>
                  <span>LATE CITY FINAL</span>
                </div>
                <h1 className="font-comic text-4xl sm:text-6xl text-[#1A1A1A] tracking-tight leading-none uppercase">
                  DAILY BUGLE
                </h1>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#444] mt-1">
                  PUBLISHER: J. JONAH JAMESON · CHIEF PHOTOGRAPHER: PETER PARKER
                </div>
              </div>

              {/* Main Headline */}
              <h2 className="font-comic text-2xl sm:text-3xl uppercase tracking-tight text-[#1A1A1A] leading-tight mb-4 border-b-2 border-[#1A1A1A] pb-2">
                {customHeadline || 'SPIDER-MAN: THREAT OR MENACE?!'}
              </h2>

              {/* Newspaper Photo with Caption */}
              <div className="relative border-2 border-[#1A1A1A] bg-black mb-4 overflow-hidden max-h-64 flex items-center justify-center">
                <img
                  src={poseImages[selectedPose]}
                  alt="Spider-Man Snapshot"
                  className="w-full object-cover grayscale contrast-125"
                />
                {/* JJJ Stamp */}
                <div className="absolute top-3 right-3 rotate-12 border-2 border-red-700 bg-red-700/20 text-red-700 font-comic text-sm px-2.5 py-0.5 rounded uppercase tracking-wider font-bold">
                  BUGLE EXCLUSIVE
                </div>
              </div>

              {/* Article Snippet & JJJ Editorial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif leading-relaxed text-[#2B2B2B]">
                <div>
                  <p className="font-bold mb-1">BY J. JONAH JAMESON</p>
                  <p>
                    "Once again, our fair city is terrified by this masked menace swinging recklessly through Manhattan! What is he hiding behind that garish red-and-blue mask? The police are baffled, citizens are terrified, and the Bugle demands accountability!"
                  </p>
                </div>
                <div className="border-l sm:border-[#1A1A1A]/30 sm:pl-4">
                  <p className="font-bold mb-1">HORIZON LABS EYEWITNESS</p>
                  <p>
                    "Reports confirm high-tensile micro-filaments discovered along 5th Avenue. Experts note the structural integrity surpasses aerospace titanium, dissolving harmlessly after sixty minutes."
                  </p>
                  <div className="mt-3 text-[10px] font-mono text-zinc-600 bg-black/5 p-2 rounded">
                    PHOTOGRAPHY CREDITS: P. PARKER ($25.00 CASH ADVANCE)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SPIDER-SENSE REFLEX RADAR CHALLENGE */}
      {/* ======================================================== */}
      {activeTab === 'spidersense' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
          {/* Challenge Description & Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#0B0E1D] p-6 rounded-2xl border border-white/10">
              <span className="text-xs font-mono uppercase text-[#FACC15] flex items-center gap-1.5 mb-2">
                <Radio className="w-4 h-4" /> Precognitive Spider-Sense Drill
              </span>
              <h3 className="font-comic text-2xl text-white tracking-wide mb-2">
                TEST YOUR SIXTH SENSE
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans mb-4">
                Peter Parker's spider-sense warns him milliseconds before danger strikes. When the precognitive tingle waves flash yellow and red, click "THWIP DODGE!" instantly!
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-zinc-400">BEST RECORD:</span>
                  <strong className="text-[#FACC15]">{bestReactionTime ? `${bestReactionTime} ms` : '--'}</strong>
                </div>
                <div className="flex justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-zinc-400">LAST ATTEMPT:</span>
                  <strong className="text-white">{reactionTimeMs ? `${reactionTimeMs} ms` : '--'}</strong>
                </div>
              </div>

              {/* Start Button */}
              {reflexState === 'IDLE' || reflexState === 'SUCCESS' || reflexState === 'FAILED' ? (
                <button
                  onClick={startReflexTest}
                  className="w-full mt-6 py-3.5 rounded-xl bg-[#FACC15] text-black font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START REFLEX BENCHMARK</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Interactive Radar Display */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div
              onClick={handleReflexTrigger}
              className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none ${
                reflexState === 'TRIGGERED'
                  ? 'border-[#EF4444] bg-[#EF4444]/20 shadow-[0_0_60px_#EF4444] animate-bounce'
                  : reflexState === 'WAITING'
                  ? 'border-[#FACC15]/40 bg-[#0A0D1E]'
                  : reflexState === 'SUCCESS'
                  ? 'border-emerald-500 bg-emerald-950/30'
                  : 'border-white/20 bg-[#070914]'
              }`}
            >
              {/* Radar Rings */}
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <div className="absolute inset-12 rounded-full border border-white/10" />
              <div className="absolute inset-20 rounded-full border border-white/10" />

              {/* State Content */}
              {reflexState === 'IDLE' && (
                <div className="text-center p-6">
                  <Radio className="w-8 h-8 text-zinc-500 mx-auto mb-2 animate-pulse" />
                  <span className="text-xs font-mono text-zinc-400 block">STANDBY</span>
                  <span className="text-[10px] font-mono text-zinc-500">CLICK START TO COMMENCE</span>
                </div>
              )}

              {reflexState === 'WAITING' && (
                <div className="text-center p-6">
                  <div className="w-6 h-6 rounded-full border-2 border-t-[#FACC15] border-transparent animate-spin mx-auto mb-3" />
                  <span className="text-xs font-mono text-[#FACC15] font-bold block animate-pulse">
                    FOCUSING RADAR...
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">WAIT FOR SPIDER-SENSE TINGLE</span>
                </div>
              )}

              {reflexState === 'TRIGGERED' && (
                <div className="text-center p-6 animate-pulse">
                  <ShieldAlert className="w-12 h-12 text-[#EF4444] mx-auto mb-2" />
                  <span className="font-comic text-4xl text-white tracking-wider block drop-shadow-md">
                    THWIP NOW!!
                  </span>
                  <span className="text-xs font-mono font-bold text-yellow-300">
                    CLICK ANYWHERE OR PRESS SPACE!
                  </span>
                </div>
              )}

              {reflexState === 'SUCCESS' && (
                <div className="text-center p-6">
                  <Award className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <span className="font-comic text-3xl text-emerald-400 block">DODGED!</span>
                  <span className="text-sm font-mono font-bold text-white block mt-1">
                    {reactionTimeMs} ms
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 mt-1 block">
                    {reactionTimeMs && reactionTimeMs < 200
                      ? 'SUPERIOR SPIDER-SENSE!'
                      : 'EXCELLENT ACROBATIC REFLEX'}
                  </span>
                </div>
              )}

              {reflexState === 'FAILED' && (
                <div className="text-center p-6">
                  <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <span className="font-comic text-2xl text-red-400 block">TOO EARLY!</span>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                    FALSE ALARM TRIGGERED. TRY AGAIN.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
