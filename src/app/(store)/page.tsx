import { getFeaturedProducts, getHomeCategories, getProducts } from "@/lib/catalog";
import { HeroVideo } from "@/components/home/HeroVideo";
import { Preloader } from "@/components/Preloader";
import { MarqueeRibbon } from "@/components/home/MarqueeRibbon";
import { PinnedCollections } from "@/components/home/PinnedCollections";
import { ProductRail } from "@/components/home/ProductRail";
import { EditorsPicks } from "@/components/home/EditorsPicks";
import { ScrollExpand } from "@/components/anim/ScrollExpand";
import { StickySplit } from "@/components/home/StickySplit";
import { StatBand } from "@/components/home/StatBand";
import { PromoBanners } from "@/components/home/PromoBanners";
import { ReviewsRow } from "@/components/home/ReviewsRow";
import { ValueProps } from "@/components/home/ValueProps";

// The curtain waits on the hero poster — the film itself streams in behind it.
const heroImages = ["/video/hero-atelier-poster.webp"];

const craftChapters = [
  {
    index: "I",
    title: "The raw material comes first",
    body: "Jasmine picked after dark, when the flower gives up the most of itself. Unheated sapphires from Ratnapura. Flax from a single European mill. We buy the input before we design the piece, which is the opposite of how most of this industry works.",
  },
  {
    index: "II",
    title: "One pair of hands, start to finish",
    body: "A weaver takes a throw from warp to fringe. A jeweller knots every pearl on the strand. Nothing moves down a line between six people, so there is always someone who can tell you exactly how your piece was made.",
  },
  {
    index: "III",
    title: "Then it has to earn its place",
    body: "Every piece is lived with by someone here before it is listed — worn, washed, burned down, slept on. If it does not survive that honestly, it does not go in the collection. Several things have not.",
  },
];

export default async function HomePage() {
  const [categories, featured, fragrances] = await Promise.all([
    getHomeCategories(),
    getFeaturedProducts(),
    getProducts("fragrances"),
  ]);

  return (
    <>
      <Preloader images={heroImages} />
      <HeroVideo
        src="/video/hero-atelier.mp4"
        poster="/video/hero-atelier-poster.webp"
      />
      <MarqueeRibbon />

      {/* Set-piece: the collections travel sideways while the section is pinned. */}
      <PinnedCollections categories={categories} />

      <ProductRail
        products={featured}
        eyebrow="In the vitrine"
        title="This season's most wanted"
        subtitle="The pieces leaving the atelier fastest — in stock and ready to send."
        moreHref="/shop"
        moreLabel="Shop all"
      />

      <ScrollExpand
        src="/images/editorial/editorial-boudoir.webp"
        alt="A sunlit dressing room with perfume bottles, pearls and linen"
        eyebrow="The Enivrant difference"
        title="Made to be lived with."
        body="Unheated Ceylon sapphires, 22-momme silk, 800-fill down, jasmine picked after dark. Chosen for the hundredth wearing, not the first photograph."
        ctaLabel="Explore the maison"
        ctaHref="/shop"
      />

      {/* Editorial chapters scrolling past a pinned photograph. */}
      <StickySplit
        image="/images/editorial/about-atelier.webp"
        alt="A perfumer's bench of glass vials, botanicals and a brass scale"
        eyebrow="Inside the atelier"
        title="Three rules we have never broken."
        chapters={craftChapters}
        ctaLabel="The maison"
        ctaHref="/about"
      />

      <StatBand />

      <ProductRail
        products={fragrances}
        eyebrow="Fragrance"
        title="The scent library"
        subtitle="Six compositions built on jasmine, Ceylon tea, cinnamon and oud. Undecided? Start with the discovery set."
        moreHref="/shop?category=fragrances"
        moreLabel="All fragrance"
        tone="white"
      />

      <EditorsPicks categories={categories} />
      <PromoBanners
        giftImage="/images/editorial/promo-gift.webp"
        tradeImage="/images/editorial/promo-trade.webp"
      />
      <ReviewsRow />
      <ValueProps />
    </>
  );
}
