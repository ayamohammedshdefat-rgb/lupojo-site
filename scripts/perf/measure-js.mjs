#!/usr/bin/env node
/**
 * First-load JS for a route: fetches the HTML, sums gzip sizes of the module scripts it loads
 * (legacy `noModule` polyfills are reported separately — modern browsers never download them).
 * Usage: node scripts/perf/measure-js.mjs [url=http://localhost:3100/] [budgetKB=180]
 */
import { gzipSync } from 'node:zlib';

const url = process.argv[2] ?? 'http://localhost:3100/';
const budget = Number(process.argv[3] ?? 180);
const origin = new URL(url).origin;
const html = await (await fetch(url)).text();

const tags = [...html.matchAll(/<script\b[^>]*\bsrc="(\/_next\/static\/[^"]+\.js)"[^>]*>/g)];
const legacy = new Set(tags.filter((m) => /\bnoModule\b/i.test(m[0])).map((m) => m[1]));
const scripts = [...new Set(tags.map((m) => m[1]))];

let total = 0;
let legacyTotal = 0;
const rows = [];
for (const src of scripts) {
  const buf = Buffer.from(await (await fetch(origin + src)).arrayBuffer());
  const gz = gzipSync(buf, { level: 9 }).length;
  if (legacy.has(src)) legacyTotal += gz;
  else total += gz;
  rows.push({ gz, raw: buf.length, src: src.split('/').pop(), legacy: legacy.has(src) });
}
rows.sort((a, b) => b.gz - a.gz);
for (const r of rows) {
  console.log(`${(r.gz / 1024).toFixed(1).padStart(7)} KB gz ${(r.raw / 1024).toFixed(0).padStart(5)} KB raw  ${r.src}${r.legacy ? '  (noModule, skipped)' : ''}`);
}
const kb = total / 1024;
console.log(`\nFirst-load JS (gzip, modern browsers): ${kb.toFixed(1)} KB  [budget ${budget} KB] ${kb <= budget ? 'OK' : 'OVER'}`);
console.log(`Legacy polyfills (noModule): ${(legacyTotal / 1024).toFixed(1)} KB`);
process.exit(kb <= budget ? 0 : 1);
