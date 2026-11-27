import { generateKeyPairSync, createPrivateKey } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { extractServiceAccountEmail, normalizePrivateKey } from '@/server/credentials';

const pem = generateKeyPairSync('rsa', { modulusLength: 1024 })
  .privateKey.export({ type: 'pkcs8', format: 'pem' })
  .toString();

const parses = (k: string) => createPrivateKey(k).asymmetricKeyType === 'rsa';

describe('normalizePrivateKey', () => {
  it('keeps a well-formed PEM valid', () => {
    expect(parses(normalizePrivateKey(pem))).toBe(true);
  });

  it('repairs keys whose line breaks became spaces (dashboard paste)', () => {
    expect(parses(normalizePrivateKey(pem.replace(/\n/g, ' ')))).toBe(true);
  });

  it('repairs literal \\n escapes, CRLF and surrounding quotes', () => {
    expect(parses(normalizePrivateKey(pem.replace(/\n/g, '\\n')))).toBe(true);
    expect(parses(normalizePrivateKey(pem.replace(/\n/g, '\r\n')))).toBe(true);
    expect(parses(normalizePrivateKey(`"${pem.replace(/\n/g, '\\n')}"`))).toBe(true);
  });

  it('repairs keys with line breaks removed entirely', () => {
    const squashed = pem.replace(/\n/g, '');
    expect(parses(normalizePrivateKey(squashed))).toBe(true);
  });
});

describe('extractServiceAccountEmail', () => {
  const sa = 'firebase-adminsdk-abc@demo-project.iam.gserviceaccount.com';

  it('accepts a clean value', () => {
    expect(extractServiceAccountEmail(sa)).toBe(sa);
  });

  it('tolerates quotes, a JSON key prefix, whitespace and a doubled paste', () => {
    expect(extractServiceAccountEmail(`"${sa}"`)).toBe(sa);
    expect(extractServiceAccountEmail(`"client_email": "${sa}",`)).toBe(sa);
    expect(extractServiceAccountEmail(`  ${sa}\n`)).toBe(sa);
    expect(extractServiceAccountEmail(`${sa}\n\n${sa}`)).toBe(sa);
  });

  it('rejects values without exactly one service-account email', () => {
    expect(extractServiceAccountEmail('someone@example.com')).toBeNull();
    expect(extractServiceAccountEmail('113000000000000000000')).toBeNull();
    expect(extractServiceAccountEmail(`${sa} other@demo-project.iam.gserviceaccount.com`)).toBeNull();
  });
});
