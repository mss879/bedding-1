-- Aveline Bedding — initial schema + seed catalog
-- Run with: supabase db push  (or paste into the Supabase SQL editor)

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_slug text not null references public.categories(slug) on delete cascade,
  short_description text not null default '',
  description text not null default '',
  material text not null default '',
  details text[] not null default '{}',
  care text[] not null default '{}',
  colors text[] not null default '{}',
  images text[] not null default '{}',
  sizes jsonb not null default '[]',
  badge text,
  featured boolean not null default false,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_slug);
create index if not exists products_featured_idx on public.products (featured) where featured;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  email text not null default '',
  phone text not null,
  address text not null default '',
  city text not null default '',
  notes text not null default '',
  total numeric(12,2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  size_name text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact','bulk')),
  name text not null,
  email text not null default '',
  phone text not null default '',
  business_type text,
  quantity text,
  sizes text,
  materials text,
  budget text,
  delivery text,
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- Catalog is publicly readable; orders/inquiries/newsletter are
-- publicly insertable and write-only from the storefront. Reading
-- them requires the service role (future admin dashboard).
-- ============================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "Public read categories" on public.categories
  for select using (true);

create policy "Public read products" on public.products
  for select using (true);

create policy "Public create orders" on public.orders
  for insert with check (true);

create policy "Public create order items" on public.order_items
  for insert with check (true);

create policy "Public create inquiries" on public.inquiries
  for insert with check (true);

create policy "Public subscribe newsletter" on public.newsletter_subscribers
  for insert with check (true);

-- Orders, order items, inquiries and newsletter rows are write-only from the
-- storefront: the server action generates the order id itself, so no SELECT
-- policy is needed and customer data cannot be read with the anon key.

-- ============================================================
-- Seed catalog
-- ============================================================

insert into public.categories (slug, name, description, image, sort_order) values ('bed-sheets', 'Bed Sheets', 'Percale, sateen and stonewashed linen sheets woven to last.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80&auto=format&fit=crop', 1)
  on conflict (slug) do nothing;
insert into public.categories (slug, name, description, image, sort_order) values ('duvet-covers', 'Duvet Covers', 'Breathable covers in linen and long-staple cotton.', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80&auto=format&fit=crop', 2)
  on conflict (slug) do nothing;
insert into public.categories (slug, name, description, image, sort_order) values ('pillows', 'Pillowcases & Shams', 'Soft on skin and hair, finished with hand-tied closures.', 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1600&q=80&auto=format&fit=crop', 3)
  on conflict (slug) do nothing;
insert into public.categories (slug, name, description, image, sort_order) values ('bedding-sets', 'Bedding Sets', 'Complete sets, curated to match — save 20% over unit prices.', 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1600&q=80&auto=format&fit=crop', 4)
  on conflict (slug) do nothing;
insert into public.categories (slug, name, description, image, sort_order) values ('blankets-throws', 'Blankets & Throws', 'Handloom cotton throws and waffle weaves for every season.', 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1600&q=80&auto=format&fit=crop', 5)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'cloud-percale-sheet-set', 'Cloud Percale Sheet Set', 'bed-sheets',
  'Crisp, cool 400-thread percale in cloud white.',
  'Woven from long-staple cotton in a tight percale weave, the Cloud set sleeps crisp and cool all year round. Each set includes one flat sheet, one fitted sheet and two pillowcases, finished with a double-stitched hem.',
  '100% long-staple cotton, 400 thread count percale',
  array['Includes flat sheet, fitted sheet and two pillowcases', 'Deep 40 cm fitted-sheet pocket', 'Gets softer with every wash', 'OEKO-TEX certified, free of harsh chemicals']::text[],
  array['Machine wash cold on gentle', 'Tumble dry low', 'Warm iron if desired']::text[],
  array['Cloud White', 'Oat', 'Sage']::text[],
  array['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Single","dimensions":"150 × 220 cm","price":12500,"compare_at_price":null},{"name":"Double","dimensions":"200 × 220 cm","price":14500,"compare_at_price":null},{"name":"Queen","dimensions":"230 × 250 cm","price":16500,"compare_at_price":null},{"name":"King","dimensions":"260 × 270 cm","price":18500,"compare_at_price":null}]'::jsonb,
  'Bestseller', true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'stonewashed-linen-sheet-set', 'Stonewashed Linen Sheet Set', 'bed-sheets',
  'Garment-washed European flax with a lived-in softness.',
  'Our signature linen is stonewashed for a soft, tumbled texture from the very first night. Naturally temperature-regulating, it keeps you cool in the heat and cosy in the cold.',
  '100% European flax linen, stonewashed',
  array['Pre-washed for zero shrinkage surprises', 'Naturally breathable and moisture-wicking', 'Yarn-dyed for rich, lasting colour']::text[],
  array['Machine wash warm', 'Line dry or tumble dry low', 'No ironing needed']::text[],
  array['Natural', 'Terracotta', 'Charcoal']::text[],
  array['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"200 × 220 cm","price":19500,"compare_at_price":null},{"name":"Queen","dimensions":"230 × 250 cm","price":22500,"compare_at_price":null},{"name":"King","dimensions":"260 × 270 cm","price":25500,"compare_at_price":null}]'::jsonb,
  null, true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'signature-sateen-fitted-sheet', 'Signature Sateen Fitted Sheet', 'bed-sheets',
  'Buttery-smooth sateen with a subtle lustre.',
  'A silky-soft fitted sheet in our signature sateen weave. The full elastic hem and extra-deep pocket keep it perfectly in place on mattresses up to 40 cm.',
  '100% long-staple cotton, 300 thread count sateen',
  array['Extra-deep 40 cm pocket', 'Full elastic hem', 'Silky sateen finish']::text[],
  array['Machine wash cold', 'Tumble dry low']::text[],
  array['Ivory', 'Stone', 'Dusk Blue']::text[],
  array['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Single","dimensions":"90 × 200 cm","price":6500,"compare_at_price":null},{"name":"Double","dimensions":"140 × 200 cm","price":7900,"compare_at_price":null},{"name":"Queen","dimensions":"160 × 200 cm","price":8900,"compare_at_price":null},{"name":"King","dimensions":"180 × 200 cm","price":9900,"compare_at_price":null}]'::jsonb,
  null, false, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'terracotta-linen-duvet-set', 'Terracotta Linen Duvet Set', 'duvet-covers',
  'Sun-baked terracotta linen, hand-finished with ties.',
  'The set from our campaign imagery. Deep terracotta linen, stonewashed to a soft slub texture and finished with hand-tied corner closures that keep your duvet exactly where it should be.',
  '100% European flax linen, stonewashed',
  array['Includes duvet cover and two pillowcases', 'Hand-tied closures, interior corner ties', 'Dyed in small batches for depth of colour']::text[],
  array['Machine wash warm', 'Line dry', 'No ironing needed']::text[],
  array['Terracotta', 'Ochre']::text[],
  array['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"200 × 200 cm","price":24500,"compare_at_price":null},{"name":"Queen","dimensions":"225 × 220 cm","price":27500,"compare_at_price":null},{"name":"King","dimensions":"245 × 240 cm","price":29500,"compare_at_price":null}]'::jsonb,
  'Bestseller', true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'cloud-white-duvet-cover', 'Cloud White Duvet Cover', 'duvet-covers',
  'Hotel-crisp white percale with an invisible button placket.',
  'The five-star hotel look, made for home. Crisp white percale with a hidden button placket and interior ties. Bleach-friendly and built for years of washing.',
  '100% long-staple cotton, 400 thread count percale',
  array['Hidden button placket', 'Interior duvet ties', 'Bleach-friendly pure white']::text[],
  array['Machine wash warm', 'Tumble dry medium', 'Iron for a crisp finish']::text[],
  array['Cloud White']::text[],
  array['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"200 × 200 cm","price":16500,"compare_at_price":null},{"name":"Queen","dimensions":"225 × 220 cm","price":18500,"compare_at_price":null},{"name":"King","dimensions":"245 × 240 cm","price":20500,"compare_at_price":null}]'::jsonb,
  null, true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'midnight-sateen-duvet-cover', 'Midnight Sateen Duvet Cover', 'duvet-covers',
  'Deep navy sateen with a soft, moody sheen.',
  'A statement cover in deep midnight navy. The sateen weave catches low light beautifully, and the colour is yarn-dyed so it stays rich wash after wash.',
  '100% long-staple cotton, 300 thread count sateen',
  array['Yarn-dyed midnight navy', 'Hidden button placket', 'Interior duvet ties']::text[],
  array['Machine wash cold, dark cycle', 'Tumble dry low']::text[],
  array['Midnight', 'Graphite']::text[],
  array['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"200 × 200 cm","price":17500,"compare_at_price":null},{"name":"Queen","dimensions":"225 × 220 cm","price":19500,"compare_at_price":null},{"name":"King","dimensions":"245 × 240 cm","price":21500,"compare_at_price":null}]'::jsonb,
  null, false, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'heirloom-linen-pillowcase-pair', 'Heirloom Linen Pillowcase Pair', 'pillows',
  'A pair of stonewashed linen cases with hand-tied bows.',
  'Sewn one pair at a time, these linen pillowcases close with hand-tied bows — the small detail our customers photograph most. Soft, breathable and kind to skin and hair.',
  '100% European flax linen, stonewashed',
  array['Sold as a pair', 'Hand-tied bow closure', 'Naturally hypoallergenic']::text[],
  array['Machine wash warm', 'Line dry', 'No ironing needed']::text[],
  array['Natural', 'Cloud White', 'Terracotta']::text[],
  array['https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Standard","dimensions":"50 × 75 cm","price":6900,"compare_at_price":null},{"name":"King","dimensions":"50 × 90 cm","price":7900,"compare_at_price":null}]'::jsonb,
  'New', true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'velvet-touch-pillow-shams', 'Velvet Touch Pillow Shams', 'pillows',
  'Brushed cotton shams with a 5 cm flanged border.',
  'Brushed for a peach-soft hand feel, these shams frame your pillows with a tailored 5 cm flange. The envelope back keeps inserts hidden and secure.',
  '100% brushed cotton',
  array['Sold as a pair', '5 cm flanged border', 'Envelope closure']::text[],
  array['Machine wash cold', 'Tumble dry low']::text[],
  array['Stone', 'Blush', 'Moss']::text[],
  array['https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Standard","dimensions":"50 × 75 cm","price":8500,"compare_at_price":null},{"name":"Euro","dimensions":"65 × 65 cm","price":9500,"compare_at_price":null}]'::jsonb,
  null, false, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'aveline-signature-bedding-set', 'Aveline Signature Bedding Set', 'bedding-sets',
  'The complete Aveline bed — save 20% over unit prices.',
  'Everything your bed needs in one box: flat sheet, fitted sheet, duvet cover and four pillowcases in our signature percale. Curated to match, priced to save — 20% less than buying each piece alone.',
  '100% long-staple cotton, 400 thread count percale',
  array['7-piece set: flat, fitted, duvet cover, four pillowcases', 'Save 20% versus unit prices', 'Gift-ready cotton keeper bag']::text[],
  array['Machine wash cold', 'Tumble dry low']::text[],
  array['Cloud White', 'Oat', 'Terracotta']::text[],
  array['https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"7-piece set","price":36500,"compare_at_price":45500},{"name":"Queen","dimensions":"7-piece set","price":39500,"compare_at_price":49500},{"name":"King","dimensions":"7-piece set","price":42500,"compare_at_price":53000}]'::jsonb,
  'Save 20%', true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'hotel-luxe-bedding-set', 'Hotel Luxe Bedding Set', 'bedding-sets',
  'The five-star turn-down, boxed for home.',
  'Developed with our hospitality partners, the Hotel Luxe set brings the five-star turn-down home: crisp white percale with a tailored double-stitch border, built to survive commercial laundering.',
  '100% long-staple cotton, 400 thread count percale',
  array['5-piece set: flat, fitted, duvet cover, two pillowcases', 'Commercial-laundry tested', 'Double-stitched hotel border']::text[],
  array['Machine wash warm', 'Tumble dry medium', 'Bleach-friendly']::text[],
  array['Cloud White']::text[],
  array['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Queen","dimensions":"5-piece set","price":32500,"compare_at_price":null},{"name":"King","dimensions":"5-piece set","price":35500,"compare_at_price":null}]'::jsonb,
  null, true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'handloom-cotton-throw', 'Handloom Cotton Throw', 'blankets-throws',
  'Handwoven on wooden looms with knotted fringe.',
  'Each throw is handwoven on traditional wooden looms, then finished with a hand-knotted fringe. Perfect at the foot of the bed or over the shoulder on cool evenings.',
  '100% handloom cotton',
  array['Handwoven, small-batch', 'Hand-knotted fringe', 'Ethically made in Sri Lanka']::text[],
  array['Gentle machine wash cold', 'Line dry']::text[],
  array['Natural Stripe', 'Clay Stripe']::text[],
  array['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"130 × 180 cm","price":9800,"compare_at_price":null}]'::jsonb,
  null, false, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'waffle-weave-blanket', 'Waffle Weave Blanket', 'blankets-throws',
  'Airy honeycomb weave that layers beautifully.',
  'The honeycomb structure traps air for warmth without weight. Layer it under a duvet in the cold months or use it alone in the warm ones.',
  '100% combed cotton waffle weave',
  array['Lightweight, breathable warmth', 'Pre-washed for softness', 'Selvedge edge finish']::text[],
  array['Machine wash cold', 'Tumble dry low']::text[],
  array['Oat', 'Stone', 'Sage']::text[],
  array['https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Double","dimensions":"200 × 220 cm","price":13500,"compare_at_price":null},{"name":"King","dimensions":"240 × 260 cm","price":15500,"compare_at_price":null}]'::jsonb,
  null, false, true)
  on conflict (slug) do nothing;

