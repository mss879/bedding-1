import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/catalog";
import { BasketView } from "@/components/cart/BasketView";
import { Reveal } from "@/components/anim/Reveal";

export const metadata: Metadata = {
  title: "Your basket",
  description: "Review the pieces you've chosen before checking out with Enivrant.",
  robots: { index: false, follow: true },
};

export default async function BasketPage() {
  const featured = await getFeaturedProducts();

  return (
    <div className="bg-cream pt-6 md:pt-8">
      <div className="container-x">
        <nav aria-label="Breadcrumb" className="mb-8 text-[0.72rem] tracking-wide text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-clay">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              Basket
            </li>
          </ol>
        </nav>

        <Reveal className="mb-10 md:mb-12">
          <p className="eyebrow">Your selection</p>
          <h1 className="mt-3 font-display text-[2.2rem] leading-tight xs:text-4xl md:text-[3.4rem]">
            The basket
          </h1>
        </Reveal>
      </div>

      <BasketView suggestions={featured} />
    </div>
  );
}
