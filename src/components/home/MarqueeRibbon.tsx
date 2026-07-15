import { VelocityMarquee } from "@/components/anim/VelocityMarquee";

const items = [
  "365-day guarantee",
  "Free delivery over Rs 25,000",
  "Handmade in Sri Lanka",
  "Hotel & villa partners",
  "Responsibly sourced materials",
];

/** Scroll-reactive promo strip under the hero — drifts, speeds up with scroll. */
export function MarqueeRibbon() {
  return (
    <div className="mt-6 border-y hairline bg-accent-tint py-3">
      <VelocityMarquee baseVelocity={2}>
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-6 pr-6 text-[0.82rem] font-semibold tracking-wide text-clay-dark"
          >
            {item}
            <span aria-hidden className="text-clay">
              ✦
            </span>
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}
