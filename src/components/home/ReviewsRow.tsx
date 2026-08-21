import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/anim/Reveal";
import { Stars } from "@/components/Stars";

const reviews = [
  {
    name: "Anushka",
    place: "Colombo",
    quote:
      "No. 1 is the first perfume anyone has ever stopped me to ask about — twice in one week. It sits on the skin rather than shouting, which is exactly what I wanted.",
    productName: "Enivrant No. 1 Eau de Parfum",
    productSlug: "enivrant-no-1-eau-de-parfum",
    image: "/images/products/enivrant-no-1-eau-de-parfum-a.webp",
  },
  {
    name: "Dinesh",
    place: "Kandy",
    quote:
      "Bought the pearl strand for our anniversary. The knotting between every pearl is the detail that gave it away as properly made — my wife noticed before I said a word.",
    productName: "Freshwater Pearl Strand Necklace",
    productSlug: "freshwater-pearl-strand-necklace",
    image: "/images/products/freshwater-pearl-strand-necklace-a.webp",
  },
  {
    name: "Amara",
    place: "Galle",
    quote:
      "The silk pillowcases genuinely changed my mornings — no creased face, no frizz. I've since replaced every pillowcase in the house.",
    productName: "Mulberry Silk Pillowcase Pair",
    productSlug: "mulberry-silk-pillowcase-pair",
    image: "/images/products/mulberry-silk-pillowcase-pair-a.webp",
  },
];

/** Recent reviews — three lifted cards with gold stars and the piece bought. */
export function ReviewsRow() {
  return (
    <section className="container-x section-y" aria-label="Customer reviews">
      <Reveal className="mb-14">
        <p className="eyebrow">Word of mouth</p>
        <h2 className="mt-4 font-display text-[2.6rem] leading-[1.03] md:text-6xl">
          From those who wear it.
        </h2>
      </Reveal>

      <Stagger className="grid gap-5 md:grid-cols-3" stagger={0.1}>
        {reviews.map((review) => (
          <StaggerItem key={review.name} className="h-full">
            <article className="card-lift flex h-full flex-col gap-5 p-7 md:p-8">
              <Stars rating={5} size={14} />
              <blockquote className="flex-1 font-display text-[1.28rem] leading-[1.5] text-ink">
                “{review.quote}”
              </blockquote>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint font-display text-lg text-clay">
                  {review.name[0]}
                </span>
                <div className="text-sm">
                  <p className="font-medium">{review.name}</p>
                  <p className="text-[0.8rem] text-ink-soft">{review.place}</p>
                </div>
              </div>
              <Link
                href={`/product/${review.productSlug}`}
                className="group flex items-center gap-3 border-t hairline pt-5"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-sm bg-sand">
                  <Image src={review.image} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <span className="text-[0.78rem] text-ink-soft">
                  Purchased:{" "}
                  <span className="font-medium text-ink transition-colors group-hover:text-clay">
                    {review.productName}
                  </span>
                </span>
              </Link>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
