"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useCart } from "@/components/cart/CartContext";
import { placeOrder } from "@/lib/actions";
import { formatPrice, paymentMethodLabel, paymentMethods } from "@/lib/site";
import type { PaymentMethod } from "@/lib/types";

const labelClass = "mb-1.5 block text-[0.82rem] font-semibold text-ink";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

const steps = [
  { n: 1, label: "Contact" },
  { n: 2, label: "Delivery" },
  { n: 3, label: "Payment" },
] as const;

function joinList(parts: string[]) {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

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

  function update<K extends keyof typeof values>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  function validateStep(s: number): string | null {
    const missing: string[] = [];
    if (s === 1) {
      if (!values.name.trim()) missing.push("your name");
      if (!values.email.trim()) missing.push("your email");
      if (!values.phone.trim()) missing.push("your phone number");
      if (missing.length > 0) return `Please fill in ${joinList(missing)}.`;
      if (!EMAIL_RE.test(values.email.trim())) {
        return "Please enter a valid email address.";
      }
    }
    if (s === 2) {
      if (!values.address.trim()) missing.push("your delivery address");
      if (!values.city.trim()) missing.push("your city");
      if (missing.length > 0) return `Please fill in ${joinList(missing)}.`;
    }
    return null;
  }

  function goToStep(n: number) {
    setError(null);
    setStep(n);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (step < 3) {
      const message = validateStep(step);
      if (message) {
        setError(message);
        return;
      }
      setStep(step + 1);
      return;
    }

    startTransition(async () => {
      const result = await placeOrder({
        customerName: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        notes: values.notes.trim(),
        paymentMethod,
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
          pm: result.paymentMethod,
        });
        router.push(`/checkout/success?${params.toString()}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {/* Stepper */}
        <nav aria-label="Checkout progress">
          <ol className="flex items-center">
            {steps.map((s, i) => {
              const done = s.n < step;
              const current = s.n === step;
              return (
                <li key={s.n} className={i < steps.length - 1 ? "flex flex-1 items-center" : "flex items-center"}>
                  <button
                    type="button"
                    onClick={done ? () => goToStep(s.n) : undefined}
                    disabled={!done}
                    aria-current={current ? "step" : undefined}
                    className={`flex items-center gap-2.5 ${done ? "" : "cursor-default"}`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.8rem] font-semibold ${
                        done || current ? "bg-ink text-white" : "bg-sand text-ink-soft"
                      }`}
                    >
                      {done ? <CheckIcon className="h-3.5 w-3.5" /> : s.n}
                    </span>
                    <span className={`text-[0.82rem] font-semibold ${current ? "text-ink" : "text-ink-soft"}`}>
                      {s.label}
                    </span>
                  </button>
                  {i < steps.length - 1 && <span aria-hidden className="hairline mx-3 flex-1 border-t" />}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Keyed remount = entrance-only animation. No AnimatePresence exit
            gate here: a paused rAF (backgrounded tab) mid-transition would
            leave checkout stuck between steps. */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
            {step === 1 && (
              <>
                <h2 className="font-display text-2xl">Contact details</h2>
                <div>
                  <label htmlFor="co-name" className={labelClass}>
                    Full name *
                  </label>
                  <input
                    id="co-name"
                    name="name"
                    required
                    className="field"
                    autoComplete="name"
                    value={values.name}
                    onChange={update("name")}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="co-email" className={labelClass}>
                      Email *
                    </label>
                    <input
                      id="co-email"
                      name="email"
                      required
                      type="email"
                      className="field"
                      autoComplete="email"
                      value={values.email}
                      onChange={update("email")}
                    />
                  </div>
                  <div>
                    <label htmlFor="co-phone" className={labelClass}>
                      Phone (WhatsApp) *
                    </label>
                    <input
                      id="co-phone"
                      name="phone"
                      required
                      type="tel"
                      className="field"
                      autoComplete="tel"
                      value={values.phone}
                      onChange={update("phone")}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-display text-2xl">Delivery details</h2>
                <div>
                  <label htmlFor="co-address" className={labelClass}>
                    Delivery address *
                  </label>
                  <input
                    id="co-address"
                    name="address"
                    required
                    className="field"
                    autoComplete="street-address"
                    value={values.address}
                    onChange={update("address")}
                  />
                </div>
                <div>
                  <label htmlFor="co-city" className={labelClass}>
                    City *
                  </label>
                  <input
                    id="co-city"
                    name="city"
                    required
                    className="field"
                    autoComplete="address-level2"
                    value={values.city}
                    onChange={update("city")}
                  />
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
                    placeholder="Anything the courier should know?"
                    value={values.notes}
                    onChange={update("notes")}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="font-display text-2xl">Payment</h2>
                <div className="space-y-3">
                  {paymentMethods.map((m) => {
                    const selected = paymentMethod === m.id;
                    return (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-start gap-3.5 rounded-xl border bg-white p-4 ${
                          selected ? "border-ink shadow-card" : "border-board"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m.id}
                          checked={selected}
                          onChange={() => setPaymentMethod(m.id)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden
                          className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? "border-ink" : "border-board"
                          }`}
                        >
                          {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
                        </span>
                        <span>
                          <span className="block font-semibold">{m.label}</span>
                          <span className="mt-0.5 block text-sm text-ink-soft">{m.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
        </motion.div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <button type="button" onClick={() => goToStep(step - 1)} className="btn btn-outline">
              Back
            </button>
          )}
          {step < 3 ? (
            <button type="submit" className="btn btn-solid flex-1">
              Continue
            </button>
          ) : (
            <button type="submit" disabled={pending} className="btn btn-solid w-full flex-1 disabled:opacity-60">
              {pending ? "Placing order…" : `Place order — ${formatPrice(subtotal)}`}
            </button>
          )}
        </div>

        {step === 3 && (
          <p className="text-xs leading-relaxed text-ink-soft">
            We confirm every order and delivery personally on WhatsApp within a few hours.
          </p>
        )}
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
          {step === 3 && (
            <div className="flex justify-between text-ink-soft">
              <span>Payment</span>
              <span>{paymentMethodLabel(paymentMethod)}</span>
            </div>
          )}
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
      <path d="M4.5 12.5l5 5 10-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
