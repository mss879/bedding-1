import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem, MaskReveal } from "@/components/anim/Reveal";
import { LineReveal } from "@/components/anim/TextReveal";
import { ParallaxImage } from "@/components/anim/ParallaxImage";
import { ScrollExpand } from "@/components/anim/ScrollExpand";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Ivory Homez story — ethically handmade bed linen from a small atelier in Colombo, woven for a life well rested.",
};

const img = (id: string, w = 1800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const values = [
  {
    title: "Woven to last",
    copy: "Long-staple cotton and European flax, chosen for how they feel after the hundredth wash, not just the first.",
  },
  {
    title: "Made by hand",
    copy: "Every hem, tie and button placket is finished by a person, not a production line. Small batches, no shortcuts.",
  },
  {
    title: "Fairly made",
    copy: "Our atelier pays fair wages, keeps honest hours and uses OEKO-TEX certified fibres, free of harsh chemicals.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-cream">
      {/* Hero — breadcrumb, story eyebrow, staged headline, image + copy */}
      <section className="container-x pt-6 pb-16 md:pt-8 md:pb-24">
        <nav aria-label="Breadcrumb" className="mb-6 text-[0.8rem] text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-ink hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li aria-current="page" className="text-ink">
              About
            </li>
          </ol>
        </nav>

        <Reveal>
          <p className="mb-3 text-[0.82rem] font-semibold text-clay">Our story</p>
        </Reveal>
        <LineReveal
          as="h1"
          animateOnMount
          delay={0.15}
          lines={["Made by hand.", "Brought into the", "world with love."]}
          className="max-w-4xl font-display text-4xl leading-[1.08] md:text-6xl"
        />
        <div className="mt-12 grid gap-8 md:mt-14 md:gap-10 lg:grid-cols-[1fr_1fr]">
          <MaskReveal className="rounded-3xl">
            <ParallaxImage
              src={img("1560185127-6ed189bf02f4")}
              alt="Sunlight over a softly made bed"
              className="aspect-[4/5] w-full rounded-3xl"
              strength={9}
            />
          </MaskReveal>
          <Reveal delay={0.2} className="max-w-lg space-y-6 self-center text-sm leading-relaxed text-ink-soft md:text-base">
            <p>
              Ivory Homez began with one loom, one seamstress and one belief: that the
              third of your life you spend asleep deserves the same care as the rest.
            </p>
            <p>
              From a small atelier in Colombo we weave, cut and sew bedding in small
              batches — sheets that get softer each year, duvet covers with hand-tied
              closures, and hotel linens that survive the hardest laundry cycles
              without losing their hand feel.
            </p>
            <p>
              Today our bedding dresses homes across the island and the beds of
              boutique hotels beyond it. Every piece still passes through the same
              pairs of hands.
            </p>
          </Reveal>
        </div>
      </section>

      <ScrollExpand
        src={img("1567016432779-094069958ea5", 2400)}
        alt="Detail of soft, textured bedding"
        eyebrow="The atelier"
        title="Slow made, in a fast world."
        body="No seasonal churn, no landfill collections. We make fewer things, better — and stand behind each of them for 365 nights."
      />

      {/* Values band — powder blue, white lifted cards */}
      <section className="bg-powder py-16 md:py-24" aria-label="Our values">
        <div className="container-x">
          <Reveal className="mb-10 max-w-xl">
            <p className="text-[0.82rem] font-semibold text-clay">Our promise</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">What we stand on</h2>
          </Reveal>
          <Stagger className="grid gap-5 md:grid-cols-3" stagger={0.12}>
            {values.map((value, i) => (
              <StaggerItem key={value.title} className="h-full">
                <div className="card-lift h-full p-7">
                  <p className="font-display text-3xl text-clay">0{i + 1}</p>
                  <h3 className="mt-3 font-display text-xl">{value.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{value.copy}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Gallery + closing CTA — white band */}
      <section className="bg-parchment py-16 md:py-24">
        <div className="container-x">
          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            <MaskReveal className="rounded-2xl">
              <ParallaxImage
                src={img("1615874959474-d609969a20ed")}
                alt="Close weave of natural-toned bedding"
                className="aspect-[4/3] w-full rounded-2xl"
                strength={8}
              />
            </MaskReveal>
            <MaskReveal delay={0.15} className="rounded-2xl">
              <ParallaxImage
                src={img("1616486338812-3dadae4b4ace")}
                alt="A calm interior styled with natural textiles"
                className="aspect-[4/3] w-full rounded-2xl"
                strength={8}
              />
            </MaskReveal>
          </div>

          <Reveal className="mx-auto mt-16 max-w-xl text-center md:mt-20">
            <h2 className="font-display text-3xl md:text-4xl">Sleep on it, properly</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
              Browse what&apos;s on the loom right now, or write to us — we answer
              every message ourselves.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/shop" className="btn btn-solid">
                Shop the collection
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
