"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_REDUCE, () => {
        gsap.set(ref.current, { clearProps: "all" });
      });
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ref.current,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 88%",
              toggleActions: once ? "play none none none" : "play none none reverse",
            },
          }
        );
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Image (or block) that un-masks from the bottom with a subtle zoom-out. */
export function MaskReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_REDUCE, () => {
        gsap.set([ref.current, innerRef.current], { clearProps: "all" });
      });
      mm.add(MOTION_OK, () => {
        const trigger = {
          trigger: ref.current,
          start: "top 88%",
          toggleActions: "play none none none",
        };
        gsap.fromTo(
          ref.current,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, delay, ease: "power4.out", scrollTrigger: trigger }
        );
        gsap.fromTo(
          innerRef.current,
          { scale: 1.18 },
          { scale: 1, duration: 1.4, delay, ease: "power3.out", scrollTrigger: trigger }
        );
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <div ref={innerRef} className="h-full">
        {children}
      </div>
    </div>
  );
}

/**
 * Staggers `<StaggerItem>` children into view. Uses ScrollTrigger.batch so
 * long grids cascade as each row enters, not all at once.
 */
export function Stagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-stagger]", ref.current);
      if (!items.length) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_REDUCE, () => {
        gsap.set(items, { clearProps: "all" });
      });
      mm.add(MOTION_OK, () => {
        gsap.set(items, { autoAlpha: 0, y: 36 });
        ScrollTrigger.batch(items, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger }),
        });
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-stagger className={className}>
      {children}
    </div>
  );
}
