import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SpiderHeroMeta, SpiderHeroId } from '../types';
import { soundEngine } from '../services/soundEngine';
import { SPIDER_HEROES } from '../data/spiderHeroes';
import {
  Radio,
  Volume2,
  Sparkles,
  Flame,
  RotateCcw,
  Crosshair,
} from 'lucide-react';

interface HeroStageProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onToggleSymbiote: () => void;
  onSelectHero: (heroId: SpiderHeroId) => void;
}

interface WebStrand {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  oscillation: number;
  frequency: number;
  amplitude: number;
  life: number;
  maxLife: number;
  color: string;
  isSymbiote: boolean;
}

interface TendrilSpur {
  originX: number;
  originY: number;
  angle: number;
  length: number;
  targetLength: number;
  curl: number;
  curlSpeed: number;
  width: number;
  color: string;
}

interface SlimeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

interface ComicBurst {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  rotation: number;
  scale: number;
}

export const HeroStage: React.FC<HeroStageProps> = ({
  hero,
  isSymbioteSurge,
  onToggleSymbiote,
  onSelectHero,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [spiderSenseActive, setSpiderSenseActive] = useState(false);
  const [sonicFreq, setSonicFreq] = useState(880);
  const [webAmmo, setWebAmmo] = useState(100);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [infestProgress, setInfestProgress] = useState(isSymbioteSurge ? 1 : 0);
  const [bursts, setBursts] = useState<ComicBurst[]>([]);

  // Mouse & Parallax tracking
  const mouseRef = useRef({
    x: 0,
    y: 0,
    normX: 0,
    normY: 0,
    targetNormX: 0,
    targetNormY: 0,
  });

  const websRef = useRef<WebStrand[]>([]);
  const tendrilsRef = useRef<TendrilSpur[]>([]);
  const particlesRef = useRef<SlimeParticle[]>([]);
  const shakeRef = useRef(0);

  // Images
  const heroImgRef = useRef<HTMLImageElement | null>(null);
  const symImgRef = useRef<HTMLImageElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Asset mapping for each hero
  const getHeroAssets = useCallback((id: SpiderHeroId) => {
    switch (id) {
      case 'miles':
        return {
          hero: '/assets/miles_hero.png',
          symbiote: '/assets/miles_symbiote_hero.png',
          bg: '/assets/nyc_skyline.jpg',
        };
      case 'gwen':
        return {
          hero: '/assets/gwen_hero.png',
          symbiote: '/assets/gwen_symbiote_hero.png',
          bg: '/assets/nyc_skyline.jpg',
        };
      case 'spider2099':
        return {
          hero: '/assets/spider2099_hero.png',
          symbiote: '/assets/spider2099_symbiote_hero.png',
          bg: '/assets/cyberpunk_2099_bg.jpg',
        };
      case 'spidernoir':
        return {
          hero: '/assets/noir_hero.png',
          symbiote: '/assets/noir_symbiote_hero.png',
          bg: '/assets/nyc_skyline.jpg',
        };
      case 'venom':
        return {
          hero: '/assets/venom_hero.png',
          symbiote: '/assets/venom_hero.png',
          bg: '/assets/nyc_skyline.jpg',
        };
      case 'carnage':
        return {
          hero: '/assets/carnage_hero.png',
          symbiote: '/assets/carnage_hero.png',
          bg: '/assets/nyc_skyline.jpg',
        };
      case 'spiderpunk':
        return {
          hero: '/assets/punk_hero.png',
          symbiote: '/assets/punk_symbiote_hero.png',
          bg: '/assets/nyc_skyline.jpg',
        };
      case 'spiderman':
      default:
        return {
          hero: '/assets/spidey_crouch_clean.png',
          symbiote: '/assets/symbiote_black_hero.png',
          bg: '/assets/nyc_skyline.jpg',
        };
    }
  }, []);

  // Preload assets & setup tendril anchors across anatomy
  useEffect(() => {
    setIsLoaded(false);
    const assets = getHeroAssets(hero.id);
    let count = 0;
    const check = () => {
      count++;
      if (count >= 3) setIsLoaded(true);
    };

    const hImg = new Image();
    hImg.src = assets.hero;
    hImg.onload = () => {
      heroImgRef.current = hImg;
      check();
    };
    hImg.onerror = check;

    const sImg = new Image();
    sImg.src = assets.symbiote;
    sImg.onload = () => {
      symImgRef.current = sImg;
      check();
    };
    sImg.onerror = check;

    const bImg = new Image();
    bImg.src = assets.bg;
    bImg.onload = () => {
      bgImgRef.current = bImg;
      check();
    };
    bImg.onerror = check;

    // Anatomical body anchors for living tendrils
    const anchors = [
      { x: -35, y: -130, angle: -Math.PI * 0.75 },
      { x: 35, y: -130, angle: -Math.PI * 0.25 },
      { x: -65, y: -75, angle: -Math.PI * 0.9 },
      { x: 65, y: -75, angle: -Math.PI * 0.1 },
      { x: -95, y: -15, angle: Math.PI },
      { x: 95, y: -15, angle: 0 },
      { x: -25, y: -45, angle: -Math.PI * 0.5 },
      { x: 25, y: -45, angle: -Math.PI * 0.5 },
      { x: 0, y: -10, angle: Math.PI * 0.5 },
      { x: -45, y: 45, angle: Math.PI * 0.65 },
      { x: 45, y: 45, angle: Math.PI * 0.35 },
      { x: -85, y: 110, angle: Math.PI * 0.8 },
      { x: 85, y: 110, angle: Math.PI * 0.2 },
      { x: 0, y: -180, angle: -Math.PI * 0.5 },
    ];

    const spurs: TendrilSpur[] = [];
    anchors.forEach((bp, idx) => {
      for (let k = 0; k < 2; k++) {
        spurs.push({
          originX: bp.x + (Math.random() - 0.5) * 15,
          originY: bp.y + (Math.random() - 0.5) * 15,
          angle: bp.angle + (Math.random() - 0.5) * 0.6,
          length: 20,
          targetLength: 80 + Math.random() * 140,
          curl: Math.random() * Math.PI * 2,
          curlSpeed: 0.02 + Math.random() * 0.04,
          width: 5 + Math.random() * 7,
          color: idx % 2 === 0 ? '#3B0764' : '#6B21A8',
        });
      }
    });
    tendrilsRef.current = spurs;
  }, [getHeroAssets, hero.id]);

  // Infest progress interpolation
  useEffect(() => {
    let anim: number;
    const target = isSymbioteSurge ? 1 : 0;
    const step = () => {
      setInfestProgress((c) => {
        const diff = target - c;
        if (Math.abs(diff) < 0.01) return target;
        return c + diff * 0.08;
      });
      if (Math.abs(target - infestProgress) >= 0.01) {
        anim = requestAnimationFrame(step);
      }
    };
    anim = requestAnimationFrame(step);
    return () => cancelAnimationFrame(anim);
  }, [infestProgress, isSymbioteSurge]);

  // Mouse Parallax Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.targetNormX = (x / rect.width) * 2 - 1;
    mouseRef.current.targetNormY = (y / rect.height) * 2 - 1;
  };

  // Trigger Spider-Sense Precognitive Wave
  const triggerSpiderSense = () => {
    setSpiderSenseActive(true);
    soundEngine.playSpiderSense();
    setTimeout(() => setSpiderSenseActive(false), 900);
  };

  // Interactive Web-Shoot on click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    if (webAmmo <= 0) {
      soundEngine.playTensileSnap();
      return;
    }

    setWebAmmo((prev) => Math.max(0, prev - 8));
    const heroX = rect.width / 2;
    const heroY = rect.height * 0.52;

    if (isSymbioteSurge) {
      // Visceral Symbiote Tendril Lash
      soundEngine.playSymbioteTendril();
      shakeRef.current = 10;

      websRef.current.push({
        id: Date.now() + Math.random(),
        startX: heroX,
        startY: heroY,
        targetX,
        targetY,
        progress: 0,
        oscillation: 0,
        frequency: 8,
        amplitude: 35,
        life: 140,
        maxLife: 140,
        color: '#A855F7',
        isSymbiote: true,
      });

      // Viscous slime splatter
      for (let i = 0; i < 18; i++) {
        const speed = 2 + Math.random() * 7;
        const angle = Math.random() * Math.PI * 2;
        particlesRef.current.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          radius: 2.5 + Math.random() * 5,
          alpha: 1,
          color: Math.random() > 0.5 ? '#A855F7' : '#05020B',
        });
      }

      spawnBurst(targetX, targetY, 'WHIP!', '#A855F7');
    } else {
      // Snappy Pneumatic Web Shoot
      soundEngine.playWebShoot();
      shakeRef.current = 3;

      websRef.current.push({
        id: Date.now() + Math.random(),
        startX: heroX + (targetX > heroX ? 30 : -30),
        startY: heroY - 20,
        targetX,
        targetY,
        progress: 0,
        oscillation: 0,
        frequency: 14,
        amplitude: 18,
        life: 180,
        maxLife: 180,
        color: hero.accentColor || '#00B4D8',
        isSymbiote: false,
      });

      spawnBurst(targetX, targetY, 'THWIP!', hero.primaryColor);
    }
  };

  const spawnBurst = (x: number, y: number, text: string, color: string) => {
    const burst: ComicBurst = {
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      rotation: (Math.random() - 0.5) * 0.4,
      scale: 0.8,
    };
    setBursts((prev) => [...prev.slice(-3), burst]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burst.id));
    }, 850);
  };

  // Ring Cathedral Sonic Bell (Purges Symbiote)
  const triggerSonicPurge = () => {
    soundEngine.playSonicScreech(sonicFreq);
    shakeRef.current = 14;

    tendrilsRef.current.forEach((t) => {
      t.targetLength = 20;
    });

    if (isSymbioteSurge) {
      setTimeout(() => {
        onToggleSymbiote();
      }, 350);
    }
  };

  // RENDER ANIMATION PIPELINE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1200);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 750);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      const dt = isSlowMo ? 0.005 : 0.025;
      time += dt;

      // Mouse Parallax Lerp
      mouseRef.current.normX += (mouseRef.current.targetNormX - mouseRef.current.normX) * 0.08;
      mouseRef.current.normY += (mouseRef.current.targetNormY - mouseRef.current.normY) * 0.08;

      // Screen Shake
      let sx = 0;
      let sy = 0;
      if (shakeRef.current > 0) {
        sx = (Math.random() - 0.5) * shakeRef.current;
        sy = (Math.random() - 0.5) * shakeRef.current;
        shakeRef.current *= 0.88;
      }

      ctx.save();
      ctx.translate(sx, sy);

      // 1. SKYLINE / ENVIRONMENT BACKDROP
      ctx.fillStyle = isSymbioteSurge ? '#050209' : '#070913';
      ctx.fillRect(0, 0, width, height);

      const bg = bgImgRef.current;
      if (bg && bg.complete && bg.naturalWidth > 0) {
        ctx.save();
        const panX = -mouseRef.current.normX * 35;
        const panY = -mouseRef.current.normY * 20;
        const scale = Math.max(width / bg.naturalWidth, height / bg.naturalHeight) * 1.08;
        const bw = bg.naturalWidth * scale;
        const bh = bg.naturalHeight * scale;

        ctx.globalAlpha = isSymbioteSurge ? 0.22 : 0.45;
        ctx.drawImage(bg, (width - bw) / 2 + panX, (height - bh) / 2 + panY, bw, bh);

        // Atmosphere Wash
        if (isSymbioteSurge) {
          const fog = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.7);
          fog.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
          fog.addColorStop(0.5, 'rgba(30, 4, 45, 0.45)');
          fog.addColorStop(1, 'rgba(5, 2, 9, 0.85)');
          ctx.fillStyle = fog;
          ctx.fillRect(0, 0, width, height);
        } else {
          const sunset = ctx.createLinearGradient(0, 0, 0, height);
          sunset.addColorStop(0, 'rgba(251, 146, 60, 0.12)');
          sunset.addColorStop(0.6, 'rgba(226, 54, 54, 0.1)');
          sunset.addColorStop(1, 'rgba(7, 9, 19, 0.8)');
          ctx.fillStyle = sunset;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      }

      // Halftone Comic Dot Matrix
      ctx.save();
      ctx.fillStyle = isSymbioteSurge ? 'rgba(168, 85, 247, 0.04)' : 'rgba(255, 255, 255, 0.03)';
      for (let dx = 0; dx < width; dx += 28) {
        for (let dy = 0; dy < height; dy += 28) {
          ctx.beginPath();
          ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 2. HERO CENTER STAGE
      const centerX = width / 2;
      const centerY = height * 0.52;
      const heroParallaxX = mouseRef.current.normX * 18;
      const heroParallaxY = mouseRef.current.normY * 12;
      const heroTilt = mouseRef.current.normX * 0.035;

      // Grounding Shadow
      ctx.save();
      ctx.translate(centerX + heroParallaxX * 0.4, height * 0.88);
      ctx.beginPath();
      ctx.ellipse(0, 0, 160 + infestProgress * 40, 35, 0, 0, Math.PI * 2);
      ctx.fillStyle = isSymbioteSurge ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0, 0, 0, 0.6)';
      ctx.shadowColor = isSymbioteSurge ? '#A855F7' : 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 40;
      ctx.fill();
      ctx.restore();

      // Character Rendering (Classic Suit & Symbiote Suit with smooth crossfade)
      const normalImg = heroImgRef.current;
      const symImg = symImgRef.current;
      const targetH = Math.min(height * 0.78, 620);

      // Normal Hero
      if (normalImg && normalImg.complete && normalImg.naturalWidth > 0) {
        const ratio = targetH / normalImg.naturalHeight;
        const nw = normalImg.naturalWidth * ratio;
        const nh = targetH;

        ctx.save();
        ctx.translate(centerX + heroParallaxX, centerY + heroParallaxY);
        ctx.rotate(heroTilt);
        ctx.globalAlpha = Math.max(0, 1 - infestProgress);

        ctx.shadowColor = hero.primaryColor;
        ctx.shadowBlur = spiderSenseActive ? 55 : 20;

        ctx.drawImage(normalImg, -nw / 2, -nh / 2, nw, nh);
        ctx.restore();
      }

      // Symbiote Metamorphosis
      if (symImg && symImg.complete && symImg.naturalWidth > 0 && infestProgress > 0.01) {
        const ratio = targetH / symImg.naturalHeight;
        const sw = symImg.naturalWidth * ratio;
        const sh = targetH;

        ctx.save();
        ctx.translate(centerX + heroParallaxX, centerY + heroParallaxY);
        ctx.rotate(heroTilt);
        ctx.globalAlpha = infestProgress;

        ctx.shadowColor = '#A855F7';
        ctx.shadowBlur = 45;

        ctx.drawImage(symImg, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();
      }

      // 3. LIVING PROCEDURAL SYMBIOTE TENDRIL METAMORPHOSIS OVERLAY
      if (infestProgress > 0.05) {
        ctx.save();
        ctx.translate(centerX + heroParallaxX, centerY + heroParallaxY);

        tendrilsRef.current.forEach((t) => {
          t.curl += t.curlSpeed;
          const currentLen = t.targetLength * infestProgress;

          ctx.beginPath();
          ctx.moveTo(t.originX, t.originY);

          const segments = 12;
          let px = t.originX;
          let py = t.originY;
          const segLen = currentLen / segments;

          // React to cursor when mouse is near
          const distToMouse = Math.hypot(
            mouseRef.current.x - (centerX + heroParallaxX + t.originX),
            mouseRef.current.y - (centerY + heroParallaxY + t.originY)
          );
          const lashFactor = distToMouse < 240 ? 0.35 : 0;
          const cursorAngle = Math.atan2(
            mouseRef.current.y - (centerY + heroParallaxY + t.originY),
            mouseRef.current.x - (centerX + heroParallaxX + t.originX)
          );

          for (let s = 1; s <= segments; s++) {
            const wave = Math.sin(t.curl + s * 0.4 + time * 3) * (18 * infestProgress);
            let segAngle = t.angle + (wave * Math.PI) / 180;
            if (lashFactor > 0) {
              segAngle = segAngle * (1 - lashFactor) + cursorAngle * lashFactor;
            }

            px += Math.cos(segAngle) * segLen;
            py += Math.sin(segAngle) * segLen;
            ctx.lineTo(px, py);
          }

          // Outer Tendril Glow
          ctx.strokeStyle = t.color;
          ctx.lineWidth = t.width * infestProgress;
          ctx.lineCap = 'round';
          ctx.shadowColor = '#A855F7';
          ctx.shadowBlur = 18;
          ctx.stroke();

          // Black Core Tendril
          ctx.strokeStyle = '#050209';
          ctx.lineWidth = Math.max(1.5, t.width * 0.45 * infestProgress);
          ctx.stroke();

          // Viscous Barb at the tip
          ctx.beginPath();
          ctx.arc(px, py, Math.max(2, t.width * 0.35 * infestProgress), 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        });

        ctx.restore();
      }

      // 4. SPIDER-SENSE PRECISION RADIAL RINGS
      if (spiderSenseActive) {
        ctx.save();
        ctx.translate(centerX + heroParallaxX, centerY - 60 + heroParallaxY);
        for (let r = 1; r <= 3; r++) {
          const radius = r * 55 + Math.sin(time * 12 + r) * 12;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.strokeStyle = isSymbioteSurge ? '#A855F7' : '#FACC15';
          ctx.lineWidth = 3;
          ctx.shadowColor = isSymbioteSurge ? '#A855F7' : '#FACC15';
          ctx.shadowBlur = 24;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. PHYSICAL ELASTIC WEB STRANDS
      for (let i = websRef.current.length - 1; i >= 0; i--) {
        const web = websRef.current[i];
        web.life--;
        web.progress = Math.min(1, web.progress + 0.12);
        web.oscillation += web.frequency * 0.05;

        const currEndX = web.startX + (web.targetX - web.startX) * web.progress;
        const currEndY = web.startY + (web.targetY - web.startY) * web.progress;

        const midX = (web.startX + currEndX) / 2;
        const springOffset = Math.sin(web.oscillation) * web.amplitude * (web.life / web.maxLife);
        const midY = (web.startY + currEndY) / 2 + springOffset;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(web.startX, web.startY);
        ctx.quadraticCurveTo(midX, midY, currEndX, currEndY);

        ctx.strokeStyle = web.color;
        ctx.lineWidth = web.isSymbiote ? 6 : 3;
        ctx.lineCap = 'round';
        ctx.shadowColor = web.color;
        ctx.shadowBlur = web.isSymbiote ? 16 : 8;
        ctx.globalAlpha = Math.max(0, web.life / web.maxLife);
        ctx.stroke();

        // Secondary silk filaments
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(web.startX, web.startY);
        ctx.quadraticCurveTo(midX, midY - 3, currEndX, currEndY);
        ctx.stroke();

        // Web Anchor Splatter Impact
        if (web.progress >= 0.95) {
          ctx.beginPath();
          ctx.arc(web.targetX, web.targetY, web.isSymbiote ? 9 : 6, 0, Math.PI * 2);
          ctx.fillStyle = web.color;
          ctx.fill();
        }

        ctx.restore();

        if (web.life <= 0) {
          websRef.current.splice(i, 1);
        }
      }

      // 6. VISCOUS SLIME PARTICLES
      for (let p = particlesRef.current.length - 1; p >= 0; p--) {
        const pt = particlesRef.current[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.2;
        pt.alpha -= 0.02;

        if (pt.alpha <= 0) {
          particlesRef.current.splice(p, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [hero.accentColor, hero.primaryColor, infestProgress, isSlowMo, isSymbioteSurge, spiderSenseActive]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[90vh] min-h-[640px] bg-[#070913] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] select-none flex flex-col justify-between"
    >
      {/* Interactive WebGL / Canvas Stage */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full block cursor-crosshair z-10"
      />

      {/* Synchronization Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-hero-primary animate-ping" />
            <span>SYNCHRONIZING HERO DIMENSION...</span>
          </div>
        </div>
      )}

      {/* Dynamic Comic Bursts ("THWIP!", "WHIP!") */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {bursts.map((b) => (
          <div
            key={b.id}
            style={{
              left: `${b.x}px`,
              top: `${b.y}px`,
              transform: `translate(-50%, -50%) rotate(${b.rotation}rad) scale(${b.scale})`,
              color: b.color,
              textShadow: '0 0 20px rgba(0,0,0,0.9), 3px 3px 0 #000, -2px -2px 0 #000',
            }}
            className="absolute font-comic text-4xl sm:text-5xl font-extrabold tracking-wider transition-all duration-300 animate-bounce pointer-events-none"
          >
            {b.text}
          </div>
        ))}
      </div>

      {/* TOP HUD: Hero Identity */}
      <div className="relative z-30 pt-24 md:pt-28 px-6 sm:px-10 flex items-start justify-between pointer-events-none">
        <div className="pointer-events-auto bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md shadow-2xl">
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: isSymbioteSurge ? '#A855F7' : hero.primaryColor }}
            />
            <span>{hero.earthDesignation} // {hero.badge}</span>
          </div>
          <h1 className="font-comic text-4xl sm:text-6xl text-white tracking-wide leading-none">
            {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
          </h1>
          <p className="text-xs text-zinc-300 font-sans mt-1.5 font-semibold">
            {hero.name} · {hero.tagline}
          </p>
        </div>

        {/* Top Right Action Quick Controls */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* Spider-Sense Radar Trigger */}
          <button
            onClick={triggerSpiderSense}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-black/80 hover:bg-black border border-yellow-500/40 text-yellow-300 font-mono text-xs font-bold transition shadow-lg active:scale-95"
          >
            <Radio className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="hidden sm:inline">SPIDER-SENSE</span>
          </button>

          {/* Slow-Mo Time Dilation */}
          <button
            onClick={() => {
              soundEngine.playHudClick();
              setIsSlowMo(!isSlowMo);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border text-xs font-mono font-bold transition active:scale-95 ${
              isSlowMo
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                : 'bg-black/80 hover:bg-black border-white/20 text-zinc-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{isSlowMo ? '15% SLOW-MO' : 'BULLET TIME'}</span>
          </button>
        </div>
      </div>

      {/* BOTTOM HUD: Web Shooter Ammo & Cathedral Bell Purge */}
      <div className="relative z-30 pb-6 px-6 sm:px-10 flex flex-wrap items-end justify-between gap-4 pointer-events-none">
        {/* Left: Web-Shooter Ammo Gauge */}
        <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-hero-primary" />
              <span>INTERACTIVE WEB-SHOOTER HUD</span>
            </span>
            <button
              onClick={() => {
                soundEngine.playTensileSnap();
                setWebAmmo(100);
              }}
              title="Reload Cartridges"
              className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" /> RELOAD
            </button>
          </div>

          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${webAmmo}%`,
                backgroundColor: isSymbioteSurge ? '#A855F7' : hero.accentColor || '#00B4D8',
              }}
            />
          </div>

          <p className="text-xs font-mono text-zinc-300 leading-snug">
            {isSymbioteSurge ? (
              <span className="text-purple-300">
                Living biomass active! Click anywhere to whip crushing black tendrils.
              </span>
            ) : (
              <span>Click or drag anywhere across the screen to shoot elastic web anchors!</span>
            )}
          </p>
        </div>

        {/* Center: Multiverse 8-Hero Quick Dial */}
        <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 shadow-2xl flex items-center gap-1.5 overflow-x-auto max-w-md">
          {(Object.keys(SPIDER_HEROES) as SpiderHeroId[]).map((hId) => {
            const h = SPIDER_HEROES[hId];
            const isCurrent = hId === hero.id;
            return (
              <button
                key={hId}
                onClick={() => {
                  soundEngine.playHeroSwitchDetailed(hId, isSymbioteSurge);
                  onSelectHero(hId);
                }}
                title={`${h.alias} (${h.earthDesignation})`}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center space-x-1.5 active:scale-95 ${
                  isCurrent
                    ? 'bg-white/20 border-white text-white shadow-lg'
                    : 'bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/25'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: h.primaryColor }}
                />
                <span className="text-[11px]">{h.earthDesignation}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Cathedral Sonic Tuning Bell */}
        <div className="pointer-events-auto bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl max-w-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
              <span>ACOUSTIC RESONANCE:</span>
            </span>
            <span className="text-yellow-400 font-bold">{sonicFreq} Hz</span>
          </div>

          <input
            type="range"
            min="440"
            max="1760"
            step="40"
            value={sonicFreq}
            onChange={(e) => setSonicFreq(Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
          />

          <button
            onClick={triggerSonicPurge}
            className="w-full py-2 px-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5 active:scale-95 shadow-md"
          >
            <Flame className="w-3.5 h-3.5 text-yellow-400" />
            <span>STRIKE SONIC CATHEDRAL BELL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
