/**
 * Samples the original LUPO logo to find its dominant brand color(s) and background.
 * Usage: npx tsx scripts/brand/analyze-logo.ts [path]
 */
import sharp from 'sharp';

const src = process.argv[2] ?? 'reference/original/site/assets/dr_burger_logo.png';

function rgbToHsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max / 255 };
}

const hex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase();

async function main() {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const px = (x: number, y: number) => {
    const i = (y * width + x) * 3;
    return [data[i]!, data[i + 1]!, data[i + 2]!] as const;
  };

  // Background: average of a 6px border ring.
  let br = 0, bg = 0, bb = 0, bn = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (x < 6 || y < 6 || x >= width - 6 || y >= height - 6) {
        const [r, g, b] = px(x, y);
        br += r; bg += g; bb += b; bn++;
      }
  console.log('background avg', hex(br / bn, bg / bn, bb / bn));

  // Chromatic pixels grouped into 10-degree hue bins.
  const bins = new Map<number, { n: number; r: number; g: number; b: number; vmax: number }>();
  let chromatic = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const [r, g, b] = px(x, y);
      const { h, s, v } = rgbToHsv(r, g, b);
      if (s < 0.45 || v < 0.35) continue;
      chromatic++;
      const k = Math.floor(h / 10) * 10;
      const e = bins.get(k) ?? { n: 0, r: 0, g: 0, b: 0, vmax: 0 };
      e.n++; e.r += r; e.g += g; e.b += b; e.vmax = Math.max(e.vmax, v);
      bins.set(k, e);
    }
  const sorted = [...bins.entries()].sort((a, b) => b[1].n - a[1].n);
  console.log('chromatic pixels', chromatic, 'of', width * height);
  for (const [k, e] of sorted.slice(0, 6))
    console.log(`hue ${k}-${k + 10}: n=${e.n} (${((e.n / chromatic) * 100).toFixed(1)}%) avg ${hex(e.r / e.n, e.g / e.n, e.b / e.n)}`);

  // Most saturated, bright representative of the top bin (the "pure" brand tone).
  const top = sorted[0]?.[0] ?? 0;
  const tones: { r: number; g: number; b: number; s: number; v: number }[] = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const [r, g, b] = px(x, y);
      const { h, s, v } = rgbToHsv(r, g, b);
      if (h >= top && h < top + 10 && s > 0.75 && v > 0.75) tones.push({ r, g, b, s, v });
    }
  if (tones.length) {
    const avg = tones.reduce((a, t) => ({ r: a.r + t.r, g: a.g + t.g, b: a.b + t.b }), { r: 0, g: 0, b: 0 });
    console.log('core tone (s>.75,v>.75)', tones.length, hex(avg.r / tones.length, avg.g / tones.length, avg.b / tones.length));
  }
}

void main();
