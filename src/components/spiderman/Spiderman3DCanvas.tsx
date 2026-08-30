import React, { useEffect, useRef } from 'react';
import { SpiderStage } from '../../types';

interface Spiderman3DCanvasProps {
  stage: SpiderStage;
  progress: number;
  swingAngle?: number;
  isSpiderSenseActive?: boolean;
  className?: string;
}

export const Spiderman3DCanvas: React.FC<Spiderman3DCanvasProps> = ({
  stage,
  progress,
  swingAngle = 0,
  isSpiderSenseActive = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cachedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const processedCanvasRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

  // Determine current image source
  const getImgSrc = (st: SpiderStage) => {
    switch (st) {
      case 'perch':
        return '/assets/spidey_crouch.jpg';
      case 'dive':
        return '/assets/spidey_leap.jpg';
      case 'swing':
        return '/assets/spidey_swing.jpg';
      case 'apex':
        return '/assets/spidey_leap.jpg';
      case 'wallstick':
      default:
        return '/assets/spidey_crouch.jpg';
    }
  };

  const currentSrc = getImgSrc(stage);

  // Preload and process images with chroma/luminance alpha extraction
  useEffect(() => {
    const sources = [
      '/assets/spidey_crouch.jpg',
      '/assets/spidey_leap.jpg',
      '/assets/spidey_swing.jpg',
    ];

    sources.forEach((src) => {
      if (cachedImagesRef.current.has(src)) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        cachedImagesRef.current.set(src, img);

        // Process image to extract character and remove dark background
        const offscreen = document.createElement('canvas');
        const w = (offscreen.width = img.naturalWidth || 600);
        const h = (offscreen.height = img.naturalHeight || 600);
        const ctx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Center of the image coordinates for distance weighting
        const cx = w / 2;
        const cy = h / 2;
        const maxDist = Math.sqrt(cx * cx + cy * cy);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const pixelIndex = i / 4;
          const px = pixelIndex % w;
          const py = Math.floor(pixelIndex / w);

          // Distance from center (0 at center, 1 at corners)
          const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) / maxDist;

          // Color detection: Spider-Man has high Red (suit) or vibrant Blue/White (lenses)
          const isRedSuit = r > 70 && r > g * 1.3 && r > b * 1.3;
          const isBlueSuit = b > 60 && b > g * 1.1 && r < b * 1.4 && (r > 30 || b > 80);
          const isWhiteEye = r > 160 && g > 160 && b > 160;
          const isSuitHighlight = r > 90 || (b > 80 && g > 50);

          // Background is dark moody city (low brightness or greenish/yellowish distant windows)
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

          if (isRedSuit || isWhiteEye || (isBlueSuit && dist < 0.65)) {
            // Keep 100% crisp suit
            data[i + 3] = 255;
          } else if (isSuitHighlight && dist < 0.55) {
            // Strong body region
            data[i + 3] = 255;
          } else if (dist > 0.6) {
            // Outer edges fade out completely
            const edgeFade = Math.max(0, 1 - (dist - 0.6) / 0.25);
            if (luminance < 60) {
              data[i + 3] = 0;
            } else {
              data[i + 3] = Math.floor(data[i + 3] * edgeFade * (luminance / 255));
            }
          } else {
            // Smooth soft blend for background city lights
            if (luminance < 45) {
              data[i + 3] = 0;
            } else {
              const alphaFactor = Math.min(1, Math.max(0, (luminance - 45) / 70));
              data[i + 3] = Math.floor(255 * alphaFactor * (1 - dist * 0.5));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        processedCanvasRef.current.set(src, offscreen);
        draw();
      };
    });
  }, []);

  // Main render loop to draw character with 3D shadow and rim glow onto canvas
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 600);
    const height = (canvas.height = 600);
    ctx.clearRect(0, 0, width, height);

    const processed = processedCanvasRef.current.get(currentSrc) || cachedImagesRef.current.get(currentSrc);
    if (!processed) return;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((swingAngle * Math.PI) / 180);

    // 3D Perspective scale & position adjustments
    let scale = 0.9;
    if (stage === 'swing') scale = 1.05;
    if (stage === 'dive') scale = 0.98;
    if (stage === 'apex') {
      scale = 0.95;
      ctx.rotate((progress * 40 * Math.PI) / 180);
    }

    ctx.scale(scale, scale);

    // 1. Draw Deep 3D Drop Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 25;
    ctx.drawImage(processed, -width / 2, -height / 2, width, height);
    ctx.restore();

    // 2. Draw Dynamic Comic Red & Gold Rim Glow
    ctx.save();
    ctx.shadowColor = stage === 'wallstick' ? '#00B4D8' : stage === 'dive' ? '#F3D403' : '#E23636';
    ctx.shadowBlur = 25;
    ctx.drawImage(processed, -width / 2, -height / 2, width, height);
    ctx.restore();

    // 3. Draw Clean Foreground Character
    ctx.drawImage(processed, -width / 2, -height / 2, width, height);

    ctx.restore();
  };

  useEffect(() => {
    draw();
  }, [stage, progress, swingAngle, currentSrc]);

  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      {/* Spider Sense 3D Energy Rings */}
      {isSpiderSenseActive && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-28 pointer-events-none z-30">
          <svg viewBox="0 0 120 70" className="w-full h-full animate-spiderSense">
            <path
              d="M 60 45 L 35 8 L 20 20 L 0 0"
              fill="none"
              stroke="#F3D403"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_15px_#F3D403]"
            />
            <path
              d="M 60 45 L 60 0 L 50 12 L 48 -8"
              fill="none"
              stroke="#E23636"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_15px_#E23636]"
            />
            <path
              d="M 60 45 L 85 8 L 100 20 L 120 0"
              fill="none"
              stroke="#F3D403"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_15px_#F3D403]"
            />
            <circle cx="60" cy="45" r="18" fill="none" stroke="#F3D403" strokeWidth="2.5" strokeDasharray="4,4" className="animate-spin" />
            <circle cx="60" cy="45" r="30" fill="none" stroke="#E23636" strokeWidth="2" strokeDasharray="6,6" />
          </svg>
        </div>
      )}

      {/* Main Cutout 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] filter transition-transform duration-75"
        style={{
          transformStyle: 'preserve-3d',
        }}
      />
    </div>
  );
};
