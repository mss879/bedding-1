"use client";

import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

/**
 * Inside a collection the chip row lists that collection's sub-categories, so
 * moving to another collection is this compact switcher instead — styled like
 * the Sort control beside it. Changing it keeps the search and the filters but
 * drops the sub-category, which belonged to the collection being left.
 */
export function CollectionSelect({
  categories,
  category,
  carry,
}: {
  categories: Category[];
  category?: string;
  /** Query parameters to keep: q, sort, price, materials, colours, stock. */
  carry: Record<string, string | undefined>;
}) {
  const router = useRouter();

  const onChange = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("category", value);
    for (const [key, v] of Object.entries(carry)) if (v) params.set(key, v);
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Collection</span>
      <select
        value={category ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Collection"
        /* The current collection is the active choice, so it wears the
           active chip's ink. 16px on phones so iOS does not zoom the page. */
        className="max-w-[15.5rem] cursor-pointer appearance-none truncate rounded-full border border-ink bg-ink py-2 pl-4 pr-9 text-base text-white transition-colors hover:bg-ink-soft md:text-[0.8rem]"
      >
        <option value="" className="bg-white text-ink">
          All collections
        </option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug} className="bg-white text-ink">
            {c.name}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 h-2.5 w-2.5 text-white"
        viewBox="0 0 10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden
      >
        <path d="M1.5 3.5 5 7l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}
