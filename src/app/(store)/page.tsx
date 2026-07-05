import { getFeaturedProducts, getHomeCategories } from "@/lib/catalog";
import { Hero } from "@/components/home/Hero";
import { Preloader } from "@/components/Preloader";
import { MarqueeRibbon } from "@/components/home/MarqueeRibbon";
import { CategoryCircles } from "@/components/home/CategoryCircles";
import { ProductRail } from "@/components/home/ProductRail";
import { EditorsPicks } from "@/components/home/EditorsPicks";
import { ScrollExpand } from "@/components/anim/ScrollExpand";
import { PromoBanners } from "@/components/home/PromoBanners";
import { ReviewsRow } from "@/components/home/ReviewsRow";
import { ValueProps } from "@/components/home/ValueProps";

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getHomeCategories(),
    getFeaturedProducts(),
  ]);

  const heroImages = [
    img("1616594039964-ae9021a400a0", 900),
    img("1631049552057-403cdb8f0658", 900),
    img("1522771739844-6a9f6d5f14af", 900),
    img("1560185893-a55cbc8c57e8", 900),
  ];

  return (
    <>
      <Preloader images={heroImages} />
      <Hero
        tiles={[
          { src: heroImages[0], alt: "Terracotta linen duvet set" },
          { src: heroImages[1], alt: "Linen pillowcases with hand-tied bows" },
          { src: heroImages[2], alt: "Stonewashed linen sheets" },
          { src: heroImages[3], alt: "Complete bedding set on a styled bed" },
        ]}
      />
      <MarqueeRibbon />
      <CategoryCircles
        categories={categories}
        extra={{
          href: "/hotel-bulk",
          name: "Hotel & Bulk",
          image: img("1611892440504-42a792e24d32", 800),
        }}
      />
      <ProductRail
        products={featured}
        title="Today's best deals on dreamy bedding"
        subtitle="Fresh finds, all in stock and ready to ship."
        moreHref="/shop"
        moreLabel="See more"
      />
      <EditorsPicks categories={categories} />
      <ScrollExpand
        src={img("1505691938895-1758d7feb511", 2400)}
        alt="Moody bedroom dressed in soft layered bedding"
        eyebrow="The Aveline difference"
        title="Fabric you can feel from here."
        body="Long-staple fibres, small-batch dyeing and hand-finished seams. Scroll into the weave — this is what 400 washes later still feels like."
        ctaLabel="Feel it yourself"
        ctaHref="/shop"
      />
      <PromoBanners
        setsImage={img("1560185893-a55cbc8c57e8", 1200)}
        hotelImage={img("1611892440504-42a792e24d32", 1200)}
      />
      <ReviewsRow />
      <ValueProps />
    </>
  );
}
