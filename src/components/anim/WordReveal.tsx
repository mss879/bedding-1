"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";

/**
 * A headline whose words rise from behind their own baseline as the section
 * enters. Uses SplitText with `autoSplit` so it re-splits (and re-plays) once
 * the display serif finishes loading, rather than animating fallback metrics.
 *
 * Reduced motion renders the text plainly — the mask and transforms are cleared
 * rather than skipped, so nothing can be left invisible.
 */
export function WordReveal({
  children,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.075,
}: {
  children: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const target = ref.current;
      if (!target) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_REDUCE, () => {
        gsap.set(target, { clearProps: "all", autoAlpha: 1 });
      });

      mm.add(MOTION_OK, () => {
        const split = SplitText.create(target, {
          type: "lines,words",
          linesClass: "overflow-hidden pb-[0.12em] -mb-[0.12em]",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.words, {
              yPercent: 118,
              duration: 1.25,
              stagger,
              delay,
              ease: "power4.out",
              scrollTrigger: {
                trigger: target,
                start: "top 88%",
                once: true,
              },
            });
          },
        });
        return () => split.revert();
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
