/**
 * Шифрование сообщений чата — AES-256-GCM.
 *
 * Ключ берётся из .env (CHAT_ENCRYPTION_KEY).
 * Если ключ не задан — сообщения хранятся без шифрования.
 */

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer | null {
  const key = process.env.CHAT_ENCRYPTION_KEY;
  if (!key) return null;

  // Ключ должен быть 32 байта (256 бит)
  // Если передана строка — хешируем в 32 байта
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Зашифровать текст.
 * Возвращает строку: iv:authTag:encrypted (hex)
 */
export function encrypt(text: string): string {
  const key = getKey();
  if (!key) return text; // без ключа — не шифруем

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Расшифровать текст.
 */
export function decrypt(encryptedText: string): string {
  const key = getKey();
  if (!key) return encryptedText;

  // Проверяем формат — если нет ":", значит не зашифровано
  if (!encryptedText.includes(':')) return encryptedText;

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    // Если не удалось расшифровать — возвращаем как есть
    return encryptedText;
  }
}
