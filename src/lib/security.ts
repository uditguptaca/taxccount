// ASVS L2 Security Utilities
// Rate limiting, CSRF protection, security headers, input sanitization

import crypto from 'crypto';

// ── Rate Limiter (In-Memory, production: use Redis) ──────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate-limited
 * @returns true if the request should be BLOCKED
 */
export function isRateLimited(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
}

/**
 * Get rate limit info for a key
 */
export function getRateLimitInfo(key: string, maxRequests: number = 60) {
  const entry = rateLimitStore.get(key);
  if (!entry) return { remaining: maxRequests, resetAt: 0 };
  return {
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  const keys = Array.from(rateLimitStore.keys());
  for (let i = 0; i < keys.length; i++) {
    const entry = rateLimitStore.get(keys[i]);
    if (entry && now > entry.resetAt) rateLimitStore.delete(keys[i]);
  }
}, 60_000);

// ── CSRF Token Generation ────────────────────────────────────────────────

const csrfSecrets = new Map<string, { token: string; expiresAt: number }>();

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  csrfSecrets.set(sessionId, {
    token,
    expiresAt: Date.now() + 3600_000, // 1 hour
  });
  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfSecrets.get(sessionId);
  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    csrfSecrets.delete(sessionId);
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(stored.token),
    Buffer.from(token)
  );
}

// ── Security Headers ─────────────────────────────────────────────────────

/**
 * Returns security headers compliant with OWASP ASVS Level 2
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // XSS Protection (legacy but still useful)
    'X-XSS-Protection': '1; mode=block',
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions Policy (restrict browser features)
    'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=(self)',
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
    // Strict Transport Security (production only)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    // Prevent caching of sensitive pages
    'Cache-Control': 'no-store, max-age=0',
  };
}

// ── Input Sanitization ───────────────────────────────────────────────────

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const trimmed = email.trim().toLowerCase();
  if (!pattern.test(trimmed)) return null;
  if (trimmed.length > 254) return null;
  return trimmed;
}

/**
 * Validate phone number (E.164 format)
 */
export function sanitizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s()-]/g, '');
  if (/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
  return null;
}

// ── Password Policy ──────────────────────────────────────────────────────

export interface PasswordPolicyResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate password against ASVS L2 requirements
 * - Minimum 8 characters
 * - At least 1 uppercase, 1 lowercase, 1 digit
 * - Not in common password list
 */
export function validatePassword(password: string): PasswordPolicyResult {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password must not exceed 128 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least one digit');

  // Check against common passwords (top 20)
  const commonPasswords = [
    'password', '12345678', '123456789', 'qwerty', 'abc123',
    'password1', 'iloveyou', 'sunshine', 'princess', 'football',
    'charlie', 'access', 'shadow', 'master', 'michael',
    'superman', 'letmein', 'trustno1', 'password123', 'welcome',
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a more unique password.');
  }

  return { valid: errors.length === 0, errors };
}

// ── Session Security ─────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a session ID for storage (prevents session hijacking via DB leak)
 */
export function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

// ── API Abuse Detection ──────────────────────────────────────────────────

interface AbuseWindow {
  failedAttempts: number;
  lastAttempt: number;
  lockedUntil: number;
}

const abuseStore = new Map<string, AbuseWindow>();

/**
 * Track failed login attempts and implement account lockout
 * ASVS L2 requirement: Lock account after 10 failed attempts for 30 minutes
 */
export function trackLoginAttempt(identifier: string, success: boolean): {
  locked: boolean;
  attemptsRemaining: number;
  lockoutMinutes?: number;
} {
  const now = Date.now();
  const maxAttempts = 10;
  const lockoutDuration = 30 * 60_000; // 30 minutes

  let window = abuseStore.get(identifier);

  if (!window) {
    window = { failedAttempts: 0, lastAttempt: now, lockedUntil: 0 };
    abuseStore.set(identifier, window);
  }

  // Check if currently locked
  if (window.lockedUntil > now) {
    return {
      locked: true,
      attemptsRemaining: 0,
      lockoutMinutes: Math.ceil((window.lockedUntil - now) / 60_000),
    };
  }

  if (success) {
    // Reset on successful login
    abuseStore.delete(identifier);
    return { locked: false, attemptsRemaining: maxAttempts };
  }

  window.failedAttempts++;
  window.lastAttempt = now;

  if (window.failedAttempts >= maxAttempts) {
    window.lockedUntil = now + lockoutDuration;
    return {
      locked: true,
      attemptsRemaining: 0,
      lockoutMinutes: 30,
    };
  }

  return {
    locked: false,
    attemptsRemaining: maxAttempts - window.failedAttempts,
  };
}
