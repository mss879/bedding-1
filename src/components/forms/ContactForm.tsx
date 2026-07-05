"use client";

import { useState, useTransition } from "react";
import { submitInquiry } from "@/lib/actions";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await submitInquiry({
        type: "contact",
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        message: String(form.get("message") ?? ""),
      });
      if (result.ok) setSent(true);
      else setError(result.error);
    });
  }

  if (sent) {
    return (
      <div role="status" className="rounded-xl bg-cream px-6 py-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sale/10 text-sale">
          <CheckIcon className="h-6 w-6" />
        </span>
        <p className="mt-5 font-display text-2xl md:text-3xl">Message received.</p>
        <p className="mt-2 text-sm font-semibold text-sale">
          We&apos;ll reply within one working day.
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          Thank you for writing — a real person will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className="mb-1.5 block text-[0.82rem] font-semibold text-ink">
            Name *
          </label>
          <input id="ct-name" name="name" required className="field" />
        </div>
        <div>
          <label htmlFor="ct-phone" className="mb-1.5 block text-[0.82rem] font-semibold text-ink">
            Phone
          </label>
          <input id="ct-phone" name="phone" type="tel" className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="ct-email" className="mb-1.5 block text-[0.82rem] font-semibold text-ink">
          Email *
        </label>
        <input id="ct-email" name="email" type="email" required className="field" />
      </div>
      <div>
        <label htmlFor="ct-message" className="mb-1.5 block text-[0.82rem] font-semibold text-ink">
          Message *
        </label>
        <textarea id="ct-message" name="message" required rows={5} className="field" />
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-solid w-full disabled:opacity-60">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
