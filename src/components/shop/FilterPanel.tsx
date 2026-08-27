"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Materials are matched as case-insensitive SUBSTRINGS of `product.material`,
 * and colours as exact (lowercased) matches against `product.colors`. Both
 * lists are derived from the catalog in lib/seed-data.ts — keep them in step
 * when products change, or a filter will quietly return nothing.
 */
const MATERIALS = [
  "Parfum",
  "Silk",
  "Linen",
  "Cotton",
  "Pearls",
  "Gold",
  "Sapphire",
  "Stoneware",
  "Teak",
  "Rattan",
  "Leather",
  "Travertine",
  "Down",
];

const COLOR_MAP: Record<string, { hex: string; border?: boolean }> = {
  ivory: { hex: "#F7F3EC", border: true },
  cream: { hex: "#F0E8DA", border: true },
  "pearl white": { hex: "#F6F2EA", border: true },
  champagne: { hex: "#E4D2B4" },
  oat: { hex: "#DFD4C3" },
  natural: { hex: "#D6C8B2" },
  blush: { hex: "#E7CFC7" },
  gold: { hex: "#B8912F" },
  tan: { hex: "#B08256" },
  sage: { hex: "#A2AC97" },
  "dusty blue": { hex: "#9DB2C0" },
  "sapphire blue": { hex: "#2F5C8F" },
  moonstone: { hex: "#CBD6DC" },
  default: { hex: "#EFECEA" },
};

const AVAILABLE_COLORS = [
  "Ivory",
  "Cream",
  "Pearl White",
  "Champagne",
  "Oat",
  "Natural",
  "Blush",
  "Gold",
  "Tan",
  "Sage",
  "Dusty Blue",
  "Sapphire Blue",
  "Moonstone",
];

export function FilterPanel({
  category,
  q,
  sort,
  sale,
  minPrice,
  maxPrice,
  materials,
  colors,
  inStock,
}: {
  category?: string;
  q?: string;
  sort?: string;
  sale?: boolean;
  minPrice?: string;
  maxPrice?: string;
  materials?: string;
  colors?: string;
  inStock?: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [localMin, setLocalMin] = useState(minPrice || "");
  const [localMax, setLocalMax] = useState(maxPrice || "");
  const [localInStock, setLocalInStock] = useState(!!inStock);
  const [selectedMats, setSelectedMats] = useState<string[]>(materials ? materials.split(",") : []);
  const [selectedColors, setSelectedColors] = useState<string[]>(colors ? colors.split(",") : []);

  let activeCount = 0;
  if (minPrice) activeCount++;
  if (maxPrice) activeCount++;
  if (inStock) activeCount++;
  if (materials) activeCount += materials.split(",").length;
  if (colors) activeCount += colors.split(",").length;

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const baseParams = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (sale) params.set("sale", "1");
    return params;
  };

  const handleApply = () => {
    const params = baseParams();
    if (localMin.trim()) params.set("minPrice", localMin.trim());
    if (localMax.trim()) params.set("maxPrice", localMax.trim());
    if (localInStock) params.set("inStock", "1");
    if (selectedMats.length) params.set("materials", selectedMats.join(","));
    if (selectedColors.length) params.set("colors", selectedColors.join(","));
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalMin("");
    setLocalMax("");
    setLocalInStock(false);
    setSelectedMats([]);
    setSelectedColors([]);
    const qs = baseParams().toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
    setIsOpen(false);
  };

  return (
    <div className="relative z-20 w-full sm:w-auto">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`chip ${isOpen || activeCount > 0 ? "chip-active" : ""}`}
      >
        <FilterIcon className="h-3.5 w-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-white px-1 text-[0.65rem] font-semibold text-ink">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-3 w-[min(46rem,calc(100vw-2.5rem))] rounded-sm border hairline bg-white p-6 shadow-pop md:p-8">
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h3 className="eyebrow">Price</h3>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Min"
                    aria-label="Minimum price"
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="field pl-9"
                  />
                </div>
                <span className="text-sm text-ink-soft">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Max"
                    aria-label="Maximum price"
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="field pl-9"
                  />
                </div>
              </div>

              <h3 className="eyebrow mt-4">Material</h3>
              <div className="flex flex-wrap gap-2">
                {MATERIALS.map((mat) => {
                  const key = mat.toLowerCase();
                  const active = selectedMats.includes(key);
                  return (
                    <button
                      key={mat}
                      onClick={() => toggle(selectedMats, setSelectedMats, key)}
                      aria-pressed={active}
                      className={`rounded-full px-3.5 py-1.5 text-[0.72rem] tracking-wide transition-colors ${
                        active ? "bg-ink text-white" : "bg-sand text-ink hover:bg-board"
                      }`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="eyebrow">Colour</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {AVAILABLE_COLORS.map((colorName) => {
                  const key = colorName.toLowerCase();
                  const cfg = COLOR_MAP[key] || COLOR_MAP.default;
                  const active = selectedColors.includes(key);
                  return (
                    <button
                      key={colorName}
                      onClick={() => toggle(selectedColors, setSelectedColors, key)}
                      aria-pressed={active}
                      className="group flex items-center gap-2.5 text-left text-[0.78rem]"
                    >
                      <span
                        className={`h-4 w-4 rounded-full border transition-all ${
                          cfg.border ? "border-board" : "border-transparent"
                        } ${active ? "ring-1 ring-ink ring-offset-2" : "group-hover:scale-110"}`}
                        style={{ backgroundColor: cfg.hex }}
                      />
                      <span className={active ? "font-medium text-ink" : "text-ink-soft group-hover:text-ink"}>
                        {colorName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t hairline pt-5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={localInStock}
                onChange={(e) => setLocalInStock(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-[var(--color-ink)]"
              />
              In stock only
            </label>
            <div className="flex gap-2">
              <button onClick={handleReset} className="btn btn-sm btn-tint">
                Clear all
              </button>
              <button onClick={handleApply} className="btn btn-sm btn-solid">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
      <circle cx="17" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
