"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/lib/actions";

/**
 * Newsletter capture as an Etsy-style pill group: white rounded-full input
 * with a nested circular ink submit. The pill is self-contained (white bg,
 * 2px ink border) so it reads correctly on the beeswax footer band, the
 * dark ink footer, or any other surface.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await subscribeNewsletter(email);
          if (result.ok) {
            setStatus("done");
            setMessage("Welcome in. Sleep well.");
            setEmail("");
          } else {
            setStatus("error");
            setMessage(result.error);
          }
        });
      }}
      className="w-full"
    >
      <div className="search-pill w-full">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Sign up for emails"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-[#2f2f2f] disabled:opacity-60"
        >
          {pending ? (
            <span aria-hidden className="text-base leading-none">…</span>
          ) : (
            <ArrowIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {status !== "idle" && (
        <p
          role="status"
          className={`mt-2.5 text-[0.85rem] font-semibold ${
            status === "done" ? "text-sale" : "text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 12h15m0 0-6-6m6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
