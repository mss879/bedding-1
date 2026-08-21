"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * The dominant marketplace search — Etsy's centrepiece, at Etsy's proportions
 * (48px tall, 16px input, a nested square submit at the right end). Uses
 * useSearchParams to stay in sync with /shop?q=…, so the parent wraps it in
 * <Suspense> per Next.js requirements.
 */
export function HeaderSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  // Re-sync the box when the URL's q changes (e.g. related-search links).
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <form onSubmit={submit} role="search" className={`search-pill w-full ${compact ? "" : "h-12"}`}>
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search fragrance, pearls, linen…"
        aria-label="Search products"
        className="text-[0.95rem]"
      />
      <button
        type="submit"
        aria-label="Search"
        className={`flex shrink-0 items-center justify-center rounded-sm bg-ink text-white transition-colors hover:bg-clay ${
          compact ? "h-9 w-9" : "h-10 w-10"
        }`}
      >
        <SearchIcon className="h-4 w-4" />
      </button>
    </form>
  );
}

/** Non-interactive placeholder rendered while the live search hydrates. */
export function HeaderSearchFallback({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`search-pill w-full ${compact ? "" : "h-12"}`} aria-hidden>
      <input
        type="search"
        placeholder="Search fragrance, pearls, linen…"
        disabled
        className="cursor-default text-[0.95rem]"
      />
      <span
        className={`flex shrink-0 items-center justify-center rounded-sm bg-ink text-white ${
          compact ? "h-9 w-9" : "h-10 w-10"
        }`}
      >
        <SearchIcon className="h-4 w-4" />
      </span>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
    </svg>
  );
}
