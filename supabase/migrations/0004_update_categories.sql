-- Migration 0004: Update categories to Kitchen, Bedroom, Lounge, Bathroom, Garden, and Garage

BEGIN;

-- 1. Insert new categories if they don't exist
INSERT INTO public.categories (slug, name, description, image, sort_order)
VALUES 
  ('kitchen', 'Kitchen', 'Artisanal ceramics and premium linen textiles for your cooking space.', '/images/categories/kitchen.png', 1),
  ('bedroom', 'Bedroom', 'Premium washed linen sheets, duvet covers and pillowcases woven to last.', '/images/categories/bedroom.png', 2),
  ('lounge', 'Lounge', 'Cozy waffle throws and handloom blankets for comfortable spaces.', '/images/categories/lounge.png', 3),
  ('bathroom', 'Bathroom', 'Soft, organic cotton bath sheets, waffle towels and linen wraps.', '/images/categories/bathroom.png', 4),
  ('garden', 'Garden', 'Handloom cotton cushions and durable layers for outdoor seating.', '/images/categories/garden.png', 5),
  ('garage', 'Garage', 'Heavy-duty linen storage baskets and organized utility essentials.', '/images/categories/garage.png', 6)
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  sort_order = EXCLUDED.sort_order;

-- 2. Update existing products' category_slug from old slugs to new slugs
-- Map 'bed-sheets', 'duvet-covers', 'pillows', 'bedding-sets' -> 'bedroom'
UPDATE public.products 
SET category_slug = 'bedroom' 
WHERE category_slug IN ('bed-sheets', 'duvet-covers', 'pillows', 'bedding-sets');

-- Map 'blankets-throws' -> 'lounge'
UPDATE public.products 
SET category_slug = 'lounge' 
WHERE category_slug = 'blankets-throws';

-- 3. Delete old categories that are no longer used
DELETE FROM public.categories 
WHERE slug NOT IN ('kitchen', 'bedroom', 'lounge', 'bathroom', 'garden', 'garage');

COMMIT;
