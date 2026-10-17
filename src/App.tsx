import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { SpiderHeroId } from './types';
import { SPIDER_HEROES, SPIDER_HERO_LIST } from './data/spiderHeroes';
import { soundEngine } from './services/soundEngine';

// Components
import { SpiderNavbar } from './components/ui/SpiderNavbar';
import { MultiverseSelectorModal } from './components/ui/MultiverseSelectorModal';
import { HeroTransitionCurtain } from './components/ui/HeroTransitionCurtain';
import { BackgroundParticles } from './components/ui/BackgroundParticles';
import { SpiderSuitDiagnostics } from './components/spiderman/SpiderSuitDiagnostics';
import { MultiverseMap } from './components/spiderman/MultiverseMap';

// Dedicated Hero Experiences
import { PeterParkerExperience } from './components/heroes/PeterParkerExperience';
import { MilesMoralesExperience } from './components/heroes/MilesMoralesExperience';
import { SpiderGwenExperience } from './components/heroes/SpiderGwenExperience';
import { Spider2099Experience } from './components/heroes/Spider2099Experience';
import { SpiderNoirExperience } from './components/heroes/SpiderNoirExperience';
import { VenomSymbioteExperience } from './components/heroes/VenomSymbioteExperience';
import { CarnageExperience } from './components/heroes/CarnageExperience';
import { SpiderPunkExperience } from './components/heroes/SpiderPunkExperience';

import {
  ArrowUp,
  Globe,
  CheckCircle2,
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeHeroId, setActiveHeroId] = useState<SpiderHeroId>('spiderman');
  const [isSymbioteSurge, setIsSymbioteSurge] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMultiverseModalOpen, setIsMultiverseModalOpen] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<SpiderHeroId | null>(null);

  const activeHero = SPIDER_HEROES[activeHeroId] || SPIDER_HEROES.spiderman;

  // Sync data-hero and data-symbiote on document.documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-hero', activeHeroId);
    document.documentElement.setAttribute('data-symbiote', isSymbioteSurge ? 'true' : 'false');
  }, [activeHeroId, isSymbioteSurge]);

  // Initialize Lenis smooth scroll
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
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
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

  const handleHeroSelect = (heroId: SpiderHeroId) => {
    setIsMultiverseModalOpen(false);
    if (heroId === activeHeroId) return;

    setTransitionTarget(heroId);
    soundEngine.playHeroSwitchDetailed(heroId, isSymbioteSurge);

    setTimeout(() => {
      setActiveHeroId(heroId);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 450);

    setTimeout(() => {
      setTransitionTarget(null);
    }, 1100);
  };

  const handleToggleSymbioteSurge = () => {
    const nextState = !isSymbioteSurge;
    setIsSymbioteSurge(nextState);

    if (nextState) {
      soundEngine.playSymbioteRoar();
    } else {
      soundEngine.playSonicScreech(880);
    }
  };

  return (
    <div
      data-hero={activeHeroId}
      data-symbiote={isSymbioteSurge ? 'true' : 'false'}
      className="min-h-screen bg-[#07080D] text-white selection:bg-hero-primary selection:text-white relative overflow-x-clip transition-colors duration-500"
    >
      {/* Dimensional Warp Curtain Transition */}
      <HeroTransitionCurtain targetHero={transitionTarget} isSymbioteSurge={isSymbioteSurge} />

      {/* Spider-Verse Universal Navbar */}
      <SpiderNavbar
        scrollProgress={scrollProgress}
        activeHero={activeHero}
        isSymbioteSurge={isSymbioteSurge}
        onToggleSymbioteSurge={handleToggleSymbioteSurge}
        onOpenMultiverseModal={() => setIsMultiverseModalOpen(true)}
      />

      {/* Reactive Ambient Multiverse / Symbiote Spores */}
      <BackgroundParticles
        intensity={0.5}
        activeHero={activeHeroId}
        isSymbioteSurge={isSymbioteSurge}
      />

      {/* MAIN SPIDER-VERSE SCROLLYTELLING JOURNEY */}
      <main key={`${activeHeroId}-${isSymbioteSurge}`}>
        {/* DEDICATED BESPOKE CHARACTER EXPERIENCE (SCROLLYTELLING + INTERACTIVE LAB) */}
        {activeHeroId === 'spiderman' ? (
          <PeterParkerExperience
            hero={activeHero}
            isSymbioteSurge={isSymbioteSurge}
            onOpenSelector={() => setIsMultiverseModalOpen(true)}
            onToggleSymbiote={handleToggleSymbioteSurge}
          />
        ) : activeHeroId === 'miles' ? (
          <MilesMoralesExperience
            hero={activeHero}
            isSymbioteSurge={isSymbioteSurge}
            onOpenSelector={() => setIsMultiverseModalOpen(true)}
            onToggleSymbiote={handleToggleSymbioteSurge}
          />
        ) : activeHeroId === 'gwen' ? (
          <SpiderGwenExperience
            hero={activeHero}
            isSymbioteSurge={isSymbioteSurge}
            onOpenSelector={() => setIsMultiverseModalOpen(true)}
            onToggleSymbiote={handleToggleSymbioteSurge}
          />
        ) : activeHeroId === 'spider2099' ? (
          <Spider2099Experience
            hero={activeHero}
            isSymbioteSurge={isSymbioteSurge}
            onOpenSelector={() => setIsMultiverseModalOpen(true)}
            onToggleSymbiote={handleToggleSymbioteSurge}
          />
        ) : activeHeroId === 'spidernoir' ? (
          <SpiderNoirExperience
            hero={activeHero}
            isSymbioteSurge={isSymbioteSurge}
            onOpenSelector={() => setIsMultiverseModalOpen(true)}
            onToggleSymbiote={handleToggleSymbioteSurge}
          />
        ) : activeHeroId === 'venom' ? (
          <VenomSymbioteExperience
            hero={activeHero}
            isSymbioteSurge={isSymbioteSurge}
            onOpenSelector={() => setIsMultiverseModalOpen(true)}
            onToggleSymbiote={handleToggleSymbioteSurge}
          />
        ) : activeHeroId === 'carnage' ? (
          <CarnageExperience
            hero={activeHero}
            isSymbioteSurge={isSymbioteSurge}
            onOpenSelector={() => setIsMultiverseModalOpen(true)}
            onToggleSymbiote={handleToggleSymbioteSurge}
          />
        ) : activeHeroId === 'spiderpunk' ? (
          <SpiderPunkExperience
            hero={activeHero}
            isSymbioteSurge={isSymbioteSurge}
            onOpenSelector={() => setIsMultiverseModalOpen(true)}
            onToggleSymbiote={handleToggleSymbioteSurge}
          />
        ) : (
          <PeterParkerExperience
            hero={activeHero}
            isSymbioteSurge={isSymbioteSurge}
            onOpenSelector={() => setIsMultiverseModalOpen(true)}
            onToggleSymbiote={handleToggleSymbioteSurge}
          />
        )}

        {/* CHAPTER 3: Biometric & Technical Suit Diagnostics */}
        <section className="relative z-30 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <SpiderSuitDiagnostics hero={activeHero} isSymbioteSurge={isSymbioteSurge} />
        </section>

        {/* CHAPTER 4: The Web of Life & Destiny (Multiverse Cosmic Map) */}
        <section className="relative z-30 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <MultiverseMap
            currentHeroId={activeHeroId}
            onSelectHero={handleHeroSelect}
            isSymbioteSurge={isSymbioteSurge}
          />
        </section>

        {/* CHAPTER 5: Multiverse Spider-Roster Console Grid */}
        <section className="relative z-30 py-24 px-6 md:px-12 bg-[#060810] border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 text-hero-primary font-mono text-xs px-3.5 py-1.5 rounded-full mb-3 shadow-md">
                <Globe className="w-3.5 h-3.5" />
                <span>MULTIVERSE SPIDER-ARMY // ACTIVE ANOMALIES</span>
              </div>
              <h2 className="font-comic text-4xl sm:text-6xl text-white tracking-wide">
                EXPLORE THE <span className="text-hero-primary">SPIDER-VERSE</span>
              </h2>
              <p className="text-zinc-400 text-sm md:text-base mt-2 font-mono">
                Click any dimensional avatar to initialize reality warp with custom procedural audio and mechanics:
              </p>
            </div>

            {/* Grid of All 8 Heroes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {SPIDER_HERO_LIST.map((h) => {
                const isCurrent = h.id === activeHeroId;
                return (
                  <div
                    key={h.id}
                    onClick={() => handleHeroSelect(h.id)}
                    className={`rounded-2xl p-5 transition-all border group cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-[#151226] border-hero-primary shadow-[0_0_35px_var(--hero-glow)] ring-1 ring-hero-primary/50'
                        : 'bg-[#0B0E1B] border-white/10 hover:border-white/30 hover:bg-[#101424]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: h.primaryColor }}
                        />
                        {isCurrent ? (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full group-hover:text-white transition">
                            WARP HERE →
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                        {h.earthDesignation}
                      </span>
                      <h3 className="font-comic text-2xl text-white tracking-wide group-hover:text-hero-primary transition">
                        {isSymbioteSurge ? h.symbioteVariantName : h.alias}
                      </h3>
                      <p className="text-xs text-zinc-400 font-semibold mb-2">
                        {h.name}
                      </p>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {isSymbioteSurge ? h.symbioteDescription : h.tagline}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500">Agility: <strong className="text-white">{h.agility}%</strong></span>
                      <span className="text-zinc-500">Power: <strong className="text-white">{h.strength}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#040508] border-t border-white/5 py-12 px-6 md:px-12 text-zinc-400 relative z-30">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-white">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-hero-primary animate-pulse" />
                <span>SPIDER-VERSE &amp; SYMBIOTE NEXUS // EARTH-616 &amp; MULTIVERSE</span>
              </div>
              <p className="max-w-xl text-xs md:text-sm leading-relaxed text-zinc-400 font-sans">
                High-impact Spider-Man &amp; Symbiote interactive scrollytelling universe powered by React 19, Lenis smooth inertia scrolling, procedural Web Audio synthesis, and dynamic Canvas 2D organic fluid tendril mechanics.
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

          <div className="flex flex-col gap-2 border-t border-white/5 pt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 md:flex-row md:items-center md:justify-between">
            <span>Spider-Verse Multiverse Anomaly Engine · 8 Dimensions Active</span>
            <span>Fan tribute project · Created with creative passion</span>
          </div>
        </div>
      </footer>

      {/* Multiverse Reality Selector Modal */}
      <MultiverseSelectorModal
        isOpen={isMultiverseModalOpen}
        onClose={() => setIsMultiverseModalOpen(false)}
        onSelectHero={handleHeroSelect}
        currentHeroId={activeHeroId}
        isSymbioteSurge={isSymbioteSurge}
      />
    </div>
  );
};
