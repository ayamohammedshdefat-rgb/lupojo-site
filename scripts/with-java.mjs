#!/usr/bin/env node
/**
 * Runs a command with Java 21 available (the Firestore emulator needs it).
 * Uses JAVA_HOME if set, otherwise the portable JDK at %LOCALAPPDATA%/lupo-tools/jdk21 when present.
 * Usage: node scripts/with-java.mjs <command> [...args]
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';

const env = { ...process.env };
if (!env.JAVA_HOME) {
  const base = env.LOCALAPPDATA ?? join(env.HOME ?? '', '.local', 'share');
  const portable = join(base, 'lupo-tools', 'jdk21');
  if (existsSync(join(portable, 'bin'))) {
    env.JAVA_HOME = portable;
    const key = Object.keys(env).find((k) => k.toLowerCase() === 'path') ?? 'PATH';
    env[key] = `${join(portable, 'bin')}${delimiter}${env[key] ?? ''}`;
  }
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error('usage: with-java.mjs <command> [...args]');
  process.exit(2);
}
const child = spawn(cmd, args, { stdio: 'inherit', env, shell: true });
child.on('exit', (code) => process.exit(code ?? 1));
