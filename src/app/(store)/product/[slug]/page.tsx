import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProduct, getRelatedProducts } from "@/lib/catalog";
import { site } from "@/lib/site";
import { productRating, formatCount } from "@/lib/ratings";
import type { Product } from "@/lib/types";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductAssurance } from "@/components/product/ProductAssurance";
import { ProductRail } from "@/components/home/ProductRail";
import { Reveal } from "@/components/anim/Reveal";
import { Stars } from "@/components/Stars";

function productJsonLd(product: Product) {
  const prices = product.sizes.map((s) => s.price);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description,
    image: product.images,
    material: product.material,
    brand: { "@type": "Brand", name: site.name },
    // No aggregateRating: the on-page ratings are placeholders until the store
    // has a real review system, and Google's structured-data policy treats
    // self-serving review markup as grounds for a manual action.
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${site.url}/product/${product.slug}`,
    },
  };
}

const reviewPool = [
  {
    name: "Nadia",
    place: "Colombo",
    quote:
      "Beautifully boxed and even better in person. You can feel the hand-finishing in every detail — this is not something a machine made in a hurry.",
  },
  {
    name: "Ruwan",
    place: "Negombo",
    quote:
      "Second order from Enivrant. The quality is past the imported names I used to buy, at a fraction of what the boutiques here charge for them.",
  },
  {
    name: "Ishara",
    place: "Kandy",
    quote:
      "Arrived in three days with a handwritten note. It's the first thing guests comment on, and I've now bought it twice as a gift.",
  },
  {
    name: "Tharindu",
    place: "Galle",
    quote:
      "I bought this on a whim and it's become the thing I reach for daily. The concierge answered my sizing question on WhatsApp in ten minutes.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.short_description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — ${site.name}`,
      description: product.short_description,
      url: `${site.url}/product/${product.slug}`,
      images: [{ url: product.images[0], width: 1200, height: 1200, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ${site.name}`,
      description: product.short_description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [related, categories] = await Promise.all([
    getRelatedProducts(product),
    getCategories(),
  ]);
  const category = categories.find((c) => c.slug === product.category_slug);
  const { rating, count } = productRating(product.slug);
  // Deterministic pick of three reviews so server and client agree.
  const start = count % reviewPool.length;
  const reviews = Array.from({ length: 3 }, (_, i) => reviewPool[(start + i) % reviewPool.length]);

  return (
    <div className="bg-cream pt-6 md:pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />

      <nav aria-label="Breadcrumb" className="container-x mb-8 text-[0.72rem] tracking-wide text-ink-soft">
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
          {category && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="transition-colors hover:text-clay"
                >
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>/</li>
          <li aria-current="page" className="truncate text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetail product={product} />

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-40 border-t hairline bg-parchment py-20 md:py-28" aria-label="Reviews">
        <div className="container-x">
          <Reveal className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-3">
            <h2 className="font-display text-3xl md:text-4xl">{formatCount(count)} reviews</h2>
            <Stars rating={rating} size={17} />
            <span className="chip cursor-default">Verified purchases</span>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.name} delay={i * 0.08}>
                <article className="card-lift flex h-full flex-col gap-4 p-7">
                  <Stars rating={5} size={13} />
                  <blockquote className="flex-1 font-display text-[1.2rem] leading-[1.55]">
                    “{review.quote}”
                  </blockquote>
                  <p className="flex items-center gap-3 text-sm">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-tint font-display text-clay">
                      {review.name[0]}
                    </span>
                    <span>
                      <span className="font-medium">{review.name}</span>
                      <span className="text-ink-soft"> · {review.place}</span>
                    </span>
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ProductAssurance />

      {related.length > 0 && (
        <ProductRail
          products={related}
          eyebrow="You may also like"
          title="From the same collection"
          moreHref="/shop"
          moreLabel="Shop everything"
        />
      )}
    </div>
  );
}
