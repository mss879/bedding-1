"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";
import { CountUp } from "@/components/anim/CountUp";

/**
 * A quiet band of figures that count up on entry, separated by gold hairlines
 * that draw down from nothing as the band arrives.
 *
 * The two catalogue figures are passed in from the page rather than hardcoded,
 * so the band cannot drift out of step with what the maison actually stocks.
 */
export function StatBand({
  collectionCount,
  pieceCount,
}: {
  collectionCount: number;
  pieceCount: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const stats = [
    { value: collectionCount, suffix: "", label: "Collections" },
    { value: pieceCount, suffix: "", label: "Pieces in the maison" },
    { value: 100, suffix: "%", label: "Curated selection" },
    { value: 365, suffix: "", label: "Day guarantee" },
  ];

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add(MOTION_REDUCE, () => {
        gsap.set(q("[data-rule], [data-stat]"), { clearProps: "all", autoAlpha: 1 });
      });

      mm.add(MOTION_OK, () => {
        gsap.from(q("[data-stat]"), {
          autoAlpha: 0,
          y: 26,
          duration: 1,
          stagger: 0.11,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 82%", once: true },
        });
        gsap.from(q("[data-rule]"), {
          scaleY: 0,
          transformOrigin: "top center",
          duration: 1.1,
          stagger: 0.11,
          ease: "power3.inOut",
          scrollTrigger: { trigger: section, start: "top 82%", once: true },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="border-y hairline bg-cream" aria-label="The maison in figures">
      <div className="container-x grid grid-cols-2 gap-y-12 py-16 md:grid-cols-4 md:gap-y-14 md:py-24">
        {stats.map((stat, i) => (
          <div key={stat.label} className="relative px-2 text-center xs:px-4 md:px-8">
            {i > 0 && (
              <span
                data-rule
                aria-hidden
                className="absolute inset-y-0 left-0 hidden w-px bg-board md:block"
              />
            )}
            <div data-stat>
              <p className="font-display text-[2.1rem] leading-none xs:text-[2.5rem] md:text-5xl">
                <CountUp to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 text-[0.58rem] font-medium tracking-[0.18em] uppercase text-ink-soft xs:text-[0.62rem] xs:tracking-[0.24em] md:mt-4">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
