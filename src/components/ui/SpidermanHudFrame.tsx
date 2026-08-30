import React from 'react';

interface SpidermanHudFrameProps {
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  color?: 'red' | 'cyan' | 'gold';
}

export const SpidermanHudFrame: React.FC<SpidermanHudFrameProps> = ({
  corner,
  className = '',
  color = 'red',
}) => {
  const getPath = () => {
    switch (corner) {
      case 'top-left':
        return 'M 2 26 L 2 2 L 26 2 M 2 2 L 10 10';
      case 'top-right':
        return 'M 6 2 L 26 2 L 26 26 M 26 2 L 18 10';
      case 'bottom-left':
        return 'M 2 6 L 2 26 L 26 26 M 2 26 L 10 18';
      case 'bottom-right':
        return 'M 6 26 L 26 26 L 26 6 M 26 26 L 18 18';
    }
  };

  const colorClass = {
    red: 'text-[#E62429]',
    cyan: 'text-[#00B4D8]',
    gold: 'text-[#F3D403]',
  }[color];

  return (
    <svg
      aria-hidden="true"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className={`${colorClass} ${className}`}
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
