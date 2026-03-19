import { useEffect, useRef } from 'react';

export default function MeshBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { x: 0.15, y: 0.25, r: 0.35, color: '124,111,239' },
      { x: 0.75, y: 0.65, r: 0.30, color: '92,188,240' },
      { x: 0.55, y: 0.15, r: 0.25, color: '240,98,146' },
      { x: 0.30, y: 0.80, r: 0.28, color: '124,111,239' },
    ];

    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0B0E14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb, i) => {
        const dx = Math.sin(t + i * 1.3) * 0.05;
        const dy = Math.cos(t + i * 0.9) * 0.04;
        const cx = (orb.x + dx) * canvas.width;
        const cy = (orb.y + dy) * canvas.height;
        const radius = orb.r * Math.min(canvas.width, canvas.height);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0,   `rgba(${orb.color}, 0.12)`);
        grad.addColorStop(0.5, `rgba(${orb.color}, 0.05)`);
        grad.addColorStop(1,   `rgba(${orb.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
