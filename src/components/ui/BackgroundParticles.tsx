import React, { useEffect, useRef } from 'react';
import { SpiderHeroId } from '../../types';

interface BackgroundParticlesProps {
  intensity?: number;
  activeHero?: SpiderHeroId;
  isSymbioteSurge?: boolean;
}

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({
  intensity = 1,
  activeHero = 'spiderman',
  isSymbioteSurge = false,
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

    const particleCount = Math.floor(45 * intensity);

    const getHeroColors = () => {
      if (isSymbioteSurge || activeHero === 'venom') {
        return ['#A855F7', '#C084FC', '#000000', '#10B981', '#F8FAFC'];
      }
      if (activeHero === 'carnage') {
        return ['#DC2626', '#EF4444', '#7F1D1D', '#F97316', '#000000'];
      }
      if (activeHero === 'miles') {
        return ['#FACC15', '#EF4444', '#06B6D4', '#FFFFFF'];
      }
      if (activeHero === 'gwen') {
        return ['#F43F5E', '#2DD4BF', '#FFFFFF', '#C084FC'];
      }
      if (activeHero === 'spider2099') {
        return ['#FF0055', '#00F0FF', '#FF6B00', '#FFFFFF'];
      }
      if (activeHero === 'spidernoir') {
        return ['#E4E4E7', '#F59E0B', '#71717A', '#FFFFFF'];
      }
      if (activeHero === 'spiderpunk') {
        return ['#EC4899', '#EAB308', '#38BDF8', '#FFFFFF'];
      }
      // Peter Parker (spiderman)
      return ['#E23636', '#00B4D8', '#F3D403', '#FFFFFF'];
    };

    const colors = getHeroColors();

    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.6 + 0.8,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: -Math.random() * 1.2 - 0.3,
      alpha: Math.random() * 0.7 + 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
    }));

    let lastTime = 0;
    const fpsInterval = 1000 / 30;

    const render = (time: number) => {
      if (document.hidden) return;

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
  }, [intensity, activeHero, isSymbioteSurge]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
