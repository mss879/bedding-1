import type { HeaderMenu } from "@/components/Header";
import type { Category } from "./types";
import { getNavSubcategories, getProducts, stockedSubcategoriesByCollection } from "./catalog";
import { collectionBanner, collectionPages, collectionTagline } from "./collection-art";

/**
 * What each collection's header panel lists: the sub-categories that have
 * something in stock, then its editorial pages, with the collection's banner
 * and tagline for the photograph. Small on purpose — this travels to the
 * browser on every page.
 */
export async function getHeaderMenu(categories: Category[]): Promise<HeaderMenu> {
  const [subcategories, products] = await Promise.all([getNavSubcategories(), getProducts()]);
  const stocked = stockedSubcategoriesByCollection(subcategories, products);
  const menu: HeaderMenu = {};
  for (const c of categories) {
    menu[c.slug] = {
      subcategories: (stocked[c.slug] ?? []).map(({ slug, name, image, category_slug }) => ({
        id: slug,
        slug,
        name,
        image,
        category_slug,
        description: "",
        sort_order: 0,
      })),
      pages: collectionPages(c.slug),
      banner: collectionBanner(c.slug, c.image),
      tagline: collectionTagline(c.slug),
    };
  }
  return menu;
}
