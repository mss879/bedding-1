import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";

/**
 * Etsy's two-up rounded promo banners, recoloured for Ivory Homez:
 * complete-a-room (beeswax) + hotel & trade (powder blue).
 */
export function PromoBanners({
  roomImage,
  tradeImage,
}: {
  roomImage: string;
  tradeImage: string;
}) {
  return (
    <section className="container-x grid gap-5 py-12 md:grid-cols-2 md:py-16" aria-label="Offers">
      <Reveal>
        <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-beeswax sm:flex-row">
          <div className="flex flex-1 flex-col items-start justify-center gap-4 p-8 md:p-10">
            <span className="badge-img">Save 20%</span>
            <h3 className="font-display text-2xl leading-snug md:text-3xl">
              One room, done properly.
            </h3>
            <p className="text-sm leading-relaxed text-ink-soft">
              Bedding, lighting and the vase on the shelf — curated to match,
              priced to save.
            </p>
            <Link href="/shop?category=bedroom" className="btn btn-solid btn-sm">
              Start with the bedroom
            </Link>
          </div>
          <div className="relative min-h-[11rem] sm:w-[42%]">
            <Image
              src={roomImage}
              alt="A calm bedroom styled with Ivory Homez pieces"
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
            <span className="badge-img">For hospitality &amp; trade</span>
            <h3 className="font-display text-2xl leading-snug md:text-3xl">
              Whole properties, one workshop.
            </h3>
            <p className="text-sm leading-relaxed text-ink-soft">
              Guest rooms, restaurants and gardens outfitted to spec — priced by volume.
            </p>
            <Link href="/hotel-bulk" className="btn btn-solid btn-sm">
              Get a trade quote
            </Link>
          </div>
          <div className="relative min-h-[11rem] sm:w-[42%]">
            <Image
              src={tradeImage}
              alt="Hotel bedroom dressed in Ivory Homez linen"
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
