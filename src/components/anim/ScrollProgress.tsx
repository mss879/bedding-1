"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * A gold hairline that fills across the very top of the page as you read.
 * Fixed above the header; purely decorative, so it is hidden from the a11y tree
 * and skipped entirely under reduced motion.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(ref.current, { scaleX: 0, transformOrigin: "left center" });
        const st = ScrollTrigger.create({
          start: 0,
          end: () => document.documentElement.scrollHeight - window.innerHeight,
          onUpdate: (self) => gsap.set(ref.current, { scaleX: self.progress }),
        });
        return () => st.kill();
      });
    },
    { scope: ref }
  );

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-px bg-transparent">
      <div ref={ref} className="h-full w-full bg-clay will-change-transform" />
    </div>
  );
}
