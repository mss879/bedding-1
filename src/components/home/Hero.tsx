"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, SplitText, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";
import { FabricCanvas } from "@/components/webgl/FabricCanvas";

export type HeroTile = { src: string; alt: string };

/**
 * The maison hero: a full-width silk band (live WebGL fabric shader) carrying
 * the headline on the left and a parallaxing product collage on the right.
 * The headline splits and rises char by char; the tiles drift at four speeds
 * as the band scrolls away.
 */
export function Hero({ tiles }: { tiles: HeroTile[] }) {
  const ref = useRef<HTMLElement>(null);

  // The preloader is an external store: it sets a window flag and fires an
  // event. Subscribing with useSyncExternalStore (rather than an effect that
  // calls setState) means a curtain that finished before this mounted is read
  // correctly on the very first render, with no cascading re-render.
  const isPreloaded = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("preloader-complete", onChange);
      return () => window.removeEventListener("preloader-complete", onChange);
    },
    () => Boolean((window as unknown as { __preloaderComplete?: boolean }).__preloaderComplete),
    () => false
  );

  useGSAP(
    () => {
      if (!isPreloaded) return;
      const q = gsap.utils.selector(ref);
      const mm = gsap.matchMedia();

      mm.add(MOTION_REDUCE, () => {
        gsap.set(q("[data-hero-copy] > *, [data-tile]"), { clearProps: "all" });
      });

      mm.add(MOTION_OK, () => {
        const split = SplitText.create(q("[data-hero-heading]"), {
          type: "words,chars",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.chars, {
              yPercent: 110,
              autoAlpha: 0,
              duration: 1,
              stagger: 0.018,
              ease: "power4.out",
              delay: 0.15,
            });
          },
        });

        gsap.from(q("[data-hero-rest]"), {
          autoAlpha: 0,
          y: 22,
          duration: 0.9,
          stagger: 0.11,
          delay: 0.6,
          ease: "power3.out",
        });

        gsap.from(q("[data-tile]"), {
          autoAlpha: 0,
          y: 48,
          scale: 0.95,
          duration: 1.05,
          stagger: 0.1,
          delay: 0.28,
          ease: "power3.out",
        });

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
    { scope: ref, dependencies: [isPreloaded] }
  );

  const speeds = [-14, -26, -8, -20];

  return (
    <section ref={ref} className="w-full" aria-label="Welcome">
      <div className="relative flex min-h-[calc(100vh-9rem)] items-center overflow-hidden py-14 md:py-20">
        <FabricCanvas />
        <div className="container-x relative w-full">
          <div
            style={{ opacity: isPreloaded ? 1 : 0 }}
            className="relative grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-14"
          >
            <div data-hero-copy>
              <p data-hero-rest className="eyebrow">
                Colombo · Est. 2024
              </p>
              <h1
                data-hero-heading
                className="mt-5 font-display text-[3rem] leading-[1.02] tracking-tight text-ink sm:text-6xl md:text-7xl xl:text-[5.2rem]"
              >
                Where Elegance Becomes a Lifestyle
              </h1>
              <p
                data-hero-rest
                className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-ink-soft"
              >
                Indulge in a curated universe of refinement — from the art of
                self-care and rare fragrances to timeless pearls, Luxury Fashion
                Designer Selects, and the serenity of fine bedlinen.
              </p>
              <div data-hero-rest className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="/shop" className="btn btn-solid">
                  Explore the maison
                </Link>
                <Link href="/shop?category=fragrances" className="btn btn-outline">
                  Discover fragrance
                </Link>
              </div>
              <p
                data-hero-rest
                className="mt-9 text-[0.82rem] text-ink-soft"
              >
                Curated, never mass-produced.
              </p>
            </div>

            {/* Product collage */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <div className="flex flex-col gap-4 sm:gap-5">
                <Tile tile={tiles[0]} speed={speeds[0]} className="aspect-[4/5]" />
                <Tile tile={tiles[1]} speed={speeds[1]} className="aspect-square" />
              </div>
              <div className="mt-10 flex flex-col gap-4 sm:gap-5">
                <Tile tile={tiles[2]} speed={speeds[2]} className="aspect-square" />
                <Tile tile={tiles[3]} speed={speeds[3]} className="aspect-[4/5]" />
              </div>
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
      className={`relative overflow-hidden rounded-sm bg-white/50 shadow-pop will-change-transform ${className ?? ""}`}
    >
      <Image
        src={tile.src}
        alt={tile.alt}
        fill
        preload
        sizes="(max-width: 1024px) 45vw, 24vw"
        className="object-cover transition-transform duration-[900ms] ease-out hover:scale-[1.04]"
      />
    </div>
  );
}
