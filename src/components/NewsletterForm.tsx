"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/lib/actions";

/**
 * Newsletter capture as a self-contained field group: white flat input with a
 * nested squared ink submit, so it reads correctly on the beeswax band, the
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
            setMessage("Welcome in. Watch for the first letter.");
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
          placeholder="Your email address"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Sign up for the maison letter"
          className="flex h-10 shrink-0 items-center justify-center rounded-sm bg-ink px-5 text-[0.66rem] font-medium tracking-[0.16em] uppercase text-white transition-colors hover:bg-clay disabled:opacity-50"
        >
          {pending ? "Sending" : "Sign up"}
        </button>
      </div>
      {status !== "idle" && (
        <p
          role="status"
          className={`mt-3 text-[0.8rem] font-medium ${
            status === "done" ? "text-sale" : "text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

