"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * A giant outlined display word that tracks sideways with scroll,
 * floating behind a section's content like an editorial watermark.
 */
export function WatermarkWord({
  word,
  className,
}: {
  word: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          wordRef.current,
          { xPercent: 4 },
          {
            xPercent: -22,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 select-none overflow-hidden ${className ?? ""}`}
    >
      <span
        ref={wordRef}
        style={{ WebkitTextStroke: "1px rgba(34,34,34,0.16)" }}
        className="block whitespace-nowrap font-display text-[16vw] italic leading-none text-transparent will-change-transform"
      >
        {word}
      </span>
    </div>
  );
}
