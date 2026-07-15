"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/site";

const FREE_DELIVERY_FROM = 25000;

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  const remaining = Math.max(0, FREE_DELIVERY_FROM - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100);
  const freeDelivery = subtotal >= FREE_DELIVERY_FROM;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            aria-label="Close cart"
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col rounded-l-2xl bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b hairline px-6 py-4">
              <h2 className="font-display text-2xl">Your cart</h2>
              <button onClick={closeCart} aria-label="Close" className="icon-btn -mr-2">
                <CrossIcon className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <p className="font-display text-2xl text-ink-soft">Your cart is empty</p>
                <Link href="/shop" onClick={closeCart} className="btn btn-solid">
                  Shop the collection
                </Link>
              </div>
            ) : (
              <>
                {/* Free-delivery progress (Etsy-style) */}
                <div className="border-b hairline px-6 py-4">
                  {freeDelivery ? (
                    <p className="flex items-center gap-2 text-[0.84rem] font-semibold text-sale">
                      <TruckCheckIcon className="h-4.5 w-4.5 shrink-0" />
                      You&apos;ve unlocked FREE delivery
                    </p>
                  ) : (
                    <p className="text-[0.84rem] text-ink-soft">
                      You are <span className="font-semibold text-ink">{formatPrice(remaining)}</span>{" "}
                      away from <span className="font-semibold text-sale">FREE delivery</span>
                    </p>
                  )}
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden>
                    <div
                      className="h-full rounded-full bg-sale transition-[width] duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <ul className="flex-1 divide-y divide-board overflow-y-auto px-6">
                  {items.map((item) => (
                    <li key={`${item.productSlug}-${item.sizeName}`} className="flex gap-4 py-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium leading-snug">{item.name}</p>
                            <p className="mt-0.5 text-xs text-ink-soft">{item.sizeName}</p>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border hairline">
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition-colors hover:bg-ink/5"
                              onClick={() => updateQuantity(item.productSlug, item.sizeName, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition-colors hover:bg-ink/5"
                              onClick={() => updateQuantity(item.productSlug, item.sizeName, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productSlug, item.sizeName)}
                            aria-label={`Remove ${item.name}`}
                            className="text-xs font-medium text-ink-soft underline-offset-2 transition-colors hover:text-ink hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t hairline px-6 py-5">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-ink">Subtotal</span>
                    <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mb-4 text-xs text-ink-soft">
                    {freeDelivery
                      ? "Delivery is on us — confirmed on WhatsApp."
                      : "Delivery confirmed at checkout. Free over Rs 25,000."}
                  </p>
                  <Link href="/checkout" onClick={closeCart} className="btn btn-solid w-full">
                    Go to checkout
                  </Link>
                  <button onClick={closeCart} className="btn btn-tint mt-2.5 w-full">
                    Keep shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function TruckCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M2.5 6.5h11v10h-11zM13.5 9.5h4l3 3v4h-7" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
      <path d="M5.7 10.6l1.7 1.7 3-3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
