-- Migration 0012: the spa vouchers' photographs, served from Supabase Storage
--
-- Migration 0011 pointed the three spa vouchers at copies of their
-- photographs that ship with the website. This moves them onto the
-- product-images bucket, next to every photo uploaded in the dashboard, where
-- they can be replaced from the dashboard like any other.
--
-- SQL can say where a photograph lives but cannot carry the file, so the
-- files go into the bucket first, by hand:
--
--   1. Supabase → Storage → product-images.
--   2. Drag the folder public/images/products/vouchers from this repo into it.
--      The 3 photos then sit under vouchers/ in the bucket. (Dropped loose at
--      the top of the bucket instead works too.)
--   3. Run this file in the SQL editor.
--
-- It checks first that all 3 photos are in the bucket and stops without
-- changing anything if one is missing. It then repoints each voucher, photo by
-- photo and in the same order, and leaves alone any photo already replaced in
-- the dashboard. Safe to run again: once moved, nothing is left to change.
--
-- Run 0011 first. Written for this project's Supabase address. On another
-- project, change the address below or use `npm run photos:upload -- --all`,
-- which uploads and repoints in one go.

BEGIN;

CREATE TEMP TABLE voucher_photos (file text PRIMARY KEY) ON COMMIT DROP;
INSERT INTO voucher_photos (file) VALUES
  ('ayurvedic-half-day-ritual-voucher-a.webp'),
  ('couples-spa-afternoon-voucher-a.webp'),
  ('signature-spa-massage-voucher-a.webp');

DO $$
DECLARE
  missing integer;
  example text;
BEGIN
  SELECT count(*), min(p.file) INTO missing, example
    FROM voucher_photos p
   WHERE NOT EXISTS (
     SELECT 1 FROM storage.objects o
      WHERE o.bucket_id = 'product-images'
        AND o.name IN ('vouchers/' || p.file, p.file)
   );
  IF missing > 0 THEN
    RAISE EXCEPTION '% of the 3 photos are not in the product-images bucket yet (for example %). Upload the vouchers folder to the bucket first, then run this again. Nothing was changed.', missing, example;
  END IF;
END $$;

-- '/images/products/vouchers/' is 26 characters, so the file name starts at 27.
UPDATE public.products AS p
   SET images = ARRAY(
     SELECT COALESCE(
              (SELECT 'https://dfvnesvowiideynfelva.supabase.co/storage/v1/object/public/product-images/' || o.name
                 FROM storage.objects o
                WHERE o.bucket_id = 'product-images'
                  AND t.photo LIKE '/images/products/vouchers/%'
                  AND o.name IN ('vouchers/' || substr(t.photo, 27), substr(t.photo, 27))
                ORDER BY o.name LIKE 'vouchers/%' DESC
                LIMIT 1),
              t.photo)
       FROM unnest(p.images) WITH ORDINALITY AS t(photo, position)
      ORDER BY t.position)
 WHERE EXISTS (SELECT 1 FROM unnest(p.images) AS i(photo) WHERE i.photo LIKE '/images/products/vouchers/%');

COMMIT;

-- What the SQL editor shows when this finishes: the 3 vouchers, their
-- photographs in Supabase (3, unless some were replaced in the dashboard
-- since), and how many are still on the website copies (0).
SELECT
  count(*) AS vouchers,
  sum((SELECT count(*) FROM unnest(images) AS i(photo) WHERE i.photo LIKE 'https://dfvnesvowiideynfelva.supabase.co/storage/v1/object/public/product-images/%')) AS photos_in_supabase,
  sum((SELECT count(*) FROM unnest(images) AS i(photo) WHERE i.photo LIKE '/images/%')) AS photos_still_on_website
FROM public.products
WHERE slug IN (
  'signature-spa-massage-voucher',
  'ayurvedic-half-day-ritual-voucher',
  'couples-spa-afternoon-voucher'
);
