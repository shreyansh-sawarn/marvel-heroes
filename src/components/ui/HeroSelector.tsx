import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { HeroMeta } from '../../types';

interface HeroSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHero: (heroId: 'ironman' | 'spiderman') => void;
  currentHeroId: string;
}

export const HEROES_ROSTER: HeroMeta[] = [
  {
    id: 'ironman',
    name: 'Iron Man',
    alias: 'Tony Stark',
    tagline: 'Genius, Billionaire, Playboy, Philanthropist',
    primaryColor: '#D4A22F',
    secondaryColor: '#B91C1C',
    accentColor: '#38BDF8',
    action: 'Mark LXXXV Nanotech Assembly & High-Speed Flight Sequence',
    iconName: 'flame',
    isAvailable: true,
  },
  {
    id: 'spiderman',
    name: 'Spider-Man',
    alias: 'Peter Parker',
    tagline: 'Your Friendly Neighborhood Spider-Man',
    primaryColor: '#E23636',
    secondaryColor: '#0B3C5D',
    accentColor: '#F3D403',
    action: 'Web-Slinging & High-Speed Acrobatic Swing',
    iconName: 'zap',
    isAvailable: true,
  },
  {
    id: 'blackwidow',
    name: 'Black Widow',
    alias: 'Natasha Romanoff',
    tagline: 'Master Assassin & Avenger',
    primaryColor: '#1F2937',
    secondaryColor: '#DC2626',
    accentColor: '#F59E0B',
    action: 'Tactical Roll & Iconic 3-Point Hero Landing',
    iconName: 'eye',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'captainamerica',
    name: 'Captain America',
    alias: 'Steve Rogers',
    tagline: 'The First Avenger',
    primaryColor: '#1E40AF',
    secondaryColor: '#DC2626',
    accentColor: '#FFFFFF',
    action: 'Ricochet Vibranium Shield Toss & Catch',
    iconName: 'shield',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'hulk',
    name: 'The Incredible Hulk',
    alias: 'Bruce Banner',
    tagline: 'The Strongest One There Is',
    primaryColor: '#15803D',
    secondaryColor: '#4C1D95',
    accentColor: '#86EFAC',
    action: 'Devastating Sonic Thunderclap Shockwave',
    iconName: 'zap',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'thor',
    name: 'Thor Odinson',
    alias: 'God of Thunder',
    tagline: 'Wielder of Mjolnir',
    primaryColor: '#0369A1',
    secondaryColor: '#D97706',
    accentColor: '#38BDF8',
    action: 'Summoning Cosmic Bifrost Lightning Strike',
    iconName: 'hammer',
    isAvailable: false,
    comingSoon: true,
  },
];

export const HeroSelector: React.FC<HeroSelectorProps> = ({
  isOpen,
  onClose,
  onSelectHero,
  currentHeroId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0C101E] border border-white/15 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-[#171C33] to-[#0E1224] border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-marvel-red text-white font-comic text-xs px-2 py-0.5 rounded tracking-widest">
                AVENGERS INITIATIVE
              </span>
              <span className="text-xs text-[#D4A22F] font-mono font-bold">
                SELECT EXPERIENCE
              </span>
            </div>
            <h2 className="font-sans font-bold text-2xl md:text-3xl text-white tracking-tight mt-1">
              MARVEL HEROES 3D SCROLL UNIVERSE
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Cards Grid */}
        <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEROES_ROSTER.map((hero) => {
            const isSelected = hero.id === currentHeroId;

            return (
              <div
                key={hero.id}
                onClick={() => {
                  if (hero.isAvailable) {
                    onSelectHero(hero.id as 'ironman' | 'spiderman');
                    onClose();
                  }
                }}
                className={`relative rounded-xl p-5 border transition-all flex flex-col justify-between ${
                  hero.isAvailable
                    ? 'cursor-pointer hover:scale-[1.02] bg-[#141A33] hover:border-[#D4A22F] hover:shadow-[0_0_25px_rgba(212,162,47,0.3)]'
                    : 'cursor-not-allowed opacity-60 bg-[#0D1020] border-white/5'
                } ${
                  isSelected
                    ? 'border-[#D4A22F] ring-2 ring-[#D4A22F]/40 bg-[#17203E]'
                    : 'border-white/10'
                }`}
              >
                {/* Status Pill */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-md"
                    style={{ backgroundColor: hero.primaryColor }}
                  />
                  {hero.isAvailable ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE EXPERIENCE
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full">
                      IN DEVELOPMENT
                    </span>
                  )}
                </div>

                {/* Hero Info */}
                <div>
                  <h3 className="font-sans font-bold text-2xl text-white tracking-tight">
                    {hero.name}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-400 mb-1">
                    {hero.alias}
                  </p>
                  <p className="text-xs text-zinc-300 italic mb-3">
                    "{hero.tagline}"
                  </p>
                </div>

                {/* Planned Action Preview */}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
                    3D Scroll Mechanic:
                  </div>
                  <div className="text-xs font-medium text-[#D4A22F] bg-black/40 p-2.5 rounded border border-white/5">
                    {hero.action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0A0D18] border-t border-white/10 text-center text-xs text-zinc-400 font-mono">
          Featuring photorealistic 3D canvas sequence animation for <strong className="text-[#D4A22F]">Iron Man</strong> and <strong className="text-marvel-red">Spider-Man</strong>!
        </div>
      </div>
    </div>
  );
};
