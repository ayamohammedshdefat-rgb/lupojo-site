'use client';

import { useEffect, useRef } from 'react';

type Ember = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; hue: number };

/**
 * Slow ember particles for the hero background (small custom canvas).
 * Paused when off-screen or when the tab is hidden; not rendered under reduced motion.
 */
export function Embers({ className = '', density = 26 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parts: Ember[] = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (initial = false): Ember => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.25 + Math.random() * 0.6),
      r: 0.6 + Math.random() * 1.6,
      life: 0,
      max: 260 + Math.random() * 260,
      hue: Math.random(),
    });

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]!;
        p.life += 1;
        p.x += p.vx + Math.sin(p.life / 40 + p.hue * 6) * 0.18;
        p.y += p.vy;
        if (p.life > p.max || p.y < -10) parts[i] = spawn();
        const t = p.life / p.max;
        const a = Math.sin(Math.PI * Math.min(1, t)) * 0.7;
        ctx.fillStyle = p.hue > 0.5 ? `rgba(255,194,61,${a})` : `rgba(239,135,21,${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (visible && document.visibilityState === 'visible') raf = requestAnimationFrame(tick);
    };

    resize();
    for (let i = 0; i < density; i++) parts.push(spawn(true));
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      run();
    });
    io.observe(canvas);
    const onVis = () => run();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', resize);
    run();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', resize);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
