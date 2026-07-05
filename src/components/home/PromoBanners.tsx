import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";

/**
 * Etsy's two-up rounded promo banners, recoloured for Aveline:
 * bedding sets (beeswax) + hotel & bulk (powder blue).
 */
export function PromoBanners({
  setsImage,
  hotelImage,
}: {
  setsImage: string;
  hotelImage: string;
}) {
  return (
    <section className="container-x grid gap-5 py-12 md:grid-cols-2 md:py-16" aria-label="Offers">
      <Reveal>
        <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-beeswax sm:flex-row">
          <div className="flex flex-1 flex-col items-start justify-center gap-4 p-8 md:p-10">
            <span className="badge-img">Save 20%</span>
            <h3 className="font-display text-2xl leading-snug md:text-3xl">
              The complete bed, boxed.
            </h3>
            <p className="text-sm leading-relaxed text-ink-soft">
              Seven matching pieces, one gift-ready box — 20% less than buying them alone.
            </p>
            <Link href="/shop?category=bedding-sets" className="btn btn-solid btn-sm">
              Shop bedding sets
            </Link>
          </div>
          <div className="relative min-h-[11rem] sm:w-[42%]">
            <Image
              src={setsImage}
              alt="Aveline signature bedding set"
              fill
              sizes="(max-width: 640px) 100vw, 24vw"
              className="object-cover"
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-powder sm:flex-row">
          <div className="flex flex-1 flex-col items-start justify-center gap-4 p-8 md:p-10">
            <span className="badge-img">For hospitality</span>
            <h3 className="font-display text-2xl leading-snug md:text-3xl">
              Five-star sheets, wholesale.
            </h3>
            <p className="text-sm leading-relaxed text-ink-soft">
              Commercial-laundry tested percale for hotels and villas — priced by volume.
            </p>
            <Link href="/hotel-bulk" className="btn btn-solid btn-sm">
              Get a bulk quote
            </Link>
          </div>
          <div className="relative min-h-[11rem] sm:w-[42%]">
            <Image
              src={hotelImage}
              alt="Hotel bedroom dressed in Aveline linen"
              fill
              sizes="(max-width: 640px) 100vw, 24vw"
              className="object-cover"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
