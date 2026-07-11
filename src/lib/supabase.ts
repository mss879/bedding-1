import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * True only for a real http(s) URL. Placeholder or malformed values
 * (e.g. the `your-supabase-url-here` scaffold) must be treated as "not
 * configured" so the site falls back to the seed catalog instead of
 * crashing inside createClient.
 */
export function isValidSupabaseUrl(url: string | undefined | null): url is string {
  if (!url) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Returns a Supabase client when NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are configured with valid values,
 * otherwise null. Every data path falls back to the local seed catalog
 * so the site stays fully functional before the migration is applied —
 * and so a half-filled .env never takes the storefront down.
 */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = null;
  if (isValidSupabaseUrl(url) && key) {
    try {
      client = createClient(url, key);
    } catch {
      client = null;
    }
  }
  return client;
}
