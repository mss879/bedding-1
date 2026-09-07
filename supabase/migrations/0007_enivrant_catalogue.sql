-- Migration 0007: Enivrant catalogue

-- Replaces the retired Ivory Homez room collections and their 25 products with
-- the six Enivrant maison collections and their 36 pieces.
--
-- WHY THIS IS A LAUNCH GATE, not cosmetics: the Ivory Homez rows are priced in
-- LKR (a vase stored as 4900) while the storefront renders every price as USD
-- and card checkout converts USD to LKR at PAYCORP_USD_RATE. Left in place, a
-- card payment for that vase bills LKR 1,470,000 instead of LKR 4,900. The
-- prices below are the USD ladder, so display and settlement agree.
--
-- Generated from src/lib/seed-data.ts — the storefront's demo-mode fallback —
-- so the database and the fallback stay identical. Re-runnable: every write is
-- an upsert on slug.

BEGIN;

-- 1. Maison collections -----------------------------------------------------

INSERT INTO public.categories (slug, name, description, image, sort_order, show_in_nav, show_on_home)
VALUES
  ('wellness', 'Luxury Wellness', 'Bath rituals, botanical oils and slow-evening essentials — the art of taking your time.', '/images/categories/wellness-self-care.webp', 1, true, true),
  ('fragrances', 'Fragrance', 'Eaux de parfum, diffusers and candles composed around jasmine, Ceylon tea, oud and sandalwood.', '/images/categories/fragrances-perfume.webp', 2, true, true),
  ('home-living', 'Home & Living', 'Hand-thrown stoneware, rattan light, solid teak and travertine — quiet luxury for every room.', '/images/categories/home-living.webp', 3, true, true),
  ('jewelry', 'Pearls & Fine Jewelry', 'Freshwater pearls, Ceylon sapphires and gold vermeil, strung and set by hand by the ateliers we work with.', '/images/categories/pearls-fine-jewelry.webp', 4, true, true),
  ('fashion', 'Fashion & Accessories', 'Washed linen, hand-painted batik silk, woven palmyrah and vegetable-tanned leather.', '/images/categories/fashion-accessories.webp', 5, true, true),
  ('bedlinen', 'Fine Bedlinen & Sleep Luxury', 'Percale, stonewashed linen, mulberry silk and down — everything the best night of your week needs.', '/images/categories/bedlinen-sleep.webp', 6, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name         = EXCLUDED.name,
  description  = EXCLUDED.description,
  image        = EXCLUDED.image,
  sort_order   = EXCLUDED.sort_order,
  show_in_nav  = EXCLUDED.show_in_nav,
  show_on_home = EXCLUDED.show_on_home;

-- 2. The 36 pieces ----------------------------------------------------------
-- Prices are USD, matching what the storefront displays and what the Paycorp
-- conversion expects.

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'ceylon-bath-soak-ritual-set',
  'Ceylon Bath Soak Ritual Set',
  'wellness',
  'Himalayan salt, jasmine petals and cinnamon bark, in apothecary glass.',
  'Two hand-filled apothecary jars of pink Himalayan salt folded through dried jasmine petals and slivers of Ceylon cinnamon bark. A single scoop turns a bath into an hour you actually look forward to — the salt softens the water, the jasmine perfumes the steam.',
  'Pink Himalayan salt, dried jasmine, Ceylon cinnamon bark',
  ARRAY['Two 450 g apothecary jars with cork lids', 'Hand-blended and hand-filled in small batches', 'Includes a turned beechwood scoop', 'No synthetic fragrance, colour or foaming agents']::text[],
  ARRAY['Keep the lid sealed and the jar dry', 'Use within 12 months of opening']::text[],
  ARRAY['Blush', 'Ivory']::text[],
  ARRAY['/images/products/ceylon-bath-soak-ritual-set-a.webp', '/images/products/ceylon-bath-soak-ritual-set-b.webp']::text[],
  '[{"name":"Duo set","dimensions":"2 × 450 g","price":33,"compare_at_price":null},{"name":"Grand set","dimensions":"4 × 450 g","price":60,"compare_at_price":65}]'::jsonb,
  'Bestseller',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'frangipani-body-oil',
  'Frangipani Body Oil',
  'wellness',
  'A golden, fast-absorbing oil of coconut, sesame and frangipani.',
  'Cold-pressed virgin coconut and sesame oils infused with frangipani blossoms picked at dawn. It sinks in rather than sitting on the skin, and leaves the faintest trace of the flower behind — best applied while you are still damp from the bath.',
  'Virgin coconut oil, sesame oil, frangipani absolute, vitamin E',
  ARRAY['100 ml frosted glass bottle with a brushed-gold pump', 'Cold-pressed, unrefined base oils', 'Non-greasy, fast-absorbing finish', 'Free of mineral oil, silicones and parabens']::text[],
  ARRAY['Store away from direct sunlight', 'Warm the bottle in your hands in cool weather']::text[],
  ARRAY['Champagne']::text[],
  ARRAY['/images/products/frangipani-body-oil-a.webp', '/images/products/frangipani-body-oil-b.webp']::text[],
  '[{"name":"100 ml","dimensions":"Full size","price":24,"compare_at_price":null},{"name":"30 ml","dimensions":"Travel size","price":11,"compare_at_price":null}]'::jsonb,
  NULL,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'rose-quartz-facial-ritual-set',
  'Rose Quartz Facial Ritual Set',
  'wellness',
  'A gua sha stone and roller cut from genuine rose quartz.',
  'Cut and polished from a single seam of rose quartz, then finished with gold-tone fittings. Cool to the touch on the hottest afternoon — five minutes of slow, upward strokes at the end of the day does more for a tired face than most things in a bottle.',
  'Genuine rose quartz, gold-tone brass fittings',
  ARRAY['Gua sha stone and dual-ended facial roller', 'Natural stone — veining and tone vary piece to piece', 'Silent, snag-free roller bearings', 'Presented in an ivory linen drawstring pouch']::text[],
  ARRAY['Wash with mild soap and dry fully', 'Chill in the fridge for a cooling ritual']::text[],
  ARRAY['Blush', 'Gold']::text[],
  ARRAY['/images/products/rose-quartz-facial-ritual-set-a.webp', '/images/products/rose-quartz-facial-ritual-set-b.webp']::text[],
  '[{"name":"Two-piece set","dimensions":"Roller + gua sha","price":21,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'ayurvedic-tea-ritual-box',
  'Ayurvedic Tea Ritual Box',
  'wellness',
  'Three single-estate Ceylon blends with a solid brass infuser.',
  'Three blends drawn from the hill country and the Ayurvedic tradition: a morning black with cardamom, an afternoon green with cornflower, and a caffeine-free evening tisane of tulsi and liquorice. Packed in matte tins with wooden lids, with a solid brass infuser.',
  'Single-estate Ceylon tea, botanicals, solid brass infuser',
  ARRAY['Three 60 g tins — Morning, Afternoon, Evening', 'Loose leaf, whole-leaf grade, never dust', 'Solid brass infuser with a resting dish', 'Linen-wrapped gift box, ready to give']::text[],
  ARRAY['Keep tins sealed and out of sunlight', 'Rinse the infuser and dry to keep the shine']::text[],
  ARRAY['Ivory', 'Gold']::text[],
  ARRAY['/images/products/ayurvedic-tea-ritual-box-a.webp', '/images/products/ayurvedic-tea-ritual-box-b.webp']::text[],
  '[{"name":"Gift box","dimensions":"3 × 60 g + infuser","price":30,"compare_at_price":null}]'::jsonb,
  'New',
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'waffle-linen-spa-robe',
  'Waffle Linen Spa Robe',
  'wellness',
  'Honeycomb linen-cotton that dries fast and only softens.',
  'Woven in a deep honeycomb waffle from linen and long-staple cotton, so it drinks water without ever feeling heavy. Cut generously with deep patch pockets, a self-tie belt and a hanging loop — the robe you reach for long after the bath is cold.',
  '55% European flax linen, 45% long-staple cotton',
  ARRAY['Deep honeycomb waffle weave, pre-washed', 'Two patch pockets and a self-tie belt', 'Shawl collar with a reinforced hanging loop', 'Unisex cut — size down for a closer fit']::text[],
  ARRAY['Machine wash warm', 'Tumble dry low', 'No ironing needed']::text[],
  ARRAY['Oat', 'Ivory']::text[],
  ARRAY['/images/products/waffle-linen-spa-robe-a.webp', '/images/products/waffle-linen-spa-robe-b.webp']::text[],
  '[{"name":"S / M","dimensions":"Length 120 cm","price":45,"compare_at_price":null},{"name":"L / XL","dimensions":"Length 128 cm","price":48,"compare_at_price":null}]'::jsonb,
  NULL,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'silk-sleep-ritual-set',
  'Silk Sleep Ritual Set',
  'wellness',
  '22-momme mulberry silk mask, scrunchie and pouch.',
  'A weighted 22-momme mulberry silk sleep mask that blocks light without pressing on your eyes, with a matching scrunchie that won''t crease your hair overnight. Both live in a silk pouch that fits in any bag — the whole set weighs less than a paperback.',
  '22-momme grade 6A mulberry silk',
  ARRAY['Contoured mask with a soft elastic strap', 'Matching scrunchie and travel pouch', 'Naturally hypoallergenic and temperature-regulating', 'Hand-rolled edges throughout']::text[],
  ARRAY['Hand wash cold with a pH-neutral soap', 'Dry flat away from sunlight']::text[],
  ARRAY['Champagne', 'Ivory']::text[],
  ARRAY['/images/products/silk-sleep-ritual-set-a.webp', '/images/products/silk-sleep-ritual-set-b.webp']::text[],
  '[{"name":"Three-piece set","dimensions":"Mask, scrunchie, pouch","price":32,"compare_at_price":40}]'::jsonb,
  'Save 20%',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'enivrant-no-1-eau-de-parfum',
  'Enivrant No. 1 Eau de Parfum',
  'fragrances',
  'Ceylon cinnamon, cedar and amber — the house signature.',
  'The scent the maison is named for. It opens warm and dry with Ceylon cinnamon bark and bergamot, settles into cedar and orris through the afternoon, and finishes on amber and a whisper of vanilla against your skin at night. 22% concentration — one press lasts the day.',
  'Eau de parfum, 22% concentration',
  ARRAY['Top: Ceylon cinnamon bark, bergamot, pink pepper', 'Heart: cedarwood, orris root, jasmine absolute', 'Base: amber, tonka bean, vanilla', 'Eight to ten hours of wear; unisex composition']::text[],
  ARRAY['Store upright, away from heat and light', 'Spray onto skin, never rub in']::text[],
  ARRAY['Champagne', 'Gold']::text[],
  ARRAY['/images/products/enivrant-no-1-eau-de-parfum-a.webp', '/images/products/enivrant-no-1-eau-de-parfum-b.webp']::text[],
  '[{"name":"50 ml","dimensions":"Signature bottle","price":90,"compare_at_price":null},{"name":"100 ml","dimensions":"Grand format","price":130,"compare_at_price":null},{"name":"10 ml","dimensions":"Purse atomiser","price":28,"compare_at_price":null}]'::jsonb,
  'Bestseller',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'jasmine-nocturne-eau-de-parfum',
  'Jasmine Nocturne Eau de Parfum',
  'fragrances',
  'Night-picked jasmine sambac over white musk.',
  'Jasmine sambac picked after dark, when the flower gives up the most of itself, laid over a base of white musk and sandalwood. Softer and more intimate than the No. 1 — it sits close to the skin rather than announcing itself across a room.',
  'Eau de parfum, 18% concentration',
  ARRAY['Top: jasmine sambac, neroli, pear', 'Heart: tuberose, ylang-ylang, rose de mai', 'Base: white musk, sandalwood, benzoin', 'Six to eight hours of wear; fluted glass stopper']::text[],
  ARRAY['Store upright, away from heat and light', 'Spray onto skin, never rub in']::text[],
  ARRAY['Blush', 'Ivory']::text[],
  ARRAY['/images/products/jasmine-nocturne-eau-de-parfum-a.webp', '/images/products/jasmine-nocturne-eau-de-parfum-b.webp']::text[],
  '[{"name":"50 ml","dimensions":"Signature bottle","price":80,"compare_at_price":null},{"name":"100 ml","dimensions":"Grand format","price":120,"compare_at_price":null}]'::jsonb,
  NULL,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'discovery-set-five-scents',
  'Discovery Set — Five Scents',
  'fragrances',
  'The whole library in 8 ml vials. Credited against your first bottle.',
  'Five 8 ml atomisers holding the full house library, nested in ivory satin. Live with each one for a week before you commit — and the price of the set is credited in full against your first full bottle, so trying costs you nothing in the end.',
  'Eau de parfum, five compositions',
  ARRAY['Five 8 ml glass atomisers with gold caps', 'No. 1, Jasmine Nocturne, Oud Rose, Ceylon Tea, Sea Salt', 'About 100 sprays per vial', 'Value credited against your first full bottle']::text[],
  ARRAY['Store upright, away from heat and light']::text[],
  ARRAY['Ivory', 'Gold']::text[],
  ARRAY['/images/products/discovery-set-five-scents-a.webp', '/images/products/discovery-set-five-scents-b.webp']::text[],
  '[{"name":"Five vials","dimensions":"5 × 8 ml","price":38,"compare_at_price":null}]'::jsonb,
  'New',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'ceylon-tea-vetiver-reed-diffuser',
  'Ceylon Tea & Vetiver Reed Diffuser',
  'fragrances',
  'Black tea and damp vetiver, in matte cream stoneware.',
  'The smell of a tea factory at dawn — dry black leaf, damp earth, a little smoke — held in a matte stoneware vessel that looks like nothing and suits everything. Twelve rattan reeds, three to four months of quiet diffusion in a normal-sized room.',
  'Matte stoneware vessel, natural rattan reeds, alcohol-free base',
  ARRAY['200 ml, with twelve natural rattan reeds', 'Three to four months in a 20 m² room', 'Alcohol-free, low-evaporation base', 'Refillable — the vessel is made to keep']::text[],
  ARRAY['Turn the reeds weekly', 'Keep off polished or painted surfaces']::text[],
  ARRAY['Cream', 'Natural']::text[],
  ARRAY['/images/products/ceylon-tea-vetiver-reed-diffuser-a.webp', '/images/products/ceylon-tea-vetiver-reed-diffuser-b.webp']::text[],
  '[{"name":"200 ml","dimensions":"With 12 reeds","price":31,"compare_at_price":null},{"name":"Refill 200 ml","dimensions":"Liquid only","price":18,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'sandalwood-sea-salt-candle',
  'Sandalwood & Sea Salt Candle',
  'fragrances',
  'Coconut-soy wax in a stoneware vessel you''ll keep.',
  'Creamy sandalwood cut with mineral sea salt and a thread of driftwood — warm without being sweet. Poured by hand into a speckled stoneware vessel with a turned wooden lid, and a cotton wick that burns clean to the very edge.',
  'Coconut-soy wax, cotton wick, stoneware vessel, wooden lid',
  ARRAY['280 g, roughly 55 hours of burn time', 'Coconut-soy blend — no paraffin, no soot', 'Hand-thrown speckled stoneware vessel with wooden lid', 'Phthalate-free fragrance oils']::text[],
  ARRAY['Trim the wick to 5 mm before each burn', 'First burn: let the full surface melt']::text[],
  ARRAY['Cream', 'Natural']::text[],
  ARRAY['/images/products/sandalwood-sea-salt-candle-a.webp', '/images/products/sandalwood-sea-salt-candle-b.webp']::text[],
  '[{"name":"280 g","dimensions":"Single wick","price":23,"compare_at_price":null},{"name":"Trio","dimensions":"3 × 280 g","price":60,"compare_at_price":70}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'oud-rose-solid-perfume',
  'Oud & Rose Solid Perfume',
  'fragrances',
  'A balm of oud and Damask rose in a refillable gold tin.',
  'Beeswax, jojoba and shea whipped with oud and Damask rose absolute into a balm you warm with a fingertip. It travels through any security line, never spills in a bag, and sits closer to the skin than a spray ever does.',
  'Beeswax, jojoba, shea butter, oud and rose absolute',
  ARRAY['15 g brushed-gold refillable tin', 'Alcohol-free — kind to sensitive skin', 'Cabin-bag friendly, spill-proof', 'Presented in an ivory linen pouch']::text[],
  ARRAY['Close the lid firmly after use', 'Keep below 30°C so the balm stays firm']::text[],
  ARRAY['Gold', 'Blush']::text[],
  ARRAY['/images/products/oud-rose-solid-perfume-a.webp', '/images/products/oud-rose-solid-perfume-b.webp']::text[],
  '[{"name":"15 g","dimensions":"Refillable tin","price":25,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'glazed-stoneware-dinner-set',
  'Glazed Stoneware Dinner Set',
  'home-living',
  'Hand-thrown stoneware in a speckled, small-batch glaze.',
  'Thrown on the wheel and glazed in small batches, so no two pieces are quite alike — and that is the point. Generous plates, deep bowls and mugs that hold their heat, all fired high enough to survive the dishwasher and a decade of Sundays.',
  'Hand-thrown stoneware, lead-free speckled glaze',
  ARRAY['12-piece set: 4 plates, 4 bowls, 4 mugs', 'Each piece thrown and glazed by hand', 'Dishwasher and microwave safe', 'Chip-resistant high-fire stoneware']::text[],
  ARRAY['Dishwasher safe on a normal cycle', 'Avoid thermal shock — no oven-to-fridge']::text[],
  ARRAY['Cream', 'Sage']::text[],
  ARRAY['/images/products/glazed-stoneware-dinner-set-a.webp', '/images/products/glazed-stoneware-dinner-set-b.webp']::text[],
  '[{"name":"12-piece set","dimensions":"4 place settings","price":80,"compare_at_price":null},{"name":"18-piece set","dimensions":"6 place settings","price":120,"compare_at_price":null}]'::jsonb,
  NULL,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'rattan-pendant-light',
  'Rattan Pendant Light',
  'home-living',
  'Hand-woven rattan that turns light into texture.',
  'Woven from natural rattan over a solid brass fitting, this pendant throws a warm lattice of light and shadow across a room. Hang it low over a dining table or in a reading corner — it is the piece that makes the evening.',
  'Hand-woven natural rattan, solid brass fitting',
  ARRAY['Casts a warm, patterned lattice of light', '1.5 m adjustable cord and ceiling rose included', 'Fits a standard E27 bulb (not included)', 'Each shade woven by hand — patterns vary slightly']::text[],
  ARRAY['Dust with a dry cloth or soft brush', 'Indoor use only']::text[],
  ARRAY['Natural', 'Oat']::text[],
  ARRAY['/images/products/rattan-pendant-light-a.webp', '/images/products/rattan-pendant-light-b.webp']::text[],
  '[{"name":"Medium","dimensions":"Ø 40 cm","price":48,"compare_at_price":null},{"name":"Large","dimensions":"Ø 55 cm","price":60,"compare_at_price":null}]'::jsonb,
  'New',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'hand-thrown-ceramic-vase',
  'Hand-Thrown Ceramic Vase',
  'home-living',
  'Wheel-thrown stoneware with a quiet matte glaze.',
  'Thrown on the wheel by the potter we work with, each vase carries the maker''s finger lines beneath a quiet matte glaze. Weighted at the base to hold a full branch without tipping — or to stand beautifully empty, which is how we keep ours.',
  'Wheel-thrown stoneware, matte glaze',
  ARRAY['Each piece is one of one — glaze and lines vary', 'Watertight, fully sealed interior', 'Weighted base holds tall stems', 'Fired to 1,240°C for strength']::text[],
  ARRAY['Rinse and hand dry', 'Avoid abrasive scrubbing on the glaze']::text[],
  ARRAY['Cream', 'Ivory']::text[],
  ARRAY['/images/products/hand-thrown-ceramic-vase-a.webp', '/images/products/hand-thrown-ceramic-vase-b.webp']::text[],
  '[{"name":"Small","dimensions":"H 18 cm","price":16,"compare_at_price":null},{"name":"Medium","dimensions":"H 26 cm","price":23,"compare_at_price":null},{"name":"Large","dimensions":"H 34 cm","price":30,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'teak-bedside-table',
  'Teak Bedside Table',
  'home-living',
  'Solid teak, hand-cut joinery, oiled never lacquered.',
  'A quiet piece of furniture that earns its place: solid Sri Lankan teak, hand-cut joinery with no visible fixings, and a lower shelf for the book you are actually reading. Oiled rather than lacquered, so the grain keeps breathing and deepens with the years.',
  'Solid teak, hand-oiled finish',
  ARRAY['Solid timber throughout — no veneers', 'Traditional hand-cut joinery, no visible fixings', 'Lower shelf for books and baskets', 'Grain and tone vary board to board']::text[],
  ARRAY['Dust with a dry cloth', 'Re-oil yearly', 'Keep clear of direct radiator heat']::text[],
  ARRAY['Natural', 'Tan']::text[],
  ARRAY['/images/products/teak-bedside-table-a.webp', '/images/products/teak-bedside-table-b.webp']::text[],
  '[{"name":"One size","dimensions":"45 × 35 × 55 cm","price":55,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'handloom-cotton-throw',
  'Handloom Cotton Throw',
  'home-living',
  'Handwoven on wooden looms with a knotted fringe.',
  'Each throw is woven on a traditional wooden loom by one weaver from start to finish, then finished with a hand-knotted fringe. Light enough for a warm evening, wide enough to share — it lives on the arm of the sofa and ends up over someone''s knees.',
  '100% handloom cotton',
  ARRAY['Handwoven in small batches, one weaver per piece', 'Hand-knotted fringe on both ends', 'Pre-washed for softness and zero shrinkage', 'Ethically made in Sri Lanka']::text[],
  ARRAY['Gentle machine wash cold', 'Line dry']::text[],
  ARRAY['Natural', 'Dusty Blue']::text[],
  ARRAY['/images/products/handloom-cotton-throw-a.webp', '/images/products/handloom-cotton-throw-b.webp']::text[],
  '[{"name":"One size","dimensions":"130 × 180 cm","price":33,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'travertine-brass-tray',
  'Travertine & Brass Tray',
  'home-living',
  'Solid travertine with hand-brushed brass handles.',
  'Cut from a single slab of Italian travertine and fitted with hand-brushed brass handles. Heavy in the way good things are heavy. It gathers the perfume bottles on a dressing table, or carries two coffees and the morning paper without a wobble.',
  'Solid travertine, brushed brass handles',
  ARRAY['Cut from a single slab — veining varies', 'Hand-brushed solid brass handles', 'Felt-padded underside protects surfaces', 'Sealed against water marks']::text[],
  ARRAY['Wipe with a damp cloth', 'Blot spills quickly — stone is porous']::text[],
  ARRAY['Ivory', 'Gold']::text[],
  ARRAY['/images/products/travertine-brass-tray-a.webp', '/images/products/travertine-brass-tray-b.webp']::text[],
  '[{"name":"Medium","dimensions":"30 × 20 cm","price":38,"compare_at_price":null},{"name":"Large","dimensions":"40 × 28 cm","price":50,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'freshwater-pearl-strand-necklace',
  'Freshwater Pearl Strand Necklace',
  'jewelry',
  'AAA-grade pearls, hand-knotted on silk between each bead.',
  'Round AAA-grade freshwater pearls, matched by hand for lustre and size, then knotted individually onto silk thread so they never rub and never all scatter. Finished with a solid 14k gold-filled clasp. The necklace you will still be wearing in thirty years.',
  'AAA-grade freshwater pearls, silk thread, 14k gold-filled clasp',
  ARRAY['7–8 mm round pearls, hand-matched for lustre', 'Individually knotted on silk between each pearl', 'Solid 14k gold-filled clasp, not plated', 'Presented in a lined jewellery box']::text[],
  ARRAY['Last on, first off — perfume dulls nacre', 'Wipe with a soft cloth', 'Store flat, never hanging']::text[],
  ARRAY['Pearl White', 'Gold']::text[],
  ARRAY['/images/products/freshwater-pearl-strand-necklace-a.webp', '/images/products/freshwater-pearl-strand-necklace-b.webp']::text[],
  '[{"name":"Choker 42 cm","dimensions":"7–8 mm pearls","price":110,"compare_at_price":null},{"name":"Princess 46 cm","dimensions":"7–8 mm pearls","price":120,"compare_at_price":null},{"name":"Matinée 60 cm","dimensions":"7–8 mm pearls","price":160,"compare_at_price":null}]'::jsonb,
  'Bestseller',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'baroque-pearl-drop-earrings',
  'Baroque Pearl Drop Earrings',
  'jewelry',
  'No two alike — baroque pearls on gold vermeil huggies.',
  'Baroque pearls are the ones the industry once threw away for being irregular; we think they are the interesting ones. Each drop is chosen individually and hung from a gold vermeil huggie hoop, which means the pair you receive is genuinely yours alone.',
  'Baroque freshwater pearls, gold vermeil over sterling silver',
  ARRAY['12–15 mm baroque pearls — every shape unique', 'Gold vermeil over solid sterling silver', 'Secure hinged huggie closure', 'Weigh under 4 g each — no dragging on the lobe']::text[],
  ARRAY['Last on, first off', 'Wipe with a soft cloth after wear', 'Store in the pouch provided']::text[],
  ARRAY['Pearl White', 'Gold']::text[],
  ARRAY['/images/products/baroque-pearl-drop-earrings-a.webp', '/images/products/baroque-pearl-drop-earrings-b.webp']::text[],
  '[{"name":"One size","dimensions":"Drop 32 mm","price":60,"compare_at_price":null}]'::jsonb,
  NULL,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'ceylon-blue-sapphire-pendant',
  'Ceylon Blue Sapphire Pendant',
  'jewelry',
  'A Ratnapura sapphire, bezel-set in solid 18k gold.',
  'An oval Ceylon blue sapphire from the Ratnapura mines — the stone this island is known for — bezel-set in solid 18k yellow gold on a fine cable chain. Certified, traceable, and unheated, which is rarer than most of what you will be shown elsewhere.',
  'Ceylon blue sapphire, solid 18k yellow gold',
  ARRAY['1.2 ct oval Ceylon sapphire, unheated', 'Solid 18k yellow gold bezel and chain', 'Certificate of origin included', 'Adjustable 42/45 cm cable chain']::text[],
  ARRAY['Remove before swimming or sport', 'Clean with warm water and a soft brush']::text[],
  ARRAY['Sapphire Blue', 'Gold']::text[],
  ARRAY['/images/products/ceylon-blue-sapphire-pendant-a.webp', '/images/products/ceylon-blue-sapphire-pendant-b.webp']::text[],
  '[{"name":"One size","dimensions":"1.2 ct, 42/45 cm chain","price":300,"compare_at_price":null}]'::jsonb,
  'Fine jewellery',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'rainbow-moonstone-ring',
  'Rainbow Moonstone Ring',
  'jewelry',
  'A cabochon moonstone with a blue flash, in 14k gold.',
  'A high-dome rainbow moonstone cabochon that throws a blue flash when it catches the light, bezel-set in solid 14k gold on a slim band. Quiet from across a room and quietly extraordinary up close — which is more or less the house position on everything.',
  'Rainbow moonstone, solid 14k yellow gold',
  ARRAY['10 × 8 mm high-dome cabochon', 'Solid 14k gold bezel and band, not plated', 'Natural stone — every flash pattern differs', 'Sizes 6 to 9; free resizing within 30 days']::text[],
  ARRAY['Remove before swimming or sport', 'Moonstone is soft — store separately']::text[],
  ARRAY['Moonstone', 'Gold']::text[],
  ARRAY['/images/products/rainbow-moonstone-ring-a.webp', '/images/products/rainbow-moonstone-ring-b.webp']::text[],
  '[{"name":"Size 6","dimensions":"16.5 mm","price":140,"compare_at_price":null},{"name":"Size 7","dimensions":"17.3 mm","price":140,"compare_at_price":null},{"name":"Size 8","dimensions":"18.2 mm","price":140,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'pearl-gold-vermeil-bracelet',
  'Pearl & Gold Vermeil Bracelet',
  'jewelry',
  'Knotted pearls with a gold vermeil lobster clasp.',
  'The strand necklace''s everyday sibling: the same hand-matched freshwater pearls, individually knotted on silk, at a length you can wear with a rolled sleeve. Stack it with a plain gold bangle, or wear it entirely alone.',
  'AAA-grade freshwater pearls, silk thread, gold vermeil clasp',
  ARRAY['6–7 mm round pearls, hand-matched', 'Individually knotted on silk', 'Gold vermeil lobster clasp with an extender', 'Presented in a lined jewellery box']::text[],
  ARRAY['Last on, first off', 'Wipe with a soft cloth', 'Store flat in the box provided']::text[],
  ARRAY['Pearl White', 'Gold']::text[],
  ARRAY['/images/products/pearl-gold-vermeil-bracelet-a.webp', '/images/products/pearl-gold-vermeil-bracelet-b.webp']::text[],
  '[{"name":"17 cm","dimensions":"6–7 mm pearls","price":48,"compare_at_price":null},{"name":"19 cm","dimensions":"6–7 mm pearls","price":50,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'hammered-gold-vermeil-hoops',
  'Hammered Gold Vermeil Hoops',
  'jewelry',
  'Hand-hammered hoops that catch light from every angle.',
  'Each hoop is hammered by hand, so the surface breaks the light into dozens of small flashes instead of one flat shine. Thick gold vermeil over sterling silver — the plating is measured in microns, not molecules, and it will not wear through.',
  '2.5 micron gold vermeil over sterling silver',
  ARRAY['Hand-hammered — every hoop''s texture is unique', '2.5 micron vermeil, far above plating standard', 'Secure hinged closure', 'Hypoallergenic, nickel-free']::text[],
  ARRAY['Remove before showering', 'Polish with the cloth provided']::text[],
  ARRAY['Gold']::text[],
  ARRAY['/images/products/hammered-gold-vermeil-hoops-a.webp', '/images/products/hammered-gold-vermeil-hoops-b.webp']::text[],
  '[{"name":"Small","dimensions":"Ø 20 mm","price":33,"compare_at_price":null},{"name":"Medium","dimensions":"Ø 30 mm","price":38,"compare_at_price":null},{"name":"Large","dimensions":"Ø 45 mm","price":45,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'batik-silk-scarf',
  'Hand-Painted Batik Silk Scarf',
  'fashion',
  'Wax-resist batik on mulberry silk, painted by one artisan.',
  'Traditional wax-resist batik on 16-momme mulberry silk, drawn freehand in a botanical pattern of ivory, dusty blue and gold. Each scarf takes three days and passes through one pair of hands — small variations in the line are the signature, not the flaw.',
  '16-momme mulberry silk, hand-drawn batik',
  ARRAY['90 × 90 cm, hand-rolled edges', 'Wax-resist batik drawn freehand', 'Colour-fast natural and reactive dyes', 'Each piece signed by its artisan']::text[],
  ARRAY['Dry clean only', 'Store rolled, not folded, to avoid creases']::text[],
  ARRAY['Ivory', 'Dusty Blue', 'Gold']::text[],
  ARRAY['/images/products/batik-silk-scarf-a.webp', '/images/products/batik-silk-scarf-b.webp']::text[],
  '[{"name":"90 × 90 cm","dimensions":"Square","price":55,"compare_at_price":null},{"name":"180 × 55 cm","dimensions":"Long stole","price":70,"compare_at_price":null}]'::jsonb,
  'New',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'washed-linen-shirt-dress',
  'Washed Linen Shirt Dress',
  'fashion',
  'European flax, garment-washed, with real horn buttons.',
  'Cut from heavyweight European flax and garment-washed until it drapes rather than stands. A relaxed shirt silhouette with a removable belt, deep side pockets and genuine horn buttons — it goes to the office, then straight to dinner, and never once looks creased in the wrong way.',
  '100% European flax linen, garment washed',
  ARRAY['Relaxed shirt silhouette with a removable belt', 'Deep side seam pockets', 'Genuine horn buttons', 'Pre-washed — no shrinkage surprises']::text[],
  ARRAY['Machine wash cool on gentle', 'Line dry', 'Warm iron while slightly damp']::text[],
  ARRAY['Oat', 'Ivory']::text[],
  ARRAY['/images/products/washed-linen-shirt-dress-a.webp', '/images/products/washed-linen-shirt-dress-b.webp']::text[],
  '[{"name":"XS","dimensions":"UK 6–8","price":75,"compare_at_price":null},{"name":"S","dimensions":"UK 8–10","price":75,"compare_at_price":null},{"name":"M","dimensions":"UK 10–12","price":75,"compare_at_price":null},{"name":"L","dimensions":"UK 14–16","price":80,"compare_at_price":null}]'::jsonb,
  NULL,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'palmyrah-woven-tote',
  'Palmyrah Woven Tote',
  'fashion',
  'Hand-woven palmyrah leaf with vegetable-tanned handles.',
  'Woven from palmyrah palm leaf by artisans in the island''s north, using a craft that has been passed down through generations of the same families. Fitted with vegetable-tanned leather handles and a lined interior, so it works as a market basket or a weekend bag.',
  'Hand-woven palmyrah leaf, vegetable-tanned leather handles',
  ARRAY['Hand-woven by artisans in northern Sri Lanka', 'Vegetable-tanned leather handles that patina', 'Cotton-lined interior with an inner pocket', 'Holds up to 8 kg comfortably']::text[],
  ARRAY['Wipe with a dry cloth', 'Keep dry — do not soak the weave']::text[],
  ARRAY['Natural', 'Tan']::text[],
  ARRAY['/images/products/palmyrah-woven-tote-a.webp', '/images/products/palmyrah-woven-tote-b.webp']::text[],
  '[{"name":"Medium","dimensions":"34 × 30 × 14 cm","price":42,"compare_at_price":null},{"name":"Large","dimensions":"42 × 36 × 16 cm","price":50,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'leather-crossbody-bag',
  'Vegetable-Tanned Crossbody Bag',
  'fashion',
  'Full-grain leather that darkens beautifully with use.',
  'Full-grain leather, vegetable-tanned over six weeks with tree bark rather than chemicals, so it arrives pale and honey-coloured and darkens into something entirely your own. Solid brass hardware, an adjustable strap, and enough room for a phone, a wallet and not much else — which is the point.',
  'Full-grain vegetable-tanned leather, solid brass hardware',
  ARRAY['Full-grain leather, six-week bark tanning', 'Solid brass hardware, not plated', 'Adjustable strap: crossbody or shoulder', 'Develops a unique patina with wear']::text[],
  ARRAY['Condition twice a year with a leather balm', 'Keep out of prolonged direct sun']::text[],
  ARRAY['Tan']::text[],
  ARRAY['/images/products/leather-crossbody-bag-a.webp', '/images/products/leather-crossbody-bag-b.webp']::text[],
  '[{"name":"One size","dimensions":"22 × 16 × 7 cm","price":90,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'resort-linen-kaftan',
  'Resort Linen Kaftan',
  'fashion',
  'Featherweight linen with hand-embroidered gold thread.',
  'Featherweight European linen, cut wide and easy, with gold thread hand-embroidered around the neckline by a single embroiderer. It goes over a swimsuit at noon and over trousers at dinner, and it packs down to almost nothing.',
  'Lightweight European flax linen, hand-embroidered gold thread',
  ARRAY['Hand-embroidered neckline — 4 hours per piece', 'Featherweight 120 gsm linen', 'Relaxed one-size cut with side splits', 'Packs flat; shakes out crease-free']::text[],
  ARRAY['Machine wash cool on gentle', 'Line dry in shade', 'Cool iron the embroidery from the reverse']::text[],
  ARRAY['Ivory', 'Gold']::text[],
  ARRAY['/images/products/resort-linen-kaftan-a.webp', '/images/products/resort-linen-kaftan-b.webp']::text[],
  '[{"name":"One size","dimensions":"Fits UK 8–16","price":65,"compare_at_price":80}]'::jsonb,
  'Save 20%',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'raffia-sun-hat',
  'Raffia Sun Hat',
  'fashion',
  'Wide-brim raffia with a grosgrain band — packs flat.',
  'Hand-woven Madagascan raffia with a 10 cm brim and an ivory grosgrain band. Stiff enough to hold its shape against a sea breeze, soft enough to roll into a suitcase and shake back out at the other end.',
  'Hand-woven Madagascan raffia, grosgrain ribbon band',
  ARRAY['10 cm brim — genuine shade, not decoration', 'Internal drawstring for a precise fit', 'Packs flat and recovers its shape', 'UPF 50+ weave density']::text[],
  ARRAY['Store flat or on a hook', 'Reshape the brim by hand when damp']::text[],
  ARRAY['Natural', 'Ivory']::text[],
  ARRAY['/images/products/raffia-sun-hat-a.webp', '/images/products/raffia-sun-hat-b.webp']::text[],
  '[{"name":"One size","dimensions":"56–58 cm adjustable","price":30,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'cloud-percale-sheet-set',
  'Cloud Percale Sheet Set',
  'bedlinen',
  'Crisp, cool 400-thread percale in cloud ivory.',
  'Woven from long-staple cotton in a tight percale weave, the Cloud set sleeps crisp and cool the whole year round — the hotel-sheet feeling, without the starch. Flat sheet, fitted sheet and two pillowcases, all double-stitched at the hem.',
  '100% long-staple cotton, 400 thread count percale',
  ARRAY['Flat sheet, fitted sheet and two pillowcases', 'Deep 40 cm fitted-sheet pocket', 'Softens with every wash, never pills', 'OEKO-TEX certified — no harsh finishes']::text[],
  ARRAY['Machine wash cold on gentle', 'Tumble dry low', 'Warm iron if you like the crispness']::text[],
  ARRAY['Ivory', 'Oat']::text[],
  ARRAY['/images/products/cloud-percale-sheet-set-a.webp', '/images/products/cloud-percale-sheet-set-b.webp']::text[],
  '[{"name":"Single","dimensions":"150 × 220 cm","price":42,"compare_at_price":null},{"name":"Double","dimensions":"200 × 220 cm","price":48,"compare_at_price":null},{"name":"Queen","dimensions":"230 × 250 cm","price":55,"compare_at_price":null},{"name":"King","dimensions":"260 × 270 cm","price":60,"compare_at_price":null}]'::jsonb,
  'Bestseller',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'stonewashed-linen-sheet-set',
  'Stonewashed Linen Sheet Set',
  'bedlinen',
  'Garment-washed European flax with a lived-in softness.',
  'Our signature linen is stonewashed before it reaches you, so it arrives soft and tumbled instead of asking for a year of patience. Naturally temperature-regulating — cool through a Colombo April, warm enough in an over-conditioned room.',
  '100% European flax linen, stonewashed',
  ARRAY['Pre-washed — no shrinkage surprises', 'Naturally breathable and moisture-wicking', 'Yarn-dyed for colour that lasts', 'Gets softer every single wash']::text[],
  ARRAY['Machine wash warm', 'Line dry or tumble dry low', 'No ironing needed']::text[],
  ARRAY['Oat', 'Dusty Blue']::text[],
  ARRAY['/images/products/stonewashed-linen-sheet-set-a.webp', '/images/products/stonewashed-linen-sheet-set-b.webp']::text[],
  '[{"name":"Double","dimensions":"200 × 220 cm","price":65,"compare_at_price":null},{"name":"Queen","dimensions":"230 × 250 cm","price":75,"compare_at_price":null},{"name":"King","dimensions":"260 × 270 cm","price":85,"compare_at_price":null}]'::jsonb,
  NULL,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'enivrant-signature-bedding-set',
  'Enivrant Signature Bedding Set',
  'bedlinen',
  'The complete bed — save 20% against unit prices.',
  'Everything the bed needs in one box: flat sheet, fitted sheet, duvet cover and four pillowcases in our signature percale, curated to match and priced 20% below buying each piece alone. It arrives in a cotton keeper bag, which is where it lives between seasons.',
  '100% long-staple cotton, 400 thread count percale',
  ARRAY['7 pieces: flat, fitted, duvet cover, four pillowcases', 'Save 20% against unit prices', 'Presented in a reusable cotton keeper bag', 'OEKO-TEX certified throughout']::text[],
  ARRAY['Machine wash cold', 'Tumble dry low']::text[],
  ARRAY['Ivory', 'Champagne']::text[],
  ARRAY['/images/products/enivrant-signature-bedding-set-a.webp', '/images/products/enivrant-signature-bedding-set-b.webp']::text[],
  '[{"name":"Double","dimensions":"7-piece set","price":120,"compare_at_price":150},{"name":"Queen","dimensions":"7-piece set","price":130,"compare_at_price":170},{"name":"King","dimensions":"7-piece set","price":140,"compare_at_price":180}]'::jsonb,
  'Save 20%',
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'mulberry-silk-pillowcase-pair',
  'Mulberry Silk Pillowcase Pair',
  'bedlinen',
  '22-momme grade 6A silk — kinder to hair and skin.',
  '22-momme grade 6A mulberry silk, the weight hotels use and the grade most brands quietly skip. Silk does not wick moisture out of skin and hair the way cotton does, and it does not crease a face overnight. Hidden zip closure, so nothing shows.',
  '22-momme grade 6A mulberry silk',
  ARRAY['Pair of pillowcases, hidden zip closure', '22-momme weight, grade 6A long-fibre silk', 'Naturally hypoallergenic and temperature-regulating', 'OEKO-TEX certified dyes']::text[],
  ARRAY['Machine wash cold in a mesh bag on delicate', 'Dry flat away from sunlight', 'Cool iron on the reverse']::text[],
  ARRAY['Champagne', 'Ivory']::text[],
  ARRAY['/images/products/mulberry-silk-pillowcase-pair-a.webp', '/images/products/mulberry-silk-pillowcase-pair-b.webp']::text[],
  '[{"name":"Standard","dimensions":"50 × 75 cm (×2)","price":60,"compare_at_price":null},{"name":"King","dimensions":"50 × 90 cm (×2)","price":70,"compare_at_price":null}]'::jsonb,
  NULL,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'goose-down-duvet',
  'European Goose Down Duvet',
  'bedlinen',
  '800-fill-power down in a baffle-box cotton shell.',
  '800-fill-power European goose down in a baffle-box construction, so the down stays where it should instead of migrating to the corners by February. Wrapped in a 300-thread cotton cambric shell that keeps every feather exactly where you put it.',
  '800 fill power European goose down, 300TC cotton cambric shell',
  ARRAY['Baffle-box construction — no cold spots', '800 fill power: maximum warmth, minimum weight', 'Down-proof 300-thread cotton cambric shell', 'Responsible Down Standard certified']::text[],
  ARRAY['Air monthly; wash yearly on a down cycle', 'Tumble dry low with dryer balls']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/goose-down-duvet-a.webp', '/images/products/goose-down-duvet-b.webp']::text[],
  '[{"name":"Double — all season","dimensions":"200 × 220 cm","price":150,"compare_at_price":null},{"name":"Queen — all season","dimensions":"230 × 220 cm","price":170,"compare_at_price":null},{"name":"King — all season","dimensions":"260 × 240 cm","price":190,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'waffle-weave-blanket',
  'Waffle Weave Blanket',
  'bedlinen',
  'An airy honeycomb weave that layers beautifully.',
  'The honeycomb structure traps air for warmth without any weight, which makes it the most useful blanket in the house — under a duvet in the cold months, alone in the warm ones, and folded across the end of the bed for the rest of the year.',
  '100% combed cotton waffle weave',
  ARRAY['Lightweight, breathable warmth', 'Pre-washed for immediate softness', 'Clean selvedge edge finish', 'Layers under any duvet without bulk']::text[],
  ARRAY['Machine wash cold', 'Tumble dry low']::text[],
  ARRAY['Oat', 'Ivory']::text[],
  ARRAY['/images/products/waffle-weave-blanket-a.webp', '/images/products/waffle-weave-blanket-b.webp']::text[],
  '[{"name":"Double","dimensions":"200 × 220 cm","price":45,"compare_at_price":null},{"name":"King","dimensions":"240 × 260 cm","price":50,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description, description = EXCLUDED.description,
  material = EXCLUDED.material, details = EXCLUDED.details, care = EXCLUDED.care,
  colors = EXCLUDED.colors, images = EXCLUDED.images, sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge, featured = EXCLUDED.featured, in_stock = EXCLUDED.in_stock;


-- 3. Retire the Ivory Homez catalogue ---------------------------------------
-- Only the seed slugs 0005 introduced are removed by name. Past orders keep
-- their history regardless — order_items stores its own name/price copies.

DELETE FROM public.products
WHERE category_slug IN ('kitchen', 'bedroom', 'lounge', 'bathroom', 'garden', 'garage');

-- The room collections go too, but only once nothing is left in them, so a
-- product the client added in /admin is never cascaded away silently. If a
-- collection survives this, move its products in /admin and re-run.
DELETE FROM public.categories c
WHERE c.slug IN ('kitchen', 'bedroom', 'lounge', 'bathroom', 'garden', 'garage')
  AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.category_slug = c.slug);

COMMIT;
