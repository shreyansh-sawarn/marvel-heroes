import React from 'react';
import { X, CheckCircle2, Play, Sparkles, Flame, Zap, Shield, Eye, Hammer, Radio } from 'lucide-react';
import { HeroMeta } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface HeroSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHero: (heroId: 'ironman' | 'spiderman') => void;
  currentHeroId: string;
}

export const HEROES_ROSTER: HeroMeta[] = [
  {
    id: 'spiderman',
    name: 'Spider-Man',
    alias: 'Peter Parker (Tom Holland / Brand New Day)',
    tagline: 'NYC Fresh Start · Classic Hand-Crafted Suit · Street-Level Patrol',
    primaryColor: '#E23636',
    secondaryColor: '#0B3C5D',
    accentColor: '#00B4D8',
    action: '16:9 Widescreen Acrobatic Web-Slinging & Leap of Faith',
    iconName: 'zap',
    isAvailable: true,
  },
  {
    id: 'ironman',
    name: 'Iron Man',
    alias: 'Tony Stark',
    tagline: 'Genius, Billionaire, Playboy, Philanthropist',
    primaryColor: '#D4A22F',
    secondaryColor: '#B91C1C',
    accentColor: '#38BDF8',
    action: 'Mark LXXXV Flight & Cinematic Unibeam Blast',
    iconName: 'flame',
    isAvailable: true,
  },
  {
    id: 'blackwidow',
    name: 'Black Widow',
    alias: 'Natasha Romanoff',
    tagline: 'Master Assassin & S.H.I.E.L.D. Operative',
    primaryColor: '#EF4444',
    secondaryColor: '#0F172A',
    accentColor: '#F59E0B',
    action: 'Tactical Combat Roll & Iconic 3-Point Hero Landing',
    iconName: 'eye',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'captainamerica',
    name: 'Captain America',
    alias: 'Steve Rogers',
    tagline: 'The First Avenger',
    primaryColor: '#3B82F6',
    secondaryColor: '#DC2626',
    accentColor: '#FFFFFF',
    action: 'Ricochet Vibranium Shield Toss & Kinetic Mid-Air Catch',
    iconName: 'shield',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'hulk',
    name: 'The Incredible Hulk',
    alias: 'Bruce Banner',
    tagline: 'The Strongest One There Is',
    primaryColor: '#22C55E',
    secondaryColor: '#581C87',
    accentColor: '#86EFAC',
    action: 'Devastating Sonic Thunderclap Screen-Shattering Shockwave',
    iconName: 'zap',
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: 'thor',
    name: 'Thor Odinson',
    alias: 'God of Thunder',
    tagline: 'Wielder of Mjolnir',
    primaryColor: '#0284C7',
    secondaryColor: '#D97706',
    accentColor: '#38BDF8',
    action: 'Mjolnir Lightning Summons & Cosmic Bifrost Shockwave',
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

  const handleHeroClick = (heroId: 'ironman' | 'spiderman') => {
    onSelectHero(heroId);
    onClose();
  };

  const getHeroIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'shield':
        return <Shield className="w-5 h-5" />;
      case 'eye':
        return <Eye className="w-5 h-5" />;
      case 'hammer':
        return <Hammer className="w-5 h-5" />;
      default:
        return <Radio className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#090C16] border border-white/15 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-[#12182B] via-[#0E1322] to-[#0A0D18] border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-marvel-red text-white font-comic text-xs px-2.5 py-0.5 rounded tracking-widest shadow-sm">
                AVENGERS INITIATIVE
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> SELECT 3D SCROLL EXPERIENCE
              </span>
            </div>
            <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-white tracking-tight mt-1">
              HERO SCROLLYTELLING UNIVERSE
            </h2>
          </div>

          <button
            onClick={() => {
              soundEngine.playHudClick();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition border border-white/5 hover:border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Cards Grid */}
        <div className="p-5 md:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {HEROES_ROSTER.map((hero) => {
            const isSelected = hero.id === currentHeroId;

            return (
              <div
                key={hero.id}
                onClick={() => {
                  if (hero.isAvailable) {
                    handleHeroClick(hero.id as 'ironman' | 'spiderman');
                  }
                }}
                className={`relative rounded-2xl p-5 border transition-all flex flex-col justify-between group ${
                  hero.isAvailable
                    ? 'cursor-pointer hover:scale-[1.02] bg-[#10162B] hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]'
                    : 'cursor-not-allowed opacity-50 bg-[#0A0D18] border-white/5'
                } ${
                  isSelected
                    ? hero.id === 'ironman'
                      ? 'border-amber-400 ring-2 ring-amber-400/40 bg-[#1A1828] shadow-[0_0_25px_rgba(212,162,47,0.3)]'
                      : 'border-red-500 ring-2 ring-red-500/40 bg-[#1B1424] shadow-[0_0_25px_rgba(226,54,54,0.3)]'
                    : hero.isAvailable
                    ? 'border-white/10 hover:border-white/30'
                    : 'border-white/5'
                }`}
              >
                {/* Status Pill */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-md"
                    style={{
                      backgroundColor: `${hero.primaryColor}20`,
                      borderColor: `${hero.primaryColor}50`,
                      color: hero.primaryColor,
                    }}
                  >
                    {getHeroIcon(hero.iconName)}
                  </div>

                  {hero.isAvailable ? (
                    isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-full shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" /> CURRENT EXPERIENCE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full group-hover:border-emerald-400 transition">
                        <Play className="w-2.5 h-2.5 fill-emerald-400" /> LAUNCH READY
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-white/10 px-2.5 py-0.5 rounded-full">
                      IN DEVELOPMENT
                    </span>
                  )}
                </div>

                {/* Hero Info */}
                <div>
                  <h3
                    className="font-sans font-black text-2xl text-white tracking-tight group-hover:text-amber-300 transition"
                    style={{
                      color: isSelected ? hero.primaryColor : undefined,
                    }}
                  >
                    {hero.name}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-400 mb-1">
                    {hero.alias}
                  </p>
                  <p className="text-xs text-zinc-300 italic mb-3">
                    "{hero.tagline}"
                  </p>
                </div>

                {/* 3D Action Preview */}
                <div className="mt-2 pt-2.5 border-t border-white/10">
                  <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
                    3D Scroll Mechanic:
                  </div>
                  <div
                    className="text-xs font-medium bg-black/50 p-2.5 rounded-lg border border-white/5"
                    style={{ color: hero.accentColor }}
                  >
                    {hero.action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#070912] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 font-mono">
          <div>
            Select <strong className="text-amber-400">Iron Man</strong> or <strong className="text-marvel-red">Spider-Man</strong> to experience bespoke 3D scrollytelling.
          </div>
          <div className="text-[11px] text-zinc-400">
            Powered by Lenis + GSAP + Procedural Web Audio
          </div>
        </div>
      </div>
    </div>
  );
};
