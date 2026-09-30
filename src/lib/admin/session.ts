// Admin sessions. Supabase Auth checks the email and password once, at sign-in
// (see signInAdmin in auth.ts). After that the dashboard carries its own signed
// cookie naming the Supabase user and an expiry, so later requests are verified
// without a round trip to the Auth server and there are no refresh tokens to
// rotate. The signature is keyed by SUPABASE_SERVICE_ROLE_KEY: the dashboard
// cannot work without that key anyway, so there is no extra secret to
// configure, and rotating it signs everyone out.
//
// Pure functions on Web Crypto only — this module is imported by proxy.ts,
// which runs outside a request scope (and, depending on the host, outside
// Node), so it must not touch next/headers or node: built-ins.

export const ADMIN_COOKIE = "enivrant_admin";

/** How long a sign-in lasts, in seconds. Enforced by the signed expiry, not just the cookie. */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SIGNATURE_RE = /^[0-9a-f]{64}$/;
const encoder = new TextEncoder();

async function signingKey(): Promise<CryptoKey | null> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return null;
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// The label keeps this signature from being valid for anything else the same
// key might ever sign.
function signedMessage(userId: string, expires: string) {
  return encoder.encode(`enivrant-admin-session-v2.${userId}.${expires}`);
}

/** A session token for a Supabase user: `<user id>.<expiry in unix seconds>.<signature>`. */
export async function createAdminSessionToken(userId: string): Promise<string | null> {
  const key = await signingKey();
  if (!key || !UUID_RE.test(userId)) return null;
  const expires = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE);
  const signature = await crypto.subtle.sign("HMAC", key, signedMessage(userId, expires));
  const hex = Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${userId}.${expires}.${hex}`;
}

/**
 * The Supabase user id a token was issued to, or null when it is missing,
 * malformed, forged or expired. This proves who signed in — whether they are
 * still an admin is a separate, database-backed check (see auth.ts).
 */
export async function verifyAdminSessionToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  const [userId, expires, signature, ...rest] = token.split(".");
  if (rest.length > 0 || !UUID_RE.test(userId ?? "")) return null;
  if (!/^\d{1,12}$/.test(expires ?? "") || !SIGNATURE_RE.test(signature ?? "")) return null;

  const key = await signingKey();
  if (!key) return null;
  const bytes = Uint8Array.from(signature.match(/../g) ?? [], (pair) => parseInt(pair, 16));
  // subtle.verify compares in constant time.
  const valid = await crypto.subtle.verify("HMAC", key, bytes, signedMessage(userId, expires));
  if (!valid) return null;

  return Number(expires) * 1000 > Date.now() ? userId : null;
}
