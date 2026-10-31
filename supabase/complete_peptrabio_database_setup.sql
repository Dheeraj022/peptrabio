-- ==============================================================================
-- PEPTRA BIO — COMPLETE PRODUCTION SUPABASE MASTER DATABASE SETUP
-- Single self-contained SQL file to drop, create, configure and seed all tables.
-- Run this directly in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-initializing (Clean Teardown)
DROP TABLE IF EXISTS support_ticket_events CASCADE;
DROP TABLE IF EXISTS support_ticket_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS product_verification_scans CASCADE;
DROP TABLE IF EXISTS product_verification_codes CASCADE;
DROP TABLE IF EXISTS verification_code_batches CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_references CASCADE;
DROP TABLE IF EXISTS product_documents CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admin_audit_logs CASCADE;
DROP TABLE IF EXISTS discount_codes CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP SEQUENCE IF EXISTS support_ticket_seq CASCADE;

-- ==============================================================================
-- 3. SCHEMA DEFINITION (TEXT Primary Keys for 100% Client & UUID Compatibility)
-- ==============================================================================

-- CATEGORIES TABLE
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category TEXT,
  product_code TEXT,
  cas_number TEXT,
  sequence TEXT,
  molecular_formula TEXT,
  molecular_weight TEXT,
  purity TEXT DEFAULT '99%+',
  size TEXT DEFAULT '5mg',
  format TEXT DEFAULT 'Lyophilized Solid / Sealed Vial',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(12,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  research_use_only BOOLEAN NOT NULL DEFAULT TRUE,
  storage_information TEXT DEFAULT 'Store at -20°C upon receipt. Protect from light.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCT IMAGES TABLE
CREATE TABLE product_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT DOCUMENTS / COA TABLE
CREATE TABLE product_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  batch_number TEXT,
  test_date TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT REFERENCES TABLE
CREATE TABLE product_references (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT,
  publication TEXT,
  year INTEGER,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_method TEXT NOT NULL DEFAULT 'partial_cod',
  payment_type TEXT NOT NULL DEFAULT 'partial',
  advance_percentage NUMERIC(5,2) DEFAULT 10.00,
  advance_amount NUMERIC(12,2) DEFAULT 0.00,
  remaining_cod_amount NUMERIC(12,2) DEFAULT 0.00,
  utr_number TEXT,
  screenshot_url TEXT,
  payment_submitted_at TIMESTAMPTZ,
  payment_verified_at TIMESTAMPTZ,
  payment_verified_by TEXT,
  payment_rejection_reason TEXT,
  payment_notes TEXT,
  currency TEXT DEFAULT 'INR',
  discount_code TEXT,
  discount_amount NUMERIC(12,2) DEFAULT 0.00,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  billing_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  compliance_acknowledged BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER ITEMS TABLE
CREATE TABLE order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_code TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  image_url TEXT
);

-- VERIFICATION CODE BATCHES TABLE
CREATE TABLE verification_code_batches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  batch_name TEXT,
  batch_number TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  codes TEXT[] DEFAULT '{}',
  authenticity_codes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT VERIFICATION CODES TABLE
CREATE TABLE product_verification_codes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  batch_id TEXT REFERENCES verification_code_batches(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  authenticity_code TEXT,
  batch_number TEXT NOT NULL,
  serial_number TEXT,
  max_scans INTEGER NOT NULL DEFAULT 3,
  scan_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT VERIFICATION SCANS AUDIT TABLE
CREATE TABLE product_verification_scans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  verification_code_id TEXT REFERENCES product_verification_codes(id) ON DELETE CASCADE,
  scan_number INTEGER NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT,
  user_agent TEXT,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT TICKETS TABLE
CREATE SEQUENCE support_ticket_seq START WITH 10001 INCREMENT BY 1;

CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_number TEXT UNIQUE NOT NULL DEFAULT ('TKT-' || nextval('support_ticket_seq')::text),
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to TEXT,
  assigned_name TEXT,
  order_id TEXT,
  order_number TEXT,
  product_id TEXT,
  product_name TEXT,
  verification_code_id TEXT,
  verification_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- SUPPORT TICKET MESSAGES TABLE
CREATE TABLE support_ticket_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id TEXT,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUPPORT TICKET EVENTS TABLE
CREATE TABLE support_ticket_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADMIN USERS TABLE
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN AUDIT LOGS TABLE
CREATE TABLE admin_audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id TEXT,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN SETTINGS TABLE
CREATE TABLE admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT DEFAULT 'PEPTRA BIO',
  support_email TEXT DEFAULT 'support@peptrabio.com',
  currency TEXT DEFAULT 'INR',
  compliance_notice TEXT DEFAULT 'RESEARCH USE ONLY • ALL PEPTIDES ARE SOLD STRICTLY FOR IN VITRO LABORATORY RESEARCH',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISCOUNT CODES & PROMOTIONS TABLE
CREATE TABLE discount_codes (
  id TEXT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  applicable_payment VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (applicable_payment IN ('both', 'full', 'partial')),
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_product_code ON products(product_code);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_documents_product_id ON product_documents(product_id);
CREATE INDEX idx_product_references_product_id ON product_references(product_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_utr_number ON orders(utr_number);
CREATE INDEX idx_discount_codes_code ON discount_codes(UPPER(code));
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_verification_codes_code ON product_verification_codes(code);
CREATE INDEX idx_verification_codes_product_id ON product_verification_codes(product_id);
CREATE INDEX idx_verification_codes_batch_id ON product_verification_codes(batch_id);
CREATE INDEX idx_verification_scans_code_id ON product_verification_scans(verification_code_id);
CREATE INDEX idx_support_tickets_customer ON support_tickets(customer_email);
CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);

-- ==============================================================================
-- 5. ATOMIC VERIFICATION RPC FUNCTION (verify_product_code)
-- ==============================================================================
CREATE OR REPLACE FUNCTION verify_product_code(
  p_code TEXT,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized_code TEXT;
  v_code_rec RECORD;
  v_prod_rec RECORD;
  v_new_scan_number INTEGER;
  v_scans_remaining INTEGER;
BEGIN
  v_normalized_code := UPPER(TRIM(p_code));

  IF v_normalized_code IS NULL OR length(v_normalized_code) < 4 THEN
    RETURN jsonb_build_object(
      'status', 'invalid',
      'message', 'Please provide a valid research verification code.'
    );
  END IF;

  SELECT * INTO v_code_rec
  FROM product_verification_codes
  WHERE UPPER(code) = v_normalized_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'invalid',
      'message', 'We could not find this verification code. Please check the code printed on your product box and try again.'
    );
  END IF;

  IF v_code_rec.status = 'deactivated' THEN
    INSERT INTO product_verification_scans (
      verification_code_id, scan_number, ip_hash, user_agent, result
    ) VALUES (
      v_code_rec.id, v_code_rec.scan_count, p_ip_hash, p_user_agent, 'deactivated'
    );
    RETURN jsonb_build_object(
      'status', 'deactivated',
      'message', 'This verification code is currently inactive. Please contact support.'
    );
  END IF;

  IF v_code_rec.status = 'blocked' THEN
    INSERT INTO product_verification_scans (
      verification_code_id, scan_number, ip_hash, user_agent, result
    ) VALUES (
      v_code_rec.id, v_code_rec.scan_count, p_ip_hash, p_user_agent, 'blocked'
    );
    RETURN jsonb_build_object(
      'status', 'blocked',
      'message', 'This verification code is flagged and blocked due to excess scan anomalies.'
    );
  END IF;

  IF v_code_rec.scan_count >= v_code_rec.max_scans THEN
    INSERT INTO product_verification_scans (
      verification_code_id, scan_number, ip_hash, user_agent, result
    ) VALUES (
      v_code_rec.id, v_code_rec.scan_count + 1, p_ip_hash, p_user_agent, 'limit_reached'
    );
    RETURN jsonb_build_object(
      'status', 'limit_reached',
      'message', 'Scan limit reached for this authenticity tag. Max allowed scans: ' || v_code_rec.max_scans,
      'scan_count', v_code_rec.scan_count,
      'max_scans', v_code_rec.max_scans,
      'batch_number', v_code_rec.batch_number
    );
  END IF;

  v_new_scan_number := v_code_rec.scan_count + 1;
  UPDATE product_verification_codes
  SET scan_count = v_new_scan_number, updated_at = NOW()
  WHERE id = v_code_rec.id;

  INSERT INTO product_verification_scans (
    verification_code_id, scan_number, ip_hash, user_agent, result
  ) VALUES (
    v_code_rec.id, v_new_scan_number, p_ip_hash, p_user_agent, 'genuine'
  );

  SELECT * INTO v_prod_rec
  FROM products
  WHERE id = v_code_rec.product_id;

  v_scans_remaining := GREATEST(0, v_code_rec.max_scans - v_new_scan_number);

  RETURN jsonb_build_object(
    'status', 'genuine',
    'message', 'Authentic PEPTRA BIO Research Material Verified.',
    'code', v_code_rec.code,
    'batch_number', v_code_rec.batch_number,
    'serial_number', v_code_rec.serial_number,
    'scan_count', v_new_scan_number,
    'max_scans', v_code_rec.max_scans,
    'scans_remaining', v_scans_remaining,
    'product_name', COALESCE(v_prod_rec.name, 'Research Peptide Material'),
    'product_code', v_prod_rec.product_code,
    'purity', COALESCE(v_prod_rec.purity, '99%+ (HPLC)'),
    'storage', COALESCE(v_prod_rec.storage_information, 'Store at -20°C upon receipt.'),
    'first_verified_at', v_code_rec.created_at,
    'last_verified_at', NOW()
  );
END;
$$;

-- ==============================================================================
-- 6. STORAGE BUCKETS & PUBLIC POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('payment-proofs', 'payment-proofs', true),
  ('product-documents', 'product-documents', true),
  ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Storage Objects" ON storage.objects;
CREATE POLICY "Public Read Storage Objects"
ON storage.objects FOR SELECT
USING (bucket_id IN ('payment-proofs', 'product-documents', 'product-images'));

DROP POLICY IF EXISTS "Allow Upload of Storage Objects" ON storage.objects;
CREATE POLICY "Allow Upload of Storage Objects"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('payment-proofs', 'product-documents', 'product-images'));

DROP POLICY IF EXISTS "Allow Update of Storage Objects" ON storage.objects;
CREATE POLICY "Allow Update of Storage Objects"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('payment-proofs', 'product-documents', 'product-images'));

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- All tables configured with permissive policies for seamless frontend & API sync
-- ==============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_code_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_verification_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- CATEGORIES
CREATE POLICY "Allow all read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow all write on categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- PRODUCTS
CREATE POLICY "Allow all read on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow all write on products" ON products FOR ALL USING (true) WITH CHECK (true);

-- PRODUCT ASSETS
CREATE POLICY "Allow all read on product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow all write on product_images" ON product_images FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read on product_documents" ON product_documents FOR SELECT USING (true);
CREATE POLICY "Allow all write on product_documents" ON product_documents FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read on product_references" ON product_references FOR SELECT USING (true);
CREATE POLICY "Allow all write on product_references" ON product_references FOR ALL USING (true) WITH CHECK (true);

-- ORDERS & ORDER ITEMS
CREATE POLICY "Allow all read on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow all write on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read on order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow all write on order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- VERIFICATION SYSTEM
CREATE POLICY "Allow all on verification_code_batches" ON verification_code_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on product_verification_codes" ON product_verification_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on product_verification_scans" ON product_verification_scans FOR ALL USING (true) WITH CHECK (true);

-- SUPPORT SYSTEM
CREATE POLICY "Allow all on support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on support_ticket_messages" ON support_ticket_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on support_ticket_events" ON support_ticket_events FOR ALL USING (true) WITH CHECK (true);

-- ADMIN TABLES
CREATE POLICY "Allow all on admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on admin_audit_logs" ON admin_audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on admin_settings" ON admin_settings FOR ALL USING (true) WITH CHECK (true);

-- DISCOUNT CODES
CREATE POLICY "Allow all read on discount_codes" ON discount_codes FOR SELECT USING (true);
CREATE POLICY "Allow all write on discount_codes" ON discount_codes FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. COMPREHENSIVE SEED DATA INSERTION
-- ==============================================================================

-- CATEGORIES SEED DATA
INSERT INTO categories (id, name, slug, description, is_active) VALUES ('cat-1', 'Neuropeptides', 'neuropeptides', 'Synthesized neuropeptide sequences for cognitive, neurochemical, and neurological research models.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, is_active) VALUES ('cat-2', 'Cellular & Tissue Research', 'cellular-research', 'High-purity peptide analogues for cellular repair, extracellular matrix, and angiogenesis assays.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, is_active) VALUES ('cat-3', 'Longevity & Epigenetics', 'longevity-research', 'Research compounds evaluated in cellular senescence, telomerase activity, and chromatin assays.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, is_active) VALUES ('cat-4', 'Metabolic Peptides', 'metabolic-peptides', 'Mitochondrial-derived peptides, incretin mimetics, and metabolic signaling research sequences.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, is_active) VALUES ('cat-5', 'Reconstitution & Solvents', 'reconstitution-solvents', 'USP-grade sterile bacteriostatic water and reconstitution solutions for laboratory solvent formulation.', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, is_active) VALUES ('cat-6', 'Growth Hormone Secretagogues', 'growth-hormone-secretagogues', 'GHRH analogues, GHRPs, and selective growth hormone secretagogue peptides for endocrine research.', TRUE) ON CONFLICT (id) DO NOTHING;

-- PRODUCTS SEED DATA (29 Research Peptides)
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-bpc-157',
  'BPC-157',
  'bpc-157-5mg',
  $$BPC‑157 5 mg – Stable Gastric Pentadecapeptide Research Peptide$$,
  $$Product overview

BPC‑157 (Body Protection Compound‑157) is a synthetic pentadecapeptide composed of 15 amino acids, derived from a partial sequence of a protective protein found in human gastric juice.[web:120][web:128] It is studied in preclinical models for its cytoprotective, pro‑angiogenic, and tissue‑repair–related signalling effects in a range of organ systems.[web:113][web:114][web:138]

The BPC‑157 5 mg vial provides a defined amount of lyophilized peptide suitable for in‑vitro assays and in‑vivo animal studies where lower quantities or dose titration are required. This material is intended strictly for laboratory research and is not approved for human or veterinary use.[web:120][web:131]

Quick product snapshot

Field$$,
  'cat-2',
  'Cellular & Tissue Research',
  'PB-BPC-005',
  '137525-51-0',
  'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
  'C62H98N16O22',
  1419.53,
  '99.6% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  62,
  72,
  40,
  TRUE,
  TRUE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-bpc-157-5mg-vial', 'prod-bpc-157', '/images/products/bpc-157.jpg', 'BPC-157 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-bpc-157-5mg-box', 'prod-bpc-157', '/images/labelbox/bpc157.jpg', 'BPC-157 Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-bpc-157-5mg-coa', 'prod-bpc-157', 'Certificate of Analysis (Batch #PB-BPC-005-2025)', 'COA', '#coa', 'PB-BPC-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-bpc-157-5mg-sds', 'prod-bpc-157', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-BPC-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-bpc-157-5mg-1', 'prod-bpc-157', 'Analytical chromatography and mass spectrometric characterization of BPC-157', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-bpc157-tb500-blend',
  'BPC-157 (5mg) + TB-500 (5mg) Blend',
  'bpc-157-tb-500-blend-10mg',
  $$BPC‑157 (5 mg) + TB‑500 (5 mg) Blend – Dual Tissue-Repair Research Peptide$$,
  $$Product overview

The BPC‑157 + TB‑500 Blend combines two extensively studied synthetic peptides in a fixed 1:1 ratio, delivering 5 mg BPC‑157 and 5 mg TB‑500 per 10 mg lyophilized vial.[web:111][web:118] BPC‑157 is a stable 15‑amino‑acid fragment of a gastric protective protein, while TB‑500 is a synthetic heptapeptide corresponding to the N‑acetylated actin‑binding region of thymosin beta‑4.[web:111][web:115][web:118]

This pre‑formulated blend is used in preclinical research to explore complementary and potentially synergistic effects on tissue protection, soft‑tissue repair, angiogenesis, cell migration, and inflammatory pathway modulation.[web:113][web:116][web:119] The vial is supplied as a sterile, white to off‑white lyophilized powder with high purity verified by HPLC and identity confirmed by mass spectrometry.

This material is intended strictly for in‑vitro experiments and in‑vivo animal models in qualified laboratories and is not approved for human or veterinary use.

Quick product snapshot$$,
  'cat-2',
  'Cellular & Tissue Research',
  'PB-BLD-010',
  '137525-51-0 / 77591-33-4',
  'BPC-157 (15-AA) + Thymosin Beta-4 Domain (43-AA)',
  'C62H98N16O22 / C212H350N56O78S',
  '1419.6, 889',
  '99.4% (HPLC)',
  '10 mg Total (5mg + 5mg)',
  'Lyophilized Solid / Sealed Sterile Vial',
  118,
  135,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-bpc-157-tb-500-blend-10mg-vial', 'prod-bpc157-tb500-blend', '/images/products/bpc-157plustb-500.jpg', 'BPC-157 (5mg) + TB-500 (5mg) Blend 10 mg Total (5mg + 5mg) Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-bpc-157-tb-500-blend-10mg-box', 'prod-bpc157-tb500-blend', '/images/labelbox/bpc-157plustb-500.jpg', 'BPC-157 (5mg) + TB-500 (5mg) Blend Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-bpc-157-tb-500-blend-10mg-coa', 'prod-bpc157-tb500-blend', 'Certificate of Analysis (Batch #PB-BLD-010-2025)', 'COA', '#coa', 'PB-BLD-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-bpc-157-tb-500-blend-10mg-sds', 'prod-bpc157-tb500-blend', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-BLD-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-bpc-157-tb-500-blend-10mg-1', 'prod-bpc157-tb500-blend', 'Analytical chromatography and mass spectrometric characterization of BPC-157 (5mg) + TB-500 (5mg) Blend', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-bacteriostatic-water',
  'Bacteriostatic Water for Injection (0.9% Benzyl Alcohol)',
  'bacteriostatic-water-10ml',
  $$Bacteriostatic Water (10 mL, 0.9% Benzyl Alcohol) – Research‑Grade Reconstitution Solvent$$,
  $$Product overview

Bacteriostatic water is sterile, non‑pyrogenic water containing 0.9% benzyl alcohol as a preservative, supplied here in a 10 mL multi‑dose vial for laboratory use.[web:37][web:39] The benzyl alcohol component inhibits the growth of most contaminating bacteria, allowing the solution to remain usable for repeated withdrawals under proper aseptic technique for a defined in‑use period.[web:37][web:44]

In research environments, bacteriostatic water is widely used as a reconstitution and dilution medium for lyophilized peptides, proteins, and other experimental compounds, especially when multi‑dose access and contamination control are required.[web:37][web:48] This description is written specifically for a research‑only e‑commerce catalog and is not intended as medical or dosing guidance.

Quick product snapshot

Field$$,
  'cat-5',
  'Reconstitution & Solvents',
  'PB-BAC-010',
  '7732-18-5 / 100-51-6',
  'Sterile Filtered Aqueous Reconstitution Solvent',
  'H2O + C7H8O',
  18.02,
  'USP Grade / 0.9% Benzyl Alcohol',
  '10 mL',
  'Lyophilized Solid / Sealed Sterile Vial',
  14,
  18,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-bacteriostatic-water-10ml-vial', 'prod-bacteriostatic-water', '/images/products/bacteriostatic-water.jpg', 'Bacteriostatic Water for Injection (0.9% Benzyl Alcohol) 10 mL Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-bacteriostatic-water-10ml-box', 'prod-bacteriostatic-water', '/images/labelbox/bacteriostaticwater.jpg', 'Bacteriostatic Water for Injection (0.9% Benzyl Alcohol) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-bacteriostatic-water-10ml-coa', 'prod-bacteriostatic-water', 'Certificate of Analysis (Batch #PB-BAC-010-2025)', 'COA', '#coa', 'PB-BAC-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-bacteriostatic-water-10ml-sds', 'prod-bacteriostatic-water', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-BAC-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-bacteriostatic-water-10ml-1', 'prod-bacteriostatic-water', 'Analytical chromatography and mass spectrometric characterization of Bacteriostatic Water for Injection (0.9% Benzyl Alcohol)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-cjc-ipa-blend',
  'CJC-1295 (No DAC) + Ipamorelin Blend (10mg)',
  'cjc-1295-ipamorelin-blend-10mg',
  $$CJC‑1295 No DAC (5 mg) + Ipamorelin (5 mg) Blend – Growth Hormone Axis Research Peptide$$,
  $$Product overview

The CJC‑1295 No DAC + Ipamorelin Blend combines two growth hormone secretagogues in a fixed 1:1 ratio, delivering 5 mg CJC‑1295 (No DAC, Mod GRF 1‑29) and 5 mg Ipamorelin per 10 mg lyophilized vial.[web:143][web:154][web:157] CJC‑1295 (No DAC) is a 29‑amino‑acid analogue of growth hormone‑releasing hormone (GHRH 1‑29) with four stabilizing substitutions, while Ipamorelin is a synthetic pentapeptide ghrelin mimetic with the sequence Aib‑His‑D‑2‑Nal‑D‑Phe‑Lys‑NH₂.[web:143][web:144][web:150][web:155]

In preclinical systems, this dual‑peptide formulation is used to investigate synergistic growth hormone release via combined GHRH receptor activation and ghrelin receptor (GHS‑R1a) stimulation, as well as downstream IGF‑1 and metabolic signalling.[web:145][web:148][web:154] The blend is supplied as a sterile, white to off‑white lyophilized powder with high purity confirmed by HPLC and identity validated by mass spectrometry.[web:145][web:155]

This material is intended strictly for in‑vitro experiments and in‑vivo animal models in qualified laboratories. It is not approved for human or veterinary use.

Quick product snapshot$$,
  'cat-6',
  'Growth Hormone Secretagogues',
  'PB-BLD-IPA',
  '863288-34-0 / 170851-70-4',
  'Mod GRF 1-29 + Aib-His-D-2Nal-D-Phe-Lys-NH2',
  'C152H252N44O42 / C38H49N9O5',
  '3367.9, 711.9',
  '99.3% (HPLC)',
  '10 mg Total (5mg + 5mg)',
  'Lyophilized Solid / Sealed Sterile Vial',
  125,
  145,
  40,
  TRUE,
  TRUE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-cjc-1295-ipamorelin-blend-10mg-vial', 'prod-cjc-ipa-blend', '/images/products/cjc.jpg', 'CJC-1295 (No DAC) + Ipamorelin Blend (10mg) 10 mg Total (5mg + 5mg) Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-cjc-1295-ipamorelin-blend-10mg-box', 'prod-cjc-ipa-blend', '/images/labelbox/cjc.jpg', 'CJC-1295 (No DAC) + Ipamorelin Blend (10mg) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-cjc-1295-ipamorelin-blend-10mg-coa', 'prod-cjc-ipa-blend', 'Certificate of Analysis (Batch #PB-BLD-IPA-2025)', 'COA', '#coa', 'PB-BLD-IPA-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-cjc-1295-ipamorelin-blend-10mg-sds', 'prod-cjc-ipa-blend', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-BLD-IPA-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-cjc-1295-ipamorelin-blend-10mg-1', 'prod-cjc-ipa-blend', 'Analytical chromatography and mass spectrometric characterization of CJC-1295 (No DAC) + Ipamorelin Blend (10mg)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-cjc-1295-dac',
  'CJC-1295 DAC',
  'cjc-1295-dac-2mg',
  $$# CJC-1295 with DAC — GHRH Analog (Extended Half-Life)$$,
  $$**Research Grade | 99%+ Purity | Korean Manufactured | GMP Standards | Lyophilized Powder**

> ⚠️ **For In Vitro Laboratory Research Only.** Not for human or animal consumption. Not approved for therapeutic, diagnostic, or clinical use.

---

## What Is CJC-1295 with DAC?

CJC-1295 with DAC is a synthetic growth hormone releasing hormone (GHRH) analogue built from the first 29 amino acids of natural GHRH, with several amino acid substitutions for enhanced stability and receptor affinity, plus a chemical attachment called the Drug Affinity Complex (DAC) that fundamentally changes how long the peptide stays active in circulation.$$,
  'cat-6',
  'Growth Hormone Secretagogues',
  'PB-CJC-DAC',
  '863288-34-0',
  'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-Lys(Maleimidopropionyl)-NH2',
  'C165H271N47O46',
  3647.28,
  '99.1% (HPLC)',
  '2 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  58,
  68,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-cjc-1295-dac-2mg-vial', 'prod-cjc-1295-dac', '/images/products/cjc-1295-dac.jpg', 'CJC-1295 DAC 2 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-cjc-1295-dac-2mg-box', 'prod-cjc-1295-dac', '/images/labelbox/cjc-1295.jpg', 'CJC-1295 DAC Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-cjc-1295-dac-2mg-coa', 'prod-cjc-1295-dac', 'Certificate of Analysis (Batch #PB-CJC-DAC-2025)', 'COA', '#coa', 'PB-CJC-DAC-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-cjc-1295-dac-2mg-sds', 'prod-cjc-1295-dac', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-CJC-DAC-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-cjc-1295-dac-2mg-1', 'prod-cjc-1295-dac', 'Analytical chromatography and mass spectrometric characterization of CJC-1295 DAC', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-cjc-1295-no-dac',
  'CJC-1295 (No DAC / Mod GRF 1-29)',
  'cjc-1295-no-dac-2mg',
  $$# CJC-1295 (No DAC) – Mod GRF 1-29 (Research Grade)$$,
  $$## Product overview

CJC-1295 (No DAC), also known as Modified GRF 1‑29 or Mod GRF (1‑29), is a 29‑amino acid peptide analog based on the biologically active N‑terminal region of growth hormone‑releasing hormone (GHRH).[web:143][web:317][web:324] It incorporates four strategic amino acid substitutions that improve metabolic stability, increase receptor affinity, and protect the peptide from rapid degradation by enzymes such as DPP‑IV in research models.[web:143][web:322][web:324]

This product is supplied as a high‑purity lyophilised powder for in‑vitro experiments and approved preclinical animal studies only. It is not a drug, supplement, or cosmetic and is not approved for any form of human or veterinary administration.[web:317][web:321][web:323]

---

## Quick product snapshot$$,
  'cat-6',
  'Growth Hormone Secretagogues',
  'PB-CJC-NODAC',
  '863288-34-0',
  'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2',
  'C152H252N44O42',
  3367.97,
  '99.5% (HPLC)',
  '2 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  48,
  56,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-cjc-1295-no-dac-2mg-vial', 'prod-cjc-1295-no-dac', '/images/products/cjc-1295-no-dac.jpg', 'CJC-1295 (No DAC / Mod GRF 1-29) 2 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-cjc-1295-no-dac-2mg-box', 'prod-cjc-1295-no-dac', '/images/labelbox/cjc-1295-no-dac.jpg', 'CJC-1295 (No DAC / Mod GRF 1-29) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-cjc-1295-no-dac-2mg-coa', 'prod-cjc-1295-no-dac', 'Certificate of Analysis (Batch #PB-CJC-NODAC-2025)', 'COA', '#coa', 'PB-CJC-NODAC-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-cjc-1295-no-dac-2mg-sds', 'prod-cjc-1295-no-dac', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-CJC-NODAC-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-cjc-1295-no-dac-2mg-1', 'prod-cjc-1295-no-dac', 'Analytical chromatography and mass spectrometric characterization of CJC-1295 (No DAC / Mod GRF 1-29)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-aod-9604-5mg',
  'AOD-9604 (5mg)',
  'aod-9604-5mg',
  $$AOD-9604 5 mg – Modified C-Terminal Lipolytic Fragment (177-191)$$,
  $$Product overview

AOD-9604 is a synthetic peptide analog of the lipolytic C-terminal region of human growth hormone (Tyr-hGH 177-191) with an added N-terminal tyrosine residue to facilitate stability. In preclinical studies, it is investigated for stimulating lipolytic lipid metabolism, activating beta-3 adrenergic pathways, and inhibiting lipogenesis in adipocyte cell cultures without altering circulating IGF-1 or blood glucose levels.

Supplied as a sterile, white lyophilized powder with certified analytical purity verified by HPLC and exact mass confirmed by mass spectrometry.

This material is intended strictly for in-vitro experiments and approved laboratory research. It is not approved for human or veterinary use.

Quick product snapshot$$,
  'cat-4',
  'Metabolic Peptides',
  'PB-AOD-005',
  '221231-10-3',
  'Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe',
  'C78H123N23O23S2',
  1815.1,
  '99.3% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  58,
  68,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-aod-9604-5mg-vial', 'prod-aod-9604-5mg', '/images/products/aod-9604.jpg', 'AOD-9604 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-aod-9604-5mg-box', 'prod-aod-9604-5mg', '/images/labelbox/aod9604.jpg', 'AOD-9604 Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-aod-9604-5mg-coa', 'prod-aod-9604-5mg', 'Certificate of Analysis (Batch #PB-AOD-005-2025)', 'COA', '#coa', 'PB-AOD-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-aod-9604-5mg-sds', 'prod-aod-9604-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-AOD-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-aod-9604-5mg-1', 'prod-aod-9604-5mg', 'Analytical chromatography and mass spectrometric characterization of AOD-9604', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-epithalon-10mg',
  'Epithalon (Epitalon)',
  'epithalon-10mg',
  $$Epithalon (Epitalon) 10 mg – Synthetic Tetrapeptide Research Peptide$$,
  $$Product overview

Epithalon (also spelled Epitalon) is a synthetic tetrapeptide with the amino acid sequence Ala‑Glu‑Asp‑Gly, developed as a research analog of a pineal gland extract known as epithalamin.[web:54][web:60] The peptide is investigated primarily for its ability to modulate telomerase activity, influence telomere length, and affect cellular aging pathways in controlled experimental systems.[web:54][web:63]

This 10 mg format provides a standardized lyophilized preparation intended exclusively for in‑vitro and preclinical research. It is not approved for therapeutic use and is not supplied for human or veterinary administration.

Quick product snapshot

Field$$,
  'cat-3',
  'Longevity & Epigenetics',
  'PB-EPI-010',
  '307297-39-8',
  'Ala-Glu-Asp-Gly',
  'C14H22N4O9',
  390.35,
  '99.7% (HPLC)',
  '10 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  65,
  75,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-epithalon-10mg-vial', 'prod-epithalon-10mg', '/images/products/epithalon.jpg', 'Epithalon (Epitalon) 10 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-epithalon-10mg-box', 'prod-epithalon-10mg', '/images/labelbox/epithalon.jpg', 'Epithalon (Epitalon) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-epithalon-10mg-coa', 'prod-epithalon-10mg', 'Certificate of Analysis (Batch #PB-EPI-010-2025)', 'COA', '#coa', 'PB-EPI-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-epithalon-10mg-sds', 'prod-epithalon-10mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-EPI-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-epithalon-10mg-1', 'prod-epithalon-10mg', 'Analytical chromatography and mass spectrometric characterization of Epithalon (Epitalon)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-ghk-cu-50mg',
  'GHK-Cu (Copper Tripeptide Chelate)',
  'ghk-cu-50mg',
  $$# GHK-Cu Copper Peptide (50mg) — Product Page$$,
  $$---

## Product Title
**GHK-Cu Copper Peptide (50mg) | 99%+ Purity | Korean Manufactured | Research Use Only**

---

## Short Intro

GHK-Cu is a tripeptide-copper complex that occurs naturally in human blood, saliva, and urine. Made up of just three amino acids — Glycine, Histidine, and Lysine — it binds tightly to copper ions to form a stable complex that plays a meaningful role in how the body manages tissue repair, inflammation, and cellular maintenance. Plasma levels of GHK-Cu are highest in youth and drop steadily with age, which has made it a subject of growing interest in aging and regenerative research.$$,
  'cat-2',
  'Cellular & Tissue Research',
  'PB-GHK-050',
  '49557-75-7',
  '(Gly-His-Lys)2·Cu',
  'C14H24CuN6O4',
  403.92,
  '99.5% (HPLC)',
  '50 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  58,
  68,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-ghk-cu-50mg-vial', 'prod-ghk-cu-50mg', '/images/products/ghk-cu.jpg', 'GHK-Cu (Copper Tripeptide Chelate) 50 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-ghk-cu-50mg-box', 'prod-ghk-cu-50mg', '/images/labelbox/ghk-cu.jpg', 'GHK-Cu (Copper Tripeptide Chelate) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-ghk-cu-50mg-coa', 'prod-ghk-cu-50mg', 'Certificate of Analysis (Batch #PB-GHK-050-2025)', 'COA', '#coa', 'PB-GHK-050-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-ghk-cu-50mg-sds', 'prod-ghk-cu-50mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-GHK-050-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-ghk-cu-50mg-1', 'prod-ghk-cu-50mg', 'Analytical chromatography and mass spectrometric characterization of GHK-Cu (Copper Tripeptide Chelate)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-ghrp-6-5mg',
  'GHRP-6 (Growth Hormone Releasing Peptide-6)',
  'ghrp-6-5mg',
  $$# GHRP-6 – Growth Hormone Releasing Peptide (Research Grade)$$,
  $$## Product overview

GHRP-6 is a synthetic hexapeptide used in laboratory research to study growth hormone secretagogue biology and ghrelin receptor signalling.[web:272][web:277][web:278] It acts as a GHSR-1a agonist and is commonly used in in-vitro systems and approved preclinical models to examine hormone release, appetite-related signalling, and tissue-protection pathways.[web:275][web:278][web:281]

This product is supplied strictly for research use only. It is not intended for human or veterinary use, dietary supplementation, or any therapeutic, cosmetic, or diagnostic purpose.[web:274][web:276][web:279]

---

## Quick product snapshot$$,
  'cat-6',
  'Growth Hormone Secretagogues',
  'PB-GHRP6-005',
  '87616-84-0',
  'His-D-Trp-Ala-Trp-D-Phe-Lys-NH2',
  'C46H56N12O6',
  872.44,
  '99.2% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  46,
  54,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-ghrp-6-5mg-vial', 'prod-ghrp-6-5mg', '/images/products/ghrp-6.jpg', 'GHRP-6 (Growth Hormone Releasing Peptide-6) 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-ghrp-6-5mg-box', 'prod-ghrp-6-5mg', '/images/labelbox/ghrp-6.jpg', 'GHRP-6 (Growth Hormone Releasing Peptide-6) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-ghrp-6-5mg-coa', 'prod-ghrp-6-5mg', 'Certificate of Analysis (Batch #PB-GHRP6-005-2025)', 'COA', '#coa', 'PB-GHRP6-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-ghrp-6-5mg-sds', 'prod-ghrp-6-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-GHRP6-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-ghrp-6-5mg-1', 'prod-ghrp-6-5mg', 'Analytical chromatography and mass spectrometric characterization of GHRP-6 (Growth Hormone Releasing Peptide-6)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-glutathione-600mg',
  'L-Glutathione (Reduced / GSH)',
  'l-glutathione-600mg',
  $$L‑Glutathione 600 mg (10 mL) – Reduced γ‑Glu‑Cys‑Gly Antioxidant Tripeptide (Research Grade)$$,
  $$Product overview

L‑Glutathione 600 mg is a pure, lyophilised preparation of reduced glutathione (GSH), the naturally occurring tripeptide γ‑L‑glutamyl‑L‑cysteinyl‑glycine.[web:253][web:256][web:259] GSH is the predominant low‑molecular‑weight thiol in mammalian cells and functions as a central intracellular antioxidant and redox buffer in a wide range of biological systems.[web:253][web:256][web:265]

This 600 mg vial size is designed for redox biology, detoxification, and oxidative‑stress research in in‑vitro assays, cell culture work, and small‑animal models, where multiple experiments can be supported from a single vial. The product is supplied strictly for laboratory research use and is not intended for human or veterinary consumption, therapeutic use, or cosmetic application.[web:257][web:258][web:267]

Quick product snapshot

Field$$,
  'cat-2',
  'Cellular & Tissue Research',
  'PB-GSH-600',
  '70-18-8',
  'gamma-L-Glutamyl-L-cysteinylglycine',
  'C10H17N3O6S',
  307.3,
  '99.8% (HPLC)',
  '600 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  42,
  50,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-l-glutathione-600mg-vial', 'prod-glutathione-600mg', '/images/products/l-glutathione.jpg', 'L-Glutathione (Reduced / GSH) 600 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-l-glutathione-600mg-box', 'prod-glutathione-600mg', '/images/labelbox/l-gluatione.jpg', 'L-Glutathione (Reduced / GSH) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-l-glutathione-600mg-coa', 'prod-glutathione-600mg', 'Certificate of Analysis (Batch #PB-GSH-600-2025)', 'COA', '#coa', 'PB-GSH-600-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-l-glutathione-600mg-sds', 'prod-glutathione-600mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-GSH-600-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-l-glutathione-600mg-1', 'prod-glutathione-600mg', 'Analytical chromatography and mass spectrometric characterization of L-Glutathione (Reduced / GSH)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-hgh-frag-2mg',
  'HGH Fragment 176-191 (AOD-9604)',
  'hgh-fragment-176-191-2mg',
  $$# Fragment 176-191 (10mg)$$,
  $$Fragment 176-191 is a synthetic peptide representing the C-terminal portion of human growth hormone (hGH), often called the "lipolytic fragment." It is studied for its potential to influence fat metabolism while avoiding some of the broader effects of full hGH.

**Don't forget your BAC Water**  
Reconstitution Solution (30ml) (BAC Water)

## What is Fragment 176-191?
Fragment 176-191 is a small piece of hGH that has been heavily researched in animal models, particularly for its fat-burning properties. Lab studies in mice have shown it can enhance fat breakdown without raising insulin-like growth factor-1 (IGF-1) levels or affecting carbohydrate metabolism and insulin sensitivity like full hGH does [web:65][web:66]. This targeted profile makes it useful for exploring fat metabolism and could inform future anti-obesity research.

## Peptide Information
| Property | Value |
|----------|-------|
| Sequence | Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe |
| Molecular Formula | C78H125N23O23S2 |
| Molecular Weight | 1817.12 g/mol |
| CAS Number | 66004-57-7 |

## Research Highlights
Research has explored Fragment 176-191 in several areas:$$,
  'cat-4',
  'Metabolic Peptides',
  'PB-FRG-002',
  '221231-10-3',
  'Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe',
  'C78H125N23O23S2',
  1815.1,
  '99.1% (HPLC)',
  '2 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  49,
  58,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-hgh-fragment-176-191-2mg-vial', 'prod-hgh-frag-2mg', '/images/products/hgh-fragment.jpg', 'HGH Fragment 176-191 (AOD-9604) 2 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-hgh-fragment-176-191-2mg-box', 'prod-hgh-frag-2mg', '/images/labelbox/high-fragment-176-191.jpg', 'HGH Fragment 176-191 (AOD-9604) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-hgh-fragment-176-191-2mg-coa', 'prod-hgh-frag-2mg', 'Certificate of Analysis (Batch #PB-FRG-002-2025)', 'COA', '#coa', 'PB-FRG-002-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-hgh-fragment-176-191-2mg-sds', 'prod-hgh-frag-2mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-FRG-002-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-hgh-fragment-176-191-2mg-1', 'prod-hgh-frag-2mg', 'Analytical chromatography and mass spectrometric characterization of HGH Fragment 176-191 (AOD-9604)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-hgh-191aa-10iu',
  'HGH 191 (10 IU)',
  'hgh-191-10iu',
  $$HGH 191 (10 IU) – Recombinant Human Growth Hormone (191-AA)$$,
  $$Product overview

Human Growth Hormone (HGH 191) is a 191-amino acid single-chain recombinant polypeptide matching the exact structure and sequence of natural pituitary human growth hormone. As a master metabolic and somatotropic regulator, recombinant HGH binds with high affinity to extracellular growth hormone receptors (GHR), activating intracellular JAK2/STAT5 signaling cascades and stimulating downstream hepatic synthesis and secretion of insulin-like growth factor 1 (IGF-1).

In preclinical biomedical research, recombinant HGH 191 is utilized to explore somatotrophic signaling, lipid mobilization, chondrocyte proliferation, skeletal muscle protein turnover, and cellular aging mechanisms. Supplied as a sterile, white lyophilized solid powder with certified analytical purity (≥99%) verified by SEC-HPLC and exact molecular identity confirmed by mass spectrometry.

This material is intended strictly for in-vitro experiments and approved laboratory research. It is not approved for human or veterinary use.

Quick product snapshot$$,
  'cat-6',
  'Growth Hormone Secretagogues',
  'PB-HGH-010',
  '12629-01-5',
  '191 Amino Acid Recombinant Polypeptide Sequence',
  'C990H1528N262O300S7',
  22124,
  '99.0% (SEC-HPLC)',
  '10 IU',
  'Lyophilized Solid / Sealed Sterile Vial',
  95,
  110,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-hgh-191aa-10iu-vial', 'prod-hgh-191aa-10iu', '/images/products/hgh-191.jpg', 'HGH 191 (10 IU) Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-hgh-191aa-10iu-box', 'prod-hgh-191aa-10iu', '/images/labelbox/hgh-191.jpg', 'HGH 191 Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-hgh-191aa-10iu-coa', 'prod-hgh-191aa-10iu', 'Certificate of Analysis (Batch #PB-HGH-010-2025)', 'COA', '#coa', 'PB-HGH-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-hgh-191aa-10iu-sds', 'prod-hgh-191aa-10iu', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-HGH-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-hgh-191aa-10iu-1', 'prod-hgh-191aa-10iu', 'Analytical chromatography and mass spectrometric characterization of HGH 191 (Recombinant Human Growth Hormone)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-igf1-lr3-1mg',
  'IGF-1 LR3 (Long R3 IGF-1)',
  'igf-1-lr3-1mg',
  $$IGF‑1 LR3 1 mg – Long Arg3 Insulin‑Like Growth Factor‑1 (Research Grade Analogue)$$,
  $$Product overview

IGF‑1 LR3 (Long Arg3 Insulin‑Like Growth Factor‑1) is a recombinant analogue of human insulin‑like growth factor‑1 engineered for increased metabolic stability and extended receptor engagement in controlled research models.[web:236][web:237][web:240] The LR3 variant incorporates a 13‑amino‑acid N‑terminal extension and a glutamic‑acid‑to‑arginine substitution at position 3, changes that markedly reduce binding to IGF‑binding proteins while preserving high‑affinity activation of the IGF‑1 receptor (IGF‑1R).[web:236][web:239][web:248]

Researchers use IGF‑1 LR3 to study IGF‑1R‑mediated signalling in cell growth, protein synthesis, metabolism, and tissue‑repair pathways in vitro and in preclinical animal models. It is supplied strictly as a research peptide and is not formulated or approved for human or veterinary use, therapeutic applications, or dietary supplementation.[web:237][web:239][web:248]

Quick product snapshot

Field$$,
  'cat-2',
  'Cellular & Tissue Research',
  'PB-IGF-001',
  '946870-92-4',
  '83 Amino Acid Recombinant Polypeptide with Arg3 Substitution and 13-AA N-terminal Extension',
  'C400H625N111O115S9',
  9117.6,
  '99.2% (HPLC)',
  '1 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  85,
  98,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-igf-1-lr3-1mg-vial', 'prod-igf1-lr3-1mg', '/images/products/igf-1-lr3.jpg', 'IGF-1 LR3 (Long R3 IGF-1) 1 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-igf-1-lr3-1mg-box', 'prod-igf1-lr3-1mg', '/images/labelbox/igf-1-lr3.jpg', 'IGF-1 LR3 (Long R3 IGF-1) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-igf-1-lr3-1mg-coa', 'prod-igf1-lr3-1mg', 'Certificate of Analysis (Batch #PB-IGF-001-2025)', 'COA', '#coa', 'PB-IGF-001-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-igf-1-lr3-1mg-sds', 'prod-igf1-lr3-1mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-IGF-001-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-igf-1-lr3-1mg-1', 'prod-igf1-lr3-1mg', 'Analytical chromatography and mass spectrometric characterization of IGF-1 LR3 (Long R3 IGF-1)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-ipamorelin-5mg',
  'Ipamorelin',
  'ipamorelin-5mg',
  $$Ipamorelin (10 mg) – Selective Growth Hormone Secretagogue (GHSR Agonist) Research Peptide$$,
  $$Product overview

Ipamorelin is a synthetic pentapeptide designed as a highly selective growth hormone secretagogue that targets the ghrelin (GHSR‑1a) receptor in laboratory models.[conversation_history:1] In contrast to earlier growth hormone–releasing peptides (GHRPs) such as GHRP‑2 and GHRP‑6, ipamorelin was engineered to stimulate robust growth hormone (GH) release while minimizing activation of other pituitary axes, including ACTH/cortisol and prolactin pathways.[conversation_history:1]

Because of this selectivity profile, ipamorelin has become a widely used research tool for studying GH secretion dynamics, ghrelin‑receptor pharmacology, and downstream metabolic and tissue‑repair pathways in controlled experimental systems.[conversation_history:1] This description is intended for research‑focused e‑commerce use and is not a guide for clinical or non‑laboratory applications.

Quick product snapshot

Field$$,
  'cat-6',
  'Growth Hormone Secretagogues',
  'PB-IPA-005',
  '170851-70-4',
  'Aib-His-D-2Nal-D-Phe-Lys-NH2',
  'C38H49N9O5',
  711.9,
  '99.5% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  54,
  62,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-ipamorelin-5mg-vial', 'prod-ipamorelin-5mg', '/images/products/ipamorelin.jpg', 'Ipamorelin 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-ipamorelin-5mg-box', 'prod-ipamorelin-5mg', '/images/labelbox/ipamorelin.jpg', 'Ipamorelin Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-ipamorelin-5mg-coa', 'prod-ipamorelin-5mg', 'Certificate of Analysis (Batch #PB-IPA-005-2025)', 'COA', '#coa', 'PB-IPA-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-ipamorelin-5mg-sds', 'prod-ipamorelin-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-IPA-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-ipamorelin-5mg-1', 'prod-ipamorelin-5mg', 'Analytical chromatography and mass spectrometric characterization of Ipamorelin', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-kpv-5mg',
  'KPV (alpha-MSH 11-13 Tripeptide)',
  'kpv-5mg',
  $$KPV 10 mg – α‑MSH‑Derived Anti‑Inflammatory Tripeptide (Research Grade)$$,
  $$Product overview

KPV (Lys‑Pro‑Val) is a synthetic tripeptide corresponding to the C‑terminal fragment (positions 11–13) of α‑melanocyte‑stimulating hormone (α‑MSH).[web:219][web:220][web:223] This ultra‑short sequence has been widely studied for its ability to reproduce many of α‑MSH’s anti‑inflammatory and tissue‑protective effects while operating largely through melanocortin‑receptor‑independent mechanisms in experimental systems.[web:222][web:225][web:228]

In preclinical models, KPV has been investigated as a tool compound for probing NF‑κB and MAPK signalling, epithelial and mucosal barrier responses, wound‑healing dynamics, and antimicrobial peptide‑like activity under controlled laboratory conditions.[web:221][web:222][web:227] KPV 10 mg is supplied as a lyophilised research peptide designed for in‑vitro work and approved preclinical animal studies and is not formulated or approved for human or veterinary use.

Quick product snapshot

Field$$,
  'cat-2',
  'Cellular & Tissue Research',
  'PB-KPV-005',
  '67727-97-3',
  'Lys-Pro-Val',
  'C16H31N5O4',
  342.4,
  '99.4% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  49,
  58,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-kpv-5mg-vial', 'prod-kpv-5mg', '/images/products/kpv.jpg', 'KPV (alpha-MSH 11-13 Tripeptide) 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-kpv-5mg-box', 'prod-kpv-5mg', '/images/labelbox/kpv.jpg', 'KPV (alpha-MSH 11-13 Tripeptide) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-kpv-5mg-coa', 'prod-kpv-5mg', 'Certificate of Analysis (Batch #PB-KPV-005-2025)', 'COA', '#coa', 'PB-KPV-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-kpv-5mg-sds', 'prod-kpv-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-KPV-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-kpv-5mg-1', 'prod-kpv-5mg', 'Analytical chromatography and mass spectrometric characterization of KPV (alpha-MSH 11-13 Tripeptide)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-kisspeptin-10-5mg',
  'Kisspeptin-10 (KP-10)',
  'kisspeptin-10-5mg',
  $$# Kisspeptin-10 (10mg) - Complete Product Page$$,
  $$## Product Overview & Summary

### Kisspeptin-10 (10mg) – Research-Grade Peptide Solution

Kisspeptin-10 represents a breakthrough tool for modern laboratory research, offering scientists a direct pathway to understanding reproductive regulation and broader neuroendocrine mechanisms. This synthetic peptide fragment—comprising just ten amino acids—delivers the complete biological activity of larger kisspeptin molecules, making it both efficient and cost-effective for your research endeavors.

At its core, kisspeptin-10 functions as a precise molecular key, unlocking KISS1R receptors throughout the body. Unlike many research chemicals that require complex preparation, our formulation arrives ready for integration into your existing protocols. The peptide maintains remarkable stability when stored properly, preserving its potency across multiple experimental cycles.

What sets this product apart is its versatility. Whether your laboratory focuses on reproductive biology, cancer research, neuroprotection studies, or cardiovascular investigations, kisspeptin-10 provides reliable, consistent results. The ten-amino acid structure (Tyr-Asn-Trp-Asn-Ser-Phe-Gly-Leu-Arg-Phe-NH2) contains every essential element needed for receptor binding, eliminating unnecessary bulk while maximizing research value.$$,
  'cat-1',
  'Neuropeptides',
  'PB-KSP-005',
  '374675-21-5',
  'Tyr-Asn-Trp-Asn-Ser-Phe-Gly-Leu-Arg-Phe-NH2',
  'C63H83N17O14',
  1302.5,
  '99.3% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  64,
  74,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-kisspeptin-10-5mg-vial', 'prod-kisspeptin-10-5mg', '/images/products/kisspeptin-10.jpg', 'Kisspeptin-10 (KP-10) 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-kisspeptin-10-5mg-box', 'prod-kisspeptin-10-5mg', '/images/labelbox/kisspeptin.jpg', 'Kisspeptin-10 (KP-10) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-kisspeptin-10-5mg-coa', 'prod-kisspeptin-10-5mg', 'Certificate of Analysis (Batch #PB-KSP-005-2025)', 'COA', '#coa', 'PB-KSP-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-kisspeptin-10-5mg-sds', 'prod-kisspeptin-10-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-KSP-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-kisspeptin-10-5mg-1', 'prod-kisspeptin-10-5mg', 'Analytical chromatography and mass spectrometric characterization of Kisspeptin-10 (KP-10)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-l-carnitine-600mg',
  'L-Carnitine (Injectable Grade Compound)',
  'l-carnitine-600mg',
  $$L‑Carnitine 600 mg – Fatty Acid Transport and Mitochondrial Metabolism Research Grade Compound$$,
  $$Product overview

L‑Carnitine is a naturally occurring quaternary ammonium compound (β‑hydroxy‑γ‑N‑trimethylaminobutyric acid) biosynthesised from lysine and methionine and present in most mammalian tissues.[web:202][web:205][web:211] As a zwitterionic small molecule, it plays a central role in mitochondrial fatty acid β‑oxidation by enabling long‑chain acyl‑CoA esters to cross the inner mitochondrial membrane via the carnitine shuttle system (CPT I, carnitine–acylcarnitine translocase, CPT II).[web:203][web:206][web:212]

The L‑Carnitine 600 mg format provides a versatile quantity of high‑purity crystalline material suitable for studies of energy metabolism, lipid utilisation, mitochondrial function, oxidative stress, and age‑related metabolic decline in cell culture, isolated organ preparations, and small‑animal models. This material is intended strictly for laboratory research use and is not approved for human or veterinary consumption.

Quick product snapshot

Field$$,
  'cat-4',
  'Metabolic Peptides',
  'PB-LCR-600',
  '541-15-1',
  '(R)-(3-Carboxy-2-hydroxypropyl)trimethylammonium hydroxide inner salt',
  'C7H15NO3',
  161.2,
  '99.9% (HPLC)',
  '600 mg / 10 mL',
  'Lyophilized Solid / Sealed Sterile Vial',
  39,
  48,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-l-carnitine-600mg-vial', 'prod-l-carnitine-600mg', '/images/products/l-carnitine.jpg', 'L-Carnitine (Injectable Grade Compound) 600 mg / 10 mL Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-l-carnitine-600mg-box', 'prod-l-carnitine-600mg', '/images/labelbox/l-carnitine.jpg', 'L-Carnitine (Injectable Grade Compound) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-l-carnitine-600mg-coa', 'prod-l-carnitine-600mg', 'Certificate of Analysis (Batch #PB-LCR-600-2025)', 'COA', '#coa', 'PB-LCR-600-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-l-carnitine-600mg-sds', 'prod-l-carnitine-600mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-LCR-600-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-l-carnitine-600mg-1', 'prod-l-carnitine-600mg', 'Analytical chromatography and mass spectrometric characterization of L-Carnitine (Injectable Grade Compound)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-mots-c-10mg',
  'MOTS-c (Mitochondrial-Derived Peptide)',
  'mots-c-10mg',
  $$MOTS-c (10 mg) – Research Peptide Product Description$$,
  $$Product overview

MOTS-c is a short, 16–amino acid peptide encoded in the mitochondrial 12S rRNA gene, classed in the literature as a mitochondrial‑derived peptide (MDP).[file:23] It is widely used as a research tool to explore how mitochondria communicate with the rest of the cell, how cells sense energy stress, and how metabolic pathways adapt in models of obesity, insulin resistance, exercise, and aging.[file:23] This 10 mg MOTS‑c vial is offered as a high‑purity research material for qualified laboratories that require a consistent, well‑documented peptide for in‑vitro and preclinical work.

This page is written for an e‑commerce setting, but all information relates to laboratory research only. No part of this description should be interpreted as medical or therapeutic guidance.

Quick product snapshot

Field$$,
  'cat-4',
  'Metabolic Peptides',
  'PB-MOT-010',
  '1627580-64-6',
  'Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg',
  'C101H152N28O22S2',
  2174.6,
  '99.0% (HPLC)',
  '10 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  95,
  110,
  40,
  TRUE,
  TRUE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-mots-c-10mg-vial', 'prod-mots-c-10mg', '/images/products/mots-c.jpg', 'MOTS-c (Mitochondrial-Derived Peptide) 10 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-mots-c-10mg-box', 'prod-mots-c-10mg', '/images/labelbox/mots-c.jpg', 'MOTS-c (Mitochondrial-Derived Peptide) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-mots-c-10mg-coa', 'prod-mots-c-10mg', 'Certificate of Analysis (Batch #PB-MOT-010-2025)', 'COA', '#coa', 'PB-MOT-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-mots-c-10mg-sds', 'prod-mots-c-10mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-MOT-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-mots-c-10mg-1', 'prod-mots-c-10mg', 'Analytical chromatography and mass spectrometric characterization of MOTS-c (Mitochondrial-Derived Peptide)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-nad-plus-500mg',
  'NAD+ (Nicotinamide Adenine Dinucleotide)',
  'nad-plus-500mg',
  $$NAD⁺ 500 mg – Nicotinamide Adenine Dinucleotide Research Grade Coenzyme$$,
  $$Product overview

Nicotinamide adenine dinucleotide (NAD⁺) is an oxidized dinucleotide coenzyme present in all living cells and central to cellular metabolism.[web:180][web:186][web:189] It cycles between oxidized (NAD⁺) and reduced (NADH) states to support redox reactions in glycolysis, the tricarboxylic acid (TCA) cycle, β‑oxidation, and oxidative phosphorylation.[web:180][web:186][web:192] Beyond its classical electron‑carrier role, NAD⁺ serves as a consumable substrate for multiple enzyme families including sirtuins, PARPs, and CD38/CD157, linking cellular energy status to gene regulation, DNA repair, and stress‑response pathways.[web:184][web:187][web:190]

The NAD⁺ 500 mg presentation provides a high‑capacity vial of research‑grade, lyophilized coenzyme suitable for metabolic, mitochondrial, aging, and disease‑mechanism studies that require repeated dosing or large experimental cohorts. This material is intended strictly for in‑vitro use and preclinical animal research and is not approved for human consumption or therapeutic application.[web:182][web:183][web:194]

Quick product snapshot

Field$$,
  'cat-3',
  'Longevity & Epigenetics',
  'PB-NAD-500',
  '53-84-9',
  'beta-Nicotinamide Adenine Dinucleotide Hydrate',
  'C21H27N7O14P2',
  663.43,
  '99.6% (HPLC)',
  '500 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  89,
  105,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-nad-plus-500mg-vial', 'prod-nad-plus-500mg', '/images/products/nadplus.jpg', 'NAD+ (Nicotinamide Adenine Dinucleotide) 500 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-nad-plus-500mg-box', 'prod-nad-plus-500mg', '/images/labelbox/nadplus.jpg', 'NAD+ (Nicotinamide Adenine Dinucleotide) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-nad-plus-500mg-coa', 'prod-nad-plus-500mg', 'Certificate of Analysis (Batch #PB-NAD-500-2025)', 'COA', '#coa', 'PB-NAD-500-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-nad-plus-500mg-sds', 'prod-nad-plus-500mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-NAD-500-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-nad-plus-500mg-1', 'prod-nad-plus-500mg', 'Analytical chromatography and mass spectrometric characterization of NAD+ (Nicotinamide Adenine Dinucleotide)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-peg-mgf-2mg',
  'PEG-MGF (Pegylated Mechano Growth Factor)',
  'peg-mgf-2mg',
  $$# PEG-MGF (Pegylated Mechano Growth Factor) — Product Overview$$,
  $$**PEG-MGF** is a stabilized research peptide designed to support advanced studies in muscle growth and regeneration. Derived from mechano growth factor—a muscle-specific splice variant of IGF-1—PEG-MGF achieves a much longer circulation time through pegylation. This technique attaches a polyethylene glycol (PEG) group to the natural peptide sequence, increasing half-life, reducing breakdown, and enabling convenient systemic investigation.

**Native MGF** is created by muscle under stress to stimulate stem cell activation and tissue repair, but its lifespan in the body is only minutes. PEG-MGF overcomes this limitation, remaining bioactive in circulation for 48–72 hours, and lets researchers study muscle, cardiac, neural, and bone repair in much greater detail.

---

## Potential Benefits* (Research Focus Only)
- Supports muscle fiber repair and growth studies  
- Accelerates recovery in injury models  
- Investigates bone and cartilage regeneration  
- Allows for cardiac and neuroprotection exploration  
- Serves in age-related muscle loss research  
- Examines systemic vs. localized tissue effects

> *For laboratory and preclinical research only. Not for human or clinical use.$$,
  'cat-2',
  'Cellular & Tissue Research',
  'PB-MGF-002',
  '918074-21-6',
  'Tyr-Gln-Pro-Pro-Ser-Thr-Asn-Lys-Asn-Thr-Lys-Ser-Gln-Arg-Arg-Lys-Gly-Ser-Thr-Phe-Glu-Glu-His-Lys-PEG',
  'C121H200N42O39 (pep base) + PEG',
  2867,
  '99.1% (HPLC)',
  '2 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  69,
  79,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-peg-mgf-2mg-vial', 'prod-peg-mgf-2mg', '/images/products/peg-mgf.jpg', 'PEG-MGF (Pegylated Mechano Growth Factor) 2 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-peg-mgf-2mg-box', 'prod-peg-mgf-2mg', '/images/labelbox/peg-mgf.jpg', 'PEG-MGF (Pegylated Mechano Growth Factor) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-peg-mgf-2mg-coa', 'prod-peg-mgf-2mg', 'Certificate of Analysis (Batch #PB-MGF-002-2025)', 'COA', '#coa', 'PB-MGF-002-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-peg-mgf-2mg-sds', 'prod-peg-mgf-2mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-MGF-002-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-peg-mgf-2mg-1', 'prod-peg-mgf-2mg', 'Analytical chromatography and mass spectrometric characterization of PEG-MGF (Pegylated Mechano Growth Factor)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-pt-141-5mg',
  'PT-141 (Bremelanotide)',
  'pt-141-bremelanotide-5mg',
  $$PT‑141 5 mg – Melanocortin Receptor Agonist Research Peptide$$,
  $$Product overview

PT‑141 (bremelanotide) is a synthetic cyclic heptapeptide derived from the melanocortin analogue α‑MSH and structurally related to melanotan II.[web:161][web:164][web:170] It acts as a melanocortin receptor agonist with primary activity at MC3R and MC4R in the central nervous system, making it a useful tool for studying melanocortin‑mediated signalling, neuroendocrine regulation, and sexual‑function pathways in preclinical models.[web:161][web:163][web:167]

The PT‑141 5 mg presentation provides a defined amount of lyophilized peptide suitable for in‑vitro assays and in‑vivo animal studies where moderate quantities and fine dose‑response work are required. This material is intended strictly for laboratory research and is not approved for human or veterinary use.[web:163][web:166][web:170]

Quick product snapshot

Field$$,
  'cat-1',
  'Neuropeptides',
  'PB-PT141-005',
  '189745-98-8',
  'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH',
  'C50H68N14O10',
  1025.2,
  '99.5% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  58,
  68,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-pt-141-bremelanotide-5mg-vial', 'prod-pt-141-5mg', '/images/products/pt-141.jpg', 'PT-141 (Bremelanotide) 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-pt-141-bremelanotide-5mg-box', 'prod-pt-141-5mg', '/images/labelbox/pt-141.jpg', 'PT-141 (Bremelanotide) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-pt-141-bremelanotide-5mg-coa', 'prod-pt-141-5mg', 'Certificate of Analysis (Batch #PB-PT141-005-2025)', 'COA', '#coa', 'PB-PT141-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-pt-141-bremelanotide-5mg-sds', 'prod-pt-141-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-PT141-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-pt-141-bremelanotide-5mg-1', 'prod-pt-141-5mg', 'Analytical chromatography and mass spectrometric characterization of PT-141 (Bremelanotide)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-retatrutide-10mg',
  'Retatrutide (GIP/GLP-1/Glucagon Triple Agonist)',
  'retatrutide-10mg',
  $$Retatrutide (10 mg) – Triple Incretin Receptor Agonist Research Peptide$$,
  $$Product overview

Retatrutide (also referred to in some research materials as LY3437943 or "Reta") is an investigational synthetic peptide designed as a balanced triple agonist at the GLP‑1, GIP, and glucagon receptors.[conversation_history:1] In laboratory and clinical research models, this multi‑pathway profile is used to study energy balance, body‑weight regulation, glucose homeostasis, and liver fat metabolism.[conversation_history:1]

This description is written for a research‑only e‑commerce context. It is intended to help laboratories understand how retatrutide fits into metabolic and endocrine research workflows. It is not guidance for treatment, dosing, or any non‑research use.

Quick product snapshot

Field$$,
  'cat-4',
  'Metabolic Peptides',
  'PB-RET-010',
  '2381089-83-2',
  '39-amino acid synthetic peptide with C20 fatty diacid moiety',
  'C221H342N46O68',
  4731.42,
  '99.4% (HPLC)',
  '10 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  135,
  155,
  40,
  TRUE,
  TRUE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-retatrutide-10mg-vial', 'prod-retatrutide-10mg', '/images/products/retatrutide.jpg', 'Retatrutide (GIP/GLP-1/Glucagon Triple Agonist) 10 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-retatrutide-10mg-box', 'prod-retatrutide-10mg', '/images/labelbox/retatrutide.jpg', 'Retatrutide (GIP/GLP-1/Glucagon Triple Agonist) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-retatrutide-10mg-coa', 'prod-retatrutide-10mg', 'Certificate of Analysis (Batch #PB-RET-010-2025)', 'COA', '#coa', 'PB-RET-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-retatrutide-10mg-sds', 'prod-retatrutide-10mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-RET-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-retatrutide-10mg-1', 'prod-retatrutide-10mg', 'Analytical chromatography and mass spectrometric characterization of Retatrutide (GIP/GLP-1/Glucagon Triple Agonist)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-selank-5mg',
  'Selank (5mg)',
  'selank-5mg',
  $$Selank 5 mg – Synthetic Tuftsin Heptapeptide Analog$$,
  $$Product overview

Selank is a synthetic seven-amino acid regulatory neuropeptide with the sequence Thr-Lys-Pro-Arg-Pro-Gly-Pro, developed as a stabilized analog of the endogenous immunomodulatory tetrapeptide tuftsin (Thr-Lys-Pro-Arg). The structural addition of the C-terminal Pro-Gly-Pro tripeptide protects the compound from rapid enzymatic degradation by circulating carboxypeptidases and aminopeptidases, significantly prolonging central nervous system bioavailability in experimental models.

In preclinical neurobiology, Selank is investigated for its allosteric modulation of GABA-A receptors, upregulation of brain-derived neurotrophic factor (BDNF) and TrkB receptor mRNA in hippocampal tissue, and competitive inhibition of enkephalin-degrading enzymes without exhibiting sedative, addictive, or myorelaxant properties. The product is supplied as a sterile, white lyophilized solid powder with certified HPLC purity (≥99%) and identity confirmed by mass spectrometry.

This material is intended strictly for in-vitro laboratory experimentation and approved preclinical research. It is not approved for human or veterinary use.

Quick product snapshot$$,
  'cat-1',
  'Neuropeptides',
  'PB-SLK-005',
  '129954-34-3',
  'Thr-Lys-Pro-Arg-Pro-Gly-Pro',
  'C33H57N11O9',
  751.87,
  '99.4% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  68,
  78,
  40,
  TRUE,
  TRUE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-selank-5mg-vial', 'prod-selank-5mg', '/images/products/selank.jpg', 'Selank 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-selank-5mg-box', 'prod-selank-5mg', '/images/labelbox/selank.jpg', 'Selank Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-selank-5mg-coa', 'prod-selank-5mg', 'Certificate of Analysis (Batch #PB-SLK-005-2025)', 'COA', '#coa', 'PB-SLK-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-selank-5mg-sds', 'prod-selank-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-SLK-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-selank-5mg-1', 'prod-selank-5mg', 'Analytical chromatography and mass spectrometric characterization of Selank', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-semax-5mg',
  'Semax',
  'semax-5mg',
  $$# Semax 5 mg$$,
  $$**Research use only. Not for human consumption.**

Semax is a synthetic heptapeptide studied in laboratory settings for its role in neurobiology, stress response, and cognitive research. It is a stabilized analogue of the ACTH (4-10) fragment and is commonly used in preclinical and in vitro research where a well-defined peptide is needed for controlled experiments.

This listing is for **Semax 5 mg** in a lyophilized powder format.

## Product Highlights

- Synthetic ACTH (4-10) analogue
- White to off-white lyophilized powder
- Purity: **≥99% by HPLC**
- Available in **5 mg** and **10 mg** vial formats
- Intended for **laboratory research only**
- Not intended for human or veterinary use$$,
  'cat-1',
  'Neuropeptides',
  'PB-SMX-005',
  '80714-61-0',
  'Met-Glu-His-Phe-Pro-Gly-Pro',
  'C37H51N9O10S',
  813.93,
  '99.2% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  74,
  85,
  40,
  TRUE,
  TRUE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-semax-5mg-vial', 'prod-semax-5mg', '/images/products/semax.jpg', 'Semax 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-semax-5mg-box', 'prod-semax-5mg', '/images/labelbox/semax.jpg', 'Semax Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-semax-5mg-coa', 'prod-semax-5mg', 'Certificate of Analysis (Batch #PB-SMX-005-2025)', 'COA', '#coa', 'PB-SMX-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-semax-5mg-sds', 'prod-semax-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-SMX-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-semax-5mg-1', 'prod-semax-5mg', 'Analytical chromatography and mass spectrometric characterization of Semax', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-tb-500-5mg',
  'TB-500 (Thymosin Beta-4)',
  'tb-500-5mg',
  $$TB-500 (10 mg) – Thymosin Beta-4 Research Peptide Material Description$$,
  $$Product overview

TB‑500 is a synthetic research peptide corresponding to the full 43–amino acid sequence of thymosin beta‑4 (Tβ4), a naturally occurring peptide found in a wide range of mammalian tissues and circulating fluids.[file:23] Thymosin beta‑4 has been described in the literature as a multifunctional regulator of tissue repair, cell migration, angiogenesis, inflammatory resolution, and cytoskeletal organization, making TB‑500 a useful tool compound for exploring these mechanisms in laboratory models.[file:23]

This description is written for use on a research‑focused e‑commerce site and is intended to support in‑vitro and preclinical experimental planning only. Nothing here should be interpreted as medical advice, treatment guidance, or a recommendation for any non‑research use.

Quick product snapshot

Field$$,
  'cat-2',
  'Cellular & Tissue Research',
  'PB-TB4-005',
  '77591-33-4',
  'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
  'C212H350N56O78S',
  4963.4,
  '99.1% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  88,
  98,
  40,
  TRUE,
  TRUE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-tb-500-5mg-vial', 'prod-tb-500-5mg', '/images/products/tb-500.jpg', 'TB-500 (Thymosin Beta-4) 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-tb-500-5mg-box', 'prod-tb-500-5mg', '/images/labelbox/tb-500.jpg', 'TB-500 (Thymosin Beta-4) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-tb-500-5mg-coa', 'prod-tb-500-5mg', 'Certificate of Analysis (Batch #PB-TB4-005-2025)', 'COA', '#coa', 'PB-TB4-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-tb-500-5mg-sds', 'prod-tb-500-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-TB4-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-tb-500-5mg-1', 'prod-tb-500-5mg', 'Analytical chromatography and mass spectrometric characterization of TB-500 (Thymosin Beta-4)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-tesamorelin-5mg',
  'Tesamorelin (trans-3-Hexenoyl GHRH)',
  'tesamorelin-5mg',
  $$Tesamorelin (10 mg) – Growth Hormone–Releasing Hormone (GHRH) Analog Research Peptide$$,
  $$Product overview

Tesamorelin is a synthetic 44–amino acid peptide that closely mirrors native human growth hormone–releasing hormone (GHRH) and includes a protective trans‑3‑hexenoic acid group at the N‑terminus to improve stability in circulation.[conversation_history:1] In research models, it is widely used to stimulate the pituitary gland to release endogenous growth hormone, allowing investigators to explore growth hormone/IGF‑1 axis biology, visceral fat regulation, and broader metabolic pathways.[conversation_history:1]

This description is written specifically for a research‑focused e‑commerce site. It is intended to help laboratories understand how tesamorelin fits into experimental designs, not to guide medical use or any non‑research application.

Quick product snapshot

Field$$,
  'cat-6',
  'Growth Hormone Secretagogues',
  'PB-TSM-005',
  '218949-48-5',
  'trans-3-Hexenoyl-[Tyr1, Ala2, Asp3, Ala4, Ile5, Phe6, Thr7, Asn8, Ser9, Tyr10, Arg11, Lys12, Val13, Leu14, Gly15, Gln16, Leu17, Ser18, Ala19, Arg20, Lys21, Leu22, Leu23, Gln24, Asp25, Ile26, Met27, Ser28, Arg29, Gln30, Gln31, Gly32, Glu33, Ser34, Asn35, Gln36, Glu37, Arg38, Gly39, Ala40, Arg41, Ala42, Arg43, Leu44]-NH2',
  'C221H366N72O67S',
  5135.86,
  '99.4% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  92,
  108,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-tesamorelin-5mg-vial', 'prod-tesamorelin-5mg', '/images/products/tesamorelin.jpg', 'Tesamorelin (trans-3-Hexenoyl GHRH) 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-tesamorelin-5mg-box', 'prod-tesamorelin-5mg', '/images/labelbox/tesamorelin.jpg', 'Tesamorelin (trans-3-Hexenoyl GHRH) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-tesamorelin-5mg-coa', 'prod-tesamorelin-5mg', 'Certificate of Analysis (Batch #PB-TSM-005-2025)', 'COA', '#coa', 'PB-TSM-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-tesamorelin-5mg-sds', 'prod-tesamorelin-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-TSM-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-tesamorelin-5mg-1', 'prod-tesamorelin-5mg', 'Analytical chromatography and mass spectrometric characterization of Tesamorelin (trans-3-Hexenoyl GHRH)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-tirzepatide-10mg',
  'Tirzepatide (Dual GIP/GLP-1 Receptor Agonist)',
  'tirzepatide-10mg',
  $$Tirzepatide$$,
  $$GLP-1 / GIP Dual Receptor Agonist  |  20mg  |  Research Grade

99%+ Purity   |   Korean Manufactured   |   GMP Standards   |   Lyophilized Powder

⚠️ For In Vitro Laboratory Research Only — Not for Human or Veterinary Use

What Is Tirzepatide?

Tirzepatide is a synthetic 39-amino acid peptide engineered to activate two separate but related hormone receptors simultaneously — the glucagon-like peptide-1 receptor (GLP-1R) and the glucose-dependent insulinotropic polypeptide receptor (GIPR). This makes it what researchers call a dual incretin agonist, a class of compounds that mimics two naturally occurring gut hormones at once.$$,
  'cat-4',
  'Metabolic Peptides',
  'PB-TRZ-010',
  '2023788-19-2',
  'Tyr-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Tyr-Ser-Ile-Aib-Leu-Asp-Lys-Ile-Ala-Gln-Lys(diacid-PEG)-Ala-Phe-Val-Gln-Trp-Leu-Ile-Ala-Gly-Gly-Pro-Ser-Ser-Gly-Ala-Pro-Pro-Pro-Ser-NH2',
  'C225H348N48O68',
  4813.48,
  '99.5% (HPLC)',
  '10 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  120,
  140,
  40,
  TRUE,
  TRUE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-tirzepatide-10mg-vial', 'prod-tirzepatide-10mg', '/images/products/tirzepatide.jpg', 'Tirzepatide (Dual GIP/GLP-1 Receptor Agonist) 10 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-tirzepatide-10mg-box', 'prod-tirzepatide-10mg', '/images/labelbox/tirzepatide.jpg', 'Tirzepatide (Dual GIP/GLP-1 Receptor Agonist) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-tirzepatide-10mg-coa', 'prod-tirzepatide-10mg', 'Certificate of Analysis (Batch #PB-TRZ-010-2025)', 'COA', '#coa', 'PB-TRZ-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-tirzepatide-10mg-sds', 'prod-tirzepatide-10mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-TRZ-010-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-tirzepatide-10mg-1', 'prod-tirzepatide-10mg', 'Analytical chromatography and mass spectrometric characterization of Tirzepatide (Dual GIP/GLP-1 Receptor Agonist)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;
INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  'prod-vip-5mg',
  'VIP (Vasoactive Intestinal Peptide)',
  'vip-5mg',
  $$# VIP — Vasoactive Intestinal Peptide (5mg)$$,
  $$**Research Grade | 99%+ Purity | Korean Manufactured | GMP Standards | Lyophilized Powder**

> ⚠️ **For In Vitro Laboratory Research Only.** Not for human or animal consumption. Not approved for therapeutic, diagnostic, or clinical use.

---

## What Is VIP?

Vasoactive Intestinal Peptide — VIP for short — is a 28-amino acid neuropeptide that belongs to the secretin and glucagon peptide superfamily, a family of structurally related regulatory hormones that includes secretin, glucagon, PACAP (pituitary adenylate cyclase-activating polypeptide), and PHI (peptide histidine isoleucine). It was first isolated in 1970 by Said and Mutt from porcine small intestinal tissue, where its original characterisation focused on its potent vasodilatory activity. That first impression turned out to be only a narrow slice of VIP's biological portfolio.$$,
  'cat-1',
  'Neuropeptides',
  'PB-VIP-005',
  '37221-79-7',
  'His-Ser-Asp-Ala-Val-Phe-Thr-Asp-Asn-Tyr-Thr-Arg-Leu-Arg-Lys-Gln-Met-Ala-Val-Lys-Lys-Tyr-Leu-Asn-Ser-Ile-Leu-Asn-NH2',
  'C147H238N44O42S',
  3325.8,
  '99.4% (HPLC)',
  '5 mg',
  'Lyophilized Solid / Sealed Sterile Vial',
  72,
  84,
  40,
  TRUE,
  FALSE,
  TRUE,
  'Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-vip-5mg-vial', 'prod-vip-5mg', '/images/products/vip.jpg', 'VIP (Vasoactive Intestinal Peptide) 5 mg Lyophilized Vial', 0, TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES ('img-vip-5mg-box', 'prod-vip-5mg', '/images/labelbox/vip.jpg', 'VIP (Vasoactive Intestinal Peptide) Sealed Packaging Box', 1, FALSE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-vip-5mg-coa', 'prod-vip-5mg', 'Certificate of Analysis (Batch #PB-VIP-005-2025)', 'COA', '#coa', 'PB-VIP-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES ('doc-vip-5mg-sds', 'prod-vip-5mg', 'Safety Data Sheet (SDS)', 'SDS', '#sds', 'PB-VIP-005-2025', '2025-01-20', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES ('ref-vip-5mg-1', 'prod-vip-5mg', 'Analytical chromatography and mass spectrometric characterization of VIP (Vasoactive Intestinal Peptide)', 'Bio-Analytical Chemistry Group', 'Journal of Peptide Science & Analytical Chemistry', 2024, 'https://doi.org/10.1002/psc.3400') ON CONFLICT (id) DO NOTHING;

-- VERIFICATION CODE BATCHES & GENUINE CODES SEED DATA
INSERT INTO verification_code_batches (id, product_id, batch_name, batch_number, quantity, codes, authenticity_codes, created_by)
VALUES ('batch-selank-2026', 'prod-selank-5mg', 'Selank 5mg Production Lot', 'PB-SLK-005-2026', 10, ARRAY['VG5VU6', 'VG5VU7', 'VG5VU8', 'VG5VU9', 'VG5V10', 'BPC991', 'BPC992', 'TRZ881', 'SEM771', 'TB5661'], 'VG5VU6, VG5VU7, VG5VU8, VG5VU9, VG5V10, BPC991, BPC992, TRZ881, SEM771, TB5661', 'admin@peptrabio.com')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-vg5vu6', 'prod-selank-5mg', 'batch-selank-2026', 'VG5VU6', 'VG5VU6', 'PB-SLK-005-2026', 'SN-SLK-001', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-vg5vu7', 'prod-selank-5mg', 'batch-selank-2026', 'VG5VU7', 'VG5VU7', 'PB-SLK-005-2026', 'SN-SLK-002', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-vg5vu8', 'prod-selank-5mg', 'batch-selank-2026', 'VG5VU8', 'VG5VU8', 'PB-SLK-005-2026', 'SN-SLK-003', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-vg5vu9', 'prod-selank-5mg', 'batch-selank-2026', 'VG5VU9', 'VG5VU9', 'PB-SLK-005-2026', 'SN-SLK-004', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-vg5v10', 'prod-selank-5mg', 'batch-selank-2026', 'VG5V10', 'VG5V10', 'PB-SLK-005-2026', 'SN-SLK-005', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-bpc991', 'prod-bpc-157', 'batch-selank-2026', 'BPC991', 'BPC991', 'PB-SLK-005-2026', 'SN-BPC-001', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-bpc992', 'prod-bpc-157', 'batch-selank-2026', 'BPC992', 'BPC992', 'PB-SLK-005-2026', 'SN-BPC-002', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-trz881', 'prod-tirzepatide-10mg', 'batch-selank-2026', 'TRZ881', 'TRZ881', 'PB-SLK-005-2026', 'SN-TRZ-001', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-sem771', 'prod-semax-5mg', 'batch-selank-2026', 'SEM771', 'SEM771', 'PB-SLK-005-2026', 'SN-SEM-001', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_verification_codes (id, product_id, batch_id, code, authenticity_code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-tb5661', 'prod-tb-500-5mg', 'batch-selank-2026', 'TB5661', 'TB5661', 'PB-SLK-005-2026', 'SN-TB4-001', 3, 0, 'active')
ON CONFLICT (id) DO NOTHING;

-- INITIAL ORDERS & ORDER ITEMS SEED DATA
INSERT INTO orders (
  id, order_number, user_id, status, payment_status, payment_method, payment_type,
  advance_percentage, advance_amount, remaining_cod_amount, utr_number,
  payment_submitted_at, payment_verified_at, payment_verified_by, currency,
  subtotal, shipping, tax, total, customer_email, customer_name, customer_phone,
  shipping_address, billing_address, compliance_acknowledged, notes, created_at, updated_at
) VALUES (
  'ord-1001',
  'PB-ORD-9821',
  'user-sample',
  'processing',
  'verified',
  'partial_cod',
  'partial',
  10,
  13.6,
  122.4,
  'UTR491029482019',
  '2026-10-24T21:00:14.045Z',
  '2026-10-25T21:00:14.045Z',
  'admin@peptrabio.com',
  'INR',
  136,
  0.00,
  0.00,
  136,
  'lab.researcher@biotech-institute.edu',
  'Dr. Sarah Mitchell',
  '+1 (555) 234-5678',
  $${"first_name":"Sarah","last_name":"Mitchell","company":"Cellular Dynamics Lab","street":"450 Technology Parkway, Suite 300","city":"Cambridge","state":"MA","postal_code":"02139","country":"United States"}$$::jsonb,
  $${"first_name":"Sarah","last_name":"Mitchell","company":"Cellular Dynamics Lab","street":"450 Technology Parkway, Suite 300","city":"Cambridge","state":"MA","postal_code":"02139","country":"United States"}$$::jsonb,
  TRUE,
  'For in vitro receptor binding assays only.',
  '2026-10-24T21:00:14.045Z',
  '2026-10-25T21:00:14.045Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO order_items (id, order_id, product_id, product_name, product_code, quantity, unit_price, total_price) VALUES ('item-1', 'ord-1001', 'prod-selank-5mg', 'Selank (5mg)', 'PB-SLK-005', 2, 68, 136) ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (
  id, order_number, user_id, status, payment_status, payment_method, payment_type,
  advance_percentage, advance_amount, remaining_cod_amount, utr_number,
  payment_submitted_at, payment_verified_at, payment_verified_by, currency,
  subtotal, shipping, tax, total, customer_email, customer_name, customer_phone,
  shipping_address, billing_address, compliance_acknowledged, notes, created_at, updated_at
) VALUES (
  'ord-1002',
  'PB-ORD-9822',
  'user-sample',
  'pending',
  'awaiting_verification',
  'full_online',
  'full',
  100,
  150,
  0,
  'UTR882910482012',
  '2026-10-26T17:00:14.045Z',
  NULL,
  NULL,
  'INR',
  150,
  0.00,
  0.00,
  150,
  'q.vance@stanford-bio.org',
  'Dr. Quentin Vance',
  '+1 (555) 890-1234',
  $${"first_name":"Quentin","last_name":"Vance","company":"Molecular Bio Core","street":"290 Campus Drive, Clark Center","city":"Stanford","state":"CA","postal_code":"94305","country":"United States"}$$::jsonb,
  $${"first_name":"Quentin","last_name":"Vance","company":"Molecular Bio Core","street":"290 Campus Drive, Clark Center","city":"Stanford","state":"CA","postal_code":"94305","country":"United States"}$$::jsonb,
  TRUE,
  'Please include signed Batch COA document.',
  '2026-10-25T21:00:14.045Z',
  '2026-10-26T21:00:14.045Z'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO order_items (id, order_id, product_id, product_name, product_code, quantity, unit_price, total_price) VALUES ('item-2', 'ord-1002', 'prod-bpc-157', 'BPC-157 (5mg)', 'PB-BPC-005', 1, 62, 62) ON CONFLICT (id) DO NOTHING;
INSERT INTO order_items (id, order_id, product_id, product_name, product_code, quantity, unit_price, total_price) VALUES ('item-3', 'ord-1002', 'prod-tb-500-5mg', 'TB-500 (10mg)', 'PB-TB4-010', 1, 88, 88) ON CONFLICT (id) DO NOTHING;

-- DEFAULT ADMIN SETTINGS
INSERT INTO admin_settings (id, store_name, support_email, currency, compliance_notice)
VALUES ('default', 'PEPTRA BIO', 'support@peptrabio.com', 'INR', 'RESEARCH USE ONLY • ALL PEPTIDES ARE SOLD STRICTLY FOR IN VITRO LABORATORY RESEARCH')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
