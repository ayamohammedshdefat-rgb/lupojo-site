/** Tiny canvas particle engine for the intro: drifting embers and gravity sparks. No dependencies. */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  kind: 'ember' | 'spark';
};

const COLORS = ['255,194,61', '239,135,21', '227,111,18', '193,94,17'];

export class ParticleField {
  private ctx: CanvasRenderingContext2D;
  private parts: Particle[] = [];
  private raf = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private lastEmber = 0;
  embersOn = true;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /** A burst of 20–30 sparks thrown up and out from (x, y), pulled back down by gravity. */
  burst(x: number, y: number, count = 26) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
      const speed = 4 + Math.random() * 8;
      this.parts.push({
        x: x + (Math.random() - 0.5) * 30,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: 38 + Math.random() * 34,
        size: 1 + Math.random() * 1.6,
        kind: 'spark',
      });
    }
  }

  private spawnEmber() {
    this.parts.push({
      x: Math.random() * this.w,
      y: this.h + 10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.5 + Math.random() * 1.1),
      life: 0,
      max: 140 + Math.random() * 120,
      size: 0.8 + Math.random() * 1.8,
      kind: 'ember',
    });
  }

  start() {
    const tick = (now: number) => {
      if (this.embersOn && now - this.lastEmber > 90) {
        this.lastEmber = now;
        this.spawnEmber();
      }
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = 'lighter';
      this.parts = this.parts.filter((p) => p.life < p.max);
      for (const p of this.parts) {
        p.life += 1;
        const t = p.life / p.max;
        const color = COLORS[Math.min(COLORS.length - 1, Math.floor(t * COLORS.length))]!;
        if (p.kind === 'spark') {
          p.vy += 0.32;
          p.vx *= 0.985;
          const px = p.x;
          const py = p.y;
          p.x += p.vx;
          p.y += p.vy;
          ctx.strokeStyle = `rgba(${color},${(1 - t) * 0.95})`;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6);
          ctx.stroke();
        } else {
          p.x += p.vx + Math.sin((p.life + p.max) / 18) * 0.25;
          p.y += p.vy;
          const alpha = Math.sin(Math.PI * t) * (0.55 + Math.random() * 0.25);
          ctx.fillStyle = `rgba(${color},${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.parts = [];
    this.ctx.clearRect(0, 0, this.w, this.h);
  }
}
