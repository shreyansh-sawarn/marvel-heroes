import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { Navbar } from './components/ui/Navbar';
import { SpidermanHeroSequencer } from './components/spiderman/SpidermanHeroSequencer';
import { SpidermanCinematicChapter } from './components/spiderman/SpidermanCinematicChapter';
import { SpidermanSystems } from './components/spiderman/SpidermanSystems';
import { IronManHero } from './components/ironman/IronManHero';
import { IronManCinematic } from './components/ironman/IronManCinematic';
import { IronManSystems } from './components/ironman/IronManSystems';
import { CaptainAmericaHero } from './components/captainamerica/CaptainAmericaHero';
import { CaptainAmericaCinematic } from './components/captainamerica/CaptainAmericaCinematic';
import { CaptainAmericaSystems } from './components/captainamerica/CaptainAmericaSystems';
import { HeroSelector } from './components/ui/HeroSelector';
import { BackgroundParticles } from './components/ui/BackgroundParticles';
import { HeroTransitionCurtain } from './components/ui/HeroTransitionCurtain';
import {
  ArrowUp,
  Sparkles,
  Flame,
  Eye,
  Shield,
  Zap,
  Play,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { soundEngine } from './services/soundEngine';

export const App: React.FC = () => {
  const [activeHero, setActiveHero] = useState<'spiderman' | 'ironman' | 'captainamerica'>('spiderman');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHeroSelectorOpen, setIsHeroSelectorOpen] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<'ironman' | 'spiderman' | 'captainamerica' | null>(null);

  // Sync data-hero on document.documentElement for global CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-hero', activeHero);
  }, [activeHero]);

  // Initialize Lenis smooth scroll for butter-smooth inertia
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      lenis.destroy();
    };
  }, []);

  const scrollToTop = () => {
    soundEngine.playHudClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSelect = (heroId: 'ironman' | 'spiderman' | 'captainamerica') => {
    setIsHeroSelectorOpen(false);
    if (heroId === activeHero) return;
    setTransitionTarget(heroId);
    soundEngine.playHeroSwitchDetailed(heroId);

    setTimeout(() => {
      setActiveHero(heroId);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 450);

    setTimeout(() => {
      setTransitionTarget(null);
    }, 1200);
  };

  const isIronMan = activeHero === 'ironman';
  const isCap = activeHero === 'captainamerica';

  return (
    <div
      data-hero={activeHero}
      className="min-h-screen bg-[#08090E] text-white selection:bg-hero-primary selection:text-white relative overflow-x-clip transition-colors duration-500"
    >
      {/* Cinematic Hero Transition Curtain */}
      <HeroTransitionCurtain targetHero={transitionTarget} />
      {/* Universal Navbar */}
      <Navbar
        scrollProgress={scrollProgress}
        activeHero={activeHero}
        onOpenHeroSelector={() => setIsHeroSelectorOpen(true)}
      />

      {/* Ambient Floating Sparks / Arc Embers */}
      <BackgroundParticles intensity={0.45} activeHero={activeHero} />

      {/* MAIN 3D SCROLLYTELLING JOURNEY */}
      <main key={activeHero}>
        {isIronMan ? (
          <>
            {/* Iron Man Chapter 1: Mark LXXXV Nanotech Assembly & Flight */}
            <IronManHero />

            {/* Iron Man Chapter 2: Atmospheric Flight & Cinematic Unibeam */}
            <IronManCinematic />

            {/* Iron Man Chapter 3: Stark Industries JARVIS Diagnostic Specs */}
            <IronManSystems />
          </>
        ) : isCap ? (
          <>
            {/* Captain America Chapter 1: The First Avenger - Vibranium Shield Throw */}
            <CaptainAmericaHero />

            {/* Captain America Chapter 2: Battlefield Command & Kinetic Ricochet */}
            <CaptainAmericaCinematic />

            {/* Captain America Chapter 3: Project Rebirth & Shield Dynamics */}
            <CaptainAmericaSystems />
          </>
        ) : (
          <>
            {/* Spider-Man Chapter 1: The Neighborhood Patrol & Web-Slinging (Sticky 100dvh Canvas + Telemetry) */}
            <SpidermanHeroSequencer />

            {/* Spider-Man Chapter 2: The Leap of Faith & High-Altitude Vertigo Dive */}
            <SpidermanCinematicChapter />

            {/* Spider-Man Chapter 3: Parker Bio-Tech Specifications & Web-Fluid Dynamics */}
            <SpidermanSystems />
          </>
        )}
      </main>

      {/* UPCOMING AVENGERS HERO ROSTER ROADMAP - STARK TACTICAL CONSOLE */}
      <section
        id="upcoming-heroes"
        className="relative z-30 bg-[#060810] border-t border-white/10 py-24 px-6 md:px-12"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 text-hero-primary font-mono text-xs px-3.5 py-1.5 rounded-full mb-3 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE AVENGERS INITIATIVE · PHASE ROADMAP</span>
            </div>
            <h2 className="font-sans font-black text-4xl md:text-6xl text-white tracking-tight">
              SUPERHEROES <span className="text-hero-primary">ON SCROLL</span>
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-3">
              Explore live 3D canvas sequence journeys and preview the next generation of superhero scrollytelling experiences in development:
            </p>
          </div>

          {/* Tactical Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Spider-Man Experience Card */}
            <div
              onClick={() => handleHeroSelect('spiderman')}
              className={`rounded-2xl p-6 transition-all border group cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                activeHero === 'spiderman'
                  ? 'bg-[#140E1B] border-red-500/80 shadow-[0_0_35px_rgba(226,54,54,0.35)] ring-1 ring-red-500/50'
                  : 'bg-[#0B0F1E] border-white/10 hover:border-red-500/50 hover:bg-[#101526]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-marvel-red">
                    <Zap className="w-5 h-5" />
                  </div>
                  {activeHero === 'spiderman' ? (
                    <span className="text-[11px] font-mono font-bold text-red-300 bg-red-950/90 border border-red-500/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-red-400" /> ACTIVE EXPERIENCE
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1 group-hover:bg-emerald-900 transition">
                      <Play className="w-2.5 h-2.5 fill-emerald-400" /> LAUNCH SPIDEY
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    QUEENS BIO-TECH
                  </span>
                </div>
                <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight group-hover:text-marvel-red transition">
                  SPIDER-MAN
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mb-2">
                  Peter Parker • 16:9 Widescreen Canvas
                </p>

                <div className="mt-3 p-3 bg-black/60 rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Acrobatic Swing:</span>
                    <span className="text-red-400 font-bold">120 MPH</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Parker Bio-Fluids:</span>
                    <span className="text-cyan-400 font-bold">300 PSI</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Phase 1 · 3 Chapters</span>
                <span className="text-red-400 group-hover:underline">
                  {activeHero === 'spiderman' ? 'Viewing Now ↑' : 'Switch Hero →'}
                </span>
              </div>
            </div>

            {/* Iron Man Experience Card */}
            <div
              onClick={() => handleHeroSelect('ironman')}
              className={`rounded-2xl p-6 transition-all border group cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                activeHero === 'ironman'
                  ? 'bg-[#18140E] border-amber-500/80 shadow-[0_0_35px_rgba(212,162,47,0.35)] ring-1 ring-amber-500/50'
                  : 'bg-[#0B0F1E] border-white/10 hover:border-amber-500/50 hover:bg-[#101526]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#D4A22F]">
                    <Flame className="w-5 h-5" />
                  </div>
                  {activeHero === 'ironman' ? (
                    <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/90 border border-amber-500/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-400" /> ACTIVE EXPERIENCE
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1 group-hover:bg-emerald-900 transition">
                      <Play className="w-2.5 h-2.5 fill-emerald-400" /> LAUNCH STARK
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    STARK NANOTECH
                  </span>
                </div>
                <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight group-hover:text-[#D4A22F] transition">
                  IRON MAN
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mb-2">
                  Tony Stark • Mark LXXXV Armor
                </p>

                <div className="mt-3 p-3 bg-black/60 rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Flight Velocity:</span>
                    <span className="text-amber-400 font-bold">Mach 3.2</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Arc Reactor Core:</span>
                    <span className="text-sky-400 font-bold">12.8 GW</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Phase 2 · 169-Frame 3D</span>
                <span className="text-amber-400 group-hover:underline">
                  {activeHero === 'ironman' ? 'Viewing Now ↑' : 'Switch Hero →'}
                </span>
              </div>
            </div>

            {/* Black Widow Card */}
            <div className="bg-[#090C16] border border-white/10 rounded-2xl p-6 opacity-70 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-400">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> PHASE 3
                  </span>
                </div>

                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  S.H.I.E.L.D. PROTOCOL
                </span>
                <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight">
                  BLACK WIDOW
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mb-2">
                  Natasha Romanoff • Master Assassin
                </p>

                <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/5 text-xs text-zinc-400">
                  Tactical stealth combat roll transitioning into the iconic 3-point hero landing pose.
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                In Development · Q3 Release
              </div>
            </div>

            {/* Captain America Card */}
            <div
              onClick={() => handleHeroSelect('captainamerica')}
              className={`rounded-2xl p-6 transition-all border group cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                activeHero === 'captainamerica'
                  ? 'bg-[#0B1528] border-blue-500/80 shadow-[0_0_35px_rgba(59,130,246,0.35)] ring-1 ring-blue-500/50'
                  : 'bg-[#0B0F1E] border-white/10 hover:border-blue-500/50 hover:bg-[#101526]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  {activeHero === 'captainamerica' ? (
                    <span className="text-[11px] font-mono font-bold text-blue-300 bg-blue-950/90 border border-blue-500/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" /> ACTIVE EXPERIENCE
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1 group-hover:bg-emerald-900 transition">
                      <Play className="w-2.5 h-2.5 fill-emerald-400" /> LAUNCH CAPTAIN AMERICA
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  VIBRANIUM DYNAMICS
                </span>
                <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight group-hover:text-blue-400 transition">
                  CAPTAIN AMERICA
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mb-2">
                  Steve Rogers • The First Avenger
                </p>

                <div className="mt-3 p-3 bg-black/60 rounded-xl border border-white/5 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Vibranium Absorption:</span>
                    <span className="text-blue-400 font-bold">100% Kinetic</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Shield Throw Dynamics:</span>
                    <span className="text-red-400 font-bold">65 MPH / Sub-Sonic</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Phase 3 · Kinetic 3D Canvas</span>
                <span className="text-blue-400 group-hover:underline">
                  {activeHero === 'captainamerica' ? 'Viewing Now ↑' : 'Switch Hero →'}
                </span>
              </div>
            </div>

            {/* Hulk Card */}
            <div className="bg-[#090C16] border border-white/10 rounded-2xl p-6 opacity-70 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> PHASE 4
                  </span>
                </div>

                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  GAMMA KINETICS
                </span>
                <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight">
                  THE HULK
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mb-2">
                  Bruce Banner • Strongest One There Is
                </p>

                <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/5 text-xs text-zinc-400">
                  Gathers kinetic energy and unleashes a screen-shattering Sonic Thunderclap shockwave.
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-zinc-500">
                In Development · 2027
              </div>
            </div>

            {/* Avengers Full Roster Launch Card */}
            <div
              onClick={() => {
                soundEngine.playHudClick();
                setIsHeroSelectorOpen(true);
              }}
              className="bg-gradient-to-br from-amber-500/15 via-[#131A33] to-[#0A0D18] border border-amber-500/40 hover:border-amber-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(212,162,47,0.15)] group"
            >
              <Shield className="w-10 h-10 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-sans font-extrabold text-2xl text-white tracking-tight group-hover:text-amber-300 transition">
                AVENGERS ROSTER
              </h3>
              <p className="text-xs text-zinc-300 mt-2 max-w-xs leading-relaxed">
                Switch active hero experiences, inspect power ratings, and test procedural sound synthesizers.
              </p>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-xs font-mono font-bold text-white border border-white/15 group-hover:bg-white/20 transition">
                OPEN CONSOLE →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="footer"
        className="bg-[#040508] border-t border-white/5 py-14 px-6 md:px-12 text-zinc-400"
      >
        <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-white">
                <span
                  aria-hidden="true"
                  className={`inline-block h-2.5 w-2.5 rounded-full animate-pulse shadow-md ${
                    isIronMan ? 'bg-amber-400' : isCap ? 'bg-blue-400' : 'bg-marvel-red'
                  }`}
                />
                {isIronMan
                  ? 'Stark Industries · Avengers Initiative'
                  : isCap
                  ? 'SSR Tactical Command · Avengers Coalition'
                  : 'Parker Technologies · Marvel Heroes'}
              </div>
              <p className="max-w-[42ch] font-sans text-xs md:text-sm leading-relaxed text-zinc-400">
                Interactive superhero scrollytelling engine powered by React 19, Lenis smooth scrolling, GSAP physics, and Web Audio procedural synthesis.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={scrollToTop}
                className="flex items-center space-x-1.5 text-xs font-mono font-bold text-white bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full transition border border-white/10 hover:border-white/25 active:scale-95"
              >
                <ArrowUp className="w-3.5 h-3.5 text-hero-primary" />
                <span>BACK TO TOP</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/5 pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 md:flex-row md:items-center md:justify-between">
            <span>Marvel Heroes 3D Scrollytelling Engine · Phase 1, Phase 2 &amp; Phase 3 Active</span>
            <span>Proof of concept — Marvel fan tribute</span>
          </div>
        </div>
      </footer>

      {/* Hero Selector Modal */}
      <HeroSelector
        isOpen={isHeroSelectorOpen}
        onClose={() => setIsHeroSelectorOpen(false)}
        onSelectHero={handleHeroSelect}
        currentHeroId={activeHero}
      />
    </div>
  );
};
