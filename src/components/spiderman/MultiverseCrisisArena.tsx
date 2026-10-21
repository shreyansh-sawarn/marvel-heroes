import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SpiderHeroMeta, SpiderHeroId } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import {
  Swords,
  Shield,
  Zap,
  RotateCcw,
  Trophy,
  Skull,
  Play,
  Crosshair,
} from 'lucide-react';

interface MultiverseCrisisArenaProps {
  playerHero: SpiderHeroMeta;
  isSymbioteSurge: boolean;
  onSelectHero?: (id: SpiderHeroId) => void;
}

type BossId = 'the_spot' | 'kingpin' | 'miguel' | 'knull';

interface BossMeta {
  id: BossId;
  name: string;
  universe: string;
  title: string;
  color: string;
  secondaryColor: string;
  maxHp: number;
  avatar: string;
  description: string;
  specialMove: string;
}

const BOSS_ROSTER: Record<BossId, BossMeta> = {
  the_spot: {
    id: 'the_spot',
    name: 'The Spot (Dr. Jonathan Ohnn)',
    universe: 'Earth-1610',
    title: 'DIMENSIONAL PORTAL ANOMALY',
    color: '#00F0FF',
    secondaryColor: '#000000',
    maxHp: 450,
    avatar: '⚫',
    description: 'Living interdimensional door frame capable of swallowing attacks and redirecting momentum.',
    specialMove: 'Multiverse Portal Swarm',
  },
  kingpin: {
    id: 'kingpin',
    name: 'Wilson Fisk (Kingpin)',
    universe: 'Earth-1610 Collider',
    title: 'CRIME LORD OF NEW YORK',
    color: '#DC2626',
    secondaryColor: '#E4E4E7',
    maxHp: 650,
    avatar: '🥋',
    description: 'Massive brute-force crime syndicate titan weaponizing the Alchemax Supercollider.',
    specialMove: 'Supercollider Seismic Shockwave',
  },
  miguel: {
    id: 'miguel',
    name: 'Spider-Man 2099 (Enforcement)',
    universe: 'Earth-928 / Spider-Society',
    title: 'CANON EVENT PRESERVATION COMMANDER',
    color: '#FF0055',
    secondaryColor: '#00F0FF',
    maxHp: 520,
    avatar: '⚡',
    description: 'Relentless defender of the Spider-Verse canon armed with hard-light talons.',
    specialMove: 'Temporal Glitch Blitz',
  },
  knull: {
    id: 'knull',
    name: 'Knull: God of the Abyss',
    universe: 'Primordial Klyntar Void',
    title: 'LORD OF THE LIVING SYMBIOTES',
    color: '#A855F7',
    secondaryColor: '#EF4444',
    maxHp: 750,
    avatar: '🐉',
    description: 'Ancient dark deity who forged the All-Black the Necrosword from primordial darkness.',
    specialMove: 'Symbiote Void Tendril Devour',
  },
};

interface Combatant {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 1 | -1;
  state: 'idle' | 'run' | 'jump' | 'attack' | 'hit' | 'special';
  animTimer: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isPlayer: boolean;
  damage: number;
  type: 'web' | 'venom' | 'laser' | 'portal' | 'tendril' | 'sonic';
  life: number;
}

interface ComicBurst {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

interface Portal {
  x: number;
  y: number;
  pairId: number;
  radius: number;
  color: string;
}

export const MultiverseCrisisArena: React.FC<MultiverseCrisisArenaProps> = ({
  playerHero,
  isSymbioteSurge,
}) => {
  const [selectedBossId, setSelectedBossId] = useState<BossId>('the_spot');
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'VICTORY' | 'DEFEAT'>('READY');

  const [playerHp, setPlayerHp] = useState(300);
  const [maxPlayerHp] = useState(300);
  const [bossHp, setBossHp] = useState(450);
  const [combo, setCombo] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);
  const [ultimateCharge, setUltimateCharge] = useState(0); // 0-100%

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeBoss = BOSS_ROSTER[selectedBossId];

  // Battle State Refs
  const playerRef = useRef<Combatant>({
    x: 120,
    y: 320,
    vx: 0,
    vy: 0,
    width: 36,
    height: 54,
    isGrounded: true,
    facing: 1,
    state: 'idle',
    animTimer: 0,
  });

  const bossRef = useRef<Combatant>({
    x: 620,
    y: 320,
    vx: 0,
    vy: 0,
    width: 44,
    height: 60,
    isGrounded: true,
    facing: -1,
    state: 'idle',
    animTimer: 0,
  });

  const projectilesRef = useRef<Projectile[]>([]);
  const burstsRef = useRef<ComicBurst[]>([]);
  const portalsRef = useRef<Portal[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const shakeRef = useRef(0);

  // Initialize Game
  const startBattle = useCallback(() => {
    setPlayerHp(300);
    setBossHp(activeBoss.maxHp);
    setCombo(0);
    setUltimateCharge(0);
    projectilesRef.current = [];
    burstsRef.current = [];
    portalsRef.current = [];

    playerRef.current = {
      x: 120,
      y: 320,
      vx: 0,
      vy: 0,
      width: 36,
      height: 54,
      isGrounded: true,
      facing: 1,
      state: 'idle',
      animTimer: 0,
    };

    bossRef.current = {
      x: 620,
      y: 320,
      vx: 0,
      vy: 0,
      width: selectedBossId === 'kingpin' ? 64 : 44,
      height: selectedBossId === 'kingpin' ? 72 : 60,
      isGrounded: true,
      facing: -1,
      state: 'idle',
      animTimer: 0,
    };

    // If The Spot, spawn initial pair of portals
    if (selectedBossId === 'the_spot') {
      portalsRef.current = [
        { x: 180, y: 220, pairId: 1, radius: 26, color: '#00F0FF' },
        { x: 580, y: 180, pairId: 1, radius: 26, color: '#00F0FF' },
      ];
    }

    setGameState('PLAYING');
    soundEngine.playWhoosh();
    soundEngine.playSpiderSense();
  }, [activeBoss.maxHp, selectedBossId]);

  // Keyboard Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      if (gameState !== 'PLAYING') return;

      // Space / J: Primary Attack
      if (e.code === 'Space' || e.code === 'KeyJ') {
        e.preventDefault();
        triggerPlayerAttack();
      }

      // K / Shift: Dodge / Dash
      if (e.code === 'KeyK' || e.code === 'ShiftLeft') {
        e.preventDefault();
        triggerPlayerDash();
      }

      // Q / L: Ultimate
      if (e.code === 'KeyQ' || e.code === 'KeyL') {
        e.preventDefault();
        triggerPlayerUltimate();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameState]);

  // Primary Attack Trigger
  const triggerPlayerAttack = useCallback(() => {
    const p = playerRef.current;
    p.state = 'attack';
    p.animTimer = 12;

    const spawnX = p.x + p.facing * 30;
    const spawnY = p.y - 10;
    const speed = p.facing * 14;

    let projType: Projectile['type'] = 'web';
    let projColor = playerHero.primaryColor;
    let damage = 25;

    switch (playerHero.id) {
      case 'spiderman':
        soundEngine.playWebShoot();
        projType = 'web';
        projColor = isSymbioteSurge ? '#A855F7' : '#00B4D8';
        damage = isSymbioteSurge ? 38 : 28;
        break;
      case 'miles':
        soundEngine.playVenomBlast(0.8);
        projType = 'venom';
        projColor = '#FACC15';
        damage = 32;
        break;
      case 'gwen':
        soundEngine.playGwenBeat('snare');
        projType = 'sonic';
        projColor = '#F43F5E';
        damage = 30;
        break;
      case 'spider2099':
        soundEngine.playLaserWeb();
        projType = 'laser';
        projColor = '#FF0055';
        damage = 34;
        break;
      case 'spidernoir':
        soundEngine.playImpact();
        projType = 'web';
        projColor = '#E4E4E7';
        damage = 30;
        break;
      case 'spiderpunk':
        soundEngine.playPunkDistortion();
        projType = 'sonic';
        projColor = '#EC4899';
        damage = 32;
        break;
      case 'venom':
      case 'carnage':
        soundEngine.playSymbioteTendril();
        projType = 'tendril';
        projColor = playerHero.id === 'carnage' ? '#DC2626' : '#10B981';
        damage = 40;
        break;
    }

    projectilesRef.current.push({
      x: spawnX,
      y: spawnY,
      vx: speed,
      vy: (Math.random() - 0.5) * 1.5,
      radius: 9,
      color: projColor,
      isPlayer: true,
      damage,
      type: projType,
      life: 60,
    });
  }, [isSymbioteSurge, playerHero.id, playerHero.primaryColor]);

  // Dash Evade
  const triggerPlayerDash = useCallback(() => {
    const p = playerRef.current;
    p.vx = p.facing * 18;
    p.state = 'jump';
    soundEngine.playWhoosh();
    burstsRef.current.push({
      x: p.x,
      y: p.y - 20,
      text: 'SWOOSH!',
      color: '#38BDF8',
      life: 25,
      maxLife: 25,
      scale: 1.0,
    });
  }, []);

  // Ultimate Skill
  const triggerPlayerUltimate = useCallback(() => {
    if (ultimateCharge < 100) return;
    setUltimateCharge(0);

    const p = playerRef.current;
    shakeRef.current = 15;
    soundEngine.playExplosion();

    // Spawn massive multi-projectile barrage
    for (let i = -3; i <= 3; i++) {
      projectilesRef.current.push({
        x: p.x + p.facing * 20,
        y: p.y - 15 + i * 8,
        vx: p.facing * (15 + Math.abs(i) * 2),
        vy: i * 2.2,
        radius: 14,
        color: playerHero.accentColor,
        isPlayer: true,
        damage: 45,
        type: 'venom',
        life: 75,
      });
    }

    burstsRef.current.push({
      x: p.x,
      y: p.y - 40,
      text: 'MAXIMUM OVERDRIVE!!',
      color: '#FACC15',
      life: 45,
      maxLife: 45,
      scale: 1.4,
    });
  }, [playerHero.accentColor, ultimateCharge]);

  // Main Arena Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 420);
    const groundY = height - 55;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 420;
    };
    window.addEventListener('resize', handleResize);

    let frame = 0;

    const render = () => {
      frame++;

      // Screen Shake
      let offsetX = 0;
      let offsetY = 0;
      if (shakeRef.current > 0) {
        offsetX = (Math.random() - 0.5) * shakeRef.current;
        offsetY = (Math.random() - 0.5) * shakeRef.current;
        shakeRef.current *= 0.9;
      }

      ctx.save();
      ctx.translate(offsetX, offsetY);

      // Arena Background
      ctx.fillStyle = '#060711';
      ctx.fillRect(0, 0, width, height);

      // Halftone dot layer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let x = 0; x < width; x += 24) {
        for (let y = 0; y < height; y += 24) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Ground Stage Floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, height);
      floorGrad.addColorStop(0, '#12182B');
      floorGrad.addColorStop(1, '#05070D');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, width, height - groundY);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Atmospheric Multiverse Backdrop (Supercollider or Portal Vortex)
      ctx.save();
      ctx.strokeStyle = activeBoss.color + '22';
      ctx.lineWidth = 1;
      const vortexCX = width / 2;
      const vortexCY = height * 0.45;
      for (let r = 40; r < 300; r += 35) {
        ctx.beginPath();
        ctx.arc(vortexCX, vortexCY, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Portals (The Spot mechanic)
      portalsRef.current.forEach((portal) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(portal.x, portal.y, portal.radius + Math.sin(frame * 0.1) * 3, 0, Math.PI * 2);
        ctx.fillStyle = '#05050A';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = portal.color;
        ctx.shadowColor = portal.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
      });

      if (gameState === 'PLAYING') {
        const p = playerRef.current;
        const b = bossRef.current;

        // ==========================================
        // 1. PLAYER PHYSICS & CONTROLS
        // ==========================================
        const keys = keysRef.current;
        const moveSpeed = 5.5;
        const jumpForce = -13;
        const gravity = 0.65;

        if (keys['KeyA'] || keys['ArrowLeft']) {
          p.vx = -moveSpeed;
          p.facing = -1;
        } else if (keys['KeyD'] || keys['ArrowRight']) {
          p.vx = moveSpeed;
          p.facing = 1;
        } else {
          p.vx *= 0.78;
        }

        if ((keys['KeyW'] || keys['ArrowUp']) && p.isGrounded) {
          p.vy = jumpForce;
          p.isGrounded = false;
          soundEngine.playWhoosh();
        }

        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;

        // Ground collision
        if (p.y >= groundY) {
          p.y = groundY;
          p.vy = 0;
          p.isGrounded = true;
        }

        // Arena boundaries
        p.x = Math.max(25, Math.min(width - 25, p.x));

        // ==========================================
        // 2. BOSS AI & MECHANICS
        // ==========================================
        b.animTimer--;
        const distToPlayer = p.x - b.x;
        b.facing = distToPlayer > 0 ? 1 : -1;

        // Move towards player with rhythmic attack cadence
        if (Math.abs(distToPlayer) > 140) {
          b.vx = b.facing * (selectedBossId === 'kingpin' ? 2.5 : 3.8);
        } else {
          b.vx *= 0.8;
        }

        b.vy += gravity;
        b.x += b.vx;
        b.y += b.vy;

        if (b.y >= groundY) {
          b.y = groundY;
          b.vy = 0;
          b.isGrounded = true;
        }

        b.x = Math.max(30, Math.min(width - 30, b.x));

        // Boss Attack Dispatcher
        if (frame % 75 === 0) {
          const bossSpawnX = b.x + b.facing * 30;
          const bossSpawnY = b.y - 15;

          if (selectedBossId === 'the_spot') {
            soundEngine.playPortalWarp();
            // Launch 2 ink-black matter shards
            [-1, 1].forEach((dir) => {
              projectilesRef.current.push({
                x: bossSpawnX,
                y: bossSpawnY + dir * 10,
                vx: b.facing * 10,
                vy: dir * 2,
                radius: 11,
                color: '#00F0FF',
                isPlayer: false,
                damage: 22,
                type: 'portal',
                life: 65,
              });
            });
          } else if (selectedBossId === 'kingpin') {
            soundEngine.playImpact();
            shakeRef.current = 8;
            // Ground shockwave
            projectilesRef.current.push({
              x: bossSpawnX,
              y: groundY - 8,
              vx: b.facing * 8,
              vy: 0,
              radius: 18,
              color: '#DC2626',
              isPlayer: false,
              damage: 28,
              type: 'sonic',
              life: 50,
            });
          } else if (selectedBossId === 'miguel') {
            soundEngine.playLaserWeb();
            projectilesRef.current.push({
              x: bossSpawnX,
              y: bossSpawnY,
              vx: b.facing * 13,
              vy: 0,
              radius: 10,
              color: '#FF0055',
              isPlayer: false,
              damage: 25,
              type: 'laser',
              life: 60,
            });
          } else if (selectedBossId === 'knull') {
            soundEngine.playSymbioteTendril();
            for (let i = -1; i <= 1; i++) {
              projectilesRef.current.push({
                x: bossSpawnX,
                y: bossSpawnY + i * 20,
                vx: b.facing * 9,
                vy: i * 2.5,
                radius: 14,
                color: '#A855F7',
                isPlayer: false,
                damage: 32,
                type: 'tendril',
                life: 70,
              });
            }
          }
        }

        // ==========================================
        // 3. PROJECTILE SIMULATION & PORTAL WARP
        // ==========================================
        for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
          const pr = projectilesRef.current[i];
          pr.x += pr.vx;
          pr.y += pr.vy;
          pr.life--;

          // Check Portal interactions (The Spot)
          if (portalsRef.current.length >= 2) {
            const p1 = portalsRef.current[0];
            const p2 = portalsRef.current[1];

            const d1 = Math.hypot(pr.x - p1.x, pr.y - p1.y);
            const d2 = Math.hypot(pr.x - p2.x, pr.y - p2.y);

            if (d1 < p1.radius && pr.vx > 0) {
              pr.x = p2.x + 15;
              pr.y = p2.y;
              pr.vx = Math.abs(pr.vx);
              soundEngine.playPortalWarp();
            } else if (d2 < p2.radius && pr.vx < 0) {
              pr.x = p1.x - 15;
              pr.y = p1.y;
              pr.vx = -Math.abs(pr.vx);
              soundEngine.playPortalWarp();
            }
          }

          // Hit Boss
          if (pr.isPlayer) {
            const hitDist = Math.hypot(pr.x - b.x, pr.y - (b.y - 25));
            if (hitDist < 35) {
              const newBossHp = Math.max(0, bossHp - pr.damage);
              setBossHp(newBossHp);

              shakeRef.current = 6;
              const nextCombo = combo + 1;
              setCombo(nextCombo);
              if (nextCombo > highestCombo) setHighestCombo(nextCombo);
              soundEngine.playComboHit(nextCombo);

              // Charge ultimate
              setUltimateCharge((prev) => Math.min(100, prev + 12));

              // Burst text
              const words = ['THWIP!', 'POW!', 'KRAAAK!', 'ZZZZT!', 'WHAM!'];
              const chosenWord = words[Math.floor(Math.random() * words.length)];
              burstsRef.current.push({
                x: b.x,
                y: b.y - 45,
                text: chosenWord,
                color: pr.color,
                life: 30,
                maxLife: 30,
                scale: 1.1,
              });

              projectilesRef.current.splice(i, 1);

              if (newBossHp <= 0) {
                setGameState('VICTORY');
                soundEngine.playVictoryFanfare();
              }
              continue;
            }
          } else {
            // Hit Player
            const hitDist = Math.hypot(pr.x - p.x, pr.y - (p.y - 20));
            if (hitDist < 25) {
              const newHp = Math.max(0, playerHp - pr.damage);
              setPlayerHp(newHp);
              setCombo(0);
              shakeRef.current = 10;
              soundEngine.playImpact();

              burstsRef.current.push({
                x: p.x,
                y: p.y - 35,
                text: 'OOF!!',
                color: '#EF4444',
                life: 25,
                maxLife: 25,
                scale: 1.0,
              });

              projectilesRef.current.splice(i, 1);

              if (newHp <= 0) {
                setGameState('DEFEAT');
                soundEngine.playExplosion();
              }
              continue;
            }
          }

          // Cull dead or offscreen
          if (pr.life <= 0 || pr.x < -40 || pr.x > width + 40) {
            projectilesRef.current.splice(i, 1);
          }
        }
      }

      // ==========================================
      // 4. DRAW COMBATANTS (PLAYER & BOSS)
      // ==========================================
      const p = playerRef.current;
      const b = bossRef.current;

      // Draw Player Silhouette & Webbing / Suit
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.facing, 1);

      // Hero Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hero Body (Dynamic Comic Silhouette)
      ctx.fillStyle = playerHero.primaryColor;
      ctx.shadowColor = playerHero.primaryColor;
      ctx.shadowBlur = 14;

      // Legs
      ctx.fillRect(-10, -25, 8, 25);
      ctx.fillRect(2, -25, 8, 25);
      // Torso
      ctx.fillRect(-12, -45, 24, 22);
      // Chest Emblem / Accent
      ctx.fillStyle = playerHero.accentColor;
      ctx.fillRect(-4, -38, 8, 8);
      // Head
      ctx.fillStyle = playerHero.primaryColor;
      ctx.beginPath();
      ctx.arc(0, -52, 11, 0, Math.PI * 2);
      ctx.fill();
      // Eyes (Iconic Spider-Lens)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(3, -55);
      ctx.lineTo(8, -52);
      ctx.lineTo(3, -49);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Draw Boss
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(b.facing, 1);

      // Boss Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 0, selectedBossId === 'kingpin' ? 32 : 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Boss Body
      ctx.fillStyle = activeBoss.color;
      ctx.shadowColor = activeBoss.color;
      ctx.shadowBlur = 18;

      if (selectedBossId === 'kingpin') {
        // Massive Kingpin silhouette
        ctx.fillRect(-22, -32, 18, 32);
        ctx.fillRect(4, -32, 18, 32);
        ctx.fillRect(-26, -66, 52, 36);
        ctx.fillStyle = '#E4E4E7';
        ctx.fillRect(-6, -56, 12, 20); // white ascot
        ctx.fillStyle = '#FED7AA';
        ctx.beginPath();
        ctx.arc(0, -74, 14, 0, Math.PI * 2); // bald head
        ctx.fill();
      } else if (selectedBossId === 'the_spot') {
        // Spot white body with black holes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-9, -26, 7, 26);
        ctx.fillRect(2, -26, 7, 26);
        ctx.fillRect(-11, -48, 22, 24);
        ctx.beginPath();
        ctx.arc(0, -56, 10, 0, Math.PI * 2);
        ctx.fill();
        // Black spots
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-2, -56, 4, 0, Math.PI * 2);
        ctx.arc(4, -42, 3, 0, Math.PI * 2);
        ctx.arc(-5, -36, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 2099 / Knull
        ctx.fillRect(-10, -28, 8, 28);
        ctx.fillRect(2, -28, 8, 28);
        ctx.fillRect(-13, -50, 26, 24);
        ctx.beginPath();
        ctx.arc(0, -58, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // ==========================================
      // 5. DRAW PROJECTILES & COMIC BURSTS
      // ==========================================
      projectilesRef.current.forEach((pr) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
        ctx.fillStyle = pr.color;
        ctx.shadowColor = pr.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        // Silk trail / energy trail
        ctx.beginPath();
        ctx.moveTo(pr.x, pr.y);
        ctx.lineTo(pr.x - pr.vx * 2, pr.y - pr.vy * 2);
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      });

      // Draw Comic Bursts ("POW!", "THWIP!")
      for (let i = burstsRef.current.length - 1; i >= 0; i--) {
        const bst = burstsRef.current[i];
        bst.life--;
        bst.y -= 0.6;
        const progress = bst.life / bst.maxLife;

        ctx.save();
        ctx.translate(bst.x, bst.y);
        ctx.scale(bst.scale * (1 + (1 - progress) * 0.3), bst.scale * (1 + (1 - progress) * 0.3));
        ctx.font = 'bold 22px "Bangers", "Impact", cursive, sans-serif';
        ctx.fillStyle = bst.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(bst.text, 0, 0);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.strokeText(bst.text, 0, 0);
        ctx.restore();

        if (bst.life <= 0) burstsRef.current.splice(i, 1);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [activeBoss.color, bossHp, combo, gameState, highestCombo, playerHp, playerHero, selectedBossId]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#070814] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Dynamic Background Comic Vignette */}
      <div className="absolute inset-0 comic-halftone opacity-20 pointer-events-none" />

      {/* Arena Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-hero-primary bg-white/5 px-3 py-1 rounded-full border border-white/10 mb-2">
            <Swords className="w-3.5 h-3.5" />
            <span>CANON CRISIS COMBAT ARENA // DIMENSIONAL ANOMALY</span>
          </div>
          <h2 className="font-comic text-3xl sm:text-5xl text-white tracking-wide">
            MULTIVERSE <span className="text-hero-primary">CRISIS BATTLE</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            Test your web-slinging acrobatics and dimensional mastery against legendary Multiverse Bosses in a live real-time physics combat arena.
          </p>
        </div>

        {/* Boss Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {(Object.keys(BOSS_ROSTER) as BossId[]).map((bId) => {
            const b = BOSS_ROSTER[bId];
            const isSel = selectedBossId === bId;
            return (
              <button
                key={bId}
                onClick={() => {
                  if (gameState === 'PLAYING') return;
                  setSelectedBossId(bId);
                  soundEngine.playHudClick();
                }}
                disabled={gameState === 'PLAYING'}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition ${
                  isSel
                    ? 'border-hero-primary bg-hero-primary/20 text-white font-bold'
                    : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-50'
                }`}
              >
                <span>{b.avatar}</span>
                <span>{b.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Arena Health Meters & HUD Telemetry */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 font-mono text-xs">
        {/* Player Health Bar */}
        <div className="md:col-span-5 bg-[#0B0E1D] p-3 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: playerHero.primaryColor }} />
              {playerHero.name} ({playerHero.alias})
            </span>
            <span className="text-emerald-400 font-bold">{playerHp}/{maxPlayerHp} HP</span>
          </div>
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${(playerHp / maxPlayerHp) * 100}%`,
                backgroundColor: playerHero.primaryColor,
              }}
            />
          </div>
        </div>

        {/* Combo & Ultimate Gauge */}
        <div className="md:col-span-2 flex flex-col items-center justify-center bg-[#0B0E1D] p-2 rounded-2xl border border-white/10 text-center">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest">COMBO HIT</span>
          <span className="font-comic text-2xl text-hero-primary">{combo}x</span>
          <span className="text-[9px] text-zinc-500">MAX: {highestCombo}x</span>
        </div>

        {/* Boss Health Bar */}
        <div className="md:col-span-5 bg-[#0B0E1D] p-3 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-zinc-400 font-bold flex items-center gap-1.5">
              <span>{activeBoss.avatar}</span>
              {activeBoss.name}
            </span>
            <span className="text-red-400 font-bold">{bossHp}/{activeBoss.maxHp} HP</span>
          </div>
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${(bossHp / activeBoss.maxHp) * 100}%`,
                backgroundColor: activeBoss.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Canvas Arena Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#060711]">
        <canvas ref={canvasRef} className="w-full block" />

        {/* Overlay: Ready to Fight Modal */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-xs font-mono uppercase tracking-widest text-hero-primary mb-2">
              TARGET: {activeBoss.universe}
            </span>
            <h3 className="font-comic text-4xl sm:text-5xl text-white tracking-wide mb-2">
              CONFRONT {activeBoss.name.toUpperCase()}
            </h3>
            <p className="max-w-md text-xs sm:text-sm text-zinc-400 font-sans mb-6">
              {activeBoss.description} Watch for their signature move: <strong className="text-white">{activeBoss.specialMove}</strong>!
            </p>

            <button
              onClick={startBattle}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-hero-primary to-hero-accent text-white font-comic text-xl tracking-wider shadow-[0_0_35px_var(--hero-glow)] hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>ENGAGE COMBAT! (SPACE / J)</span>
            </button>

            <div className="mt-4 text-[11px] font-mono text-zinc-500">
              [A / D] Move · [W] Jump · [Space / J] Web Attack · [K / Shift] Dodge · [Q / L] Ultimate
            </div>
          </div>
        )}

        {/* Overlay: Victory */}
        {gameState === 'VICTORY' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <Trophy className="w-14 h-14 text-yellow-400 mb-3 animate-bounce" />
            <h3 className="font-comic text-4xl sm:text-6xl text-white tracking-wide mb-1">
              CANON EVENT STABILIZED!
            </h3>
            <p className="text-sm text-emerald-400 font-mono mb-4">
              {activeBoss.name} has been contained! Multiverse integrity restored to 99.8%.
            </p>
            <div className="flex gap-4">
              <button
                onClick={startBattle}
                className="px-6 py-2.5 rounded-xl bg-hero-primary text-white font-mono font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition"
              >
                REMATCH BOSS
              </button>
              <button
                onClick={() => setGameState('READY')}
                className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/15 transition"
              >
                SELECT ANOTHER BOSS
              </button>
            </div>
          </div>
        )}

        {/* Overlay: Defeat */}
        {gameState === 'DEFEAT' && (
          <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <Skull className="w-14 h-14 text-red-500 mb-3 animate-pulse" />
            <h3 className="font-comic text-4xl sm:text-6xl text-white tracking-wide mb-1">
              TIMELINE ANOMALY CRITICAL!
            </h3>
            <p className="text-sm text-red-300 font-mono mb-4">
              Spider-Hero down! The dimensional fabric has suffered a localized rupture.
            </p>
            <button
              onClick={startBattle}
              className="px-6 py-2.5 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 active:scale-95 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Mobile & Touch Attack Controls Bar */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-4 bg-[#0B0E1D] p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={triggerPlayerAttack}
            disabled={gameState !== 'PLAYING'}
            className="px-5 py-2.5 rounded-xl bg-hero-primary hover:brightness-110 active:scale-95 disabled:opacity-50 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg transition"
          >
            <Crosshair className="w-4 h-4" />
            <span>PRIMARY ATTACK [SPACE / J]</span>
          </button>
          <button
            onClick={triggerPlayerDash}
            disabled={gameState !== 'PLAYING'}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 disabled:opacity-50 text-white font-mono text-xs flex items-center gap-2 transition border border-white/10"
          >
            <Shield className="w-4 h-4" />
            <span>DODGE EVADE [K]</span>
          </button>
        </div>

        {/* Ultimate Skill Button with Charge Progress */}
        <button
          onClick={triggerPlayerUltimate}
          disabled={gameState !== 'PLAYING' || ultimateCharge < 100}
          className={`px-5 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition shadow-lg ${
            ultimateCharge >= 100
              ? 'bg-[#FACC15] text-black animate-pulse hover:brightness-110 cursor-pointer'
              : 'bg-white/5 text-zinc-500 border border-white/10 cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>ULTIMATE OVERDRIVE [{ultimateCharge}%]</span>
        </button>
      </div>
    </div>
  );
};
