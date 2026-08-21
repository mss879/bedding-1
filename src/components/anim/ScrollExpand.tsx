"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";

/**
 * The signature scroll moment, staged like a film title:
 * a letterbox slit of image sits between the two halves of the headline.
 * As you scroll, the halves drift apart and the slit opens into a
 * full-bleed frame, where the caption fades up. GSAP scrubbed timeline.
 *
 * Animates only clip-path and transforms — no layout properties.
 */
export function ScrollExpand({
  src,
  alt,
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Split the headline into two halves that straddle the opening frame.
  const words = title.split(" ");
  const mid = Math.ceil(words.length / 2);
  const titleLeft = words.slice(0, mid).join(" ");
  const titleRight = words.slice(mid).join(" ");

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const mm = gsap.matchMedia();

      mm.add(MOTION_REDUCE, () => {
        gsap.set(q("[data-clip]"), { clipPath: "inset(0% 0% 0% 0% round 0px)" });
        gsap.set(q("[data-title]"), { autoAlpha: 0 });
        gsap.set(q("[data-eyebrow-float]"), { autoAlpha: 0 });
        gsap.set(q("[data-caption]"), { autoAlpha: 1, y: 0 });
      });

      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
        tl.fromTo(
          q("[data-clip]"),
          { clipPath: "inset(42% 15% 42% 15% round 24px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.6 },
          0
        )
          .fromTo(q("[data-zoom]"), { scale: 1.4 }, { scale: 1, duration: 1 }, 0)
          .fromTo(q("[data-title-left]"), { x: 0 }, { x: "-26vw", duration: 0.5 }, 0.05)
          .fromTo(q("[data-title-right]"), { x: 0 }, { x: "26vw", duration: 0.5 }, 0.05)
          .fromTo(q("[data-title]"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25 }, 0.3)
          .fromTo(q("[data-eyebrow-float]"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25 }, 0.05)
          .fromTo(
            q("[data-caption]"),
            { autoAlpha: 0, y: 48 },
            { autoAlpha: 1, y: 0, duration: 0.2 },
            0.62
          );
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} aria-label={title} className="relative h-[240vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Image layer, revealed through the opening clip */}
        <div data-clip className="absolute inset-0 will-change-[clip-path]">
          <div data-zoom className="absolute inset-0 will-change-transform">
            <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
          </div>
          {/* Enivrant's photography is near-ivory, so white caption text needs a
              deep scrim: a flat wash plus a vertical gradient that concentrates
              contrast behind the headline and body. */}
          <div className="absolute inset-0 bg-ink/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/25 to-ink/55" />
          <div
            data-caption
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-linen"
          >
            <p className="mb-6 text-[0.66rem] font-medium uppercase tracking-[0.3em] text-linen/85">
              {eyebrow}
            </p>
            <p className="max-w-3xl font-display text-5xl leading-[1.05] md:text-7xl">{title}</p>
            <p className="mt-7 max-w-xl text-[0.95rem] leading-relaxed text-linen/85">{body}</p>
            {ctaLabel && ctaHref && (
              <a href={ctaHref} className="btn btn-white mt-10">
                {ctaLabel}
              </a>
            )}
          </div>

          {/* Headline halves — inside the clip, so the container masks them.
              Sized to the viewport so the full line fits the initial slit. */}
          <div
            data-title
            aria-hidden
            className="absolute inset-0 flex items-center justify-center gap-[0.35em] px-4 text-center"
          >
            <span
              data-title-left
              className="whitespace-nowrap font-display text-[clamp(1.15rem,3.2vw,3.1rem)] leading-none text-linen [text-shadow:0_1px_20px_rgba(26,25,23,0.6)] will-change-transform"
            >
              {titleLeft}
            </span>
            <span
              data-title-right
              className="whitespace-nowrap font-display text-[clamp(1.15rem,3.2vw,3.1rem)] leading-none text-linen [text-shadow:0_1px_20px_rgba(26,25,23,0.6)] will-change-transform"
            >
              {titleRight}
            </span>
          </div>
        </div>

        {/* Eyebrow floating above the slit */}
        <p
          data-eyebrow-float
          aria-hidden
          className="absolute inset-x-0 top-[29%] text-center text-[0.66rem] font-medium uppercase tracking-[0.28em] text-clay"
        >
          {eyebrow}
        </p>
      </div>
    </section>
  );
}
