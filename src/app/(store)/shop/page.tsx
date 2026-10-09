import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  countBySubcategory,
  getCategories,
  getNavCategories,
  getProducts,
  getSubcategories,
} from "@/lib/catalog";
import { productRating } from "@/lib/ratings";
import { collectionBanner, collectionPages, collectionTagline } from "@/lib/collection-art";
import { robotsFor, site } from "@/lib/site";
import type { Category, Product, Subcategory } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Reveal, Stagger, StaggerItem } from "@/components/anim/Reveal";
import { SortSelect } from "@/components/shop/SortSelect";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { CollectionSelect } from "@/components/shop/CollectionSelect";

const SHOP_DESCRIPTION =
  "Shop the Enivrant maison — iconic fragrance, wellness rituals, home pieces, pearls and fine jewellery, designer fashion selects and hotel-grade bedlinen. Curated, never mass-produced.";

type ShopSearchParams = {
  category?: string;
  sub?: string;
  q?: string;
  sort?: string;
  sale?: string;
  minPrice?: string;
  maxPrice?: string;
  materials?: string;
  colors?: string;
  inStock?: string;
};

/**
 * Resolves the collection and sub-category a shop URL asks for. A sub-category
 * only counts inside its own collection; given on its own (`?sub=…`) it brings
 * its collection with it. Anything unknown is ignored rather than trusted.
 */
function resolveView(
  categories: Category[],
  subcategories: Subcategory[],
  categorySlug?: string,
  subSlug?: string
) {
  const sub = subSlug
    ? subcategories.find((s) => s.slug === subSlug && (!categorySlug || s.category_slug === categorySlug))
    : undefined;
  const category = categories.find((c) => c.slug === (categorySlug ?? sub?.category_slug));
  return { category, sub: category && sub?.category_slug === category.slug ? sub : undefined };
}

/**
 * Every collection, filter, sort and search on the storefront is a query string
 * on this one route, so the head has to say which of those are real pages.
 *
 * A collection view is, and so is a sub-category inside it: they are what a
 * shopper lands on from search, so each gets its own title, description and
 * self-referencing canonical. Everything else — a text search, a price band, a
 * material tick — is a slice of the same inventory, so it canonicalises back
 * to its collection and is kept out of the index rather than competing with it.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}): Promise<Metadata> {
  const { category: slug, sub: subSlug, q, sale, sort, minPrice, maxPrice, materials, colors, inStock } =
    await searchParams;
  const [categories, subcategories] = await Promise.all([getCategories(), getSubcategories()]);
  const { category, sub } = resolveView(categories, subcategories, slug, subSlug);

  const filtered = Boolean(q || sale || sort || minPrice || maxPrice || materials || colors || inStock);
  const canonical = category
    ? sub
      ? `/shop?category=${category.slug}&sub=${sub.slug}`
      : `/shop?category=${category.slug}`
    : "/shop";
  // A sub-category with nothing in stock is an empty shelf, not a page.
  const emptySub = sub ? (await getProducts(category?.slug, undefined, sub.slug)).length === 0 : false;

  const title = sub && category ? `${sub.name} — ${category.name}` : category ? category.name : "Shop";
  const description = sub ? sub.description : category ? category.description : SHOP_DESCRIPTION;

  return {
    title,
    description: category
      ? `${description} Curated by ${site.name} — authenticity assured, delivered across Sri Lanka.`
      : SHOP_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title: `${title} — ${site.name}`,
      description,
      url: `${site.url}${canonical}`,
      images: category
        ? [{ url: sub?.image || category.image, alt: sub?.name ?? category.name }]
        : undefined,
    },
    robots: robotsFor(!filtered && !emptySub),
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
  sub?: string;
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
  if (params.sub) p.set("sub", params.sub);
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
  searchParams: Promise<ShopSearchParams>;
}) {
  const { category: categoryParam, sub: subParam, q, sort, sale, minPrice, maxPrice, materials, colors, inStock } =
    await searchParams;

  const onSale = sale === "1";
  const isInStock = inStock === "1";

  // Chips/tiles honour the admin "Show in navigation" toggles; the active
  // collection is resolved from ALL collections so a direct link to a hidden
  // one still renders its heading and description.
  const [navCategories, allCategories, subcategories] = await Promise.all([
    getNavCategories(),
    getCategories(),
    getSubcategories(),
  ]);
  const { category: activeCategory, sub: activeSub } = resolveView(
    allCategories,
    subcategories,
    categoryParam,
    subParam
  );
  const category = activeCategory?.slug ?? categoryParam;
  const fetched = await getProducts(category, q);

  // The sub-categories worth a chip: this collection's, visible, and with
  // something in stock that matches the search. Editorial pages follow them.
  const counts = countBySubcategory(fetched, subcategories);
  const collectionSubs = activeCategory
    ? subcategories.filter(
        (s) => s.category_slug === activeCategory.slug && s.show_in_nav !== false && counts.get(s.slug)
      )
    : [];
  const pages = collectionPages(activeCategory?.slug);
  // Spa vouchers are counted as vouchers, not pieces.
  const voucherSubs = new Set(fetched.filter((p) => p.kind === "voucher").map((p) => p.subcategory_slug));
  const countLabel = (n: number, vouchers: boolean) =>
    `${n} ${vouchers ? (n === 1 ? "voucher" : "vouchers") : n === 1 ? "piece" : "pieces"}`;

  let filtered = activeSub ? fetched.filter((p) => p.subcategory_slug === activeSub.slug) : fetched;

  if (onSale) {
    // A voucher's strike-through is the spa's own price — what it always
    // costs there — not a reduction, so vouchers are never "on sale".
    filtered = filtered.filter(
      (p) => p.kind !== "voucher" && p.sizes.some((s) => s.compare_at_price !== null)
    );
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

  const heading = q
    ? `“${q}”`
    : activeSub
      ? activeSub.name
      : activeCategory
        ? activeCategory.name
        : "The full maison";
  const blurb = q
    ? `${products.length} ${products.length === 1 ? "piece" : "pieces"} matching your search.`
    : activeSub
      ? activeSub.description
      : activeCategory
        ? activeCategory.description
        : "Six collections — fragrance, wellness, home, jewellery, fashion and bedlinen — curated piece by piece.";
  const eyebrow = activeSub && activeCategory ? activeCategory.name : collectionTagline(category);

  // A sub-category with nothing in it at all, as opposed to filters that
  // matched nothing: reached only by a direct link, since no chip leads here.
  const shelfEmpty = Boolean(activeSub) && !q && !counts.get(activeSub?.slug ?? "");

  // Carry the shopper's active filters through every chip and tile link.
  const carry = { sort, minPrice, maxPrice, materials, colors, inStock: isInStock };
  const sub = activeSub?.slug;

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
                <p className="eyebrow">{eyebrow}</p>
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
                {activeSub ? (
                  <li>
                    <Link
                      href={shopUrl({ category: activeCategory.slug })}
                      className="transition-colors hover:text-clay"
                    >
                      {activeCategory.name}
                    </Link>
                  </li>
                ) : (
                  <li aria-current="page" className="text-ink">
                    {activeCategory.name}
                  </li>
                )}
              </>
            )}
            {activeSub && (
              <>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-ink">
                  {activeSub.name}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Collection tiles (landing view only) */}
        {!activeCategory && !q && (
          <Reveal className="no-scrollbar -mx-6 mb-12 flex snap-x gap-4 overflow-x-auto px-6 scroll-pl-6 pb-2 md:-mx-14 md:gap-5 md:px-14 md:scroll-pl-14">
            {navCategories.map((c) => (
              <Tile
                key={c.slug}
                href={shopUrl({ category: c.slug, ...carry })}
                image={c.image}
                name={c.name}
              />
            ))}
          </Reveal>
        )}

        {/* Shop by category — a collection's sub-categories and pages */}
        {activeCategory && !activeSub && !q && collectionSubs.length + pages.length > 0 && (
          <Reveal className="mb-12">
            <h2 className="eyebrow mb-5">Shop by category</h2>
            <div className="no-scrollbar -mx-6 flex snap-x gap-4 overflow-x-auto px-6 scroll-pl-6 pb-2 md:-mx-14 md:gap-5 md:px-14 md:scroll-pl-14">
              {collectionSubs.map((s) => (
                <Tile
                  key={s.slug}
                  href={shopUrl({ category: activeCategory.slug, sub: s.slug, ...carry })}
                  image={s.image || activeCategory.image}
                  name={s.name}
                  note={countLabel(counts.get(s.slug) ?? 0, voucherSubs.has(s.slug))}
                />
              ))}
              {pages.map((page) => (
                <Tile key={page.href} href={page.href} image={page.image} name={page.name} note="Feature" />
              ))}
            </div>
          </Reveal>
        )}

        {/* Filter bar */}
        <Reveal delay={0.05} className="mb-10">
          {activeCategory ? (
            // Inside a collection the chips are its sub-categories; the other
            // collections are one step away in the switcher.
            <div className="flex flex-wrap items-center gap-2.5 border-b hairline pb-5">
              <CollectionSelect
                categories={navCategories}
                category={activeCategory.slug}
                carry={{
                  q,
                  sort,
                  minPrice,
                  maxPrice,
                  materials,
                  colors,
                  inStock: isInStock ? "1" : undefined,
                }}
              />
              <span aria-hidden className="mx-1 hidden h-5 w-px bg-board sm:block" />
              <Link
                href={shopUrl({ category: activeCategory.slug, q, ...carry })}
                aria-label={`All of ${activeCategory.name}`}
                className={`chip ${!activeSub && !onSale ? "chip-active" : ""}`}
              >
                All
              </Link>
              {collectionSubs.map((s) => (
                <Link
                  key={s.slug}
                  href={shopUrl({ category: activeCategory.slug, sub: s.slug, q, ...carry })}
                  aria-current={activeSub?.slug === s.slug ? "page" : undefined}
                  className={`chip ${activeSub?.slug === s.slug ? "chip-active" : ""}`}
                >
                  {s.name}
                  <span className={activeSub?.slug === s.slug ? "text-white/60" : "text-fog"}>
                    {counts.get(s.slug)}
                  </span>
                </Link>
              ))}
              {pages.map((page) => (
                <Link key={page.href} href={page.href} className="chip">
                  {page.name}
                  <span aria-hidden className="text-clay">
                    ↗
                  </span>
                </Link>
              ))}
              <Link
                href={shopUrl({ category: activeCategory.slug, sub, q, sale: !onSale, ...carry })}
                className={`chip ${onSale ? "chip-active" : ""}`}
              >
                On sale
              </Link>
            </div>
          ) : (
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
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <FilterPanel
              category={category}
              sub={sub}
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
              {countLabel(products.length, products.length > 0 && products.every((p) => p.kind === "voucher"))}
            </p>
            <div className="ml-auto">
              <SortSelect
                category={category}
                sub={sub}
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
            <p className="font-display text-3xl text-ink">
              {shelfEmpty ? "Nothing here just yet." : "Nothing matched those filters."}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              {shelfEmpty && activeSub && activeCategory
                ? `New pieces for ${activeSub.name} are on their way. In the meantime, the rest of ${activeCategory.name} is one click away.`
                : "Try widening the price range, or clearing a material or colour — a curated house keeps fewer things than most shops."}
            </p>
            <Link
              href={activeCategory ? shopUrl({ category: activeCategory.slug }) : "/shop"}
              className="btn btn-solid mt-8"
            >
              {activeCategory ? `Browse ${activeCategory.name}` : "Browse everything"}
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

/** A portrait tile in a sideways-scrolling row: a collection, a sub-category or a page. */
function Tile({
  href,
  image,
  name,
  note,
}: {
  href: string;
  image: string;
  name: string;
  note?: string;
}) {
  return (
    <Link href={href} className="group w-36 shrink-0 snap-start xs:w-40 sm:w-44">
      <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-sand">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="176px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        )}
      </span>
      <span className="mt-3 block font-display text-[0.98rem] leading-snug transition-colors group-hover:text-clay">
        {name}
      </span>
      {note && (
        <span className="mt-0.5 block text-[0.62rem] font-medium tracking-[0.16em] uppercase text-fog">
          {note}
        </span>
      )}
    </Link>
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
