import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Spiderman3DCanvas } from './Spiderman3DCanvas';
import { CityParallax } from './CityParallax';
import { WebLine } from './WebLine';
import { ComicBurst } from './ComicBurst';
import { SpiderStats } from './SpiderStats';
import { SpideyTelemetryHUD } from '../ui/SpideyTelemetryHUD';
import { SpiderStage } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { ChevronDown, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface SpidermanSceneProps {
  onScrollToNextHero?: () => void;
}

export const SpidermanScene: React.FC<SpidermanSceneProps> = ({ onScrollToNextHero }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<SpiderStage>('perch');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSenseActive, setIsSenseActive] = useState(false);

  // Position and transform coordinates for Spider-Man across the 5 stages
  const [spideyPos, setSpideyPos] = useState({ x: 20, y: 22, angle: 0 });
  // Daily Bugle Web Anchor Point in the 3D skyline (in %)
  const webAnchor = { x: 48, y: 32 };

  // Track sound triggers so they fire once per direction passage
  const lastStageRef = useRef<SpiderStage>('perch');

  // Mouse move parallax handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    const pinEl = pinSectionRef.current;
    const containerEl = containerRef.current;

    if (!pinEl || !containerEl) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerEl,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinEl,
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          setScrollProgress(p);

          // Determine Stage & Trajectory Coordinates
          let stage: SpiderStage = 'perch';
          let posX = 20;
          let posY = 22;
          let angle = 0;

          if (p < 0.15) {
            // Stage 1: Rooftop Perch
            stage = 'perch';
            const subP = p / 0.15;
            posX = 20 + subP * 3;
            posY = 22 + subP * 4;
            angle = -6 + subP * 8;
          } else if (p < 0.40) {
            // Stage 2: Dive & Shoot Web
            stage = 'dive';
            const subP = (p - 0.15) / 0.25;
            // Spidey dives downward diagonally
            posX = 23 + subP * 24; // 23% to 47%
            posY = 26 + subP * 36; // 26% to 62%
            angle = 15 + subP * 12;
          } else if (p < 0.70) {
            // Stage 3: High-Speed Pendulum Arc Swing
            stage = 'swing';
            const subP = (p - 0.40) / 0.30;
            // Pendulum arc equation
            const swingT = (subP - 0.5) * 2; // -1 to +1
            posX = 47 + subP * 28; // 47% to 75%
            posY = 62 - Math.cos(swingT * Math.PI * 0.45) * 24; // dips down and swings up
            angle = -28 + subP * 58; // rotates from -28deg to +30deg
          } else if (p < 0.85) {
            // Stage 4: Apex Release & Somersault Flip
            stage = 'apex';
            const subP = (p - 0.70) / 0.15;
            posX = 75 + subP * 6; // 75% to 81%
            posY = 40 - Math.sin(subP * Math.PI) * 14; // floats up in flip
            angle = 30 + subP * 120; // acrobatic spin
          } else {
            // Stage 5: Wall Stick & Landing
            stage = 'wallstick';
            const subP = (p - 0.85) / 0.15;
            posX = 81 - subP * 3; // ~78% (on skyscraper glass)
            posY = 36 + subP * 5;
            angle = 0;
          }

          setSpideyPos({ x: posX, y: posY, angle });
          setCurrentStage(stage);

          // Audio & Special Effects Triggering
          if (stage !== lastStageRef.current) {
            if (stage === 'dive') {
              soundEngine.playWebShoot();
            } else if (stage === 'swing') {
              soundEngine.playWhoosh(1.4);
            } else if (stage === 'apex') {
              soundEngine.playWhoosh(1.0);
            } else if (stage === 'wallstick') {
              soundEngine.playImpact();
            } else if (stage === 'perch') {
              soundEngine.playSpiderSense();
            }
            lastStageRef.current = stage;
          }

          // Spider sense tingle trigger near start
          if (p < 0.12) {
            setIsSenseActive(true);
          } else {
            setIsSenseActive(false);
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualJump = (targetStage: SpiderStage) => {
    const stageScrollRatios: Record<SpiderStage, number> = {
      perch: 0.05,
      dive: 0.28,
      swing: 0.55,
      apex: 0.78,
      wallstick: 0.95,
    };
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetY = containerRef.current.offsetTop + totalHeight * stageScrollRatios[targetStage];
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[550vh] bg-black"
      id="spiderman-chapter"
    >
      {/* PINNED VIEWPORT STAGE */}
      <div
        ref={pinSectionRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between"
      >
        {/* NYC 3D Cinematic Parallax Backdrop */}
        <CityParallax
          scrollProgress={scrollProgress}
          mouseX={mousePos.x}
          mouseY={mousePos.y}
        />

        {/* Live Spidey HUD Telemetry */}
        <SpideyTelemetryHUD
          stage={currentStage}
          progress={scrollProgress}
          isSpiderSenseActive={isSenseActive}
        />

        {/* Dynamic 3D Braided Web Line */}
        <WebLine
          startX={webAnchor.x}
          startY={webAnchor.y}
          endX={spideyPos.x}
          endY={spideyPos.y}
          tension={currentStage === 'swing' ? 0.98 : currentStage === 'dive' ? 0.85 : 0.4}
          active={currentStage === 'dive' || currentStage === 'swing'}
          opacity={currentStage === 'dive' ? Math.min(1, (scrollProgress - 0.15) * 10) : currentStage === 'swing' ? 1 : 0}
        />

        {/* Seamless 3D Character Canvas (NO boxy borders) */}
        <div
          className="absolute z-30 transition-all duration-75 ease-out cursor-pointer pointer-events-auto"
          style={{
            left: `${spideyPos.x}%`,
            top: `${spideyPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => {
            soundEngine.playWebShoot();
            setIsSenseActive(true);
            setTimeout(() => setIsSenseActive(false), 1400);
          }}
          title="Click Spider-Man to Trigger Web Shot!"
        >
          <Spiderman3DCanvas
            stage={currentStage}
            progress={scrollProgress}
            swingAngle={spideyPos.angle}
            isSpiderSenseActive={isSenseActive}
          />
        </div>

        {/* COMIC ACTION SOUND BURSTS */}
        {/* Stage 1: SENSE! */}
        <ComicBurst
          text="SPIDER-SENSE!"
          subtext="TINGLING DANGER"
          x={28}
          y={15}
          color="yellow"
          rotation={-10}
          visible={scrollProgress < 0.14}
        />

        {/* Stage 2: THWIP! */}
        <ComicBurst
          text="THWIP!"
          subtext="WEB-SHOOTER ENGAGED"
          x={48}
          y={36}
          color="red"
          rotation={8}
          scale={1.2}
          visible={scrollProgress >= 0.18 && scrollProgress < 0.38}
        />

        {/* Stage 3: WHOOSH! */}
        <ComicBurst
          text="WHOOSH!"
          subtext="HIGH SPEED SWING"
          x={66}
          y={58}
          color="blue"
          rotation={-12}
          scale={1.25}
          visible={scrollProgress >= 0.45 && scrollProgress < 0.68}
        />

        {/* Stage 4: APEX FLIP! */}
        <ComicBurst
          text="APEX FLIP!"
          subtext="ACROBATIC ROTATION"
          x={78}
          y={26}
          color="purple"
          rotation={12}
          scale={1.15}
          visible={scrollProgress >= 0.72 && scrollProgress < 0.85}
        />

        {/* TOP INTRO BANNER (Fade out on scroll) */}
        <div
          className="relative z-30 pt-20 md:pt-24 px-6 max-w-4xl mx-auto text-center pointer-events-none transition-opacity duration-300"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 5),
            transform: `translateY(${scrollProgress * -100}px)`,
          }}
        >
          <div className="inline-flex items-center space-x-2 bg-marvel-red/20 border border-marvel-red/50 text-yellow-400 font-mono text-xs md:text-sm px-3 py-1 rounded-full mb-3 shadow-[0_0_20px_rgba(226,54,54,0.5)] backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>CHAPTER 01: THE NEIGHBORHOOD PATROL</span>
          </div>

          <h1 className="font-comic text-4xl md:text-7xl lg:text-8xl tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-300 drop-shadow-[4px_4px_0px_#E23636]">
            THE AMAZING <span className="text-marvel-red">SPIDER-MAN</span>
          </h1>

          <p className="mt-2 text-sm md:text-lg text-gray-200 font-medium max-w-xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Scroll to launch Peter Parker into the NYC canyon and experience the physics-based web-slinging action in real time!
          </p>

          <div className="mt-4 flex items-center justify-center space-x-2 text-yellow-400 font-mono text-xs font-bold animate-bounce">
            <ChevronDown className="w-4 h-4" />
            <span>SCROLL DOWN TO SWING</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* MID/BOTTOM HUD: Interactive Stage Scrub Bar & Quick-Jump */}
        <div className="relative z-30 w-full px-4 md:px-8 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-none">
          {/* Action Stage Indicator */}
          <div className="bg-[#0B0F1E]/90 border border-cyan-500/30 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center space-x-3 pointer-events-auto">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-marvel-red animate-ping" />
              <span className="font-mono text-xs font-bold text-gray-400 uppercase">STAGE:</span>
            </div>
            <div className="font-comic text-lg md:text-xl text-yellow-400 tracking-wider">
              {currentStage === 'perch' && '1. ROOFTOP SPIDER-SENSE'}
              {currentStage === 'dive' && '2. FREEFALL & THWIP!'}
              {currentStage === 'swing' && '3. MANHATTAN CANYON SWING'}
              {currentStage === 'apex' && '4. APEX SOMERSAULT FLIP'}
              {currentStage === 'wallstick' && '5. GLASS WALL HERO LANDING'}
            </div>
          </div>

          {/* Quick-Jump Stage Buttons */}
          <div className="flex items-center space-x-1.5 bg-[#0B0F1E]/90 border border-gray-800 backdrop-blur-md p-1.5 rounded-xl pointer-events-auto shadow-2xl">
            {(['perch', 'dive', 'swing', 'apex', 'wallstick'] as SpiderStage[]).map((st, i) => (
              <button
                key={st}
                onClick={() => handleManualJump(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all uppercase ${
                  currentStage === st
                    ? 'bg-marvel-red text-white shadow-[0_0_15px_#E23636]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                0{i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* STAGE 5: SPIDER STATS & DOSSIER MODAL OVERLAY */}
        <div
          className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pointer-events-none transition-opacity duration-300"
          style={{
            opacity: scrollProgress > 0.88 ? 1 : 0,
            pointerEvents: scrollProgress > 0.88 ? 'auto' : 'none',
          }}
        >
          <SpiderStats visible={scrollProgress > 0.88} onReplay={handleReplay} onNextHero={onScrollToNextHero} />
        </div>
      </div>
    </div>
  );
};
