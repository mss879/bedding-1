"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/types";
import { formatPrice, site, whatsappLink, FREE_DELIVERY_FROM } from "@/lib/site";
import { productRating, formatCount } from "@/lib/ratings";
import { Stars } from "@/components/Stars";
import { useCart } from "@/components/cart/CartContext";
import { Reveal } from "@/components/anim/Reveal";

/**
 * The listing module: a thumbnail rail and tall gallery on the left, the buy
 * box on the right — maison line, name, rating, price, variant chips,
 * add-to-basket, delivery signals and accordions.
 *
 * Deliberately free of urgency copy ("x in baskets right now") and promotional
 * shouts; delivery terms live in the accordion, where they read as information.
 */
export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<"details" | "care" | "shipping" | null>("details");

  const size = product.sizes[sizeIndex];
  const { rating, count } = productRating(product.slug);
  const discount = size.compare_at_price
    ? Math.round((1 - size.price / size.compare_at_price) * 100)
    : 0;

  const cartItem = () => ({
    productSlug: product.slug,
    name: product.name,
    image: product.images[0],
    sizeName: size.name,
    unitPrice: size.price,
  });

  const gallery = (dir: 1 | -1) =>
    setActiveImage((i) => (i + dir + product.images.length) % product.images.length);

  const sections = [
    { key: "details" as const, label: "The piece", items: product.details },
    { key: "care" as const, label: "Care", items: product.care },
    {
      key: "shipping" as const,
      label: "Delivery & returns",
      items: [
        "Dispatched from our Colombo atelier within 2–4 working days",
        `Complimentary island-wide delivery over ${formatPrice(FREE_DELIVERY_FROM)}`,
        "365-day guarantee — live with it, then decide",
        "Exchanges within 30 days, unworn and in original packaging",
      ],
    },
  ];

  return (
    <div className="container-x grid gap-14 pb-24 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
      {/* Gallery */}
      <div className="flex flex-col gap-3 lg:flex-row">
        {product.images.length > 1 && (
          <div className="no-scrollbar order-2 flex gap-2.5 overflow-x-auto lg:order-1 lg:w-[4.5rem] lg:flex-col lg:overflow-visible">
            {product.images.map((image, i) => (
              <button
                key={image}
                onClick={() => setActiveImage(i)}
                onMouseEnter={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-sm transition-all lg:h-[5.5rem] lg:w-full ${
                  i === activeImage ? "ring-1 ring-ink ring-offset-2 ring-offset-cream" : "opacity-65 hover:opacity-100"
                }`}
              >
                <Image src={image} alt="" fill sizes="72px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="relative order-1 flex-1 lg:order-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-sand">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => gallery(-1)}
                  aria-label="Previous image"
                  className="arrow-btn absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2"
                >
                  <ChevronIcon className="h-4 w-4 rotate-180" />
                </button>
                <button
                  onClick={() => gallery(1)}
                  aria-label="Next image"
                  className="arrow-btn absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2"
                >
                  <ChevronIcon className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Buy box */}
      <div className="lg:pt-6">
        <Reveal y={20}>
          <p className="text-[0.62rem] font-medium tracking-[0.28em] uppercase text-clay">
            {site.nameUpper}
          </p>

          <h1 className="mt-6 font-display text-[2.9rem] leading-[1.04] md:text-[3.6rem]">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars rating={rating} size={13} />
            <a href="#reviews" className="text-[0.78rem] text-ink-soft underline-offset-4 hover:text-clay hover:underline">
              {formatCount(count)} reviews
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-3">
            <span className={`font-display text-[2.4rem] leading-none ${discount > 0 ? "text-clay" : "text-ink"}`}>
              {formatPrice(size.price)}
            </span>
            {size.compare_at_price && (
              <>
                <span className="text-base text-taupe line-through">
                  {formatPrice(size.compare_at_price)}
                </span>
                <span className="text-[0.78rem] text-clay">({discount}% off)</span>
              </>
            )}
          </div>
          <p className="mt-1.5 text-xs text-ink-soft">Local taxes included where applicable</p>

          <p className="mt-8 text-[1rem] leading-[1.85] text-ink-soft">
            {product.short_description}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            <span className="text-ink">Material:</span> {product.material}
          </p>
        </Reveal>

        <Reveal y={20} delay={0.08} className="mt-12 flex flex-col gap-8">
          {product.sizes.length > 1 && (
            <div>
              <p className="eyebrow mb-3">
                Size <span className="text-ink-soft">· {size.dimensions}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setSizeIndex(i)}
                    aria-pressed={i === sizeIndex}
                    className={`chip ${i === sizeIndex ? "chip-active" : ""}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 0 && (
            <div>
              <p className="eyebrow mb-3">
                Colour <span className="text-ink-soft">· {product.colors[colorIndex]}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setColorIndex(i)}
                    aria-pressed={i === colorIndex}
                    className={`chip ${i === colorIndex ? "chip-active" : ""}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="eyebrow mb-3">Quantity</p>
            <div className="inline-flex items-center rounded-sm border hairline">
              <button
                onClick={() => setQuantity((n) => Math.max(1, n - 1))}
                aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center text-lg leading-none transition-colors hover:bg-ink/5"
              >
                −
              </button>
              <span className="w-10 text-center text-sm" aria-live="polite">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((n) => Math.min(12, n + 1))}
                aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center text-lg leading-none transition-colors hover:bg-ink/5"
              >
                +
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal y={20} delay={0.12} className="mt-12 flex flex-col gap-3">
          {product.in_stock ? (
            <>
              <button onClick={() => addItem(cartItem(), quantity)} className="btn btn-solid w-full">
                Add to basket — {formatPrice(size.price * quantity)}
              </button>
              <button
                onClick={() => {
                  addItem(cartItem(), quantity);
                  router.push("/checkout");
                }}
                className="btn btn-outline w-full"
              >
                Buy it now
              </button>
            </>
          ) : (
            <>
              <button disabled className="btn btn-solid w-full cursor-not-allowed opacity-50">
                Sold out
              </button>
              <a
                href={whatsappLink(
                  `Hello ${site.name}! Please let me know when the ${product.name} (${size.name}) returns.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline w-full"
              >
                Notify me on WhatsApp
              </a>
            </>
          )}
        </Reveal>

        <Reveal y={20} delay={0.16} className="mt-10 space-y-3.5 text-sm">
          <p className="flex items-start gap-3">
            <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
            <span>
              Dispatched in 2–4 working days from Colombo
              {size.price >= FREE_DELIVERY_FROM ? " — delivery complimentary" : ""}
            </span>
          </p>
          <p className="flex items-start gap-3">
            <ReturnIcon className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
            <span>365-day guarantee &amp; 30-day exchanges</span>
          </p>
          <p className="flex items-start gap-3">
            <GiftIcon className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
            <span>Complimentary gift wrapping on request</span>
          </p>
          <a
            href={whatsappLink(
              `Hello ${site.name}! I have a question about the ${product.name} (${size.name}).`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="link-rule mt-2 inline-block"
          >
            Ask the concierge
          </a>
        </Reveal>

        <Reveal y={20} delay={0.2} className="mt-10 divide-y hairline border-y hairline">
          {sections.map((section) => (
            <div key={section.key}>
              <button
                onClick={() => setOpenSection((cur) => (cur === section.key ? null : section.key))}
                aria-expanded={openSection === section.key}
                className="flex w-full items-center justify-between py-5 text-left text-[0.68rem] font-medium tracking-[0.18em] uppercase"
              >
                {section.label}
                <span className="font-display text-xl leading-none text-clay">
                  {openSection === section.key ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === section.key && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    {section.key === "details" && (
                      <li className="pb-4 text-sm leading-relaxed text-ink-soft">
                        {product.description}
                      </li>
                    )}
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 pb-3 text-sm leading-relaxed text-ink-soft">
                        <span aria-hidden className="text-clay">
                          ✦
                        </span>
                        {item}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}

function ReturnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 10h13a5 5 0 015 5v0a5 5 0 01-5 5h-6" strokeLinecap="round" />
      <path d="M7 6l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3.5 11h17v9.5h-17zM2.5 7.5h19V11h-19zM12 7.5v13" strokeLinejoin="round" />
      <path d="M12 7.5S10.5 3.5 8 3.5a2.2 2.2 0 0 0 0 4.4h4Zm0 0s1.5-4 4-4a2.2 2.2 0 0 1 0 4.4h-4Z" strokeLinejoin="round" />
    </svg>
  );
}
