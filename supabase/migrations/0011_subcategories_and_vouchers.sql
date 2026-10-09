-- Migration 0011: sub-categories, and spa vouchers
--
-- 1. SUB-CATEGORIES. Each collection gains a level beneath it — under Fine
--    Bedlinen & Sleep Luxury, the client's nine headings: Luxury Bedding,
--    Pillows & Cushions, Throws & Quilts, Mattresses & Sleep Systems, Luxury
--    Sleepwear & Robes, Accessories & Décor, Lighting for Sleep Spaces,
--    Bedroom Furniture, Headboards & Bed Frames. The header menu, the shop's
--    chips and its shop-by-category tiles are built from them, and a product
--    is filed under one from the dashboard (Products → Sub-category). A
--    sub-category with nothing in stock stays out of the storefront until a
--    product is added to it.
--
--    Sub-category slugs are unique across the whole catalogue, so a product
--    points at its sub-category by slug alone. That a sub-category belongs to
--    the product's own collection is checked by the dashboard when a product
--    is saved, and by the storefront when it lists one.
--
-- 2. EVERY PIECE FILED. The 116 pieces are sorted into their sub-categories,
--    and the two Molee silk sleepwear pieces move from Fashion & Accessories
--    to Fine Bedlinen & Sleep Luxury (Luxury Sleepwear & Robes). A piece the
--    dashboard has already filed is left where it is.
--
-- 3. SPA VOUCHERS. Products gain a kind — a physical piece, or a spa voucher
--    that has no delivery. A new vouchers table holds one code per voucher
--    bought; the checkout writes them and the dashboard issues, redeems and
--    voids them. Three voucher products are added under Wellness Vouchers &
--    Spa Discounts; their prices and inclusions are placeholders to confirm
--    with the partner spas in the dashboard.
--
-- RUN THIS BEFORE DEPLOYING THE CODE THAT NEEDS IT. Once that code is live,
-- saving a product in the dashboard writes the new columns, so the dashboard
-- cannot save products until this has run. The storefront itself keeps
-- working on a database without it, just without sub-categories.
--
-- Pages the site prerendered (the home page, the sitemap) refresh on the next
-- deploy or the next save in the dashboard, not when this runs.
--
-- Generated from src/lib/seed-subcategories.ts, the demo catalogue's copy of
-- the same lists, so the two agree. Safe to run again: nothing already in the
-- database is overwritten except the sub-categories' own copy and images.

BEGIN;

-- Every sub-category belongs to a collection that already exists. Stop with a
-- clear message, before anything is written, if one of them is missing.
DO $$
DECLARE
  missing text;
BEGIN
  SELECT string_agg(want.slug, ', ' ORDER BY want.slug) INTO missing
    FROM unnest(ARRAY['bedlinen', 'fashion', 'fragrances', 'home-living', 'jewelry', 'wellness']::text[]) AS want(slug)
   WHERE NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.slug = want.slug);
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'Missing collection(s): %. Run migration 0007 first. Nothing was changed.', missing;
  END IF;
END $$;

-- 1. Sub-categories ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.subcategories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  category_slug text NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  name          text NOT NULL,
  description   text NOT NULL DEFAULT '',
  image         text NOT NULL DEFAULT '',
  sort_order    integer NOT NULL DEFAULT 0,
  show_in_nav   boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subcategories_category_idx
  ON public.subcategories (category_slug, sort_order);

DROP TRIGGER IF EXISTS set_updated_at ON public.subcategories;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subcategories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Anyone may read them, like collections; only the server's service-role key
-- writes.
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read subcategories" ON public.subcategories;
CREATE POLICY "Public read subcategories" ON public.subcategories
  FOR SELECT USING (true);

-- A product's sub-category, and what kind of product it is. Deleting a
-- sub-category leaves its products in the collection, unfiled; renaming its
-- slug follows through to them.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory_slug text
    REFERENCES public.subcategories(slug) ON UPDATE CASCADE ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'physical';

DO $$
BEGIN
  ALTER TABLE public.products
    ADD CONSTRAINT products_kind_check CHECK (kind IN ('physical', 'voucher'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS products_subcategory_idx
  ON public.products (category_slug, subcategory_slug);

INSERT INTO public.subcategories (slug, category_slug, name, description, image, sort_order, show_in_nav)
VALUES
  ('luxury-bedding', 'bedlinen', 'Luxury Bedding', 'Duvet covers and sheet sets in mulberry silk, Egyptian and Giza cotton, French linen and lyocell — the whole bed, dressed.', '/images/subcategories/luxury-bedding.webp', 1, true),
  ('pillows-cushions', 'bedlinen', 'Pillows & Cushions', 'Silk and linen pillowcases, cut to be kind to skin and hair through the night.', '/images/subcategories/pillows-cushions.webp', 2, true),
  ('throws-quilts', 'bedlinen', 'Throws & Quilts', 'Waffle-weave blankets and silk-filled quilts for the foot of the bed and the lighter months.', '/images/subcategories/throws-quilts.webp', 3, true),
  ('mattresses-sleep-systems', 'bedlinen', 'Mattresses & Sleep Systems', 'Goose-down and silk-filled duvets — the layers beneath the linen that decide how you sleep.', '/images/subcategories/mattresses-sleep-systems.webp', 4, true),
  ('luxury-sleepwear-robes', 'bedlinen', 'Luxury Sleepwear & Robes', 'Silk nightdresses and robes finished in lace, for the hours either side of sleep.', '/images/subcategories/luxury-sleepwear-robes.webp', 5, true),
  ('accessories-decor', 'bedlinen', 'Accessories & Décor', 'The finishing pieces of a bedroom — trays, vessels and small luxuries for the bedside.', '/images/subcategories/accessories-decor.webp', 6, true),
  ('lighting-sleep-spaces', 'bedlinen', 'Lighting for Sleep Spaces', 'Soft, low light for reading, winding down and the walk back from the bath.', '/images/subcategories/lighting-sleep-spaces.webp', 7, true),
  ('bedroom-furniture', 'bedlinen', 'Bedroom Furniture', 'Bedside tables, benches and the quiet furniture a calm bedroom is built around.', '/images/subcategories/bedroom-furniture.webp', 8, true),
  ('headboards-bed-frames', 'bedlinen', 'Headboards & Bed Frames', 'Upholstered headboards and frames — the architecture of the bed.', '/images/subcategories/headboards-bed-frames.webp', 9, true),
  ('bath-body-rituals', 'wellness', 'Bath & Body Rituals', 'Bath salts, botanical oils, rose quartz and the robe for afterwards.', '/images/subcategories/bath-body-rituals.webp', 1, true),
  ('sleep-rituals', 'wellness', 'Sleep Rituals', 'Silk masks and sleep sets for darker, deeper nights — at home or on a long-haul flight.', '/images/subcategories/sleep-rituals.webp', 2, true),
  ('spa-vouchers', 'wellness', 'Wellness Vouchers & Spa Discounts', 'Exclusive savings on spa experiences — buy the voucher here, then present its code at your chosen spa.', '/images/subcategories/spa-vouchers.webp', 3, true),
  ('perfume', 'fragrances', 'Perfume', 'Eaux de parfum, a discovery set and a solid perfume, composed around jasmine, oud and Ceylon tea.', '/images/subcategories/perfume.webp', 1, true),
  ('home-fragrance', 'fragrances', 'Home Fragrance', 'Reed diffusers and candles that scent a room slowly, never all at once.', '/images/subcategories/home-fragrance.webp', 2, true),
  ('tableware-objects', 'home-living', 'Tableware & Objects', 'Hand-thrown stoneware, ceramic vessels and travertine for the table and the shelf.', '/images/subcategories/tableware-objects.webp', 1, true),
  ('furniture-lighting', 'home-living', 'Furniture & Lighting', 'Solid teak and woven rattan — pieces that warm with age.', '/images/subcategories/furniture-lighting.webp', 2, true),
  ('throws-textiles', 'home-living', 'Throws & Textiles', 'Handloom cotton for the sofa, the reading chair and cooler evenings.', '/images/subcategories/throws-textiles.webp', 3, true),
  ('necklaces-pendants', 'jewelry', 'Necklaces & Pendants', 'Freshwater pearl strands and a Ceylon sapphire set in solid gold.', '/images/subcategories/necklaces-pendants.webp', 1, true),
  ('earrings', 'jewelry', 'Earrings', 'Baroque pearl drops and hammered vermeil hoops.', '/images/subcategories/earrings.webp', 2, true),
  ('rings-bracelets', 'jewelry', 'Rings & Bracelets', 'Rainbow moonstone and freshwater pearl, set in gold for every day.', '/images/subcategories/rings-bracelets.webp', 3, true),
  ('clothing', 'fashion', 'Clothing', 'Washed linen dresses and resort kaftans, cut loose for the heat.', '/images/subcategories/clothing.webp', 1, true),
  ('bags', 'fashion', 'Bags', 'Woven palmyrah and vegetable-tanned leather, made to be carried for years.', '/images/subcategories/bags.webp', 2, true),
  ('scarves-hats', 'fashion', 'Scarves & Hats', 'Hand-painted batik silk and woven raffia, for the sun and the evening.', '/images/subcategories/scarves-hats.webp', 3, true)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  image       = EXCLUDED.image,
  sort_order  = EXCLUDED.sort_order;

-- 2. File every piece ----------------------------------------------------------

-- The Molee silk sleepwear belongs with Luxury Sleepwear & Robes.
UPDATE public.products SET category_slug = 'bedlinen'
 WHERE category_slug = 'fashion'
   AND slug IN (
     'silk-robe-nightdress-set',
     'silk-slip-nightdress'
   );

UPDATE public.products SET subcategory_slug = 'luxury-bedding'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'bedlinen'
   AND slug IN (
     'cloud-percale-sheet-set',
     'stonewashed-linen-sheet-set',
     'enivrant-signature-bedding-set',
     'champagne-border-silk-bedding-set',
     'ivory-mulberry-silk-bedding-set',
     'champagne-silk-bedding-set-19-momme',
     'champagne-silk-jacquard-bedding-set',
     'ivory-silk-jacquard-bedding-set',
     'grade-6a-silk-jacquard-bedding-set',
     '30-momme-gold-silk-bedding-set',
     '26-momme-grey-silk-jacquard-set',
     'sage-silk-bedding-set',
     'camel-silk-bedding-set',
     'blush-silk-bedding-set',
     'charcoal-silk-bedding-set',
     'celadon-silk-bedding-set',
     'giza-cotton-bedding-set-ivory',
     'geometric-egyptian-cotton-jacquard-set',
     'white-egyptian-cotton-jacquard-set',
     'blush-egyptian-cotton-bedding-set',
     'olive-egyptian-cotton-bedding-set',
     'white-egyptian-cotton-satin-set',
     'champagne-giza-cotton-sateen-set',
     'sky-blue-piped-egyptian-cotton-set',
     'hotel-stripe-egyptian-cotton-set',
     'silver-giza-cotton-jacquard-set',
     'giza-cotton-fitted-sheet-set',
     'champagne-egyptian-cotton-bedding-set',
     'lace-inset-egyptian-cotton-satin-set',
     'openwork-long-staple-cotton-set',
     'cocoa-cotton-jacquard-bedding-set',
     'dove-grey-long-staple-cotton-set',
     'tie-closure-hotel-bedding-set',
     'warm-grey-long-staple-cotton-set',
     'air-jacquard-cotton-set-ivory',
     'embroidered-long-staple-cotton-set',
     'pima-cotton-1800-thread-count-set',
     'white-cotton-1200-thread-count-set',
     'blush-200s-cotton-sateen-set',
     'white-700-thread-count-cotton-set',
     'steel-blue-1800-thread-count-sateen-set',
     'white-400-thread-count-hotel-set',
     'white-belgian-flax-linen-set',
     'khaki-french-linen-bedding-set',
     'striped-linen-bedding-set',
     'natural-linen-bedding-set',
     'sage-french-flax-linen-set',
     'yarn-dyed-linen-jacquard-set',
     'silver-pure-linen-bedding-set',
     'linen-cotton-bedding-set-oat',
     'linen-lyocell-bedding-set',
     'deep-grey-linen-sheet-set',
     'deep-blue-flax-linen-set',
     'white-lyocell-bedding-set',
     'grey-wide-border-lyocell-set',
     'dusk-blue-lyocell-cotton-set',
     'eucalyptus-lyocell-bedding-set',
     'taupe-grey-lyocell-bedding-set',
     'lyocell-linen-jacquard-set',
     'grey-bamboo-bedding-set',
     'coconut-grey-bamboo-bedding-set'
   );

UPDATE public.products SET subcategory_slug = 'pillows-cushions'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'bedlinen'
   AND slug IN (
     'mulberry-silk-pillowcase-pair',
     '21-momme-silk-pillowcase',
     'rolled-edge-silk-pillowcase',
     'french-linen-pillowcase-pair'
   );

UPDATE public.products SET subcategory_slug = 'throws-quilts'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'bedlinen'
   AND slug IN (
     'waffle-weave-blanket',
     'bamboo-summer-quilt-set',
     'silk-quilt-lyocell-jacquard',
     'mulberry-silk-quilt-champagne',
     'silk-filled-summer-quilt'
   );

UPDATE public.products SET subcategory_slug = 'mattresses-sleep-systems'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'bedlinen'
   AND slug IN (
     'goose-down-duvet',
     'sateen-jacquard-goose-down-duvet',
     'double-layer-goose-down-duvet',
     'white-goose-down-jacquard-duvet',
     'extra-thick-goose-down-duvet',
     'silk-shell-goose-down-duvet',
     'white-goose-down-winter-duvet',
     'blush-all-season-goose-down-duvet',
     'mulberry-silk-filled-duvet',
     'silk-filled-jacquard-duvet'
   );

UPDATE public.products SET subcategory_slug = 'luxury-sleepwear-robes'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'bedlinen'
   AND slug IN (
     'silk-robe-nightdress-set',
     'silk-slip-nightdress'
   );

UPDATE public.products SET subcategory_slug = 'bath-body-rituals'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'wellness'
   AND slug IN (
     'ceylon-bath-soak-ritual-set',
     'frangipani-body-oil',
     'rose-quartz-facial-ritual-set',
     'ayurvedic-tea-ritual-box',
     'waffle-linen-spa-robe'
   );

UPDATE public.products SET subcategory_slug = 'sleep-rituals'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'wellness'
   AND slug IN (
     'silk-sleep-ritual-set',
     '3d-contour-silk-sleep-mask',
     '40-momme-silk-sleep-set',
     'mulberry-silk-travel-set',
     'linen-eye-mask'
   );

UPDATE public.products SET subcategory_slug = 'perfume'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'fragrances'
   AND slug IN (
     'enivrant-no-1-eau-de-parfum',
     'jasmine-nocturne-eau-de-parfum',
     'discovery-set-five-scents',
     'oud-rose-solid-perfume'
   );

UPDATE public.products SET subcategory_slug = 'home-fragrance'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'fragrances'
   AND slug IN (
     'ceylon-tea-vetiver-reed-diffuser',
     'sandalwood-sea-salt-candle'
   );

UPDATE public.products SET subcategory_slug = 'tableware-objects'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'home-living'
   AND slug IN (
     'glazed-stoneware-dinner-set',
     'hand-thrown-ceramic-vase',
     'travertine-brass-tray'
   );

UPDATE public.products SET subcategory_slug = 'furniture-lighting'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'home-living'
   AND slug IN (
     'rattan-pendant-light',
     'teak-bedside-table'
   );

UPDATE public.products SET subcategory_slug = 'throws-textiles'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'home-living'
   AND slug IN (
     'handloom-cotton-throw'
   );

UPDATE public.products SET subcategory_slug = 'necklaces-pendants'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'jewelry'
   AND slug IN (
     'freshwater-pearl-strand-necklace',
     'ceylon-blue-sapphire-pendant'
   );

UPDATE public.products SET subcategory_slug = 'earrings'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'jewelry'
   AND slug IN (
     'baroque-pearl-drop-earrings',
     'hammered-gold-vermeil-hoops'
   );

UPDATE public.products SET subcategory_slug = 'rings-bracelets'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'jewelry'
   AND slug IN (
     'rainbow-moonstone-ring',
     'pearl-gold-vermeil-bracelet'
   );

UPDATE public.products SET subcategory_slug = 'clothing'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'fashion'
   AND slug IN (
     'washed-linen-shirt-dress',
     'resort-linen-kaftan'
   );

UPDATE public.products SET subcategory_slug = 'bags'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'fashion'
   AND slug IN (
     'palmyrah-woven-tote',
     'leather-crossbody-bag'
   );

UPDATE public.products SET subcategory_slug = 'scarves-hats'
 WHERE subcategory_slug IS NULL
   AND category_slug = 'fashion'
   AND slug IN (
     'batik-silk-scarf',
     'raffia-sun-hat'
   );

-- 3. Spa vouchers --------------------------------------------------------------

-- One row per voucher bought: an order line for two massages is two codes.
-- Written by the checkout and changed only from the dashboard, both with the
-- service-role key, so the public keys can neither read nor write it.
CREATE TABLE IF NOT EXISTS public.vouchers (
  code          text PRIMARY KEY,
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE SET NULL,
  product_slug  text NOT NULL,
  product_name  text NOT NULL,
  size_name     text NOT NULL,
  value         numeric(12,2) NOT NULL,
  paid          numeric(12,2) NOT NULL,
  status        text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'issued', 'redeemed', 'void')),
  issued_at     timestamptz,
  redeemed_at   timestamptz,
  redeemed_note text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vouchers_order_idx ON public.vouchers (order_id);
CREATE INDEX IF NOT EXISTS vouchers_status_idx ON public.vouchers (status, created_at DESC);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.vouchers FROM anon, authenticated;
GRANT ALL ON TABLE public.vouchers TO service_role;

INSERT INTO public.products
  (slug, name, category_slug, subcategory_slug, kind, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'signature-spa-massage-voucher',
  'Signature Massage Voucher',
  'wellness',
  'spa-vouchers',
  'voucher',
  'A full-body massage at your chosen partner spa, below the spa''s own price.',
  'An hour or ninety minutes of warm-oil massage at one of our partner spas — long, unhurried strokes, hot basalt stones on the longer treatment, and a quiet room to come back to yourself afterwards. Buy the voucher here, then present its code at the spa when you arrive.',
  '',
  ARRAY['Redeemable at your chosen Enivrant partner spa in Sri Lanka', 'Valid for 12 months from the day it is issued', 'Book your treatment at least 48 hours ahead', 'Present your voucher code when you arrive']::text[],
  ARRAY['Non-refundable once issued — it can be given as a gift', 'One voucher per treatment, not combinable with other offers', 'The spa''s own booking and cancellation policy applies']::text[],
  ARRAY[]::text[],
  ARRAY['/images/products/vouchers/signature-spa-massage-voucher-a.webp']::text[],
  '[{"name":"60 minutes","dimensions":"Full-body massage","price":45,"compare_at_price":60},{"name":"90 minutes","dimensions":"Full-body massage with hot stones","price":60,"compare_at_price":80}]'::jsonb,
  'Voucher',
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, subcategory_slug, kind, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'ayurvedic-half-day-ritual-voucher',
  'Ayurvedic Half-Day Ritual Voucher',
  'wellness',
  'spa-vouchers',
  'voucher',
  'A half day in the Ayurvedic tradition — oil massage, shirodhara and a herbal steam.',
  'A half day given over to Ayurveda: a short consultation, a full-body massage with warm herbal oils, shirodhara poured slowly across the forehead, and a herbal steam to finish, followed by tea. Redeemed at your chosen partner spa — present the code when you arrive.',
  '',
  ARRAY['Redeemable at your chosen Enivrant partner spa in Sri Lanka', 'Valid for 12 months from the day it is issued', 'Book your treatment at least 48 hours ahead', 'Present your voucher code when you arrive']::text[],
  ARRAY['Non-refundable once issued — it can be given as a gift', 'One voucher per treatment, not combinable with other offers', 'The spa''s own booking and cancellation policy applies']::text[],
  ARRAY[]::text[],
  ARRAY['/images/products/vouchers/ayurvedic-half-day-ritual-voucher-a.webp']::text[],
  '[{"name":"Half day","dimensions":"About three hours","price":120,"compare_at_price":160}]'::jsonb,
  'Voucher',
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, subcategory_slug, kind, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'couples-spa-afternoon-voucher',
  'Couples'' Spa Afternoon Voucher',
  'wellness',
  'spa-vouchers',
  'voucher',
  'Side-by-side massages and tea for two, on one voucher.',
  'An afternoon for two: side-by-side massages in a shared suite, time to linger in the steam room, and herbal tea to close. One voucher covers both guests — present its code at your chosen partner spa.',
  '',
  ARRAY['Redeemable at your chosen Enivrant partner spa in Sri Lanka', 'Valid for 12 months from the day it is issued', 'Book your treatment at least 48 hours ahead', 'Present your voucher code when you arrive']::text[],
  ARRAY['Non-refundable once issued — it can be given as a gift', 'One voucher per treatment, not combinable with other offers', 'The spa''s own booking and cancellation policy applies']::text[],
  ARRAY[]::text[],
  ARRAY['/images/products/vouchers/couples-spa-afternoon-voucher-a.webp']::text[],
  '[{"name":"For two","dimensions":"Two 60-minute massages","price":200,"compare_at_price":260}]'::jsonb,
  'Voucher',
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- What the SQL editor shows when this finishes: every sub-category with the
-- pieces in it (Accessories & Décor, Lighting for Sleep Spaces, Bedroom
-- Furniture and Headboards & Bed Frames start empty, ready for the client's
-- pieces) ...
SELECT c.name AS collection, s.name AS sub_category, count(p.id) AS pieces
  FROM public.subcategories s
  JOIN public.categories c ON c.slug = s.category_slug
  LEFT JOIN public.products p ON p.subcategory_slug = s.slug AND p.category_slug = s.category_slug
 GROUP BY c.sort_order, c.name, s.sort_order, s.name
 ORDER BY c.sort_order, s.sort_order;

-- ... and any piece not filed yet — anything added in the dashboard before
-- this ran. File each one under a sub-category in the dashboard.
SELECT p.slug, p.name, p.category_slug
  FROM public.products p
 WHERE p.subcategory_slug IS NULL
 ORDER BY p.category_slug, p.name;
