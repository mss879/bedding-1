import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";
import { site, whatsappLink } from "@/lib/site";

/**
 * The assurance band under every listing. It stands where a review wall used to
 * sit: the ratings there were derived from a hash of the product slug and the
 * quotes were written for the demo, so they were removed rather than shipped as
 * social proof. When real reviews exist this is the slot they belong in.
 */
const points = [
  {
    title: "Authenticity assured",
    body: "Sourced through a direct relationship with the maker, so its provenance is something we can account for.",
  },
  {
    title: "Curated exclusivity",
    body: "Chosen for craftsmanship rather than volume — collections stay small and deliberate.",
  },
  {
    title: "365-day guarantee",
    body: "Live with it for a year. If it does not hold up, the concierge will put it right.",
  },
];

export function ProductAssurance() {
  return (
    <section
      className="border-t hairline bg-parchment py-20 md:py-28"
      aria-label={`The ${site.name} assurance`}
    >
      <div className="container-x">
        <Reveal className="mb-12 max-w-xl">
          <p className="eyebrow">The {site.name} assurance</p>
          <h2 className="mt-4 font-display text-[2.1rem] leading-tight md:text-4xl">
            Bought once, looked after since.
          </h2>
        </Reveal>

        <div className="grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-ink/10">
          {points.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.08} className="md:px-9 md:first:pl-0">
              <p className="font-display text-2xl italic text-clay">0{i + 1}</p>
              <h3 className="mt-3 font-display text-2xl">{point.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{point.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-14 flex flex-wrap items-center gap-4">
          <a
            href={whatsappLink(`Hello ${site.name}! I have a question about a piece.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-clay btn-sm"
          >
            Ask the concierge
          </a>
          <Link href="/about" className="link-rule">
            How we curate
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
