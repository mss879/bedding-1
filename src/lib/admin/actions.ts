"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import {
  ADMIN_COOKIE,
  adminConfigured,
  adminSessionToken,
  isCorrectAdminPassword,
} from "@/lib/admin/session";
import { adminCountProductsInCategory, adminGetCategory } from "@/lib/admin/data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { OrderStatus, ProductSize } from "@/lib/types";

// Server actions for the admin dashboard. The proxy already gates /admin
// routes, but actions are network endpoints of their own, so every mutation
// re-checks the session cookie before touching the database.

export type AdminActionResult = { ok: true } | { ok: false; error: string };

export type LoginState = { error: string | null };

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

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
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
  "Images must be hosted on Unsplash (images.unsplash.com) or your Supabase Storage bucket.";

function isAllowedImageUrl(url: string): boolean {
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
  if (!adminConfigured()) {
    return { error: "ADMIN_PASSWORD is not set on the server." };
  }
  const password = String(formData.get("password") ?? "");
  const token = adminSessionToken();
  if (!token || !isCorrectAdminPassword(password)) {
    return { error: "Wrong password." };
  }
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
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

  const images = input.images.map((url) => url.trim()).filter(Boolean);
  if (images.length === 0) return { ok: false, error: "Add at least one image URL." };
  if (images.some((url) => !isAllowedImageUrl(url))) {
    return { ok: false, error: IMAGE_HOST_HELP };
  }

  const sizes: ProductSize[] = [];
  for (const raw of input.sizes) {
    const sizeName = raw.name.trim();
    if (!sizeName) return { ok: false, error: "Every size needs a name." };
    const price = Math.round(Number(raw.price));
    if (!Number.isFinite(price) || price <= 0) {
      return { ok: false, error: "Every size needs a whole-rupee price above zero." };
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
  };

  const { error } = input.id
    ? await sb.from("products").update(row).eq("id", input.id)
    : await sb.from("products").insert(row);
  if (error) {
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
// which is allow-listed in next.config.ts and by isAllowedImageUrl). Lets a
// non-technical owner add a photo without hosting it elsewhere first.
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
  const path = `${randomUUID()}.${ext}`;
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
    return { ok: false, error: "Add an image URL — it's shown on the homepage circles and shop tiles." };
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
// Orders
// ---------------------------------------------------------------------------

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<AdminActionResult> {
  if (!(await isAdmin())) return { ok: false, error: EXPIRED };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: UNCONFIGURED };

  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "That isn't a valid order status." };
  }

  const { error } = await sb.from("orders").update({ status }).eq("id", id);
  if (error) return { ok: false, error: "The status couldn't be updated. Please try again." };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}
