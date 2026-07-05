import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";
import { Reveal, Stagger, StaggerItem } from "@/components/anim/Reveal";

/**
 * Etsy's circular category cards row — image circle + label, six across.
 */
export function CategoryCircles({
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
    <section className="container-x py-12 md:py-16" aria-label="Shop by category">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl md:text-4xl">Shop bedding by category</h2>
        <Link
          href="/shop"
          className="text-sm font-medium text-ink underline-offset-4 hover:text-clay hover:underline"
        >
          See everything →
        </Link>
      </Reveal>

      <Stagger className="grid grid-cols-3 gap-x-4 gap-y-7 sm:gap-x-6 lg:grid-cols-6" stagger={0.07}>
        {items.map((item) => (
          <StaggerItem key={item.name}>
            <Link href={item.href} className="group flex flex-col items-center gap-3 text-center">
              <span className="relative block aspect-square w-full max-w-[9.5rem] overflow-hidden rounded-full bg-sand shadow-card ring-0 ring-clay/0 transition-all duration-300 group-hover:shadow-lift group-hover:ring-4 group-hover:ring-clay/25">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 30vw, 9.5rem"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                />
              </span>
              <span className="text-[0.9rem] font-medium leading-snug underline-offset-4 group-hover:underline">
                {item.name}
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
