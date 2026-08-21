"use server";

import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "./supabase-admin";
import { getProduct } from "./catalog";
import { paymentMethodLabel, site } from "./site";
import type { InquiryInput, OrderInput, PaymentMethod, ProductSize } from "./types";

function orderReference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `EN-${stamp}${rand}`;
}

export type PlaceOrderResult =
  | { ok: true; reference: string; total: number; whatsappUrl: string; paymentMethod: PaymentMethod }
  | { ok: false; error: string };

const PAYMENT_METHODS: PaymentMethod[] = ["cod", "bank_transfer"];

type PricedProduct = { slug: string; name: string; in_stock: boolean; sizes: ProductSize[] };

export async function placeOrder(input: OrderInput): Promise<PlaceOrderResult> {
  if (!input.customerName.trim() || !input.phone.trim()) {
    return { ok: false, error: "Please provide your name and phone number." };
  }
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!input.address.trim() || !input.city.trim()) {
    return { ok: false, error: "Please provide your delivery address and city." };
  }
  if (!PAYMENT_METHODS.includes(input.paymentMethod)) {
    return { ok: false, error: "Please choose a payment method." };
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
    product_slug: string;
    product_name: string;
    size_name: string;
    unit_price: number;
    quantity: number;
  }[] = [];

  for (const item of input.items) {
    let product: PricedProduct | null;
    if (sb) {
      const { data, error } = await sb
        .from("products")
        .select("slug, name, in_stock, sizes")
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
    const quantity = Math.max(1, Math.min(50, Math.round(item.quantity)));
    lines.push({
      product_slug: product.slug,
      product_name: product.name,
      size_name: size.name,
      unit_price: size.price,
      quantity,
    });
  }

  const total = lines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
  const reference = orderReference();

  if (sb) {
    // The id is generated here so the order and its line items can be inserted
    // and, if the second write fails, the orphaned order rolled back — without
    // needing a SELECT round-trip.
    const orderId = randomUUID();
    const { error } = await sb.from("orders").insert({
      id: orderId,
      reference,
      customer_name: input.customerName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      city: input.city,
      notes: input.notes,
      total,
      status: "pending",
      payment_method: input.paymentMethod,
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
  }

  const summary = lines
    .map((l) => `• ${l.product_name} (${l.size_name}) × ${l.quantity}`)
    .join("\n");
  const message = `Hello ${site.name}! I just placed order ${reference}.\n\n${summary}\n\nTotal: Rs ${total.toLocaleString("en-US")}\nPayment: ${paymentMethodLabel(input.paymentMethod)}\nName: ${input.customerName}\nDelivery: ${input.address}, ${input.city}`;
  const whatsappUrl = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return { ok: true, reference, total, whatsappUrl, paymentMethod: input.paymentMethod };
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
