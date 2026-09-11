import { VelocityMarquee } from "@/components/anim/VelocityMarquee";

// "Hotel & villa partners" comes back once the first trade partners are signed.
const items = [
  "Complimentary gift wrapping",
  "Authenticity assured",
  "Curated luxury, delivered worldwide",
  "Craftsmanship you can trust",
  "Verified suppliers, authentic products",
  "Empowering artisans & designers worldwide",
  "Secure, effortless shopping",
  "Curated, never mass-produced",
  "Global luxury access",
  "Partnered with designers",
  "Curated elegance online",
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
