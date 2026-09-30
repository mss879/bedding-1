"use client";

import { useActionState } from "react";
import { adminLogin, type LoginState } from "@/lib/admin/actions";

const initialState: LoginState = { error: null };

const labelClass = "mb-1.5 block text-[0.82rem] font-semibold text-ink";

export function LoginForm({ from }: { from?: string }) {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-card md:p-8">
      <h1 className="font-display text-3xl text-clay">Enivrant admin</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Sign in to manage the store.</p>

      <form action={formAction} className="mt-6 space-y-4">
        {from?.startsWith("/admin") && <input type="hidden" name="from" value={from} />}
        <div>
          <label htmlFor="admin-email" className={labelClass}>
            Email *
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoFocus
            autoComplete="username"
            defaultValue={state.email ?? ""}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className={labelClass}>
            Password *
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field"
          />
        </div>

        {state.error && (
          <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-solid w-full disabled:opacity-60">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
