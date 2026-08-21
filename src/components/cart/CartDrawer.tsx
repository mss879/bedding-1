"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "./CartContext";
import { formatPrice, FREE_DELIVERY_FROM } from "@/lib/site";

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
            aria-label="Close basket"
            className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Shopping basket"
          >
            <div className="flex items-center justify-between border-b hairline px-6 py-5">
              <h2 className="font-display text-2xl">Your basket</h2>
              <button onClick={closeCart} aria-label="Close" className="icon-btn -mr-2">
                <CrossIcon className="h-4 w-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="font-display text-2xl text-ink-soft">Nothing chosen yet</p>
                <Link href="/shop" onClick={closeCart} className="btn btn-solid">
                  Explore the maison
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b hairline px-6 py-4">
                  {freeDelivery ? (
                    <p className="flex items-center gap-2 text-[0.78rem] font-medium text-sale">
                      <TruckCheckIcon className="h-4 w-4 shrink-0" />
                      Complimentary delivery unlocked
                    </p>
                  ) : (
                    <p className="text-[0.78rem] text-ink-soft">
                      <span className="font-medium text-ink">{formatPrice(remaining)}</span> more for
                      complimentary delivery
                    </p>
                  )}
                  <div className="mt-2.5 h-px overflow-hidden bg-board" aria-hidden>
                    <div
                      className="h-full bg-clay transition-[width] duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <ul className="flex-1 divide-y divide-board overflow-y-auto px-6">
                  {items.map((item) => (
                    <li key={`${item.productSlug}-${item.sizeName}`} className="flex gap-4 py-5">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={closeCart}
                        className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-sm bg-sand"
                      >
                        <Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/product/${item.productSlug}`}
                              onClick={closeCart}
                              className="font-display text-base leading-snug hover:text-clay"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-1 text-[0.72rem] text-ink-soft">{item.sizeName}</p>
                          </div>
                          <p className="shrink-0 text-sm">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-sm border hairline bg-white">
                            <button
                              className="flex h-8 w-8 items-center justify-center text-base leading-none transition-colors hover:bg-ink/5"
                              onClick={() =>
                                updateQuantity(item.productSlug, item.sizeName, item.quantity - 1)
                              }
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-sm">{item.quantity}</span>
                            <button
                              className="flex h-8 w-8 items-center justify-center text-base leading-none transition-colors hover:bg-ink/5"
                              onClick={() =>
                                updateQuantity(item.productSlug, item.sizeName, item.quantity + 1)
                              }
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productSlug, item.sizeName)}
                            aria-label={`Remove ${item.name}`}
                            className="text-[0.66rem] font-medium tracking-[0.14em] uppercase text-ink-soft transition-colors hover:text-clay"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t hairline bg-white px-6 py-6">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[0.7rem] font-medium tracking-[0.18em] uppercase">
                      Subtotal
                    </span>
                    <span className="font-display text-2xl">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mb-5 text-xs text-ink-soft">
                    {freeDelivery
                      ? "Delivery is on us — confirmed on WhatsApp."
                      : `Delivery confirmed at checkout. Free over ${formatPrice(FREE_DELIVERY_FROM)}.`}
                  </p>
                  <Link href="/checkout" onClick={closeCart} className="btn btn-solid w-full">
                    Checkout
                  </Link>
                  <Link href="/basket" onClick={closeCart} className="btn btn-outline mt-2.5 w-full">
                    View basket
                  </Link>
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function TruckCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2.5 6.5h11v10h-11zM13.5 9.5h4l3 3v4h-7" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
      <path d="M5.7 10.6l1.7 1.7 3-3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
