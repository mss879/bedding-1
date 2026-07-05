"use client";

import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Lowest price" },
  { value: "price_desc", label: "Highest price" },
  { value: "rating", label: "Top customer reviews" },
];

export function SortSelect({
  category,
  q,
  sale,
  sort,
}: {
  category?: string;
  q?: string;
  sale?: boolean;
  sort?: string;
}) {
  const router = useRouter();

  const onChange = (value: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (sale) params.set("sale", "1");
    if (value !== "relevance") params.set("sort", value);
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  return (
    <label className="flex items-center gap-2 text-sm text-ink-soft">
      Sort by:
      <select
        value={sort && OPTIONS.some((o) => o.value === sort) ? sort : "relevance"}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-full border border-board bg-white py-2 pl-3.5 pr-8 text-sm font-medium text-ink transition-colors hover:border-ink"
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
