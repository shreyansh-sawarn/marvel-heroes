import React from 'react';
import { SpiderStage } from '../../types';

interface SpidermanRigProps {
  stage: SpiderStage;
  progress: number; // 0 to 1
  swingAngle?: number;
  isSpiderSenseActive?: boolean;
  className?: string;
}

export const SpidermanRig: React.FC<SpidermanRigProps> = ({
  stage,
  progress,
  swingAngle = 0,
  isSpiderSenseActive = false,
  className = '',
}) => {
  // Determine which 3D asset and transform to apply based on stage
  const getPoseConfig = () => {
    switch (stage) {
      case 'perch':
        return {
          image: '/assets/spidey_crouch.jpg',
          scale: 1.05,
          rotate: swingAngle,
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(226,54,54,0.35))',
          maskShape: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          extraTransform: 'perspective(800px) rotateX(8deg)',
        };
      case 'dive':
        return {
          image: '/assets/spidey_leap.jpg',
          scale: 1.15,
          rotate: swingAngle + 10,
          filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.85)) drop-shadow(0 0 35px rgba(230,36,41,0.5))',
          maskShape: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          extraTransform: `perspective(800px) rotateY(${progress * 15}deg) rotateZ(${progress * 10}deg)`,
        };
      case 'swing':
        return {
          image: '/assets/spidey_swing.jpg',
          scale: 1.22,
          rotate: swingAngle,
          filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(226,54,54,0.6))',
          maskShape: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          extraTransform: `perspective(1000px) rotateY(${Math.sin(progress * Math.PI) * -15}deg) translateZ(30px)`,
        };
      case 'apex':
        return {
          image: '/assets/spidey_leap.jpg',
          scale: 1.18,
          rotate: swingAngle + 45,
          filter: 'drop-shadow(0 20px 45px rgba(243,212,3,0.4)) drop-shadow(0 0 30px rgba(226,54,54,0.5))',
          maskShape: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          extraTransform: `perspective(900px) rotateZ(${progress * 80}deg) scale(1.05)`,
        };
      case 'wallstick':
      default:
        return {
          image: '/assets/spidey_crouch.jpg',
          scale: 1.1,
          rotate: swingAngle - 8,
          filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.95)) drop-shadow(0 0 30px rgba(0,180,216,0.6))',
          maskShape: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          extraTransform: 'perspective(800px) rotateY(18deg) rotateX(-10deg)',
        };
    }
  };

  const pose = getPoseConfig();

  return (
    <div
      className={`relative select-none pointer-events-none transition-transform duration-100 ease-out ${className}`}
      style={{
        transform: `rotate(${pose.rotate}deg) scale(${pose.scale})`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Spider-Sense 3D Danger Halo */}
      {isSpiderSenseActive && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-28 pointer-events-none z-40">
          <svg viewBox="0 0 120 70" className="w-full h-full animate-spiderSense">
            <path
              d="M 60 45 L 40 10 L 25 22 L 5 0"
              fill="none"
              stroke="#F3D403"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_#F3D403]"
            />
            <path
              d="M 60 45 L 60 5 L 50 15 L 48 -5"
              fill="none"
              stroke="#E23636"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_#E23636]"
            />
            <path
              d="M 60 45 L 80 10 L 95 22 L 115 0"
              fill="none"
              stroke="#F3D403"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_#F3D403]"
            />
            <circle cx="60" cy="45" r="16" fill="none" stroke="#F3D403" strokeWidth="2.5" strokeDasharray="4,4" className="animate-spin" />
            <circle cx="60" cy="45" r="28" fill="none" stroke="#E23636" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>
      )}

      {/* 3D CHARACTER FRAME WITH DYNAMIC VIGNETTE & CUTOUT BLEND */}
      <div
        className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 group"
        style={{
          transform: pose.extraTransform,
          filter: pose.filter,
        }}
      >
        {/* Real 3D Render Image */}
        <img
          src={pose.image}
          alt={`Spider-Man ${stage} 3D Pose`}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-500 group-hover:scale-110"
          style={{
            maskImage: 'radial-gradient(circle at center, black 65%, transparent 98%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 65%, transparent 98%)',
          }}
        />

        {/* Dynamic 3D Rim Lighting & Comic Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-red-500/20 pointer-events-none mix-blend-screen" />
        
        {/* Dynamic Web-Shooter Spark Flare (during dive and swing) */}
        {(stage === 'dive' || stage === 'swing') && (
          <div className="absolute top-4 right-8 w-6 h-6 rounded-full bg-white shadow-[0_0_20px_#FFFFFF] animate-ping opacity-75" />
        )}

        {/* Hero Landing Energy Contact Ripples */}
        {stage === 'wallstick' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-8 rounded-full border border-cyan-400 bg-cyan-500/20 shadow-[0_0_25px_#00B4D8] animate-pulse" />
        )}
      </div>
    </div>
  );
};
