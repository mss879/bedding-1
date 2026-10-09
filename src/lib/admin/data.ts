import { requireAdmin } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  Category,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Subcategory,
  Voucher,
  VoucherStatus,
} from "@/lib/types";

// Admin reads go through the service-role client (server-only, bypasses RLS),
// so each one first confirms the request belongs to a signed-in admin — the
// dashboard layout checks too, but a layout is not re-rendered when navigating
// between its pages, and these reads are what actually hand out the data.
//
// Every function returns null when Supabase isn't configured, and pages render
// a SetupNotice for it. That is a safeguard only: nobody can sign in without
// Supabase, so an admin never actually sees it. None of them throws on a bad
// query — a failed query on a configured database degrades to an empty result
// instead of a crash.
//
// PostgREST returns numeric(12,2) columns as strings, so order totals and
// unit prices are coerced with Number(...) here, once, at the boundary.

/** The service-role client, for a verified admin only. */
async function adminDb() {
  await requireAdmin();
  return getSupabaseAdmin();
}

export async function adminListProducts(): Promise<Product[] | null> {
  const sb = await adminDb();
  if (!sb) return null;
  const { data, error } = await sb
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Product[];
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const sb = await adminDb();
  if (!sb) return null;
  const { data, error } = await sb.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Product;
}

export async function adminListCategories(): Promise<Category[] | null> {
  const sb = await adminDb();
  if (!sb) return null;
  const { data, error } = await sb.from("categories").select("*").order("sort_order");
  if (error || !data) return [];
  return data as Category[];
}

export async function adminGetCategory(id: string): Promise<Category | null> {
  const sb = await adminDb();
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
  const sb = await adminDb();
  if (!sb) return null;
  const { count, error } = await sb
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_slug", slug);
  if (error) return null;
  return count ?? 0;
}

/**
 * Sub-categories, in merchandising order — all of them, or one collection's.
 * Returns [] on a database that predates migration 0011, where the table does
 * not exist yet.
 */
export async function adminListSubcategories(categorySlug?: string): Promise<Subcategory[] | null> {
  const sb = await adminDb();
  if (!sb) return null;
  let query = sb.from("subcategories").select("*").order("sort_order");
  if (categorySlug) query = query.eq("category_slug", categorySlug);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Subcategory[];
}

export async function adminGetSubcategory(id: string): Promise<Subcategory | null> {
  const sb = await adminDb();
  if (!sb) return null;
  const { data, error } = await sb.from("subcategories").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Subcategory;
}

/** Product counts per sub-category slug, in one query. Null when it can't be read. */
export async function adminCountProductsBySubcategory(): Promise<Map<string, number> | null> {
  const sb = await adminDb();
  if (!sb) return null;
  const { data, error } = await sb.from("products").select("subcategory_slug");
  if (error || !data) return null;
  const counts = new Map<string, number>();
  for (const row of data as { subcategory_slug: string | null }[]) {
    if (row.subcategory_slug) counts.set(row.subcategory_slug, (counts.get(row.subcategory_slug) ?? 0) + 1);
  }
  return counts;
}

export async function adminListOrders(status?: OrderStatus): Promise<Order[] | null> {
  const sb = await adminDb();
  if (!sb) return null;
  let query = sb.from("orders").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => ({ ...row, total: Number(row.total) }) as Order);
}

export async function adminGetOrder(
  id: string
): Promise<{ order: Order; items: OrderItem[]; vouchers: Voucher[] } | null> {
  const sb = await adminDb();
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
  // A database without migration 0011 has no vouchers table: no vouchers.
  const { data: voucherRows, error: vouchersError } = await sb
    .from("vouchers")
    .select("*")
    .eq("order_id", id)
    .order("created_at");
  const vouchers = (vouchersError || !voucherRows ? [] : voucherRows).map(toVoucher);
  return { order, items, vouchers };
}

function toVoucher(row: Record<string, unknown>): Voucher {
  return { ...(row as Voucher), value: Number(row.value), paid: Number(row.paid) };
}

export type AdminVoucherRow = Voucher & {
  order: Pick<Order, "id" | "reference" | "customer_name" | "phone" | "payment_method"> | null;
};

/**
 * Every voucher, newest first, with the order it came from — optionally one
 * status, or the voucher whose code contains `code` (case-insensitive).
 */
export async function adminListVouchers(
  status?: VoucherStatus,
  code?: string
): Promise<AdminVoucherRow[] | null> {
  const sb = await adminDb();
  if (!sb) return null;
  let query = sb
    .from("vouchers")
    .select("*, order:orders(id, reference, customer_name, phone, payment_method)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (status) query = query.eq("status", status);
  const needle = code?.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  if (needle) query = query.ilike("code", `%${needle}%`);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((row) => ({ ...toVoucher(row), order: (row.order as AdminVoucherRow["order"]) ?? null }));
}

export async function adminCounts(): Promise<{
  products: number;
  categories: number;
  orders: number;
  pendingOrders: number;
  liveVouchers: number;
} | null> {
  const sb = await adminDb();
  if (!sb) return null;
  const [products, categories, orders, pendingOrders, liveVouchers] = await Promise.all([
    sb.from("products").select("*", { count: "exact", head: true }),
    sb.from("categories").select("*", { count: "exact", head: true }),
    sb.from("orders").select("*", { count: "exact", head: true }),
    sb.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    sb.from("vouchers").select("*", { count: "exact", head: true }).eq("status", "issued"),
  ]);
  return {
    products: products.count ?? 0,
    categories: categories.count ?? 0,
    orders: orders.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    liveVouchers: liveVouchers.count ?? 0,
  };
}
