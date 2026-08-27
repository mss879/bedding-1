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
import { MaisonStatement } from "@/components/home/MaisonStatement";
import { ValueProps } from "@/components/home/ValueProps";

// The curtain holds until the hero's own assets are ready — poster, film and
// fonts — so the hero is fully painted and can animate the instant it shows.
const heroPoster = "/video/hero-atelier-poster.webp";
const heroFilm = "/video/hero-atelier.mp4";
// Module scope keeps these array identities stable, so the curtain's load
// effect can never re-run and restart the count.
const heroImages = [heroPoster];
const heroFilms = [heroFilm];

const craftChapters = [
  {
    index: "I",
    title: "Curated, never mass-produced",
    body: "Luxury is not made in volume — it is chosen. Every piece is selected for authenticity, craftsmanship and exclusivity, and nothing joins a collection because it filled a gap in the range.",
  },
  {
    index: "II",
    title: "Partners, not marketplaces",
    body: "We work in close partnership with select manufacturers and suppliers, building personal relationships with the people who actually make the work. That relationship is what lets us stand behind a piece's provenance rather than repeat a listing.",
  },
  {
    index: "III",
    title: "Watchful over every interaction",
    body: "Unlike mass-market platforms, we take each purchase and each conversation seriously. Customer excellence is the highest priority in the house, and every client is answered by a person who knows the artistry behind their purchase.",
  },
];

export default async function HomePage() {
  const [categories, featured, fragrances, all] = await Promise.all([
    getHomeCategories(),
    getFeaturedProducts(),
    getProducts("fragrances"),
    getProducts(),
  ]);

  return (
    <>
      <Preloader images={heroImages} videos={heroFilms} />
      <HeroVideo src={heroFilm} poster={heroPoster} />
      <MarqueeRibbon />

      {/* Set-piece: the collections travel sideways while the section is pinned. */}
      <PinnedCollections categories={categories} />

      <ProductRail
        products={featured}
        eyebrow="In the vitrine"
        title="This season's most wanted"
        subtitle="The pieces moving fastest from the collections — in stock and ready to send."
        moreHref="/shop"
        moreLabel="Shop all"
      />

      <ScrollExpand
        src="/images/editorial/editorial-boudoir.webp"
        alt="A sunlit dressing room with perfume bottles, pearls and linen"
        eyebrow="The Enivrant difference"
        title="Made to be lived with."
        body="Limited-edition perfumes, artisanal wellness essentials, rare pearls and fine jewellery, designer selects and hotel-grade bedlinen — collections chosen to elevate everyday living into timeless luxury."
        ctaLabel="Explore the maison"
        ctaHref="/shop"
      />

      {/* Editorial chapters scrolling past a pinned photograph. */}
      <StickySplit
        image="/images/editorial/about-atelier.webp"
        alt="A perfumer's bench of glass vials, botanicals and a brass scale"
        eyebrow="Inside the maison"
        title="How a piece earns its place."
        chapters={craftChapters}
        ctaLabel="The maison"
        ctaHref="/about"
      />

      <StatBand collectionCount={categories.length} pieceCount={all.length} />

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
      <MaisonStatement />
      <ValueProps />
    </>
  );
}
