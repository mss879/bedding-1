/**
 * Etsy-style star ratings for products. The catalog has no review system yet,
 * so ratings are derived deterministically from the slug — stable across
 * server and client renders, and unchanged when products come from Supabase.
 */
export function productRating(slug: string): { rating: number; count: number } {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h >>>= 0;

  const rating = 4.5 + ((h % 6) / 10); // 4.5 – 5.0
  const count = 140 + (Math.floor(h / 7) % 3060); // 140 – 3199

  return { rating: Math.min(5, Math.round(rating * 10) / 10), count };
}

export function formatCount(count: number): string {
  return count.toLocaleString("en-US");
}
