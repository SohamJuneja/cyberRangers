import React, { useEffect, useRef } from 'react';

const ShootingStar = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Starfield and shooting star setup
    const backgroundStars = [];
    const totalStars = 150;
    const trailStars = [];
    const trailLimit = 3;

    // Initialize static background stars
    for (let i = 0; i < totalStars; i++) {
      backgroundStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
      });
    }

    // Random launch point from canvas corners
    const getCornerOrigin = () => {
      const corners = [
        { x: 0, y: 0, dx: 8, dy: 8 },
        { x: canvas.width, y: 0, dx: -8, dy: 8 },
        { x: 0, y: canvas.height, dx: 8, dy: -8 },
        { x: canvas.width, y: canvas.height, dx: -8, dy: -8 },
      ];
      return corners[Math.floor(Math.random() * corners.length)];
    };

    const generateStar = () => {
      const base = getCornerOrigin();
      return {
        x: base.x,
        y: base.y,
        dx: base.dx + (Math.random() * 2 - 1),
        dy: base.dy + (Math.random() * 2 - 1),
        size: 4,
        opacity: 1,
      };
    };

    const animationLoop = () => {
      // Solid clear to eliminate trails
      ctx.fillStyle = 'rgba(13, 13, 15, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ambient stars
      backgroundStars.forEach((star) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.opacity = 0.5 + Math.abs(Math.sin(Date.now() * 0.001) * 0.5);
      });

      // Occasionally create a shooting star
      if (trailStars.length < trailLimit && Math.random() < 0.01) {
        trailStars.push(generateStar());
      }

      // Draw and move each shooting star
      trailStars.forEach((s, idx) => {
        const trailLength = 20;
        const grad = ctx.createLinearGradient(
          s.x, s.y,
          s.x - s.dx * trailLength,
          s.y - s.dy * trailLength
        );
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        grad.addColorStop(0.1, 'rgba(255, 255, 255, 0.3)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        const segments = 4;
        for (let i = 0; i < segments; i++) {
          const segLen = trailLength / segments;
          const startX = s.x - s.dx * segLen * i;
          const startY = s.y - s.dy * segLen * i;
          const endX = s.x - s.dx * segLen * (i + 1);
          const endY = s.y - s.dy * segLen * (i + 1);

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = s.size * (1 - i / segments) * 0.8;
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }

        // Draw star head
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.arc(s.x, s.y, s.size / 4, 0, Math.PI * 2);
        ctx.fill();

        s.x += s.dx;
        s.y += s.dy;

        // Remove off-screen stars
        if (
          s.x < -50 || s.x > canvas.width + 50 ||
          s.y < -50 || s.y > canvas.height + 50
        ) {
          trailStars.splice(idx, 1);
        }
      });

      requestAnimationFrame(animationLoop);
    };

    animationLoop();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ backgroundColor: '#0d0d0f' }}
    />
  );
};

export default ShootingStar;
