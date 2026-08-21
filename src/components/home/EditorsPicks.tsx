import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";
import { Reveal, MaskReveal } from "@/components/anim/Reveal";
import { Drift } from "@/components/anim/Drift";
import { ParallaxImage } from "@/components/anim/ParallaxImage";

/**
 * The editor's collage — one tall hero tile beside four smaller ones, each
 * captioned with a white plate. Columns drift at different speeds on scroll.
 */
export function EditorsPicks({ categories }: { categories: Category[] }) {
  if (categories.length < 5) return null;
  const [large, ...small] = categories;

  return (
    <section className="section-y bg-parchment" aria-label="The Enivrant edit">
      <div className="container-x">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Curated</p>
            <h2 className="mt-4 font-display text-[2.6rem] leading-[1.03] md:text-6xl">
              The Enivrant edit
            </h2>
            <p className="mt-3 max-w-md text-sm text-ink-soft">
              Chosen by the people who compose, string and sew it.
            </p>
          </div>
          <Link href="/shop" className="link-rule">
            Shop the edit
          </Link>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <MaskReveal className="h-full">
            <Link
              href={`/shop?category=${large.slug}`}
              className="group relative block h-full min-h-[26rem] overflow-hidden rounded-sm md:min-h-full"
            >
              <ParallaxImage
                src={large.image}
                alt={large.name}
                strength={8}
                sizes="(max-width: 768px) 100vw, 48vw"
                className="absolute inset-0 h-full"
              />
              <CaptionPlate large>{large.name}</CaptionPlate>
            </Link>
          </MaskReveal>

          <div className="grid grid-cols-2 gap-4 md:gap-5">
            {small.slice(0, 4).map((c, i) => (
              <Drift key={c.slug} from={i % 2 === 0 ? 18 : -14}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="group relative block aspect-square overflow-hidden rounded-sm"
                >
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 24vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />
                  <CaptionPlate>{c.name}</CaptionPlate>
                </Link>
              </Drift>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CaptionPlate({ children, large = false }: { children: React.ReactNode; large?: boolean }) {
  return (
    <span
      className={`absolute bottom-4 left-4 right-4 rounded-sm bg-white/94 font-display text-ink backdrop-blur transition-colors duration-300 group-hover:bg-ink group-hover:text-white ${
        large ? "px-6 py-4 text-2xl" : "px-4 py-3 text-base"
      }`}
    >
      {children}
    </span>
  );
}
