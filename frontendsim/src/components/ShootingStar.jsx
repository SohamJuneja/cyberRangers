import React, { useEffect, useRef } from 'react';

const ShootingStar = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const staticStars = [];
    const backgroundStars = 150;
    const trails = [];
    const maxTrails = 3;

    // Initialize background stars
    for (let i = 0; i < backgroundStars; i++) {
      staticStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.5,
      });
    }

    const pickCorner = () => {
      const origins = [
        { x: 0, y: 0, dx: 8, dy: 8 },
        { x: canvas.width, y: 0, dx: -8, dy: 8 },
        { x: 0, y: canvas.height, dx: 8, dy: -8 },
        { x: canvas.width, y: canvas.height, dx: -8, dy: -8 },
      ];
      return origins[Math.floor(Math.random() * origins.length)];
    };

    const generateTrail = () => {
      const source = pickCorner();
      return {
        x: source.x,
        y: source.y,
        dx: source.dx + (Math.random() * 2 - 1),
        dy: source.dy + (Math.random() * 2 - 1),
        size: 4,
        fade: 1,
      };
    };

    const render = () => {
      ctx.fillStyle = 'rgba(13, 13, 15, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      staticStars.forEach(star => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        star.alpha = 0.5 + Math.abs(Math.sin(Date.now() * 0.001) * 0.5);
      });

      if (trails.length < maxTrails && Math.random() < 0.01) {
        trails.push(generateTrail());
      }

      trails.forEach((trail, idx) => {
        const streakLength = 20;

        const tail = ctx.createLinearGradient(
          trail.x, trail.y,
          trail.x - trail.dx * streakLength,
          trail.y - trail.dy * streakLength
        );

        tail.addColorStop(0.0, 'rgba(255, 255, 255, 0.45)');
        tail.addColorStop(0.2, 'rgba(255, 255, 255, 0.25)');
        tail.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

        const fragments = 4;

        for (let i = 0; i < fragments; i++) {
          const len = streakLength / fragments;
          const startX = trail.x - trail.dx * len * i;
          const startY = trail.y - trail.dy * len * i;
          const endX = trail.x - trail.dx * len * (i + 1);
          const endY = trail.y - trail.dy * len * (i + 1);

          ctx.beginPath();
          ctx.strokeStyle = tail;
          ctx.lineWidth = trail.size * (1 - i / fragments) * 0.8;
          ctx.lineCap = 'round';
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }

        // Main trail dot
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.arc(trail.x, trail.y, trail.size / 4, 0, Math.PI * 2);
        ctx.fill();

        trail.x += trail.dx;
        trail.y += trail.dy;

        if (
          trail.x < -50 || trail.x > canvas.width + 50 ||
          trail.y < -50 || trail.y > canvas.height + 50
        ) {
          trails.splice(idx, 1);
        }
      });

      requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ backgroundColor: '#0d0d0f' }}
    />
  );
};

export default ShootingStar;
