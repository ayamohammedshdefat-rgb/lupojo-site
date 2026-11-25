#!/usr/bin/env node
/**
 * Runs a command with Java 21 available (the Firestore emulator needs it).
 * - Uses JAVA_HOME if set, otherwise the portable JDK at %LOCALAPPDATA%/lupo-tools/jdk21 when present.
 * - On Windows, if the project path has non-ASCII characters (Java receives them as "????"),
 *   the project folder is mapped to a drive letter with `subst` and the command runs from there.
 * Usage: node scripts/with-java.mjs <command> [...args]
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { delimiter, join } from 'node:path';

const env = { ...process.env, LUPO_REAL_CWD: process.env.LUPO_REAL_CWD || process.cwd() };
{
  // Make local binaries (firebase, vitest, playwright) resolvable when not launched via npm.
  const key = Object.keys(env).find((k) => k.toLowerCase() === 'path') ?? 'PATH';
  env[key] = `${join(process.cwd(), 'node_modules', '.bin')}${delimiter}${env[key] ?? ''}`;
}
if (!env.JAVA_HOME) {
  const base = env.LOCALAPPDATA ?? join(env.HOME ?? '', '.local', 'share');
  const portable = join(base, 'lupo-tools', 'jdk21');
  if (existsSync(join(portable, 'bin'))) {
    env.JAVA_HOME = portable;
    const key = Object.keys(env).find((k) => k.toLowerCase() === 'path') ?? 'PATH';
    env[key] = `${join(portable, 'bin')}${delimiter}${env[key] ?? ''}`;
  }
}

/** Returns an ASCII-only path to the project root (a subst drive on Windows when needed). */
function asciiProjectRoot() {
  const cwd = process.cwd();
  if (process.platform !== 'win32' || /^[\x00-\x7F]*$/.test(cwd)) return cwd;
  const marker = 'package.json';
  const ino = statSync(join(cwd, marker)).ino;
  const letters = 'LUPOMNQRSTVWXYZ'.split('');
  for (const l of letters) {
    const root = `${l}:\\`;
    try {
      if (existsSync(join(root, marker)) && statSync(join(root, marker)).ino === ino) return root;
    } catch {
      /* drive not ready */
    }
  }
  for (const l of letters) {
    if (existsSync(`${l}:\\`)) continue;
    const res = spawnSync('subst', [`${l}:`, cwd], { stdio: 'inherit' });
    if (res.status === 0) {
      console.log(`[with-java] mapped project to ${l}:\\ (non-ASCII path workaround for Java)`);
      return `${l}:\\`;
    }
  }
  console.warn('[with-java] could not map an ASCII drive; Java tools may fail on this path.');
  return cwd;
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error('usage: with-java.mjs <command> [...args]');
  process.exit(2);
}
// A shell is needed for .cmd shims on Windows; quote arguments so multi-word commands survive.
const quote = (a) => (/^[\w@%+=:,./\\-]+$/.test(a) ? a : `"${a.replace(/"/g, '\\"')}"`);
const line = [cmd, ...args].map(quote).join(' ');
const child = spawn(line, { stdio: 'inherit', env, shell: true, cwd: asciiProjectRoot() });
child.on('exit', (code) => process.exit(code ?? 1));
