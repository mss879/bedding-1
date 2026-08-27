import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/anim/Reveal";
import { WordReveal } from "@/components/anim/WordReveal";
import { site } from "@/lib/site";

/**
 * The invitation — a full-bleed ink band carrying the maison's own line, set
 * between the promo panels and the promise. It replaced a row of testimonial
 * cards: the store has not shipped an order yet, so there is nothing honest to
 * quote, and the brand statement does the same job of closing the page.
 */
export function MaisonStatement() {
  return (
    <section className="bg-ink text-linen" aria-label="The invitation">
      <div className="container-x flex flex-col items-center py-24 text-center md:py-32">
        <Reveal>
          <p className="eyebrow text-clay">The invitation</p>
        </Reveal>

        <WordReveal className="mx-auto mt-7 max-w-4xl font-display text-[1.9rem] leading-[1.22] xs:text-[2.3rem] md:text-[3.1rem] md:leading-[1.16]">
          {`Enivrant is more than a destination; it is an invitation to live beautifully, surrounded by treasures that embody sophistication and exclusivity.`}
        </WordReveal>

        <Reveal delay={0.2} className="mt-12 flex flex-col items-center gap-8">
          <Image
            src="/brand/enivrant-monogram-white.png"
            alt=""
            width={191}
            height={195}
            className="h-9 w-auto opacity-70"
          />
          <p className="font-display text-lg italic text-linen/75 md:text-xl">
            {site.name} — {site.tagline}.
          </p>
          <Link href="/about" className="btn btn-white">
            Read our story
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
