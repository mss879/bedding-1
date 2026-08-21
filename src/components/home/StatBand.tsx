"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";
import { CountUp } from "@/components/anim/CountUp";

const STATS = [
  { value: 6, suffix: "", label: "Collections" },
  { value: 12000, suffix: "+", label: "Collectors" },
  { value: 365, suffix: "", label: "Day guarantee" },
  { value: 100, suffix: "%", label: "Made by hand" },
];

/**
 * A quiet band of figures that count up on entry, separated by gold hairlines
 * that draw down from nothing as the band arrives.
 */
export function StatBand() {
  const ref = useRef<HTMLElement>(null);

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
      <div className="container-x grid grid-cols-2 gap-y-14 py-20 md:grid-cols-4 md:py-24">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="relative px-4 text-center md:px-8">
            {i > 0 && (
              <span
                data-rule
                aria-hidden
                className="absolute inset-y-0 left-0 hidden w-px bg-board md:block"
              />
            )}
            <div data-stat>
              <p className="font-display text-[2.75rem] leading-none md:text-5xl">
                <CountUp to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-4 text-[0.62rem] font-medium tracking-[0.24em] uppercase text-ink-soft">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
