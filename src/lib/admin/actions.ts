"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdmin, signInAdmin } from "@/lib/admin/auth";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from "@/lib/admin/session";
import { adminCountProductsInCategory, adminGetCategory, adminGetSubcategory } from "@/lib/admin/data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { OrderStatus, ProductKind, ProductSize } from "@/lib/types";

// Server actions for the admin dashboard. The proxy already gates /admin
// routes, but actions are network endpoints of their own, so every mutation
// re-checks the session cookie before touching the database.

export type AdminActionResult = { ok: true } | { ok: false; error: string };

/** `email` is handed back so a failed attempt doesn't clear the field. */
export type LoginState = { error: string | null; email?: string };

export type ProductInput = {
  id?: string;
  name: string;
  slug: string;
  category_slug: string;
  short_description: string;
  description: string;
  material: string;
  details: string[];
  care: string[];
  colors: string[];
  images: string[];
  sizes: { name: string; dimensions: string; price: number; compare_at_price: number | null }[];
  badge: string | null;
  featured: boolean;
  in_stock: boolean;
  /** Must belong to `category_slug`; null files the product under no sub-category. */
  subcategory_slug: string | null;
  kind: ProductKind;
};

export type CategoryInput = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sort_order: number;
  show_in_nav: boolean;
  show_on_home: boolean;
};

export type SubcategoryInput = {
  id?: string;
  /** Fixed once created: a sub-category never moves to another collection. */
  category_slug: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sort_order: number;
  show_in_nav: boolean;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PRODUCT_KINDS: ProductKind[] = ["physical", "voucher"];
/** A database without migration 0011 rejects the new columns with one of these. */
const MISSING_COLUMN = ["42703", "PGRST204"];
const NEEDS_0011 =
  "The database needs migration 0011 (sub-categories and vouchers) before products can be saved. Run it in the Supabase SQL editor, then try again.";
const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const EXPIRED = "Your session has expired — sign in again.";
const UNCONFIGURED = "Supabase is not configured yet.";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// next/image throws a hard render-time error for any host not whitelisted in
// next.config.ts, and there is no error boundary — so a single product/collection
// saved with an off-host image URL would 500 the storefront AND the admin list.
// Keep persisted data in lockstep with what next/image can actually render by
// rejecting disallowed hosts here. Mirror next.config.ts remotePatterns exactly.
const IMAGE_HOST_HELP =
  "Images must be a site path (/images/…), an Unsplash URL (images.unsplash.com), or a file in your Supabase Storage bucket.";

function isAllowedImageUrl(url: string): boolean {
  // Site-local assets — the Enivrant catalog photography ships in /public/images
  // and next/image serves those without any host allowlist. Reject protocol-
  // relative ("//evil.com") and traversal ("/images/../..") forms.
  if (url.startsWith("/")) {
    return (
      !url.startsWith("//") &&
      !url.includes("..") &&
      (url.startsWith("/images/") || url.startsWith("/brand/"))
    );
  }
  let host: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    host = parsed.hostname;
  } catch {
    return false;
  }
  return host === "images.unsplash.com" || host === "supabase.co" || host.endsWith(".supabase.co");
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export async function adminLogin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const result = await signInAdmin(email, password);
  if (!result.ok) return { error: result.error, email };

  const token = await createAdminSessionToken(result.userId);
  if (!token) return { error: "Supabase isn't connected on this server yet.", email };
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  // Only follow same-dashboard destinations; anything else goes home.
  const from = String(formData.get("from") ?? "");
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function adminLogout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function saveProduct(input: ProductInput): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Give the product a name." };

  const slug = input.slug.trim() || slugify(name);
  if (!SLUG_RE.test(slug)) {
    return { ok: false, error: "Slug can only contain lowercase letters, numbers and hyphens." };
  }

  const category_slug = input.category_slug.trim();
  if (!category_slug) return { ok: false, error: "Choose a collection for this product." };

  if (!PRODUCT_KINDS.includes(input.kind)) {
    return { ok: false, error: "Choose whether this is a physical piece or a spa voucher." };
  }

  // A product can only sit in a sub-category of its own collection — the shop
  // would never list it anywhere else.
  const subcategory_slug = input.subcategory_slug?.trim() || null;
  if (subcategory_slug) {
    const { data: sub, error: subError } = await sb
      .from("subcategories")
      .select("category_slug")
      .eq("slug", subcategory_slug)
      .maybeSingle();
    if (subError) return { ok: false, error: NEEDS_0011 };
    if (!sub) return { ok: false, error: "That sub-category doesn't exist anymore — pick another." };
    if (sub.category_slug !== category_slug) {
      return { ok: false, error: "That sub-category belongs to a different collection — pick one from this collection." };
    }
  }

  const images = input.images.map((url) => url.trim()).filter(Boolean);
  if (images.length === 0) return { ok: false, error: "Add at least one photo." };
  if (images.some((url) => !isAllowedImageUrl(url))) {
    return { ok: false, error: IMAGE_HOST_HELP };
  }

  const sizes: ProductSize[] = [];
  for (const raw of input.sizes) {
    const sizeName = raw.name.trim();
    if (!sizeName) return { ok: false, error: "Every size needs a name." };
    const price = Math.round(Number(raw.price));
    if (!Number.isFinite(price) || price <= 0) {
      return { ok: false, error: "Every size needs a whole-dollar price above zero." };
    }
    const compare_at_price = raw.compare_at_price == null ? null : Math.round(Number(raw.compare_at_price));
    if (compare_at_price !== null && (!Number.isFinite(compare_at_price) || compare_at_price <= price)) {
      return { ok: false, error: "Compare-at price must be higher than the price." };
    }
    sizes.push({ name: sizeName, dimensions: raw.dimensions.trim(), price, compare_at_price });
  }
  if (sizes.length === 0) return { ok: false, error: "Add at least one size with a price." };

  const row = {
    slug,
    name,
    category_slug,
    short_description: input.short_description.trim(),
    description: input.description.trim(),
    material: input.material.trim(),
    details: input.details.map((line) => line.trim()).filter(Boolean),
    care: input.care.map((line) => line.trim()).filter(Boolean),
    colors: input.colors.map((color) => color.trim()).filter(Boolean),
    images,
    sizes,
    badge: input.badge?.trim() || null,
    featured: Boolean(input.featured),
    in_stock: Boolean(input.in_stock),
    subcategory_slug,
    kind: input.kind,
  };

  const { error } = input.id
    ? await sb.from("products").update(row).eq("id", input.id)
    : await sb.from("products").insert(row);
  if (error) {
    if (MISSING_COLUMN.includes(error.code)) return { ok: false, error: NEEDS_0011 };
    if (error.code === "23505") return { ok: false, error: "That slug is already in use." };
    if (error.code === "23503") {
      return { ok: false, error: "That collection doesn't exist anymore — pick a different one." };
    }
    return { ok: false, error: "The product couldn't be saved. Please try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: "The product couldn't be deleted. Please try again." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Image upload
// ---------------------------------------------------------------------------

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const IMAGE_BUCKET = "product-images";

// Uploads a product/collection photo to the Supabase Storage bucket provisioned
// in migration 0003, and returns its public URL (a *.supabase.co/storage URL,
// which is allow-listed in next.config.ts and by isAllowedImageUrl). This is
// the only way the dashboard adds a photo, so everything added there lives in
// the bucket — under products/ or collections/, by what it was uploaded for.
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image file to upload." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Images must be JPEG, PNG, WebP, AVIF or GIF." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Images must be 5 MB or smaller." };
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const asked = String(formData.get("folder") ?? "");
  const folder = ["collections", "subcategories"].includes(asked) ? asked : "products";
  const path = `${folder}/${randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return {
      ok: false,
      error: "The image couldn't be uploaded. Make sure the 'product-images' bucket exists (migration 0003).",
    };
  }
  const { data } = sb.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    return { ok: false, error: "The image uploaded but no public URL was returned." };
  }
  return { ok: true, url: data.publicUrl };
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function saveCategory(input: CategoryInput): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Give the collection a name." };

  const slug = input.slug.trim() || slugify(name);
  if (!SLUG_RE.test(slug)) {
    return { ok: false, error: "Slug can only contain lowercase letters, numbers and hyphens." };
  }

  const image = input.image.trim();
  if (!image) {
    return { ok: false, error: "Add a photo — it's shown in the homepage's collection grid and the shop's tiles." };
  }
  if (!isAllowedImageUrl(image)) {
    return { ok: false, error: IMAGE_HOST_HELP };
  }

  const sortOrder = Math.round(Number(input.sort_order));

  const row = {
    slug,
    name,
    description: input.description.trim(),
    image,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    show_in_nav: Boolean(input.show_in_nav),
    show_on_home: Boolean(input.show_on_home),
  };

  const { error } = input.id
    ? await sb.from("categories").update(row).eq("id", input.id)
    : await sb.from("categories").insert(row);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "That slug is already in use." };
    // 23503: products still reference the old slug (FK has no ON UPDATE CASCADE
    // until migration 0003 is applied). Give a clear reason instead of a generic
    // "please try again".
    if (error.code === "23503") {
      return {
        ok: false,
        error: "Move this collection's products to another collection before renaming its slug.",
      };
    }
    return { ok: false, error: "The collection couldn't be saved. Please try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/collections");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  const category = await adminGetCategory(id);
  if (!category) return { ok: false, error: "This collection no longer exists." };

  // Deleting a non-empty collection would take its products with it via the
  // category_slug FK — refuse instead. If the count can't be verified, refuse
  // too rather than risk a cascade delete on a bad read.
  const count = await adminCountProductsInCategory(category.slug);
  if (count === null) {
    return { ok: false, error: "Couldn't check this collection's products just now. Please try again." };
  }
  if (count > 0) {
    return {
      ok: false,
      error: `This collection still has ${count} product${count === 1 ? "" : "s"} — move them to another collection first.`,
    };
  }

  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: "The collection couldn't be deleted. Please try again." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/collections");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Sub-categories
// ---------------------------------------------------------------------------

export async function saveSubcategory(input: SubcategoryInput): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Give the sub-category a name." };

  const slug = input.slug.trim() || slugify(name);
  if (!SLUG_RE.test(slug)) {
    return { ok: false, error: "Slug can only contain lowercase letters, numbers and hyphens." };
  }

  const image = input.image.trim();
  if (image && !isAllowedImageUrl(image)) return { ok: false, error: IMAGE_HOST_HELP };

  const sortOrder = Math.round(Number(input.sort_order));
  const row = {
    slug,
    name,
    description: input.description.trim(),
    image,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    show_in_nav: Boolean(input.show_in_nav),
  };

  let error;
  if (input.id) {
    // The collection is fixed once created, so it is not part of an update.
    const existing = await adminGetSubcategory(input.id);
    if (!existing) return { ok: false, error: "This sub-category no longer exists." };
    ({ error } = await sb.from("subcategories").update(row).eq("id", input.id));
  } else {
    const category_slug = input.category_slug.trim();
    if (!category_slug) return { ok: false, error: "Choose the collection this sub-category belongs to." };
    ({ error } = await sb.from("subcategories").insert({ ...row, category_slug }));
  }
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "That slug is already in use — sub-category slugs are shared across every collection.",
      };
    }
    if (error.code === "23503") return { ok: false, error: "That collection doesn't exist anymore." };
    if (error.code === "42P01" || error.code === "PGRST205") return { ok: false, error: NEEDS_0011 };
    return { ok: false, error: "The sub-category couldn't be saved. Please try again." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/collections", "layout");
  return { ok: true };
}

/** Deletes a sub-category. Its products stay in the collection, filed under no sub-category. */
export async function deleteSubcategory(id: string): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  const { error } = await sb.from("subcategories").delete().eq("id", id);
  if (error) return { ok: false, error: "The sub-category couldn't be deleted. Please try again." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/collections", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Vouchers
// ---------------------------------------------------------------------------

export type VoucherChange = "issue" | "redeem" | "unredeem" | "void";

/**
 * Moves a voucher along: issue (pending → issued, when it was paid some other
 * way), redeem (issued → redeemed, when the spa has honoured it), unredeem
 * (undo a redeem made by mistake) and void (pending or issued → void, for a
 * refund or a cancelled order). A void voucher stays void.
 */
export async function changeVoucher(
  code: string,
  change: VoucherChange,
  note = ""
): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  const now = new Date().toISOString();
  const moves: Record<VoucherChange, { from: string[]; patch: Record<string, unknown> }> = {
    issue: { from: ["pending"], patch: { status: "issued", issued_at: now } },
    redeem: {
      from: ["issued"],
      patch: { status: "redeemed", redeemed_at: now, redeemed_note: note.trim().slice(0, 300) },
    },
    unredeem: { from: ["redeemed"], patch: { status: "issued", redeemed_at: null, redeemed_note: "" } },
    void: { from: ["pending", "issued"], patch: { status: "void" } },
  };
  const move = moves[change];
  if (!move) return { ok: false, error: "That isn't something a voucher can do." };

  const { data, error } = await sb
    .from("vouchers")
    .update(move.patch)
    .eq("code", code)
    .in("status", move.from)
    .select("order_id")
    .maybeSingle();
  if (error) return { ok: false, error: "The voucher couldn't be updated. Please try again." };
  if (!data) {
    return { ok: false, error: "This voucher has changed since the page loaded — refresh and try again." };
  }

  revalidatePath("/admin/vouchers");
  revalidatePath(`/admin/orders/${data.order_id}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "That isn't a valid order status." };
  }

  const { data: order, error } = await sb
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("payment_method, payment_status")
    .maybeSingle();
  if (error || !order) return { ok: false, error: "The status couldn't be updated. Please try again." };

  // Vouchers follow the money. Confirming a bank-transfer order is how the
  // dashboard records that the transfer arrived, so it issues the codes; a
  // card order's codes are issued by the payment itself and never by hand
  // unless it really was paid. Cancelling voids codes not yet issued — an
  // issued code is voided on its own, from the vouchers page.
  const paid = order.payment_method !== "card" || order.payment_status === "paid";
  if (["confirmed", "shipped", "delivered"].includes(status) && paid) {
    await sb
      .from("vouchers")
      .update({ status: "issued", issued_at: new Date().toISOString() })
      .eq("order_id", id)
      .eq("status", "pending");
  } else if (status === "cancelled") {
    await sb.from("vouchers").update({ status: "void" }).eq("order_id", id).eq("status", "pending");
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/vouchers");
  return { ok: true };
}
