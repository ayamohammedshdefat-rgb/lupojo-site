import 'server-only';

/**
 * Normalizes a service-account private key pasted into a hosting dashboard. Dashboards and
 * clipboards often mangle the PEM: literal "\n" sequences, CRLF, surrounding quotes, or line
 * breaks collapsed into spaces. The base64 body is re-wrapped at 64 columns.
 */
export function normalizePrivateKey(raw: string): string {
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  s = s.replace(/\\r/g, '').replace(/\\n/g, '\n').replace(/\r\n?/g, '\n');
  const m = /-----BEGIN ([A-Z ]*PRIVATE KEY)-----([\s\S]*?)-----END \1-----/.exec(s);
  if (!m) return s;
  const label = m[1]!;
  const body = m[2]!.replace(/\s+/g, '');
  const lines = body.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----\n`;
}

const SERVICE_ACCOUNT_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.iam\.gserviceaccount\.com/g;

/**
 * Finds the service-account email inside a pasted dashboard value. Tolerates quotes, a
 * `"client_email":` prefix, stray whitespace or the same email pasted twice. Returns null when
 * there is no service-account email or more than one distinct one.
 */
export function extractServiceAccountEmail(raw: string): string | null {
  const found = new Set(raw.match(SERVICE_ACCOUNT_EMAIL) ?? []);
  return found.size === 1 ? [...found][0]! : null;
}
