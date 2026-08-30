import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { Navbar } from './components/ui/Navbar';
import { SpidermanHeroSequencer } from './components/spiderman/SpidermanHeroSequencer';
import { SpidermanCinematicChapter } from './components/spiderman/SpidermanCinematicChapter';
import { SpidermanSystems } from './components/spiderman/SpidermanSystems';
import { HeroSelector } from './components/ui/HeroSelector';
import { BackgroundParticles } from './components/ui/BackgroundParticles';
import { ArrowUp, Sparkles, Flame, Eye, Shield, Zap, Hammer } from 'lucide-react';

export const App: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHeroSelectorOpen, setIsHeroSelectorOpen] = useState(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-[#E62429] selection:text-white relative overflow-x-clip">
      {/* Universal Navbar */}
      <Navbar
        scrollProgress={scrollProgress}
        onOpenHeroSelector={() => setIsHeroSelectorOpen(true)}
      />

      {/* Ambient Floating Sparks */}
      <BackgroundParticles intensity={0.4} />

      {/* MAIN SPIDER-MAN SCROLLYTELLING JOURNEY */}
      <main>
        {/* Chapter 1: The Neighborhood Patrol & Web-Slinging (Sticky 100dvh Canvas + Telemetry + Quotes) */}
        <SpidermanHeroSequencer />

        {/* Chapter 2: The Leap of Faith & High-Altitude Vertigo Dive */}
        <SpidermanCinematicChapter />

        {/* Chapter 3: Parker Bio-Tech Specifications & Web-Fluid Dynamics */}
        <SpidermanSystems />
      </main>

      {/* UPCOMING AVENGERS HERO ROSTER ROADMAP */}
      <section
        id="upcoming-heroes"
        className="relative z-30 bg-[#07080D] border-t border-white/10 py-24 px-6 md:px-12"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 text-marvel-red font-mono text-xs px-3.5 py-1.5 rounded-full mb-3 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE AVENGERS INITIATIVE ROADMAP</span>
            </div>
            <h2 className="font-sans font-extrabold text-4xl md:text-6xl text-white tracking-tight">
              NEXT HEROES <span className="text-[#E62429]">ON SCROLL</span>
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-3">
              Phase 1 brings Spider-Man's high-speed web-slinging mechanics to life. The following superhero action experiences are queued for future chapters:
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Iron Man */}
            <div className="rounded-2xl p-6 transition-all border border-white/10 bg-[#0E1018] hover:border-[#D4A22F]/60 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#D4A22F]">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-950/80 border border-yellow-500/30 px-2.5 py-1 rounded-full">
                  COMING NEXT
                </span>
              </div>
              <h3 className="font-sans font-bold text-2xl text-white tracking-tight group-hover:text-[#D4A22F] transition">
                IRON MAN
              </h3>
              <p className="text-xs font-semibold text-zinc-400 mb-2">
                Tony Stark • Mark LXXXV
              </p>
              <div className="mt-3 p-3 bg-black/50 rounded-lg border border-white/5">
                <span className="text-xs font-mono text-zinc-400 uppercase block mb-1">
                  Scroll Action:
                </span>
                <span className="text-sm font-medium text-amber-200">
                  Raises armored gauntlets, charges repulsors, and unibeam blasts through screen!
                </span>
              </div>
            </div>

            {/* Black Widow */}
            <div className="bg-[#0E1018] border border-white/10 rounded-2xl p-6 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                  IN QUEUE
                </span>
              </div>
              <h3 className="font-sans font-bold text-2xl text-white tracking-tight">
                BLACK WIDOW
              </h3>
              <p className="text-xs font-semibold text-zinc-400 mb-2">
                Natasha Romanoff • Master Assassin
              </p>
              <div className="mt-3 p-3 bg-black/50 rounded-lg border border-white/5">
                <span className="text-xs font-mono text-zinc-400 uppercase block mb-1">
                  Scroll Action:
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  High-speed combat roll transitioning into the iconic 3-point hero landing pose.
                </span>
              </div>
            </div>

            {/* Captain America */}
            <div className="bg-[#0E1018] border border-white/10 rounded-2xl p-6 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-700/40 flex items-center justify-center text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                  IN QUEUE
                </span>
              </div>
              <h3 className="font-sans font-bold text-2xl text-white tracking-tight">
                CAPTAIN AMERICA
              </h3>
              <p className="text-xs font-semibold text-zinc-400 mb-2">
                Steve Rogers • The First Avenger
              </p>
              <div className="mt-3 p-3 bg-black/50 rounded-lg border border-white/5">
                <span className="text-xs font-mono text-zinc-400 uppercase block mb-1">
                  Scroll Action:
                </span>
                <span className="text-sm font-medium text-blue-200">
                  Hurls the Vibranium shield across buildings with ricochet physics and mid-air catch!
                </span>
              </div>
            </div>

            {/* Hulk */}
            <div className="bg-[#0E1018] border border-white/10 rounded-2xl p-6 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/30 border border-emerald-700/40 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                  IN QUEUE
                </span>
              </div>
              <h3 className="font-sans font-bold text-2xl text-white tracking-tight">
                HULK
              </h3>
              <p className="text-xs font-semibold text-zinc-400 mb-2">
                Bruce Banner • Strongest One There Is
              </p>
              <div className="mt-3 p-3 bg-black/50 rounded-lg border border-white/5">
                <span className="text-xs font-mono text-zinc-400 uppercase block mb-1">
                  Scroll Action:
                </span>
                <span className="text-sm font-medium text-emerald-200">
                  Gathers kinetic energy and unleashes a screen-shattering Sonic Thunderclap!
                </span>
              </div>
            </div>

            {/* Thor */}
            <div className="bg-[#0E1018] border border-white/10 rounded-2xl p-6 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-900/30 border border-sky-700/40 flex items-center justify-center text-sky-400">
                  <Hammer className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                  IN QUEUE
                </span>
              </div>
              <h3 className="font-sans font-bold text-2xl text-white tracking-tight">
                THOR
              </h3>
              <p className="text-xs font-semibold text-zinc-400 mb-2">
                God of Thunder • Wielder of Mjolnir
              </p>
              <div className="mt-3 p-3 bg-black/50 rounded-lg border border-white/5">
                <span className="text-xs font-mono text-zinc-400 uppercase block mb-1">
                  Scroll Action:
                </span>
                <span className="text-sm font-medium text-sky-200">
                  Spins Mjolnir, commands storm clouds, and summons a blinding lightning bolt!
                </span>
              </div>
            </div>

            {/* View Full Roster Card */}
            <div
              onClick={() => setIsHeroSelectorOpen(true)}
              className="bg-gradient-to-br from-marvel-red/20 via-[#151928] to-[#0E1018] border border-marvel-red/40 hover:border-marvel-red rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Shield className="w-10 h-10 text-yellow-400 mb-3 animate-bounce" />
              <h3 className="font-sans font-bold text-2xl text-white tracking-tight">
                AVENGERS ROSTER
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-xs">
                Explore character backstories, power ratings, and upcoming scrollytelling phases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="footer"
        className="bg-[#050608] border-t border-white/5 py-14 px-6 md:px-12 text-zinc-400"
      >
        <div className="mx-auto flex max-w-[1400px] flex-col gap-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-white">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 rounded-full bg-marvel-red shadow-[0_0_12px_rgba(230,36,41,0.9)]"
                />
                Parker / Technologies &amp; Marvel Heroes
              </div>
              <p className="max-w-[38ch] font-sans text-xs md:text-sm leading-relaxed text-zinc-400">
                © Parker Technologies — Queens, New York. Interactive scrollytelling experience dedicated to the Marvel Universe.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={scrollToTop}
                className="flex items-center space-x-1.5 text-xs font-mono font-bold text-white bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full transition border border-white/10"
              >
                <ArrowUp className="w-3.5 h-3.5 text-marvel-red" />
                <span>BACK TO TOP</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/5 pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 md:flex-row md:items-center md:justify-between">
            <span>Spider-Man 3D Scrollytelling Engine · Phase 1 Complete</span>
            <span>Proof of concept — Marvel fan tribute, personal project</span>
          </div>
        </div>
      </footer>

      {/* Hero Selector Modal */}
      <HeroSelector
        isOpen={isHeroSelectorOpen}
        onClose={() => setIsHeroSelectorOpen(false)}
        onSelectHero={() => setIsHeroSelectorOpen(false)}
        currentHeroId="spiderman"
      />
    </div>
  );
};
