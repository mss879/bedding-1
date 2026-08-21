import { VelocityMarquee } from "@/components/anim/VelocityMarquee";

const items = [
  "Complimentary gift wrapping",
  "365-day guarantee",
  "Free delivery over Rs 25,000",
  "Made by hand in Colombo",
  "Hotel & villa partners",
  "Responsibly sourced materials",
];

/** Scroll-reactive promo strip — drifts on its own, speeds up with scroll. */
export function MarqueeRibbon() {
  return (
    <div className="border-y hairline bg-accent-tint py-3.5">
      <VelocityMarquee baseVelocity={1.6}>
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-7 pr-7 text-[0.62rem] font-medium tracking-[0.22em] uppercase text-clay-dark"
          >
            {item}
            <span aria-hidden className="text-clay/60">
              ✦
            </span>
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}
