import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

function walk(dir: string, exts: string[]): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p, exts);
    return exts.some((e) => name.endsWith(e)) ? [p] : [];
  });
}

const srcFiles = walk(join(ROOT, 'src'), ['.ts', '.tsx', '.css', '.md']);
const codeFiles = srcFiles.filter((f) => /\.(ts|tsx)$/.test(f));
const rel = (f: string) => relative(ROOT, f).replaceAll('\\', '/');

describe('brand rules', () => {
  it('has no emoji in src, i18n or the seed', () => {
    const targets = [...srcFiles, ...walk(join(ROOT, 'scripts', 'seed'), ['.json'])];
    const offenders = targets.filter((f) => /\p{Extended_Pictographic}/u.test(readFileSync(f, 'utf8'))).map(rel);
    expect(offenders).toEqual([]);
  });

  it('never types glyphs Cairo does not have (use icons instead)', () => {
    const missing = /[★☆→←↓✓✕]/u;
    const offenders = codeFiles.filter((f) => missing.test(readFileSync(f, 'utf8'))).map(rel);
    expect(offenders).toEqual([]);
  });

  it('uses only Cairo weights 200/300/400/600/700/900', () => {
    const bad = /\bfont-(?:thin|extralight|light|medium|extrabold|\[(?:100|500|800)\])\b|font-weight:\s*(?:100|500|800)\b|fontWeight:\s*['"]?(?:100|500|800)\b/;
    const offenders = srcFiles.filter((f) => bad.test(readFileSync(f, 'utf8'))).map(rel);
    expect(offenders).toEqual([]);
  });

  it('declares no font family other than Cairo', () => {
    const offenders = srcFiles
      .filter((f) => !f.endsWith('.md'))
      .filter((f) => {
        const text = readFileSync(f, 'utf8');
        const decls = [...text.matchAll(/font-family:\s*([^;}{]+)/g), ...text.matchAll(/fontFamily:\s*['"`]([^'"`]+)/g)];
        return decls.some(([, value]) => !/^\s*(?:var\(--font-cairo(?:-thin)?\)|var\(--font-sans\)|inherit)\s*!?\w*\s*$/.test(value!.trim()));
      })
      .map(rel);
    expect(offenders).toEqual([]);
  });

  it('uses logical direction utilities only (RTL-safe)', () => {
    const physical =
      /(?<=["'`\s:])-?(?:ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|scroll-ml|scroll-mr|scroll-pl|scroll-pr)-[^\s"'`]+(?=[\s"'`])|(?<=["'`\s:])(?:text-left|text-right|float-left|float-right)(?=[\s"'`])/;
    const offenders = codeFiles.filter((f) => physical.test(readFileSync(f, 'utf8'))).map(rel);
    expect(offenders).toEqual([]);
  });

  it('never imports the seed from app code', () => {
    const offenders = codeFiles.filter((f) => /from\s+['"][^'"]*(?:scripts\/|seed\/|lupo-menu\.json)/.test(readFileSync(f, 'utf8'))).map(rel);
    expect(offenders).toEqual([]);
  });

  it('has no "DR." leftovers in app code', () => {
    const offenders = codeFiles.filter((f) => /\bDR\.\s|dr_burger|dr_smash/i.test(readFileSync(f, 'utf8'))).map(rel);
    expect(offenders).toEqual([]);
  });

  it('marks every server module with server-only', () => {
    const serverFiles = codeFiles.filter((f) => rel(f).startsWith('src/server/'));
    const offenders = serverFiles.filter((f) => !/^(?:\/\*[\s\S]*?\*\/\s*|\/\/.*\n\s*|'use server';\s*)*import 'server-only';/.test(readFileSync(f, 'utf8'))).map(rel);
    expect(offenders).toEqual([]);
  });
});
