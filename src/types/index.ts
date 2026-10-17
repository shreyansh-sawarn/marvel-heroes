export type SpiderHeroId = 
  | 'spiderman'   // Peter Parker - Earth-616
  | 'miles'       // Miles Morales - Earth-1610
  | 'gwen'        // Spider-Gwen / Ghost-Spider - Earth-65
  | 'spider2099'  // Miguel O'Hara - Earth-928
  | 'spidernoir'  // Peter Parker Noir - Earth-90214
  | 'venom'       // Eddie Brock / Symbiote - Klyntar Hive
  | 'carnage'     // Cletus Kasady - Klyntar Psychosis
  | 'spiderpunk'; // Hobie Brown - Earth-138

export interface SpiderHeroMeta {
  id: SpiderHeroId;
  name: string;
  alias: string;
  universe: string;
  earthDesignation: string;
  tagline: string;
  quote: string;
  badge: string;
  era: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  soundCue: string;
  // Stats
  agility: number; // 0-100
  strength: number; // 0-100
  spiderSense: number; // 0-100
  biotechBioelectric: number; // 0-100 (Venom / Bio-electric / Symbiote)
  temporalDisruptionRisk: number; // 0-100
  // Details
  suits: string[];
  weapons: string[];
  archNemesis: string[];
  signatureMechanic: string;
  symbioteVariantName: string;
  symbioteDescription: string;
}

export type SpiderStage = 'perch' | 'dive' | 'swing' | 'apex' | 'wallstick';

export interface SceneStageInfo {
  id: SpiderStage;
  title: string;
  description: string;
  actionText: string;
  soundCue?: string;
  comicExclamation?: string;
}

export interface SymbioteState {
  isInfested: boolean;
  intensity: number; // 0 to 1
  hostHeroId: SpiderHeroId;
  hiveResonance: number; // 0-100%
  sonicVulnerability: number; // 0-100%
}
