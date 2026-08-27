import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem, MaskReveal } from "@/components/anim/Reveal";
import { LineReveal } from "@/components/anim/TextReveal";
import { ParallaxImage } from "@/components/anim/ParallaxImage";
import { BulkInquiryForm } from "@/components/forms/BulkInquiryForm";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hotel & Trade Orders",
  description:
    "Amenity, linen and interior programmes for hotels, villas, spas and restaurants — bespoke fragrance, robes, bedlinen and stoneware at volume pricing, discussed personally on WhatsApp.",
  alternates: { canonical: "/hotel-bulk" },
};

const segments = [
  {
    name: "Hotels",
    image: "/images/editorial/hotel-seg-hotels.webp",
    copy: "Full-property programmes — guest rooms, spas and amenity lines.",
  },
  {
    name: "Villas & Resorts",
    image: "/images/editorial/hotel-seg-villas.webp",
    copy: "Interiors and outdoor living that survive sun, salt and season.",
  },
  {
    name: "Restaurants & Cafés",
    image: "/images/editorial/hotel-seg-restaurants.webp",
    copy: "Table linen, stoneware and candlelight, made to your spec.",
  },
  {
    name: "Guest Houses",
    image: "/images/editorial/hotel-seg-guest-houses.webp",
    copy: "Small-property pricing with the same five-star hand feel.",
  },
];

const steps = [
  { title: "Inquire", copy: "Send your property details through the form — it lands directly in our WhatsApp." },
  { title: "Consult", copy: "We talk quantities, sizes, materials, budget and timelines. Personally, not by ticket." },
  { title: "Sample", copy: "We send swatches, scent strips and a made-up room kit for your team to trial." },
  { title: "Produce", copy: "Your order is made and quality-checked batch by batch with the partner makers we work with directly." },
  { title: "Deliver", copy: "Packed per room and delivered on your schedule — with reorder support after." },
];

const hospitalityPoints = [
  "Commercial-laundry tested bedlinen, towels and robes",
  "Bespoke signature scent, amenity bottles and embroidered monograms",
  "Volume pricing with reorder support, season after season",
];

export default function HotelBulkPage() {
  return (
    <div className="bg-cream pt-6 md:pt-8">
      <div className="container-x">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-[0.72rem] tracking-wide text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-clay">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              Hotel &amp; trade
            </li>
          </ol>
        </nav>

        {/* Hero — in-flow rounded banner (header is white + sticky above) */}
        <section
          className="relative overflow-hidden rounded-sm"
          aria-label="Hotel and trade orders"
        >
          <Image
            src="/images/banners/hotel-trade.webp"
            alt="A boutique hotel suite dressed in ivory linen at golden hour"
            fill
            preload
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/40" />
          <div className="relative flex min-h-[22rem] flex-col items-start justify-center px-6 py-12 text-linen sm:min-h-[24rem] md:min-h-[28rem] md:px-14 md:py-14">
            <Reveal>
              <p className="text-[0.66rem] font-medium tracking-[0.24em] uppercase text-linen/85">
                For hospitality &amp; trade
              </p>
            </Reveal>
            <LineReveal
              as="h1"
              animateOnMount
              delay={0.15}
              lines={["Properties your guests", "will remember by scent."]}
              className="mt-5 font-display text-[2.5rem] leading-[1.05] xs:text-5xl md:text-7xl"
            />
            <Reveal delay={0.5} className="mt-6 max-w-xl text-sm leading-relaxed text-linen/90 md:text-base">
              <p>
                Trade orders live on quantity, sizing, materials, branding and
                timelines — details better discussed than checked out. Which is why
                this goes straight to a human, on WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={0.65} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href={whatsappLink(`Hello ${site.name}! I'd like to discuss a hotel/trade order.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-clay"
              >
                Chat on WhatsApp
              </a>
              <a href="#inquiry" className="btn btn-white">
                Send an inquiry
              </a>
            </Reveal>
          </div>
        </section>
      </div>

      {/* Who it's for */}
      <section className="py-14 md:py-20" aria-label="Who we supply">
        <div className="container-x">
          <Reveal className="mb-8 md:mb-10">
            <p className="eyebrow">Who we supply</p>
            <h2 className="mt-4 font-display text-[2.1rem] leading-tight xs:text-4xl md:text-5xl">
              Built for busy properties
            </h2>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4" stagger={0.08}>
            {segments.map((segment) => (
              <StaggerItem key={segment.name} className="h-full">
                <div className="group card-lift h-full overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                    <Image
                      src={segment.image}
                      alt={segment.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-display text-xl">{segment.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{segment.copy}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* For-hospitality band (powder blue, Etsy promo style) */}
      <section className="container-x pb-14 md:pb-20" aria-label="For hospitality">
        <Reveal>
          <div className="flex flex-col overflow-hidden rounded-sm bg-powder md:flex-row">
            <div className="flex flex-1 flex-col items-start justify-center gap-4 p-8 md:p-12">
              <span className="badge-img">For hospitality</span>
              <h2 className="font-display text-3xl leading-tight md:text-[2.6rem]">
                Five-star interiors, priced by volume.
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed text-ink-soft md:text-[0.95rem]">
                {hospitalityPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-sale" />
                    {point}
                  </li>
                ))}
              </ul>
              <a href="#inquiry" className="btn btn-solid btn-sm mt-1">
                Request a quote
              </a>
            </div>
            <div className="relative min-h-[13rem] md:w-[42%]">
              <Image
                src="/images/editorial/promo-trade.webp"
                alt="Folded waffle robes and amenity bottles on a teak tray"
                fill
                sizes="(max-width: 768px) 100vw, 34vw"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Process */}
      <section className="bg-parchment py-14 md:py-20" aria-label="How it works">
        <div className="container-x">
          <Reveal className="mb-9 md:mb-12">
            <p className="eyebrow">The process</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">From inquiry to opening day</h2>
          </Reveal>
          <Stagger className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-5" stagger={0.08}>
            {steps.map((step, i) => (
              <StaggerItem key={step.title}>
                <div className="border-t hairline pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint font-display text-lg text-clay">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.copy}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Why WhatsApp + form */}
      <section id="inquiry" className="scroll-mt-24 py-14 md:py-20" aria-label="Inquiry form">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">Trade inquiry</p>
            </Reveal>
            <LineReveal
              lines={["Tell us about", "your property."]}
              className="mt-5 font-display text-5xl leading-[1.05] md:text-6xl"
            />
            <Reveal delay={0.2} className="mt-6 max-w-md space-y-5 text-sm leading-relaxed text-ink-soft md:text-base">
              <p>
                Every property is different — 20 rooms or 200, guest suites or spa
                cabanas, a monogrammed pillowcase or a signature scent composed for
                your lobby. A checkout page cannot hold that conversation.
              </p>
              <p>
                Fill in what you know and we will pick it up from there: swatches,
                scent strips, volume pricing and a delivery plan built around your
                opening calendar.
              </p>
            </Reveal>
            <MaskReveal className="mt-10" delay={0.2}>
              <ParallaxImage
                src="/images/editorial/hotel-seg-hotels.webp"
                alt="A hotel bedroom dressed in ivory linen with a teak amenity tray"
                className="aspect-[4/3] w-full rounded-sm"
                strength={8}
              />
            </MaskReveal>
          </div>
          <Reveal delay={0.15}>
            <BulkInquiryForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      aria-hidden
    >
      <path d="M4.5 12.5l5 5 10-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
