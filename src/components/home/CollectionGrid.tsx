import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { Reveal, Stagger, StaggerItem } from "@/components/anim/Reveal";

/**
 * The six collections on one screen: a single row of tall plates on a laptop,
 * three by two on a tablet and two by three on a phone. It replaced the pinned
 * sideways scroll (client request, Oct 2026) — the row had to be scrolled
 * through before anything below it appeared, and nothing said it would move.
 * Each plate is numbered in gold and lifts its photograph on hover.
 */
export function CollectionGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-parchment py-12 md:py-20 lg:py-16" aria-label="The collections">
      <div className="container-x">
        <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-4 md:mb-11 md:gap-5">
          <div>
            <p className="eyebrow">Six collections</p>
            <h2 className="mt-4 font-display text-[2.1rem] leading-[1.02] xs:text-[2.6rem] md:text-[3.4rem] lg:text-6xl">
              Where Elegance Meets your <span className="italic text-clay">Desire</span>
            </h2>
          </div>
          <Link href="/shop" className="link-rule">
            Discover our universe
          </Link>
        </Reveal>

        <Stagger
          className="grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-6 lg:gap-x-4 xl:gap-x-5"
          stagger={0.07}
        >
          {categories.map((c, i) => (
            <StaggerItem key={c.slug}>
              <Link href={`/shop?category=${c.slug}`} className="group block">
                {/* Capped by the viewport's height on a laptop, so the heading,
                    the row and the captions always fit on one screen. */}
                <span className="relative block aspect-square overflow-hidden rounded-sm bg-sand md:aspect-[4/5] lg:aspect-[3/4] lg:max-h-[52svh]">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 48vw, (max-width: 1024px) 31vw, 15vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  />
                  <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
                </span>
                <span className="mt-3 flex items-baseline justify-center gap-2 text-center md:mt-4 md:gap-2.5">
                  <span className="font-display text-sm italic text-clay">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[1.05rem] leading-tight transition-colors duration-500 group-hover:text-clay md:text-[1.3rem] lg:text-[1.15rem] xl:text-[1.3rem]">
                    {c.name}
                  </span>
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
