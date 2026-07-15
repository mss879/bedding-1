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
    img("1610701596007-11502861dcfa", 900),
    img("1581783342308-f792dbdd27c5", 900),
    img("1552321554-5fefe8c9ef14", 900),
    img("1616594039964-ae9021a400a0", 900),
  ];

  return (
    <>
      <Preloader images={heroImages} />
      <Hero
        tiles={[
          { src: heroImages[0], alt: "Hand-thrown stoneware dinner set" },
          { src: heroImages[1], alt: "Hand-thrown ceramic vase with dried stems" },
          { src: heroImages[2], alt: "Teak bath caddy across a filled tub" },
          { src: heroImages[3], alt: "Bed dressed in terracotta linen" },
        ]}
      />
      <MarqueeRibbon />
      <CategoryCircles
        categories={categories}
        extra={{
          href: "/hotel-bulk",
          name: "Hotel & Trade",
          image: img("1611892440504-42a792e24d32", 800),
        }}
      />
      <ProductRail
        products={featured}
        title="Today's best finds for the home"
        subtitle="Fresh from the workshop — in stock and ready to ship."
        moreHref="/shop"
        moreLabel="See more"
      />
      <EditorsPicks categories={categories} />
      <ScrollExpand
        src={img("1493809842364-78817add7ffb", 2400)}
        alt="A warm living room layered with timber, clay and natural textiles"
        eyebrow="The Ivory Homez difference"
        title="Craft you can feel from here."
        body="Solid teak, hand-thrown clay and long-staple fibres — chosen for the hundredth use, not the first photo. Scroll in close: this is what well-made feels like."
        ctaLabel="Feel it yourself"
        ctaHref="/shop"
      />
      <PromoBanners
        roomImage={img("1505693416388-ac5ce068fe85", 1200)}
        tradeImage={img("1611892440504-42a792e24d32", 1200)}
      />
      <ReviewsRow />
      <ValueProps />
    </>
  );
}
