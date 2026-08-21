"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Category, Product } from "@/lib/types";
import { site, whatsappLink, formatPrice } from "@/lib/site";
import { collectionNavLabel } from "@/lib/collection-art";
import { HeaderSearch, HeaderSearchFallback } from "./HeaderSearch";
import { useCart } from "./cart/CartContext";

/**
 * Etsy's header structure in Enivrant dress (measured from etsy.com):
 * one row — logo far left, a "Collections" button beside it, a DOMINANT search
 * field taking ~64% of the width, then icons far right — over a second row of
 * centred collection links, each opening a mega panel on hover.
 */
export function Header({
  categories,
  menuProducts = {},
}: {
  categories: Category[];
  /** category slug → a few products, shown inside that collection's mega panel */
  menuProducts?: Record<string, Product[]>;
}) {
  const pathname = usePathname();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [megaSlug, setMegaSlug] = useState<string | null>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close panels when the route changes (covers back/forward navigation).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setCatsOpen(false);
    setMegaSlug(null);
  }

  useEffect(() => {
    if (!catsOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCatsOpen(false);
    const onClick = (e: MouseEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setCatsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [catsOpen]);

  useEffect(() => () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
  }, []);

  // A small close delay keeps the panel alive while the pointer crosses the gap
  // between the link and the panel itself.
  const openMega = (slug: string) => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMegaSlug(slug);
  };
  const closeMega = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setMegaSlug(null), 140);
  };

  const activeMega = categories.find((c) => c.slug === megaSlug) ?? null;

  return (
    <header className="sticky top-0 z-40" onMouseLeave={closeMega}>
      {/* Announcement rail */}
      <div className="bg-ink text-linen">
        <p className="container-x py-2 text-center text-[0.62rem] font-medium tracking-[0.22em] uppercase">
          Complimentary island-wide delivery over Rs 25,000
          <span aria-hidden className="mx-3 text-linen/40">
            ·
          </span>
          <span className="hidden sm:inline">Gift wrapping on every order</span>
        </p>
      </div>

      <div
        className={`bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-lift" : "shadow-[0_1px_0_var(--color-board)]"
        }`}
      >
        {/* Row 1 — logo · collections · dominant search · icons */}
        <div className="container-x flex items-center gap-3 py-3.5 lg:gap-5">
          <Link href="/" className="shrink-0" aria-label={`${site.name} home`}>
            <Image
              src="/brand/enivrant-wordmark.png"
              alt={site.nameUpper}
              width={1002}
              height={155}
              preload
              className="h-[17px] w-auto md:h-[21px]"
            />
          </Link>

          {/* Collections button (desktop) */}
          <div ref={catsRef} className="relative hidden shrink-0 lg:block">
            <button
              onClick={() => setCatsOpen((v) => !v)}
              aria-expanded={catsOpen}
              aria-haspopup="true"
              className={`flex items-center gap-2 rounded-sm px-3 py-2.5 text-[0.66rem] font-medium tracking-[0.14em] uppercase transition-colors ${
                catsOpen ? "bg-ink text-white" : "hover:bg-ink/5"
              }`}
            >
              <BurgerIcon className="h-3.5 w-3.5" />
              Collections
            </button>
            <AnimatePresence>
              {catsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 top-[calc(100%+12px)] w-[620px] rounded-sm border hairline bg-white p-4 shadow-pop"
                >
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/shop?category=${c.slug}`}
                        onClick={() => setCatsOpen(false)}
                        className="flex items-center gap-3.5 rounded-sm p-2.5 transition-colors hover:bg-cream"
                      >
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-sand">
                          <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-[1.05rem] leading-tight">
                            {c.name}
                          </span>
                          <span className="mt-1 line-clamp-1 block text-xs text-ink-soft">
                            {c.description}
                          </span>
                        </span>
                      </Link>
                    ))}
                    <Link
                      href="/shop"
                      onClick={() => setCatsOpen(false)}
                      className="flex items-center gap-3.5 rounded-sm p-2.5 transition-colors hover:bg-cream"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-accent-tint text-clay">
                        →
                      </span>
                      <span className="link-rule">Shop everything</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dominant search — Etsy's centrepiece (~64% of the row) */}
          <div className="hidden min-w-0 flex-1 md:block">
            <Suspense fallback={<HeaderSearchFallback />}>
              <HeaderSearch />
            </Suspense>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0">
            <Link
              href="/contact"
              className="mr-1.5 hidden text-[0.66rem] font-medium tracking-[0.14em] uppercase transition-colors hover:text-clay lg:inline"
            >
              Concierge
            </Link>
            <a
              href={whatsappLink(`Hello ${site.name}! I have a question.`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              title="Chat on WhatsApp"
              className="icon-btn hidden md:inline-flex"
            >
              <WhatsAppIcon className="h-[1.1rem] w-[1.1rem]" />
            </a>
            <Link href="/basket" aria-label={`Basket, ${count} items`} className="icon-btn relative">
              <BasketIcon className="h-[1.15rem] w-[1.15rem]" />
              {count > 0 && (
                <span className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[0.6rem] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              className="icon-btn lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="flex flex-col gap-[5px]">
                <span
                  className={`block h-[1px] w-5 bg-current transition-transform duration-300 ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`}
                />
                <span
                  className={`block h-[1px] w-5 bg-current transition-transform duration-300 ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Search on its own row below the logo (mobile) */}
        <div className="container-x pb-3 md:hidden">
          <Suspense fallback={<HeaderSearchFallback compact />}>
            <HeaderSearch compact />
          </Suspense>
        </div>

        {/* Row 2 — centred collection links, each with a mega panel on hover */}
        <nav
          aria-label="Collections"
          className="relative hidden items-center justify-center gap-1 border-t hairline lg:flex"
        >
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              onMouseEnter={() => openMega(c.slug)}
              onFocus={() => openMega(c.slug)}
              className={`whitespace-nowrap px-3.5 py-3 text-[0.68rem] font-medium tracking-[0.16em] uppercase transition-colors ${
                megaSlug === c.slug ? "text-clay" : "text-ink-soft hover:text-clay"
              }`}
            >
              {collectionNavLabel(c.slug, c.name)}
            </Link>
          ))}
          <Link
            href="/hotel-bulk"
            onMouseEnter={closeMega}
            className="whitespace-nowrap px-3.5 py-3 text-[0.68rem] font-medium tracking-[0.16em] uppercase text-ink-soft transition-colors hover:text-clay"
          >
            Hotel &amp; Trade
          </Link>
        </nav>
      </div>

      {/* Mega panel */}
      <AnimatePresence>
        {activeMega && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => openMega(activeMega.slug)}
            onMouseLeave={closeMega}
            className="absolute inset-x-0 top-full hidden border-t hairline bg-white shadow-pop lg:block"
          >
            <div className="container-x grid grid-cols-[1fr_2fr] gap-10 py-9">
              <div>
                <p className="eyebrow">{activeMega.name}</p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
                  {activeMega.description}
                </p>
                <Link href={`/shop?category=${activeMega.slug}`} className="link-rule mt-6 inline-block">
                  Shop the collection
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-5">
                {(menuProducts[activeMega.slug] ?? []).slice(0, 4).map((p) => (
                  <Link key={p.slug} href={`/product/${p.slug}`} className="group block">
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-sand">
                      <Image
                        src={p.images[0]}
                        alt=""
                        fill
                        sizes="180px"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                    </span>
                    <span className="mt-2.5 block truncate font-display text-[0.95rem] transition-colors group-hover:text-clay">
                      {p.name}
                    </span>
                    <span className="mt-0.5 block text-[0.75rem] text-ink-soft">
                      {p.sizes.length > 1 ? "From " : ""}
                      {formatPrice(p.sizes[0].price)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Mobile"
            className="overflow-hidden border-t hairline bg-white lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container-x flex flex-col gap-0.5 py-4">
              {[
                { href: "/shop", label: "Shop everything" },
                ...categories.map((c) => ({
                  href: `/shop?category=${c.slug}`,
                  label: c.name,
                })),
                { href: "/hotel-bulk", label: "Hotel & Trade" },
                { href: "/about", label: "The maison" },
                { href: "/contact", label: "Contact" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.035 }}
                >
                  <Link
                    href={item.href}
                    className="block rounded-sm px-3 py-3 font-display text-xl hover:bg-cream"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function BurgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function BasketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M6 7h12l1.2 12.2a1 1 0 0 1-1 1.1H5.8a1 1 0 0 1-1-1.1L6 7Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5a1.7 1.7 0 0 0 .3-.4.5.5 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.1 5 5 0 0 0 1 2.7 11.4 11.4 0 0 0 4.4 3.9 14.5 14.5 0 0 0 1.5.5 3.5 3.5 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}
