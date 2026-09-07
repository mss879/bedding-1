import { createHmac, timingSafeEqual } from "node:crypto";
import { getPaycorpConfig } from "./config";

/**
 * Demo-mode carry-over for a card payment in flight.
 *
 * With Supabase configured the order row itself holds the Paycorp `reqid`, and
 * the return handler looks the order up by it. Without a database there is
 * nothing to look up, so the reference and total ride along in a signed,
 * HttpOnly cookie instead — enough to keep the full journey demonstrable before
 * launch, and signed so a shopper cannot hand themselves a paid confirmation.
 *
 * The cookie is never the source of truth for whether money moved: that is
 * always PAYMENT_COMPLETE.
 */

export const PENDING_PAYMENT_COOKIE = "enivrant_pending_payment";

/** Paycorp sessions expire well inside this; it only has to outlive the redirect. */
export const PENDING_PAYMENT_MAX_AGE = 60 * 45;

export type PendingPayment = {
  reqid: string;
  reference: string;
  total: number;
};

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Serialises a pending payment into a tamper-evident cookie value. */
export function pendingPaymentCookie(pending: PendingPayment): string | null {
  const config = getPaycorpConfig();
  if (!config) return null;
  const payload = Buffer.from(JSON.stringify(pending), "utf8").toString("base64url");
  return `${payload}.${sign(payload, config.hmacSecret)}`;
}

/** Verifies and parses a cookie value; null on any tampering or malformation. */
export function readPendingPayment(raw: string | undefined): PendingPayment | null {
  const config = getPaycorpConfig();
  if (!config || !raw) return null;

  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const provided = Buffer.from(raw.slice(dot + 1));
  const expected = Buffer.from(sign(payload, config.hmacSecret));
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as PendingPayment;
    if (typeof parsed.reqid !== "string" || typeof parsed.reference !== "string") return null;
    if (typeof parsed.total !== "number" || !Number.isFinite(parsed.total)) return null;
    return parsed;
  } catch {
    return null;
  }
}
