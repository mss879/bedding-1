"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Category, Subcategory } from "@/lib/types";
import type { CollectionPage } from "@/lib/collection-art";
import { site, whatsappLink, formatPrice, FREE_DELIVERY_FROM } from "@/lib/site";
import { HeaderSearch, HeaderSearchFallback } from "./HeaderSearch";
import { useCart } from "./cart/CartContext";

// Shared by the collection toggles and About us in the second row.
const navLinkClass =
  "whitespace-nowrap px-2.5 py-3 text-[0.62rem] font-medium tracking-[0.1em] uppercase transition-colors xl:px-3.5 xl:text-[0.68rem] xl:tracking-[0.14em]";

/** What a collection's panel lists: its stocked sub-categories, then any editorial pages. */
export type HeaderMenuEntry = {
  subcategories: Subcategory[];
  pages: CollectionPage[];
  /** The collection's wide banner, cropped into the panel's photograph. */
  banner: string;
  tagline: string;
};

export type HeaderMenu = Record<string, HeaderMenuEntry>;

/**
 * Etsy's header structure in Enivrant dress (measured from etsy.com):
 * one row — logo far left, a DOMINANT search field taking ~64% of the width,
 * then icons far right — over a second row of centred collection names. The
 * six collections ARE the navigation: no single "Collections" button stands in
 * front of them (client request, Aug 2026).
 *
 * Each name opens its collection's panel — the sub-categories, the editorial
 * pages and a photograph — on CLICK, never on hover (client request, Oct
 * 2026: a panel that appeared whenever the pointer crossed the bar got in the
 * way of everything else on the page). It closes on a second click, a click
 * anywhere else, Escape, or choosing a link. It fades; it does not slide.
 * A collection with nothing to list stays a plain link to its shop page.
 */
export function Header({
  categories,
  menu = {},
}: {
  categories: Category[];
  /** category slug → what that collection's panel lists */
  menu?: HeaderMenu;
}) {
  const pathname = usePathname();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaSlug, setMegaSlug] = useState<string | null>(null);
  const [drawerSection, setDrawerSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close panels when the route changes (covers back/forward navigation).
  // A change of query string alone — one collection's shop page to another's
  // — keeps the same pathname, so every link in a panel also closes it itself.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setMegaSlug(null);
  }

  // While a panel is open: a press anywhere outside the collection row and the
  // panel closes it, and so does Escape, which hands focus back to the name
  // that opened it.
  useEffect(() => {
    if (!megaSlug) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (navRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setMegaSlug(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMegaSlug(null);
      document.getElementById(`nav-collection-${megaSlug}`)?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [megaSlug]);

  const entriesOf = (slug: string) => {
    const entry = menu[slug];
    return entry ? entry.subcategories.length + entry.pages.length : 0;
  };

  const activeMega = categories.find((c) => c.slug === megaSlug) ?? null;
  const activeEntry = activeMega ? menu[activeMega.slug] : undefined;
  const closeMega = () => setMegaSlug(null);
  const closeAll = () => {
    setMegaSlug(null);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement rail. On a phone the sticky header is already eating a
          fifth of the screen, so the rail carries a short line and rolls itself
          up the moment the page is scrolled; on desktop it always stays. */}
      <div
        className={`overflow-hidden bg-ink text-linen transition-[max-height] duration-300 ease-out ${
          scrolled ? "max-h-0 lg:max-h-12" : "max-h-12"
        }`}
      >
        <p className="container-x py-2 text-center text-[0.56rem] font-medium tracking-[0.16em] uppercase xs:text-[0.62rem] xs:tracking-[0.22em]">
          <span className="sm:hidden">Free delivery over {formatPrice(FREE_DELIVERY_FROM)}</span>
          <span className="hidden sm:inline">
            Complimentary island-wide delivery over {formatPrice(FREE_DELIVERY_FROM)}
            <span aria-hidden className="mx-3 text-linen/40">
              ·
            </span>
            Gift wrapping on every order
          </span>
        </p>
      </div>

      <div
        className={`bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-lift" : "shadow-[0_1px_0_var(--color-board)]"
        }`}
      >
        {/* Row 1 — logo · dominant search · icons */}
        <div className="container-x flex items-center gap-3 py-2.5 md:py-3.5 lg:gap-5">
          <Link
            href="/"
            className="flex shrink-0 items-center py-2.5"
            aria-label={`${site.name} home`}
          >
            <Image
              src="/brand/enivrant-wordmark.png"
              alt={site.nameUpper}
              width={1002}
              height={155}
              preload
              className="h-[17px] w-auto md:h-[21px]"
            />
          </Link>

          {/* Dominant search — Etsy's centrepiece (~64% of the row) */}
          <div className="hidden min-w-0 flex-1 md:block">
            <Suspense fallback={<HeaderSearchFallback />}>
              <HeaderSearch />
            </Suspense>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0">
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
        <div className="container-x pb-2.5 md:hidden">
          <Suspense fallback={<HeaderSearchFallback compact />}>
            <HeaderSearch compact />
          </Suspense>
        </div>

        {/* Row 2 — the six collections under their full names, each opening
            its panel on click, then About us behind a hairline (client
            request, Sep 2026). Long names, so the type tightens at lg and
            opens back up at xl where there is room. */}
        <nav
          ref={navRef}
          aria-label="Main"
          className="relative hidden items-center justify-center gap-0 border-t hairline lg:flex"
        >
          {categories.map((c) => {
            const open = megaSlug === c.slug;
            const tone = open ? "text-clay" : "text-ink-soft hover:text-clay";
            if (entriesOf(c.slug) === 0) {
              return (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  onClick={closeMega}
                  className={`${navLinkClass} ${tone}`}
                >
                  {c.name}
                </Link>
              );
            }
            return (
              <button
                key={c.slug}
                id={`nav-collection-${c.slug}`}
                type="button"
                aria-expanded={open}
                aria-controls="collection-panel"
                onClick={() => setMegaSlug((cur) => (cur === c.slug ? null : c.slug))}
                className={`${navLinkClass} ${tone} inline-flex cursor-pointer items-center gap-1.5`}
              >
                {c.name}
                <ChevronDown
                  className={`h-2 w-2 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
              </button>
            );
          })}
          <span aria-hidden className="mx-1 h-3 w-px bg-board xl:mx-2" />
          <Link
            href="/about"
            onClick={closeMega}
            aria-current={pathname === "/about" ? "page" : undefined}
            className={`${navLinkClass} ${
              pathname === "/about" ? "text-clay" : "text-ink-soft hover:text-clay"
            }`}
          >
            About us
          </Link>
        </nav>
      </div>

      {/* Collection panel — opacity only, so nothing slides in under the pointer */}
      <AnimatePresence>
        {activeMega && activeEntry && (
          <motion.div
            key="collection-panel"
            ref={panelRef}
            id="collection-panel"
            role="region"
            aria-label={activeMega.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-x-0 top-full hidden border-t hairline bg-white shadow-pop lg:block"
          >
            <div className="container-x grid grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)_minmax(0,0.85fr)] gap-10 py-9 xl:gap-14">
              <div>
                <p className="eyebrow">{activeMega.name}</p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
                  {activeMega.description}
                </p>
                <Link
                  href={`/shop?category=${activeMega.slug}`}
                  onClick={closeMega}
                  className="link-rule mt-6 inline-block"
                >
                  Explore the collection
                </Link>
              </div>

              <ul
                className={`grid content-start gap-x-6 gap-y-3 ${
                  activeEntry.subcategories.length + activeEntry.pages.length > 6
                    ? "grid-cols-3"
                    : "grid-cols-2"
                }`}
              >
                {activeEntry.subcategories.map((s) => (
                  <li key={s.slug}>
                    <PanelLink
                      href={`/shop?category=${activeMega.slug}&sub=${s.slug}`}
                      image={s.image || activeMega.image}
                      name={s.name}
                      onNavigate={closeMega}
                    />
                  </li>
                ))}
                {activeEntry.pages.map((page) => (
                  <li key={page.href}>
                    <PanelLink
                      href={page.href}
                      image={page.image}
                      name={page.name}
                      label="Feature"
                      onNavigate={closeMega}
                    />
                  </li>
                ))}
              </ul>

              <Link
                href={`/shop?category=${activeMega.slug}`}
                onClick={closeMega}
                tabIndex={-1}
                aria-hidden
                className="group block"
              >
                <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-sand">
                  <Image
                    src={activeEntry.banner}
                    alt=""
                    fill
                    sizes="280px"
                    className="object-cover object-[70%_50%] transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </span>
                <span className="mt-3 block font-display text-[1.05rem] italic leading-snug text-clay">
                  {activeEntry.tagline}
                </span>
              </Link>
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
            {/* Capped and scrollable so the drawer still works on a short
                phone in landscape, where the list overflows the viewport. */}
            <div className="container-x flex max-h-[calc(100svh-8rem)] flex-col gap-0.5 overflow-y-auto py-4">
              <DrawerRow index={0}>
                <Link href="/shop" className={drawerLinkClass} onClick={closeAll}>
                  Shop everything
                </Link>
              </DrawerRow>

              {categories.map((c, i) => {
                const entry = menu[c.slug];
                if (!entry || entriesOf(c.slug) === 0) {
                  return (
                    <DrawerRow key={c.slug} index={i + 1}>
                      <Link href={`/shop?category=${c.slug}`} className={drawerLinkClass} onClick={closeAll}>
                        {c.name}
                      </Link>
                    </DrawerRow>
                  );
                }
                const open = drawerSection === c.slug;
                return (
                  <DrawerRow key={c.slug} index={i + 1}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`drawer-${c.slug}`}
                      onClick={() => setDrawerSection((cur) => (cur === c.slug ? null : c.slug))}
                      className={`${drawerLinkClass} flex w-full items-center justify-between text-left`}
                    >
                      {c.name}
                      <ChevronDown
                        className={`h-3 w-3 shrink-0 text-clay transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.ul
                          id={`drawer-${c.slug}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden border-l hairline ml-3 pl-3"
                        >
                          <li>
                            <Link href={`/shop?category=${c.slug}`} className={drawerSubClass} onClick={closeAll}>
                              All {c.name}
                            </Link>
                          </li>
                          {entry.subcategories.map((s) => (
                            <li key={s.slug}>
                              <Link
                                href={`/shop?category=${c.slug}&sub=${s.slug}`}
                                className={drawerSubClass}
                                onClick={closeAll}
                              >
                                {s.name}
                              </Link>
                            </li>
                          ))}
                          {entry.pages.map((page) => (
                            <li key={page.href}>
                              <Link href={page.href} className={drawerSubClass} onClick={closeAll}>
                                {page.name}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </DrawerRow>
                );
              })}

              {[
                { href: "/hotel-bulk", label: "Hotel & Trade" },
                { href: "/about", label: "About us" },
                { href: "/contact", label: "Contact" },
              ].map((item, i) => (
                <DrawerRow key={item.label} index={categories.length + 1 + i}>
                  <Link href={item.href} className={drawerLinkClass} onClick={closeAll}>
                    {item.label}
                  </Link>
                </DrawerRow>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

const drawerLinkClass = "block rounded-sm px-3 py-3 font-display text-xl hover:bg-cream";
const drawerSubClass =
  "block rounded-sm px-3 py-2.5 text-[0.95rem] text-ink-soft transition-colors hover:bg-cream hover:text-clay";

/** One row of the mobile drawer, easing in after the one above it. */
function DrawerRow({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 + index * 0.035 }}
    >
      {children}
    </motion.div>
  );
}

/** A sub-category or page in a collection panel: a small square photograph and its name. */
function PanelLink({
  href,
  image,
  name,
  label,
  onNavigate,
}: {
  href: string;
  image: string;
  name: string;
  label?: string;
  onNavigate: () => void;
}) {
  return (
    <Link href={href} onClick={onNavigate} className="group flex items-center gap-3.5 py-1">
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-sand">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="56px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          />
        )}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[1.02rem] leading-snug transition-colors group-hover:text-clay">
          {name}
        </span>
        {label && (
          <span className="mt-0.5 block text-[0.56rem] font-medium tracking-[0.2em] uppercase text-clay">
            {label}
          </span>
        )}
      </span>
    </Link>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M1.5 3.5 5 7l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
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
