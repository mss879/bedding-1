import { NextResponse, type NextRequest } from "next/server";
import { paymentComplete, type PaycorpCompleteSuccess } from "@/lib/paycorp/client";
import { getPaycorpConfig, toGatewayAmount, toMinorUnits } from "@/lib/paycorp/config";
import { PENDING_PAYMENT_COOKIE, readPendingPayment } from "@/lib/paycorp/pending";
import { formatPrice, site, whatsappLink } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Where Paycorp sends the shopper back to.
 *
 * The browser carries exactly one thing: `reqid`. Everything else — whether the
 * card was approved, for how much, in what currency — comes from a fresh
 * server-to-server PAYMENT_COMPLETE call, so a shopper editing the URL changes
 * nothing. The amount is then checked against what we asked Paycorp to charge
 * before the order is marked paid.
 */

export const dynamic = "force-dynamic";

type PendingOrder = {
  id: string | null;
  reference: string;
  /** Storefront total, in USD. */
  total: number;
  /** What we asked the gateway to charge, in the settlement currency. */
  expectedAmount: number;
  /** The currency that amount was denominated in at PAYMENT_INIT. Pairing the
   *  two is what stops "10000" of one currency satisfying 10000 of another. */
  expectedCurrency: string | null;
  alreadyPaid: boolean;
  /** Set once paid, so a reload can still show the payment reference. */
  txnReference: string | null;
};

function redirectTo(request: NextRequest, path: string, params: Record<string, string>) {
  const url = new URL(path, request.nextUrl.origin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  // 303 so the redirect is followed as a GET even when Paycorp returns by POST.
  const response = NextResponse.redirect(url, 303);
  response.cookies.delete(PENDING_PAYMENT_COOKIE);
  return response;
}

function failed(request: NextRequest, reason: string, reference?: string) {
  return redirectTo(request, "/checkout/payment-failed", {
    reason,
    ...(reference ? { ref: reference } : {}),
  });
}

/** Paycorp uses GET by default; POST is here in case returnMethod is changed. */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const reqid = (form?.get("reqid") as string | null) ?? request.nextUrl.searchParams.get("reqid");
  return handleReturn(request, reqid);
}

export async function GET(request: NextRequest) {
  return handleReturn(request, request.nextUrl.searchParams.get("reqid"));
}

async function handleReturn(request: NextRequest, reqid: string | null) {
  const config = getPaycorpConfig();
  if (!config) return failed(request, "unavailable");
  if (!reqid) return failed(request, "missing");

  const order = await findPendingOrder(request, reqid);
  if (!order) return failed(request, "unknown");

  // A shopper reloading the return URL, or the gateway retrying it, must not
  // re-run the outcome. This is not merely wasteful: PAYMENT_COMPLETE is
  // single-use, and a second call for the same reqid answers REQUEST_EXPIRED —
  // which would otherwise mark an order that genuinely paid as failed.
  if (order.alreadyPaid) return succeeded(request, order, order.txnReference);

  const result = await paymentComplete(reqid);
  if (!result.ok) {
    // The alreadyPaid check above is not atomic, and PAYMENT_COMPLETE can take
    // up to 45s — long enough for a shopper who reloads a hanging return page
    // to start a second pass that reads `pending`. Because the call is
    // single-use, whichever pass loses gets REQUEST_EXPIRED for a payment that
    // actually succeeded. Re-read before believing a failure.
    const settled = await reloadIfPaid(order);
    if (settled) return succeeded(request, settled, settled.txnReference);

    await recordOutcome(order, "failed", result.code, result.message);
    return failed(request, "gateway", order.reference);
  }

  if (!result.approved) {
    // 'PT' (PAGE TIMEOUT) is what the gateway reports when the shopper left the
    // hosted page without paying — an abandonment, not a decline, so it is not
    // flagged in the dashboard as a failed card.
    const abandoned = result.responseCode === "PT";
    await recordOutcome(
      order,
      abandoned ? "cancelled" : "failed",
      result.responseCode,
      result.responseText,
    );
    return failed(request, abandoned ? "expired" : "declined", order.reference);
  }

  // Approved — but only for the right money, and this check fails CLOSED. An
  // absent or reshaped amount is treated as a mismatch rather than waved
  // through, so the guard cannot be silently disabled by the gateway changing
  // its response. Currency is compared against what we asked to be charged at
  // PAYMENT_INIT, not live config, so a config change mid-flight cannot move
  // the goalposts.
  const expectedMinor = toMinorUnits(order.expectedAmount);
  const expectedCurrency = order.expectedCurrency ?? config.currency;
  if (result.paymentAmountMinor !== expectedMinor || result.currency !== expectedCurrency) {
    await recordOutcome(
      order,
      "failed",
      "AMOUNT_MISMATCH",
      `Expected ${expectedMinor} ${expectedCurrency}, gateway settled ${result.paymentAmountMinor} ${result.currency}`,
    );
    return failed(request, "mismatch", order.reference);
  }

  await recordSuccess(order, result);
  return succeeded(request, order, result.txnReference);
}

/**
 * Re-reads the order to see whether a concurrent return already settled it.
 * Returns the settled order, or null if it is still unpaid.
 */
async function reloadIfPaid(order: PendingOrder): Promise<PendingOrder | null> {
  const sb = getSupabaseAdmin();
  if (!sb || !order.id) return null;
  const { data, error } = await sb
    .from("orders")
    .select("payment_status, payment_txn_reference")
    .eq("id", order.id)
    .maybeSingle();
  if (error || !data || data.payment_status !== "paid") return null;
  return {
    ...order,
    alreadyPaid: true,
    txnReference: (data.payment_txn_reference as string | null) ?? null,
  };
}

/**
 * Resolves the order this reqid belongs to. With Supabase configured that is a
 * lookup on the reqid we stored at PAYMENT_INIT; in demo mode it is the signed
 * cookie set at the same moment.
 */
async function findPendingOrder(request: NextRequest, reqid: string): Promise<PendingOrder | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from("orders")
      .select(
        "id, reference, total, payment_status, payment_amount, payment_currency, payment_txn_reference",
      )
      .eq("payment_reqid", reqid)
      .maybeSingle();
    if (error || !data) return null;

    const config = getPaycorpConfig();
    // PostgREST hands numeric(12,2) back as a string.
    const total = Number(data.total);
    const stored = Number(data.payment_amount);
    return {
      id: data.id as string,
      reference: data.reference as string,
      total,
      expectedAmount:
        Number.isFinite(stored) && stored > 0
          ? stored
          : config
            ? toGatewayAmount(total, config)
            : total,
      expectedCurrency: (data.payment_currency as string | null) ?? null,
      alreadyPaid: data.payment_status === "paid",
      txnReference: (data.payment_txn_reference as string | null) ?? null,
    };
  }

  const pending = readPendingPayment(request.cookies.get(PENDING_PAYMENT_COOKIE)?.value);
  if (!pending || pending.reqid !== reqid) return null;
  const config = getPaycorpConfig();
  return {
    id: null,
    reference: pending.reference,
    total: pending.total,
    expectedAmount: config ? toGatewayAmount(pending.total, config) : pending.total,
    expectedCurrency: config?.currency ?? null,
    alreadyPaid: false,
    txnReference: null,
  };
}

/**
 * The one write that records "this card was charged". Its failure is the most
 * expensive in the flow — the money is already gone — so the error is never
 * discarded: it retries once, then leaves a server-log trail. Deliberately NOT
 * gated on the current payment_status, so it can still correct a row a losing
 * concurrent pass had marked failed.
 */
async function recordSuccess(order: PendingOrder, result: PaycorpCompleteSuccess) {
  const sb = getSupabaseAdmin();
  if (!sb || !order.id) return;

  const patch = {
    payment_status: "paid",
    // Paid orders leave the pending queue — there is nothing left to chase.
    status: "confirmed",
    payment_txn_reference: result.txnReference,
    payment_auth_code: result.authCode,
    payment_card_type: result.cardType,
    payment_card_masked: result.cardMasked,
    payment_response_code: result.responseCode,
    payment_response_text: result.responseText,
    paid_at: new Date().toISOString(),
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    const { error } = await sb.from("orders").update(patch).eq("id", order.id);
    if (!error) return;
    if (attempt === 1) {
      // Nothing here is cardholder data — an order reference and the gateway's
      // own transaction id, which is exactly what reconciling this by hand
      // needs. Silence would leave a charged card with no trace at all.
      console.error(
        `[paycorp] PAID BUT NOT RECORDED order=${order.reference} txn=${result.txnReference}: ${error.message}`,
      );
    }
  }
}

async function recordOutcome(
  order: PendingOrder,
  status: "failed" | "cancelled",
  code: string,
  text: string,
) {
  const sb = getSupabaseAdmin();
  if (!sb || !order.id) return;
  await sb
    .from("orders")
    .update({
      payment_status: status,
      payment_response_code: code,
      payment_response_text: text.slice(0, 500),
    })
    .eq("id", order.id)
    // A settled order is never downgraded. Without this, a concurrent return
    // that lost the race — and so got REQUEST_EXPIRED from the single-use
    // PAYMENT_COMPLETE — would overwrite a genuine payment with 'failed'.
    .neq("payment_status", "paid");
}

function succeeded(request: NextRequest, order: PendingOrder, txnReference: string | null) {
  const lines = [
    `Hello ${site.name}! I've just paid for order ${order.reference}.`,
    "",
    `Total: ${formatPrice(order.total)}`,
    ...(txnReference ? [`Payment reference: ${txnReference}`] : []),
  ];
  return redirectTo(request, "/checkout/success", {
    ref: order.reference,
    total: String(order.total),
    pm: "card",
    wa: whatsappLink(lines.join("\n")),
    ...(txnReference ? { txn: txnReference } : {}),
  });
}
