import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";

/**
 * Two-up promo panels: the gift edit (champagne) and hotel & trade (dusty blue).
 */
export function PromoBanners({
  giftImage,
  tradeImage,
}: {
  giftImage: string;
  tradeImage: string;
}) {
  return (
    <section className="container-x section-y grid gap-5 md:grid-cols-2" aria-label="Offers">
      <Reveal>
        <div className="flex h-full flex-col overflow-hidden rounded-sm bg-beeswax sm:flex-row">
          <div className="flex flex-1 flex-col items-start justify-center gap-4 p-9 md:p-11">
            <span className="eyebrow">The gift edit</span>
            <h3 className="font-display text-[2.1rem] leading-tight md:text-[2.5rem]">
              Wrapped, ribboned, ready.
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
              A perfume, a pearl, a silk mask — boxed in ivory and finished with a
              hand-tied ribbon at no extra cost.
            </p>
            <Link href="/shop?category=fragrances" className="btn btn-solid btn-sm mt-1">
              Shop the gift edit
            </Link>
          </div>
          <div className="relative min-h-[13rem] sm:w-[44%]">
            <Image
              src={giftImage}
              alt="An ivory gift box holding a perfume, a pearl bracelet and a silk sleep mask"
              fill
              sizes="(max-width: 640px) 100vw, 24vw"
              className="object-cover"
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="flex h-full flex-col overflow-hidden rounded-sm bg-powder sm:flex-row">
          <div className="flex flex-1 flex-col items-start justify-center gap-4 p-9 md:p-11">
            <span className="eyebrow">Hospitality &amp; trade</span>
            <h3 className="font-display text-[2.1rem] leading-tight md:text-[2.5rem]">
              Whole properties, one atelier.
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
              Guest rooms, spas and amenity programmes supplied to spec — priced by
              volume, sampled before you commit.
            </p>
            <Link href="/hotel-bulk" className="btn btn-solid btn-sm mt-1">
              Request a trade quote
            </Link>
          </div>
          <div className="relative min-h-[13rem] sm:w-[44%]">
            <Image
              src={tradeImage}
              alt="Folded waffle robes and amenity bottles on a teak tray in a hotel suite"
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
