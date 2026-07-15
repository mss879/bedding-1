import Link from "next/link";
import { Reveal } from "@/components/anim/Reveal";

const props = [
  {
    title: "Handmade, small batches",
    body: "Every piece — from bed linen to bath caddies — is cut, thrown, sewn or sanded by hand in our Colombo workshop. No factory line, no shortcuts.",
  },
  {
    title: "Direct from the workshop",
    body: "There's no warehouse and no middlemen. What you order is made for you and shipped the same week.",
  },
  {
    title: "Peace of mind",
    body: "365-day guarantee, responsibly sourced materials and a real human on WhatsApp whenever you need us.",
  },
];

/** Etsy's "What is Etsy?" band — powder blue, three columns with dividers. */
export function ValueProps() {
  return (
    <section className="bg-powder" aria-label={`What is Ivory Homez?`}>
      <div className="container-x py-14 text-center md:py-20">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl">What is Ivory Homez?</h2>
          <Link
            href="/about"
            className="mt-2 inline-block text-sm font-medium text-ink underline underline-offset-4 hover:text-clay"
          >
            Read our story, room by room
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 grid gap-10 text-left md:grid-cols-3 md:gap-0 md:divide-x md:divide-ink/10">
          {props.map((item) => (
            <div key={item.title} className="md:px-8">
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.15} className="mt-12 flex flex-col items-center gap-4">
          <p className="text-sm text-ink-soft">
            Have a question? Well, we&rsquo;ve got some answers.
          </p>
          <Link href="/contact" className="btn btn-outline">
            Go to the help corner
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
