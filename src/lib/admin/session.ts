import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Single-admin session scheme: the session cookie carries an HMAC derived
// from ADMIN_PASSWORD, so there is nothing to store server-side and changing
// the password invalidates every existing session. Pure functions only —
// this module is imported by proxy.ts, which runs outside a request scope,
// so it must not touch next/headers.

export const ADMIN_COOKIE = "aveline_admin";

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function adminSessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("aveline-admin-session-v1").digest("hex");
}

export function isValidAdminToken(token: string | null | undefined): boolean {
  const expected = adminSessionToken();
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Timing-safe password check; hashes both sides to equalize lengths first. */
export function isCorrectAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
