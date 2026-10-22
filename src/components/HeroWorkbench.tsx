import React, { useState, useRef } from 'react';
import { SpiderHeroMeta } from '../types';
import { soundEngine } from '../services/soundEngine';
import {
  Wrench,
  FlaskConical,
  Camera,
  Zap,
  Sparkles,
  Music,
  Flame,
  Volume2,
  Biohazard,
  Sliders,
  Gauge,
  Eye,
  EyeOff,
} from 'lucide-react';

interface HeroWorkbenchProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onToggleSymbiote: () => void;
}

export const HeroWorkbench: React.FC<HeroWorkbenchProps> = ({
  hero,
  isSymbioteSurge,
  onToggleSymbiote,
}) => {
  // 1. Peter Parker Alchemy & Bugle
  const [activePeterTab, setActivePeterTab] = useState<'formula' | 'darkroom'>('formula');
  const [polyurethane, setPolyurethane] = useState(74);
  const [nanotubes, setNanotubes] = useState(65);
  const [osmoticGel, setOsmoticGel] = useState(48);
  const [photoFlash, setPhotoFlash] = useState(false);
  const [customHeadline, setCustomHeadline] = useState('SPIDER-MAN: HERO OR MENACE?!');
  const [splatActive, setSplatActive] = useState(false);

  // 2. Miles Morales Bio-Electric
  const [milesCharge, setMilesCharge] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [isCamouflaged, setIsCamouflaged] = useState(false);
  const chargeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 3. Gwen Drum Beats
  const [gwenActivePad, setGwenActivePad] = useState<string | null>(null);

  // 4. Noir Match Strike
  const [matchLit, setMatchLit] = useState(false);

  // 5. Venom Tendrils
  const [biomassFeed, setBiomassFeed] = useState(82);

  // 6. 2099 Glitch
  const [glitchFactor, setGlitchFactor] = useState(0);

  // Miles Charge Handlers
  const startMilesCharge = () => {
    setIsCharging(true);
    soundEngine.playVenomBlast(0.4);
    chargeTimerRef.current = setInterval(() => {
      setMilesCharge((prev) => {
        const next = Math.min(100, prev + 5);
        if (next % 25 === 0) soundEngine.playVenomBlast(next / 100);
        return next;
      });
    }, 45);
  };

  const releaseMilesCharge = () => {
    setIsCharging(false);
    if (chargeTimerRef.current) clearInterval(chargeTimerRef.current);
    if (milesCharge > 20) {
      soundEngine.playVenomBlast(milesCharge / 100);
    }
    setMilesCharge(0);
  };

  // Peter Photo Snap
  const snapPhoto = () => {
    soundEngine.playPhotoShutter();
    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 200);
  };

  // Gwen Pad Trigger
  const triggerGwenBeat = (type: 'kick' | 'snare' | 'hihat' | 'synth') => {
    soundEngine.playGwenBeat(type);
    setGwenActivePad(type);
    setTimeout(() => setGwenActivePad(null), 250);
  };

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#080A15] p-6 sm:p-10 shadow-2xl overflow-hidden">
      {/* Background Halftone */}
      <div className="absolute inset-0 comic-halftone opacity-10 pointer-events-none" />

      {/* Workbench Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-hero-primary bg-white/5 px-3 py-1 rounded-full border border-white/10 mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>{hero.earthDesignation} // SIGNATURE MECHANIC ARSENAL</span>
          </div>
          <h2 className="font-comic text-3xl sm:text-4xl text-white tracking-wide">
            {hero.alias.toUpperCase()} <span className="text-hero-primary">WORKBENCH &amp; LAB</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            {hero.signatureMechanic} — Test bespoke interactive physics, audio synthesizers, and dimensional equipment.
          </p>
          {isSymbioteSurge && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-[10px] font-mono text-red-400 uppercase tracking-widest animate-pulse">
              <Flame className="w-3 h-3 text-red-500" />
              <span>Global Klyntar Infection Surge Active</span>
            </div>
          )}
        </div>

        {/* Peter Tab Switcher */}
        {hero.id === 'spiderman' && (
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 self-start md:self-auto font-mono text-xs">
            <button
              onClick={() => {
                soundEngine.playHudClick();
                setActivePeterTab('formula');
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                activePeterTab === 'formula'
                  ? 'bg-[#00B4D8] text-black font-bold shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>WEB ALCHEMY</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playHudClick();
                setActivePeterTab('darkroom');
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                activePeterTab === 'darkroom'
                  ? 'bg-[#E23636] text-white font-bold shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>DAILY BUGLE</span>
            </button>
          </div>
        )}
      </div>

      {/* WORKBENCH CONTENT ACCORDING TO HERO */}
      <div className="relative z-10">
        {/* ======================================================== */}
        {/* 1. PETER PARKER (EARTH-616) */}
        {/* ======================================================== */}
        {hero.id === 'spiderman' && activePeterTab === 'formula' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 bg-[#0B0E1D] p-6 rounded-2xl border border-white/10 space-y-4">
              <span className="text-xs font-mono uppercase text-[#00B4D8] flex items-center gap-1.5 mb-2">
                <Sliders className="w-4 h-4" /> Polymer Web Fluid Mixing Console
              </span>

              {/* Sliders */}
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
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Carbon Nanotube Cross-Linking:</span>
                  <span className="text-[#00B4D8] font-bold">{nanotubes}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={nanotubes}
                  onChange={(e) => {
                    setNanotubes(Number(e.target.value));
                    soundEngine.playChemicalBubble();
                  }}
                  className="w-full accent-[#00B4D8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-300">Osmotic Gel Surface Viscosity:</span>
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
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    soundEngine.playWebShoot();
                    setSplatActive(true);
                    setTimeout(() => setSplatActive(false), 1400);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E23636] to-[#00B4D8] text-white font-mono font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>TEST FIRE WEB CARTRIDGE</span>
                </button>

                {splatActive && (
                  <span className="font-comic text-xl text-[#00B4D8] animate-bounce">
                    THWIP! ANCHORED!
                  </span>
                )}
              </div>
            </div>

            {/* Readout */}
            <div className="lg:col-span-6 bg-[#0B0E1D] p-6 rounded-2xl border border-white/10 font-mono text-xs space-y-4">
              <span className="text-xs uppercase text-zinc-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" /> Physical Tolerances
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase block">TENSILE STRENGTH:</span>
                  <strong className="text-base text-white">{(85000 + polyurethane * 600 + nanotubes * 400).toLocaleString()} PSI</strong>
                </div>
                <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase block">SHEAR RETENTION:</span>
                  <strong className="text-base text-cyan-400">{(20 + osmoticGel * 0.75).toFixed(1)}% ELASTIC</strong>
                </div>
                <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase block">AUTO-DISSOLVE:</span>
                  <strong className="text-base text-yellow-400">{Math.round(45 + (100 - polyurethane) * 0.4)} MIN</strong>
                </div>
                <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase block">CHAMBER LOAD:</span>
                  <strong className="text-base text-emerald-400">OPTIMAL (40/40)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {hero.id === 'spiderman' && activePeterTab === 'darkroom' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 bg-[#0B0E1D] p-6 rounded-2xl border border-white/10 space-y-4">
              <span className="text-xs font-mono uppercase text-[#E23636] flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> Daily Bugle 35mm Press Shutter
              </span>
              <div>
                <label className="text-xs font-mono text-zinc-300 block mb-1">Headline Scoop:</label>
                <input
                  type="text"
                  value={customHeadline}
                  onChange={(e) => setCustomHeadline(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#E23636]"
                />
              </div>
              <button
                onClick={snapPhoto}
                className="w-full py-3.5 rounded-xl bg-[#E23636] hover:bg-[#c92828] text-white font-comic text-lg tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition"
              >
                <Camera className="w-5 h-5" />
                <span>SNAP HEADLINE PHOTO!</span>
              </button>
            </div>

            <div className="lg:col-span-7 relative rounded-2xl bg-[#EFE9D9] text-[#1A1A1A] p-6 shadow-2xl border-4 border-[#1A1A1A] select-none">
              {photoFlash && <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90" />}
              <div className="border-b-4 border-[#1A1A1A] pb-2 mb-3 text-center">
                <h3 className="font-comic text-4xl text-[#1A1A1A] leading-none uppercase">DAILY BUGLE</h3>
                <span className="text-[10px] font-mono tracking-widest text-[#555]">PUBLISHER: J. JONAH JAMESON</span>
              </div>
              <h4 className="font-comic text-2xl uppercase tracking-tight text-[#1A1A1A] leading-tight mb-3">
                {customHeadline}
              </h4>
              <p className="text-xs font-serif leading-relaxed text-[#2B2B2B]">
                "Once again, this masked menace is terrorizing Manhattan! Bugle photographers caught him high above Queens. The police are baffled, but the Bugle demands answers!" — J.J.J.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. MILES MORALES (EARTH-1610) */}
        {/* ======================================================== */}
        {hero.id === 'miles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 bg-[#0B0E1D] p-6 rounded-2xl border border-yellow-500/30 space-y-5">
              <span className="text-xs font-mono uppercase text-yellow-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Bio-Electric Capacitor Charge
              </span>
              <p className="text-xs text-zinc-300 font-mono">
                Press and hold to store high-voltage bio-electricity, then release to unleash a full EMP Venom Blast!
              </p>

              <button
                onPointerDown={startMilesCharge}
                onPointerUp={releaseMilesCharge}
                onPointerLeave={releaseMilesCharge}
                className={`w-full py-5 rounded-2xl font-comic text-2xl tracking-wider transition-all transform active:scale-95 shadow-2xl flex items-center justify-center space-x-3 border-2 ${
                  isCharging
                    ? 'bg-yellow-500 text-black border-yellow-300 shadow-[0_0_50px_rgba(250,204,21,0.9)] scale-105'
                    : 'bg-black/80 text-yellow-400 border-yellow-500/60 hover:bg-yellow-500/20'
                }`}
              >
                <Zap className={`w-6 h-6 ${isCharging ? 'animate-bounce fill-black' : 'fill-yellow-400'}`} />
                <span>{isCharging ? `CHARGING (${milesCharge}%) ... RELEASE TO FIRE!` : 'HOLD TO CHARGE VENOM BLAST'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playCamouflage();
                  setIsCamouflaged(!isCamouflaged);
                }}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border transition-all flex items-center space-x-2 ${
                  isCamouflaged
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                    : 'bg-black/60 border-white/15 text-zinc-400 hover:text-white'
                }`}
              >
                {isCamouflaged ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4" />}
                <span>{isCamouflaged ? 'DISENGAGE CAMOUFLAGE' : 'ACTIVATE INVISIBILITY'}</span>
              </button>
            </div>

            <div className="lg:col-span-6 bg-[#0B0E1D] p-6 rounded-2xl border border-white/10 font-mono text-xs space-y-4">
              <span className="text-xs uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Voltaic Output
              </span>
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">MAX POTENTIAL:</span>
                  <strong className="text-yellow-400">50,000 VOLTS</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">STEALTH REFRACTION:</span>
                  <strong className="text-cyan-400">{isCamouflaged ? '100% INVISIBLE' : '0% (VISIBLE)'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">CANON DISCHARGE:</span>
                  <strong className="text-emerald-400">READY</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. SPIDER-GWEN (EARTH-65) */}
        {/* ======================================================== */}
        {hero.id === 'gwen' && (
          <div className="bg-[#0B0E1D] p-6 rounded-2xl border border-pink-500/30 space-y-5">
            <span className="text-xs font-mono uppercase text-[#F43F5E] flex items-center gap-1.5">
              <Music className="w-4 h-4" /> The Mary Janes Drum-Line Synthesizer
            </span>
            <p className="text-xs text-zinc-300 font-mono">
              Click the drum beat pads to trigger procedural synth beats and acoustic shockwaves:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { type: 'kick' as const, label: 'KICK DRUM', color: '#F43F5E' },
                { type: 'snare' as const, label: 'SNARE HIT', color: '#2DD4BF' },
                { type: 'hihat' as const, label: 'HI-HAT CHIP', color: '#FACC15' },
                { type: 'synth' as const, label: 'NEON CHORD', color: '#A855F7' },
              ].map((pad) => (
                <button
                  key={pad.type}
                  onClick={() => triggerGwenBeat(pad.type)}
                  style={{
                    borderColor: gwenActivePad === pad.type ? pad.color : 'rgba(255,255,255,0.1)',
                    backgroundColor: gwenActivePad === pad.type ? `${pad.color}33` : 'rgba(0,0,0,0.6)',
                  }}
                  className="py-8 rounded-2xl border-2 font-comic text-xl text-white tracking-wide transition-all transform active:scale-95 shadow-lg flex flex-col items-center justify-center gap-2"
                >
                  <Music className="w-5 h-5" style={{ color: pad.color }} />
                  <span>{pad.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. SPIDER-MAN 2099 (EARTH-928) */}
        {/* ======================================================== */}
        {hero.id === 'spider2099' && (
          <div className="bg-[#0B0E1D] p-6 rounded-2xl border border-red-500/30 space-y-4">
            <span className="text-xs font-mono uppercase text-[#FF0055] flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Alchemax Hard-Light &amp; Temporal Rift Stabilizer
            </span>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => {
                  soundEngine.play2099Glitch();
                  setGlitchFactor((p) => p + 1);
                }}
                className="px-6 py-3 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-mono text-xs font-bold transition active:scale-95 shadow-lg"
              >
                TEST TEMPORAL GLITCH BURST
              </button>
              <button
                onClick={() => soundEngine.playLaserWeb()}
                className="px-6 py-3 rounded-xl bg-cyan-600/80 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition active:scale-95 shadow-lg"
              >
                FIRE HARD-LIGHT LASER WEBBING
              </button>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Temporal Rift Stabilized: <strong className="text-emerald-400">100%</strong> · Glitch Anomaly Count: {glitchFactor}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. SPIDER-NOIR (EARTH-90214) */}
        {/* ======================================================== */}
        {hero.id === 'spidernoir' && (
          <div className="bg-[#0B0E1D] p-6 rounded-2xl border border-white/10 space-y-4">
            <span className="text-xs font-mono uppercase text-[#F59E0B] flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> 1933 Great Depression Match-Strike
            </span>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => {
                  soundEngine.playNoirMatchStrike();
                  setMatchLit(true);
                  setTimeout(() => setMatchLit(false), 2000);
                }}
                className="px-6 py-3 rounded-xl bg-amber-500/30 hover:bg-amber-500/40 border border-amber-500 text-amber-200 font-mono text-xs font-bold transition active:scale-95 shadow-lg flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>STRIKE DETECTIVE MATCH</span>
              </button>
              <button
                onClick={() => soundEngine.playNoirTypewriter()}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold transition active:scale-95 shadow-lg"
              >
                TAP TYPEWRITER CRIME DOSSIER
              </button>
            </div>
            {matchLit && (
              <p className="text-xs font-mono text-amber-300 animate-pulse">
                "The match flares... illuminating shadow mobsters in the Harlem alleyway."
              </p>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. VENOM & CARNAGE (KLYNTAR HIVE) */}
        {/* ======================================================== */}
        {(hero.id === 'venom' || hero.id === 'carnage') && (
          <div className="bg-[#0B0E1D] p-6 rounded-2xl border border-purple-500/30 space-y-4">
            <span className="text-xs font-mono uppercase text-purple-400 flex items-center gap-1.5">
              <Biohazard className="w-4 h-4" /> Klyntar Biomass Feeding &amp; Roar
            </span>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => {
                  soundEngine.playSymbioteRoar();
                  setBiomassFeed((prev) => Math.min(100, prev + 5));
                }}
                className="px-6 py-3 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-500 text-purple-200 font-mono text-xs font-bold transition active:scale-95 shadow-xl flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span>UNLEASH BEAST ROAR</span>
              </button>
              <button
                onClick={() => {
                  soundEngine.playSymbioteTendril();
                  setBiomassFeed((prev) => Math.min(100, prev + 2));
                }}
                className="px-6 py-3 rounded-xl bg-black/60 hover:bg-black border border-white/20 text-white font-mono text-xs font-bold transition active:scale-95"
              >
                FLING VISCOUS TENDRIL
              </button>
              <button
                onClick={onToggleSymbiote}
                className={`px-6 py-3 rounded-xl border font-mono text-xs font-bold transition active:scale-95 flex items-center gap-2 ${
                  isSymbioteSurge
                    ? 'bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>{isSymbioteSurge ? 'PURGE SYMBIOTE SURGE' : 'TRIGGER KLYNTAR INFECTION'}</span>
              </button>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Biomass Mass: <strong className="text-purple-400">{biomassFeed}% INTEGRITY</strong>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. SPIDER-PUNK (EARTH-138) */}
        {/* ======================================================== */}
        {hero.id === 'spiderpunk' && (
          <div className="bg-[#0B0E1D] p-6 rounded-2xl border border-pink-500/30 space-y-4">
            <span className="text-xs font-mono uppercase text-[#EC4899] flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> 15,000-Watt Overdriven Guitar Distortion Fuzz
            </span>
            <button
              onClick={() => soundEngine.playPunkDistortion()}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#EAB308] text-black font-comic text-xl font-black tracking-wider transition-all transform active:scale-95 shadow-2xl"
            >
              STRUM ANARCHY GUITAR POWER CHORD!!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
