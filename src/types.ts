// Marvel Universe Heroes Architecture Types
export type MarvelHeroId = 'ironman' | 'spiderman' | 'captainamerica' | 'thor' | 'wolverine';

export interface MarvelHeroChapter {
  id: string;
  stageName: string;
  title: string;
  subtitle: string;
  quote: string;
  quoteAuthor: string;
  quoteSource: string;
  telemetry: {
    labelA: string;
    valueA: string;
    labelB: string;
    valueB: string;
    labelC: string;
    valueC: string;
  };
}

export interface MarvelHeroMeta {
  id: MarvelHeroId;
  name: string;
  alias: string;
  title: string;
  tagline: string;
  quote: string;
  team: string;
  era: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  soundCue: string;
  stats: {
    power: number;
    speed: number;
    combat: number;
    durability: number;
    intelligence: number;
  };
  signatureSystems: {
    systemName: string;
    systemDescription: string;
    interactiveAction: string;
  };
  suits: string[];
  weapons: string[];
  chapters: MarvelHeroChapter[];
}
