import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, type AuthError } from "@supabase/supabase-js";
import { isValidSupabaseUrl } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "./session";

// Who may use the dashboard. Two things have to hold: the visitor signed in
// with a Supabase Auth email and password, and that account is on the admin
// list (public.admin_users, migration 0009). The list is what makes someone an
// admin — a Supabase project accepts sign-ups from anyone who has the public
// key unless that is switched off, so "has an account" must never be enough.

/** Environment variables the dashboard needs that are missing on this server. */
export function missingAdminEnv(): string[] {
  const missing: string[] = [];
  if (!isValidSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  return missing;
}

type AdminListCheck = "listed" | "not-listed" | "no-table" | "unavailable";

async function checkAdminList(userId: string): Promise<AdminListCheck> {
  const sb = getSupabaseAdmin();
  if (!sb) return "unavailable";
  const { data, error } = await sb
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    // PGRST205 is PostgREST not knowing the table, 42P01 is Postgres saying
    // the same: migration 0009 has not been run.
    return error.code === "PGRST205" || error.code === "42P01" ? "no-table" : "unavailable";
  }
  return data ? "listed" : "not-listed";
}

// Read on every request rather than trusted from the cookie, so taking someone
// off the list (or deleting their Supabase account) locks them out at once
// instead of when their session expires. Anything short of a clear yes — a
// missing table, a failed query — is a no.
const adminUserId = cache(async (): Promise<string | null> => {
  const store = await cookies();
  const userId = await verifyAdminSessionToken(store.get(ADMIN_COOKIE)?.value);
  if (!userId) return null;
  return (await checkAdminList(userId)) === "listed" ? userId : null;
});

/** True when the current request carries a valid session for a current admin. */
export async function isAdmin(): Promise<boolean> {
  return (await adminUserId()) !== null;
}

/** For pages and data reads: sends anyone who is not a signed-in admin to the login page. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export type SignInResult = { ok: true; userId: string } | { ok: false; error: string };

function signInError(error: AuthError | null): string {
  switch (error?.code) {
    case "invalid_credentials":
      return "Wrong email or password.";
    case "email_not_confirmed":
      return "This email address hasn't been confirmed yet. Confirm it in Supabase under Authentication → Users.";
    case "user_banned":
      return "This account has been suspended in Supabase.";
    case "over_request_rate_limit":
      return "Too many attempts. Wait a minute and try again.";
  }
  if (error?.status === 429) return "Too many attempts. Wait a minute and try again.";
  if (error?.status === 401) {
    return "Supabase rejected this server's API key. Check NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }
  if (error?.status === 400) return "Wrong email or password.";
  return "We couldn't reach Supabase to sign you in. Please try again.";
}

/**
 * Checks an email and password with Supabase Auth, then that the account is on
 * the admin list. Returns the Supabase user id to open a dashboard session for.
 */
export async function signInAdmin(email: string, password: string): Promise<SignInResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isValidSupabaseUrl(url) || !anonKey || !getSupabaseAdmin()) {
    return { ok: false, error: "Supabase isn't connected on this server yet." };
  }

  // A client of its own, discarded afterwards. Signing in on either shared
  // client would leave this user's session on it, and every later request made
  // through that client would then run as them rather than as its own key.
  const { auth } = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await auth.signInWithPassword({ email, password });
  if (error || !data.user) return { ok: false, error: signInError(error) };

  const listed = await checkAdminList(data.user.id);
  // Only the identity was needed. The dashboard keeps its own session (see
  // session.ts), so the Supabase one is closed rather than left open with
  // nobody holding it.
  await auth.signOut({ scope: "local" }).catch(() => undefined);

  switch (listed) {
    case "listed":
      return { ok: true, userId: data.user.id };
    case "not-listed":
      return {
        ok: false,
        error: "That account isn't on the admin list yet. Add it to admin_users in Supabase.",
      };
    case "no-table":
      return {
        ok: false,
        error: "The admin list doesn't exist yet. Run migration 0009 in Supabase.",
      };
    default:
      return { ok: false, error: "We couldn't check the admin list just now. Please try again." };
  }
}
