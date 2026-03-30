// MFA Utility: TOTP-based Multi-Factor Authentication
// Implements RFC 6238 Time-Based One-Time Password Algorithm

import crypto from 'crypto';

const TOTP_PERIOD = 30; // seconds
const TOTP_DIGITS = 6;

/**
 * Generate a random base32-encoded secret for TOTP enrollment
 */
export function generateMfaSecret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Generate a TOTP code from a secret at the current time
 */
export function generateTOTP(secret: string, time?: number): string {
  const epoch = time || Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / TOTP_PERIOD);
  
  const decodedSecret = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(0, 0);
  counterBuffer.writeUInt32BE(counter, 4);
  
  const hmac = crypto.createHmac('sha1', decodedSecret);
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();
  
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code = (
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff)
  ) % Math.pow(10, TOTP_DIGITS);
  
  return String(code).padStart(TOTP_DIGITS, '0');
}

/**
 * Verify a TOTP code (allows ±1 time window for clock drift)
 */
export function verifyTOTP(secret: string, token: string): boolean {
  const epoch = Math.floor(Date.now() / 1000);
  // Check current, previous, and next time windows
  for (let i = -1; i <= 1; i++) {
    const checkTime = epoch + (i * TOTP_PERIOD);
    if (generateTOTP(secret, checkTime) === token) {
      return true;
    }
  }
  return false;
}

/**
 * Generate recovery codes (one-time use)
 */
export function generateRecoveryCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Build the otpauth:// URI for authenticator apps
 */
export function buildOtpAuthUri(secret: string, email: string, issuer: string = 'Taxccount'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

// Base32 encoding/decoding helpers
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let result = '';
  let bits = 0;
  let value = 0;
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      result += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    result += BASE32_CHARS[(value << (5 - bits)) & 31];
  }
  return result;
}

function base32Decode(str: string): Buffer {
  const cleaned = str.replace(/=+$/, '').toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of cleaned) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}
