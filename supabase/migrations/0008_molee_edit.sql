-- Migration 0008: the Molee edit

-- Adds pieces sourced from Chengdu Molee Textile Co., Ltd.
-- (molee.en.alibaba.com) to the existing Enivrant collections. Additive only:
-- no collection is created, renamed or removed, and nothing already in the
-- catalogue is touched.
--
-- 80 pieces: bedlinen 74, wellness 4, fashion 2.
--
-- Prices are USD retail, set from the supplier's unit price for the smallest
-- order: 4x under $50, 3x from $50 to $200, 2.2x above $200, floored at each
-- band edge so a larger size never retails below a smaller one, then snapped
-- to the catalogue's clean rungs (nothing ends in 9); where a larger size
-- costs 2%+ more it retails at least one rung higher. The supplier cost and
-- SKU behind every price is in the price sheet, which is kept out of the repo.
--
-- Photographs are the supplier's own listing images, saved as WebP. SQL can
-- only record where a photo lives, not carry the file, so this migration
-- points each piece at its copy under public/images/products/molee/. To put
-- the photographs in Supabase Storage instead, where the dashboard manages
-- them, run `npm run photos:upload` afterwards: it uploads them to the
-- product-images bucket and repoints these rows at the bucket.
--
-- Generated together with src/lib/seed-data-molee.ts from one source, so a
-- fresh database and the demo-mode fallback start out identical.
--
-- Safe to run again: a piece that already exists is left exactly as it is, so
-- nothing edited in the dashboard since (names, prices, photographs) is ever
-- overwritten. It only adds pieces that are missing.

BEGIN;

-- Every piece goes into a collection that already exists. Stop with a clear
-- message, before anything is written, if one of them is missing.
DO $$
DECLARE
  missing text;
BEGIN
  SELECT string_agg(want.slug, ', ' ORDER BY want.slug) INTO missing
    FROM unnest(ARRAY['bedlinen', 'fashion', 'wellness']::text[]) AS want(slug)
   WHERE NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.slug = want.slug);
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'Missing collection(s): %. Run migration 0007 first.', missing;
  END IF;
END $$;

-- bedlinen ------------------------------------------------------------------

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'champagne-border-silk-bedding-set',
  'Champagne-Border Silk Bedding Set',
  'bedlinen',
  '22-momme mulberry silk in white, framed by a champagne border.',
  'A white bed in 22-momme mulberry silk — the heavier weight that drapes rather than slides — finished with a wide champagne border that squares the whole bed off like a picture mount. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk, 22 momme',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '22-momme mulberry silk', 'Champagne border on the duvet cover and pillowcases', 'White']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/champagne-border-silk-bedding-set-1.webp', '/images/products/molee/champagne-border-silk-bedding-set-2.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":875,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":925,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'ivory-mulberry-silk-bedding-set',
  'Ivory Mulberry Silk Bedding Set',
  'bedlinen',
  'Pure mulberry silk in soft ivory, from the pillowcases to the flat sheet.',
  'Nothing but mulberry silk, in an ivory with the faintest warmth to it. The duvet cover closes with discreet buttons, and the whole set has the liquid drape only silk has. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Mulberry silk throughout', 'Button-close duvet cover', 'Flanged pillowcase edges']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/molee/ivory-mulberry-silk-bedding-set-1.webp', '/images/products/molee/ivory-mulberry-silk-bedding-set-2.webp', '/images/products/molee/ivory-mulberry-silk-bedding-set-3.webp', '/images/products/molee/ivory-mulberry-silk-bedding-set-4.webp', '/images/products/molee/ivory-mulberry-silk-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1250,"compare_at_price":null}]'::jsonb,
  'New',
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'champagne-silk-bedding-set-19-momme',
  'Champagne Silk Bedding Set',
  'bedlinen',
  '19-momme mulberry silk in champagne, with a button-close duvet cover.',
  '19-momme mulberry silk in a warm champagne that reads gold by lamplight and almost blush by day. The duvet cover buttons closed. Duvet cover, flat sheet and two pillowcases, in king size.',
  '100% mulberry silk, 19 momme',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '19-momme mulberry silk', 'Button-close duvet cover', 'Supplied in king size']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Champagne']::text[],
  ARRAY['/images/products/molee/champagne-silk-bedding-set-19-momme-1.webp', '/images/products/molee/champagne-silk-bedding-set-19-momme-2.webp', '/images/products/molee/champagne-silk-bedding-set-19-momme-3.webp']::text[],
  '[{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1350,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'champagne-silk-jacquard-bedding-set',
  'Champagne Silk Jacquard Bedding Set',
  'bedlinen',
  'Pure mulberry silk woven with a tonal damask jacquard.',
  'The pattern is woven, not printed: a tonal damask jacquard that only shows itself when the light moves across the bed. Pure mulberry silk in champagne, with a plain border to calm it down. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk, jacquard weave',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Mulberry silk with a woven damask jacquard', 'Plain silk border', 'Champagne']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Champagne']::text[],
  ARRAY['/images/products/molee/champagne-silk-jacquard-bedding-set-1.webp', '/images/products/molee/champagne-silk-jacquard-bedding-set-2.webp', '/images/products/molee/champagne-silk-jacquard-bedding-set-3.webp', '/images/products/molee/champagne-silk-jacquard-bedding-set-4.webp', '/images/products/molee/champagne-silk-jacquard-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1500,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1550,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'ivory-silk-jacquard-bedding-set',
  'Ivory Silk Jacquard Bedding Set',
  'bedlinen',
  'Off-white mulberry silk with an abstract woven motif.',
  'An off-white silk jacquard with an abstract motif woven into the cloth, so it catches the light rather than competing with it. Pure mulberry silk, finished with a plain border. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk, jacquard weave',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Mulberry silk with a woven jacquard motif', 'Plain silk border', 'Off-white — softer than optical white']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/molee/ivory-silk-jacquard-bedding-set-1.webp', '/images/products/molee/ivory-silk-jacquard-bedding-set-2.webp', '/images/products/molee/ivory-silk-jacquard-bedding-set-3.webp', '/images/products/molee/ivory-silk-jacquard-bedding-set-4.webp', '/images/products/molee/ivory-silk-jacquard-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1450,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1600,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'grade-6a-silk-jacquard-bedding-set',
  'Grade 6A Silk Jacquard Bedding Set',
  'bedlinen',
  'Grade 6A mulberry silk in an ivory damask, with a fitted sheet.',
  'Woven from grade 6A mulberry silk — the longest, most even fibre — in an ivory damask jacquard with a delicate lace-edged trim. This set pairs the duvet cover with a fitted sheet rather than a flat one, so it stays put. Duvet cover, fitted sheet and two pillowcases.',
  '100% mulberry silk, grade 6A, jacquard weave',
  ARRAY['Duvet cover, fitted sheet and two pillowcases', 'Grade 6A mulberry silk', 'Damask jacquard with a lace-edged trim', 'Ivory']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/molee/grade-6a-silk-jacquard-bedding-set-1.webp', '/images/products/molee/grade-6a-silk-jacquard-bedding-set-2.webp', '/images/products/molee/grade-6a-silk-jacquard-bedding-set-3.webp', '/images/products/molee/grade-6a-silk-jacquard-bedding-set-4.webp']::text[],
  '[{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1350,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  '30-momme-gold-silk-bedding-set',
  '30 Momme Silk Bedding Set in Gold',
  'bedlinen',
  'The heaviest silk we carry: 30-momme mulberry silk in a soft gold.',
  'At 30 momme this is the heaviest silk in the maison — dense enough to feel cool and weighty in the hand, with a deep, soft lustre rather than a shine. In a quiet gold that warms a white room. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk, 30 momme',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '30-momme mulberry silk — the heaviest we carry', 'Soft lustre rather than high shine', 'Flanged pillowcases']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Gold']::text[],
  ARRAY['/images/products/molee/30-momme-gold-silk-bedding-set-1.webp', '/images/products/molee/30-momme-gold-silk-bedding-set-2.webp', '/images/products/molee/30-momme-gold-silk-bedding-set-3.webp', '/images/products/molee/30-momme-gold-silk-bedding-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1800,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1800,"compare_at_price":null}]'::jsonb,
  'New',
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  '26-momme-grey-silk-jacquard-set',
  '26 Momme Silk Jacquard Set in Grey',
  'bedlinen',
  'Heavyweight 26-momme yarn-dyed silk in a fine diamond jacquard.',
  'Heavyweight 26-momme mulberry silk, yarn-dyed before weaving so the grey runs through every thread, woven into a fine diamond jacquard with a plain border and an openwork hemstitch. It has the weight of good suiting and the cool of silk. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk, 26 momme, yarn-dyed jacquard',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '26-momme mulberry silk, yarn-dyed', 'Diamond jacquard with a plain border', 'Openwork hemstitch detail']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Grey']::text[],
  ARRAY['/images/products/molee/26-momme-grey-silk-jacquard-set-1.webp', '/images/products/molee/26-momme-grey-silk-jacquard-set-2.webp', '/images/products/molee/26-momme-grey-silk-jacquard-set-3.webp', '/images/products/molee/26-momme-grey-silk-jacquard-set-4.webp', '/images/products/molee/26-momme-grey-silk-jacquard-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":2750,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":2800,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'sage-silk-bedding-set',
  'Sage Silk Bedding Set',
  'bedlinen',
  'Mulberry silk in sage green, bordered and pintucked in ivory.',
  'Sage-green mulberry silk framed by an ivory border with fine pintucks, a detail you usually only find on a tailored shirt. The duvet cover buttons closed. Calm, green and a little unexpected. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Mulberry silk in sage', 'Ivory border with pintuck pleats', 'Button-close duvet cover']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Sage']::text[],
  ARRAY['/images/products/molee/sage-silk-bedding-set-1.webp', '/images/products/molee/sage-silk-bedding-set-2.webp', '/images/products/molee/sage-silk-bedding-set-3.webp', '/images/products/molee/sage-silk-bedding-set-4.webp', '/images/products/molee/sage-silk-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1350,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1400,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'camel-silk-bedding-set',
  'Camel Silk Bedding Set',
  'bedlinen',
  'Mulberry silk in a warm camel gold.',
  'A deep camel-gold mulberry silk that glows against dark wood and turns almost bronze at night. Plain, heavy on the drape and generous at the edges. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Mulberry silk in camel gold', 'Wide flanged pillowcases', 'Plain weave, no pattern']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Camel']::text[],
  ARRAY['/images/products/molee/camel-silk-bedding-set-1.webp', '/images/products/molee/camel-silk-bedding-set-2.webp', '/images/products/molee/camel-silk-bedding-set-3.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1250,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'blush-silk-bedding-set',
  'Blush Silk Bedding Set',
  'bedlinen',
  'Mulberry silk in a soft, powdery blush.',
  'A powdery blush mulberry silk — more rose petal than pink — with flanged pillowcases and ribbon ties at the duvet cover. Pretty without being sweet. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Mulberry silk in blush', 'Ribbon-tie duvet closure', 'Flanged pillowcases']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Blush']::text[],
  ARRAY['/images/products/molee/blush-silk-bedding-set-1.webp', '/images/products/molee/blush-silk-bedding-set-2.webp', '/images/products/molee/blush-silk-bedding-set-3.webp', '/images/products/molee/blush-silk-bedding-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1250,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1250,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'charcoal-silk-bedding-set',
  'Charcoal Silk Bedding Set',
  'bedlinen',
  'Mulberry silk in a deep charcoal grey.',
  'A deep charcoal-grey mulberry silk that takes on a pewter sheen wherever the light falls. The darkest silk in the collection, and the one that forgives a late night best. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Mulberry silk in charcoal', 'Pewter sheen in low light', 'Plain weave, no pattern']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Charcoal']::text[],
  ARRAY['/images/products/molee/charcoal-silk-bedding-set-1.webp', '/images/products/molee/charcoal-silk-bedding-set-2.webp', '/images/products/molee/charcoal-silk-bedding-set-3.webp', '/images/products/molee/charcoal-silk-bedding-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1250,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'celadon-silk-bedding-set',
  'Celadon Silk Bedding Set',
  'bedlinen',
  'Mulberry silk in pale celadon, the green of old porcelain glaze.',
  'Named for the pale jade glaze on old porcelain: a cool, watery green in pure mulberry silk that makes a white room feel ten degrees calmer. Button-close duvet cover. Duvet cover, flat sheet and two pillowcases.',
  '100% mulberry silk',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Mulberry silk in celadon', 'Button-close duvet cover', 'Flanged pillowcases']::text[],
  ARRAY['Hand wash cold or dry clean', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Celadon']::text[],
  ARRAY['/images/products/molee/celadon-silk-bedding-set-1.webp', '/images/products/molee/celadon-silk-bedding-set-2.webp', '/images/products/molee/celadon-silk-bedding-set-3.webp', '/images/products/molee/celadon-silk-bedding-set-4.webp', '/images/products/molee/celadon-silk-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1250,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'giza-cotton-bedding-set-ivory',
  'Giza Cotton Bedding Set in Ivory',
  'bedlinen',
  'Double-ply 100s Giza long-staple cotton, woven to 500 threads.',
  'Giza long-staple cotton spun to a fine 100s and woven double-ply at 500 threads, which is why it feels substantial rather than thin. Ivory white, with a soft sateen sheen. Duvet cover, flat sheet and two pillowcases.',
  '100% Egyptian Giza long-staple cotton, 100s double-ply, 500 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Double-ply 100s Giza cotton', '500 thread count', 'Ivory white']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/molee/giza-cotton-bedding-set-ivory-1.webp', '/images/products/molee/giza-cotton-bedding-set-ivory-2.webp', '/images/products/molee/giza-cotton-bedding-set-ivory-3.webp', '/images/products/molee/giza-cotton-bedding-set-ivory-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":550,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":575,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'geometric-egyptian-cotton-jacquard-set',
  'Geometric Egyptian Cotton Jacquard Set',
  'bedlinen',
  '140s Egyptian cotton woven with a tonal geometric jacquard.',
  'Very fine 140s Egyptian cotton woven into a tonal geometric jacquard in warm beige, set against a plain sheet. Architectural rather than floral — a bed for a modern room. Duvet cover, flat sheet and two pillowcases.',
  'Egyptian cotton, 140s, jacquard weave',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '140s Egyptian cotton', 'Tonal geometric jacquard', 'Warm beige']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Beige']::text[],
  ARRAY['/images/products/molee/geometric-egyptian-cotton-jacquard-set-1.webp', '/images/products/molee/geometric-egyptian-cotton-jacquard-set-2.webp', '/images/products/molee/geometric-egyptian-cotton-jacquard-set-3.webp', '/images/products/molee/geometric-egyptian-cotton-jacquard-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":850,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":850,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'white-egyptian-cotton-jacquard-set',
  'White Egyptian Cotton Jacquard Set',
  'bedlinen',
  '140s Egyptian cotton at 600 threads, with a white-on-white jacquard.',
  '140s Egyptian cotton woven to 600 threads with a yarn-dyed geometric jacquard in white on white — a pattern you feel before you see it. The crisp, cool hand of fine cotton, with a quiet sheen. Duvet cover, flat sheet and two pillowcases.',
  '140s Egyptian cotton, 600 thread count, yarn-dyed jacquard',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '140s Egyptian cotton, 600 thread count', 'White-on-white yarn-dyed jacquard', 'Plain sheet']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/white-egyptian-cotton-jacquard-set-1.webp', '/images/products/molee/white-egyptian-cotton-jacquard-set-2.webp', '/images/products/molee/white-egyptian-cotton-jacquard-set-3.webp', '/images/products/molee/white-egyptian-cotton-jacquard-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":850,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":875,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'blush-egyptian-cotton-bedding-set',
  'Blush Egyptian Cotton Bedding Set',
  'bedlinen',
  'Plain Egyptian cotton in a dusky blush.',
  'Plain Egyptian cotton in a dusky, greyed blush with a smooth, satin-finish face and a stitched flange. The colour of a good face powder — warm against any skin tone and easy with ivory and linen. Duvet cover, flat sheet and two pillowcases.',
  '100% Egyptian cotton',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Egyptian cotton with a smooth, satin-finish face', 'Stitched flange border', 'Dusky blush']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Blush']::text[],
  ARRAY['/images/products/molee/blush-egyptian-cotton-bedding-set-1.webp', '/images/products/molee/blush-egyptian-cotton-bedding-set-2.webp', '/images/products/molee/blush-egyptian-cotton-bedding-set-3.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":600,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":625,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'olive-egyptian-cotton-bedding-set',
  'Olive Egyptian Cotton Bedding Set',
  'bedlinen',
  'Yarn-dyed Egyptian cotton in deep olive, with a soft lustre.',
  'A deep olive Egyptian cotton, yarn-dyed and woven to 800 threads for a soft, dense lustre. It looks as good with terracotta and caramel as it does with ivory. Duvet cover, flat sheet and two pillowcases.',
  'Egyptian cotton, 800 thread count, yarn-dyed',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Egyptian cotton, 800 thread count', 'Yarn-dyed for lasting colour', 'Deep olive']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Olive']::text[],
  ARRAY['/images/products/molee/olive-egyptian-cotton-bedding-set-1.webp', '/images/products/molee/olive-egyptian-cotton-bedding-set-2.webp', '/images/products/molee/olive-egyptian-cotton-bedding-set-3.webp', '/images/products/molee/olive-egyptian-cotton-bedding-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":450,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":475,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'white-egyptian-cotton-satin-set',
  'White Egyptian Cotton Satin Set',
  'bedlinen',
  '100s Egyptian cotton sateen at 500 threads, in clean white.',
  'Egyptian cotton spun to 100s and woven as a 500-thread sateen, so it has the sheen and slip of satin with the breathability of cotton. A clean white bed with a plain flanged border — nothing to distract from the cloth. Duvet cover, flat sheet and two pillowcases.',
  '100% Egyptian cotton, 100s, 500 thread count sateen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100s Egyptian cotton sateen', '500 thread count', 'Plain flanged border']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/white-egyptian-cotton-satin-set-1.webp', '/images/products/molee/white-egyptian-cotton-satin-set-2.webp', '/images/products/molee/white-egyptian-cotton-satin-set-3.webp', '/images/products/molee/white-egyptian-cotton-satin-set-4.webp', '/images/products/molee/white-egyptian-cotton-satin-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":500,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":525,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'champagne-giza-cotton-sateen-set',
  'Champagne Giza Cotton Sateen Set',
  'bedlinen',
  '200s Giza cotton sateen in champagne — the finest cotton we carry.',
  'Giza cotton spun to an exceptionally fine 200s and woven as a 500-thread sateen with a silk-like lustre. In champagne, with a fine contrast hemstitch at the border. The finest cotton in the maison. Duvet cover, flat sheet and two pillowcases, in king size.',
  '100% Egyptian Giza cotton, 200s, 500 thread count sateen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '200s Giza cotton — the finest we carry', '500-thread sateen with a silk-like lustre', 'Supplied in king size']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Champagne']::text[],
  ARRAY['/images/products/molee/champagne-giza-cotton-sateen-set-1.webp', '/images/products/molee/champagne-giza-cotton-sateen-set-2.webp', '/images/products/molee/champagne-giza-cotton-sateen-set-3.webp', '/images/products/molee/champagne-giza-cotton-sateen-set-4.webp']::text[],
  '[{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1100,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'sky-blue-piped-egyptian-cotton-set',
  'Piped Egyptian Cotton Set in Sky Blue',
  'bedlinen',
  'Pale sky-blue Egyptian cotton, finished with a single cord piping.',
  'A pale, almost-white sky blue in 100s Egyptian cotton at 400 threads, edged with a single line of cord piping around the pillowcases and duvet. The blue of an early morning over the sea. Duvet cover, flat sheet and two pillowcases.',
  '100% Egyptian cotton, 100s, 400 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100s Egyptian cotton, 400 thread count', 'Single cord piping', 'Pale sky blue']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Sky Blue']::text[],
  ARRAY['/images/products/molee/sky-blue-piped-egyptian-cotton-set-1.webp', '/images/products/molee/sky-blue-piped-egyptian-cotton-set-2.webp', '/images/products/molee/sky-blue-piped-egyptian-cotton-set-3.webp', '/images/products/molee/sky-blue-piped-egyptian-cotton-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":525,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":550,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'hotel-stripe-egyptian-cotton-set',
  'Hotel Stripe Egyptian Cotton Set',
  'bedlinen',
  '120s Egyptian long-staple cotton with a 2 cm satin stripe.',
  'The grand-hotel classic: white 120s Egyptian long-staple cotton at 600 threads, woven with a 2 cm satin stripe that alternates matte and sheen. Crisp, cool and made to be laundered often. Duvet cover, flat sheet and two pillowcases.',
  '100% Egyptian long-staple cotton, 120s, 600 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '120s Egyptian long-staple cotton', '600 thread count', '2 cm satin stripe']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/hotel-stripe-egyptian-cotton-set-1.webp', '/images/products/molee/hotel-stripe-egyptian-cotton-set-2.webp', '/images/products/molee/hotel-stripe-egyptian-cotton-set-3.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":525,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":550,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'silver-giza-cotton-jacquard-set',
  'Giza Cotton Jacquard Set in Silver',
  'bedlinen',
  '100s Giza long-staple cotton with a silvery damask jacquard.',
  '100s Giza long-staple cotton woven into a soft damask jacquard in silver-champagne, with a plain border to frame it. An easy way into jacquard — and it softens with every wash. Duvet cover, flat sheet and two pillowcases.',
  '100% Egyptian Giza long-staple cotton, 100s, jacquard weave',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100s Giza long-staple cotton', 'Damask jacquard with a plain border', 'Silver-champagne']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Silver']::text[],
  ARRAY['/images/products/molee/silver-giza-cotton-jacquard-set-1.webp', '/images/products/molee/silver-giza-cotton-jacquard-set-2.webp', '/images/products/molee/silver-giza-cotton-jacquard-set-3.webp', '/images/products/molee/silver-giza-cotton-jacquard-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":230,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'giza-cotton-fitted-sheet-set',
  'Giza Cotton Fitted Sheet Set',
  'bedlinen',
  '140s Giza cotton at 1800 threads: a fitted sheet and two pillowcases.',
  'The part of the bed you actually sleep on, in 140s Giza Egyptian cotton woven to 1800 threads — smooth, cool and softly lustrous. A fitted sheet and two pillowcases in white, to pair with any duvet cover.',
  'Egyptian Giza cotton, 140s, 1800 thread count',
  ARRAY['Fitted sheet and two pillowcases', '140s Giza Egyptian cotton', '1800 thread count', 'White']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/giza-cotton-fitted-sheet-set-1.webp', '/images/products/molee/giza-cotton-fitted-sheet-set-2.webp', '/images/products/molee/giza-cotton-fitted-sheet-set-3.webp', '/images/products/molee/giza-cotton-fitted-sheet-set-4.webp', '/images/products/molee/giza-cotton-fitted-sheet-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Fitted sheet and two pillowcases","price":550,"compare_at_price":null},{"name":"King","dimensions":"Fitted sheet and two pillowcases","price":550,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'champagne-egyptian-cotton-bedding-set',
  'Champagne Egyptian Cotton Bedding Set',
  'bedlinen',
  'Smooth Egyptian cotton in champagne, with a double stitched border.',
  'Egyptian cotton in a pale champagne with a smooth, lustrous face and a double stitched border. Warm enough to soften a white room without tipping into gold. Duvet cover, flat sheet and two pillowcases.',
  '100% Egyptian cotton',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Egyptian cotton with a lustrous finish', 'Double stitched border', 'Champagne']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Champagne']::text[],
  ARRAY['/images/products/molee/champagne-egyptian-cotton-bedding-set-1.webp', '/images/products/molee/champagne-egyptian-cotton-bedding-set-2.webp', '/images/products/molee/champagne-egyptian-cotton-bedding-set-3.webp', '/images/products/molee/champagne-egyptian-cotton-bedding-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":425,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":450,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'lace-inset-egyptian-cotton-satin-set',
  'Lace-Inset Egyptian Cotton Satin Set',
  'bedlinen',
  '140s Egyptian cotton satin in champagne, inset with openwork lace.',
  '140s Egyptian cotton satin at 500 threads in a soft champagne, with bands of openwork lace set into the pillowcase and duvet borders and a button closure. Romantic, but held in check by the colour. Duvet cover, flat sheet and two pillowcases, in king size.',
  '100% Egyptian cotton, 140s, 500 thread count satin',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '140s Egyptian cotton satin', 'Openwork lace insets', 'Button-close duvet cover']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Champagne']::text[],
  ARRAY['/images/products/molee/lace-inset-egyptian-cotton-satin-set-1.webp', '/images/products/molee/lace-inset-egyptian-cotton-satin-set-2.webp', '/images/products/molee/lace-inset-egyptian-cotton-satin-set-3.webp', '/images/products/molee/lace-inset-egyptian-cotton-satin-set-4.webp']::text[],
  '[{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":600,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'openwork-long-staple-cotton-set',
  'Openwork Long-Staple Cotton Set',
  'bedlinen',
  '100s double-strand long-staple cotton in champagne gold, with openwork trim.',
  'Double-strand 100s long-staple cotton in champagne gold, with a band of openwork trim running around the pillowcases and duvet. The sheen is soft and the colour is warm. Duvet cover, flat sheet and two pillowcases.',
  '100% long-staple cotton, 100s double-strand',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100s double-strand long-staple cotton', 'Openwork trim', 'Champagne gold']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Champagne Gold']::text[],
  ARRAY['/images/products/molee/openwork-long-staple-cotton-set-1.webp', '/images/products/molee/openwork-long-staple-cotton-set-2.webp', '/images/products/molee/openwork-long-staple-cotton-set-3.webp', '/images/products/molee/openwork-long-staple-cotton-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":525,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":550,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'cocoa-cotton-jacquard-bedding-set',
  'Cocoa Cotton Jacquard Bedding Set',
  'bedlinen',
  'Long-staple cotton jacquard in a soft cocoa, at 400 threads.',
  'Long-staple cotton woven at 400 threads into a flowing tonal jacquard, in a soft cocoa with a hint of mauve. Deep enough to anchor a pale room, soft enough to sleep in all year. Duvet cover, flat sheet and two pillowcases.',
  '100% long-staple cotton, 400 thread count jacquard',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Long-staple cotton jacquard', '400 thread count', 'Cocoa']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Cocoa']::text[],
  ARRAY['/images/products/molee/cocoa-cotton-jacquard-bedding-set-1.webp', '/images/products/molee/cocoa-cotton-jacquard-bedding-set-2.webp', '/images/products/molee/cocoa-cotton-jacquard-bedding-set-3.webp', '/images/products/molee/cocoa-cotton-jacquard-bedding-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":400,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":425,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'dove-grey-long-staple-cotton-set',
  'Dove Grey Long-Staple Cotton Set',
  'bedlinen',
  'Densely woven 100s long-staple cotton in dove grey.',
  '100s long-staple cotton woven densely to 500 threads for a smooth, almost silky hand, in a soft dove grey with a fine openwork border. Duvet cover, flat sheet and two pillowcases.',
  '100% long-staple cotton, 100s, 500 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100s long-staple cotton, 500 thread count', 'Fine openwork border', 'Dove grey']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Dove Grey']::text[],
  ARRAY['/images/products/molee/dove-grey-long-staple-cotton-set-1.webp', '/images/products/molee/dove-grey-long-staple-cotton-set-2.webp', '/images/products/molee/dove-grey-long-staple-cotton-set-3.webp', '/images/products/molee/dove-grey-long-staple-cotton-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":500,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":525,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'tie-closure-hotel-bedding-set',
  'Tie-Closure Hotel Bedding Set',
  'bedlinen',
  'Pure white long-staple cotton with a tie-closure duvet cover.',
  'Five-star-hotel white in long-staple cotton, with a duvet cover that ties closed at the foot instead of buttoning. Honest, crisp and made for washing often. Duvet cover, flat sheet and two pillowcases.',
  '100% long-staple cotton, 200 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Long-staple cotton', 'Tie-closure duvet cover', 'Pure white']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/tie-closure-hotel-bedding-set-1.webp', '/images/products/molee/tie-closure-hotel-bedding-set-2.webp', '/images/products/molee/tie-closure-hotel-bedding-set-3.webp', '/images/products/molee/tie-closure-hotel-bedding-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":210,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'warm-grey-long-staple-cotton-set',
  'Warm Grey Long-Staple Cotton Set',
  'bedlinen',
  'Smooth 100s long-staple cotton in warm grey, with a small embroidered motif.',
  '100s long-staple cotton in a warm, taupe-leaning grey, smooth to the point of sheen, with a small tonal embroidered motif. Duvet cover, flat sheet and two pillowcases.',
  '100% long-staple cotton, 100s',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100s long-staple cotton', 'Small tonal embroidered motif', 'Warm grey']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Warm Grey']::text[],
  ARRAY['/images/products/molee/warm-grey-long-staple-cotton-set-1.webp', '/images/products/molee/warm-grey-long-staple-cotton-set-2.webp', '/images/products/molee/warm-grey-long-staple-cotton-set-3.webp', '/images/products/molee/warm-grey-long-staple-cotton-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":290,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":300,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'air-jacquard-cotton-set-ivory',
  'Air Jacquard Cotton Set in Ivory',
  'bedlinen',
  'Yarn-dyed 100s long-staple cotton, woven with a raised air jacquard.',
  'An airy, lightly raised jacquard in 100s long-staple cotton, yarn-dyed and woven to 500 threads, in soft ivory — the pattern shows only when the light rakes across it. Choose a flat or a fitted sheet. Duvet cover, sheet and two pillowcases.',
  '100% long-staple cotton, 100s, 500 thread count, yarn-dyed jacquard',
  ARRAY['Duvet cover, sheet and two pillowcases', 'Choose a flat or a fitted sheet', '100s long-staple cotton, yarn-dyed air jacquard', '500 thread count']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/molee/air-jacquard-cotton-set-ivory-1.webp', '/images/products/molee/air-jacquard-cotton-set-ivory-2.webp', '/images/products/molee/air-jacquard-cotton-set-ivory-3.webp', '/images/products/molee/air-jacquard-cotton-set-ivory-4.webp', '/images/products/molee/air-jacquard-cotton-set-ivory-5.webp']::text[],
  '[{"name":"Queen · flat sheet","dimensions":"Duvet cover 200 × 230 cm","price":200,"compare_at_price":null},{"name":"Queen · fitted sheet","dimensions":"Duvet cover 200 × 230 cm","price":200,"compare_at_price":null},{"name":"King · flat sheet","dimensions":"Duvet cover 220 × 240 cm","price":200,"compare_at_price":null},{"name":"King · fitted sheet","dimensions":"Duvet cover 220 × 240 cm","price":200,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'embroidered-long-staple-cotton-set',
  'Embroidered Long-Staple Cotton Set',
  'bedlinen',
  '100s long-staple cotton in ivory, with a tonal embroidered border.',
  '100s long-staple cotton at 500 threads in soft ivory, bordered with a tone-on-tone floral embroidery in pale gold thread. A quiet, heirloom kind of detail. Duvet cover, flat sheet and two pillowcases.',
  '100% long-staple cotton, 100s, 500 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100s long-staple cotton, 500 thread count', 'Tonal embroidered border', 'Ivory']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron on the reverse of the embroidery']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/molee/embroidered-long-staple-cotton-set-1.webp', '/images/products/molee/embroidered-long-staple-cotton-set-2.webp', '/images/products/molee/embroidered-long-staple-cotton-set-3.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":280,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":300,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'pima-cotton-1800-thread-count-set',
  '1800 Thread Count Pima Cotton Set',
  'bedlinen',
  '100% Pima cotton at 1800 threads, in dove grey with fine piped edges.',
  'Pima cotton woven to 1800 threads, finished with fine piped edges, in a soft dove grey. Dense, smooth and cool, with a satin-like drape that looks right in a pale stone room. Duvet cover, flat sheet and two pillowcases.',
  '100% Pima cotton, 1800 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100% Pima cotton', '1800 thread count', 'Fine piped edges']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Dove Grey']::text[],
  ARRAY['/images/products/molee/pima-cotton-1800-thread-count-set-1.webp', '/images/products/molee/pima-cotton-1800-thread-count-set-2.webp', '/images/products/molee/pima-cotton-1800-thread-count-set-3.webp', '/images/products/molee/pima-cotton-1800-thread-count-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":725,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":750,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'white-cotton-1200-thread-count-set',
  '1200 Thread Count Cotton Set in White',
  'bedlinen',
  '160s cotton at 1200 threads, bright white with a single contrast line.',
  'Spun to 160s and woven to 1200 threads, this white cotton has a dense, cool, slightly glossy hand. A fine contrast line runs round the border — the only decoration it needs. Duvet cover, flat sheet and two pillowcases.',
  '100% cotton, 160s, 1200 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '160s cotton, 1200 thread count', 'Fine contrast line at the border', 'White']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/white-cotton-1200-thread-count-set-1.webp', '/images/products/molee/white-cotton-1200-thread-count-set-2.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":600,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":600,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'blush-200s-cotton-sateen-set',
  '200s Cotton Sateen Set in Blush',
  'bedlinen',
  'Ultra-fine 200s cotton sateen in blush — as silky as cotton gets.',
  'Spun to an ultra-fine 200s, this cotton sateen is as close to silk as cotton comes: fluid, cool and softly lustrous. In a clear blush, with a fine stitched border and a ribbon-tie closure. Duvet cover, flat sheet and two pillowcases.',
  '100% cotton, 200s sateen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '200s cotton sateen', 'Ribbon-tie duvet closure', 'Blush']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Blush']::text[],
  ARRAY['/images/products/molee/blush-200s-cotton-sateen-set-1.webp', '/images/products/molee/blush-200s-cotton-sateen-set-2.webp', '/images/products/molee/blush-200s-cotton-sateen-set-3.webp', '/images/products/molee/blush-200s-cotton-sateen-set-4.webp', '/images/products/molee/blush-200s-cotton-sateen-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":775,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":800,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'white-700-thread-count-cotton-set',
  '700 Thread Count Cotton Set in White',
  'bedlinen',
  '140s cotton at 700 threads — the dense, silky white of a good hotel.',
  '140s cotton woven to 700 threads, dense enough to feel silky and cool against the skin. Pure white with a crisp flanged edge; styled here with a terracotta bed runner, which is not included. Duvet cover, flat sheet and two pillowcases.',
  '100% cotton, 140s, 700 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '140s cotton, 700 thread count', 'Flanged edges', 'Bed runner shown is not included']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/white-700-thread-count-cotton-set-1.webp', '/images/products/molee/white-700-thread-count-cotton-set-2.webp', '/images/products/molee/white-700-thread-count-cotton-set-3.webp', '/images/products/molee/white-700-thread-count-cotton-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":600,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":625,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'steel-blue-1800-thread-count-sateen-set',
  '1800 Thread Count Sateen Set in Steel Blue',
  'bedlinen',
  '140s cotton sateen at 1800 threads, in a soft steel blue.',
  '140s cotton woven as an 1800-thread sateen, with a lustrous, liquid drape and a concealed zip at the duvet. A soft steel blue — the colour of the sea on an overcast morning. Duvet cover, flat sheet and two pillowcases.',
  '100% cotton, 140s, 1800 thread count sateen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '140s cotton sateen, 1800 thread count', 'Concealed zip closure', 'Steel blue']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['Steel Blue']::text[],
  ARRAY['/images/products/molee/steel-blue-1800-thread-count-sateen-set-1.webp', '/images/products/molee/steel-blue-1800-thread-count-sateen-set-2.webp', '/images/products/molee/steel-blue-1800-thread-count-sateen-set-3.webp', '/images/products/molee/steel-blue-1800-thread-count-sateen-set-4.webp', '/images/products/molee/steel-blue-1800-thread-count-sateen-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":400,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":425,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'white-400-thread-count-hotel-set',
  '400 Thread Count Hotel Set in White',
  'bedlinen',
  'Pure cotton at 400 threads, with tie closures — the everyday white bed.',
  'Pure cotton woven to 400 threads: soft, breathable and made for weekly washing, with tie closures at the duvet and a clean flat hem. The white bed that goes with everything. Duvet cover, flat sheet and two pillowcases.',
  '100% cotton, 400 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100% cotton, 400 thread count', 'Tie closures', 'White']::text[],
  ARRAY['Machine wash cold on a gentle cycle', 'Line dry in the shade or tumble dry low', 'Warm iron while slightly damp']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/white-400-thread-count-hotel-set-1.webp', '/images/products/molee/white-400-thread-count-hotel-set-2.webp', '/images/products/molee/white-400-thread-count-hotel-set-3.webp', '/images/products/molee/white-400-thread-count-hotel-set-4.webp', '/images/products/molee/white-400-thread-count-hotel-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":290,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'white-belgian-flax-linen-set',
  'White Belgian Flax Linen Set',
  'bedlinen',
  '100% flax linen in white, with tie closures and a relaxed hand.',
  'Pure flax linen in a soft, chalky white, with tie closures at the duvet and pillowcases. Linen is the coolest cloth to sleep in and the only one that looks better slept-in than made — so don’t iron it. Duvet cover, flat sheet and two pillowcases.',
  '100% flax linen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Pure flax linen', 'Tie closures', 'Breathable and cool to sleep in']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/white-belgian-flax-linen-set-1.webp', '/images/products/molee/white-belgian-flax-linen-set-2.webp', '/images/products/molee/white-belgian-flax-linen-set-3.webp', '/images/products/molee/white-belgian-flax-linen-set-4.webp', '/images/products/molee/white-belgian-flax-linen-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":600,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":625,"compare_at_price":null}]'::jsonb,
  'New',
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'khaki-french-linen-bedding-set',
  'French Linen Bedding Set in Khaki',
  'bedlinen',
  '100% French linen in a warm natural khaki, with tie closures.',
  'French linen spun from Belgian flax, in the warm natural khaki that linen does best. Soft, slubby and a little crumpled by design, with tie closures at the duvet. Duvet cover, flat sheet and two pillowcases.',
  '100% French linen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'French linen from Belgian flax', 'Tie-closure duvet', 'Natural khaki']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['Khaki']::text[],
  ARRAY['/images/products/molee/khaki-french-linen-bedding-set-1.webp', '/images/products/molee/khaki-french-linen-bedding-set-2.webp', '/images/products/molee/khaki-french-linen-bedding-set-3.webp', '/images/products/molee/khaki-french-linen-bedding-set-4.webp', '/images/products/molee/khaki-french-linen-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":550,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":575,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'striped-linen-bedding-set',
  'Striped Linen Bedding Set',
  'bedlinen',
  '100% linen in a wide oat-and-white stripe.',
  'Pure linen woven in a broad oat-and-white stripe — the look of a French country bedroom, the feel of well-washed linen. Duvet cover, flat sheet and two pillowcases.',
  '100% linen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Pure linen', 'Wide woven stripe', 'Oat and white']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['Oat Stripe']::text[],
  ARRAY['/images/products/molee/striped-linen-bedding-set-1.webp', '/images/products/molee/striped-linen-bedding-set-2.webp', '/images/products/molee/striped-linen-bedding-set-3.webp', '/images/products/molee/striped-linen-bedding-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":600,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":625,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'natural-linen-bedding-set',
  'Natural Linen Bedding Set',
  'bedlinen',
  'Minimal 100% linen in a soft natural white.',
  'A minimal linen set in the soft, natural white of flax, with a narrow flanged edge. Nothing to it but good cloth, which is exactly the point. Duvet cover, flat sheet and two pillowcases.',
  '100% linen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Pure linen', 'Narrow flanged edge', 'Natural white']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['Natural White']::text[],
  ARRAY['/images/products/molee/natural-linen-bedding-set-1.webp', '/images/products/molee/natural-linen-bedding-set-2.webp', '/images/products/molee/natural-linen-bedding-set-3.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":600,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'sage-french-flax-linen-set',
  'Sage French Flax Linen Set',
  'bedlinen',
  'Pure French flax linen in a soft sage green.',
  'Pure French flax linen in a soft sage, with a relaxed, lived-in drape from the first night. The green of dried herbs — restful, and easy with oak and white walls. Duvet cover, flat sheet and two pillowcases.',
  '100% French flax linen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Pure French flax linen', 'Relaxed, lived-in drape', 'Sage']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['Sage']::text[],
  ARRAY['/images/products/molee/sage-french-flax-linen-set-1.webp', '/images/products/molee/sage-french-flax-linen-set-2.webp', '/images/products/molee/sage-french-flax-linen-set-3.webp', '/images/products/molee/sage-french-flax-linen-set-4.webp']::text[],
  '[{"name":"1.5 m bed","dimensions":"Four-piece set for a 1.5 m bed","price":600,"compare_at_price":null},{"name":"1.8 m bed","dimensions":"Four-piece set for a 1.8 m bed","price":625,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'yarn-dyed-linen-jacquard-set',
  'Yarn-Dyed Linen Jacquard Set',
  'bedlinen',
  'Pure flax linen woven with a subtle yarn-dyed jacquard.',
  'Pure flax linen, yarn-dyed and woven into a subtle jacquard that gives the cloth a quiet texture from across the room. Natural beige, breathable and hard-wearing — linen at its most refined. Duvet cover, flat sheet and two pillowcases.',
  '100% linen, yarn-dyed jacquard',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Pure flax linen, yarn-dyed jacquard', 'Breathable and hard-wearing', 'Natural beige']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['Beige']::text[],
  ARRAY['/images/products/molee/yarn-dyed-linen-jacquard-set-1.webp', '/images/products/molee/yarn-dyed-linen-jacquard-set-2.webp', '/images/products/molee/yarn-dyed-linen-jacquard-set-3.webp', '/images/products/molee/yarn-dyed-linen-jacquard-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":1200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":1200,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'silver-pure-linen-bedding-set',
  'Pure Linen Bedding Set in Silver',
  'bedlinen',
  '100% linen at 200 threads, in a soft silver grey.',
  'Pure linen woven at 200 threads — dense for linen, so it feels substantial yet stays breathable — in a soft silver grey. All-season, relaxed and softer with every wash. Duvet cover, flat sheet and two pillowcases.',
  '100% linen, 200 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Pure linen, 200 thread count', 'All-season weight', 'Silver grey']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['Silver Grey']::text[],
  ARRAY['/images/products/molee/silver-pure-linen-bedding-set-1.webp', '/images/products/molee/silver-pure-linen-bedding-set-2.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":625,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":650,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'linen-cotton-bedding-set-oat',
  'Linen & Cotton Bedding Set in Oat',
  'bedlinen',
  '55% French flax linen, 45% cotton — linen’s texture, cotton’s softness.',
  'A blend of 55% French flax linen and 45% cotton: the texture and breathability of linen, softened by cotton so it feels gentle from the first night. In oat, with natural button closures. Duvet cover, flat sheet and two pillowcases.',
  '55% linen, 45% cotton',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '55% French flax linen, 45% cotton', 'Natural button closures', 'Oat']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'Cool iron if you prefer it smoother']::text[],
  ARRAY['Oat']::text[],
  ARRAY['/images/products/molee/linen-cotton-bedding-set-oat-1.webp', '/images/products/molee/linen-cotton-bedding-set-oat-2.webp', '/images/products/molee/linen-cotton-bedding-set-oat-3.webp', '/images/products/molee/linen-cotton-bedding-set-oat-4.webp', '/images/products/molee/linen-cotton-bedding-set-oat-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":290,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":300,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'linen-lyocell-bedding-set',
  'Linen & Lyocell Bedding Set',
  'bedlinen',
  '82% lyocell, 18% French linen: cool, fluid and faintly textured.',
  'Lyocell’s cool, fluid drape with a little French linen woven through for texture — 82% lyocell, 18% linen — in a warm pale beige with an openwork border and a button-close duvet. A summer bed that still looks dressed. Duvet cover, flat sheet and two pillowcases.',
  '82% lyocell, 18% French linen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '82% lyocell, 18% linen', 'Openwork border', 'Button-close duvet cover']::text[],
  ARRAY['Machine wash cold on gentle, in a laundry bag', 'Line dry in the shade', 'Cool iron if needed']::text[],
  ARRAY['Beige']::text[],
  ARRAY['/images/products/molee/linen-lyocell-bedding-set-1.webp', '/images/products/molee/linen-lyocell-bedding-set-2.webp', '/images/products/molee/linen-lyocell-bedding-set-3.webp', '/images/products/molee/linen-lyocell-bedding-set-4.webp', '/images/products/molee/linen-lyocell-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":600,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":625,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'deep-grey-linen-sheet-set',
  'Deep Grey Linen Sheet Set',
  'bedlinen',
  'A flax linen fitted sheet and two pillowcases, in deep grey.',
  'Flax linen in a deep, earthy grey: a fitted sheet with a pocket deep enough for a thick mattress, and two pillowcases. Pair it with a white duvet for contrast, or go dark all the way.',
  '100% linen',
  ARRAY['Fitted sheet and two pillowcases', 'Pure flax linen', 'Deep pocket for mattresses up to 40 cm', 'Deep grey']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['Deep Grey']::text[],
  ARRAY['/images/products/molee/deep-grey-linen-sheet-set-1.webp', '/images/products/molee/deep-grey-linen-sheet-set-2.webp']::text[],
  '[{"name":"Queen","dimensions":"Fitted sheet and two pillowcases","price":290,"compare_at_price":null},{"name":"King","dimensions":"Fitted sheet and two pillowcases","price":300,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'deep-blue-flax-linen-set',
  'Deep Blue Flax Linen Set',
  'bedlinen',
  '100% flax linen in a deep, washed blue.',
  'Pure flax linen in a deep, faded-denim blue, with a soft slub and a relaxed drape. The colour of indigo that has been worn in — lovely with white walls and pale wood. Duvet cover, flat sheet and two pillowcases.',
  '100% flax linen',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Pure flax linen', 'Relaxed, slubby texture', 'Deep blue']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['Deep Blue']::text[],
  ARRAY['/images/products/molee/deep-blue-flax-linen-set-1.webp', '/images/products/molee/deep-blue-flax-linen-set-2.webp', '/images/products/molee/deep-blue-flax-linen-set-3.webp', '/images/products/molee/deep-blue-flax-linen-set-4.webp']::text[],
  '[{"name":"1.5 m bed","dimensions":"Four-piece set for a 1.5 m bed","price":525,"compare_at_price":null},{"name":"1.8 m bed","dimensions":"Four-piece set for a 1.8 m bed","price":550,"compare_at_price":null},{"name":"2.0 m bed","dimensions":"Four-piece set for a 2.0 m bed","price":575,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'white-lyocell-bedding-set',
  'Lyocell Bedding Set in White',
  'bedlinen',
  '100% lyocell in soft white: cool, fluid and silky to the touch.',
  'Lyocell is spun from wood pulp into a fibre that feels like silk and breathes like linen. This set is 100% lyocell — 60s yarn at 300 threads — in a soft white that sleeps cool through a humid night. Duvet cover, flat sheet and two pillowcases.',
  '100% lyocell, 60s, 300 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100% lyocell fibre', 'Cool, silky hand', 'White']::text[],
  ARRAY['Machine wash cold on gentle, in a laundry bag', 'Line dry in the shade', 'Cool iron if needed']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/white-lyocell-bedding-set-1.webp', '/images/products/molee/white-lyocell-bedding-set-2.webp', '/images/products/molee/white-lyocell-bedding-set-3.webp', '/images/products/molee/white-lyocell-bedding-set-4.webp', '/images/products/molee/white-lyocell-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":290,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":300,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'grey-wide-border-lyocell-set',
  'Wide-Border Lyocell Set in Grey',
  'bedlinen',
  '100s lyocell at 500 threads, in pale grey with a wide piped border.',
  'Fine 100s lyocell woven to 500 threads, with the liquid sheen of silk and a wide border edged in fine piping. A cool, pale grey that makes a bedroom feel like early morning. Duvet cover, flat sheet and two pillowcases.',
  '100% lyocell, 100s, 500 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '100s lyocell, 500 thread count', 'Wide border with fine piping', 'Pale grey']::text[],
  ARRAY['Machine wash cold on gentle, in a laundry bag', 'Line dry in the shade', 'Cool iron if needed']::text[],
  ARRAY['Grey']::text[],
  ARRAY['/images/products/molee/grey-wide-border-lyocell-set-1.webp', '/images/products/molee/grey-wide-border-lyocell-set-2.webp', '/images/products/molee/grey-wide-border-lyocell-set-3.webp', '/images/products/molee/grey-wide-border-lyocell-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":475,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":475,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'dusk-blue-lyocell-cotton-set',
  'Dusk Blue Lyocell & Cotton Set',
  'bedlinen',
  'Lyocell and cotton in a soft blue-grey dusk shade.',
  'A lyocell-and-cotton weave that pairs lyocell’s cool, silky drape with cotton’s easy feel, in a blue-grey the colour of the sky just after sunset. Plain, calm and cool to sleep in. Duvet cover, flat sheet and two pillowcases.',
  'Lyocell and cotton',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Lyocell-cotton blend', 'Cool, smooth hand', 'Dusk blue']::text[],
  ARRAY['Machine wash cold on gentle, in a laundry bag', 'Line dry in the shade', 'Cool iron if needed']::text[],
  ARRAY['Dusk Blue']::text[],
  ARRAY['/images/products/molee/dusk-blue-lyocell-cotton-set-1.webp', '/images/products/molee/dusk-blue-lyocell-cotton-set-2.webp', '/images/products/molee/dusk-blue-lyocell-cotton-set-3.webp', '/images/products/molee/dusk-blue-lyocell-cotton-set-4.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":450,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":475,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'eucalyptus-lyocell-bedding-set',
  'Eucalyptus Lyocell Bedding Set',
  'bedlinen',
  'Eucalyptus lyocell in ivory with a sage reverse.',
  'Lyocell spun from eucalyptus, cool and smooth enough to pass for silk, in ivory with a sage-green reverse so a turned-down bed shows a flash of colour. Duvet cover, flat sheet and two pillowcases.',
  '100% eucalyptus lyocell, 60s, 300 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Eucalyptus lyocell', 'Two-tone: ivory with sage', 'Cool, silky hand']::text[],
  ARRAY['Machine wash cold on gentle, in a laundry bag', 'Line dry in the shade', 'Cool iron if needed']::text[],
  ARRAY['Sage & Ivory']::text[],
  ARRAY['/images/products/molee/eucalyptus-lyocell-bedding-set-1.webp', '/images/products/molee/eucalyptus-lyocell-bedding-set-2.webp', '/images/products/molee/eucalyptus-lyocell-bedding-set-3.webp', '/images/products/molee/eucalyptus-lyocell-bedding-set-4.webp', '/images/products/molee/eucalyptus-lyocell-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":210,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'taupe-grey-lyocell-bedding-set',
  '60s Lyocell Bedding Set in Taupe Grey',
  'bedlinen',
  'Pure 60s lyocell in soft taupe grey, with a silky drape.',
  'Pure lyocell spun to 60s, with the soft sheen and fluid drape of silk and none of the fuss. A warm taupe-grey that suits every wood and every season. Duvet cover, flat sheet and two pillowcases.',
  '100% lyocell, 60s',
  ARRAY['Duvet cover, flat sheet and two pillowcases', '60s lyocell', 'Silky drape and sheen', 'Taupe grey']::text[],
  ARRAY['Machine wash cold on gentle, in a laundry bag', 'Line dry in the shade', 'Cool iron if needed']::text[],
  ARRAY['Taupe Grey']::text[],
  ARRAY['/images/products/molee/taupe-grey-lyocell-bedding-set-1.webp', '/images/products/molee/taupe-grey-lyocell-bedding-set-2.webp', '/images/products/molee/taupe-grey-lyocell-bedding-set-3.webp', '/images/products/molee/taupe-grey-lyocell-bedding-set-4.webp', '/images/products/molee/taupe-grey-lyocell-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":200,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":210,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'lyocell-linen-jacquard-set',
  'Lyocell & Linen Jacquard Set',
  'bedlinen',
  'Lyocell and linen woven with a soft floral jacquard, for warm nights.',
  'Lyocell and linen woven together into a softly lustrous floral jacquard: the coolness of lyocell and the breathability of linen, in a warm taupe. Made for the hot months, and pretty enough for all of them. Duvet cover, flat sheet and two pillowcases.',
  'Lyocell and linen, jacquard weave',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Lyocell-linen jacquard', 'Cool and breathable', 'Taupe']::text[],
  ARRAY['Machine wash cold on gentle, in a laundry bag', 'Line dry in the shade', 'Cool iron if needed']::text[],
  ARRAY['Taupe']::text[],
  ARRAY['/images/products/molee/lyocell-linen-jacquard-set-1.webp', '/images/products/molee/lyocell-linen-jacquard-set-2.webp', '/images/products/molee/lyocell-linen-jacquard-set-3.webp', '/images/products/molee/lyocell-linen-jacquard-set-4.webp', '/images/products/molee/lyocell-linen-jacquard-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 200 × 230 cm","price":400,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":450,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'bamboo-summer-quilt-set',
  'Bamboo Summer Quilt Set',
  'bedlinen',
  'A light bamboo-fibre summer quilt with two matching pillowcases.',
  'A lightweight summer quilt in bamboo fibre, filled with bamboo fibre, with two matching pillowcases — the whole bed for the hot months. Silky, breathable and a soft beige.',
  '100% bamboo fibre, bamboo-fibre filling',
  ARRAY['Summer quilt and two pillowcases', 'Bamboo-fibre shell and filling', 'Lightweight for warm nights', 'Beige']::text[],
  ARRAY['Machine wash cold on gentle', 'Line dry in the shade']::text[],
  ARRAY['Beige']::text[],
  ARRAY['/images/products/molee/bamboo-summer-quilt-set-1.webp', '/images/products/molee/bamboo-summer-quilt-set-2.webp', '/images/products/molee/bamboo-summer-quilt-set-3.webp', '/images/products/molee/bamboo-summer-quilt-set-4.webp', '/images/products/molee/bamboo-summer-quilt-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Queen quilt and two pillowcases","price":180,"compare_at_price":null},{"name":"King","dimensions":"King quilt and two pillowcases","price":190,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'grey-bamboo-bedding-set',
  'Bamboo Bedding Set in Grey',
  'bedlinen',
  'Bamboo fibre in soft grey: cool, breathable and silky.',
  'Bamboo fibre woven into a smooth, silky cloth that stays cool and breathable through a warm night, in a soft grey. A fitted sheet keeps the bed neat. Duvet cover, fitted sheet and two pillowcases, in queen size.',
  '100% bamboo fibre',
  ARRAY['Duvet cover, fitted sheet and two pillowcases', 'Bamboo fibre', 'Cool, breathable and silky', 'Supplied in queen size']::text[],
  ARRAY['Machine wash cold on gentle', 'Line dry in the shade']::text[],
  ARRAY['Grey']::text[],
  ARRAY['/images/products/molee/grey-bamboo-bedding-set-1.webp', '/images/products/molee/grey-bamboo-bedding-set-2.webp', '/images/products/molee/grey-bamboo-bedding-set-3.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover, fitted sheet and two pillowcases","price":200,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'coconut-grey-bamboo-bedding-set',
  'Coconut Grey Bamboo Bedding Set',
  'bedlinen',
  'Cooling bamboo at 300 threads, in a pale coconut grey.',
  'Bamboo woven at 300 threads into a cool, breathable cloth with a quiet sheen, in a pale coconut grey — somewhere between shell and cream. Duvet cover, flat sheet and two pillowcases.',
  'Bamboo, 300 thread count',
  ARRAY['Duvet cover, flat sheet and two pillowcases', 'Bamboo, 300 thread count', 'Cool and breathable', 'Coconut grey']::text[],
  ARRAY['Machine wash cold on gentle', 'Line dry in the shade']::text[],
  ARRAY['Coconut Grey']::text[],
  ARRAY['/images/products/molee/coconut-grey-bamboo-bedding-set-1.webp', '/images/products/molee/coconut-grey-bamboo-bedding-set-2.webp', '/images/products/molee/coconut-grey-bamboo-bedding-set-3.webp', '/images/products/molee/coconut-grey-bamboo-bedding-set-4.webp', '/images/products/molee/coconut-grey-bamboo-bedding-set-5.webp']::text[],
  '[{"name":"Queen","dimensions":"Duvet cover 220 × 230 cm","price":270,"compare_at_price":null},{"name":"King","dimensions":"Duvet cover 220 × 240 cm","price":300,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'sateen-jacquard-goose-down-duvet',
  'Sateen Jacquard Goose Down Duvet',
  'bedlinen',
  'Goose down in a 300-thread cotton sateen jacquard shell, in blush.',
  'Goose down in a 300-thread cotton sateen shell woven with a tonal jacquard, in a soft blush that looks lovely folded at the foot of a white bed. Warm and light, in a four-season weight.',
  'Goose down filling, 100% cotton sateen jacquard shell, 300 thread count',
  ARRAY['Goose down filling', '300-thread cotton sateen jacquard shell', 'Four-season weight', 'Blush']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade every few weeks', 'Professional clean recommended']::text[],
  ARRAY['Blush']::text[],
  ARRAY['/images/products/molee/sateen-jacquard-goose-down-duvet-1.webp', '/images/products/molee/sateen-jacquard-goose-down-duvet-2.webp', '/images/products/molee/sateen-jacquard-goose-down-duvet-3.webp']::text[],
  '[{"name":"Queen","dimensions":"Queen size, approx. 3.9 kg","price":375,"compare_at_price":null},{"name":"King","dimensions":"King size, approx. 4.25 kg","price":400,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'double-layer-goose-down-duvet',
  'Double-Layer Goose Down Duvet',
  'bedlinen',
  'White goose down in a 500-thread cotton sateen jacquard shell.',
  'White goose down in a pure-cotton 500-thread sateen shell woven with a tonal jacquard, built as a double layer for even warmth from edge to edge. Lofty, light and quietly luxurious.',
  'White goose down filling, 100% cotton 500-thread sateen jacquard shell',
  ARRAY['White goose down filling', '500-thread cotton sateen jacquard shell', 'Double-layer construction', 'White']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade every few weeks', 'Professional clean recommended']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/double-layer-goose-down-duvet-1.webp', '/images/products/molee/double-layer-goose-down-duvet-2.webp', '/images/products/molee/double-layer-goose-down-duvet-3.webp', '/images/products/molee/double-layer-goose-down-duvet-4.webp', '/images/products/molee/double-layer-goose-down-duvet-5.webp']::text[],
  '[{"name":"Queen","dimensions":"200 × 230 cm","price":625,"compare_at_price":null},{"name":"King","dimensions":"200 × 240 cm","price":625,"compare_at_price":null}]'::jsonb,
  'New',
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'white-goose-down-jacquard-duvet',
  '95% White Goose Down Duvet',
  'bedlinen',
  '95% white goose down in a down-proof 300-thread cotton jacquard.',
  'Filled with 95% white goose down — the rest being small feathers that give it body — in a down-proof 300-thread cotton jacquard shell. Box-quilted, thick and warm. Four sizes, from single to king.',
  '95% white goose down filling, down-proof cotton jacquard shell, 300 thread count',
  ARRAY['95% white goose down filling', 'Down-proof 300-thread cotton jacquard shell', 'Box-quilted', 'White']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade every few weeks', 'Professional clean recommended']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/white-goose-down-jacquard-duvet-1.webp', '/images/products/molee/white-goose-down-jacquard-duvet-2.webp', '/images/products/molee/white-goose-down-jacquard-duvet-3.webp', '/images/products/molee/white-goose-down-jacquard-duvet-4.webp']::text[],
  '[{"name":"Single","dimensions":"150 × 200 cm","price":625,"compare_at_price":null},{"name":"Double","dimensions":"180 × 220 cm","price":725,"compare_at_price":null},{"name":"Queen","dimensions":"200 × 230 cm","price":825,"compare_at_price":null},{"name":"King","dimensions":"220 × 240 cm","price":850,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'extra-thick-goose-down-duvet',
  'Extra-Thick Goose Down Duvet',
  'bedlinen',
  '95% goose down, pinch-quilted for loft — the warmest duvet we carry.',
  '95% goose down in a soft cotton shell, pinch-quilted into deep, pillowy squares for maximum loft — the warmest duvet in the maison, for cold rooms and anyone who sleeps cold. Four sizes.',
  '95% goose down filling, cotton shell',
  ARRAY['95% goose down filling', 'Pinch-quilted for loft', 'Winter weight, 2–4.5 kg by size', 'White']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade every few weeks', 'Professional clean only']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/extra-thick-goose-down-duvet-1.webp', '/images/products/molee/extra-thick-goose-down-duvet-2.webp', '/images/products/molee/extra-thick-goose-down-duvet-3.webp', '/images/products/molee/extra-thick-goose-down-duvet-4.webp', '/images/products/molee/extra-thick-goose-down-duvet-5.webp']::text[],
  '[{"name":"Single","dimensions":"150 × 200 cm","price":400,"compare_at_price":null},{"name":"Double","dimensions":"180 × 220 cm","price":425,"compare_at_price":null},{"name":"Queen","dimensions":"200 × 230 cm","price":450,"compare_at_price":null},{"name":"King","dimensions":"220 × 240 cm","price":475,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'silk-shell-goose-down-duvet',
  'Silk-Shell Goose Down Duvet',
  'bedlinen',
  '95% white goose down in a pure silk shell, in silver grey.',
  '95% white goose down encased in a pure silk shell, which keeps the duvet light and breathable. Silver grey and box-quilted, in an all-season or a winter weight.',
  '95% white goose down filling, 100% silk shell',
  ARRAY['95% white goose down filling', '100% silk shell', 'Box-quilted', 'All-season or winter weight']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade — never in direct sun', 'Professional clean only']::text[],
  ARRAY['Silver Grey']::text[],
  ARRAY['/images/products/molee/silk-shell-goose-down-duvet-1.webp', '/images/products/molee/silk-shell-goose-down-duvet-2.webp', '/images/products/molee/silk-shell-goose-down-duvet-3.webp', '/images/products/molee/silk-shell-goose-down-duvet-4.webp']::text[],
  '[{"name":"Queen · all-season","dimensions":"Queen size, 1.2 kg fill","price":725,"compare_at_price":null},{"name":"Queen · winter","dimensions":"Queen size, 1.5 kg fill","price":850,"compare_at_price":null},{"name":"King · all-season","dimensions":"King size, 1.4 kg fill","price":775,"compare_at_price":null},{"name":"King · winter","dimensions":"King size, 1.7 kg fill","price":875,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'white-goose-down-winter-duvet',
  'White Goose Down Winter Duvet',
  'bedlinen',
  '95% white goose down, box-quilted into a warm, lofty winter duvet.',
  '95% white goose down in a down-proof cotton shell, box-quilted so the down stays evenly spread. Lofty and warm without the weight — a winter duvet that still breathes.',
  '95% white goose down filling, down-proof cotton shell',
  ARRAY['95% white goose down filling', 'Down-proof cotton shell', 'Box-quilted', 'Winter weight']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade every few weeks', 'Professional clean recommended']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/white-goose-down-winter-duvet-1.webp', '/images/products/molee/white-goose-down-winter-duvet-2.webp', '/images/products/molee/white-goose-down-winter-duvet-3.webp']::text[],
  '[{"name":"Queen","dimensions":"For a queen bed","price":775,"compare_at_price":null},{"name":"King","dimensions":"For a king bed","price":875,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'blush-all-season-goose-down-duvet',
  'All-Season Goose Down Duvet in Blush',
  'bedlinen',
  'Goose down and feather in a soft blush cotton shell, medium warm.',
  'Goose down and feather in a smooth cotton shell, in a soft blush that looks lovely where it peeks from under a white duvet cover. Medium-warm — the one duvet for the whole year.',
  'Goose down and feather filling, cotton shell',
  ARRAY['Goose down and feather filling', 'Cotton shell', 'Medium warmth, all-season', 'Blush']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade every few weeks', 'Professional clean recommended']::text[],
  ARRAY['Blush']::text[],
  ARRAY['/images/products/molee/blush-all-season-goose-down-duvet-1.webp', '/images/products/molee/blush-all-season-goose-down-duvet-2.webp', '/images/products/molee/blush-all-season-goose-down-duvet-3.webp', '/images/products/molee/blush-all-season-goose-down-duvet-4.webp', '/images/products/molee/blush-all-season-goose-down-duvet-5.webp']::text[],
  '[{"name":"Queen","dimensions":"200 × 230 cm","price":675,"compare_at_price":null},{"name":"King","dimensions":"220 × 240 cm","price":750,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'mulberry-silk-filled-duvet',
  'Mulberry Silk-Filled Duvet',
  'bedlinen',
  'Mulberry silk filling in a cotton-and-silk shell, from summer to winter weight.',
  'Filled with long mulberry silk floss rather than down, so it drapes close to the body, breathes and keeps its shape. The shell is cotton and silk, in blush. Choose a summer, all-season or winter weight.',
  'Mulberry silk filling, cotton and silk shell',
  ARRAY['Mulberry silk floss filling', 'Cotton and silk shell', 'Summer, all-season or winter weight', 'Blush']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade — never in direct sun', 'Do not machine wash; spot clean only']::text[],
  ARRAY['Blush']::text[],
  ARRAY['/images/products/molee/mulberry-silk-filled-duvet-1.webp', '/images/products/molee/mulberry-silk-filled-duvet-2.webp', '/images/products/molee/mulberry-silk-filled-duvet-3.webp']::text[],
  '[{"name":"Queen · summer","dimensions":"200 × 230 cm, 1 kg fill","price":550,"compare_at_price":null},{"name":"Queen · all-season","dimensions":"200 × 230 cm, 2 kg fill","price":600,"compare_at_price":null},{"name":"Queen · winter","dimensions":"200 × 230 cm, 3 kg fill","price":675,"compare_at_price":null},{"name":"King · summer","dimensions":"220 × 240 cm, 1 kg fill","price":550,"compare_at_price":null},{"name":"King · all-season","dimensions":"220 × 240 cm, 2 kg fill","price":600,"compare_at_price":null},{"name":"King · winter","dimensions":"220 × 240 cm, 3 kg fill","price":675,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'silk-filled-jacquard-duvet',
  'Silk-Filled Jacquard Duvet',
  'bedlinen',
  'Mulberry silk filling in a 300-thread lyocell-cotton jacquard shell.',
  'Mulberry silk filling in an ivory lyocell-and-cotton jacquard shell woven at 300 threads — a duvet that feels as good on the outside as it does within. Light and breathable.',
  'Mulberry silk filling, lyocell-cotton jacquard shell, 300 thread count',
  ARRAY['Mulberry silk filling', '300-thread lyocell-cotton jacquard shell', '0.9–1.7 kg by size', 'Ivory']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade — never in direct sun', 'Do not machine wash; spot clean only']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/molee/silk-filled-jacquard-duvet-1.webp', '/images/products/molee/silk-filled-jacquard-duvet-2.webp', '/images/products/molee/silk-filled-jacquard-duvet-3.webp', '/images/products/molee/silk-filled-jacquard-duvet-4.webp']::text[],
  '[{"name":"Queen","dimensions":"200 × 230 cm","price":750,"compare_at_price":null},{"name":"King","dimensions":"220 × 240 cm","price":850,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'silk-quilt-lyocell-jacquard',
  'Silk Quilt in Lyocell Jacquard',
  'bedlinen',
  'A silk-filled quilt in white lyocell-cotton jacquard, from summer to winter.',
  'A silk-filled quilt in a white lyocell-and-cotton jacquard shell, offered in weights from a featherlight 0.5 kg summer quilt to a 2.4 kg winter one. Cool, drapey and breathable at every weight.',
  'Silk filling, lyocell-cotton jacquard shell',
  ARRAY['Silk filling', 'Lyocell-cotton jacquard shell', 'Summer to winter weights', 'White']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade — never in direct sun', 'Do not machine wash; spot clean only']::text[],
  ARRAY['White']::text[],
  ARRAY['/images/products/molee/silk-quilt-lyocell-jacquard-1.webp', '/images/products/molee/silk-quilt-lyocell-jacquard-2.webp', '/images/products/molee/silk-quilt-lyocell-jacquard-3.webp', '/images/products/molee/silk-quilt-lyocell-jacquard-4.webp']::text[],
  '[{"name":"Queen · summer","dimensions":"200 × 230 cm, 0.5 kg fill","price":280,"compare_at_price":null},{"name":"Queen · spring","dimensions":"200 × 230 cm, 1 kg fill","price":375,"compare_at_price":null},{"name":"Queen · winter","dimensions":"200 × 230 cm, 2.4 kg fill","price":600,"compare_at_price":null},{"name":"King · summer","dimensions":"220 × 240 cm, 0.5 kg fill","price":290,"compare_at_price":null},{"name":"King · autumn","dimensions":"220 × 240 cm, 1.1 kg fill","price":400,"compare_at_price":null},{"name":"King · winter","dimensions":"220 × 240 cm, 2.4 kg fill","price":625,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'mulberry-silk-quilt-champagne',
  'Mulberry Silk Quilt in Champagne',
  'bedlinen',
  'Mulberry silk filling in a silk-and-modal shell, in champagne.',
  'Mulberry silk floss inside a silk-and-modal shell with a soft champagne jacquard. Light, breathable and quietly luxurious, in three sizes.',
  'Mulberry silk filling, silk and modal shell',
  ARRAY['Mulberry silk floss filling', 'Silk and modal jacquard shell', 'Light, breathable warmth', 'Champagne']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade — never in direct sun', 'Do not machine wash; spot clean only']::text[],
  ARRAY['Champagne']::text[],
  ARRAY['/images/products/molee/mulberry-silk-quilt-champagne-1.webp', '/images/products/molee/mulberry-silk-quilt-champagne-2.webp', '/images/products/molee/mulberry-silk-quilt-champagne-3.webp', '/images/products/molee/mulberry-silk-quilt-champagne-4.webp', '/images/products/molee/mulberry-silk-quilt-champagne-5.webp']::text[],
  '[{"name":"Single","dimensions":"150 × 200 cm","price":450,"compare_at_price":null},{"name":"Queen","dimensions":"200 × 230 cm","price":475,"compare_at_price":null},{"name":"King","dimensions":"220 × 240 cm","price":475,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'silk-filled-summer-quilt',
  'Silk-Filled Summer Quilt',
  'bedlinen',
  'Mulberry silk filling in a 600-thread ivory jacquard shell — summer weight.',
  'A summer quilt filled with mulberry silk, in an ivory 600-thread jacquard shell. Silk breathes and wicks, so it stays comfortable through a warm, humid night.',
  'Mulberry silk filling, 600 thread count jacquard shell',
  ARRAY['Mulberry silk filling', '600-thread jacquard shell', 'Summer weight, 2–2.5 kg', 'Ivory']::text[],
  ARRAY['Use inside a duvet cover', 'Air in the shade — never in direct sun', 'Do not machine wash; spot clean only']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/molee/silk-filled-summer-quilt-1.webp', '/images/products/molee/silk-filled-summer-quilt-2.webp', '/images/products/molee/silk-filled-summer-quilt-3.webp', '/images/products/molee/silk-filled-summer-quilt-4.webp', '/images/products/molee/silk-filled-summer-quilt-5.webp']::text[],
  '[{"name":"Queen","dimensions":"200 × 230 cm","price":775,"compare_at_price":null},{"name":"King","dimensions":"220 × 240 cm","price":825,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  '21-momme-silk-pillowcase',
  '21 Momme Silk Pillowcase',
  'bedlinen',
  '21-momme silk in gold with an ivory reverse and fine piping.',
  'A single 21-momme silk pillowcase in soft gold, with an ivory reverse and a fine piped edge — two colours, so you can turn it to suit your mood. Envelope closure, 48 × 74 cm.',
  'Silk, 21 momme',
  ARRAY['One pillowcase, 48 × 74 cm', '21-momme silk', 'Gold with an ivory reverse', 'Envelope closure']::text[],
  ARRAY['Hand wash cold or machine wash in a mesh bag on delicate', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Gold']::text[],
  ARRAY['/images/products/molee/21-momme-silk-pillowcase-1.webp', '/images/products/molee/21-momme-silk-pillowcase-2.webp', '/images/products/molee/21-momme-silk-pillowcase-3.webp', '/images/products/molee/21-momme-silk-pillowcase-4.webp', '/images/products/molee/21-momme-silk-pillowcase-5.webp']::text[],
  '[{"name":"Standard","dimensions":"48 × 74 cm","price":100,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'rolled-edge-silk-pillowcase',
  'Rolled-Edge Silk Pillowcase',
  'bedlinen',
  '100% mulberry silk in sage, with a rolled ivory edge.',
  'A single mulberry silk pillowcase in sage, finished with a rolled ivory edge along the opening — a small detail borrowed from silk scarves. Envelope closure, 48 × 74 cm.',
  '100% mulberry silk',
  ARRAY['One pillowcase, 48 × 74 cm', '100% mulberry silk', 'Rolled contrast edge', 'Envelope closure']::text[],
  ARRAY['Hand wash cold or machine wash in a mesh bag on delicate', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Sage']::text[],
  ARRAY['/images/products/molee/rolled-edge-silk-pillowcase-1.webp', '/images/products/molee/rolled-edge-silk-pillowcase-2.webp', '/images/products/molee/rolled-edge-silk-pillowcase-3.webp', '/images/products/molee/rolled-edge-silk-pillowcase-4.webp']::text[],
  '[{"name":"Standard","dimensions":"48 × 74 cm","price":70,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'french-linen-pillowcase-pair',
  'French Linen Pillowcase Pair',
  'bedlinen',
  'A pair of pure French linen pillowcases with tie closures, in dove grey.',
  'Two pillowcases in pure French linen with soft tie closures, in dove grey. Linen sleeps cool and dries fast, and a pair of these makes even an old duvet look considered. 48 × 74 cm each.',
  '100% French linen',
  ARRAY['Pair of pillowcases, 48 × 74 cm each', 'Pure French linen', 'Tie closures', 'Dove grey']::text[],
  ARRAY['Machine wash warm on gentle', 'Line dry or tumble dry low', 'No need to iron — linen is meant to look slept in']::text[],
  ARRAY['Dove Grey']::text[],
  ARRAY['/images/products/molee/french-linen-pillowcase-pair-1.webp', '/images/products/molee/french-linen-pillowcase-pair-2.webp']::text[],
  '[{"name":"Pair","dimensions":"48 × 74 cm (×2)","price":95,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- wellness ------------------------------------------------------------------

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  '3d-contour-silk-sleep-mask',
  '3D Contour Silk Sleep Mask',
  'wellness',
  '22-momme mulberry silk, shaped to sit off the eyelids.',
  'A sleep mask in 22-momme mulberry silk, woven in 3D so the cups sit away from the eyelids and lashes — no pressure, total dark. Adjustable, washable and light enough to forget you are wearing it.',
  '100% mulberry silk, 22 momme',
  ARRAY['22-momme mulberry silk', '3D contoured eye cups', 'Adjustable strap', 'Washable']::text[],
  ARRAY['Hand wash cold', 'Dry flat in the shade']::text[],
  ARRAY['Champagne']::text[],
  ARRAY['/images/products/molee/3d-contour-silk-sleep-mask-1.webp', '/images/products/molee/3d-contour-silk-sleep-mask-2.webp']::text[],
  '[{"name":"One size","dimensions":"Adjustable strap","price":17,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  '40-momme-silk-sleep-set',
  '40 Momme Silk Sleep Set',
  'wellness',
  'Pillowcase, eye mask and hair tie in heavy 40-momme silk.',
  'Three pieces in heavyweight 40-momme silk — a pillowcase, an eye mask and a hair tie — in ivory, presented boxed together. Silk is kind to skin and hair overnight, and at 40 momme it has a dense, luxurious hand. A lovely gift.',
  '100% silk, 40 momme',
  ARRAY['Pillowcase 51 × 76 cm, eye mask and hair tie', '40-momme silk', 'Ivory', 'Presented boxed']::text[],
  ARRAY['Hand wash cold', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Ivory']::text[],
  ARRAY['/images/products/molee/40-momme-silk-sleep-set-1.webp', '/images/products/molee/40-momme-silk-sleep-set-2.webp']::text[],
  '[{"name":"One size","dimensions":"Pillowcase 51 × 76 cm, eye mask, hair tie","price":200,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'mulberry-silk-travel-set',
  'Mulberry Silk Travel Set',
  'wellness',
  '19-momme silk neck pillow, eye mask and pouch for long journeys.',
  'Everything for a long-haul night in 19-momme mulberry silk: a U-shaped neck pillow with a zip-off cover, a blackout eye mask and a silk pouch to carry them in. Soft on skin and hair, and it packs down small.',
  '100% mulberry silk, 19 momme',
  ARRAY['Neck pillow, eye mask and pouch', '19-momme mulberry silk', 'Zip-off neck pillow cover', 'Pearl white']::text[],
  ARRAY['Hand wash the covers cold', 'Dry flat in the shade']::text[],
  ARRAY['Pearl']::text[],
  ARRAY['/images/products/molee/mulberry-silk-travel-set-1.webp', '/images/products/molee/mulberry-silk-travel-set-2.webp']::text[],
  '[{"name":"One size","dimensions":"Neck pillow, eye mask, pouch","price":200,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'linen-eye-mask',
  'Linen Eye Mask',
  'wellness',
  'A breathable pure linen eye mask with a soft elastic strap.',
  'A simple, breathable eye mask in pure linen with a soft ruffled elastic strap — cooler than silk on a hot night, and softer with every wash. In deep chocolate.',
  '100% linen',
  ARRAY['Pure linen', 'Soft elastic strap', 'Breathable for warm nights', 'Chocolate']::text[],
  ARRAY['Hand wash cold', 'Air dry']::text[],
  ARRAY['Chocolate']::text[],
  ARRAY['/images/products/molee/linen-eye-mask-1.webp', '/images/products/molee/linen-eye-mask-2.webp']::text[],
  '[{"name":"One size","dimensions":"Elastic strap","price":55,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- fashion -------------------------------------------------------------------

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'silk-robe-nightdress-set',
  'Silk Robe & Nightdress Set',
  'fashion',
  'A pure silk robe and slip nightdress, trimmed with ivory French lace.',
  'A two-piece set in pure silk — a slip nightdress and a matching robe — trimmed at the neckline and cuffs with ivory French lace. In a deep bordeaux red, for evenings in and mornings you want to take slowly.',
  '100% silk, lace trim',
  ARRAY['Nightdress and robe', 'Pure silk', 'Ivory French lace trim', 'Bordeaux']::text[],
  ARRAY['Hand wash cold with a silk detergent', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Bordeaux']::text[],
  ARRAY['/images/products/molee/silk-robe-nightdress-set-1.webp', '/images/products/molee/silk-robe-nightdress-set-2.webp', '/images/products/molee/silk-robe-nightdress-set-3.webp', '/images/products/molee/silk-robe-nightdress-set-4.webp']::text[],
  '[{"name":"One size","dimensions":"Fits 40–60 kg","price":425,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products
  (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock)
VALUES (
  'silk-slip-nightdress',
  'Silk Slip Nightdress',
  'fashion',
  'A pure silk slip in bordeaux, with an ivory French lace neckline.',
  'A fluid slip nightdress in pure silk with fine straps and a deep V of ivory French lace at the neckline. In a deep bordeaux red.',
  '100% silk, lace trim',
  ARRAY['Slip nightdress', 'Pure silk', 'Ivory French lace neckline', 'Bordeaux']::text[],
  ARRAY['Hand wash cold with a silk detergent', 'Dry flat in the shade', 'Cool iron on the reverse']::text[],
  ARRAY['Bordeaux']::text[],
  ARRAY['/images/products/molee/silk-slip-nightdress-1.webp', '/images/products/molee/silk-slip-nightdress-2.webp', '/images/products/molee/silk-slip-nightdress-3.webp', '/images/products/molee/silk-slip-nightdress-4.webp']::text[],
  '[{"name":"One size","dimensions":"Relaxed fit","price":210,"compare_at_price":null}]'::jsonb,
  NULL,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
