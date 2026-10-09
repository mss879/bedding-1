"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "./supabase-admin";
import { getProduct } from "./catalog";
import { formatPrice, paymentMethodLabel, site } from "./site";
import { paymentInit } from "./paycorp/client";
import { getPaycorpConfig, toGatewayAmount } from "./paycorp/config";
import { generateVoucherCode } from "./vouchers";
import {
  PENDING_PAYMENT_COOKIE,
  PENDING_PAYMENT_MAX_AGE,
  pendingPaymentCookie,
} from "./paycorp/pending";
import type { InquiryInput, OrderInput, PaymentMethod, ProductKind, ProductSize } from "./types";

function orderReference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `EN-${stamp}${rand}`;
}

export type PlaceOrderResult =
  | {
      ok: true;
      reference: string;
      total: number;
      whatsappUrl: string;
      paymentMethod: PaymentMethod;
      /** Card orders only: Paycorp's hosted payment page. Send the browser here. */
      redirectUrl?: string;
      /** The order includes spa vouchers, whose codes follow once it is paid. */
      hasVouchers: boolean;
    }
  | {
      ok: false;
      error: string;
      /** The basket holds something to deliver, so an address is needed after all. */
      needsAddress?: boolean;
    };

const PAYMENT_METHODS: PaymentMethod[] = ["cod", "bank_transfer", "card"];

/** Origin every gateway callback URL is built from, without a trailing slash. */
function siteOrigin() {
  return site.url.replace(/\/+$/, "");
}

type PricedProduct = {
  slug: string;
  name: string;
  in_stock: boolean;
  sizes: ProductSize[];
  /** Absent on a database that predates migration 0011: a physical piece. */
  kind?: ProductKind;
};

/** Most of one voucher a single order line may hold — each unit is a code. */
const MAX_VOUCHERS_PER_LINE = 10;

export async function placeOrder(input: OrderInput): Promise<PlaceOrderResult> {
  if (!input.customerName.trim() || !input.phone.trim()) {
    return { ok: false, error: "Please provide your name and phone number." };
  }
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!PAYMENT_METHODS.includes(input.paymentMethod)) {
    return { ok: false, error: "Please choose a payment method." };
  }
  // The payment gateway requires every shopper to accept the terms before
  // paying. Checkout enforces it too, but only this stops an order placed by
  // calling the action directly — and it covers cod and bank transfer as well.
  if (input.acceptedTerms !== true) {
    return { ok: false, error: "Please read and accept the Terms & Conditions to place your order." };
  }
  if (!input.items.length) {
    return { ok: false, error: "Your cart is empty." };
  }

  // All storefront writes go through the service-role client (server-only,
  // bypasses RLS). When it isn't configured yet the whole flow still completes
  // in demo mode — the order isn't persisted but the WhatsApp message carries
  // the full detail so the journey can be shown end-to-end before launch.
  const sb = getSupabaseAdmin();

  // Re-price every line on the SERVER so the client can't tamper with totals.
  // With Supabase configured we price from the live DB and treat a query error
  // as a hard failure (never fall back to stale seed prices); otherwise we use
  // the seed catalog to keep demo mode working.
  const lines: {
    id: string;
    product_slug: string;
    product_name: string;
    size_name: string;
    unit_price: number;
    quantity: number;
  }[] = [];
  // What each line is, beside the row itself: the kind decides delivery and
  // vouchers, and a voucher's value at the spa is its option's compare-at price.
  const lineMeta: { kind: ProductKind; spaValue: number }[] = [];

  for (const item of input.items) {
    let product: PricedProduct | null;
    if (sb) {
      // Every column, not a list: a database still without migration 0011 has
      // no `kind`, and naming it would fail every checkout.
      const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("slug", item.productSlug)
        .maybeSingle();
      if (error) {
        return { ok: false, error: "We couldn't confirm current pricing. Please try again." };
      }
      product = (data as PricedProduct | null) ?? null;
    } else {
      product = await getProduct(item.productSlug);
    }

    const size = product?.sizes.find((s) => s.name === item.sizeName);
    if (!product || !product.in_stock || !size) {
      return { ok: false, error: "One of the items in your cart is unavailable." };
    }
    const kind: ProductKind = product.kind === "voucher" ? "voucher" : "physical";
    const quantity = Math.max(
      1,
      Math.min(kind === "voucher" ? MAX_VOUCHERS_PER_LINE : 50, Math.round(item.quantity))
    );
    lines.push({
      // Generated here so the vouchers below can point at their line without
      // reading it back.
      id: randomUUID(),
      product_slug: product.slug,
      product_name: product.name,
      size_name: size.name,
      unit_price: size.price,
      quantity,
    });
    lineMeta.push({ kind, spaValue: size.compare_at_price ?? size.price });
  }

  // Delivery follows what is in the basket, as priced here rather than as the
  // browser described it: an address only when something is to be delivered,
  // and no cash on delivery for a spa voucher, which has no courier.
  const hasPhysical = lineMeta.some((m) => m.kind === "physical");
  const hasVouchers = lineMeta.some((m) => m.kind === "voucher");
  if (hasPhysical && (!input.address.trim() || !input.city.trim())) {
    return { ok: false, error: "Please provide your delivery address and city.", needsAddress: true };
  }
  if (hasVouchers && input.paymentMethod === "cod") {
    return {
      ok: false,
      error: "Cash on delivery isn't available for spa vouchers. Please pay by card or bank transfer.",
    };
  }

  const total = lines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
  const reference = orderReference();

  // A card order is handed straight to Paycorp below, so it opens as a pending
  // payment; cod and bank transfer have nothing to collect online.
  const isCard = input.paymentMethod === "card";
  // Generated here so the order and its line items can be inserted and, if a
  // later step fails, the orphaned order rolled back — without a SELECT
  // round-trip.
  const orderId = randomUUID();

  if (sb) {
    const { error } = await sb.from("orders").insert({
      id: orderId,
      reference,
      customer_name: input.customerName,
      email: input.email,
      phone: input.phone,
      address: hasPhysical ? input.address : "",
      city: hasPhysical ? input.city : "",
      notes: input.notes,
      total,
      status: "pending",
      payment_method: input.paymentMethod,
      // Only card orders touch the columns migration 0006 adds, so a database
      // still on 0005 keeps taking cod and bank-transfer orders.
      ...(isCard ? { payment_status: "pending" } : {}),
    });
    if (error) {
      return { ok: false, error: "We couldn't save your order. Please try again." };
    }
    const { error: itemsError } = await sb
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: orderId })));
    if (itemsError) {
      // Compensating delete: a partial write must not leave an order with a
      // total but no line items in the admin dashboard.
      await sb.from("orders").delete().eq("id", orderId);
      return { ok: false, error: "We couldn't save your order. Please try again." };
    }

    if (hasVouchers) {
      const saved = await saveVoucherCodes(sb, orderId, lines, lineMeta);
      if (!saved) {
        // Line items and anything else cascade with the order.
        await sb.from("orders").delete().eq("id", orderId);
        return { ok: false, error: "We couldn't save your order. Please try again." };
      }
    }
  }

  const summary = lines
    .map(
      (l, i) =>
        `• ${l.product_name} (${l.size_name}) × ${l.quantity}${lineMeta[i].kind === "voucher" ? " — spa voucher" : ""}`
    )
    .join("\n");
  const message = `Hello ${site.name}! I just placed order ${reference}.\n\n${summary}\n\nTotal: ${formatPrice(total)}\nPayment: ${paymentMethodLabel(input.paymentMethod)}\nName: ${input.customerName}${
    hasPhysical ? `\nDelivery: ${input.address}, ${input.city}` : "\nNo delivery — spa vouchers only"
  }`;
  const whatsappUrl = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

  if (isCard) {
    const gateway = await startCardPayment({
      orderId: sb ? orderId : null,
      reference,
      total,
    });
    if (!gateway.ok) {
      // Nothing was collected and nothing can be, so the order must not sit in
      // the dashboard looking real. Line items cascade with the delete.
      if (sb) await sb.from("orders").delete().eq("id", orderId);
      return { ok: false, error: gateway.error };
    }
    return {
      ok: true,
      reference,
      total,
      whatsappUrl,
      paymentMethod: "card",
      redirectUrl: gateway.paymentPageUrl,
      hasVouchers,
    };
  }

  return { ok: true, reference, total, whatsappUrl, paymentMethod: input.paymentMethod, hasVouchers };
}

/**
 * One code per voucher bought, written as `pending`: a code is only honoured
 * once the payment behind it has arrived (see lib/vouchers.ts). Two orders
 * drawing the same code is vanishingly unlikely, but the code is the key, so
 * a clash is retried with fresh codes rather than failing the order.
 */
async function saveVoucherCodes(
  sb: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  orderId: string,
  lines: { id: string; product_slug: string; product_name: string; size_name: string; unit_price: number; quantity: number }[],
  meta: { kind: ProductKind; spaValue: number }[]
): Promise<boolean> {
  const build = () =>
    lines.flatMap((line, i) =>
      meta[i].kind !== "voucher"
        ? []
        : Array.from({ length: line.quantity }, () => ({
            code: generateVoucherCode(),
            order_id: orderId,
            order_item_id: line.id,
            product_slug: line.product_slug,
            product_name: line.product_name,
            size_name: line.size_name,
            value: meta[i].spaValue,
            paid: line.unit_price,
            status: "pending",
          }))
    );

  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await sb.from("vouchers").insert(build());
    if (!error) return true;
    if (error.code !== "23505") {
      console.error(`[vouchers] could not save the codes for order ${orderId}: ${error.message}`);
      return false;
    }
  }
  return false;
}

/**
 * Opens a Paycorp session for an order and records the `reqid` that the return
 * leg will match it back by. Money is never moved here — this only reserves the
 * hosted payment page the shopper is about to be sent to.
 */
async function startCardPayment(order: {
  orderId: string | null;
  reference: string;
  total: number;
}): Promise<{ ok: true; paymentPageUrl: string } | { ok: false; error: string }> {
  const config = getPaycorpConfig();
  if (!config) {
    return {
      ok: false,
      error: "Card payment is unavailable right now. Please choose another payment method.",
    };
  }

  // Catalogue and merchant profile are both USD, so this is currently an
  // identity. It is still stored alongside the order, so that if a profile in
  // another currency is ever added the settled figure stays reconcilable.
  const amount = toGatewayAmount(order.total, config);
  const origin = siteOrigin();

  const init = await paymentInit({
    amount,
    currency: config.currency,
    // Paycorp appends ?reqid=… to this URL, and that reqid is the only thing
    // identifying the order on the way back — no amount, reference or status
    // travels through the browser, so there is nothing for a shopper to edit.
    returnUrl: `${origin}/api/payments/paycorp/return`,
    cancelUrl: `${origin}/checkout/payment-failed?reason=cancelled`,
    clientRef: order.reference,
    comment: `${site.name} order ${order.reference}`,
  });
  if (!init.ok) {
    return {
      ok: false,
      error: "We couldn't start the card payment. Please try again, or choose another payment method.",
    };
  }

  const sb = getSupabaseAdmin();
  if (sb && order.orderId) {
    const { error } = await sb
      .from("orders")
      .update({
        payment_reqid: init.reqid,
        payment_status: "pending",
        payment_currency: config.currency,
        payment_amount: amount,
      })
      .eq("id", order.orderId);
    if (error) {
      // Without the reqid stored the return leg could not match the payment to
      // this order, so fail now rather than take money we cannot reconcile.
      return { ok: false, error: "We couldn't start the card payment. Please try again." };
    }
  } else {
    // Demo mode: no row to write the reqid to, so it rides back in a signed
    // cookie instead. See lib/paycorp/pending.ts.
    const value = pendingPaymentCookie({
      reqid: init.reqid,
      reference: order.reference,
      total: order.total,
    });
    if (value) {
      const store = await cookies();
      store.set(PENDING_PAYMENT_COOKIE, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // The shopper returns from paycorp.lk by top-level navigation, which
        // 'lax' allows and 'strict' would drop.
        sameSite: "lax",
        path: "/",
        maxAge: PENDING_PAYMENT_MAX_AGE,
      });
    }
  }

  return { ok: true, paymentPageUrl: init.paymentPageUrl };
}

export type InquiryResult = { ok: true } | { ok: false; error: string };

export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  if (!input.name.trim() || !input.message.trim()) {
    return { ok: false, error: "Please fill in your name and message." };
  }
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from("inquiries").insert({
      type: input.type,
      name: input.name,
      email: input.email,
      phone: input.phone,
      business_type: input.businessType ?? null,
      quantity: input.quantity ?? null,
      sizes: input.sizes ?? null,
      materials: input.materials ?? null,
      budget: input.budget ?? null,
      delivery: input.delivery ?? null,
      message: input.message,
    });
    if (error) {
      return { ok: false, error: "We couldn't send your inquiry. Please try again." };
    }
  }
  return { ok: true };
}

export async function subscribeNewsletter(email: string): Promise<InquiryResult> {
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from("newsletter_subscribers").insert({ email });
    // 23505 = duplicate subscription; treat as success.
    if (error && error.code !== "23505") {
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  }
  return { ok: true };
}
