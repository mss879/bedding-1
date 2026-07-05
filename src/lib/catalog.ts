import { getSupabase } from "./supabase";
import { seedCategories, seedProducts } from "./seed-data";
import type { Category, Product } from "./types";

export async function getCategories(): Promise<Category[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("categories")
      .select("*")
      .order("sort_order");
    if (!error && data && data.length > 0) return data as Category[];
  }
  return seedCategories;
}

export async function getProducts(categorySlug?: string, q?: string): Promise<Product[]> {
  const sb = getSupabase();
  let products: Product[] | null = null;
  if (sb) {
    let query = sb.from("products").select("*").eq("in_stock", true);
    if (categorySlug) query = query.eq("category_slug", categorySlug);
    const { data, error } = await query;
    if (!error && data && data.length > 0) products = data as Product[];
  }
  if (!products) {
    products = categorySlug
      ? seedProducts.filter((p) => p.category_slug === categorySlug)
      : seedProducts;
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
  if (sb) {
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (!error && data) return data as Product;
  }
  return seedProducts.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const products = await getProducts();
  const sameCategory = products.filter(
    (p) => p.category_slug === product.category_slug && p.slug !== product.slug
  );
  const others = products.filter(
    (p) => p.category_slug !== product.category_slug && p.slug !== product.slug
  );
  return [...sameCategory, ...others].slice(0, 4);
}
