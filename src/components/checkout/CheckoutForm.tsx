"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { placeOrder } from "@/lib/actions";
import { formatPrice } from "@/lib/site";

const labelClass = "mb-1.5 block text-[0.82rem] font-medium text-ink";

export function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const deliveryFree = subtotal >= 25000;

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-3xl text-ink-soft">Your cart is empty</p>
        <Link href="/shop" className="btn btn-solid mt-8">
          Back to the shop
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await placeOrder({
        customerName: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        address: String(form.get("address") ?? ""),
        city: String(form.get("city") ?? ""),
        notes: String(form.get("notes") ?? ""),
        items: items.map((i) => ({
          productSlug: i.productSlug,
          sizeName: i.sizeName,
          quantity: i.quantity,
        })),
      });
      if (result.ok) {
        clearCart();
        const params = new URLSearchParams({
          ref: result.reference,
          total: String(result.total),
          wa: result.whatsappUrl,
        });
        router.push(`/checkout/success?${params.toString()}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <form onSubmit={onSubmit} className="space-y-5">
        <h2 className="font-display text-2xl">Delivery details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="co-name" className={labelClass}>
              Full name *
            </label>
            <input id="co-name" name="name" required className="field" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="co-phone" className={labelClass}>
              Phone (WhatsApp) *
            </label>
            <input id="co-phone" name="phone" required type="tel" className="field" autoComplete="tel" />
          </div>
        </div>
        <div>
          <label htmlFor="co-email" className={labelClass}>
            Email
          </label>
          <input id="co-email" name="email" type="email" className="field" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="co-address" className={labelClass}>
            Delivery address *
          </label>
          <input id="co-address" name="address" required className="field" autoComplete="street-address" />
        </div>
        <div>
          <label htmlFor="co-city" className={labelClass}>
            City *
          </label>
          <input id="co-city" name="city" required className="field" autoComplete="address-level2" />
        </div>
        <div>
          <label htmlFor="co-notes" className={labelClass}>
            Order notes
          </label>
          <textarea
            id="co-notes"
            name="notes"
            rows={3}
            className="field"
            placeholder="Colour preferences, delivery instructions…"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-solid w-full disabled:opacity-60">
          {pending ? "Placing order…" : `Place order — ${formatPrice(subtotal)}`}
        </button>
        <p className="text-xs leading-relaxed text-ink-soft">
          Payment is settled on delivery or by bank transfer — we&apos;ll confirm your
          order and payment details on WhatsApp within a few hours.
        </p>
      </form>

      <aside className="card-lift h-fit p-6 md:p-7">
        <h2 className="mb-5 font-display text-2xl">Your order</h2>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={`${item.productSlug}-${item.sizeName}`} className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium leading-snug">{item.name}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {item.sizeName} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2 border-t hairline pt-4 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Delivery</span>
            <span className={deliveryFree ? "font-semibold text-sale" : ""}>
              {deliveryFree ? "FREE" : "Confirmed on WhatsApp"}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <span className="font-medium text-ink">Total</span>
            <span className="text-xl font-semibold text-ink">{formatPrice(subtotal)}</span>
          </div>
        </div>

        {/* Trust signals */}
        <ul className="mt-6 space-y-2.5 border-t hairline pt-4 text-[0.82rem] text-ink-soft">
          <li className="flex items-center gap-2.5">
            <MoonIcon className="h-4.5 w-4.5 shrink-0 text-ink" />
            365-night comfort guarantee
          </li>
          <li className="flex items-center gap-2.5">
            <TruckIcon className="h-4.5 w-4.5 shrink-0 text-ink" />
            Free delivery on orders over Rs 25,000
          </li>
          <li className="flex items-center gap-2.5">
            <ChatIcon className="h-4.5 w-4.5 shrink-0 text-ink" />
            Personal confirmation on WhatsApp
          </li>
        </ul>
      </aside>
    </div>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M20 13.5A8.2 8.2 0 0 1 10.5 4a8.2 8.2 0 1 0 9.5 9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M2.5 6.5h11v10h-11zM13.5 9.5h4l3 3v4h-7" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4.2 3.4A.5.5 0 0 1 4 19V6Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
