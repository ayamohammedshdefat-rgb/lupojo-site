/**
 * Sets the dashboard role of a Firebase Auth user (custom claim `role`).
 *
 *   npm run set-role -- --email owner@example.com --role owner
 *   npm run set-role -- --email a@b.c --role staff --create --password secret123   (emulators only)
 *   npm run set-role -- --email a@b.c --role none
 *   npm run set-role -- --email a@b.c --role owner --prod --project <id> --confirm
 *
 * Refresh tokens are revoked so the new role applies on the next sign-in.
 */
import { arg, flag, resolveTarget } from './lib/cli';

const target = resolveTarget();
const email = arg('email');
const role = arg('role');
const ROLES = ['owner', 'staff', 'none'] as const;

async function main() {
  if (!email || !role || !(ROLES as readonly string[]).includes(role)) {
    console.error('usage: set-role --email <e> --role owner|staff|none [--create --password <p>]');
    process.exit(2);
  }
  const { adminAuth } = await import('../src/server/firebase-admin');
  const auth = adminAuth();

  let user = await auth.getUserByEmail(email).catch(() => null);
  if (!user && flag('create')) {
    if (target.prod) throw new Error('--create is emulator-only; invite staff from the dashboard instead');
    const password = arg('password');
    if (!password || password.length < 8) throw new Error('--password (min 8 chars) is required with --create');
    user = await auth.createUser({ email, password, emailVerified: true });
    console.log(`created ${email}`);
  }
  if (!user) throw new Error(`no user with email ${email}`);

  const claims = { ...(user.customClaims ?? {}) } as Record<string, unknown>;
  if (role === 'none') delete claims.role;
  else claims.role = role;
  await auth.setCustomUserClaims(user.uid, claims);
  await auth.revokeRefreshTokens(user.uid);
  console.log(`${email}: role=${role} on ${target.prod ? target.projectId : 'emulators'}`);
}

main().then(
  () => process.exit(0),
  (err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
