import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem, MaskReveal } from "@/components/anim/Reveal";
import { LineReveal } from "@/components/anim/TextReveal";
import { ParallaxImage } from "@/components/anim/ParallaxImage";
import { ScrollExpand } from "@/components/anim/ScrollExpand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The maison",
  description:
    "The Enivrant story — a Colombo atelier composing fragrance, wellness rituals, fine pearls, quiet fashion and bedlinen by hand.",
};

const values = [
  {
    title: "Made to last",
    copy: "Unheated Ceylon sapphires, 22-momme silk, 800-fill down, full-grain leather. Materials chosen for how they hold up after the hundredth wearing — not how they photograph on the first.",
  },
  {
    title: "Made by hand",
    copy: "Every blend, knot, setting and hem is finished by a person. Small batches, signed work, and a name attached to each piece that leaves the door.",
  },
  {
    title: "Made fairly",
    copy: "Our atelier pays fair wages and keeps honest hours. Pearls, gemstones, flax and leather are traceable to source, and we will tell you where any of it came from.",
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
              The maison
            </li>
          </ol>
        </nav>

        <Reveal>
          <p className="eyebrow">Our story</p>
        </Reveal>
        <LineReveal
          as="h1"
          animateOnMount
          delay={0.15}
          lines={["A house built", "around the senses."]}
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
            <p>
              <span className="text-ink">Enivrant</span> — French for intoxicating —
              began with a single question in a Colombo workshop: why does everything
              made beautifully here leave the island under someone else&rsquo;s name?
            </p>
            <p>
              We started with fragrance, because scent is the sense that keeps.
              Jasmine picked after dark, Ceylon cinnamon from the wet zone, tea from
              a single hill-country estate. Then the people wearing it asked for the
              pearls, the linen, the bath, the bed.
            </p>
            <p>
              Today the maison keeps six collections and one rule: nothing leaves the
              atelier that a person here would not keep. Everything is composed, strung
              and sewn under one roof, and every piece still passes through the same
              small number of hands.
            </p>
          </Reveal>
        </div>
      </section>

      <ScrollExpand
        src="/images/editorial/about-pearls.webp"
        alt="Pearls being knotted onto silk thread at a jeweller's bench"
        eyebrow="The atelier"
        title="Slow made, in a fast world."
        body="No seasonal churn, no landfill collections. We make fewer things, better — and we stand behind each of them for 365 days."
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
            <h2 className="font-display text-[2.1rem] leading-tight xs:text-4xl md:text-5xl">
              Come and live with it
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
              Browse what is on the bench right now, or write to us — every message
              is answered by someone who works on the pieces themselves.
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
