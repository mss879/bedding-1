"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/types";
import { formatPrice, site, whatsappLink } from "@/lib/site";
import { productRating } from "@/lib/ratings";
import { Stars } from "@/components/Stars";
import { useCart } from "@/components/cart/CartContext";
import { Reveal } from "@/components/anim/Reveal";

const FREE_DELIVERY_FROM = 15000;

/**
 * Etsy-style listing page module: thumbnail rail + rounded gallery on the
 * left, buy box on the right in Etsy's exact order — urgency, price, title,
 * shop line, variation selects, black Add-to-cart + outlined Buy-it-now,
 * signal rows, accordions.
 */
export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<"details" | "care" | "shipping" | null>(
    "details"
  );

  const size = product.sizes[sizeIndex];
  const { rating, count } = productRating(product.slug);
  const carts = 4 + (count % 17); // deterministic "in demand" social proof
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
    { key: "details" as const, label: "Item details", items: product.details },
    { key: "care" as const, label: "Care instructions", items: product.care },
    {
      key: "shipping" as const,
      label: "Shipping & returns",
      items: [
        "Ships island-wide from our Colombo workshop in 2–4 working days",
        `FREE delivery on orders over ${formatPrice(25000)}`,
        "365-day guarantee — live with it, then decide",
        "Exchanges accepted within 30 days, unused and in original condition",
      ],
    },
  ];

  return (
    <div className="container-x grid gap-10 pb-20 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      {/* Gallery */}
      <div className="flex flex-col gap-3 lg:flex-row">
        {/* Thumbnail rail — left on desktop, below on mobile */}
        {product.images.length > 1 && (
          <div className="no-scrollbar order-2 flex gap-2.5 overflow-x-auto lg:order-1 lg:w-16 lg:flex-col lg:overflow-visible">
            {product.images.map((image, i) => (
              <button
                key={image}
                onClick={() => setActiveImage(i)}
                onMouseEnter={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg transition-all ${
                  i === activeImage
                    ? "ring-2 ring-ink ring-offset-2 ring-offset-cream"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={image} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="relative order-1 flex-1 lg:order-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-sand shadow-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {product.badge && (
              <span className="badge-img absolute left-4 top-4 z-10">{product.badge}</span>
            )}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => gallery(-1)}
                  aria-label="Previous image"
                  className="arrow-btn absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2"
                >
                  ‹
                </button>
                <button
                  onClick={() => gallery(1)}
                  aria-label="Next image"
                  className="arrow-btn absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Buy box */}
      <div>
        <Reveal y={20}>
          <p className="text-[0.82rem] font-semibold text-clay-dark">
            In demand. {carts} people have this in their carts right now.
          </p>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5">
            <span className={`text-3xl font-semibold ${discount > 0 ? "text-sale" : "text-ink"}`}>
              {formatPrice(size.price)}
              {product.sizes.length > 1 ? "+" : ""}
            </span>
            {size.compare_at_price && (
              <>
                <span className="text-lg text-fog line-through">
                  {formatPrice(size.compare_at_price)}
                </span>
                <span className="text-sm font-semibold text-sale">({discount}% off)</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-soft">Local taxes included where applicable</p>

          <h1 className="mt-4 font-display text-3xl leading-snug md:text-4xl">{product.name}</h1>

          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-medium lowercase text-clay">{site.name}</span>
            <Stars rating={rating} count={count} size={14} />
            <span className="badge-img bg-accent-tint text-clay-dark">★ Star Seller</span>
          </p>

          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.short_description}</p>
          <p className="mt-1.5 text-sm text-ink-soft">
            <span className="font-medium text-ink">Material:</span> {product.material}
          </p>
        </Reveal>

        <Reveal y={20} delay={0.08} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Size{" "}
              <span className="font-normal text-ink-soft">({size.dimensions})</span>
            </span>
            <select
              value={sizeIndex}
              onChange={(e) => setSizeIndex(Number(e.target.value))}
              className="field cursor-pointer"
            >
              {product.sizes.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name} — {formatPrice(s.price)}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-4">
            <label className="block w-28">
              <span className="mb-1.5 block text-sm font-medium">Quantity</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="field cursor-pointer"
              >
                {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            {product.colors.length > 0 && (
              <p className="flex-1 self-end pb-1 text-xs leading-relaxed text-ink-soft">
                Colours: {product.colors.join(" · ")} — confirm yours on WhatsApp after ordering.
              </p>
            )}
          </div>
        </Reveal>

        <Reveal y={20} delay={0.12} className="mt-6 flex flex-col gap-3">
          {product.in_stock ? (
            <>
              <button
                onClick={() => {
                  addItem(cartItem(), quantity);
                }}
                className="btn btn-solid w-full"
              >
                Add to cart — {formatPrice(size.price * quantity)}
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
              <button disabled className="btn btn-solid w-full cursor-not-allowed opacity-60">
                Sold out
              </button>
              <a
                href={whatsappLink(
                  `Hello ${site.name}! Please let me know when the ${product.name} (${size.name}) is back in stock.`
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

        <Reveal y={20} delay={0.16} className="mt-6 space-y-2.5 text-sm">
          <p className="flex items-start gap-2.5">
            <TruckIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ink-soft" />
            <span>
              <strong className="font-medium">Arrives soon!</strong> Ships in 2–4 working days if
              you order today.
            </span>
          </p>
          <p className="flex items-start gap-2.5">
            <ReturnIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ink-soft" />
            <span>365-day guarantee &amp; 30-day exchanges</span>
          </p>
          {size.price >= FREE_DELIVERY_FROM && (
            <p className="flex items-start gap-2.5 font-medium text-sale">
              <TruckIcon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              FREE delivery island-wide
            </p>
          )}
          <a
            href={whatsappLink(
              `Hello ${site.name}! I have a question about the ${product.name} (${size.name}).`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-clay underline-offset-4 hover:underline"
          >
            Message us about this item
          </a>
        </Reveal>

        <Reveal y={20} delay={0.2} className="mt-7 divide-y hairline border-y hairline">
          {sections.map((section) => (
            <div key={section.key}>
              <button
                onClick={() =>
                  setOpenSection((cur) => (cur === section.key ? null : section.key))
                }
                aria-expanded={openSection === section.key}
                className="flex w-full items-center justify-between py-4 text-left text-[0.95rem] font-medium"
              >
                {section.label}
                <span className="font-display text-xl leading-none text-ink-soft">
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
                      <li className="pb-3 text-sm leading-relaxed text-ink-soft">
                        {product.description}
                      </li>
                    )}
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 pb-3 text-sm leading-relaxed text-ink-soft"
                      >
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

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}

function ReturnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 10h13a5 5 0 015 5v0a5 5 0 01-5 5h-6" strokeLinecap="round" />
      <path d="M7 6l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
