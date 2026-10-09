import { getSupabase } from "./supabase";
import { seedCategories, seedProducts } from "./seed-data";
import { seedSubcategories } from "./seed-subcategories";
import type { Category, Product, Subcategory } from "./types";

// Fallback rules: the seed catalog is used when Supabase env vars are missing
// (the site must demo end-to-end before the client provisions the backend) or
// when a query fails outright. Once the database answers, its data is the
// truth — an empty table means an empty shelf, so products removed in the
// admin dashboard actually disappear from the storefront.

export async function getCategories(): Promise<Category[]> {
  const sb = getSupabase();
  if (!sb) return seedCategories;
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error || !data) return seedCategories;
  return data as Category[];
}

/** Categories shown in the header/footer nav — controlled from the admin dashboard. */
export async function getNavCategories(): Promise<Category[]> {
  return (await getCategories()).filter((c) => c.show_in_nav !== false);
}

/** Categories shown in homepage sections — controlled from the admin dashboard. */
export async function getHomeCategories(): Promise<Category[]> {
  return (await getCategories()).filter((c) => c.show_on_home !== false);
}

/**
 * Every sub-category, in merchandising order. On a database that predates
 * migration 0011 the table is missing, the query errors and the seed list is
 * returned — but the products from that database carry no sub-category, so
 * every one counts as empty and the storefront simply shows none of them.
 */
export async function getSubcategories(): Promise<Subcategory[]> {
  const sb = getSupabase();
  if (!sb) return seedSubcategories;
  const { data, error } = await sb
    .from("subcategories")
    .select("*")
    .order("sort_order");
  if (error || !data) return seedSubcategories;
  return data as Subcategory[];
}

/** Sub-categories the dashboard has not hidden from the menus. */
export async function getNavSubcategories(): Promise<Subcategory[]> {
  return (await getSubcategories()).filter((s) => s.show_in_nav !== false);
}

/**
 * In-stock products, optionally narrowed to a collection, a search and a
 * sub-category. Callers resolve `subSlug` against getSubcategories() first, so
 * the sub-category filter is never sent to a database that lacks the column.
 */
export async function getProducts(
  categorySlug?: string,
  q?: string,
  subSlug?: string
): Promise<Product[]> {
  const sb = getSupabase();
  let products: Product[] | null = null;
  if (sb) {
    let query = sb.from("products").select("*").eq("in_stock", true);
    if (categorySlug) query = query.eq("category_slug", categorySlug);
    if (subSlug) query = query.eq("subcategory_slug", subSlug);
    const { data, error } = await query;
    if (!error && data) products = data as Product[];
  }
  if (!products) {
    products = seedProducts.filter(
      (p) =>
        (!categorySlug || p.category_slug === categorySlug) &&
        (!subSlug || p.subcategory_slug === subSlug)
    );
  }
  if (q?.trim()) {
    const needle = q.trim().toLowerCase();
    products = products.filter((p) =>
      [p.name, p.short_description, p.description, p.material, p.category_slug]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }
  return products;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.featured);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const sb = getSupabase();
  if (!sb) return seedProducts.find((p) => p.slug === slug) ?? null;
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return seedProducts.find((p) => p.slug === slug) ?? null;
  return (data as Product | null) ?? null;
}

/** Same sub-category first, then the rest of the collection, then the house. */
export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const products = (await getProducts()).filter((p) => p.slug !== product.slug);
  const rank = (p: Product) =>
    product.subcategory_slug && p.subcategory_slug === product.subcategory_slug
      ? 0
      : p.category_slug === product.category_slug
        ? 1
        : 2;
  return products
    .map((p, i) => ({ p, i, r: rank(p) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .slice(0, 4)
    .map(({ p }) => p);
}

/**
 * How many of `products` sit in each sub-category, keyed by its slug. A
 * product only counts towards a sub-category of its own collection — the shop
 * page never lists it anywhere else, so it must not make another collection's
 * sub-category look stocked.
 */
export function countBySubcategory(
  products: Product[],
  subcategories: Subcategory[]
): Map<string, number> {
  const collectionOf = new Map(subcategories.map((s) => [s.slug, s.category_slug]));
  const counts = new Map<string, number>();
  for (const p of products) {
    const sub = p.subcategory_slug;
    if (sub && collectionOf.get(sub) === p.category_slug) counts.set(sub, (counts.get(sub) ?? 0) + 1);
  }
  return counts;
}

/**
 * The sub-categories worth showing a shopper, grouped by collection: hidden
 * ones and ones with nothing in stock are left out, so a menu entry or a chip
 * never opens onto an empty shelf.
 */
export function stockedSubcategoriesByCollection(
  subcategories: Subcategory[],
  products: Product[]
): Record<string, Subcategory[]> {
  const counts = countBySubcategory(products, subcategories);
  const grouped: Record<string, Subcategory[]> = {};
  for (const s of subcategories) {
    if (s.show_in_nav === false || !counts.get(s.slug)) continue;
    (grouped[s.category_slug] ??= []).push(s);
  }
  return grouped;
}
