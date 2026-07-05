"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * A marquee that reacts to scrolling: it drifts on its own, accelerates
 * with scroll velocity, and reverses direction when you scroll back up.
 * Driven by the GSAP ticker; x wraps every quarter for a seamless loop.
 */
export function VelocityMarquee({
  children,
  baseVelocity = 2.5,
  className,
}: {
  children: ReactNode;
  baseVelocity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const track = trackRef.current;
        if (!track) return;

        const wrap = gsap.utils.wrap(-25, 0);
        const setX = gsap.quickSetter(track, "xPercent");
        let base = 0;
        let direction = 1;
        let lastScroll = window.scrollY;
        let boost = 0;

        const tick = (_time: number, deltaMS: number) => {
          const scroll = window.scrollY;
          const dv = scroll - lastScroll;
          lastScroll = scroll;
          if (dv < 0) direction = -1;
          else if (dv > 0) direction = 1;
          // Smoothed scroll-velocity boost, capped so fast flicks stay tasteful.
          boost += (Math.min(Math.abs(dv) / 6, 4) - boost) * 0.08;
          base += direction * baseVelocity * (deltaMS / 1000) * (1 + boost);
          setX(wrap(base));
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className ?? ""}`}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} aria-hidden={i > 0} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
