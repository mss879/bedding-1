import type { MetadataRoute } from "next";
import { getNavCategories, getProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

const STATIC_PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/hotel-bulk", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getNavCategories()]);
  const lastModified = new Date();

  return [
    ...STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
      url: `${site.url}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    // The collection views are the pages shoppers actually land on from search,
    // so they belong in the sitemap even though they are query strings on /shop.
    ...categories.map((c) => ({
      url: `${site.url}/shop?category=${c.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${site.url}/product/${p.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
