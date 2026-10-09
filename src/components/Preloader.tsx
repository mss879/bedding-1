"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";
import { site } from "@/lib/site";

const COLLECTIONS = ["Fragrance", "Wellness", "Pearls", "Fashion", "Home", "Sleep"];
const PANELS = 6;

/**
 * The curtain never lifts sooner than this after the page started loading. On
 * a warm cache the assets resolve in well under a second, which would flash
 * the curtain open before the sequence reads as intentional.
 */
const MIN_DURATION_MS = 2200;

/** How long the CSS intro runs, for browsers that cannot report it themselves. */
const INTRO_FALLBACK_MS = 2500;

type PreloaderWindow = Window & { __preloaderComplete?: boolean };

/** Tells the hero the curtain is lifting (or was never needed), so it can start its entrance. */
function announceComplete() {
  (window as PreloaderWindow).__preloaderComplete = true;
  window.dispatchEvent(new CustomEvent("preloader-complete"));
}

const subscribeNothing = () => () => {};

/**
 * The maison curtain — the opening title sequence of a visit.
 *
 * Six ivory panels stand as a curtain; gold hairlines draw out from the
 * centre, the ENIVRANT lockup is wiped in behind a moving satin sheen, and the
 * collection names cycle while the hero's own assets load (poster, film and
 * fonts). Then the sheen sweeps once more, the content lifts, the panels rise
 * in a stagger, and `preloader-complete` fires so the hero starts its entrance
 * behind the lifting curtain.
 *
 * The intro is CSS (globals.css, "The maison curtain"), so it begins with the
 * first paint of the server-rendered page and is never restarted when the
 * page's JavaScript takes over; the exit is GSAP. The curtain plays once, on a
 * real page load: arriving on the home page from elsewhere on the site skips
 * it, because the visitor has already seen the maison open.
 *
 * Reduced motion gets the finished frame, a fade, and a straight cut to the page.
 */
export function Preloader({ images, videos = [] }: { images: string[]; videos?: string[] }) {
  // True only when this render is hydrating the server's HTML — a real page
  // load. A client-side navigation renders on the client from the start, so
  // the curtain it would show is skipped. Captured once, at first render.
  const hydrating = useSyncExternalStore(
    subscribeNothing,
    () => false,
    () => true
  );
  const [play] = useState(hydrating);

  const [progress, setProgress] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  // Skipped: let the hero start straight away.
  useEffect(() => {
    if (!play) announceComplete();
  }, [play]);

  // The intro's floor: its CSS animations have finished, and the page has been
  // loading for at least MIN_DURATION_MS.
  useEffect(() => {
    if (!play) return;
    const root = rootRef.current;
    let cancelled = false;

    const floor = new Promise<void>((resolve) =>
      setTimeout(resolve, Math.max(0, MIN_DURATION_MS - performance.now()))
    );
    // The curtain's finite CSS animations still running (the word loop never
    // ends, so it is left out). An intro that finished before the scripts
    // arrived is simply no longer listed. Without the Web Animations API, wait
    // out the intro's length instead.
    const finite =
      root && typeof document.getAnimations === "function"
        ? document
            .getAnimations()
            .filter(
              (a) =>
                a.effect instanceof KeyframeEffect &&
                a.effect.target instanceof Node &&
                root.contains(a.effect.target) &&
                a.effect.getComputedTiming().iterations !== Infinity
            )
        : null;
    const intro = finite
      ? Promise.all(finite.map((a) => a.finished.then(() => undefined, () => undefined)))
      : new Promise<void>((resolve) => setTimeout(resolve, INTRO_FALLBACK_MS));

    Promise.all([floor, intro]).then(() => {
      if (!cancelled) setIntroDone(true);
    });
    return () => {
      cancelled = true;
    };
  }, [play]);

  // Load tracking — never let a failed asset hold the curtain shut.
  useEffect(() => {
    if (!play) return;
    let loaded = 0;
    const total = images.length + videos.length + 1; // images + films + fonts
    const state = { val: 0 };

    (window as PreloaderWindow).__preloaderComplete = false;

    const bump = () => {
      loaded++;
      const target = Math.min(Math.round((loaded / total) * 100), 100);
      gsap.to(state, {
        val: target,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
          if (Math.round(state.val) >= 100) setProgress(100);
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

    if (document.fonts) {
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
  }, [play, images, videos]);

  // Exit timeline — runs once loading is done AND the intro has had its floor.
  useEffect(() => {
    if (!play || progress < 100 || !introDone) return;
    const root = rootRef.current;
    if (!root) return;

    // From here GSAP owns these elements. Their CSS intro has finished; this
    // only guarantees no stray CSS animation can outrank GSAP's inline styles.
    root
      .querySelectorAll<HTMLElement>(".curtain-rule, .curtain-mark, .curtain-sheen, .curtain-meta")
      .forEach((el) => {
        el.style.animation = "none";
      });

    // Announcing and unmounting are deliberately separate. The hero is told to
    // start the moment the panels BEGIN to rise, so its headline animates in
    // behind the lifting curtain; the overlay itself is only torn down once the
    // panels have finished travelling.
    const finish = () => {
      announceComplete(); // harmless if the panel tween already announced
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
              onStart: announceComplete,
            },
            "-=0.25"
          );
      });
    }, root);

    return () => ctx.revert();
  }, [play, progress, introDone]);

  if (!play || !isMounted) return null;

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
          <span data-rule className="curtain-rule h-px flex-1 origin-right bg-clay/45" />
          <span data-rule className="curtain-rule h-px flex-1 origin-left bg-clay/45" />
        </div>

        {/* Lockup, wiped in behind a moving sheen */}
        <div data-mark className="relative overflow-hidden">
          <div data-mark-inner className="curtain-mark will-change-transform">
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
            className="curtain-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/70 to-transparent will-change-transform"
          />
        </div>

        {/* Cycling collection names */}
        <div data-meta className="curtain-meta mt-9 h-5 overflow-hidden">
          <div className="relative h-5">
            {COLLECTIONS.map((word) => (
              <span
                key={word}
                className="curtain-word absolute inset-0 flex items-center justify-center whitespace-nowrap text-[0.6rem] font-medium tracking-[0.34em] uppercase text-ink-soft"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <p
          data-meta
          className="curtain-meta curtain-meta-late mt-6 text-[0.58rem] font-medium tracking-[0.3em] uppercase text-taupe"
        >
          {site.tagline}
        </p>
      </div>
    </div>
  );
}
