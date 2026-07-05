"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * An image that drifts vertically as it moves through the viewport —
 * the classic editorial parallax. The image is oversized inside a
 * clipped frame so the drift never exposes edges.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  strength = 10,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  /** percent of image height it travels */
  strength?: number;
  sizes?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          innerRef.current,
          { yPercent: -strength },
          {
            yPercent: strength,
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
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <div ref={innerRef} className="absolute -inset-y-[12%] inset-x-0 will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          preload={priority}
          sizes={sizes}
          className="object-cover"
        />
      </div>
    </div>
  );
}
