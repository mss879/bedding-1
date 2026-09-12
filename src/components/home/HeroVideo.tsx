"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, SplitText, useGSAP, MOTION_OK, MOTION_REDUCE } from "@/lib/gsap";

/**
 * The maison hero: a full-bleed cinematic loop of the maison with the headline
 * set over an ivory scrim.
 *
 * The film is a boomerang (forward + reversed), so it loops with no cut at all.
 * It is decorative, so it carries no audio track and is hidden from the a11y
 * tree — the poster still is the fallback everywhere the video shouldn't or
 * can't play: reduced motion, a save-data connection, or a decode failure.
 * Playback pauses whenever the hero scrolls out of view.
 */
export function HeroVideo({
  src,
  poster,
}: {
  src: string;
  poster: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  // The preloader is an external store: a window flag plus an event.
  const isPreloaded = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("preloader-complete", onChange);
      return () => window.removeEventListener("preloader-complete", onChange);
    },
    () => Boolean((window as unknown as { __preloaderComplete?: boolean }).__preloaderComplete),
    () => false
  );

  // Whether the film may play at all. Subscribed rather than sampled once, so
  // toggling reduced motion swaps to the poster live. The server snapshot is
  // false, so the markup ships poster-only and the film is opted into on the
  // client — never the other way round.
  const allowVideo = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      return !reduce && !conn?.saveData;
    },
    () => false
  );

  // Don't burn a decode loop on a hero nobody is looking at.
  useEffect(() => {
    const host = ref.current;
    const video = videoRef.current;
    if (!host || !video || !allowVideo) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => setVideoFailed(true));
        else video.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(host);
    return () => io.disconnect();
  }, [allowVideo]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      const mm = gsap.matchMedia();

      mm.add(MOTION_REDUCE, () => {
        gsap.set(q("[data-hero-heading], [data-hero-rest]"), { clearProps: "all", autoAlpha: 1 });
      });

      mm.add(MOTION_OK, () => {
        const heading = q("[data-hero-heading]")[0];
        const rest = q("[data-hero-rest]");

        // The from-state is established here, in useGSAP's layout effect, so it
        // lands BEFORE the browser paints — while the curtain still covers the
        // page. Previously the copy was painted in its final position and the
        // animation only set the start state afterwards, which read as the text
        // appearing and then re-animating.
        gsap.set(rest, { autoAlpha: 0, y: 24 });
        const split = SplitText.create(heading, {
          type: "lines,words",
          linesClass: "overflow-hidden pb-[0.1em] -mb-[0.1em]",
        });
        gsap.set(split.words, { yPercent: 115 });
        gsap.set(heading, { autoAlpha: 1 }); // container shown; words still masked

        // Plays the moment the curtain starts lifting, not after it has gone.
        if (isPreloaded) {
          gsap
            .timeline()
            .to(split.words, {
              yPercent: 0,
              duration: 1.35,
              stagger: 0.08,
              ease: "power4.out",
            })
            .to(
              rest,
              { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out" },
              0.35
            );
        }

        // The film drifts up fractionally as the hero scrolls away.
        gsap.to(q("[data-hero-media]"), {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
        });

        return () => split.revert();
      });
    },
    { scope: ref, dependencies: [isPreloaded] }
  );

  const showVideo = allowVideo && !videoFailed;

  return (
    <section ref={ref} className="relative isolate overflow-hidden" aria-label="Welcome">
      {/* Film / poster */}
      <div data-hero-media className="absolute inset-0 -z-10 will-change-transform">
        <Image
          src={poster}
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        {showVideo && (
          <video
            ref={videoRef}
            aria-hidden
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster={poster}
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={src} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Scrim — the film is near-ivory, so the headline needs a real gradient
          behind it rather than a flat wash that would grey the whole frame. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-cream via-cream/80 to-cream/10 md:via-cream/55 md:to-transparent"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-cream/70 via-transparent to-cream/25" />

      {/* svh, not vh: on iOS/Android the URL bar makes 100vh taller than the
          visible viewport, which pushed the CTAs under the fold on first paint. */}
      <div className="container-x relative flex min-h-[calc(100svh-11rem)] items-center py-16 sm:py-24 md:min-h-[calc(100svh-9rem)] md:py-32">
        <div data-hero-copy className="max-w-4xl">
          {/* Set in the wordmark's own face, so the headline reads as the logo
              grown large rather than a second serif beside it.

              The two halves are their own blocks rather than one wrapping
              string: left to the browser it broke mid-phrase and stranded a
              word on its own line. Sizes are tuned so the longer half —
              "Becomes a Lifestyle" — clears its line at every width. Below the
              xs breakpoint the size is fluid rather than fixed: at a flat
              2.05rem the second half wrapped on a 320px phone and stranded
              "Lifestyle" on a third line. */}
          <h1
            data-hero-heading
            className="font-wordmark text-[clamp(1.55rem,8.4vw,2.05rem)] font-normal leading-[1.06] tracking-[-0.01em] text-ink xs:text-[2.55rem] sm:text-[3.6rem] md:text-[4.6rem] md:leading-[1] xl:text-[5.4rem]"
          >
            <span className="block">Where Luxury</span>
            <span className="block">Becomes a Lifestyle</span>
          </h1>
          <p
            data-hero-rest
            className="mt-6 max-w-xl text-balance text-[0.92rem] leading-[1.75] text-ink-soft sm:mt-8 sm:text-[0.98rem] sm:leading-[1.85]"
          >
            Indulge in a curated universe of refinement — from the art of
            self-care and iconic fragrances to timeless pearls, Luxury Fashion
            Designer Selects, and the serenity of fine bedlinen.
          </p>
          {/* Full-bleed on a phone, sized to its label from xs up. */}
          <div
            data-hero-rest
            className="mt-8 flex flex-col items-stretch gap-3 xs:flex-row xs:flex-wrap xs:items-center sm:mt-11"
          >
            <Link href="/shop" className="btn btn-solid">
              Explore the maison
            </Link>
          </div>
          <p
            data-hero-rest
            className="mt-8 max-w-xl text-[0.78rem] leading-relaxed text-ink-soft sm:mt-10 sm:text-[0.82rem]"
          >
            Curated collections, exclusively chosen, authentically yours
          </p>
        </div>
      </div>

    </section>
  );
}
