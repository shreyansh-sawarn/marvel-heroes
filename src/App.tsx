import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { SpiderHeroId } from './types';
import { SPIDER_HEROES } from './data/spiderHeroes';
import { soundEngine } from './services/soundEngine';

// Rebuilt Flagship Components
import { SpiderNavbar } from './components/SpiderNavbar';
import { HeroStage } from './components/HeroStage';
import { HeroWorkbench } from './components/HeroWorkbench';
import { CosmicWeb3D } from './components/CosmicWeb3D';
import { CombatArena } from './components/CombatArena';
import { MultiverseModal } from './components/MultiverseModal';
import { AudioDock } from './components/AudioDock';

import { ArrowUp, Globe, Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [activeHeroId, setActiveHeroId] = useState<SpiderHeroId>('spiderman');
  const [isSymbioteSurge, setIsSymbioteSurge] = useState(false);
  const [isMultiverseModalOpen, setIsMultiverseModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const activeHero = SPIDER_HEROES[activeHeroId] || SPIDER_HEROES.spiderman;

  // Sync data-hero and data-symbiote on document.documentElement for dynamic OKLCH tokens & global styles
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
      setShowScrollTop(window.scrollY > 600);
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
    if (heroId === activeHeroId) return;
    soundEngine.playHeroSwitchDetailed(heroId, isSymbioteSurge);
    setActiveHeroId(heroId);
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
    <div className="relative min-h-screen bg-black text-white selection:bg-red-500 selection:text-white font-sans overflow-x-hidden">
      {/* Dynamic Symbiote Global Vignette & Particle Grid */}
      {isSymbioteSurge && (
        <div className="fixed inset-0 pointer-events-none z-30 shadow-[inset_0_0_120px_rgba(220,38,38,0.45)] transition-all duration-700 animate-pulse" />
      )}

      {/* Multiverse Navigation Bar */}
      <SpiderNavbar
        activeHero={activeHero}
        isSymbioteSurge={isSymbioteSurge}
        onToggleSymbiote={handleToggleSymbioteSurge}
        onOpenSelector={() => setIsMultiverseModalOpen(true)}
      />

      {/* Main Experience Stream */}
      <main className="relative z-10 flex flex-col w-full">
        {/* Section 1: 100vh Flagship Hero Stage (Full-figure, Physics Web Shoot, Living Tendrils, Cathedral Purge) */}
        <HeroStage
          hero={activeHero}
          isSymbioteSurge={isSymbioteSurge}
          onToggleSymbiote={handleToggleSymbioteSurge}
          onSelectHero={handleHeroSelect}
        />

        {/* Section 2: Interactive Multiverse Hero Workbench (Peter, Miles, Gwen, 2099, Noir, Venom, Punk) */}
        <HeroWorkbench
          hero={activeHero}
          isSymbioteSurge={isSymbioteSurge}
          onToggleSymbiote={handleToggleSymbioteSurge}
        />

        {/* Section 3: WebGL 3D Web of Life & Destiny (Three.js Cosmic Constellation) */}
        <CosmicWeb3D
          currentHeroId={activeHeroId}
          onSelectHero={handleHeroSelect}
          isSymbioteSurge={isSymbioteSurge}
        />

        {/* Section 4: Multiverse Crisis Combat Arena (Spot, Kingpin, Miguel, Knull) */}
        <CombatArena
          activeHeroId={activeHeroId}
          isSymbioteSurge={isSymbioteSurge}
        />
      </main>

      {/* Multiverse Footer */}
      <footer className="relative z-10 border-t border-zinc-800 bg-zinc-950 py-12 px-6 md:px-12 text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-widest uppercase">
                SPIDER-VERSE <span className="text-red-500">&amp;</span> SYMBIOTE NEXUS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                {activeHero.earthDesignation} // {activeHero.universe.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 max-w-md">
              A high-impact interactive scrollytelling web experience powered by Web Audio API, Three.js WebGL, and organic Klyntar fluid physics.
            </p>
          </div>

          {/* Quick Multiverse Totems */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMultiverseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition font-mono text-xs uppercase"
            >
              <Globe className="w-3.5 h-3.5 text-red-500" />
              <span>Multiverse Matrix</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Canon Protected</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
          <div>
            Built with React 19, Vite, Three.js, Tailwind CSS &amp; Lenis. No generic AI templates.
          </div>
          <div className="flex items-center gap-1">
            <span>&quot;Anyone can wear the mask.&quot;</span>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Action Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-20 right-5 z-40 p-3 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all duration-300 shadow-xl backdrop-blur-md group"
        >
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Floating Audio Dock with Procedural OST & Frequency Visualizer */}
      <AudioDock activeHeroId={activeHeroId} />

      {/* Fullscreen Multiverse Reality Selector Modal */}
      <MultiverseModal
        isOpen={isMultiverseModalOpen}
        onClose={() => setIsMultiverseModalOpen(false)}
        activeHeroId={activeHeroId}
        onSelectHero={handleHeroSelect}
      />
    </div>
  );
};
export default App;
