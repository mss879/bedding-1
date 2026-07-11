import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isValidSupabaseUrl } from "./supabase";

let adminClient: SupabaseClient | null | undefined;

/**
 * Service-role Supabase client for the admin dashboard. Bypasses RLS, so it
 * must only ever be used from server code (server actions, server components
 * under /admin) — never import this from a client component. Returns null
 * until NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured
 * with valid values; admin pages surface a setup notice in that case.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (adminClient !== undefined) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  adminClient = null;
  if (isValidSupabaseUrl(url) && key) {
    try {
      adminClient = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } catch {
      adminClient = null;
    }
  }
  return adminClient;
}
