"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface PreloaderProps {
  images: string[];
}

export function Preloader({ images }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // 1. Initial State
    if (typeof window !== "undefined") {
      (window as any).__preloaderComplete = false;
    }

    let loadedCount = 0;
    const totalAssets = images.length + 1; // images + fonts
    const state = { val: 0 };

    // Initial stagger logo and percent reveal
    gsap.to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
    });
    gsap.to(percentRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.1,
      ease: "power3.out",
    });
    gsap.to(subtitleRef.current, {
      opacity: 0.6,
      y: 0,
      duration: 0.8,
      delay: 0.25,
      ease: "power3.out",
    });

    const updateProgress = () => {
      loadedCount++;
      const targetProgress = Math.min(Math.round((loadedCount / totalAssets) * 100), 100);
      
      gsap.to(state, {
        val: targetProgress,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          const currentVal = Math.round(state.val);
          if (percentRef.current) {
            percentRef.current.textContent = `${currentVal.toString().padStart(2, '0')}%`;
          }
          if (barRef.current) {
            gsap.set(barRef.current, { scaleX: currentVal / 100 });
          }
          if (currentVal >= 100) {
            setProgress(100);
          }
        }
      });
    };

    // Preload Images
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = updateProgress;
      img.onerror = updateProgress; // Don't hang the loader if an image fails
    });

    // Preload Fonts
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(updateProgress).catch(updateProgress);
    } else {
      setTimeout(updateProgress, 500);
    }
  }, [images]);

  // Outro Reveal Animation when progress reaches 100%
  useEffect(() => {
    if (progress < 100) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (typeof window !== "undefined") {
            (window as any).__preloaderComplete = true;
            window.dispatchEvent(new CustomEvent("preloader-complete"));
          }
          setIsMounted(false);
        }
      });

      // Stagger elements fade out
      tl.to([textRef.current, percentRef.current, barRef.current?.parentElement, subtitleRef.current], {
        opacity: 0,
        y: -20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.in"
      });

      // Elegant curtain slide up reveal
      tl.to(overlayRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1.2,
        ease: "power4.inOut"
      }, "-=0.2");
    });

    return () => ctx.revert();
  }, [progress]);

  if (!isMounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream"
      style={{
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      }}
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center select-none">
        {/* Animated Brand Logo */}
        <h2
          ref={textRef}
          className="font-display text-4xl font-semibold lowercase tracking-tight text-clay"
          style={{ opacity: 0, transform: "translateY(20px)" }}
        >
          ivory homez
        </h2>

        {/* Dynamic percentage counter */}
        <div
          ref={percentRef}
          className="mt-8 font-display text-6xl font-medium tracking-tight text-ink"
          style={{ opacity: 0, transform: "translateY(20px)" }}
        >
          00%
        </div>

        {/* Refined Progress Bar */}
        <div 
          className="mt-6 h-[2px] w-48 overflow-hidden rounded-full bg-board"
          style={{ opacity: 0 }}
          ref={(el) => {
            if (el) gsap.to(el, { opacity: 1, duration: 0.6, delay: 0.1 });
          }}
        >
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-clay"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* Soft Subtitle */}
        <p
          ref={subtitleRef}
          className="mt-4 font-sans text-xs tracking-widest uppercase text-ink-soft"
          style={{ opacity: 0, transform: "translateY(15px)" }}
        >
          crafting home comfort...
        </p>
      </div>
    </div>
  );
}
