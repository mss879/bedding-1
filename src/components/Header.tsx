"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Category } from "@/lib/types";
import { site, whatsappLink } from "@/lib/site";
import { HeaderSearch, HeaderSearchFallback } from "./HeaderSearch";
import { useCart } from "./cart/CartContext";

/**
 * Etsy-style chrome: white sticky header — logo, Categories dropdown,
 * dominant pill search, circular icon targets — with a centered
 * category-links row below on desktop and a drawer menu on mobile.
 */
export function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

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

  const subNav = [
    { href: "/shop", label: "Bestsellers" },
    ...categories.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name })),
    { href: "/hotel-bulk", label: "Hotel & Bulk" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-lift" : "shadow-[0_1px_0_var(--color-board)]"
      }`}
    >
      <div className="container-x flex items-center gap-2 py-2.5 md:gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 pr-1" aria-label={`${site.name} home`}>
          <span className="font-display text-[1.9rem] font-semibold lowercase leading-none text-clay">
            {site.name}
          </span>
        </Link>

        {/* Categories dropdown (desktop) */}
        <div ref={catsRef} className="relative hidden lg:block">
          <button
            onClick={() => setCatsOpen((v) => !v)}
            aria-expanded={catsOpen}
            aria-haspopup="true"
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
              catsOpen ? "bg-ink text-white" : "hover:bg-ink/5"
            }`}
          >
            <BurgerIcon className="h-4 w-4" />
            Categories
          </button>
          <AnimatePresence>
            {catsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute left-0 top-[calc(100%+10px)] w-[560px] rounded-2xl border hairline bg-white p-4 shadow-pop"
              >
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/shop?category=${c.slug}`}
                      onClick={() => setCatsOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-cream"
                    >
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-sand">
                        <Image src={c.image} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{c.name}</span>
                        <span className="mt-0.5 line-clamp-1 block text-xs text-ink-soft">
                          {c.description}
                        </span>
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/shop"
                    onClick={() => setCatsOpen(false)}
                    className="flex items-center gap-3 rounded-xl p-2.5 text-sm font-semibold text-clay transition-colors hover:bg-cream"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-tint">
                      →
                    </span>
                    Shop everything
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search pill (desktop) */}
        <div className="hidden flex-1 md:block">
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
            <WhatsAppIcon className="h-5 w-5" />
          </a>
          <Link
            href="/shop?category=bedding-sets"
            aria-label="Gift-ready bedding sets"
            title="Gift-ready bedding sets"
            className="icon-btn hidden md:inline-flex"
          >
            <GiftIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={openCart}
            aria-label={`Open cart, ${count} items`}
            className="icon-btn relative"
          >
            <CartIcon className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-clay px-1 text-[0.62rem] font-semibold text-white">
                {count}
              </span>
            )}
          </button>
          <button
            className="icon-btn lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="flex flex-col gap-[5px]">
              <span
                className={`block h-[1.5px] w-5 bg-current transition-transform duration-300 ${menuOpen ? "translate-y-[3.25px] rotate-45" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-5 bg-current transition-transform duration-300 ${menuOpen ? "-translate-y-[3.25px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Search pill (mobile row) */}
      <div className="container-x pb-2.5 md:hidden">
        <Suspense fallback={<HeaderSearchFallback compact />}>
          <HeaderSearch compact />
        </Suspense>
      </div>

      {/* Category links row (desktop) */}
      <nav
        aria-label="Categories"
        className="hidden items-center justify-center gap-1 border-t hairline pb-2 pt-1.5 lg:flex"
      >
        {subNav.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-full px-3.5 py-1.5 text-[0.84rem] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>

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
              {[{ href: "/shop", label: "Shop everything" }, ...subNav.slice(1, -1), { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }].map(
                (item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      className="block rounded-xl px-3 py-3 text-lg font-medium hover:bg-cream"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                )
              )}
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

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v7.2a1 1 0 001 1h12a1 1 0 001-1V12M12 8v12M12 8s-4.2.2-5.4-1.4C5.6 5.2 6.8 3.5 8.4 3.5c2.2 0 3.6 4.5 3.6 4.5zm0 0s4.2.2 5.4-1.4c1-1.4-.2-3.1-1.8-3.1-2.2 0-3.6 4.5-3.6 4.5z" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
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
