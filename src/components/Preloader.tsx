"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "@/lib/gsap";

const COLLECTIONS = ["Fragrance", "Wellness", "Pearls", "Fashion", "Home", "Sleep"];
const PANELS = 6;

/**
 * The intro timeline runs ~2.6s. On a warm cache the assets resolve in under a
 * second, which would flash the curtain open before the sequence reads as
 * intentional — so the exit also waits on this floor.
 */
const MIN_DURATION_MS = 2200;

/**
 * The maison curtain — a fully GSAP-driven opening title sequence.
 *
 * Build: six ivory panels stand as a curtain; a gold hairline draws across the
 * centre; the ENIVRANT lockup is wiped in behind a moving satin sheen; the six
 * collection names cycle on a loop while assets load; a quiet counter tracks
 * real progress. On completion the sheen sweeps once more, the content lifts,
 * and the six panels rise in a stagger to reveal the page — then
 * `preloader-complete` fires so the hero can start its own entrance.
 *
 * The curtain waits on the hero's own assets (poster, film and fonts), so the
 * hero is fully painted and ready to animate the instant it is revealed.
 *
 * Reduced motion gets the same sequence with no transforms: a static mark, a
 * fade, and a straight cut to the page.
 */
export function Preloader({ images, videos = [] }: { images: string[]; videos?: string[] }) {
  const [progress, setProgress] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  // Load tracking — never let a failed asset hold the curtain shut.
  useEffect(() => {
    let loaded = 0;
    const total = images.length + videos.length + 1; // images + films + fonts
    const state = { val: 0 };
    const percentEl = rootRef.current?.querySelector<HTMLElement>("[data-percent]");

    if (typeof window !== "undefined") {
      (window as unknown as { __preloaderComplete?: boolean }).__preloaderComplete = false;
    }

    const bump = () => {
      loaded++;
      const target = Math.min(Math.round((loaded / total) * 100), 100);
      gsap.to(state, {
        val: target,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
          const v = Math.round(state.val);
          if (percentEl) percentEl.textContent = String(v).padStart(2, "0");
          if (v >= 100) setProgress(100);
        },
      });
    };

    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = bump;
      img.onerror = bump;
    });

    // Films count once they have real frames decoded (`loadeddata`), not once
    // metadata arrives — otherwise the hero reveals to an empty black box.
    const filmEls = videos.map((src) => {
      const v = document.createElement("video");
      v.muted = true;
      v.preload = "auto";
      v.playsInline = true;
      v.addEventListener("loadeddata", bump, { once: true });
      v.addEventListener("error", bump, { once: true });
      v.src = src;
      v.load();
      return v;
    });

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(bump).catch(bump);
    } else {
      setTimeout(bump, 500);
    }

    return () => {
      // Release the probe elements; the browser keeps the bytes cached.
      filmEls.forEach((v) => {
        v.removeAttribute("src");
        v.load();
      });
    };
  }, [images, videos]);

  // Intro timeline
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(q("[data-mark], [data-meta], [data-rule], [data-word]"), {
          clearProps: "all",
          autoAlpha: 1,
        });
        gsap.set(q("[data-word]"), { autoAlpha: 0 });
        gsap.set(q("[data-word]:first-child"), { autoAlpha: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();

        // 1. Gold hairlines draw out from the centre.
        tl.fromTo(
          q("[data-rule]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: "power3.inOut", stagger: 0.08 }
        )
          // 2. The lockup wipes in from below its own mask.
          .fromTo(
            q("[data-mark-inner]"),
            { yPercent: 108 },
            { yPercent: 0, duration: 1.15, ease: "power4.out" },
            "-=0.75"
          )
          // 3. A satin sheen crosses the mark.
          .fromTo(
            q("[data-sheen]"),
            { xPercent: -130 },
            { xPercent: 130, duration: 1.5, ease: "power2.inOut" },
            "-=0.6"
          )
          // 4. Counter, rule and cycling words arrive.
          .fromTo(
            q("[data-meta]"),
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
            "-=1.1"
          );

        // Collection names cycle on their own loop while assets load.
        const words = q("[data-word]");
        if (words.length) {
          gsap.set(words, { autoAlpha: 0, yPercent: 100 });
          const cycle = gsap.timeline({ repeat: -1, delay: 0.9 });
          words.forEach((word) => {
            cycle
              .to(word, { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: "power3.out" })
              .to(word, { autoAlpha: 0, yPercent: -100, duration: 0.45, ease: "power3.in" }, "+=0.5");
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  // Exit timeline — runs once loading is done AND the intro has had its floor.
  useEffect(() => {
    if (progress < 100 || !minElapsed) return;
    const root = rootRef.current;
    if (!root) return;

    // Announcing and unmounting are deliberately separate. The hero is told to
    // start the moment the panels BEGIN to rise, so its headline animates in
    // behind the lifting curtain; the overlay itself is only torn down once the
    // panels have finished travelling.
    const announce = () => {
      if (typeof window !== "undefined") {
        (window as unknown as { __preloaderComplete?: boolean }).__preloaderComplete = true;
        window.dispatchEvent(new CustomEvent("preloader-complete"));
      }
    };
    const finish = () => {
      announce(); // no-op if the panel tween already fired it
      setIsMounted(false);
    };

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.to(root, { autoAlpha: 0, duration: 0.35, onComplete: finish });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ onComplete: finish, delay: 0.25 });

        // A last sheen across the mark, then the content lifts away…
        tl.fromTo(
          q("[data-sheen]"),
          { xPercent: -130 },
          { xPercent: 130, duration: 0.9, ease: "power2.inOut" }
        )
          .to(
            q("[data-meta]"),
            { autoAlpha: 0, y: -14, duration: 0.4, stagger: 0.05, ease: "power2.in" },
            "-=0.55"
          )
          .to(q("[data-mark-inner]"), { yPercent: -108, duration: 0.75, ease: "power3.inOut" }, "-=0.2")
          .to(q("[data-rule]"), { scaleX: 0, duration: 0.5, ease: "power3.in" }, "<")
          // …and the curtain rises, panel by panel.
          .to(
            q("[data-panel]"),
            {
              yPercent: -100,
              duration: 1.05,
              ease: "power4.inOut",
              stagger: 0.07,
              onStart: announce,
            },
            "-=0.25"
          );
      });
    }, root);

    return () => ctx.revert();
  }, [progress, minElapsed]);

  if (!isMounted) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-50" aria-hidden>
      {/* The curtain */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: PANELS }, (_, i) => (
          <div key={i} data-panel className="h-full flex-1 bg-cream will-change-transform" />
        ))}
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-6">
        {/* Hairline rules flanking the mark */}
        <div className="mb-12 flex w-full max-w-2xl items-center gap-6">
          <span data-rule className="h-px flex-1 origin-right bg-clay/45" />
          <span data-rule className="h-px flex-1 origin-left bg-clay/45" />
        </div>

        {/* Lockup, wiped in behind a moving sheen */}
        <div data-mark className="relative overflow-hidden">
          <div data-mark-inner className="will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/enivrant-lockup.png"
              alt=""
              width={1034}
              height={459}
              className="h-[86px] w-auto md:h-[104px]"
            />
          </div>
          <span
            data-sheen
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/70 to-transparent will-change-transform"
          />
        </div>

        {/* Cycling collection names */}
        <div data-meta className="mt-9 h-5 overflow-hidden">
          <div className="relative h-5">
            {COLLECTIONS.map((word) => (
              <span
                key={word}
                data-word
                className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-[0.6rem] font-medium tracking-[0.34em] uppercase text-ink-soft"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Counter */}
        <div data-meta className="mt-10 flex items-baseline gap-1.5">
          <span data-percent className="font-display text-[2.4rem] leading-none tracking-tight text-ink">
            00
          </span>
          <span className="font-display text-base italic text-clay">%</span>
        </div>

        <p
          data-meta
          className="mt-8 text-[0.58rem] font-medium tracking-[0.3em] uppercase text-taupe"
        >
          Maison de Luxe · Colombo
        </p>
      </div>
    </div>
  );
}
