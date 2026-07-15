import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/anim/Reveal";
import { Stars } from "@/components/Stars";

const reviews = [
  {
    name: "Anushka",
    place: "Colombo",
    quote:
      "The stoneware set has survived a year of dinner parties and still looks handmade in the best way. Guests always turn a plate over to ask where it's from.",
    productName: "Glazed Stoneware Dinner Set",
    productSlug: "glazed-stoneware-dinner-set",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&q=80&auto=format&fit=crop",
  },
  {
    name: "Dinesh",
    place: "Kandy",
    quote:
      "Bought the terracotta linen set after seeing it at a boutique hotel. The hand-tied closures are such a lovely detail — you can tell a person made this.",
    productName: "Terracotta Linen Duvet Set",
    productSlug: "terracotta-linen-duvet-set",
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=200&q=80&auto=format&fit=crop",
  },
  {
    name: "Amara",
    place: "Galle",
    quote:
      "Ordered the planter trio and the pendant light as a housewarming gift. Everything arrived wrapped like presents — the whole room feels warmer now.",
    productName: "Terracotta Planter Trio",
    productSlug: "terracotta-planter-trio",
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200&q=80&auto=format&fit=crop",
  },
];

/** Etsy's "Recent reviews from happy shoppers" cards, Ivory Homez edition. */
export function ReviewsRow() {
  return (
    <section className="container-x py-12 md:py-16" aria-label="Customer reviews">
      <Reveal className="mb-8">
        <h2 className="font-display text-3xl md:text-4xl">
          Recent reviews from happy homes
        </h2>
      </Reveal>

      <Stagger className="grid gap-5 md:grid-cols-3" stagger={0.1}>
        {reviews.map((review) => (
          <StaggerItem key={review.name} className="h-full">
            <article className="card-lift flex h-full flex-col gap-4 p-6">
              <Stars rating={5} size={15} />
              <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-ink">
                “{review.quote}”
              </blockquote>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint font-display text-lg text-clay">
                  {review.name[0]}
                </span>
                <div className="text-sm">
                  <p className="font-medium">{review.name}</p>
                  <p className="text-ink-soft">{review.place}</p>
                </div>
              </div>
              <Link
                href={`/product/${review.productSlug}`}
                className="group flex items-center gap-3 border-t hairline pt-4"
              >
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                  <Image src={review.image} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <span className="text-[0.82rem] text-ink-soft">
                  Purchased:{" "}
                  <span className="font-medium text-ink underline-offset-4 group-hover:text-clay group-hover:underline">
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
