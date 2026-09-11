import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem, MaskReveal } from "@/components/anim/Reveal";
import { LineReveal } from "@/components/anim/TextReveal";
import { ParallaxImage } from "@/components/anim/ParallaxImage";
import { ScrollExpand } from "@/components/anim/ScrollExpand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Enivrant curates the finest expressions of elegance across fashion, fragrance, wellness, home and jewellery — working in close partnership with select manufacturers and suppliers for authenticity, craftsmanship and exclusivity.",
  alternates: { canonical: "/about" },
};

// The three qualities the partnerships exist to guarantee.
const values = [
  {
    title: "Authenticity",
    copy: "We know the makers behind the pieces we carry, so provenance is something we can account for rather than something we repeat from a listing. Every product is chosen with care.",
  },
  {
    title: "Craftsmanship",
    copy: "Limited-edition perfumes, artisanal wellness essentials, rare pearls, fine jewellery and hotel-grade bedlinen — selected for the skill in them, not the volume behind them.",
  },
  {
    title: "Exclusivity",
    copy: "Luxury is not mass-produced. Collections stay small and deliberate, built for discerning individuals who would rather own one considered thing than five forgettable ones.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-cream">
      <section className="container-x pb-20 pt-6 md:pb-28 md:pt-8">
        <nav aria-label="Breadcrumb" className="mb-10 text-[0.72rem] tracking-wide text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-clay">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              About us
            </li>
          </ol>
        </nav>

        <Reveal>
          <p className="eyebrow">About {site.name}</p>
        </Reveal>
        <LineReveal
          as="h1"
          animateOnMount
          delay={0.15}
          lines={["Luxury is not", "mass-produced."]}
          className="mt-5 max-w-4xl font-display text-[2.5rem] leading-[1.04] xs:text-5xl md:text-7xl"
        />

        <div className="mt-16 grid gap-10 md:mt-20 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <MaskReveal className="rounded-sm">
            <ParallaxImage
              src="/images/editorial/about-atelier.webp"
              alt="A perfumer's bench of glass vials, botanicals and a brass scale"
              className="aspect-[4/5] w-full rounded-sm"
              strength={9}
            />
          </MaskReveal>
          <Reveal
            delay={0.2}
            className="max-w-lg space-y-6 self-center text-[0.95rem] leading-relaxed text-ink-soft"
          >
            {/* Client copy, Sep 2026 — revised with a French speaker so the
                name reads as captivating, never as toxic. Keep it verbatim. */}
            <p>
              At <span className="text-ink">Enivrant</span> — in French,{" "}
              <em>enivrant</em> literally translates to “intoxicating” — but not
              in the sense of toxicity or harm. It speaks to being captivating,
              alluring, and irresistibly moving, the way a fragrance, a piece of
              music, or a work of art can intoxicate the senses. We believe
              luxury should embody this spirit: pure, enriching, and deeply
              captivating.
            </p>
            <p>
              Our name reflects the essence of what we offer — experiences and
              creations so refined they intoxicate the senses with beauty,
              craftsmanship, and authenticity.
            </p>
            <p>
              Luxury, to us, lies not in quantity but in the quality of
              selection and craftsmanship. Our platform brings together the
              finest expressions of elegance across fashion, fragrance,
              wellness, home, and jewelry, designed for discerning individuals
              worldwide.
            </p>
            <p>
              We work in close partnership with select manufacturers and
              suppliers, building personal relationships that ensure
              authenticity, craftsmanship, and exclusivity. Unlike mass-market
              platforms, we are watchful over every customer interaction, taking
              each purchase and each experience seriously.
            </p>
            <p>
              From limited-edition perfumes and artisanal wellness essentials to
              rare pearls, fine jewelry, and hotel-grade bedlinen, our
              collections are chosen to elevate everyday living into timeless
              luxury.
            </p>
            <p className="font-display text-2xl italic leading-snug text-clay">
              “Enivrant — captivating the senses, elevating the soul.”
            </p>
          </Reveal>
        </div>
      </section>

      <ScrollExpand
        src="/images/editorial/about-pearls.webp"
        alt="Pearls being knotted onto silk thread at a jeweller's bench"
        eyebrow="The collections"
        title="Chosen with intent."
        body="Six collections and one principle: every product is chosen with care, never added simply to complete a range."
      />

      {/* Values */}
      <section className="bg-powder py-20 md:py-28" aria-label="Our values">
        <div className="container-x">
          <Reveal className="mb-12 max-w-xl">
            <p className="eyebrow">Our promise</p>
            <h2 className="mt-4 font-display text-[2.1rem] leading-tight xs:text-4xl md:text-5xl">
              What we stand on
            </h2>
          </Reveal>
          <Stagger className="grid gap-5 md:grid-cols-3" stagger={0.12}>
            {values.map((value, i) => (
              <StaggerItem key={value.title} className="h-full">
                <div className="card-lift h-full p-8">
                  <p className="font-display text-3xl italic text-clay">0{i + 1}</p>
                  <h3 className="mt-4 font-display text-2xl">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{value.copy}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Gallery + closing */}
      <section className="bg-parchment py-20 md:py-28">
        <div className="container-x">
          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            <MaskReveal className="rounded-sm">
              <ParallaxImage
                src="/images/editorial/about-linen.webp"
                alt="Bolts of ivory and oat linen stacked on an oak cutting table"
                className="aspect-[4/3] w-full rounded-sm"
                strength={8}
              />
            </MaskReveal>
            <MaskReveal delay={0.15} className="rounded-sm">
              <ParallaxImage
                src="/images/editorial/contact-boutique.webp"
                alt="The interior of the Enivrant boutique in Colombo"
                className="aspect-[4/3] w-full rounded-sm"
                strength={8}
              />
            </MaskReveal>
          </div>

          <Reveal className="mx-auto mt-20 max-w-xl text-center">
            <p className="eyebrow">Commitment to you</p>
            <h2 className="mt-4 font-display text-[2.1rem] leading-tight xs:text-4xl md:text-5xl">
              Personal Connections, Lasting Trust
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
              Our highest priority is ensuring each client feels valued,
              understood, and connected to the artistry behind their purchase.
              We combine curated exclusivity with human-led engagement, so every
              relationship is as refined as the pieces we offer.
            </p>
            <p className="mt-8 font-display text-xl italic text-clay">
              {site.name} — {site.tagline}.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/shop" className="btn btn-solid">
                Explore the maison
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Speak to {site.name}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
