import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// Encryption key derived from AUTH_SECRET (or a dedicated ENCRYPTION_KEY)
function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET || process.env.ENCRYPTION_KEY;
  if (!secret) throw new Error("No encryption key available (AUTH_SECRET or ENCRYPTION_KEY)");
  return scryptSync(secret, "cyclecoach-salt", 32);
}

/**
 * Encrypt a string. Returns "iv:encrypted" in hex.
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt a string from "iv:encrypted" hex format.
 */
export function decrypt(encrypted: string): string {
  const key = getKey();
  const [ivHex, data] = encrypted.split(":");
  if (!ivHex || !data) throw new Error("Invalid encrypted format");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Check if a string looks encrypted (hex:hex format).
 */
export function isEncrypted(text: string): boolean {
  return /^[0-9a-f]{32}:[0-9a-f]+$/.test(text);
}
