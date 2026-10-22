import React from 'react';
import { SpiderHeroMeta, SpiderHeroId } from '../../types';

// Dedicated Hero Interactive Workshops
import { PeterParkerTechLab } from './PeterParkerTechLab';
import { VenomBlastShockwave } from './VenomBlastShockwave';
import { SpiderGwenRhythmStage } from './SpiderGwenRhythmStage';
import { Spider2099GlitchNexus } from './Spider2099GlitchNexus';
import { SpiderNoirDetectiveOffice } from './SpiderNoirDetectiveOffice';
import { SpiderPunkAnarchyStage } from './SpiderPunkAnarchyStage';
import { LivingSymbioteCanvas } from './LivingSymbioteCanvas';

import { Wrench } from 'lucide-react';

interface MultiverseHeroDeckProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onToggleSymbiote: () => void;
  onSelectHero?: (id: SpiderHeroId) => void;
}

export const MultiverseHeroDeck: React.FC<MultiverseHeroDeckProps> = ({
  hero,
  isSymbioteSurge,
  onToggleSymbiote,
}) => {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#080A15] p-6 sm:p-10 shadow-2xl overflow-hidden">
      {/* Background Halftone */}
      <div className="absolute inset-0 comic-halftone opacity-10 pointer-events-none" />

      {/* Workshop Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-hero-primary bg-white/5 px-3 py-1 rounded-full border border-white/10 mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>{hero.earthDesignation} // SIGNATURE MECHANIC WORKSHOP</span>
          </div>
          <h2 className="font-comic text-3xl sm:text-4xl text-white tracking-wide">
            {hero.alias.toUpperCase()} <span className="text-hero-primary">LAB &amp; ARSENAL</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            {hero.signatureMechanic} — Test bespoke interactive physics, audio synthesizers, and dimensional equipment.
          </p>
        </div>
      </div>

      {/* Active Workshop depending on Hero */}
      <div className="relative z-10">
        {hero.id === 'spiderman' && (
          <PeterParkerTechLab hero={hero} isSymbioteSurge={isSymbioteSurge} />
        )}

        {hero.id === 'miles' && (
          <VenomBlastShockwave />
        )}

        {hero.id === 'gwen' && (
          <SpiderGwenRhythmStage />
        )}

        {hero.id === 'spider2099' && (
          <Spider2099GlitchNexus />
        )}

        {hero.id === 'spidernoir' && (
          <SpiderNoirDetectiveOffice />
        )}

        {hero.id === 'spiderpunk' && (
          <SpiderPunkAnarchyStage />
        )}

        {(hero.id === 'venom' || hero.id === 'carnage') && (
          <LivingSymbioteCanvas
            isSymbioteSurge={isSymbioteSurge}
            onToggleSurge={onToggleSymbiote}
          />
        )}
      </div>
    </div>
  );
};
