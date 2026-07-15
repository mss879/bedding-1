import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem, MaskReveal } from "@/components/anim/Reveal";
import { LineReveal } from "@/components/anim/TextReveal";
import { ParallaxImage } from "@/components/anim/ParallaxImage";
import { ScrollExpand } from "@/components/anim/ScrollExpand";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Ivory Homez story — a Colombo workshop making honest, handmade goods for every room of the home.",
};

const img = (id: string, w = 1800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const values = [
  {
    title: "Built to last",
    copy: "Long-staple cotton, solid teak, high-fire stoneware — materials chosen for how they hold up after the hundredth wash and the hundredth year, not just the first.",
  },
  {
    title: "Made by hand",
    copy: "Every hem, glaze, weave and joint is finished by a person, not a production line. Small batches, no shortcuts.",
  },
  {
    title: "Fairly made",
    copy: "Our workshop pays fair wages, keeps honest hours and uses responsibly sourced fibres, timber and clay.",
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
          lines={["Made by hand.", "For every room", "you live in."]}
          className="max-w-4xl font-display text-4xl leading-[1.08] md:text-6xl"
        />
        <div className="mt-12 grid gap-8 md:mt-14 md:gap-10 lg:grid-cols-[1fr_1fr]">
          <MaskReveal className="rounded-3xl">
            <ParallaxImage
              src={img("1459908676235-d5f02a50184b")}
              alt="A maker's bench crowded with brushes and tools"
              className="aspect-[4/5] w-full rounded-3xl"
              strength={9}
            />
          </MaskReveal>
          <Reveal delay={0.2} className="max-w-lg space-y-6 self-center text-sm leading-relaxed text-ink-soft md:text-base">
            <p>
              Ivory Homez began with one loom, one seamstress and one belief: that
              the everyday things you live with deserve the same care as the
              things you keep for best.
            </p>
            <p>
              We started with bedding — sheets worth the third of your life you
              spend in them. Then the people who slept in our linen asked for the
              kitchen, the bath, the garden. So the workshop grew: a potter&apos;s
              wheel beside the looms, a wood bench beside the cutting table.
            </p>
            <p>
              Today we make for the whole house — stoneware and teak, rattan light
              and washed linen — one room at a time, and every piece still passes
              through the same pairs of hands.
            </p>
          </Reveal>
        </div>
      </section>

      <ScrollExpand
        src={img("1530124566582-a618bc2615dc", 2400)}
        alt="A wall of well-used hand tools in the workshop"
        eyebrow="The workshop"
        title="Slow made, in a fast world."
        body="No seasonal churn, no landfill collections. We make fewer things, better — and stand behind each of them for 365 days."
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
                src={img("1603199506016-b9a594b593c0")}
                alt="Hand-thrown stoneware bowls, stacked and ready for the kiln"
                className="aspect-[4/3] w-full rounded-2xl"
                strength={8}
              />
            </MaskReveal>
            <MaskReveal delay={0.15} className="rounded-2xl">
              <ParallaxImage
                src={img("1616486338812-3dadae4b4ace")}
                alt="A calm interior styled with handmade pieces"
                className="aspect-[4/3] w-full rounded-2xl"
                strength={8}
              />
            </MaskReveal>
          </div>

          <Reveal className="mx-auto mt-16 max-w-xl text-center md:mt-20">
            <h2 className="font-display text-3xl md:text-4xl">Live with it, properly</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
              Browse what&apos;s on the bench right now, or write to us — we answer
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
