const crypto = require('crypto');
const { encryptionKey } = require('../config/env');

// Key derived once at module load — scrypt is intentionally slow, don't call per-request
const KEY = crypto.scryptSync(encryptionKey, 'devspace-salt', 32);
const ALGORITHM = 'aes-256-gcm';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encryptedData = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encryptedData.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  };
}

function decrypt({ iv, encryptedData, authTag }) {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
