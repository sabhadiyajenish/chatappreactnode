import crypto from "crypto";

const keyHex = process.env.ENCRYPTION_KEY;
if (!keyHex) {
  throw new Error(
    "ENCRYPTION_KEY is not set. Provide a 64-character hex string (32 bytes) in your .env file."
  );
}
if (!/^[0-9a-fA-F]+$/.test(keyHex) || keyHex.length !== 64) {
  throw new Error(
    "ENCRYPTION_KEY must be a 64-character hexadecimal string representing 32 bytes (AES-256)."
  );
}
const ENCRYPTION_KEY = Buffer.from(keyHex, "hex");
const IV_LENGTH = 16; // 16 bytes for AES

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text) {
  const [iv, encryptedText] = text.split(":");
  const ivBuffer = Buffer.from(iv, "hex");
  const encryptedTextBuffer = Buffer.from(encryptedText, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    ivBuffer
  );
  let decrypted = decipher.update(encryptedTextBuffer, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export { encrypt, decrypt };
