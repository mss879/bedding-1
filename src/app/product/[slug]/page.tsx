import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProduct, getRelatedProducts } from "@/lib/catalog";
import { site } from "@/lib/site";
import { productRating, formatCount } from "@/lib/ratings";
import type { Product } from "@/lib/types";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductRail } from "@/components/home/ProductRail";
import { Reveal } from "@/components/anim/Reveal";
import { Stars } from "@/components/Stars";

function productJsonLd(product: Product) {
  const prices = product.sizes.map((s) => s.price);
  const { rating, count } = productRating(product.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description,
    image: product.images,
    material: product.material,
    brand: { "@type": "Brand", name: site.name },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: count,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "LKR",
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
      "Exactly as pictured, beautifully packed, and it washes like a dream. You can feel the hand-finishing in every seam.",
  },
  {
    name: "Ruwan",
    place: "Negombo",
    quote:
      "Second order from Aveline. Quality is better than the imported brands I used to buy, at a fraction of the price.",
  },
  {
    name: "Ishara",
    place: "Kandy",
    quote:
      "Arrived in three days with a handwritten note. The fabric is noticeably cool at night — worth every rupee.",
  },
  {
    name: "Tharindu",
    place: "Galle",
    quote:
      "Bought this for our guest room and guests keep asking where it's from. Will be back for the king size.",
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
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: [{ url: product.images[0] }],
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
    <div className="bg-cream pt-5 md:pt-7">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="container-x mb-5 text-[0.8rem] text-ink-soft">
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
          {category && (
            <>
              <li aria-hidden>›</li>
              <li>
                <Link href={`/shop?category=${category.slug}`} className="hover:text-ink hover:underline">
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>›</li>
          <li aria-current="page" className="truncate text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetail product={product} />

      {/* Reviews */}
      <section className="border-t hairline bg-parchment py-14 md:py-16" aria-label="Reviews">
        <div className="container-x">
          <Reveal className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="font-display text-2xl md:text-3xl">
              {formatCount(count)} reviews
            </h2>
            <Stars rating={rating} size={18} />
            <span className="rounded-full bg-cream px-3.5 py-1.5 text-[0.8rem] font-medium">
              Reviews for this shop
            </span>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.name} delay={i * 0.08}>
                <article className="card-lift flex h-full flex-col gap-3.5 p-6">
                  <Stars rating={5} size={14} />
                  <blockquote className="flex-1 text-sm leading-relaxed">
                    “{review.quote}”
                  </blockquote>
                  <p className="flex items-center gap-2.5 text-sm">
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

      {related.length > 0 && (
        <ProductRail
          products={related}
          title={`More from ${site.name}`}
          subtitle="In the same soft neighbourhood."
          moreHref="/shop"
          moreLabel="Shop everything"
        />
      )}
    </div>
  );
}
