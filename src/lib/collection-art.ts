/**
 * Wide (21:9) banner art per collection, used at the top of the shop page.
 *
 * Kept out of the `categories` table on purpose: banners are art direction, not
 * catalog data, and a collection created in /admin should not be blocked on
 * someone shooting a 21:9 crop. Anything not listed here falls back to the
 * collection's own square image.
 */
const BANNERS: Record<string, string> = {
  wellness: "/images/banners/wellness-self-care.webp",
  fragrances: "/images/banners/fragrances-perfume.webp",
  "home-living": "/images/banners/home-living.webp",
  jewelry: "/images/banners/pearls-fine-jewelry.webp",
  fashion: "/images/banners/fashion-accessories.webp",
  bedlinen: "/images/banners/bedlinen-sleep.webp",
};

export const SHOP_ALL_BANNER = "/images/banners/shop-all.webp";
export const TRADE_BANNER = "/images/banners/hotel-trade.webp";

/** Short line shown over the banner, under the collection name. */
const TAGLINES: Record<string, string> = {
  wellness: "The unhurried hour",
  fragrances: "Composed in Colombo",
  "home-living": "Quiet luxury, every room",
  jewelry: "Hand-strung, hand-set",
  fashion: "Linen, silk, and time",
  bedlinen: "For the best night of your week",
};

export function collectionBanner(slug?: string, fallback?: string): string {
  if (!slug) return SHOP_ALL_BANNER;
  return BANNERS[slug] ?? fallback ?? SHOP_ALL_BANNER;
}

export function collectionTagline(slug?: string): string {
  if (!slug) return "Six collections, one house";
  return TAGLINES[slug] ?? "From the maison";
}
