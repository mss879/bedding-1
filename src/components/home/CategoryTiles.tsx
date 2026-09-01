import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { Reveal, Stagger, StaggerItem } from "@/components/anim/Reveal";

/**
 * The six collections as tall editorial tiles — a numbered gold index, the
 * collection name in display serif, and a photograph that lifts on hover.
 */
export function CategoryTiles({
  categories,
  extra,
}: {
  categories: Category[];
  extra?: { href: string; name: string; image: string };
}) {
  const items = [
    ...categories.map((c) => ({
      href: `/shop?category=${c.slug}`,
      name: c.name,
      image: c.image,
    })),
    ...(extra ? [extra] : []),
  ];

  return (
    <section className="container-x py-20 md:py-28" aria-label="Shop by collection">
      <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Six collections</p>
          <h2 className="mt-3 max-w-lg font-display text-4xl leading-tight md:text-5xl">
            Where Elegance Meets your Desire
          </h2>
        </div>
        <Link href="/shop" className="link-rule">
          Discover our universe
        </Link>
      </Reveal>

      <Stagger
        className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3"
        stagger={0.07}
      >
        {items.map((item, i) => (
          <StaggerItem key={item.name}>
            <Link href={item.href} className="group block">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-sand">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 48vw, 31vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                />
                <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
              </span>
              <span className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-sm italic text-clay">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-xl leading-tight transition-colors group-hover:text-clay md:text-[1.4rem]">
                  {item.name}
                </span>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
