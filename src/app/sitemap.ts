import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const staticPages = ["", "/shop", "/hotel-bulk", "/about", "/contact"].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));
  const productPages = products.map((p) => ({
    url: `${site.url}/product/${p.slug}`,
    lastModified: new Date(),
  }));
  return [...staticPages, ...productPages];
}
