import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";
import { site } from "@/lib/site";

const props = [
  {
    title: "Carefully curated",
    body: "Luxury is not mass-produced. Every piece is chosen for authenticity, craftsmanship and exclusivity — the finest expressions of elegance across fragrance, wellness, fashion, home and jewellery.",
  },
  {
    title: "Sourced through relationships",
    body: "We work in close partnership with select manufacturers and suppliers, so we can tell you where a piece came from and who made it — not simply that it arrived.",
  },
  {
    title: "Customer excellence, always",
    body: "A 365-day guarantee, complimentary wrapping and a real person on WhatsApp. Every client is treated as an opportunity to deliver excellence, not a ticket number.",
  },
];

/** The maison promise — a calm dusty-blue band in three columns. */
export function ValueProps() {
  return (
    <section className="bg-powder" aria-label={`What is ${site.name}?`}>
      <div className="container-x section-y text-center">
        <Reveal>
          <p className="eyebrow">The maison promise</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-[2.6rem] leading-[1.03] md:text-6xl">
            What makes something worth keeping.
          </h2>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-14 grid gap-12 text-left md:grid-cols-3 md:gap-0 md:divide-x md:divide-ink/10"
        >
          {props.map((item, i) => (
            <div key={item.title} className="md:px-9">
              <p className="font-display text-2xl italic text-clay">0{i + 1}</p>
              <h3 className="mt-3 font-display text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.15} className="mt-16 flex flex-col items-center gap-5">
          <p className="text-sm text-ink-soft">
            Questions about a piece, a size or a scent?
          </p>
          <Link href="/contact" className="btn btn-outline">
            Speak to the concierge
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
