// Tests for encryption utility — AES-256-GCM encrypt/decrypt round-trip
const { encrypt, decrypt } = require('../../src/utils/encryption');

describe('encrypt(text)', () => {
  it('returns an object with iv, encryptedData, and authTag as strings', () => {
    const result = encrypt('my-secret-pat');
    expect(typeof result.iv).toBe('string');
    expect(typeof result.encryptedData).toBe('string');
    expect(typeof result.authTag).toBe('string');
  });

  it('returns different output each call because IV is random', () => {
    const first = encrypt('same-text');
    const second = encrypt('same-text');
    expect(first.iv).not.toBe(second.iv);
    expect(first.encryptedData).not.toBe(second.encryptedData);
  });

  it('never returns the original text as encryptedData', () => {
    const text = 'my-secret-pat';
    const { encryptedData } = encrypt(text);
    expect(encryptedData).not.toBe(text);
  });
});

describe('decrypt({ iv, encryptedData, authTag })', () => {
  it('returns the original plaintext', () => {
    const text = 'my-secret-pat';
    const encrypted = encrypt(text);
    expect(decrypt(encrypted)).toBe(text);
  });

  it('round-trips correctly: decrypt(encrypt(text)) === text', () => {
    const texts = ['simple', 'with spaces', 'special!@#$%', 'org/project'];
    for (const text of texts) {
      expect(decrypt(encrypt(text))).toBe(text);
    }
  });

  it('throws an error if authTag is tampered with', () => {
    const encrypted = encrypt('my-secret-pat');
    const tampered = { ...encrypted, authTag: 'deadbeef'.repeat(4) };
    expect(() => decrypt(tampered)).toThrow();
  });
});
