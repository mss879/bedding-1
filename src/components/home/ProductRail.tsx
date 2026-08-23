"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * Horizontal product carousel: eyebrow + display heading, circular arrow
 * buttons, a snap-scrolling row of listing cards, GSAP cascade on entry.
 */
export function ProductRail({
  products,
  eyebrow,
  title,
  subtitle,
  moreHref = "/shop",
  moreLabel = "See all",
  tone = "cream",
}: {
  products: Product[];
  eyebrow?: string;
  title: string;
  subtitle?: string;
  moreHref?: string;
  moreLabel?: string;
  tone?: "cream" | "white";
}) {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-rail-item]", ref.current);
      if (!items.length) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(items, { autoAlpha: 0, y: 36 });
        ScrollTrigger.batch(items, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.07 }),
        });
      });
    },
    { scope: ref }
  );

  const updateEnds = () => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft < 8);
    setAtEnd(track.scrollLeft > track.scrollWidth - track.clientWidth - 8);
  };

  const page = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      className={`section-y ${tone === "white" ? "bg-parchment" : ""}`}
      aria-label={title}
    >
      <div className="container-x mb-8 flex items-end justify-between gap-6 md:mb-12">
        <div>
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h2 className="font-display text-[2rem] leading-[1.05] xs:text-[2.4rem] md:text-[3.2rem]">
            {title}
          </h2>
          {subtitle && <p className="mt-4 max-w-lg text-[0.92rem] leading-relaxed text-ink-soft">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <Link href={moreHref} className="link-rule hidden sm:inline-block">
            {moreLabel}
          </Link>
          <div className="hidden gap-2 md:flex">
            <button onClick={() => page(-1)} disabled={atStart} aria-label="Previous products" className="arrow-btn">
              <ArrowIcon className="h-4 w-4 rotate-180" />
            </button>
            <button onClick={() => page(1)} disabled={atEnd} aria-label="Next products" className="arrow-btn">
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateEnds}
        className="no-scrollbar rail-x flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:gap-6"
      >
        {products.map((product) => (
          <div
            key={product.slug}
            data-rail-item
            className="w-[62vw] shrink-0 snap-start sm:w-[38vw] lg:w-[calc(25%-1.125rem)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
        <Link
          href={moreHref}
          data-rail-item
          className="group flex w-[45vw] shrink-0 snap-start items-center justify-center rounded-sm border hairline bg-white transition-colors hover:border-ink sm:w-[26vw] lg:w-[16%]"
        >
          <span className="p-6 text-center font-display text-xl leading-snug text-ink-soft transition-colors group-hover:text-ink">
            View the
            <br />
            full shop →
          </span>
        </Link>
      </div>
    </section>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
