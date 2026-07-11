"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

const MATERIALS = ["Linen", "Cotton", "Sateen", "Percale", "Waffle"];

const COLOR_MAP: Record<string, { hex: string; border?: boolean }> = {
  "cloud white": { hex: "#F8F8F8", border: true },
  "oat": { hex: "#E8E2D9" },
  "sage": { hex: "#9CA998" },
  "terracotta": { hex: "#C27C65" },
  "charcoal": { hex: "#3A3A3A" },
  "clay": { hex: "#2b6580" },
  "olive": { hex: "#707A60" },
  "natural": { hex: "#D8CFCA" },
  "stone": { hex: "#8E8A85" },
  "ivory": { hex: "#FFFFF0", border: true },
  "dusk blue": { hex: "#7C95A3" },
  "ochre": { hex: "#CFA055" },
  "moss": { hex: "#5D7052" },
  "blush": { hex: "#E5C2C0" },
  "graphite": { hex: "#4D4D4D" },
  "oatmeal": { hex: "#E2D9CF" },
  "default": { hex: "#EFECEA" },
};

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
  allCategories,
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
  allCategories: Category[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Filter states
  const [localMin, setLocalMin] = useState(minPrice || "");
  const [localMax, setLocalMax] = useState(maxPrice || "");
  const [localInStock, setLocalInStock] = useState(!!inStock);
  const [selectedMats, setSelectedMats] = useState<string[]>(
    materials ? materials.split(",") : []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    colors ? colors.split(",") : []
  );

  // Compute active filters count
  let activeCount = 0;
  if (minPrice) activeCount++;
  if (maxPrice) activeCount++;
  if (inStock) activeCount++;
  if (materials) activeCount += materials.split(",").length;
  if (colors) activeCount += colors.split(",").length;

  const toggleMaterial = (mat: string) => {
    setSelectedMats((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (sale) params.set("sale", "1");

    if (localMin.trim()) params.set("minPrice", localMin.trim());
    if (localMax.trim()) params.set("maxPrice", localMax.trim());
    if (localInStock) params.set("inStock", "1");
    if (selectedMats.length > 0) params.set("materials", selectedMats.join(","));
    if (selectedColors.length > 0) params.set("colors", selectedColors.join(","));

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

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (sale) params.set("sale", "1");

    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
    setIsOpen(false);
  };

  const availableColors = [
    "Cloud White", "Oat", "Sage", "Terracotta", "Charcoal", 
    "Clay", "Olive", "Natural", "Stone", "Ivory", 
    "Dusk Blue", "Ochre", "Moss", "Blush", "Graphite", "Oatmeal"
  ];

  return (
    <div className="relative z-10 w-full">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
          isOpen || activeCount > 0
            ? "border-ink bg-ink text-white"
            : "border-board bg-white text-ink hover:border-ink"
        }`}
      >
        <FilterIcon className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className={`ml-1 flex h-5 min-w-5 items-center justify-center rounded-full text-[0.7rem] font-bold ${
            isOpen || activeCount > 0 ? "bg-white text-ink" : "bg-ink text-white"
          } px-1.5`}>
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-3 rounded-2xl border border-board bg-parchment p-6 shadow-lift transition-all duration-300 md:p-8 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            
            {/* Price Filter */}
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-base text-ink">Price Range</h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">Rs.</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="w-full rounded-lg border border-board py-2 pl-9 pr-3 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
                <span className="text-ink-soft text-sm">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">Rs.</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="w-full rounded-lg border border-board py-2 pl-9 pr-3 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Material Filter */}
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-base text-ink">Material</h3>
              <div className="flex flex-wrap gap-2">
                {MATERIALS.map((mat) => {
                  const active = selectedMats.includes(mat.toLowerCase());
                  return (
                    <button
                      key={mat}
                      onClick={() => toggleMaterial(mat.toLowerCase())}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "bg-ink text-white"
                          : "bg-sand hover:bg-board text-ink"
                      }`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Filter */}
            <div className="sm:col-span-2 flex flex-col gap-3">
              <h3 className="font-display text-base text-ink">Colors</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                {availableColors.map((colorName) => {
                  const key = colorName.toLowerCase();
                  const colorConfig = COLOR_MAP[key] || COLOR_MAP.default;
                  const active = selectedColors.includes(key);
                  return (
                    <button
                      key={colorName}
                      onClick={() => toggleColor(key)}
                      className="flex items-center gap-2 text-left text-xs font-medium text-ink group"
                    >
                      <span
                        className={`h-4.5 w-4.5 rounded-full border transition-all ${
                          colorConfig.border ? "border-board" : "border-transparent"
                        } ${active ? "ring-2 ring-ink ring-offset-2 scale-110" : "group-hover:scale-105"}`}
                        style={{ backgroundColor: colorConfig.hex }}
                      />
                      <span className={active ? "font-bold text-ink" : "text-ink-soft group-hover:text-ink"}>
                        {colorName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-board pt-4.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={localInStock}
                onChange={(e) => setLocalInStock(e.target.checked)}
                className="h-4 w-4 rounded border-board text-clay focus:ring-clay cursor-pointer"
              />
              In Stock Only
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="rounded-full px-5 py-2 text-sm font-medium text-ink hover:bg-sand transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="rounded-full bg-ink px-6 py-2 text-sm font-medium text-white hover:bg-clay transition-colors"
              >
                Apply Filters
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
      <circle cx="17" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
