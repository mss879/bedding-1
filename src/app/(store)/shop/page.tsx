import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCategories, getNavCategories, getProducts } from "@/lib/catalog";
import { productRating } from "@/lib/ratings";
import { collectionBanner, collectionTagline } from "@/lib/collection-art";
import { robotsFor, site } from "@/lib/site";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Reveal, Stagger, StaggerItem } from "@/components/anim/Reveal";
import { SortSelect } from "@/components/shop/SortSelect";
import { FilterPanel } from "@/components/shop/FilterPanel";

const SHOP_DESCRIPTION =
  "Shop the Enivrant maison — iconic fragrance, wellness rituals, home pieces, pearls and fine jewellery, designer fashion selects and hotel-grade bedlinen. Curated, never mass-produced.";

/**
 * Every collection, filter, sort and search on the storefront is a query string
 * on this one route, so the head has to say which of those are real pages.
 *
 * A collection view is: it is what a shopper lands on from search, so it gets
 * its own title, description and self-referencing canonical. Everything else —
 * a text search, a price band, a material tick — is a slice of the same
 * inventory, so it canonicalises back to its collection and is kept out of the
 * index rather than competing with it.
 */
export async function generateMetadata({
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
}): Promise<Metadata> {
  const { category: slug, q, sale, sort, minPrice, maxPrice, materials, colors, inStock } =
    await searchParams;
  const category = slug
    ? (await getCategories()).find((c) => c.slug === slug)
    : undefined;

  const filtered = Boolean(q || sale || sort || minPrice || maxPrice || materials || colors || inStock);
  const canonical = category ? `/shop?category=${category.slug}` : "/shop";

  return {
    title: category ? category.name : "Shop",
    description: category
      ? `${category.description} Curated by ${site.name} — authenticity assured, delivered across Sri Lanka.`
      : SHOP_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title: category ? `${category.name} — ${site.name}` : `Shop — ${site.name}`,
      description: category ? category.description : SHOP_DESCRIPTION,
      url: `${site.url}${canonical}`,
      images: category ? [{ url: category.image, alt: category.name }] : undefined,
    },
    robots: robotsFor(!filtered),
  };
}

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

type ShopParams = {
  category?: string;
  q?: string;
  sale?: boolean;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  materials?: string;
  colors?: string;
  inStock?: boolean;
};

function shopUrl(params: ShopParams) {
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
  { label: "eau de parfum", q: "parfum" },
  { label: "freshwater pearls", q: "pearl" },
  { label: "mulberry silk", q: "silk" },
  { label: "washed linen", q: "linen" },
  { label: "hand-thrown stoneware", q: "stoneware" },
  { label: "gold vermeil", q: "vermeil" },
  { label: "bath rituals", q: "bath" },
  { label: "candles & diffusers", q: "candle" },
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
  const { category, q, sort, sale, minPrice, maxPrice, materials, colors, inStock } =
    await searchParams;

  const onSale = sale === "1";
  const isInStock = inStock === "1";

  // Chips/tiles honour the admin "Show in navigation" toggle; activeCategory is
  // resolved from ALL categories so a direct link to a hidden collection still
  // renders its heading and description.
  const [navCategories, allCategories, fetched] = await Promise.all([
    getNavCategories(),
    getCategories(),
    getProducts(category, q),
  ]);
  const activeCategory = allCategories.find((c) => c.slug === category);

  let filtered = fetched;

  if (onSale) {
    filtered = filtered.filter((p) => p.sizes.some((s) => s.compare_at_price !== null));
  }
  if (minPrice) {
    const minVal = parseFloat(minPrice);
    if (!Number.isNaN(minVal)) {
      filtered = filtered.filter((p) => p.sizes.some((s) => s.price >= minVal));
    }
  }
  if (maxPrice) {
    const maxVal = parseFloat(maxPrice);
    if (!Number.isNaN(maxVal)) {
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
    filtered = filtered.filter((p) => p.colors.some((col) => selectedCols.includes(col.toLowerCase())));
  }
  if (isInStock) {
    filtered = filtered.filter((p) => p.in_stock);
  }

  const products = sortProducts(filtered, sort);

  const heading = q ? `“${q}”` : activeCategory ? activeCategory.name : "The full maison";
  const blurb = q
    ? `${products.length} ${products.length === 1 ? "piece" : "pieces"} matching your search.`
    : activeCategory
      ? activeCategory.description
      : "Six collections — fragrance, wellness, home, jewellery, fashion and bedlinen — curated piece by piece.";

  // Carry the shopper's active filters through every chip and tile link.
  const carry = { sort, minPrice, maxPrice, materials, colors, inStock: isInStock };

  return (
    <div className="bg-cream">
      {/* Collection banner */}
      <section className="relative">
        {/* 21:9 is only 160px tall on a phone — far too short for the eyebrow,
            headline and blurb sitting on top of it, which used to spill out of
            the frame. The banner deepens as the screen narrows. */}
        <div className="relative aspect-[4/3] max-h-[26rem] w-full overflow-hidden xs:aspect-[3/2] sm:aspect-[16/9] md:aspect-[21/9] md:max-h-[30rem]">
          <Image
            src={collectionBanner(category, activeCategory?.image)}
            alt=""
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
          {/* On a phone the copy spans the full width, so the wash has to carry
              all the way across rather than fading out at the halfway mark. */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/85 to-cream/40 sm:via-cream/70 sm:to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-x">
              <Reveal className="max-w-md">
                <p className="eyebrow">{collectionTagline(category)}</p>
                <h1 className="mt-3 font-display text-[2.1rem] leading-[1.05] xs:text-4xl md:mt-4 md:text-6xl">
                  {heading}
                </h1>
                <p className="mt-3 line-clamp-3 max-w-sm text-[0.82rem] leading-relaxed text-ink-soft xs:text-sm md:mt-4 md:line-clamp-none">
                  {blurb}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x pb-24 pt-8 md:pb-32">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-[0.72rem] tracking-wide text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-clay">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/shop" className="transition-colors hover:text-clay">
                Shop
              </Link>
            </li>
            {activeCategory && (
              <>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-ink">
                  {activeCategory.name}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Collection tiles (landing view only) */}
        {!activeCategory && !q && (
          <Reveal className="no-scrollbar -mx-6 mb-12 flex snap-x gap-4 overflow-x-auto px-6 scroll-pl-6 pb-2 md:-mx-14 md:gap-5 md:px-14 md:scroll-pl-14">
            {navCategories.map((c) => (
              <Link
                key={c.slug}
                href={shopUrl({ category: c.slug, ...carry })}
                className="group w-36 shrink-0 snap-start xs:w-40 sm:w-44"
              >
                <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-sand">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="176px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                </span>
                <span className="mt-3 block font-display text-[0.98rem] leading-snug transition-colors group-hover:text-clay">
                  {c.name}
                </span>
              </Link>
            ))}
          </Reveal>
        )}

        {/* Filter bar */}
        <Reveal delay={0.05} className="mb-10">
          <div className="flex flex-wrap items-center gap-2.5 border-b hairline pb-5">
            <Link
              href={shopUrl({ q, ...carry })}
              className={`chip ${!category && !onSale ? "chip-active" : ""}`}
            >
              All
            </Link>
            {navCategories.map((c) => (
              <Link
                key={c.slug}
                href={shopUrl({ category: c.slug, q, ...carry })}
                className={`chip ${category === c.slug ? "chip-active" : ""}`}
              >
                {c.name}
              </Link>
            ))}
            <Link
              href={shopUrl({ category, q, sale: !onSale, ...carry })}
              className={`chip ${onSale ? "chip-active" : ""}`}
            >
              On sale
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
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
            />
            <p className="text-[0.75rem] text-ink-soft">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="ml-auto">
              <SortSelect
                category={category}
                q={q}
                sale={onSale}
                sort={sort}
                minPrice={minPrice}
                maxPrice={maxPrice}
                materials={materials}
                colors={colors}
                inStock={isInStock}
              />
            </div>
          </div>
        </Reveal>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-ink">Nothing matched those filters.</p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              Try widening the price range, or clearing a material or colour — a
              curated house keeps fewer things than most shops.
            </p>
            <Link href="/shop" className="btn btn-solid mt-8">
              Browse everything
            </Link>
          </div>
        ) : (
          <Stagger
            className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4"
            stagger={0.06}
          >
            {products.map((product) => (
              <StaggerItem key={product.slug}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {/* Related searches */}
        <Reveal className="mt-20 border-t hairline pt-12">
          <h2 className="eyebrow mb-6">Explore further</h2>
          <div className="flex flex-wrap gap-2.5">
            {relatedSearches.map((s) => (
              <Link key={s.q} href={shopUrl({ q: s.q })} className="chip">
                <SearchGlyph className="h-3 w-3 text-ink-soft" />
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
