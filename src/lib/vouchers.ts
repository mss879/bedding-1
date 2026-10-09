import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "./supabase-admin";
import type { Voucher } from "./types";

/**
 * Spa vouchers — SERVER ONLY.
 *
 * Every voucher bought is one row in `vouchers` with a code of its own
 * (migration 0011). The checkout writes them as `pending`; a card payment
 * issues them the moment it settles, and a bank-transfer order's are issued
 * when the dashboard confirms the order.
 */

// No 0/O, 1/I/L or 5/S: a code is read aloud over the phone at a spa desk.
const ALPHABET = "2346789ABCDEFGHJKMNPQRTUVWXYZ";

/** A fresh code, e.g. ENV-7K3P-2M9X — 29^8, about 5 × 10^11 possibilities. */
export function generateVoucherCode(): string {
  // Bytes at or above the largest multiple of the alphabet's length are
  // thrown away, so every character is equally likely.
  const limit = 256 - (256 % ALPHABET.length);
  const chars: string[] = [];
  while (chars.length < 8) {
    for (const b of randomBytes(16)) {
      if (b < limit && chars.length < 8) chars.push(ALPHABET[b % ALPHABET.length]);
    }
  }
  return `ENV-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

/**
 * The confirmation page may show a card order's codes only to the browser that
 * just paid for it. The Paycorp return handler hands that browser this cookie
 * — the order id, signed and short-lived — and the page reads codes for the
 * order it names. Nothing in the query string can select an order, so editing
 * the confirmation URL reveals nobody else's codes.
 */
export const VOUCHER_CLAIM_COOKIE = "enivrant_voucher_claim";
export const VOUCHER_CLAIM_MAX_AGE = 60 * 15;
export const VOUCHER_CLAIM_PATH = "/checkout/success";

function claimSecret(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

function sign(payload: string, secret: string) {
  // Its own purpose string, so this signature can never stand in for any
  // other signature made with the same key.
  return createHmac("sha256", secret).update(`voucher-claim:${payload}`).digest("base64url");
}

export function voucherClaimCookie(orderId: string): string | null {
  const secret = claimSecret();
  if (!secret) return null;
  const payload = Buffer.from(
    JSON.stringify({ orderId, exp: Date.now() + VOUCHER_CLAIM_MAX_AGE * 1000 }),
    "utf8"
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/** The order a claim cookie names, or null if it is missing, tampered with or expired. */
export function readVoucherClaim(raw: string | undefined): string | null {
  const secret = claimSecret();
  if (!secret || !raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const provided = Buffer.from(raw.slice(dot + 1));
  const expected = Buffer.from(sign(payload, secret));
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      orderId?: unknown;
      exp?: unknown;
    };
    if (typeof parsed.orderId !== "string" || typeof parsed.exp !== "number") return null;
    return parsed.exp > Date.now() ? parsed.orderId : null;
  } catch {
    return null;
  }
}

/** Issues an order's pending vouchers — called once its payment is confirmed. */
export async function issueVouchersForOrder(orderId: string): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;
  const { error } = await sb
    .from("vouchers")
    .update({ status: "issued", issued_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .eq("status", "pending");
  // The payment has gone through, so never fail the shopper over this; the
  // dashboard can still issue the codes by hand from the order.
  if (error) console.error(`[vouchers] could not issue the codes for order ${orderId}: ${error.message}`);
}

/**
 * An order's live codes, for the confirmation page — only when the order the
 * claim cookie names is also the one the page is confirming.
 */
export async function getIssuedVouchers(orderId: string, reference: string): Promise<Voucher[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data: order } = await sb.from("orders").select("reference").eq("id", orderId).maybeSingle();
  if (!order || order.reference !== reference) return [];
  const { data, error } = await sb
    .from("vouchers")
    .select("*")
    .eq("order_id", orderId)
    .eq("status", "issued")
    .order("created_at");
  if (error || !data) return [];
  return data.map((row) => ({ ...(row as Voucher), value: Number(row.value), paid: Number(row.paid) }));
}
