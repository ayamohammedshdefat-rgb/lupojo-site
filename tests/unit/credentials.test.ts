import { generateKeyPairSync, createPrivateKey } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { normalizePrivateKey } from '@/server/credentials';

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
