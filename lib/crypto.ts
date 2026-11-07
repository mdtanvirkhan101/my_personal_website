import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a deterministic 32-byte key from AUTH_SECRET or falls back to system secret
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET || process.env.ENCRYPTION_SECRET || "antigravity-secure-encryption-key-min-32-chars-long";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plaintext string into a combined hex string (iv:ciphertext:authTag)
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to securely encrypt sensitive data.");
  }
}

/**
 * Decrypts a combined hex string back to plaintext
 */
export function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload) return "";
  
  // If not encrypted in our iv:data:tag format, return empty or raw if legacy
  if (!encryptedPayload.includes(":")) {
    return encryptedPayload;
  }

  try {
    const [ivHex, encryptedHex, authTagHex] = encryptedPayload.split(":");
    if (!ivHex || !encryptedHex || !authTagHex) return "";

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}

/**
 * Helper to mask an API key for safe UI display (e.g. "sk-proj-...a9f1")
 */
export function maskSecret(secret: string): string {
  if (!secret) return "Not configured";
  if (secret.length <= 8) return "••••••••";
  const start = secret.slice(0, 4);
  const end = secret.slice(-4);
  return `${start}••••••••${end}`;
}

