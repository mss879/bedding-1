function Env({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-sand px-1.5 py-0.5 text-[0.8rem] text-ink">{children}</code>
  );
}

/**
 * Setup steps for a server where Supabase isn't connected. The login page
 * shows it in place of the sign-in form, naming the variables that are
 * `missing`; dashboard pages keep it as a fallback for the same case.
 */
export function SetupNotice({ missing = [] }: { missing?: string[] }) {
  return (
    <div className="max-w-2xl rounded-xl bg-white p-6 shadow-card md:p-8">
      <h2 className="font-display text-2xl">Connect Supabase to finish setup</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        The dashboard signs in with a Supabase account and manages the live catalogue and orders
        through Supabase, and it isn&apos;t connected on this server yet.
      </p>
      {missing.length > 0 && (
        <p className="mt-3 text-sm leading-relaxed text-ink">
          Missing on this server:{" "}
          {missing.map((name, i) => (
            <span key={name}>
              {i > 0 && ", "}
              <Env>{name}</Env>
            </span>
          ))}
          .
        </p>
      )}
      <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-ink-soft">
        <li>
          Run every migration in <Env>supabase/migrations/</Env> against the Supabase project, in
          order.
        </li>
        <li>
          Set <Env>NEXT_PUBLIC_SUPABASE_URL</Env> and <Env>NEXT_PUBLIC_SUPABASE_ANON_KEY</Env> so
          the storefront reads from the database and the dashboard can check sign-ins.
        </li>
        <li>
          Set <Env>SUPABASE_SERVICE_ROLE_KEY</Env> so the dashboard and the checkout can write to
          it. Until it is set, orders and inquiries placed on the storefront are not saved.
        </li>
        <li>
          In Supabase, add a user under Authentication → Users, then put that user on the admin
          list. The README has the one line of SQL for it.
        </li>
      </ol>
      <p className="mt-5 text-xs text-fog">
        Set the variables in the host&apos;s environment settings (or <Env>.env.local</Env> when
        running locally), then redeploy or restart the server.
      </p>
    </div>
  );
}
