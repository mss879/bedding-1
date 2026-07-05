"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * The Etsy-style search pill. Uses useSearchParams (to stay in sync with
 * /shop?q=…), so the parent wraps it in <Suspense> per Next.js requirements.
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
    <form onSubmit={submit} role="search" className="search-pill flex w-full">
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for anything cosy"
        aria-label="Search products"
      />
      <button
        type="submit"
        aria-label="Search"
        className={`flex shrink-0 items-center justify-center rounded-full bg-clay text-white transition-colors hover:bg-clay-dark ${
          compact ? "h-10 w-10" : "h-11 w-11"
        }`}
      >
        <SearchIcon className={compact ? "h-4.5 w-4.5" : "h-5 w-5"} />
      </button>
    </form>
  );
}

/** Non-interactive placeholder rendered while the live search hydrates. */
export function HeaderSearchFallback({ compact = false }: { compact?: boolean }) {
  return (
    <div className="search-pill flex w-full" aria-hidden>
      <input type="search" placeholder="Search for anything cosy" disabled className="cursor-default" />
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-clay text-white ${
          compact ? "h-10 w-10" : "h-11 w-11"
        }`}
      >
        <SearchIcon className={compact ? "h-4.5 w-4.5" : "h-5 w-5"} />
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
