-- Ivory Homez Bedding — initial schema + seed catalog
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

insert into public.categories (slug, name, description, image, sort_order) values ('kitchen', 'Kitchen', 'Artisanal ceramics and premium linen textiles for your cooking space.', '/images/categories/kitchen.png', 1)
  on conflict (slug) do nothing;
insert into public.categories (slug, name, description, image, sort_order) values ('bedroom', 'Bedroom', 'Premium washed linen sheets, duvet covers and pillowcases woven to last.', '/images/categories/bedroom.png', 2)
  on conflict (slug) do nothing;
insert into public.categories (slug, name, description, image, sort_order) values ('lounge', 'Lounge', 'Cozy waffle throws and handloom blankets for comfortable spaces.', '/images/categories/lounge.png', 3)
  on conflict (slug) do nothing;
insert into public.categories (slug, name, description, image, sort_order) values ('bathroom', 'Bathroom', 'Soft, organic cotton bath sheets, waffle towels and linen wraps.', '/images/categories/bathroom.png', 4)
  on conflict (slug) do nothing;
insert into public.categories (slug, name, description, image, sort_order) values ('garden', 'Garden', 'Handloom cotton cushions and durable layers for outdoor seating.', '/images/categories/garden.png', 5)
  on conflict (slug) do nothing;
insert into public.categories (slug, name, description, image, sort_order) values ('garage', 'Garage', 'Heavy-duty linen storage baskets and organized utility essentials.', '/images/categories/garage.png', 6)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
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
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'stonewashed-linen-sheet-set', 'Stonewashed Linen Sheet Set', 'bedroom',
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
  'signature-sateen-fitted-sheet', 'Signature Sateen Fitted Sheet', 'bedroom',
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
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'cloud-white-duvet-cover', 'Cloud White Duvet Cover', 'bedroom',
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
  'midnight-sateen-duvet-cover', 'Midnight Sateen Duvet Cover', 'bedroom',
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
  'heirloom-linen-pillowcase-pair', 'Heirloom Linen Pillowcase Pair', 'bedroom',
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
  'velvet-touch-pillow-shams', 'Velvet Touch Pillow Shams', 'bedroom',
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
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'hotel-luxe-bedding-set', 'Hotel Luxe Bedding Set', 'bedroom',
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
  'handloom-cotton-throw', 'Handloom Cotton Throw', 'lounge',
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
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'washed-linen-apron', 'Washed Linen Apron', 'kitchen',
  'Artisanal cross-back linen apron with deep front pockets.',
  'Sewn from heavy European flax linen, this cross-back apron distributes weight evenly across your shoulders, not your neck. Features double-stitched utility pockets and a relaxed, lived-in drape that only gets better with wash and wear.',
  '100% European flax linen, washed finish',
  array['Comfortable cross-back design (no neck ties)', 'Two deep front utility pockets', 'Reinforced stitching at stress points', 'One size fits most']::text[],
  array['Machine wash warm', 'Tumble dry low', 'No ironing needed']::text[],
  array['Oatmeal', 'Charcoal', 'Sage']::text[],
  array['https://images.unsplash.com/photo-1556910103001-cf37a8c24207?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"85 × 90 cm","price":8500,"compare_at_price":null}]'::jsonb,
  'New', true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
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
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
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
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
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
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'handloom-seat-cushions', 'Handloom Cotton Seat Cushions', 'garden',
  'Handwoven box cushions with convenient tie-backs.',
  'Bring comfort and artisan craftsmanship to your garden dining set. These thick box cushions are handwoven on wooden looms from heavy-weight cotton, filled with supportive recycled fibers and finished with secure ties.',
  '100% handloom cotton shell, recycled fiber fill',
  array['Heavy-duty handwoven canvas shell', 'Tufted details for shape retention', 'Two robust tie-backs for secure fastening', 'Ethically crafted by artisans']::text[],
  array['Spot clean only', 'Store indoors when not in use', 'Air dry thoroughly']::text[],
  array['Natural Stripe', 'Sage Stripe', 'Charcoal Stripe']::text[],
  array['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1600585154526-7ee658dfa8e4?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"One Size","dimensions":"40 × 40 × 8 cm","price":6800,"compare_at_price":null}]'::jsonb,
  'New', true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
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
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
  'heavy-linen-storage', 'Heavy Linen Storage Baskets', 'garage',
  'Structured storage baskets with natural leather handles.',
  'Keep utility rooms, pantries and mudrooms organized. Sewn from double-layered heavy linen canvas, these storage baskets stand upright on their own and fold flat when not in use. Finished with double-riveted tan leather handles.',
  '100% heavy linen canvas, genuine leather handles',
  array['Stands upright independently', 'Double-riveted top-grain leather handles', 'Collapsible design for easy storage', 'Neutral linen texture hides dust']::text[],
  array['Wipe clean with a damp cloth', 'Do not submerge leather handles in water']::text[],
  array['Natural Linen', 'Charcoal Linen']::text[],
  array['https://images.unsplash.com/photo-1532882772249-df68a5dffc3e?w=1600&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80&auto=format&fit=crop']::text[],
  '[{"name":"Medium","dimensions":"30 × 30 × 30 cm","price":7900,"compare_at_price":null},{"name":"Large","dimensions":"40 × 40 × 40 cm","price":9800,"compare_at_price":null}]'::jsonb,
  'New', true, true)
  on conflict (slug) do nothing;

insert into public.products (slug, name, category_slug, short_description, description, material, details, care, colors, images, sizes, badge, featured, in_stock) values (
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
  on conflict (slug) do nothing;

