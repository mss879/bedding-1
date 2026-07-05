"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/site";
import { productRating } from "@/lib/ratings";
import { Stars } from "./Stars";
import { useCart } from "./cart/CartContext";

const FREE_DELIVERY_FROM = 15000;

/**
 * Etsy-anatomy listing card: landscape rounded image with hover heart +
 * quick-add, badge chip, truncated title, gold stars, bold price with
 * green sale treatment, green FREE delivery line.
 */
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);
  const fromSize = product.sizes[0];
  const [primary, secondary] = product.images;
  const { rating, count } = productRating(product.slug);
  const discount = fromSize.compare_at_price
    ? Math.round((1 - fromSize.price / fromSize.compare_at_price) * 100)
    : 0;

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-sand shadow-card transition-shadow duration-300 group-hover:shadow-lift">
          <Image
            src={primary}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] ${
              secondary ? "group-hover:opacity-0" : ""
            }`}
          />
          {secondary && (
            <Image
              src={secondary}
              alt={`${product.name} — alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="scale-[1.04] object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          {product.badge && (
            <span className="badge-img absolute bottom-2.5 left-2.5">{product.badge}</span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              setLiked((v) => !v);
            }}
            aria-label={liked ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
            aria-pressed={liked}
            className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-pop transition-all duration-300 hover:scale-110 ${
              liked ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
          >
            <HeartIcon className={`h-4.5 w-4.5 ${liked ? "fill-clay stroke-clay" : "fill-none stroke-ink"}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(
                {
                  productSlug: product.slug,
                  name: product.name,
                  image: primary,
                  sizeName: fromSize.name,
                  unitPrice: fromSize.price,
                },
                1
              );
            }}
            aria-label={`Add ${product.name} to cart`}
            className="absolute inset-x-2.5 bottom-2.5 translate-y-2 rounded-full bg-white/95 py-2.5 text-[0.8rem] font-semibold text-ink opacity-0 shadow-pop backdrop-blur transition-all duration-300 hover:bg-ink hover:text-white group-hover:translate-y-0 group-hover:opacity-100"
          >
            Quick add — {fromSize.name}
          </button>
        </div>

        <div className="mt-2.5">
          <h3 className="truncate text-[0.92rem] leading-snug text-ink" title={product.name}>
            {product.name}
          </h3>
          <div className="mt-0.5">
            <Stars rating={rating} count={count} />
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-[0.95rem]">
            <span className={`font-semibold ${discount > 0 ? "text-sale" : "text-ink"}`}>
              {product.sizes.length > 1 ? "From " : ""}
              {formatPrice(fromSize.price)}
            </span>
            {fromSize.compare_at_price && (
              <>
                <span className="text-[0.82rem] text-fog line-through">
                  {formatPrice(fromSize.compare_at_price)}
                </span>
                <span className="text-[0.82rem] font-medium text-sale">({discount}% off)</span>
              </>
            )}
          </div>
          {fromSize.price >= FREE_DELIVERY_FROM && (
            <p className="mt-0.5 text-[0.78rem] font-medium text-sale">FREE delivery</p>
          )}
        </div>
      </Link>
    </div>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.3l-7.3-7.2a4.7 4.7 0 010-6.7 4.8 4.8 0 016.8 0l.5.5.5-.5a4.8 4.8 0 016.8 0 4.7 4.7 0 010 6.7L12 20.3z"
      />
    </svg>
  );
}
