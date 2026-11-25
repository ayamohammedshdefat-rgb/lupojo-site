/**
 * Builds LUPO brand assets from the original logo (530x150 RGB on a dark textured background).
 * The vector trace is the master; rasters are rendered from it so every size stays crisp.
 *  - public/brand/lupo-logo.svg  : 2-layer potrace vector (warm white + accent)
 *  - public/brand/lupo-logo.png / .webp : 1600w render of the SVG (OG image, fallbacks)
 *  - public/brand/lupo-mark.svg / .png  : wolf emblem only (icons, favicon, manifest)
 * Usage: npx tsx scripts/brand/logo.ts
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import potrace from 'potrace';

const SRC = 'reference/original/site/assets/dr_burger_logo.png';
const OUT = 'public/brand';
const SCALE = 3;
const WHITE = '#F6F1E9';
const ACCENT = '#E36F12';

function hsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max / 255 };
}

function trace(png: Buffer, color: string): Promise<string> {
  return new Promise((resolve, reject) => {
    potrace.trace(
      png,
      { threshold: 128, color, background: 'transparent', turdSize: 6, optTolerance: 0.3, blackOnWhite: true },
      (err: Error | null, svg: string) => (err ? reject(err) : resolve(svg)),
    );
  });
}

/** Round every decimal in path data to 1 place (the canvas is ~1600 units wide). */
const roundPath = (s: string) => s.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10));
const pathsOf = (svg: string, layer: string) =>
  (svg.match(/<path[^>]*\/>/g) ?? [])
    .map((p) => roundPath(p.replace('<path', `<path data-layer="${layer}"`)).replace(/ stroke="none"/, ''))
    .join('\n');

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir('reference/brand', { recursive: true });
  const meta = await sharp(SRC).metadata();
  const W = (meta.width ?? 530) * SCALE;
  const H = (meta.height ?? 150) * SCALE;
  const up = await sharp(SRC).removeAlpha().resize(W, H, { kernel: 'lanczos3' }).raw().toBuffer();

  // Split into two masks: warm-white strokes and accent strokes.
  const white = Buffer.alloc(W * H, 255);
  const accent = Buffer.alloc(W * H, 255);
  for (let p = 0; p < W * H; p++) {
    const i = p * 3;
    const { h, s, v } = hsv(up[i]!, up[i + 1]!, up[i + 2]!);
    if (s > 0.45 && v > 0.32 && h >= 10 && h < 45) accent[p] = 0;
    else if (v > 0.55 && s < 0.35) white[p] = 0;
  }
  const toPng = (buf: Buffer) => sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const [wSvg, aSvg] = await Promise.all([
    toPng(white).then((b) => trace(b, WHITE)),
    toPng(accent).then((b) => trace(b, ACCENT)),
  ]);
  const body = `${pathsOf(wSvg, 'white')}\n${pathsOf(aSvg, 'accent')}`;

  // Tight viewBox: render once, trim, and read the offsets.
  const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${body}</svg>`;
  const trimInfo = await sharp(Buffer.from(full)).png().trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const pad = 6;
  const vx = Math.max(0, -(trimInfo.info.trimOffsetLeft ?? 0) - pad);
  const vy = Math.max(0, -(trimInfo.info.trimOffsetTop ?? 0) - pad);
  const vw = trimInfo.info.width + pad * 2;
  const vh = trimInfo.info.height + pad * 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="LUPO Smash Burgers">\n${body}\n</svg>\n`;
  await writeFile(`${OUT}/lupo-logo.svg`, svg);
  console.log('logo.svg', `${vw}x${vh}`, `${(svg.length / 1024).toFixed(1)} KB`);

  const png = await sharp(Buffer.from(svg), { density: 72 * (1600 / vw) }).resize(1600).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(`${OUT}/lupo-logo.png`, png);
  await writeFile(`${OUT}/lupo-logo.webp`, await sharp(png).webp({ quality: 90, alphaQuality: 100 }).toBuffer());

  // Wolf emblem: left ~31% of the logo, squared.
  const markW = Math.round(vw * 0.31);
  const markBody = body;
  const markSvgRaw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${markW} ${vh}">${markBody}</svg>`;
  const markTrim = await sharp(Buffer.from(markSvgRaw)).png().trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const mx = vx - (markTrim.info.trimOffsetLeft ?? 0);
  const my = vy - (markTrim.info.trimOffsetTop ?? 0);
  const side = Math.max(markTrim.info.width, markTrim.info.height) + pad * 2;
  const cx = mx + markTrim.info.width / 2 - side / 2;
  const cy = my + markTrim.info.height / 2 - side / 2;
  const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cx.toFixed(1)} ${cy.toFixed(1)} ${side} ${side}" role="img" aria-label="LUPO">\n<defs><clipPath id="m"><rect x="${vx}" y="${vy}" width="${markW}" height="${vh}"/></clipPath></defs>\n<g clip-path="url(#m)">\n${markBody}\n</g>\n</svg>\n`;
  await writeFile(`${OUT}/lupo-mark.svg`, markSvg);
  await sharp(Buffer.from(markSvg), { density: 300 }).resize(512, 512).png().toFile(`${OUT}/lupo-mark.png`);
  console.log('mark', side);

  // Visual QA previews (kept under reference/brand, not shipped).
  const preview = async (input: Buffer, bg: string, file: string) => {
    const m = await sharp(input).metadata();
    await sharp({ create: { width: (m.width ?? 0) + 120, height: (m.height ?? 0) + 120, channels: 3, background: bg } })
      .composite([{ input, top: 60, left: 60 }])
      .png()
      .toFile(file);
  };
  await preview(await sharp(png).resize(1000).toBuffer(), '#0b0b0b', 'reference/brand/preview-logo-dark.png');
  await preview(await sharp(png).resize(1000).toBuffer(), '#5a2a08', 'reference/brand/preview-logo-glow.png');
  await preview(await sharp(`${OUT}/lupo-mark.png`).resize(256).toBuffer(), '#0b0b0b', 'reference/brand/preview-mark.png');
}

void main();
