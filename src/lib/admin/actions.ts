"use server";

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
  if (images.some((url) => !url.startsWith("https://"))) {
    return { ok: false, error: "Image URLs must start with https://." };
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
  if (image && !image.startsWith("https://")) {
    return { ok: false, error: "Image URL must start with https://." };
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

  // The category_slug FK cascades, so deleting a non-empty collection would
  // silently take its products with it — refuse instead.
  const count = await adminCountProductsInCategory(category.slug);
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
