-- ==========================================================
-- PEPTRA BIO - SUPABASE DATABASE SCHEMA MIGRATION
-- Research Peptide E-Commerce Catalog & Admin System
-- ==========================================================

-- 1. CATEGORIES TABLE
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. PRODUCTS TABLE
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  short_description text,
  description text,
  category_id uuid references categories(id) on delete set null,
  category text,
  product_code text,
  cas_number text,
  sequence text,
  molecular_formula text,
  molecular_weight numeric,
  purity text default '99%+',
  size text default '5mg',
  format text default 'Lyophilized Solid / Vial',
  price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  stock_quantity integer not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  research_use_only boolean not null default true,
  storage_information text default 'Store at -20°C upon receipt. Protect from light.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. PRODUCT IMAGES TABLE
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- 4. PRODUCT DOCUMENTS / COA TABLE
create table if not exists product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  title text not null,
  document_type text not null check (document_type in ('COA', 'SDS', 'Specification Sheet', 'Research Reference', 'Other')),
  file_url text not null,
  batch_number text,
  test_date text,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- 5. PRODUCT REFERENCES TABLE
create table if not exists product_references (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  title text not null,
  authors text,
  publication text,
  year integer,
  url text,
  created_at timestamptz default now()
);

-- 6. ORDERS TABLE
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  shipping_address jsonb not null default '{}'::jsonb,
  billing_address jsonb not null default '{}'::jsonb,
  compliance_acknowledged boolean not null default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. ORDER ITEMS TABLE
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_code text,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0
);

-- 8. ADMIN USERS TABLE
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz default now()
);

-- 9. ADMIN AUDIT LOGS TABLE
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  admin_email text,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_documents enable row level security;
alter table product_references enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admin_users enable row level security;
alter table admin_audit_logs enable row level security;

-- Public Read Policies
create policy "Public can read active categories" on categories for select using (is_active = true);
create policy "Public can read active products" on products for select using (is_active = true);
create policy "Public can read product images" on product_images for select using (true);
create policy "Public can read public documents" on product_documents for select using (is_public = true);
create policy "Public can read references" on product_references for select using (true);

-- Authenticated Admin Policies (Full Access)
create policy "Admins full access on categories" on categories for all using (auth.role() = 'authenticated');
create policy "Admins full access on products" on products for all using (auth.role() = 'authenticated');
create policy "Admins full access on product_images" on product_images for all using (auth.role() = 'authenticated');
create policy "Admins full access on product_documents" on product_documents for all using (auth.role() = 'authenticated');
create policy "Admins full access on product_references" on product_references for all using (auth.role() = 'authenticated');
create policy "Admins full access on orders" on orders for all using (auth.role() = 'authenticated');
create policy "Admins full access on order_items" on order_items for all using (auth.role() = 'authenticated');
create policy "Admins full access on admin_users" on admin_users for all using (auth.role() = 'authenticated');
create policy "Admins full access on admin_audit_logs" on admin_audit_logs for all using (auth.role() = 'authenticated');

-- Customer can create orders & order items
create policy "Public can insert orders" on orders for insert with check (true);
create policy "Public can insert order items" on order_items for insert with check (true);
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id or customer_email = current_setting('request.jwt.claim.email', true));
