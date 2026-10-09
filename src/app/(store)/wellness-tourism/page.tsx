import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { site, whatsappLink } from "@/lib/site";
import { Reveal, Stagger, StaggerItem, MaskReveal } from "@/components/anim/Reveal";
import { LineReveal } from "@/components/anim/TextReveal";
import { ParallaxImage } from "@/components/anim/ParallaxImage";
import { ProductRail } from "@/components/home/ProductRail";

export const metadata: Metadata = {
  title: "Wellness Tourism — A Global Journey",
  description:
    "From the Ayurvedic retreats of India to the alpine wellness resorts of Switzerland — and Sri Lanka, where ancient Ayurvedic tradition meets modern luxury. With spa vouchers to redeem at your chosen spa.",
  alternates: { canonical: "/wellness-tourism" },
  openGraph: {
    title: `Wellness Tourism — A Global Journey — ${site.name}`,
    description:
      "Ayurvedic retreats, tropical spa sanctuaries, rainforest eco-lodges and alpine resorts — and why Sri Lanka shines among them.",
    url: `${site.url}/wellness-tourism`,
    images: [{ url: "/images/editorial/tourism-hero.webp", alt: "An open-air wellness pavilion over the Indian Ocean at dawn" }],
  },
};

// The client's copy, kept as written (Oct 2026); only the emoji are left out.
const destinations = [
  { place: "India", path: "The Ayurvedic retreats" },
  { place: "Thailand", path: "The tropical spa sanctuaries" },
  { place: "Costa Rica", path: "The rainforest eco‑lodges" },
  { place: "Switzerland", path: "The alpine wellness resorts" },
];

const voucherSteps = [
  { title: "Choose", copy: "Pick a voucher from our platform — a massage, an Ayurvedic ritual, an afternoon for two." },
  { title: "Receive", copy: "Your voucher code arrives on WhatsApp once your payment is confirmed." },
  { title: "Redeem", copy: "Present the code at your chosen spa to unlock the treatment at a reduced price." },
];

const NUMERALS = ["I", "II", "III", "IV"];

export default async function WellnessTourismPage() {
  // Only real voucher products: on a database without migration 0011 there
  // are none, and the section offers the concierge instead.
  const vouchers = (await getProducts("wellness")).filter((p) => p.kind === "voucher");

  return (
    <div className="bg-cream">
      {/* Banner — composed with ivory space on the left third for the title */}
      <section className="relative">
        <div className="relative aspect-[4/3] max-h-[34rem] w-full overflow-hidden xs:aspect-[3/2] sm:aspect-[16/9] md:aspect-[21/9]">
          <Image
            src="/images/editorial/tourism-hero.webp"
            alt="An open-air wellness pavilion over the Indian Ocean at dawn, with linen daybeds and a bowl of frangipani"
            fill
            preload
            sizes="100vw"
            className="object-cover object-[65%_50%] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-cream/20 sm:via-cream/55 sm:to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container-x">
              <div className="max-w-lg">
                <Reveal>
                  <p className="eyebrow">Luxury Wellness</p>
                </Reveal>
                <LineReveal
                  as="h1"
                  animateOnMount
                  delay={0.1}
                  lines={["Wellness Tourism —", "A Global Journey"]}
                  className="mt-4 font-display text-[2.3rem] leading-[1.04] xs:text-[2.7rem] md:text-6xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x pt-8">
        <nav aria-label="Breadcrumb" className="text-[0.72rem] tracking-wide text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-clay">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/shop?category=wellness" className="transition-colors hover:text-clay">
                Luxury Wellness
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              Wellness Tourism
            </li>
          </ol>
        </nav>
      </div>

      {/* A worldwide movement */}
      <section className="section-y" aria-label="A worldwide movement">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">A worldwide movement</p>
            <p className="mt-6 font-display text-[1.65rem] leading-[1.35] text-ink md:text-[2.1rem]">
              Wellness tourism has emerged as a worldwide movement, inviting travelers to seek balance,
              healing, and rejuvenation across diverse cultures and landscapes.
            </p>
            <p className="mt-6 max-w-xl text-[1rem] leading-[1.85] text-ink-soft">
              From the Ayurvedic retreats of India and the tropical spa sanctuaries of Thailand, to the
              rainforest eco‑lodges of Costa Rica and the alpine wellness resorts of Switzerland, each
              destination offers its own path to wellbeing.
            </p>
          </Reveal>

          <Stagger className="self-start divide-y divide-board border-y border-board" stagger={0.08}>
            {destinations.map((d, i) => (
              <StaggerItem key={d.place}>
                <div className="flex items-baseline gap-6 py-6 md:py-7">
                  <span className="w-8 shrink-0 font-display text-lg italic text-clay">{NUMERALS[i]}</span>
                  <span className="flex-1">
                    <span className="block font-display text-[1.9rem] leading-none md:text-[2.3rem]">
                      {d.place}
                    </span>
                    <span className="mt-2 block text-[0.66rem] font-medium tracking-[0.22em] uppercase text-ink-soft">
                      {d.path}
                    </span>
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Sri Lanka */}
      <section className="bg-parchment section-y" aria-label="Sri Lanka">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <MaskReveal className="order-2 lg:order-1">
            <ParallaxImage
              src="/images/editorial/tourism-sri-lanka.webp"
              alt="A Sri Lankan Ayurvedic sanctuary at dawn: a colonnaded courtyard, a lotus pond and brass oil lamps"
              className="aspect-[4/5] w-full rounded-sm"
              strength={8}
            />
          </MaskReveal>
          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="eyebrow">Sri Lanka</p>
            </Reveal>
            <LineReveal
              lines={["Ancient Ayurveda,", "modern luxury."]}
              className="mt-5 font-display text-[2.6rem] leading-[1.04] md:text-6xl"
            />
            <Reveal delay={0.15} className="mt-7 max-w-lg space-y-5 text-[1rem] leading-[1.85] text-ink-soft">
              <p>
                Among these, Sri Lanka shines with its blend of ancient Ayurvedic traditions and modern
                luxury. Serene spa resorts, coastal sanctuaries, and eco‑friendly healing centers make the
                island a haven for those seeking to restore mind, body, and soul.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* A global tapestry */}
      <section className="section-y" aria-label="A global tapestry of wellness">
        <div className="container-x">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span aria-hidden className="mx-auto block h-10 w-px bg-clay/60" />
            <p className="mt-8 font-display text-[1.7rem] leading-[1.35] md:text-[2.4rem]">
              Together, these destinations form a global tapestry of wellness — where heritage therapies,
              natural beauty, and world‑class hospitality converge to create{" "}
              <span className="italic text-clay">transformative experiences</span> for travelers everywhere.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Wellness vouchers & spa discounts */}
      <section id="vouchers" className="scroll-mt-32 bg-beeswax section-y" aria-label="Wellness vouchers and spa discounts">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Wellness Vouchers &amp; Spa Discounts</p>
              <h2 className="mt-4 font-display text-[2.3rem] leading-[1.05] md:text-[3.2rem]">
                Exclusive savings on wellness experiences
              </h2>
              <p className="mt-6 max-w-md text-[1rem] leading-[1.85] text-ink-soft">
                Purchase discounted vouchers directly from our platform and redeem them at your chosen
                spa. Simply present the discount coupon at the respective spa to unlock special benefits
                and treatments at a reduced price.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop?category=wellness&sub=spa-vouchers" className="btn btn-solid">
                  Browse the vouchers
                </Link>
                <a
                  href={whatsappLink(`Hello ${site.name}! I'd like help planning a wellness retreat.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Plan a retreat with the concierge
                </a>
              </div>
            </Reveal>
            <Stagger className="grid gap-x-6 gap-y-8 sm:grid-cols-3" stagger={0.08}>
              {voucherSteps.map((step, i) => (
                <StaggerItem key={step.title}>
                  <div className="border-t border-clay/30 pt-5">
                    <span className="font-display text-lg italic text-clay">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 font-display text-2xl">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.copy}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {vouchers.length > 0 && (
        <ProductRail
          products={vouchers}
          eyebrow="Spa vouchers"
          title="Treatments, at a reduced price"
          subtitle="Buy here, then present your code at your chosen spa."
          moreHref="/shop?category=wellness&sub=spa-vouchers"
          moreLabel="All vouchers"
          tone="white"
        />
      )}
    </div>
  );
}
