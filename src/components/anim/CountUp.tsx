"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";

/**
 * A figure that counts up once as it scrolls into view. The final value is
 * rendered on the server so it is correct without JavaScript and for screen
 * readers; the tween only rewrites textContent while it runs.
 */
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 2,
  className,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_REDUCE, () => {
        el.textContent = `${prefix}${to.toLocaleString("en-US")}${suffix}`;
      });

      mm.add(MOTION_OK, () => {
        const state = { val: 0 };
        gsap.to(state, {
          val: to,
          duration,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(state.val).toLocaleString("en-US")}${suffix}`;
          },
          onComplete: () => {
            el.textContent = `${prefix}${to.toLocaleString("en-US")}${suffix}`;
          },
        });
      });
    },
    { scope: ref }
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {to.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
