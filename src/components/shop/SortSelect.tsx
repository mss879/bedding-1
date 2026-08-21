"use client";

import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "relevance", label: "Featured" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
  { value: "rating", label: "Top rated" },
];

export function SortSelect({
  category,
  q,
  sale,
  sort,
  minPrice,
  maxPrice,
  materials,
  colors,
  inStock,
}: {
  category?: string;
  q?: string;
  sale?: boolean;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  materials?: string;
  colors?: string;
  inStock?: boolean;
}) {
  const router = useRouter();

  // Sorting must preserve every active filter, or changing the order silently
  // resets the shopper's price/material/colour choices.
  const onChange = (value: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (sale) params.set("sale", "1");
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (materials) params.set("materials", materials);
    if (colors) params.set("colors", colors);
    if (inStock) params.set("inStock", "1");
    if (value !== "relevance") params.set("sort", value);
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  return (
    <label className="flex items-center gap-2 text-[0.72rem] tracking-wide text-ink-soft">
      <span className="hidden sm:inline">Sort</span>
      <select
        value={sort && OPTIONS.some((o) => o.value === sort) ? sort : "relevance"}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort products"
        className="cursor-pointer rounded-full border border-board bg-white py-2 pl-3.5 pr-8 text-[0.78rem] text-ink transition-colors hover:border-ink"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
