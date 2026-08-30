import React from 'react';

interface ComicBurstProps {
  text: string;
  subtext?: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  color?: 'yellow' | 'red' | 'blue' | 'purple';
  rotation?: number;
  scale?: number;
  visible: boolean;
}

export const ComicBurst: React.FC<ComicBurstProps> = ({
  text,
  subtext,
  x,
  y,
  color = 'yellow',
  rotation = -8,
  scale = 1,
  visible,
}) => {
  if (!visible) return null;

  const colorStyles = {
    yellow: {
      bg: 'from-amber-300 via-yellow-400 to-amber-500',
      stroke: '#000000',
      text: 'text-black',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.7)]',
      border: 'border-black',
    },
    red: {
      bg: 'from-red-500 via-rose-600 to-red-700',
      stroke: '#000000',
      text: 'text-white',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.8)]',
      border: 'border-black',
    },
    blue: {
      bg: 'from-sky-400 via-blue-500 to-indigo-600',
      stroke: '#000000',
      text: 'text-white',
      glow: 'shadow-[0_0_25px_rgba(59,130,246,0.7)]',
      border: 'border-black',
    },
    purple: {
      bg: 'from-purple-400 via-fuchsia-600 to-purple-800',
      stroke: '#000000',
      text: 'text-white',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.7)]',
      border: 'border-black',
    },
  }[color];

  return (
    <div
      className="absolute pointer-events-none z-35 animate-thwipPop"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Starburst SVG Behind Text */}
        <svg
          viewBox="0 0 160 120"
          className={`w-36 h-28 md:w-48 md:h-36 ${colorStyles.glow} filter drop-shadow-[4px_5px_0px_#000000]`}
        >
          <polygon
            points="80,5 98,35 135,20 125,55 155,75 125,95 140,125 100,110 80,135 60,110 20,125 35,95 5,75 35,55 25,20 62,35"
            className={`fill-current text-yellow-400`}
            style={{
              fill: color === 'yellow' ? '#FBBF24' : color === 'red' ? '#DC2626' : color === 'blue' ? '#2563EB' : '#9333EA',
            }}
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </svg>

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span
            className={`font-comic text-2xl md:text-4xl tracking-widest ${colorStyles.text} uppercase`}
            style={{
              textShadow: color === 'yellow' ? '1.5px 1.5px 0px #FFFFFF' : '2px 2px 0px #000000',
            }}
          >
            {text}
          </span>
          {subtext && (
            <span className="font-mono text-[9px] md:text-[10px] font-black uppercase tracking-wider text-black bg-white/90 px-1 rounded shadow-sm">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
