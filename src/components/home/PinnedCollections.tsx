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
 * Phones pin too. The only differences from desktop are that the rail's own
 * horizontal scrolling is switched off for the duration (otherwise a swipe and
 * the scrub would both move it, and they would compound), and that the
 * per-frame parallax is skipped to keep touch scrolling cheap. Under reduced
 * motion nothing pins and the rail is an ordinary swipeable row.
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
          wide: `${MOTION_OK} and (min-width: 1024px)`,
          narrow: `${MOTION_OK} and (max-width: 1023px)`,
          plain: MOTION_REDUCE,
        },
        (ctx) => {
          const panelImages = gsap.utils.toArray<HTMLElement>("[data-panel-img]", section);

          if (ctx.conditions?.plain) {
            gsap.set([track, ...panelImages], { clearProps: "all" });
            return;
          }

          const narrow = Boolean(ctx.conditions?.narrow);

          // The rail is a real overflow-x scroller so it still works with no
          // JS and under reduced motion. While the pinned scene owns it it
          // stops being a scroll container, so a swipe cannot stack its own
          // offset on top of the scrub. It must go to `visible`, not `hidden`:
          // hidden clips to the track's own box, and since the scene works by
          // translating that box, everything past the first screen would be
          // clipped away. The section around it does the clipping instead.
          if (narrow) gsap.set(track, { overflowX: "visible" });

          // Travel exactly the track's overflow, measured fresh on resize.
          const distance = () =>
            Math.max(0, track.scrollWidth - (narrow ? track.clientWidth : window.innerWidth));

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              // A little runway past the last panel so it is not whipped off
              // screen the instant it arrives. Phones get less: the scroll is
              // shorter there and the hold reads as the page being stuck.
              end: () => `+=${distance() + window.innerHeight * (narrow ? 0.25 : 0.5)}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          tl.to(track, { x: () => -distance(), ease: "none" });

          // Each photograph drifts the other way inside its frame. Desktop
          // only — six extra scrubbed transforms is a lot to ask of a phone.
          if (!narrow) {
            panelImages.forEach((img) => {
              tl.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none" }, 0);
            });
          }

          return () => {
            gsap.set(track, { clearProps: "overflowX,x" });
            track.scrollLeft = 0;
          };
        }
      );
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="overflow-hidden bg-parchment" aria-label="The collections">
      {/* The stage is a viewport tall at every size, because the scene pins on
          phones too and a pinned box taller than the screen loses its top. */}
      <div className="flex min-h-[100svh] flex-col justify-center py-10 sm:py-16 lg:h-screen lg:min-h-0 lg:py-0">
        <div className="container-x mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-12 lg:mb-10">
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
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group w-[72vw] shrink-0 xs:w-[66vw] sm:w-[46vw] lg:w-[40.5vh]"
            >
              <span className="relative block aspect-[4/5] max-h-[46svh] overflow-hidden rounded-sm bg-sand sm:max-h-[52svh] lg:aspect-[3/4] lg:max-h-none">
                <span data-panel-img className="absolute -inset-x-[10%] inset-y-0 will-change-transform">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 72vw, 41vh"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                </span>
              </span>
              <span className="mt-5 block text-center font-display text-2xl leading-tight transition-colors duration-500 group-hover:text-clay md:text-[1.75rem]">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
