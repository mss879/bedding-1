function Env({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-sand px-1.5 py-0.5 text-[0.8rem] text-ink">{children}</code>
  );
}

/**
 * Shown on every admin page when the service-role Supabase client isn't
 * configured yet (admin data functions return null in that case).
 */
export function SetupNotice() {
  return (
    <div className="max-w-2xl rounded-xl bg-white p-6 shadow-card md:p-8">
      <h2 className="font-display text-2xl">Connect Supabase to finish setup</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        The dashboard manages the live catalog and orders through Supabase, and it isn&apos;t
        connected yet. In the meantime the storefront keeps running on the built-in demo seed
        catalog, so nothing is broken for visitors.
      </p>
      <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-ink-soft">
        <li>
          Create a Supabase project and run both migrations against it:{" "}
          <Env>supabase/migrations/0001_init.sql</Env> and{" "}
          <Env>supabase/migrations/0002_admin_ecommerce.sql</Env>.
        </li>
        <li>
          Add <Env>NEXT_PUBLIC_SUPABASE_URL</Env> and <Env>NEXT_PUBLIC_SUPABASE_ANON_KEY</Env> to{" "}
          <Env>.env.local</Env> so the storefront reads from the database.
        </li>
        <li>
          Add <Env>SUPABASE_SERVICE_ROLE_KEY</Env> so this dashboard can write to it.
        </li>
        <li>
          Set <Env>ADMIN_PASSWORD</Env> to lock the dashboard behind a password.
        </li>
      </ol>
      <p className="mt-5 text-xs text-fog">
        Restart the dev server after changing environment variables.
      </p>
    </div>
  );
}
