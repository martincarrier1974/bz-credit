import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 16;
const TAG_LEN = 16;
const PREFIX_DET = 'DET:';

function getKey(): Buffer | null {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 16) return null;
  return crypto.createHash('sha256').update(key).digest();
}

/** Encrypte une chaîne (IV aléatoire, non déterministe) */
export function encrypt(plaintext: string | null): string | null {
  if (plaintext == null || plaintext === '') return plaintext;
  const key = getKey();
  if (!key) return plaintext;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = (cipher as crypto.CipherGCM).getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

/** Déchiffre une chaîne chiffrée (format encrypt) */
export function decrypt(ciphertext: string | null): string | null {
  if (ciphertext == null || ciphertext === '') return ciphertext;
  const key = getKey();
  if (!key) return ciphertext;
  if (!ciphertext.startsWith(PREFIX_DET)) {
    try {
      const buf = Buffer.from(ciphertext, 'base64');
      if (buf.length < IV_LEN + TAG_LEN) return ciphertext;
      const iv = buf.subarray(0, IV_LEN);
      const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
      const enc = buf.subarray(IV_LEN + TAG_LEN);
      const decipher = crypto.createDecipheriv(ALGO, key, iv);
      decipher.setAuthTag(tag);
      return decipher.update(enc) + decipher.final('utf8');
    } catch {
      return ciphertext;
    }
  }
  return decryptDeterministic(ciphertext.slice(PREFIX_DET.length));
}

/** Chiffrement déterministe (même entrée = même sortie), pour recherche */
export function encryptDeterministic(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext;
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(plaintext);
  const derived = hmac.digest();
  const iv = derived.subarray(0, IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = (cipher as crypto.CipherGCM).getAuthTag();
  return PREFIX_DET + Buffer.concat([iv, tag, enc]).toString('base64');
}

/** Déchiffre une chaîne chiffrée de manière déterministe */
export function decryptDeterministic(ciphertext: string): string {
  const key = getKey();
  if (!key) return ciphertext;
  try {
    const buf = Buffer.from(ciphertext, 'base64');
    if (buf.length < IV_LEN + TAG_LEN) return ciphertext;
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const enc = buf.subarray(IV_LEN + TAG_LEN);
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(enc) + decipher.final('utf8');
  } catch {
    return ciphertext;
  }
}
