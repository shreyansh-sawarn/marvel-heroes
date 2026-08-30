import React from 'react';

interface HudFrameProps {
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export const HudFrame: React.FC<HudFrameProps> = ({ corner, className = '' }) => {
  const getPath = () => {
    switch (corner) {
      case 'top-left':
        return 'M 2 26 L 2 2 L 26 2';
      case 'top-right':
        return 'M 6 2 L 26 2 L 26 26';
      case 'bottom-left':
        return 'M 2 6 L 2 26 L 26 26';
      case 'bottom-right':
        return 'M 6 26 L 26 26 L 26 6';
    }
  };

  return (
    <svg
      aria-hidden="true"
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      className={`text-[#D4A22F] ${className}`}
    >
      <path
        d={getPath()}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
};
