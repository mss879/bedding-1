import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCategories, getNavCategories, getProducts } from "@/lib/catalog";
import { productRating } from "@/lib/ratings";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Reveal, Stagger, StaggerItem } from "@/components/anim/Reveal";
import { SortSelect } from "@/components/shop/SortSelect";
import { FilterPanel } from "@/components/shop/FilterPanel";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse premium kitchen textiles, bedding, lounge throws, bath essentials and utility organizers — ready to ship.",
};

function sortProducts(products: Product[], sort?: string): Product[] {
  const byPrice = (p: Product) => p.sizes[0]?.price ?? 0;
  switch (sort) {
    case "price_asc":
      return [...products].sort((a, b) => byPrice(a) - byPrice(b));
    case "price_desc":
      return [...products].sort((a, b) => byPrice(b) - byPrice(a));
    case "rating":
      return [...products].sort((a, b) => {
        const ra = productRating(a.slug);
        const rb = productRating(b.slug);
        return rb.rating - ra.rating || rb.count - ra.count;
      });
    default:
      return products;
  }
}

function shopUrl(params: {
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
  const p = new URLSearchParams();
  if (params.category) p.set("category", params.category);
  if (params.q) p.set("q", params.q);
  if (params.sale) p.set("sale", "1");
  if (params.sort) p.set("sort", params.sort);
  if (params.minPrice) p.set("minPrice", params.minPrice);
  if (params.maxPrice) p.set("maxPrice", params.maxPrice);
  if (params.materials) p.set("materials", params.materials);
  if (params.colors) p.set("colors", params.colors);
  if (params.inStock) p.set("inStock", "1");
  const qs = p.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

const relatedSearches = [
  { label: "linen bedding", q: "linen" },
  { label: "percale sheets", q: "percale" },
  { label: "sateen details", q: "sateen" },
  { label: "organic towels", q: "towels" },
  { label: "handloom throws", q: "handloom" },
  { label: "waffle blankets", q: "waffle" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    sale?: string;
    minPrice?: string;
    maxPrice?: string;
    materials?: string;
    colors?: string;
    inStock?: string;
  }>;
}) {
  const {
    category,
    q,
    sort,
    sale,
    minPrice,
    maxPrice,
    materials,
    colors,
    inStock,
  } = await searchParams;

  const onSale = sale === "1";
  const isInStock = inStock === "1";

  // Chips/tiles honour the admin "Show in navigation" toggle; activeCategory is
  // resolved from ALL categories so a direct link to a hidden collection still
  // renders its heading/description.
  const [navCategories, allCategories, fetched] = await Promise.all([
    getNavCategories(),
    getCategories(),
    getProducts(category, q),
  ]);
  const activeCategory = allCategories.find((c) => c.slug === category);

  // Apply memory-based filters
  let filtered = fetched;

  if (onSale) {
    filtered = filtered.filter((p) => p.sizes.some((s) => s.compare_at_price !== null));
  }

  if (minPrice) {
    const minVal = parseFloat(minPrice);
    if (!isNaN(minVal)) {
      filtered = filtered.filter((p) => p.sizes.some((s) => s.price >= minVal));
    }
  }

  if (maxPrice) {
    const maxVal = parseFloat(maxPrice);
    if (!isNaN(maxVal)) {
      filtered = filtered.filter((p) => p.sizes.some((s) => s.price <= maxVal));
    }
  }

  if (materials) {
    const selectedMats = materials.split(",").map((m) => m.trim().toLowerCase());
    filtered = filtered.filter((p) =>
      selectedMats.some((mat) => p.material.toLowerCase().includes(mat))
    );
  }

  if (colors) {
    const selectedCols = colors.split(",").map((c) => c.trim().toLowerCase());
    filtered = filtered.filter((p) =>
      p.colors.some((col) => selectedCols.includes(col.toLowerCase()))
    );
  }

  if (isInStock) {
    filtered = filtered.filter((p) => p.in_stock);
  }

  const products = sortProducts(filtered, sort);

  const heading = q
    ? `Results for “${q}”`
    : activeCategory
      ? activeCategory.name
      : "All collections";

  return (
    <div className="bg-cream pt-6 md:pt-8">
      <div className="container-x pb-20 md:pb-28">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[0.8rem] text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-ink hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link href="/shop" className="hover:text-ink hover:underline">
                Shop
              </Link>
            </li>
            {activeCategory && (
              <>
                <li aria-hidden>›</li>
                <li aria-current="page" className="text-ink">
                  {activeCategory.name}
                </li>
              </>
            )}
          </ol>
        </nav>

        <header className="mb-7 max-w-2xl">
          <Reveal>
            <h1 className="font-display text-4xl md:text-5xl">{heading}</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
              {activeCategory
                ? activeCategory.description
                : "Every piece is crafted, woven and finished by hand — in stock and ready for your home."}
            </p>
          </Reveal>
        </header>

        {/* Subcategory tiles (Etsy category-page pattern) */}
        {!activeCategory && !q && (
          <Reveal className="no-scrollbar -mx-1 mb-8 flex gap-4 overflow-x-auto px-1 pb-2">
            {navCategories.map((c) => (
              <Link
                key={c.slug}
                href={shopUrl({
                  category: c.slug,
                  sort,
                  minPrice,
                  maxPrice,
                  materials,
                  colors,
                  inStock: isInStock,
                })}
                className="group w-36 shrink-0"
              >
                <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-sand shadow-card transition-shadow group-hover:shadow-lift">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="144px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                </span>
                <span className="mt-2 block text-center text-[0.82rem] font-medium leading-snug group-hover:underline">
                  {c.name}
                </span>
              </Link>
            ))}
          </Reveal>
        )}

        {/* Filter pills + sort */}
        <Reveal delay={0.05} className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={shopUrl({
                q,
                sort,
                minPrice,
                maxPrice,
                materials,
                colors,
                inStock: isInStock,
              })}
              className={`chip ${!category && !onSale ? "chip-active" : ""}`}
            >
              All
            </Link>
            {navCategories.map((c) => (
              <Link
                key={c.slug}
                href={shopUrl({
                  category: c.slug,
                  q,
                  sort,
                  minPrice,
                  maxPrice,
                  materials,
                  colors,
                  inStock: isInStock,
                })}
                className={`chip ${category === c.slug ? "chip-active" : ""}`}
              >
                {c.name}
              </Link>
            ))}
            <Link
              href={
                onSale
                  ? shopUrl({
                      category,
                      q,
                      sort,
                      minPrice,
                      maxPrice,
                      materials,
                      colors,
                      inStock: isInStock,
                    })
                  : shopUrl({
                      category,
                      q,
                      sort,
                      sale: true,
                      minPrice,
                      maxPrice,
                      materials,
                      colors,
                      inStock: isInStock,
                    })
              }
              className={`chip ${onSale ? "chip-active" : ""}`}
            >
              On sale
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:ml-auto">
            <FilterPanel
              category={category}
              q={q}
              sort={sort}
              sale={onSale}
              minPrice={minPrice}
              maxPrice={maxPrice}
              materials={materials}
              colors={colors}
              inStock={isInStock}
              allCategories={allCategories}
            />
            <SortSelect category={category} q={q} sale={onSale} sort={sort} />
          </div>
        </Reveal>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl text-ink">Nothing matched those filters.</p>
            <p className="mt-2 text-sm text-ink-soft">
              Try adjusting your price range, materials or colors, or browse everything.
            </p>
            <Link href="/shop" className="btn btn-solid mt-6">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm text-ink-soft mb-2 lg:hidden">
              <span>
                Showing {products.length} item{products.length === 1 ? "" : "s"}
              </span>
            </div>
            <Stagger
              className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-5 lg:grid-cols-4"
              stagger={0.06}
            >
              {products.map((product) => (
                <StaggerItem key={product.slug}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}

        {/* Related searches */}
        <Reveal className="mt-16 border-t hairline pt-10">
          <h2 className="mb-5 font-display text-2xl">Explore related searches</h2>
          <div className="flex flex-wrap gap-2.5">
            {relatedSearches.map((s) => (
              <Link key={s.q} href={shopUrl({ q: s.q })} className="chip">
                <SearchGlyph className="h-3.5 w-3.5 text-ink-soft" />
                {s.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
    </svg>
  );
}
