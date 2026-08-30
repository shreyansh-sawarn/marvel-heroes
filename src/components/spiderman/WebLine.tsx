import React from 'react';

interface WebLineProps {
  startX: number; // Building Anchor X (in %)
  startY: number; // Building Anchor Y (in %)
  endX: number;   // Spidey Hand X (in %)
  endY: number;   // Spidey Hand Y (in %)
  tension?: number; // 0 (loose) to 1 (taut/tight)
  active: boolean;
  opacity?: number;
}

export const WebLine: React.FC<WebLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  tension = 0.95,
  active,
  opacity = 1,
}) => {
  if (!active || opacity <= 0) return null;

  const x1 = startX * 10;
  const y1 = startY * 10;
  const x2 = endX * 10;
  const y2 = endY * 10;

  // Elastic physics sag
  const midX = (x1 + x2) / 2;
  const sagOffset = (1 - tension) * 55;
  const midY = (y1 + y2) / 2 + sagOffset;

  const mainPath = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
  // Secondary twisted filament strand
  const twistPath = `M ${x1} ${y1} Q ${midX - 12} ${midY - 8} ${x2} ${y2}`;
  const twistPath2 = `M ${x1} ${y1} Q ${midX + 12} ${midY + 8} ${x2} ${y2}`;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-25"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id="webGlow3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F0F9FF" />
          <stop offset="80%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        <filter id="webShimmer" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Building Anchor Impact Web Splatter & Energy Node */}
      <g transform={`translate(${x1}, ${y1})`}>
        {/* Shockwave circle */}
        <circle cx="0" cy="0" r="14" fill="none" stroke="#38BDF8" strokeWidth="2" opacity="0.8" className="animate-ping" />
        <circle cx="0" cy="0" r="8" fill="#FFFFFF" opacity="0.95" />
        {/* Anchor web splatters */}
        <path d="M0 0 L-18 -12 M0 0 L18 -12 M0 0 L-15 15 M0 0 L15 15 M0 0 L0 -20 M0 0 L-22 0 M0 0 L22 0" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <circle cx="0" cy="0" r="22" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="4,4" opacity="0.6" />
      </g>

      {/* Outer Volumetric Blue Web Glow */}
      <path
        d={mainPath}
        fill="none"
        stroke="#0284C7"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.45"
        filter="url(#webShimmer)"
      />

      {/* Primary High-Tension Silk Cable */}
      <path
        d={mainPath}
        fill="none"
        stroke="url(#webGlow3D)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Secondary Braided Silk Filaments */}
      <path
        d={twistPath}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeDasharray="6,4"
        opacity="0.85"
      />
      <path
        d={twistPath2}
        fill="none"
        stroke="#E0F2FE"
        strokeWidth="1.4"
        strokeDasharray="8,6"
        opacity="0.75"
      />
    </svg>
  );
};
