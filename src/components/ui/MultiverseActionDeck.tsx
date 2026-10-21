import React, { useState, useEffect, useRef } from 'react';
import { SpiderHeroMeta, SpiderHeroId } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  Music,
  Play,
  Pause,
  Keyboard,
  Crosshair,
  Swords,
  FlaskConical,
  Cpu,
} from 'lucide-react';

interface MultiverseActionDeckProps {
  activeHero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onSelectHero: (heroId: SpiderHeroId) => void;
  onToggleSymbiote: () => void;
  onOpenMultiverseModal: () => void;
}

export const MultiverseActionDeck: React.FC<MultiverseActionDeckProps> = ({
  activeHero,
  isSymbioteSurge,
  onSelectHero,
  onToggleSymbiote,
  onOpenMultiverseModal,
}) => {
  const [isPlayingOST, setIsPlayingOST] = useState(false);
  const [isWebCrosshairActive, setIsWebCrosshairActive] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webSilkCanvasRef = useRef<HTMLCanvasElement>(null);

  // Global Web Silk Strands State
  interface SilkStrand {
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    color: string;
    life: number;
    maxLife: number;
  }
  const strandsRef = useRef<SilkStrand[]>([]);

  // Track OST Hero Changes
  useEffect(() => {
    if (isPlayingOST) {
      soundEngine.setOSTHero(activeHero.id);
    }
  }, [activeHero.id, isPlayingOST]);

  // Audio Spectrum Visualizer Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = () => {
      const data = soundEngine.getAudioFrequencyData();
      const w = canvas.width = 110;
      const h = canvas.height = 24;

      ctx.clearRect(0, 0, w, h);

      const barCount = 14;
      const barWidth = 5;
      const gap = 3;

      for (let i = 0; i < barCount; i++) {
        const val = isPlayingOST ? (data[i * 2] || Math.random() * 80 + 30) : 6;
        const barH = Math.max(3, (val / 255) * h);
        const x = i * (barWidth + gap);
        const y = h - barH;

        ctx.fillStyle = isPlayingOST ? activeHero.primaryColor : 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x, y, barWidth, barH);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeHero.primaryColor, isPlayingOST]);

  // Global Web Shooting Canvas Loop
  useEffect(() => {
    const canvas = webSilkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = strandsRef.current.length - 1; i >= 0; i--) {
        const s = strandsRef.current[i];
        s.life--;
        const alpha = Math.max(0, s.life / s.maxLife);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(s.startX, s.startY);
        // Slight sag in web filament
        const midX = (s.startX + s.targetX) / 2;
        const midY = (s.startY + s.targetY) / 2 + 15;
        ctx.quadraticCurveTo(midX, midY, s.targetX, s.targetY);

        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Target Anchor Splat
        ctx.beginPath();
        ctx.arc(s.targetX, s.targetY, 7, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();

        ctx.restore();

        if (s.life <= 0) strandsRef.current.splice(i, 1);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Web Shooting Function
  const shootWebAtPoint = (targetX: number, targetY: number) => {
    soundEngine.playWebShoot();
    const startX = window.innerWidth * 0.5 + (Math.random() - 0.5) * 80;
    const startY = window.innerHeight;

    strandsRef.current.push({
      startX,
      startY,
      targetX,
      targetY,
      color: isSymbioteSurge ? '#A855F7' : activeHero.primaryColor,
      life: 140,
      maxLife: 140,
    });
  };

  // Global Click listener when Web Mode is active
  useEffect(() => {
    if (!isWebCrosshairActive) return;

    const onPointerDown = (e: MouseEvent) => {
      // Don't intercept clicks inside bottom deck or buttons
      if ((e.target as HTMLElement)?.closest('.action-deck-ui')) return;
      shootWebAtPoint(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [isWebCrosshairActive, isSymbioteSurge, activeHero.primaryColor]);

  // Global Keyboard Shortcuts (1-8, Space, S, P, B, M)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const heroKeys: Record<string, SpiderHeroId> = {
        Digit1: 'spiderman',
        Digit2: 'miles',
        Digit3: 'gwen',
        Digit4: 'spider2099',
        Digit5: 'spidernoir',
        Digit6: 'venom',
        Digit7: 'carnage',
        Digit8: 'spiderpunk',
      };

      if (heroKeys[e.code]) {
        e.preventDefault();
        onSelectHero(heroKeys[e.code]);
        return;
      }

      if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onToggleSymbiote();
        return;
      }

      if (e.code === 'KeyP') {
        e.preventDefault();
        toggleMusic();
        return;
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        onOpenMultiverseModal();
        return;
      }

      if (e.code === 'KeyW' && !e.ctrlKey && !e.metaKey) {
        setIsWebCrosshairActive((prev) => !prev);
        soundEngine.playHudClick();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSelectHero, onToggleSymbiote, onOpenMultiverseModal]);

  const toggleMusic = () => {
    const nowPlaying = soundEngine.toggleMultiverseOST(activeHero.id);
    setIsPlayingOST(nowPlaying);
  };

  const getHeroThemeTitle = (id: SpiderHeroId) => {
    switch (id) {
      case 'spiderman': return 'E-616: Heroic Overture & Brass Fanfare';
      case 'miles': return 'E-1610: Brooklyn 808 Trap & Sub-Bass';
      case 'gwen': return 'E-65: The Mary Janes Live Drum Rhythm';
      case 'spider2099': return 'E-928: Nueva York Cyberpunk Darksynth';
      case 'spidernoir': return 'E-90214: 1933 Harlem Jazz Noir & Rain';
      case 'spiderpunk': return 'E-138: 15,000-Watt Camden Skate-Punk';
      case 'venom': return 'Klyntar: Subterranean Obsidian Pulse';
      case 'carnage': return 'Klyntar: Chaotic Crimson Dissonance';
    }
  };

  return (
    <>
      {/* Fullscreen Overlay Canvas for Web Filaments */}
      <canvas
        ref={webSilkCanvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full block"
      />

      {/* Crosshair indicator when web mode active */}
      {isWebCrosshairActive && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black/80 border border-hero-primary px-4 py-1.5 rounded-full text-xs font-mono text-white flex items-center gap-2 shadow-2xl backdrop-blur-md animate-pulse">
          <Crosshair className="w-4 h-4 text-hero-primary" />
          <span>WEB-SLINGER MODE ACTIVE // CLICK ANYWHERE TO THWIP!</span>
        </div>
      )}

      {/* Floating Action Deck Dock at Bottom of Screen */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[94%] sm:w-auto action-deck-ui">
        <div className="bg-[#080B18]/90 backdrop-blur-xl border border-white/15 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-wrap items-center justify-between gap-3 text-white">
          {/* Section 1: Procedural OST Player */}
          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl">
            <button
              onClick={toggleMusic}
              className="w-8 h-8 rounded-full bg-hero-primary hover:brightness-110 active:scale-95 flex items-center justify-center transition shadow-md"
              title={isPlayingOST ? 'Pause Procedural OST' : 'Play Procedural OST'}
            >
              {isPlayingOST ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
            </button>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Music className="w-3 h-3 text-hero-primary" />
                <span>PROCEDURAL OST</span>
              </span>
              <span className="text-xs font-mono font-bold truncate max-w-[150px] sm:max-w-[210px] text-white">
                {getHeroThemeTitle(activeHero.id)}
              </span>
            </div>

            {/* Audio Wave Bars Canvas */}
            <canvas ref={canvasRef} className="hidden sm:block ml-1 opacity-90" />
          </div>

          {/* Section 2: Quick Jump Buttons */}
          <div className="flex items-center space-x-1.5 font-mono text-xs">
            {/* Toggle Web Mode */}
            <button
              onClick={() => {
                setIsWebCrosshairActive(!isWebCrosshairActive);
                soundEngine.playHudClick();
              }}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 transition ${
                isWebCrosshairActive
                  ? 'bg-hero-primary border-hero-primary text-white font-bold'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
              title="Click anywhere on screen to shoot dynamic webs (HotKey: W)"
            >
              <Crosshair className="w-4 h-4" />
              <span className="hidden sm:inline">WEB MODE</span>
            </button>

            {/* Jump to Crisis Arena */}
            <button
              onClick={() => {
                const el = document.getElementById('crisis-arena-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                soundEngine.playHudClick();
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
              title="Jump to Multiverse Crisis Battle Arena"
            >
              <Swords className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">ARENA</span>
            </button>

            {/* Jump to Tech Lab */}
            <button
              onClick={() => {
                const el = document.getElementById('tech-lab-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                soundEngine.playHudClick();
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
              title="Jump to Peter Parker Tech Lab"
            >
              <FlaskConical className="w-4 h-4 text-[#00B4D8]" />
              <span className="hidden sm:inline">LAB</span>
            </button>

            {/* Jump to Canon Terminal */}
            <button
              onClick={() => {
                const el = document.getElementById('canon-terminal-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                soundEngine.playHudClick();
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
              title="Jump to Canon Event Terminal"
            >
              <Cpu className="w-4 h-4 text-[#00F0FF]" />
              <span className="hidden sm:inline">CANON</span>
            </button>

            {/* Keyboard Shortcuts Help */}
            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition"
              title="View Keyboard Hotkeys Cheat-Sheet"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0E1D] border border-white/20 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
            <h3 className="font-comic text-2xl text-white tracking-wide mb-1 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-hero-primary" />
              <span>MULTIVERSE ACTION HOTKEYS</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-mono">
              Direct physical keyboard commands for seamless web-slinging:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                <span className="text-zinc-300">Shoot Web Filaments:</span>
                <kbd className="px-2.5 py-1 rounded bg-white/10 text-hero-primary font-bold">[W] or [Space]</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                <span className="text-zinc-300">Warp to Heroes 1 through 8:</span>
                <kbd className="px-2.5 py-1 rounded bg-white/10 text-yellow-400 font-bold">[1] - [8]</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                <span className="text-zinc-300">Global Symbiote Surge:</span>
                <kbd className="px-2.5 py-1 rounded bg-white/10 text-purple-400 font-bold">[S]</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                <span className="text-zinc-300">Procedural OST Play/Pause:</span>
                <kbd className="px-2.5 py-1 rounded bg-white/10 text-emerald-400 font-bold">[P]</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                <span className="text-zinc-300">Open Reality Selector:</span>
                <kbd className="px-2.5 py-1 rounded bg-white/10 text-cyan-400 font-bold">[M]</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-hero-primary text-white font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 transition"
            >
              DISMISS GUIDE
            </button>
          </div>
        </div>
      )}
    </>
  );
};
