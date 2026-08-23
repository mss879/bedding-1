"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";

/**
 * The set-piece: the section pins and the six collections travel sideways as
 * you scroll down, each panel's photograph counter-drifting inside its frame so
 * the row reads as depth rather than a slide show.
 *
 * Under reduced motion — and on narrow screens, where pinning fights the
 * browser's own scroll — it degrades to an ordinary horizontal snap rail.
 */
export function PinnedCollections({ categories }: { categories: Category[] }) {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      const track = trackRef.current;
      if (!section || !track) return;
      const mm = gsap.matchMedia();

      mm.add(
        {
          pin: `${MOTION_OK} and (min-width: 1024px)`,
          plain: `${MOTION_REDUCE}, (max-width: 1023px)`,
        },
        (ctx) => {
          if (!ctx.conditions?.pin) {
            gsap.set([track, ...gsap.utils.toArray<HTMLElement>("[data-panel-img]", section)], {
              clearProps: "all",
            });
            return;
          }

          // Travel exactly the track's overflow, measured fresh on resize.
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance() + window.innerHeight * 0.5}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          tl.to(track, { x: () => -distance(), ease: "none" });

          // Each photograph drifts the other way inside its frame.
          gsap.utils.toArray<HTMLElement>("[data-panel-img]", section).forEach((img) => {
            tl.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none" }, 0);
          });
        }
      );
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="overflow-hidden bg-parchment py-24 lg:py-0" aria-label="The collections">
      <div className="lg:flex lg:h-screen lg:flex-col lg:justify-center">
        <div className="container-x mb-12 flex flex-wrap items-end justify-between gap-5 lg:mb-10">
          <div>
            <p className="eyebrow">Six collections</p>
            <h2 className="mt-4 font-display text-[2.1rem] leading-[1.02] xs:text-[2.6rem] md:text-6xl">
              Everything the <span className="italic text-clay">senses</span> ask for.
            </h2>
          </div>
          <Link href="/shop" className="link-rule">
            Shop everything
          </Link>
        </div>

        <div
          ref={trackRef}
          className="no-scrollbar flex gap-4 overflow-x-auto px-6 scroll-pl-6 md:gap-5 md:px-14 md:scroll-pl-14 lg:overflow-visible lg:will-change-transform"
        >
          {categories.map((c, i) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group w-[72vw] shrink-0 xs:w-[66vw] sm:w-[46vw] lg:w-[40.5vh]"
            >
              <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-sand lg:aspect-[3/4]">
                <span data-panel-img className="absolute -inset-x-[10%] inset-y-0 will-change-transform">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 76vw, 41vh"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                </span>
              </span>
              <span className="mt-5 flex items-baseline gap-4">
                <span className="font-display text-sm italic text-clay">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-2xl leading-tight transition-colors duration-500 group-hover:text-clay md:text-[1.75rem]">
                  {c.name}
                </span>
              </span>
              <span className="mt-2 line-clamp-2 block max-w-sm text-[0.82rem] leading-relaxed text-ink-soft">
                {c.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
