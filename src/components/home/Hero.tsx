"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, SplitText, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";
import { FabricCanvas } from "@/components/webgl/FabricCanvas";
import { Stars } from "@/components/Stars";

export type HeroTile = { src: string; alt: string };

/**
 * Etsy-style editorial hero banner — rounded container on the page, not a
 * full-bleed image. The pastel background is a live WebGL fabric shader,
 * the headline staggers in via SplitText, and the product-collage tiles
 * parallax at different speeds as you scroll away.
 */
export function Hero({ tiles }: { tiles: HeroTile[] }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const mm = gsap.matchMedia();

      mm.add(MOTION_REDUCE, () => {
        gsap.set(q("[data-hero-copy] > *, [data-tile]"), { clearProps: "all" });
      });

      mm.add(MOTION_OK, () => {
        // Headline: crafted char-by-char rise. autoSplit re-runs after fonts load.
        const split = SplitText.create(q("[data-hero-heading]"), {
          type: "words,chars",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.chars, {
              yPercent: 105,
              autoAlpha: 0,
              duration: 0.9,
              stagger: 0.016,
              ease: "power4.out",
              delay: 0.15,
            });
          },
        });

        gsap.from(q("[data-hero-rest]"), {
          autoAlpha: 0,
          y: 24,
          duration: 0.8,
          stagger: 0.12,
          delay: 0.55,
          ease: "power3.out",
        });

        gsap.from(q("[data-tile]"), {
          autoAlpha: 0,
          y: 44,
          scale: 0.94,
          duration: 0.95,
          stagger: 0.09,
          delay: 0.25,
          ease: "power3.out",
        });

        // Collage tiles drift at different speeds as the hero scrolls out.
        gsap.utils.toArray<HTMLElement>(q("[data-tile]")).forEach((tile) => {
          gsap.to(tile, {
            yPercent: Number(tile.dataset.speed ?? 0),
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        });

        return () => split.revert();
      });
    },
    { scope: ref }
  );

  const speeds = [-14, -26, -8, -20];

  return (
    <section ref={ref} className="container-x pt-3 md:pt-5" aria-label="Welcome">
      <div className="relative overflow-hidden rounded-3xl">
        <FabricCanvas />
        <div className="relative grid items-center gap-10 px-6 py-12 md:px-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:py-20">
          <div data-hero-copy>
            <p
              data-hero-rest
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-[0.78rem] font-semibold text-clay backdrop-blur"
            >
              Handwoven in Sri Lanka · Free delivery over Rs 25,000
            </p>
            <h1
              data-hero-heading
              className="font-display text-[2.6rem] font-medium leading-[1.04] tracking-tight text-ink sm:text-5xl md:text-6xl xl:text-[4.2rem]"
            >
              Bedding you&rsquo;ll love, made by hand.
            </h1>
            <p data-hero-rest className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
              Percale, sateen and stonewashed linen — cut, sewn and finished in small
              batches, then delivered straight from our workshop to your bed.
            </p>
            <div data-hero-rest className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn btn-solid">
                Shop bestsellers
              </Link>
              <Link href="/hotel-bulk" className="btn btn-outline">
                Hotel &amp; bulk orders
              </Link>
            </div>
            <p data-hero-rest className="mt-6 flex items-center gap-2 text-[0.85rem] text-ink-soft">
              <Stars rating={4.9} size={15} />
              <span>
                <strong className="font-semibold text-ink">4.9</strong> average from 12,000+
                well-rested sleepers
              </span>
            </p>
          </div>

          {/* Product collage */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="flex flex-col gap-4 sm:gap-5">
              <Tile tile={tiles[0]} speed={speeds[0]} className="aspect-[4/5]" />
              <Tile tile={tiles[1]} speed={speeds[1]} className="aspect-square" />
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:gap-5">
              <Tile tile={tiles[2]} speed={speeds[2]} className="aspect-square" />
              <Tile tile={tiles[3]} speed={speeds[3]} className="aspect-[4/5]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({
  tile,
  speed,
  className,
}: {
  tile?: HeroTile;
  speed: number;
  className?: string;
}) {
  if (!tile) return null;
  return (
    <div
      data-tile
      data-speed={speed}
      className={`relative overflow-hidden rounded-2xl bg-white/60 shadow-pop will-change-transform ${className ?? ""}`}
    >
      <Image
        src={tile.src}
        alt={tile.alt}
        fill
        preload
        sizes="(max-width: 1024px) 45vw, 22vw"
        className="object-cover transition-transform duration-700 ease-out hover:scale-[1.05]"
      />
    </div>
  );
}
