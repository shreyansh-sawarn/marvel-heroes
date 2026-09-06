import React, { useEffect, useRef } from 'react';

interface BackgroundParticlesProps {
  intensity?: number;
  activeHero?: 'spiderman' | 'ironman' | 'captainamerica';
}

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({
  intensity = 1,
  activeHero = 'spiderman',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const isIronMan = activeHero === 'ironman';
    const isCap = activeHero === 'captainamerica';
    const particleCount = Math.floor(40 * intensity);

    const getHeroColors = () => {
      if (isIronMan) {
        return ['#D4A22F', '#F59E0B', '#38BDF8', '#EF4444', '#FCD34D'];
      }
      if (isCap) {
        return ['#3B82F6', '#60A5FA', '#E23636', '#FFFFFF', '#93C5FD'];
      }
      return ['#E23636', '#00B4D8', '#F3D403', '#FFFFFF', '#EF4444'];
    };

    const colors = getHeroColors();

    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (isIronMan ? 3.0 : isCap ? 2.8 : 2.5) + 0.8,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: isIronMan
        ? -Math.random() * 1.8 - 0.5 // faster rising heat embers
        : isCap
        ? -Math.random() * 1.0 - 0.2 // tactical drift
        : -Math.random() * 1.2 - 0.3,
      alpha: Math.random() * 0.7 + 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
    }));

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS is plenty for background embers

    const render = (time: number) => {
      if (document.hidden) return; // Completely stop rAF while hidden

      animationFrameId = requestAnimationFrame(render);

      const elapsed = time - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = time - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.04;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(0.1, p.alpha * (0.8 + 0.2 * Math.sin(p.pulse)));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra subtle glow halo for embers
        if (isIronMan && p.size > 2) {
          ctx.globalAlpha = currentAlpha * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    animationFrameId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        lastTime = performance.now();
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, activeHero]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-15"
    />
  );
};
