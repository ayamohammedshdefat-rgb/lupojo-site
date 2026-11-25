#!/usr/bin/env node
/**
 * Starts the Firebase Emulator Suite for local development, persisting data in ./emulator-data
 * (imported when present, exported on exit). Pass --fresh to start empty.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const fresh = process.argv.includes('--fresh');
const args = ['scripts/with-java.mjs', 'firebase', 'emulators:start', '--project', 'demo-lupo', '--export-on-exit', './emulator-data'];
if (!fresh && existsSync('emulator-data/firebase-export-metadata.json')) args.push('--import', './emulator-data');
const child = spawn(process.execPath, args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 1));
