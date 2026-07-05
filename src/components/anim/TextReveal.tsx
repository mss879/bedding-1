"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";

/**
 * Reveals a heading line by line — each line slides up from behind a mask,
 * the way high-end editorial sites stage their headlines. GSAP-driven.
 */
export function LineReveal({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  animateOnMount = false,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  delay?: number;
  animateOnMount?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const spans = gsap.utils.toArray<HTMLElement>("[data-line]", ref.current);
      if (!spans.length) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_REDUCE, () => {
        gsap.set(spans, { clearProps: "all" });
      });
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          spans,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.05,
            delay,
            stagger: 0.14,
            ease: "power4.out",
            scrollTrigger: animateOnMount
              ? undefined
              : { trigger: ref.current, start: "top 86%", toggleActions: "play none none none" },
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span data-line className={`block will-change-transform ${lineClassName ?? ""}`}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
