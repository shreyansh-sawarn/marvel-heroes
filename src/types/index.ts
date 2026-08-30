export type HeroId = 'spiderman' | 'ironman' | 'blackwidow' | 'captainamerica' | 'hulk' | 'thor';

export interface HeroMeta {
  id: HeroId;
  name: string;
  alias: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  action: string;
  iconName: string;
  isAvailable: boolean;
  comingSoon?: boolean;
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
