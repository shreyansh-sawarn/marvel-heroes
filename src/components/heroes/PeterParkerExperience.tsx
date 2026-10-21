import React from 'react';
import { SpiderHeroMeta } from '../../types';
import { SpiderUniverseHero } from '../spiderman/SpiderUniverseHero';
import { PeterParkerTechLab } from '../spiderman/PeterParkerTechLab';
import { LivingSymbioteCanvas } from '../spiderman/LivingSymbioteCanvas';

interface PeterParkerProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onOpenSelector: () => void;
  onToggleSymbiote: () => void;
}

export const PeterParkerExperience: React.FC<PeterParkerProps> = ({
  hero,
  isSymbioteSurge,
  onOpenSelector,
  onToggleSymbiote,
}) => {
  return (
    <div className="relative text-white">
      {/* 1. STICKY PRIME PETER PARKER SCROLLYTELLING CANVAS */}
      <SpiderUniverseHero
        hero={hero}
        isSymbioteSurge={isSymbioteSurge}
        onOpenSelector={onOpenSelector}
        onToggleSymbiote={onToggleSymbiote}
      />

      {/* 2. PETER PARKER BIO-TECH BENCH & DAILY BUGLE DARKROOM */}
      <section id="tech-lab-section" className="relative z-30 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <PeterParkerTechLab
          hero={hero}
          isSymbioteSurge={isSymbioteSurge}
        />
      </section>

      {/* 3. LIVING SYMBIOTE LAB (Active during Symbiote Infestation Surge) */}
      {isSymbioteSurge && (
        <section className="relative z-30 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
          <LivingSymbioteCanvas
            isSymbioteSurge={isSymbioteSurge}
            onToggleSurge={onToggleSymbiote}
          />
        </section>
      )}
    </div>
  );
};
