import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { MarvelHeroId } from './types';
import { MARVEL_HEROES } from './data/marvelHeroes';
import { soundEngine } from './services/soundEngine';

// Apple-Grade Cinematic Scrollytelling Components
import { CinematicCanvasSequencer } from './components/scrollytelling/CinematicCanvasSequencer';
import { HeroInteractiveSystems } from './components/scrollytelling/HeroInteractiveSystems';

// UI Components
import { Navbar } from './components/ui/Navbar';
import { HeroSelectorModal } from './components/ui/HeroSelectorModal';
import { HeroTransitionCurtain } from './components/ui/HeroTransitionCurtain';

import { ArrowUp, Compass, Shield } from 'lucide-react';

const HERO_IMAGES: Record<MarvelHeroId, string[]> = {
  ironman: [
    '/assets/ironman_hero.jpg',
    '/assets/ironman_flight.jpg',
    '/assets/ironman_unibeam.jpg',
  ],
  spiderman: [
    '/assets/spiderman_perch.jpg',
    '/assets/spiderman_dive.jpg',
    '/assets/spiderman_swing.jpg',
  ],
  captainamerica: [
    '/assets/cap_hero.jpg',
    '/assets/cap_shield_throw.jpg',
  ],
  thor: [
    '/assets/thor_hero.jpg',
    '/assets/thor_lightning.jpg',
  ],
  wolverine: [
    '/assets/wolverine_hero.jpg',
    '/assets/wolverine_berserker.jpg',
  ],
};

export const App: React.FC = () => {
  const [activeHeroId, setActiveHeroId] = useState<MarvelHeroId>('ironman');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<MarvelHeroId | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const activeHero = MARVEL_HEROES[activeHeroId] || MARVEL_HEROES.ironman;

  // Sync data-hero attribute on documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-hero', activeHeroId);
  }, [activeHeroId]);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
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
      setShowScrollTop(window.scrollY > 500);
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

  const handleHeroSelect = (heroId: MarvelHeroId) => {
    if (heroId === activeHeroId) return;
    setTransitionTarget(heroId);
    soundEngine.playHeroSwitch(heroId);

    setTimeout(() => {
      setActiveHeroId(heroId);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 450);

    setTimeout(() => {
      setTransitionTarget(null);
    }, 1100);
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-red-600 selection:text-white font-sans overflow-x-hidden">
      {/* Universal Floating Navbar */}
      <Navbar
        hero={activeHero}
        scrollProgress={scrollProgress}
        onOpenSelector={() => setIsSelectorOpen(true)}
      />

      {/* Cinematic Dimensional Transition Curtain */}
      <HeroTransitionCurtain targetHeroId={transitionTarget} />

      {/* Main Scrollytelling Experience Stream */}
      <main key={activeHeroId} className="relative z-10 flex flex-col w-full">
        {/* Section 1: Apple-Grade 300vh Cinematic Canvas Scrollytelling Sequence */}
        <CinematicCanvasSequencer
          hero={activeHero}
          imagePaths={HERO_IMAGES[activeHeroId]}
        />

        {/* Section 2: Interactive Weapons Lab & Diagnostics System */}
        <HeroInteractiveSystems hero={activeHero} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-zinc-950 py-16 px-6 md:px-12 text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-widest uppercase">
                MARVEL <span className="text-red-600">CINEMATIC</span> UNIVERSE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
                EARTH-616 // LEGENDS
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 max-w-md">
              An Apple-grade cinematic interactive scrollytelling web experience featuring Iron Man, Spider-Man, Captain America, Thor, and Wolverine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSelectorOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 transition font-mono text-xs uppercase"
            >
              <Compass className="w-3.5 h-3.5 text-red-500" />
              <span>CHOOSE HERO</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>EARTH-616 SECURED</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
          <div>
            Crafted with React 19, Vite, Tailwind CSS, Lenis &amp; Web Audio API.
          </div>
          <div>
            &quot;Part of the journey is the end.&quot;
          </div>
        </div>
      </footer>

      {/* Scroll to Top Action Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-zinc-900/90 border border-white/15 text-zinc-300 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all duration-300 shadow-2xl backdrop-blur-md group"
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Fullscreen Hero Selector Modal */}
      <HeroSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        activeHeroId={activeHeroId}
        onSelectHero={handleHeroSelect}
      />
    </div>
  );
};

export default App;
