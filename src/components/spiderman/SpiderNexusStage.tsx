import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SpiderHeroMeta, SpiderHeroId } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  Radio,
  Volume2,
  ShieldAlert,
  Sparkles,
  Compass,
  Crosshair,
  Flame,
  RotateCcw,
} from 'lucide-react';

interface SpiderNexusStageProps {
  hero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onToggleSymbiote: () => void;
  onOpenSelector: () => void;
  onSelectHero?: (heroId: SpiderHeroId) => void;
}

interface WebStrand {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
  oscillation: number;
  frequency: number;
  amplitude: number;
  alpha: number;
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
  seed: number;
}

interface ComicExclamation {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  scale: number;
  opacity: number;
  rotation: number;
}

export const SpiderNexusStage: React.FC<SpiderNexusStageProps> = ({
  hero,
  isSymbioteSurge,
  onToggleSymbiote,
  onOpenSelector,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // UI Interactive States
  const [spiderSenseActive, setSpiderSenseActive] = useState(false);
  const [sonicTuningFreq, setSonicTuningFreq] = useState(880);
  const [webAmmo, setWebAmmo] = useState(100);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [infestProgress, setInfestProgress] = useState(isSymbioteSurge ? 1 : 0);
  const [activeExclamations, setActiveExclamations] = useState<ComicExclamation[]>([]);

  // Mouse & Parallax tracking
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    normX: 0,
    normY: 0,
    isDown: false,
  });

  // Physics Web Strands & Symbiote Tendril spurs
  const websRef = useRef<WebStrand[]>([]);
  const tendrilsRef = useRef<TendrilSpur[]>([]);
  const slimeParticlesRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number; color: string }>
  >([]);
  const shakeRef = useRef(0);

  // Asset image refs
  const heroImageRef = useRef<HTMLImageElement | null>(null);
  const symbioteImageRef = useRef<HTMLImageElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Determine active hero images
  const getHeroAssets = useCallback((heroId: SpiderHeroId) => {
    switch (heroId) {
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

  // Preload character & symbiote cutout assets
  useEffect(() => {
    const assets = getHeroAssets(hero.id);
    let loaded = 0;
    const total = 3;

    const checkComplete = () => {
      loaded++;
      if (loaded >= total) setImagesLoaded(true);
    };

    const heroImg = new Image();
    heroImg.src = assets.hero;
    heroImg.onload = () => {
      heroImageRef.current = heroImg;
      checkComplete();
    };
    heroImg.onerror = checkComplete;

    const symImg = new Image();
    symImg.src = assets.symbiote;
    symImg.onload = () => {
      symbioteImageRef.current = symImg;
      checkComplete();
    };
    symImg.onerror = checkComplete;

    const bgImg = new Image();
    bgImg.src = assets.bg;
    bgImg.onload = () => {
      bgImageRef.current = bgImg;
      checkComplete();
    };
    bgImg.onerror = checkComplete;

    // Initialize living organic symbiote tendrils emerging from anatomy
    const bodyPoints = [
      { x: -35, y: -130, angle: -Math.PI * 0.75 }, // Left shoulder
      { x: 35, y: -130, angle: -Math.PI * 0.25 },  // Right shoulder
      { x: -65, y: -80, angle: -Math.PI * 0.9 },   // Left bicep
      { x: 65, y: -80, angle: -Math.PI * 0.1 },    // Right bicep
      { x: -95, y: -20, angle: Math.PI },          // Left forearm
      { x: 95, y: -20, angle: 0 },                 // Right forearm
      { x: -25, y: -50, angle: -Math.PI * 0.5 },   // Chest left
      { x: 25, y: -50, angle: -Math.PI * 0.5 },    // Chest right
      { x: 0, y: -10, angle: Math.PI * 0.5 },      // Abdomen
      { x: -45, y: 45, angle: Math.PI * 0.65 },    // Left thigh
      { x: 45, y: 45, angle: Math.PI * 0.35 },     // Right thigh
      { x: -85, y: 110, angle: Math.PI * 0.8 },    // Left shin
      { x: 85, y: 110, angle: Math.PI * 0.2 },     // Right shin
      { x: 0, y: -180, angle: -Math.PI * 0.5 },    // Head crown
    ];

    const spurs: TendrilSpur[] = [];
    bodyPoints.forEach((bp, idx) => {
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
          seed: Math.random() * 1000,
        });
      }
    });
    tendrilsRef.current = spurs;
  }, [getHeroAssets, hero.id]);

  // Smoothly interpolate infestation transition (0 -> 1 or 1 -> 0)
  useEffect(() => {
    let animFrame: number;
    const target = isSymbioteSurge ? 1 : 0;
    const step = () => {
      setInfestProgress((curr) => {
        const diff = target - curr;
        if (Math.abs(diff) < 0.01) return target;
        return curr + diff * 0.08;
      });
      if (Math.abs(target - infestProgress) >= 0.01) {
        animFrame = requestAnimationFrame(step);
      }
    };
    animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [infestProgress, isSymbioteSurge]);

  // Mouse Parallax Event Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    mouseRef.current.targetX = normX;
    mouseRef.current.targetY = normY;
    mouseRef.current.x = x;
    mouseRef.current.y = y;
  };

  // Trigger Spider-Sense precognitive pulse
  const triggerSpiderSense = () => {
    setSpiderSenseActive(true);
    soundEngine.playSpiderSense();
    setTimeout(() => setSpiderSenseActive(false), 900);
  };

  // Interactive Web-Shoot on click / drag
  const handleShootWeb = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

    // Calculate hero wrist anchor position (near center)
    const heroX = rect.width / 2;
    const heroY = rect.height * 0.52;

    if (isSymbioteSurge) {
      // Visceral Symbiote Tendril Whip Strike
      soundEngine.playSymbioteTendril();
      shakeRef.current = 10;

      // Spawn thick organic tendril strand
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
        alpha: 1,
        life: 140,
        maxLife: 140,
        color: '#A855F7',
        isSymbiote: true,
      });

      // Spawn dripping slime particles
      for (let i = 0; i < 18; i++) {
        const speed = 2 + Math.random() * 7;
        const angle = Math.random() * Math.PI * 2;
        slimeParticlesRef.current.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          radius: 2.5 + Math.random() * 5,
          alpha: 1,
          color: Math.random() > 0.5 ? '#A855F7' : '#05020B',
        });
      }

      // Symbiote Exclamation
      const words = ['WHIP!', 'DEVOUR!', 'KLYNTAR!', 'LASH!'];
      const chosen = words[Math.floor(Math.random() * words.length)];
      addExclamation(targetX, targetY, chosen, '#A855F7');
    } else {
      // Classic Snappy Web-Shoot
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
        alpha: 1,
        life: 180,
        maxLife: 180,
        color: hero.accentColor || '#00B4D8',
        isSymbiote: false,
      });

      // Classic Comic Exclamation
      const words = ['THWIP!', 'SNIKT!', 'ZIP!', 'FLIP!'];
      const chosen = words[Math.floor(Math.random() * words.length)];
      addExclamation(targetX, targetY, chosen, hero.primaryColor);
    }
  };

  const addExclamation = (x: number, y: number, text: string, color: string) => {
    const item: ComicExclamation = {
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      scale: 0.8,
      opacity: 1,
      rotation: (Math.random() - 0.5) * 0.4,
    };
    setActiveExclamations((prev) => [...prev.slice(-4), item]);
    setTimeout(() => {
      setActiveExclamations((prev) => prev.filter((i) => i.id !== item.id));
    }, 900);
  };

  // Sonic Bell Purge (Repels Symbiote)
  const triggerSonicPurge = () => {
    soundEngine.playSonicScreech(sonicTuningFreq);
    shakeRef.current = 14;

    // Repel tendrils outwards
    tendrilsRef.current.forEach((t) => {
      t.targetLength = 20;
    });

    if (isSymbioteSurge) {
      setTimeout(() => {
        onToggleSymbiote();
      }, 350);
    }
  };

  // Reload Web Fluid Cartridge
  const handleReloadWeb = () => {
    soundEngine.playTensileSnap();
    setWebAmmo(100);
  };

  // MAIN CINEMATIC WEBGL/2D RENDER PIPELINE
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

      // Mouse Lerp
      mouseRef.current.normX += (mouseRef.current.targetX - mouseRef.current.normX) * 0.08;
      mouseRef.current.normY += (mouseRef.current.targetY - mouseRef.current.normY) * 0.08;

      // Screen Shake Decay
      let sx = 0;
      let sy = 0;
      if (shakeRef.current > 0) {
        sx = (Math.random() - 0.5) * shakeRef.current;
        sy = (Math.random() - 0.5) * shakeRef.current;
        shakeRef.current *= 0.88;
      }

      ctx.save();
      ctx.translate(sx, sy);

      // 1. SKYLINE / ENVIRONMENT BACKDROP (Multi-Plane Parallax)
      ctx.fillStyle = isSymbioteSurge ? '#050209' : '#070913';
      ctx.fillRect(0, 0, width, height);

      const bg = bgImageRef.current;
      if (bg && bg.complete && bg.naturalWidth > 0) {
        ctx.save();
        const panX = -mouseRef.current.normX * 35;
        const panY = -mouseRef.current.normY * 20;
        const scale = Math.max(width / bg.naturalWidth, height / bg.naturalHeight) * 1.08;
        const bw = bg.naturalWidth * scale;
        const bh = bg.naturalHeight * scale;

        ctx.globalAlpha = isSymbioteSurge ? 0.22 : 0.45;
        ctx.drawImage(bg, (width - bw) / 2 + panX, (height - bh) / 2 + panY, bw, bh);

        // Klyntar Atmospheric Abyssal Fog or Golden Hour Sunset
        if (isSymbioteSurge) {
          const fogGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.7);
          fogGrad.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
          fogGrad.addColorStop(0.5, 'rgba(30, 4, 45, 0.45)');
          fogGrad.addColorStop(1, 'rgba(5, 2, 9, 0.85)');
          ctx.fillStyle = fogGrad;
          ctx.fillRect(0, 0, width, height);
        } else {
          const sunsetGrad = ctx.createLinearGradient(0, 0, 0, height);
          sunsetGrad.addColorStop(0, 'rgba(251, 146, 60, 0.12)');
          sunsetGrad.addColorStop(0.6, 'rgba(226, 54, 54, 0.1)');
          sunsetGrad.addColorStop(1, 'rgba(7, 9, 19, 0.8)');
          ctx.fillStyle = sunsetGrad;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      }

      // Halftone Comic Grid
      ctx.save();
      ctx.fillStyle = isSymbioteSurge ? 'rgba(168, 85, 247, 0.04)' : 'rgba(255, 255, 255, 0.03)';
      const dotSpacing = 28;
      for (let dx = 0; dx < width; dx += dotSpacing) {
        for (let dy = 0; dy < height; dy += dotSpacing) {
          ctx.beginPath();
          ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 2. HERO CENTER STAGE WITH 3D DEPTH & GYROSCOPIC TILT
      const centerX = width / 2;
      const centerY = height * 0.52;
      const heroParallaxX = mouseRef.current.normX * 18;
      const heroParallaxY = mouseRef.current.normY * 12;
      const heroTilt = mouseRef.current.normX * 0.035;

      // Draw Hero Grounding Shadow
      ctx.save();
      ctx.translate(centerX + heroParallaxX * 0.4, height * 0.88);
      ctx.beginPath();
      ctx.ellipse(0, 0, 160 + infestProgress * 40, 35, 0, 0, Math.PI * 2);
      ctx.fillStyle = isSymbioteSurge ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0, 0, 0, 0.6)';
      ctx.shadowColor = isSymbioteSurge ? '#A855F7' : 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 40;
      ctx.fill();
      ctx.restore();

      // Draw Character (Classic Suit & Symbiote Suit with smooth crossfade & tendril wrap)
      const normalImg = heroImageRef.current;
      const symImg = symbioteImageRef.current;

      const targetH = Math.min(height * 0.78, 620);

      // Render Normal Hero
      if (normalImg && normalImg.complete && normalImg.naturalWidth > 0) {
        const ratio = targetH / normalImg.naturalHeight;
        const nw = normalImg.naturalWidth * ratio;
        const nh = targetH;

        ctx.save();
        ctx.translate(centerX + heroParallaxX, centerY + heroParallaxY);
        ctx.rotate(heroTilt);
        ctx.globalAlpha = Math.max(0, 1 - infestProgress);

        // Glow Aura
        ctx.shadowColor = hero.primaryColor;
        ctx.shadowBlur = spiderSenseActive ? 55 : 20;

        ctx.drawImage(normalImg, -nw / 2, -nh / 2, nw, nh);
        ctx.restore();
      }

      // Render Symbiote Metamorphosis (Infestation Surge Form)
      if (symImg && symImg.complete && symImg.naturalWidth > 0 && infestProgress > 0.01) {
        const ratio = targetH / symImg.naturalHeight;
        const sw = symImg.naturalWidth * ratio;
        const sh = targetH;

        ctx.save();
        ctx.translate(centerX + heroParallaxX, centerY + heroParallaxY);
        ctx.rotate(heroTilt);
        ctx.globalAlpha = infestProgress;

        // Visceral Obsidian Aura
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
        const waveCount = 3;
        for (let r = 1; r <= waveCount; r++) {
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

      // 5. SIMULATE & DRAW PHYSICAL ELASTIC WEB STRANDS
      for (let i = websRef.current.length - 1; i >= 0; i--) {
        const web = websRef.current[i];
        web.life--;
        web.progress = Math.min(1, web.progress + 0.12);
        web.oscillation += web.frequency * 0.05;

        // Quadratic bezier spline with spring physics
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

      // 6. UPDATE & DRAW VISCOUS SLIME PARTICLES
      for (let p = slimeParticlesRef.current.length - 1; p >= 0; p--) {
        const pt = slimeParticlesRef.current[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.2; // gravity
        pt.alpha -= 0.02;

        if (pt.alpha <= 0) {
          slimeParticlesRef.current.splice(p, 1);
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
  }, [
    hero.accentColor,
    hero.primaryColor,
    infestProgress,
    isSlowMo,
    isSymbioteSurge,
    spiderSenseActive,
  ]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[90vh] min-h-[640px] bg-[#070913] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] select-none"
    >
      {/* Interactive WebGL / Canvas Stage */}
      <canvas
        ref={canvasRef}
        onClick={handleShootWeb}
        className="w-full h-full block cursor-crosshair relative z-10"
      />

      {/* Loading Synchronization Overlay */}
      {!imagesLoaded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-hero-primary animate-ping" />
            <span>SYNCHRONIZING DIMENSIONAL AVATAR...</span>
          </div>
        </div>
      )}

      {/* Dynamic Comic Exclamations ("THWIP!", "WHAM!") */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {activeExclamations.map((ex) => (
          <div
            key={ex.id}
            style={{
              left: `${ex.x}px`,
              top: `${ex.y}px`,
              transform: `translate(-50%, -50%) rotate(${ex.rotation}rad) scale(${ex.scale})`,
              color: ex.color,
              textShadow: '0 0 20px rgba(0,0,0,0.9), 3px 3px 0 #000, -2px -2px 0 #000',
            }}
            className="absolute font-comic text-4xl sm:text-5xl font-extrabold tracking-wider transition-all duration-300 animate-bounce pointer-events-none"
          >
            {ex.text}
          </div>
        ))}
      </div>

      {/* TOP HUD: Hero Identity & Dimension Banner */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none flex flex-col gap-1 max-w-md">
        <div className="inline-flex items-center space-x-2 bg-black/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-mono text-zinc-300 shadow-xl self-start">
          <span
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: isSymbioteSurge ? '#A855F7' : hero.primaryColor }}
          />
          <span className="font-bold text-white uppercase">{hero.earthDesignation}</span>
          <span className="text-zinc-500">//</span>
          <span className="text-hero-primary uppercase">{hero.badge}</span>
        </div>

        <h1 className="font-comic text-4xl sm:text-6xl text-white tracking-wide leading-none mt-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          {isSymbioteSurge ? hero.symbioteVariantName : hero.alias}
        </h1>

        <p className="text-xs sm:text-sm font-sans font-semibold text-zinc-300 drop-shadow-md">
          {hero.name} · {hero.tagline}
        </p>
      </div>

      {/* TOP RIGHT ACTION CONTROLS */}
      <div className="absolute top-6 right-6 z-30 flex items-center space-x-2.5">
        {/* Spider-Sense Radar Trigger */}
        <button
          onClick={triggerSpiderSense}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-black/80 hover:bg-black border border-yellow-500/40 text-yellow-300 font-mono text-xs font-bold transition shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95"
        >
          <Radio className="w-4 h-4 animate-pulse text-yellow-400" />
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

        {/* Multiverse Reality Selector Warp */}
        <button
          onClick={onOpenSelector}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold transition active:scale-95 shadow-lg"
        >
          <Compass className="w-4 h-4 text-hero-accent" />
          <span>WARP REALITY</span>
        </button>

        {/* METAMORPHOSIS SURGE BUTTON */}
        <button
          onClick={onToggleSymbiote}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-mono text-xs font-black transition-all active:scale-95 border-2 shadow-2xl ${
            isSymbioteSurge
              ? 'bg-purple-950 text-purple-200 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.7)]'
              : 'bg-gradient-to-r from-purple-900 to-black text-white border-purple-500/60 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>{isSymbioteSurge ? 'PURGE SYMBIOTE' : 'INFEST SUIT'}</span>
        </button>
      </div>

      {/* BOTTOM LEFT: INTERACTIVE WEB-SLINGER & TARGETING HUD */}
      <div className="absolute bottom-6 left-6 z-30 bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-hero-primary" />
            <span>INTERACTIVE WEB-SHOOTER HUD</span>
          </span>
          <button
            onClick={handleReloadWeb}
            title="Reload Cartridges"
            className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" /> RELOAD
          </button>
        </div>

        {/* Web Ammo Bar */}
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

      {/* BOTTOM RIGHT: CATHEDRAL SONIC TUNING FORK (SYMBIOTE PURGE WEAPON) */}
      <div className="absolute bottom-6 right-6 z-30 bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl max-w-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
            <span>ACOUSTIC RESONANCE:</span>
          </span>
          <span className="text-yellow-400 font-bold">{sonicTuningFreq} Hz</span>
        </div>

        <input
          type="range"
          min="440"
          max="1760"
          step="40"
          value={sonicTuningFreq}
          onChange={(e) => setSonicTuningFreq(Number(e.target.value))}
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
  );
};
