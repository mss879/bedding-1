"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "./CartContext";
import { formatPrice, whatsappLink, site, FREE_DELIVERY_FROM } from "@/lib/site";
import { Reveal } from "@/components/anim/Reveal";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

/**
 * The full basket page. Renders an empty state until the cart hydrates from
 * localStorage, so the server and first client render always agree.
 */
export function BasketView({ suggestions }: { suggestions: Product[] }) {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const remaining = Math.max(0, FREE_DELIVERY_FROM - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100);
  const freeDelivery = subtotal >= FREE_DELIVERY_FROM;
  const count = items.reduce((n, i) => n + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="container-x pb-28 pt-4">
        <Reveal className="mx-auto max-w-lg text-center">
          <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-sm bg-sand md:w-64">
            <Image
              src="/images/editorial/cart-empty.webp"
              alt=""
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>
          <p className="mt-10 font-display text-[2.1rem] leading-tight xs:text-4xl md:text-5xl">
            Nothing chosen yet.
          </p>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            Your basket is empty. The maison keeps six collections — start
            wherever your senses take you.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/shop" className="btn btn-solid">
              Explore the maison
            </Link>
            <Link href="/shop?category=fragrances" className="btn btn-outline">
              Start with fragrance
            </Link>
          </div>
        </Reveal>

        {suggestions.length > 0 && (
          <Reveal delay={0.1} className="mt-24">
            <h2 className="eyebrow mb-8 text-center">Most wanted this season</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {suggestions.slice(0, 4).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </Reveal>
        )}
      </div>
    );
  }

  return (
    <div className="container-x pb-28 pt-4">
      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        {/* Line items */}
        <div>
          <div className="flex items-baseline justify-between border-b hairline pb-5">
            <p className="text-[0.72rem] tracking-wide text-ink-soft">
              {count} {count === 1 ? "piece" : "pieces"}
            </p>
            <button
              onClick={clearCart}
              className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-ink-soft transition-colors hover:text-clay"
            >
              Empty basket
            </button>
          </div>

          {/* Free-delivery progress */}
          <div className="border-b hairline py-6">
            {freeDelivery ? (
              <p className="flex items-center gap-2.5 text-[0.8rem] font-medium text-sale">
                <TruckCheckIcon className="h-4 w-4 shrink-0" />
                Complimentary island-wide delivery unlocked
              </p>
            ) : (
              <p className="text-[0.8rem] text-ink-soft">
                <span className="font-medium text-ink">{formatPrice(remaining)}</span> more for
                complimentary delivery
              </p>
            )}
            <div className="mt-3 h-px overflow-hidden bg-board" aria-hidden>
              <div
                className="h-full origin-left bg-clay transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="divide-y divide-board">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={`${item.productSlug}-${item.sizeName}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-5 py-7"
                >
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="relative h-32 w-24 shrink-0 overflow-hidden rounded-sm bg-sand sm:h-36 sm:w-28"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/product/${item.productSlug}`}
                          className="font-display text-xl leading-snug transition-colors hover:text-clay"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1.5 text-[0.78rem] text-ink-soft">{item.sizeName}</p>
                        <p className="mt-0.5 text-[0.78rem] text-ink-soft">
                          {formatPrice(item.unitPrice)} each
                        </p>
                      </div>
                      <p className="shrink-0 text-right font-display text-xl">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <div className="flex items-center rounded-sm border hairline">
                        <button
                          className="flex h-9 w-9 items-center justify-center text-base leading-none transition-colors hover:bg-ink/5"
                          onClick={() =>
                            updateQuantity(item.productSlug, item.sizeName, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-sm">{item.quantity}</span>
                        <button
                          className="flex h-9 w-9 items-center justify-center text-base leading-none transition-colors hover:bg-ink/5"
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
                        className="text-[0.68rem] font-medium tracking-[0.14em] uppercase text-ink-soft transition-colors hover:text-clay"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <Link href="/shop" className="link-rule mt-8 inline-block">
            ← Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-44">
          <div className="card-lift p-7 md:p-8">
            <h2 className="font-display text-2xl">Summary</h2>

            <dl className="mt-6 space-y-3 border-t hairline pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className={freeDelivery ? "font-medium text-sale" : "text-ink-soft"}>
                  {freeDelivery ? "Complimentary" : "Confirmed at checkout"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Gift wrapping</dt>
                <dd className="font-medium text-sale">Included</dd>
              </div>
              <div className="flex items-baseline justify-between border-t hairline pt-4">
                <dt className="text-[0.7rem] font-medium tracking-[0.18em] uppercase">Total</dt>
                <dd className="font-display text-3xl">{formatPrice(subtotal)}</dd>
              </div>
            </dl>

            <Link href="/checkout" className="btn btn-solid mt-7 w-full">
              Proceed to checkout
            </Link>
            <a
              href={whatsappLink(
                `Hello ${site.name}! I'd like to complete an order of ${count} ${
                  count === 1 ? "piece" : "pieces"
                } (${formatPrice(subtotal)}).`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline mt-2.5 w-full"
            >
              Order on WhatsApp
            </a>

            <ul className="mt-7 space-y-3 border-t hairline pt-5 text-[0.78rem] text-ink-soft">
              <li className="flex items-center gap-3">
                <ShieldIcon className="h-4 w-4 shrink-0 text-clay" />
                365-day quality guarantee
              </li>
              <li className="flex items-center gap-3">
                <TruckCheckIcon className="h-4 w-4 shrink-0 text-clay" />
                Free delivery over {formatPrice(FREE_DELIVERY_FROM)}
              </li>
              <li className="flex items-center gap-3">
                <ChatIcon className="h-4 w-4 shrink-0 text-clay" />
                Every order confirmed personally
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <Reveal className="mt-24 border-t hairline pt-14">
          <h2 className="eyebrow mb-8">Complete the ritual</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {suggestions.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Reveal>
      )}
    </div>
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

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3.5 5 6v5.5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-2.5Z" strokeLinejoin="round" />
      <path d="m9 12 2.2 2.2L15.5 9.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4.2 3.4A.5.5 0 0 1 4 19V6Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
