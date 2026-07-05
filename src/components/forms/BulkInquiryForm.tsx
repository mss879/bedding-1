"use client";

import { useState, useTransition } from "react";
import { submitInquiry } from "@/lib/actions";
import { site, whatsappLink } from "@/lib/site";

const businessTypes = ["Hotel", "Villa", "Apartments", "Guest house", "Restaurant / Spa", "Other"];

const labelClass = "mb-1.5 block text-[0.82rem] font-medium text-ink";

export function BulkInquiryForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fields = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      businessType: String(form.get("businessType") ?? ""),
      quantity: String(form.get("quantity") ?? ""),
      sizes: String(form.get("sizes") ?? ""),
      materials: String(form.get("materials") ?? ""),
      budget: String(form.get("budget") ?? ""),
      delivery: String(form.get("delivery") ?? ""),
      message: String(form.get("message") ?? ""),
    };
    setError(null);
    startTransition(async () => {
      // Save the inquiry, then hand the conversation to WhatsApp with
      // everything pre-filled so the client can discuss it personally.
      const result = await submitInquiry({ type: "bulk", ...fields });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const lines = [
        `Hello ${site.name}! I'd like to discuss a hotel/bulk bedding order.`,
        ``,
        `Business: ${fields.businessType || "—"}`,
        `Quantity: ${fields.quantity || "—"}`,
        `Sizes: ${fields.sizes || "—"}`,
        `Materials: ${fields.materials || "—"}`,
        `Budget: ${fields.budget || "—"}`,
        `Delivery: ${fields.delivery || "—"}`,
        ``,
        `${fields.message}`,
        ``,
        `— ${fields.name}`,
      ];
      window.open(whatsappLink(lines.join("\n")), "_blank", "noopener,noreferrer");
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="card-lift p-8 text-center md:p-10">
        <p className="font-display text-3xl">Inquiry sent — see you on WhatsApp.</p>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
          We&apos;ve opened WhatsApp with your details pre-filled. If it didn&apos;t
          open, message us directly at {site.phone}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-lift space-y-5 p-6 md:p-8">
      <div>
        <h2 className="font-display text-2xl">Request a bulk quote</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          A few details now saves a dozen questions later.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="bi-name" className={labelClass}>
            Your name *
          </label>
          <input id="bi-name" name="name" required className="field" />
        </div>
        <div>
          <label htmlFor="bi-business" className={labelClass}>
            Business type *
          </label>
          <select id="bi-business" name="businessType" required className="field">
            {businessTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bi-phone" className={labelClass}>
            Phone / WhatsApp *
          </label>
          <input id="bi-phone" name="phone" required type="tel" className="field" />
        </div>
        <div>
          <label htmlFor="bi-email" className={labelClass}>
            Email
          </label>
          <input id="bi-email" name="email" type="email" className="field" />
        </div>
        <div>
          <label htmlFor="bi-quantity" className={labelClass}>
            Approx. quantity
          </label>
          <input id="bi-quantity" name="quantity" placeholder="e.g. 40 rooms / 120 sets" className="field" />
        </div>
        <div>
          <label htmlFor="bi-sizes" className={labelClass}>
            Sizes needed
          </label>
          <input id="bi-sizes" name="sizes" placeholder="e.g. Queen + King" className="field" />
        </div>
        <div>
          <label htmlFor="bi-materials" className={labelClass}>
            Material preference
          </label>
          <input id="bi-materials" name="materials" placeholder="e.g. percale, linen" className="field" />
        </div>
        <div>
          <label htmlFor="bi-budget" className={labelClass}>
            Budget range
          </label>
          <input id="bi-budget" name="budget" placeholder="per set or total" className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="bi-delivery" className={labelClass}>
          Delivery timeline
        </label>
        <input id="bi-delivery" name="delivery" placeholder="e.g. before December season" className="field" />
      </div>
      <div>
        <label htmlFor="bi-message" className={labelClass}>
          Tell us about your property *
        </label>
        <textarea id="bi-message" name="message" required rows={4} className="field" />
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-solid w-full disabled:opacity-60">
        {pending ? "Sending…" : "Send & continue on WhatsApp"}
      </button>
      <p className="text-xs leading-relaxed text-ink-soft">
        Submitting opens WhatsApp with your details pre-filled — bulk and custom
        orders are always discussed personally before anything is confirmed.
      </p>
    </form>
  );
}
