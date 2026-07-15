-- Migration 0005: Holistic home & living rebrand
--
-- Ivory Homez pivoted from a bedding company to a holistic home & living
-- range. This migration:
--   1. refreshes the six room collections with the new descriptions,
--   2. upserts the full 25-piece catalog (stoneware, teak, rattan lighting,
--      candles, planters and workshop storage alongside the retained textile
--      line) by slug — existing rows are overwritten with the new copy,
--   3. removes the retired bedding-only products.
--
-- NOTE: step 3 deletes ONLY the six retired seed slugs listed at the bottom.
-- Products you created yourself in /admin are untouched. Past orders keep
-- their history either way (order_items stores its own name/price copies).
-- Generated from src/lib/seed-data.ts — the storefront's demo-mode fallback —
-- so database and fallback stay identical.

BEGIN;

-- 1. Room collections -------------------------------------------------------

INSERT INTO public.categories (slug, name, description, image, sort_order)
VALUES
  ('kitchen', 'Kitchen', 'Hand-thrown stoneware, teak boards and linen textiles for the heart of the home.', '/images/categories/kitchen.png', 1),
  ('bedroom', 'Bedroom', 'Bedding, bedside lighting and calm details for rooms made to rest in.', '/images/categories/bedroom.png', 2),
  ('lounge', 'Lounge', 'Handloom throws, rattan lighting, vases and candles for rooms you live in.', '/images/categories/lounge.png', 3),
  ('bathroom', 'Bathroom', 'Organic towels, teak caddies and waffle robes — an everyday spa at home.', '/images/categories/bathroom.png', 4),
  ('garden', 'Garden', 'Terracotta planters, handloom cushions and weatherproof layers for life outdoors.', '/images/categories/garden.png', 5),
  ('garage', 'Garage', 'Sturdy storage, canvas organisers and workshop-grade utility, made beautiful.', '/images/categories/garage.png', 6)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sort_order = EXCLUDED.sort_order;

-- 2. Catalog upserts --------------------------------------------------------

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'glazed-stoneware-dinner-set', 'Glazed Stoneware Dinner Set', 'kitchen',
  'Hand-thrown stoneware in a speckled, small-batch glaze.',
  'Thrown on the wheel and glazed in small batches, no two pieces of this dinner set are exactly alike — and that''s the point. Generous plates, deep bowls and mugs that keep tea warm, all fired to survive daily use and the dishwasher.',
  'Hand-thrown stoneware, lead-free speckled glaze',
  array['12-piece set: 4 dinner plates, 4 bowls, 4 mugs', 'Each piece thrown and glazed by hand', 'Dishwasher and microwave safe', 'Chip-resistant high-fire stoneware']::text[],
  array['Dishwasher safe on a normal cycle', 'Avoid thermal shock — no oven-to-fridge']::text[],
  array['Speckled Cream', 'Sage', 'Terracotta']::text[],
  array['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"12-piece set","dimensions":"4 place settings","price":24500,"compare_at_price":null},{"name":"18-piece set","dimensions":"6 place settings","price":34500,"compare_at_price":null}]'::jsonb,
  'New', true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'teak-serving-boards', 'Teak Serving Board Duo', 'kitchen',
  'Reclaimed solid teak, shaped and oiled by hand.',
  'Cut from reclaimed Sri Lankan teak and finished with food-safe oil, these boards go from chopping to serving without a costume change. The grain deepens beautifully with use — wipe, oil occasionally, and they''ll outlast the kitchen.',
  'Solid reclaimed teak, food-safe oil finish',
  array['Sold as a pair — one for prep, one for the table', 'Reclaimed timber, no two boards alike', 'Integrated handle with leather hanging loop', 'Naturally antibacterial dense grain']::text[],
  array['Hand wash and dry upright', 'Re-oil monthly with food-safe mineral oil', 'Never soak or dishwash']::text[],
  array['Natural Teak']::text[],
  array['https://images.unsplash.com/photo-1605522561233-768ad7a8fabf?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Duo","dimensions":"20 × 35 cm + 25 × 45 cm","price":9800,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'washed-linen-apron', 'Washed Linen Apron', 'kitchen',
  'Artisanal cross-back linen apron with deep front pockets.',
  'Sewn from heavy European flax linen, this cross-back apron distributes weight evenly across your shoulders, not your neck. Features double-stitched utility pockets and a relaxed, lived-in drape that only gets better with wash and wear.',
  '100% European flax linen, washed finish',
  array['Comfortable cross-back design (no neck ties)', 'Two deep front utility pockets', 'Reinforced stitching at stress points', 'One size fits most']::text[],
  array['Machine wash warm', 'Tumble dry low', 'No ironing needed']::text[],
  array['Oatmeal', 'Charcoal', 'Sage']::text[],
  array['https://images.unsplash.com/photo-1556910103001-cf37a8c24207?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"85 × 90 cm","price":8500,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'waffle-kitchen-towels', 'Waffle Kitchen Towels (Set of 3)', 'kitchen',
  'Thirsty honeycomb kitchen towels in earthy neutrals.',
  'A pack of three highly absorbent, waffle-woven kitchen towels. Woven from a durable cotton-linen blend that dries quickly and leaves no lint on glassware. Finished with a woven hanging loop.',
  '80% long-staple cotton, 20% European linen',
  array['Set of three matching towels', 'Quick-drying honeycomb waffle weave', 'Lint-free drying for glassware', 'Integrated hanging loop']::text[],
  array['Machine wash warm', 'Tumble dry medium']::text[],
  array['Natural Mix', 'Sage Mix']::text[],
  array['https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1607344646505-0e7b41cfba45?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Standard Pack","dimensions":"45 × 65 cm (x3)","price":5900,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'cloud-percale-sheet-set', 'Cloud Percale Sheet Set', 'bedroom',
  'Crisp, cool 400-thread percale in cloud white.',
  'Woven from long-staple cotton in a tight percale weave, the Cloud set sleeps crisp and cool all year round. Each set includes one flat sheet, one fitted sheet and two pillowcases, finished with a double-stitched hem.',
  '100% long-staple cotton, 400 thread count percale',
  array['Includes flat sheet, fitted sheet and two pillowcases', 'Deep 40 cm fitted-sheet pocket', 'Gets softer with every wash', 'OEKO-TEX certified, free of harsh chemicals']::text[],
  array['Machine wash cold on gentle', 'Tumble dry low', 'Warm iron if desired']::text[],
  array['Cloud White', 'Oat', 'Sage']::text[],
  array['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Single","dimensions":"150 × 220 cm","price":12500,"compare_at_price":null},{"name":"Double","dimensions":"200 × 220 cm","price":14500,"compare_at_price":null},{"name":"Queen","dimensions":"230 × 250 cm","price":16500,"compare_at_price":null},{"name":"King","dimensions":"260 × 270 cm","price":18500,"compare_at_price":null}]'::jsonb,
  'Bestseller', true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'stonewashed-linen-sheet-set', 'Stonewashed Linen Sheet Set', 'bedroom',
  'Garment-washed European flax with a lived-in softness.',
  'Our signature linen is stonewashed for a soft, tumbled texture from the very first night. Naturally temperature-regulating, it keeps you cool in the heat and cosy in the cold.',
  '100% European flax linen, stonewashed',
  array['Pre-washed for zero shrinkage surprises', 'Naturally breathable and moisture-wicking', 'Yarn-dyed for rich, lasting colour']::text[],
  array['Machine wash warm', 'Line dry or tumble dry low', 'No ironing needed']::text[],
  array['Natural', 'Terracotta', 'Charcoal']::text[],
  array['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"200 × 220 cm","price":19500,"compare_at_price":null},{"name":"Queen","dimensions":"230 × 250 cm","price":22500,"compare_at_price":null},{"name":"King","dimensions":"260 × 270 cm","price":25500,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'terracotta-linen-duvet-set', 'Terracotta Linen Duvet Set', 'bedroom',
  'Sun-baked terracotta linen, hand-finished with ties.',
  'The set from our campaign imagery. Deep terracotta linen, stonewashed to a soft slub texture and finished with hand-tied corner closures that keep your duvet exactly where it should be.',
  '100% European flax linen, stonewashed',
  array['Includes duvet cover and two pillowcases', 'Hand-tied closures, interior corner ties', 'Dyed in small batches for depth of colour']::text[],
  array['Machine wash warm', 'Line dry', 'No ironing needed']::text[],
  array['Terracotta', 'Ochre']::text[],
  array['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"200 × 200 cm","price":24500,"compare_at_price":null},{"name":"Queen","dimensions":"225 × 220 cm","price":27500,"compare_at_price":null},{"name":"King","dimensions":"245 × 240 cm","price":29500,"compare_at_price":null}]'::jsonb,
  'Bestseller', true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'ivory-homez-signature-bedding-set', 'Ivory Homez Signature Bedding Set', 'bedroom',
  'The complete Ivory Homez bed — save 20% over unit prices.',
  'Everything your bed needs in one box: flat sheet, fitted sheet, duvet cover and four pillowcases in our signature percale. Curated to match, priced to save — 20% less than buying each piece alone.',
  '100% long-staple cotton, 400 thread count percale',
  array['7-piece set: flat, fitted, duvet cover, four pillowcases', 'Save 20% versus unit prices', 'Gift-ready cotton keeper bag']::text[],
  array['Machine wash cold', 'Tumble dry low']::text[],
  array['Cloud White', 'Oat', 'Terracotta']::text[],
  array['https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"7-piece set","price":36500,"compare_at_price":45500},{"name":"Queen","dimensions":"7-piece set","price":39500,"compare_at_price":49500},{"name":"King","dimensions":"7-piece set","price":42500,"compare_at_price":53000}]'::jsonb,
  'Save 20%', true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'teak-bedside-table', 'Teak Bedside Table', 'bedroom',
  'Solid teak side table, cut and oiled by hand.',
  'A quiet piece of furniture that earns its place: solid Sri Lankan teak, hand-cut joinery and a lower shelf for the book you''re actually reading. Oiled, never lacquered, so the grain keeps breathing.',
  'Solid teak, hand-oiled finish',
  array['Solid timber throughout — no veneers', 'Traditional hand-cut joinery, no visible fixings', 'Lower shelf for books and baskets', 'Grain and tone vary board to board']::text[],
  array['Dust with a dry cloth', 'Re-oil yearly to refresh the finish', 'Keep clear of direct radiator heat']::text[],
  array['Natural Teak']::text[],
  array['https://images.unsplash.com/photo-1611486212557-88be5ff6f941?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"45 × 35 × 55 cm","price":16500,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'handloom-cotton-throw', 'Handloom Cotton Throw', 'lounge',
  'Handwoven on wooden looms with knotted fringe.',
  'Each throw is handwoven on traditional wooden looms, then finished with a hand-knotted fringe. Perfect at the foot of the bed or over the shoulder on cool evenings.',
  '100% handloom cotton',
  array['Handwoven, small-batch', 'Hand-knotted fringe', 'Ethically made in Sri Lanka']::text[],
  array['Gentle machine wash cold', 'Line dry']::text[],
  array['Natural Stripe', 'Clay Stripe']::text[],
  array['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"130 × 180 cm","price":9800,"compare_at_price":null}]'::jsonb,
  null, true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'waffle-weave-blanket', 'Waffle Weave Blanket', 'lounge',
  'Airy honeycomb weave that layers beautifully.',
  'The honeycomb structure traps air for warmth without weight. Layer it under a duvet in the cold months or use it alone in the warm ones.',
  '100% combed cotton waffle weave',
  array['Lightweight, breathable warmth', 'Pre-washed for softness', 'Selvedge edge finish']::text[],
  array['Machine wash cold', 'Tumble dry low']::text[],
  array['Oat', 'Stone', 'Sage']::text[],
  array['https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"200 × 220 cm","price":13500,"compare_at_price":null},{"name":"King","dimensions":"240 × 260 cm","price":15500,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'hand-thrown-ceramic-vase', 'Hand-Thrown Ceramic Vase', 'lounge',
  'Wheel-thrown stoneware with a quiet matte glaze.',
  'Thrown on the wheel in our workshop, each vase carries the maker''s finger lines under a quiet matte glaze. Weighted to hold a full branch without tipping — or to stand beautifully empty.',
  'Wheel-thrown stoneware, matte glaze',
  array['Each piece is one of one — glaze and lines vary', 'Watertight, sealed interior', 'Weighted base for tall stems']::text[],
  array['Rinse and hand dry', 'Avoid abrasive scrubbing on the glaze']::text[],
  array['Cream', 'Clay', 'Charcoal']::text[],
  array['https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Small","dimensions":"H 18 cm","price":4900,"compare_at_price":null},{"name":"Medium","dimensions":"H 26 cm","price":6900,"compare_at_price":null},{"name":"Large","dimensions":"H 34 cm","price":8900,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'rattan-pendant-light', 'Rattan Pendant Light', 'lounge',
  'Hand-woven pendant that turns light into texture.',
  'Woven from natural rattan over a brass fitting, this pendant throws a warm lattice of light and shadow across the room. Hang it low over a dining table or in a reading corner — it makes the evening.',
  'Hand-woven natural rattan, brass fitting',
  array['Casts a warm, patterned lattice of light', '1.5 m adjustable cord, ceiling rose included', 'Fits a standard E27 bulb (not included)', 'Each shade woven by hand — patterns vary slightly']::text[],
  array['Dust with a dry cloth or soft brush', 'Indoor use only']::text[],
  array['Natural', 'Honey']::text[],
  array['https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Medium","dimensions":"Ø 40 cm","price":14500,"compare_at_price":null},{"name":"Large","dimensions":"Ø 55 cm","price":18500,"compare_at_price":null}]'::jsonb,
  'New', true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'hand-poured-candle-trio', 'Hand-Poured Candle Trio', 'lounge',
  'Soy candles in reusable stoneware vessels.',
  'Three slow-burning soy candles poured by hand into our own stoneware cups. Scents drawn from the island — cinnamon and teak, Ceylon tea, sea salt — with vessels you''ll refill or repurpose long after the wax is gone.',
  'Natural soy wax, cotton wicks, stoneware vessels',
  array['Set of three: Cinnamon & Teak, Ceylon Tea, Sea Salt', 'About 40 hours of burn time each', 'Reusable hand-thrown stoneware cups', 'Phthalate-free fragrance oils']::text[],
  array['Trim wick to 5 mm before each burn', 'First burn: let the full surface melt']::text[],
  array['Cream', 'Sand']::text[],
  array['https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Set of 3","dimensions":"3 × 180 g","price":7500,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'oak-wall-shelf-set', 'Oak Wall Shelf Set', 'lounge',
  'Solid oak floating shelves with concealed brackets.',
  'Two lengths of solid oak, planed and waxed by hand, floating on concealed steel brackets. Strong enough for a shelf of books, handsome enough for the three objects you actually want to look at.',
  'Solid oak, concealed steel brackets',
  array['Set of 2: 60 cm + 80 cm lengths', 'Concealed steel brackets, fixings included', 'Holds up to 15 kg per shelf when wall-anchored', 'Hand-waxed finish shows the natural grain']::text[],
  array['Dust with a dry cloth', 'Re-wax yearly for a fresh finish']::text[],
  array['Natural Oak']::text[],
  array['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Set of 2","dimensions":"60 cm + 80 cm × D 20 cm","price":12500,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'organic-bath-towels', 'Plush Organic Cotton Bath Towels', 'bathroom',
  'Extra-plush combed cotton towels woven to 700 GSM.',
  'Wrap yourself in pure luxury. Our organic cotton bath towels are combed for softness and woven to a substantial 700 GSM for ultimate absorbency and warmth. Finished with a clean, classic border.',
  '100% organic long-staple cotton, 700 GSM',
  array['Extra-thick and highly absorbent', 'GOTS certified organic cotton', 'Fade-resistant, low-lint weave', 'Sold individually or as a pair']::text[],
  array['Machine wash hot with like colors', 'Tumble dry high', 'Do not use fabric softener']::text[],
  array['Cloud White', 'Oat', 'Stone']::text[],
  array['https://images.unsplash.com/photo-1616627561954-252214724e5b?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Bath Towel","dimensions":"70 × 140 cm","price":9500,"compare_at_price":null},{"name":"Bath Sheet","dimensions":"100 × 150 cm","price":12500,"compare_at_price":null}]'::jsonb,
  'Bestseller', true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'waffle-bathrobe', 'Waffle Cotton Bathrobe', 'bathroom',
  'Lightweight, spa-style waffle bathrobe with waist tie.',
  'Inspired by the finest boutique hotels, our waffle bathrobe offers a lightweight, breathable cover-up for post-bath relaxation. The honeycomb weave gently exfoliates and dries quickly. Featuring two deep hip pockets and an adjustable tie belt.',
  '100% organic cotton, 350 GSM waffle weave',
  array['Unisex classic kimono silhouette', 'Adjustable double belt loops for custom fit', 'Two deep pockets', 'Pre-shrunk for lasting fit']::text[],
  array['Machine wash warm', 'Tumble dry low']::text[],
  array['Oat', 'Cloud White']::text[],
  array['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1556909181-ed82035af743?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"S/M","dimensions":"Chest 120cm, Length 115cm","price":18500,"compare_at_price":null},{"name":"L/XL","dimensions":"Chest 135cm, Length 122cm","price":18500,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'teak-bath-caddy', 'Teak Bath Caddy', 'bathroom',
  'Extendable solid teak tray for slow evenings in the tub.',
  'A bath, a book and somewhere to rest the tea. Cut from naturally water-resistant teak and finished with oil, this extendable caddy spans most tubs and holds the evening''s essentials — reader, glass, candle and all.',
  'Solid teak, water-resistant natural oil finish',
  array['Extends from 70 to 86 cm to fit most tubs', 'Recessed glass holder and book rest', 'Naturally water- and warp-resistant teak', 'Rubber grips keep it steady on acrylic tubs']::text[],
  array['Wipe dry after use', 'Re-oil every few months', 'Do not leave submerged']::text[],
  array['Natural Teak']::text[],
  array['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"70–86 × 23 cm","price":9800,"compare_at_price":null}]'::jsonb,
  'New', true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'waffle-bath-mat', 'Waffle Bath Mat', 'bathroom',
  'Dense 900 GSM waffle cotton underfoot.',
  'Woven thick at 900 GSM, this waffle mat drinks up water and dries fast, with a honeycomb texture that feels like a gentle foot massage first thing in the morning.',
  '100% organic cotton, 900 GSM waffle weave',
  array['Ultra-absorbent honeycomb weave', 'Quick-drying, low-lint construction', 'Finished with a tailored flat border']::text[],
  array['Machine wash warm', 'Tumble dry medium', 'No fabric softener']::text[],
  array['Oat', 'Cloud White', 'Stone']::text[],
  array['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"50 × 80 cm","price":4900,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'handloom-seat-cushions', 'Handloom Cotton Seat Cushions', 'garden',
  'Handwoven box cushions with convenient tie-backs.',
  'Bring comfort and artisan craftsmanship to your garden dining set. These thick box cushions are handwoven on wooden looms from heavy-weight cotton, filled with supportive recycled fibers and finished with secure ties.',
  '100% handloom cotton shell, recycled fiber fill',
  array['Heavy-duty handwoven canvas shell', 'Tufted details for shape retention', 'Two robust tie-backs for secure fastening', 'Ethically crafted by artisans']::text[],
  array['Spot clean only', 'Store indoors when not in use', 'Air dry thoroughly']::text[],
  array['Natural Stripe', 'Sage Stripe', 'Charcoal Stripe']::text[],
  array['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600585154526-7ee658dfa8e4?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"40 × 40 × 8 cm","price":6800,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'patio-waffle-throw', 'Textured Patio Throw', 'garden',
  'Durable, wind-resistant thick cotton throw for patio evenings.',
  'A heavier-weight waffle weave designed specifically for outdoor living. This blanket keeps out the evening chill on the terrace while remaining fully breathable. Finished with a modern self-fringed edge.',
  '100% durable long-staple cotton',
  array['Heavier 480 GSM weight for wind resistance', 'Fray-resistant self-fringed edges', 'Generously sized for sharing', 'Fade-resistant yarn dyeing']::text[],
  array['Machine wash cold', 'Tumble dry low', 'Do not bleach']::text[],
  array['Clay', 'Sage', 'Charcoal']::text[],
  array['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"150 × 200 cm","price":11500,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'terracotta-planter-trio', 'Terracotta Planter Trio', 'garden',
  'Hand-pressed planters that weather beautifully.',
  'Pressed and fired the traditional way, these terracotta planters breathe with the plant — roots stay healthy, and the clay takes on a soft patina season by season. Three nested sizes, drainage holes included.',
  'Hand-pressed terracotta, unglazed',
  array['Set of three: 12, 16 and 20 cm diameters', 'Drainage hole and matching saucer for each', 'Breathable unglazed clay for healthy roots', 'Weathers to a soft patina outdoors']::text[],
  array['Soak before first planting', 'Bring indoors in extreme heat spells to slow drying']::text[],
  array['Terracotta', 'Whitewash']::text[],
  array['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Set of 3","dimensions":"Ø 12 / 16 / 20 cm","price":6900,"compare_at_price":null}]'::jsonb,
  'New', true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'heavy-linen-storage', 'Heavy Linen Storage Baskets', 'garage',
  'Structured storage baskets with natural leather handles.',
  'Keep utility rooms, pantries and mudrooms organized. Sewn from double-layered heavy linen canvas, these storage baskets stand upright on their own and fold flat when not in use. Finished with double-riveted tan leather handles.',
  '100% heavy linen canvas, genuine leather handles',
  array['Stands upright independently', 'Double-riveted top-grain leather handles', 'Collapsible design for easy storage', 'Neutral linen texture hides dust']::text[],
  array['Wipe clean with a damp cloth', 'Do not submerge leather handles in water']::text[],
  array['Natural Linen', 'Charcoal Linen']::text[],
  array['https://images.unsplash.com/photo-1532882772249-df68a5dffc3e?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Medium","dimensions":"30 × 30 × 30 cm","price":7900,"compare_at_price":null},{"name":"Large","dimensions":"40 × 40 × 40 cm","price":9800,"compare_at_price":null}]'::jsonb,
  null, true, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'canvas-utility-organizer', 'Canvas Utility Hanging Organizer', 'garage',
  'Wall-mounted heavy canvas pocket organizer with brass grommets.',
  'A premium solution for organizing small tools, garden shears and utility accessories. Woven from 18oz heavy waxed cotton canvas, this hanging organizer features 8 pockets of varying sizes and reinforced brass hanging grommets.',
  '100% waxed cotton canvas, brass grommets',
  array['8 structured pockets (4 small, 4 large)', 'Three reinforced brass hanging grommets', 'Water-resistant waxed finish', 'Perfect for garage, workshop, or greenhouse walls']::text[],
  array['Wipe clean only', 'Do not wash or dry clean (wax finish)']::text[],
  array['Olive', 'Oatmeal']::text[],
  array['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Standard","dimensions":"50 × 80 cm","price":11000,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

INSERT INTO public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) VALUES (
  'waxed-canvas-tool-roll', 'Waxed Canvas Tool Roll', 'garage',
  'Twelve-slot tool roll in waxed canvas and leather.',
  'The good tools deserve better than a drawer. Twelve graded slots in 18oz waxed canvas keep chisels, drivers and secateurs organised and rust-free, rolled tight with double leather straps.',
  '18oz waxed cotton canvas, leather straps',
  array['12 graded slots plus a zipped pocket', 'Water-resistant waxed finish', 'Double leather straps with brass buckles', 'Rolls to the size of a wine bottle']::text[],
  array['Wipe clean only', 'Re-wax yearly for full weather resistance']::text[],
  array['Olive', 'Tan']::text[],
  array['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"50 × 36 cm open","price":5900,"compare_at_price":null}]'::jsonb,
  null, false, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category_slug = EXCLUDED.category_slug,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  details = EXCLUDED.details,
  care = EXCLUDED.care,
  colors = EXCLUDED.colors,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  featured = EXCLUDED.featured,
  in_stock = EXCLUDED.in_stock;

-- 3. Retire bedding-only products no longer in the range --------------------

DELETE FROM public.products
WHERE slug IN (
  'signature-sateen-fitted-sheet',
  'cloud-white-duvet-cover',
  'midnight-sateen-duvet-cover',
  'heirloom-linen-pillowcase-pair',
  'velvet-touch-pillow-shams',
  'hotel-luxe-bedding-set'
);

COMMIT;
