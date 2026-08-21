"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/site";
import { useCart } from "./cart/CartContext";

/**
 * The listing card, composed like a lookbook plate rather than a marketplace
 * tile: a tall 4:5 photograph that cross-fades to its lifestyle shot, a
 * hairline "Add to basket" rule that draws in on hover, then name and price.
 *
 * Deliberately quiet — no star ratings, review counts, urgency or delivery
 * shouts. Those live on the product page and in the reviews section, where a
 * shopper is actually deciding, instead of decorating every plate in the grid.
 */
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);
  const fromSize = product.sizes[0];
  const [primary, secondary] = product.images;
  const discount = fromSize.compare_at_price
    ? Math.round((1 - fromSize.price / fromSize.compare_at_price) * 100)
    : 0;

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <Image
            src={primary}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-[1400ms] ease-out group-hover:scale-[1.04] ${
              secondary ? "group-hover:opacity-0" : ""
            }`}
          />
          {secondary && (
            <Image
              src={secondary}
              alt={`${product.name} — alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="scale-[1.04] object-cover opacity-0 transition-opacity duration-[1400ms] group-hover:opacity-100"
            />
          )}

          {product.badge && product.in_stock && (
            <span className="absolute left-0 top-5 bg-cream/95 px-3.5 py-1.5 text-[0.56rem] font-medium tracking-[0.2em] uppercase text-clay backdrop-blur">
              {product.badge}
            </span>
          )}
          {!product.in_stock && (
            <span className="absolute left-0 top-5 bg-ink/90 px-3.5 py-1.5 text-[0.56rem] font-medium tracking-[0.2em] uppercase text-white backdrop-blur">
              Sold out
            </span>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              setLiked((v) => !v);
            }}
            aria-label={
              liked ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`
            }
            aria-pressed={liked}
            className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center transition-all duration-500 ${
              liked
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
          >
            <HeartIcon
              className={`h-[1.15rem] w-[1.15rem] transition-colors ${
                liked ? "fill-clay stroke-clay" : "fill-none stroke-ink"
              }`}
            />
          </button>

          {product.in_stock && (
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
              aria-label={`Add ${product.name} to basket`}
              className="absolute inset-x-0 bottom-0 bg-cream/95 py-4 text-[0.6rem] font-medium tracking-[0.2em] uppercase text-ink opacity-0 backdrop-blur transition-all duration-500 hover:bg-ink hover:text-white group-hover:opacity-100"
            >
              Add to basket
            </button>
          )}
        </div>

        <div className="mt-5">
          <h3 className="font-display text-[1.15rem] leading-snug text-ink" title={product.name}>
            {product.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 text-[0.82rem]">
            <span className={discount > 0 ? "text-clay" : "text-ink-soft"}>
              {product.sizes.length > 1 ? "From " : ""}
              {formatPrice(fromSize.price)}
            </span>
            {fromSize.compare_at_price && (
              <span className="text-[0.76rem] text-taupe line-through">
                {formatPrice(fromSize.compare_at_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth="1.3" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.3l-7.3-7.2a4.7 4.7 0 010-6.7 4.8 4.8 0 016.8 0l.5.5.5-.5a4.8 4.8 0 016.8 0 4.7 4.7 0 010 6.7L12 20.3z"
      />
    </svg>
  );
}
