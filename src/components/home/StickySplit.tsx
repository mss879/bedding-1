"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";
import { WordReveal } from "@/components/anim/WordReveal";

export type SplitChapter = { index: string; title: string; body: string };

/**
 * An editorial chapter list: the photograph sits still on the left while the
 * chapters scroll past on the right, each fading up as it reaches the middle
 * of the screen and dimming again as it leaves. The image itself slowly scales
 * across the whole section.
 */
export function StickySplit({
  image,
  alt,
  eyebrow,
  title,
  chapters,
  ctaLabel,
  ctaHref,
}: {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  chapters: SplitChapter[];
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      mm.add(MOTION_REDUCE, () => {
        gsap.set(q("[data-chapter], [data-zoom]"), { clearProps: "all", autoAlpha: 1 });
      });

      mm.add(MOTION_OK, () => {
        // Slow push-in on the pinned photograph across the whole section.
        gsap.fromTo(
          q("[data-zoom]"),
          { scale: 1.14 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
          }
        );

        // Chapters light up as they cross the middle band of the viewport.
        gsap.utils.toArray<HTMLElement>(q("[data-chapter]")).forEach((chapter) => {
          gsap.fromTo(
            chapter,
            { autoAlpha: 0.25, y: 30 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: chapter,
                start: "top 78%",
                end: "bottom 32%",
                toggleActions: "play reverse play reverse",
              },
            }
          );
        });
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="section-y bg-cream" aria-label={title}>
      <div className="container-x grid gap-14 lg:grid-cols-[0.95fr_1fr] lg:gap-20">
        {/* Pinned photograph */}
        {/* top offset = sticky header (148px) + a 76px gap; the height leaves
            the same gap underneath, so the frame is centred in what the header
            does not cover. Revisit both if the header's height changes. */}
        <div className="lg:sticky lg:top-[14rem] lg:h-[calc(100vh-19rem)]">
          <div className="relative h-[26rem] overflow-hidden rounded-sm bg-sand lg:h-full">
            <div data-zoom className="absolute inset-0 will-change-transform">
              <Image src={image} alt={alt} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            </div>
          </div>
        </div>

        {/* Scrolling chapters */}
        <div className="lg:py-16">
          <p className="eyebrow">{eyebrow}</p>
          <WordReveal className="mt-5 font-display text-[2.6rem] leading-[1.03] md:text-6xl">
            {title}
          </WordReveal>

          <div className="mt-16 space-y-16 md:space-y-24">
            {chapters.map((chapter) => (
              <div key={chapter.index} data-chapter className="border-t hairline pt-8">
                <p className="font-display text-sm italic text-clay">{chapter.index}</p>
                <h3 className="mt-4 font-display text-[1.9rem] leading-tight md:text-[2.2rem]">
                  {chapter.title}
                </h3>
                <p className="mt-4 max-w-md text-[0.95rem] leading-[1.85] text-ink-soft">
                  {chapter.body}
                </p>
              </div>
            ))}
          </div>

          {ctaLabel && ctaHref && (
            <Link href={ctaHref} className="btn btn-outline mt-16">
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
