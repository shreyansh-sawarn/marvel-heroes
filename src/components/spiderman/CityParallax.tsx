import React from 'react';

interface CityParallaxProps {
  scrollProgress: number; // 0 to 1
  mouseX?: number; // -1 to 1
  mouseY?: number; // -1 to 1
}

export const CityParallax: React.FC<CityParallaxProps> = ({
  scrollProgress,
  mouseX = 0,
  mouseY = 0,
}) => {
  // 3D Parallax translation & perspective tilt
  const bgX = scrollProgress * -40 + mouseX * 25;
  const bgY = scrollProgress * -160 + mouseY * 20;
  const bgScale = 1.05 + scrollProgress * 0.15;

  const fgX = scrollProgress * -90 + mouseX * 45;
  const fgY = scrollProgress * -320 + mouseY * 40;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none bg-black">
      {/* 1. CINEMATIC 3D NEW YORK SKYLINE (Real Photorealistic Render) */}
      <div
        className="absolute inset-0 w-[115%] h-[130%] -top-[15%] -left-[7%] transition-transform duration-100 ease-out"
        style={{
          transform: `translate3d(${bgX}px, ${bgY}px, 0) scale(${bgScale})`,
          transformOrigin: 'center center',
        }}
      >
        <img
          src="/assets/nyc_skyline.jpg"
          alt="Cinematic NYC Skyline"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
        />

        {/* Cinematic Atmospheric Vignette & Color Grading */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090E] via-transparent to-[#04060E]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090E]/60 via-transparent to-[#08090E]/60" />
      </div>

      {/* 2. DYNAMIC VOLUMETRIC MIST & NEON GLOWS */}
      <div
        className="absolute top-[25%] -left-20 w-[140%] h-48 bg-gradient-to-r from-transparent via-[#E23636]/15 to-transparent blur-3xl transition-transform duration-150"
        style={{ transform: `translateX(${scrollProgress * 80}px)` }}
      />
      <div
        className="absolute top-[50%] -left-20 w-[140%] h-64 bg-gradient-to-r from-transparent via-[#00B4D8]/10 to-transparent blur-3xl"
      />

      {/* 3. DAILY BUGLE BILLBOARD 3D POP OVERLAY */}
      <div
        className="absolute top-[32%] left-[45%] md:left-[48%] -translate-x-1/2 z-10 transition-transform duration-100 ease-out pointer-events-none"
        style={{
          transform: `translate3d(${bgX * 1.2}px, ${bgY * 0.8}px, 0)`,
        }}
      >
        <div className="bg-[#090A12]/90 border-2 border-marvel-red/80 px-4 py-2 rounded-lg shadow-[0_0_40px_rgba(226,54,54,0.8)] backdrop-blur-md text-center transform -rotate-1">
          <div className="font-comic text-marvel-red text-xl sm:text-2xl md:text-4xl tracking-widest leading-none drop-shadow-[0_0_15px_#E23636] animate-pulse">
            DAILY BUGLE
          </div>
          <div className="text-[10px] sm:text-xs font-mono text-yellow-300 font-bold tracking-widest mt-1 uppercase">
            ⚡ SPIDER-MAN: THREAT OR HERO? ⚡
          </div>
        </div>
      </div>

      {/* 4. FOREGROUND 3D ROOFTOP CORNICE & PARALLAX STRUCTURES */}
      <div
        className="absolute bottom-0 w-full h-[70%] transition-transform duration-75 ease-out z-20 pointer-events-none"
        style={{
          transform: `translate3d(${fgX}px, ${fgY * 0.5}px, 0)`,
        }}
      >
        {/* Left Stone Gargoyle Perch Platform */}
        <div className="absolute top-[10%] left-[-10px] md:left-4 w-44 md:w-64 h-44 md:h-64 z-30 drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]">
          <svg viewBox="0 0 200 160" className="w-full h-full">
            <defs>
              <linearGradient id="gargoyleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="60%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0B0F19" />
              </linearGradient>
            </defs>
            <rect x="0" y="90" width="160" height="70" fill="url(#gargoyleGrad)" stroke="#0F172A" strokeWidth="3" />
            <rect x="0" y="75" width="175" height="20" fill="#475569" stroke="#0F172A" strokeWidth="3" />
            <path
              d="M 130 75 C 165 60 185 40 200 70 C 195 95 165 105 140 105 Z"
              fill="url(#gargoyleGrad)"
              stroke="#0F172A"
              strokeWidth="3"
            />
            <circle cx="170" cy="62" r="3.5" fill="#F3D403" className="drop-shadow-[0_0_6px_#F3D403]" />
          </svg>
        </div>

        {/* Foreground NYC Water Tower on Far Left */}
        <div className="absolute bottom-[10%] left-[-30px] md:left-6 w-36 md:w-52 h-48 md:h-72 opacity-95">
          <svg viewBox="0 0 150 220" className="w-full h-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)]">
            <rect x="25" y="45" width="100" height="95" rx="4" fill="#271810" stroke="#0F0805" strokeWidth="3" />
            <line x1="25" y1="75" x2="125" y2="75" stroke="#78350F" strokeWidth="3" />
            <line x1="25" y1="105" x2="125" y2="105" stroke="#78350F" strokeWidth="3" />
            <polygon points="75,10 15,48 135,48" fill="#180F0A" stroke="#0F0805" strokeWidth="3" />
            <line x1="35" y1="140" x2="18" y2="215" stroke="#1E293B" strokeWidth="4" />
            <line x1="115" y1="140" x2="132" y2="215" stroke="#1E293B" strokeWidth="4" />
          </svg>
        </div>
      </div>

      {/* 5. CINEMATIC SPEED LINES & 3D HALFTONE PARTICLES */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 speed-lines transition-opacity duration-300"
        style={{
          opacity: scrollProgress > 0.15 && scrollProgress < 0.85 ? 0.75 : 0.1,
        }}
      />
    </div>
  );
};
