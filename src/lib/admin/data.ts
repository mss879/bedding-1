import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Category, Order, OrderItem, OrderStatus, Product } from "@/lib/types";

// Admin reads go through the service-role client (server-only, bypasses RLS).
// Every function returns null when Supabase isn't configured yet — pages
// render a SetupNotice in that case — and never throws: a failed query on a
// configured database degrades to an empty result instead of a crash.
//
// PostgREST returns numeric(12,2) columns as strings, so order totals and
// unit prices are coerced with Number(...) here, once, at the boundary.

export async function adminListProducts(): Promise<Product[] | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Product[];
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Product;
}

export async function adminListCategories(): Promise<Category[] | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.from("categories").select("*").order("sort_order");
  if (error || !data) return [];
  return data as Category[];
}

export async function adminGetCategory(id: string): Promise<Category | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.from("categories").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Category;
}

// Returns null when the count can't be determined (unconfigured or query
// error). Callers that gate a destructive action on this MUST treat null as
// "unknown — refuse", never as zero: the category_slug FK cascades, so a
// mistaken 0 could let a delete wipe a non-empty collection's products.
export async function adminCountProductsInCategory(slug: string): Promise<number | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { count, error } = await sb
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_slug", slug);
  if (error) return null;
  return count ?? 0;
}

export async function adminListOrders(status?: OrderStatus): Promise<Order[] | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  let query = sb.from("orders").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => ({ ...row, total: Number(row.total) }) as Order);
}

export async function adminGetOrder(
  id: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  const order = { ...data, total: Number(data.total) } as Order;
  const { data: itemRows, error: itemsError } = await sb
    .from("order_items")
    .select("*")
    .eq("order_id", id);
  const items = (itemsError || !itemRows ? [] : itemRows).map(
    (row) => ({ ...row, unit_price: Number(row.unit_price) }) as OrderItem
  );
  return { order, items };
}

export async function adminCounts(): Promise<{
  products: number;
  categories: number;
  orders: number;
  pendingOrders: number;
} | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const [products, categories, orders, pendingOrders] = await Promise.all([
    sb.from("products").select("*", { count: "exact", head: true }),
    sb.from("categories").select("*", { count: "exact", head: true }),
    sb.from("orders").select("*", { count: "exact", head: true }),
    sb.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return {
    products: products.count ?? 0,
    categories: categories.count ?? 0,
    orders: orders.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
  };
}
