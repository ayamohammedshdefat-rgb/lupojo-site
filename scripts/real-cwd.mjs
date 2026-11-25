#!/usr/bin/env node
/**
 * Runs a command from the real project directory. `with-java.mjs` may run the emulators from a
 * `subst` drive (Java needs an ASCII path); Node tools (Vitest, Next, Playwright) prefer the real path.
 * Usage: node scripts/real-cwd.mjs <command> [...args]
 */
import { spawn } from 'node:child_process';

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error('usage: real-cwd.mjs <command> [...args]');
  process.exit(2);
}
const quote = (a) => (/^[\w@%+=:,./\\-]+$/.test(a) ? a : `"${a.replace(/"/g, '\\"')}"`);
const line = [cmd, ...args].map(quote).join(' ');
const cwd = process.env.LUPO_REAL_CWD || process.cwd();
const child = spawn(line, { stdio: 'inherit', shell: true, cwd });
child.on('exit', (code) => process.exit(code ?? 1));
