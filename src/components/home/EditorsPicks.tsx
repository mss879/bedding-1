import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";
import { Reveal, MaskReveal } from "@/components/anim/Reveal";
import { Drift } from "@/components/anim/Drift";
import { ParallaxImage } from "@/components/anim/ParallaxImage";

/**
 * Etsy's Editors' Picks collage — one large tile + four smaller, each photo
 * with a white caption pill. Columns drift at different speeds on scroll.
 */
export function EditorsPicks({ categories }: { categories: Category[] }) {
  if (categories.length < 5) return null;
  const [large, ...small] = categories;

  return (
    <section className="bg-parchment py-14 md:py-20" aria-label="The Aveline edit">
      <div className="container-x">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">The Aveline edit</h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Hand-picked by the people who sew it.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-ink underline-offset-4 hover:text-clay hover:underline"
          >
            Shop all picks →
          </Link>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <MaskReveal className="h-full">
            <Link
              href={`/shop?category=${large.slug}`}
              className="group relative block h-full min-h-[24rem] overflow-hidden rounded-2xl md:min-h-full"
            >
              <ParallaxImage
                src={large.image}
                alt={large.name}
                strength={8}
                sizes="(max-width: 768px) 100vw, 48vw"
                className="absolute inset-0 h-full"
              />
              <CaptionPill large>{large.name}</CaptionPill>
            </Link>
          </MaskReveal>

          <div className="grid grid-cols-2 gap-4 md:gap-5">
            {small.slice(0, 4).map((c, i) => (
              <Drift key={c.slug} from={i % 2 === 0 ? 18 : -14}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="group relative block aspect-square overflow-hidden rounded-2xl"
                >
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 24vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <CaptionPill>{c.name}</CaptionPill>
                </Link>
              </Drift>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CaptionPill({ children, large = false }: { children: React.ReactNode; large?: boolean }) {
  return (
    <span
      className={`absolute bottom-4 left-4 rounded-full bg-white/95 font-medium text-ink shadow-pop backdrop-blur transition-colors group-hover:bg-ink group-hover:text-white ${
        large ? "px-5 py-2.5 text-[0.95rem]" : "px-4 py-2 text-[0.82rem]"
      }`}
    >
      {children}
    </span>
  );
}
