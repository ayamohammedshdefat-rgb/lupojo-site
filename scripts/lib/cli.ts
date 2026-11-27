/**
 * Shared CLI guard for scripts that touch Firebase.
 * Emulators by default; production only with `--prod --project <id> --confirm`.
 */
export type Target = { prod: boolean; projectId: string };

export function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : '';
}

export const flag = (name: string) => process.argv.includes(`--${name}`);

export function resolveTarget(): Target {
  if (!flag('prod')) {
    process.env.NEXT_PUBLIC_USE_EMULATORS = 'true';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-lupo';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||= 'demo-lupo.appspot.com';
    return { prod: false, projectId: 'demo-lupo' };
  }
  const projectId = arg('project');
  if (!projectId || !flag('confirm')) {
    console.error('Refusing to touch production: pass --prod --project <id> --confirm');
    process.exit(2);
  }
  if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
    console.error('NEXT_PUBLIC_USE_EMULATORS=true conflicts with --prod');
    process.exit(2);
  }
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = projectId;
  // Projects created since late 2024 use <id>.firebasestorage.app; override with --bucket if needed.
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = arg('bucket') || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;
  return { prod: true, projectId };
}
