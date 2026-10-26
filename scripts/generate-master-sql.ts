import fs from 'fs';
import path from 'path';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../src/lib/seed-data';
import { INITIAL_ORDERS } from '../src/lib/products-store';

function escapeSql(str: any): string {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? 'TRUE' : 'FALSE';
  if (typeof str === 'number') return String(str);
  if (typeof str === 'object') return `'${JSON.stringify(str).replace(/'/g, "''")}'::jsonb`;
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeDollar(str: any): string {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? 'TRUE' : 'FALSE';
  if (typeof str === 'number') return String(str);
  if (typeof str === 'object') return `$$${JSON.stringify(str)}$$::jsonb`;
  return `$$${String(str)}$$`;
}

async function generate() {
  const outputPath = path.resolve(process.cwd(), 'supabase/complete_peptrabio_database_setup.sql');
  let sql = `-- ==============================================================================
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

-- ==============================================================================
-- 8. COMPREHENSIVE SEED DATA INSERTION
-- ==============================================================================
`;

  // Seed Categories
  sql += `\n-- CATEGORIES SEED DATA\n`;
  for (const cat of SEED_CATEGORIES) {
    sql += `INSERT INTO categories (id, name, slug, description, is_active) VALUES (${escapeSql(cat.id)}, ${escapeSql(cat.name)}, ${escapeSql(cat.slug)}, ${escapeSql(cat.description)}, ${escapeSql(cat.is_active)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  // Seed Products
  sql += `\n-- PRODUCTS SEED DATA (${SEED_PRODUCTS.length} Research Peptides)\n`;
  for (const p of SEED_PRODUCTS) {
    sql += `INSERT INTO products (
  id, name, slug, short_description, description, category_id, category,
  product_code, cas_number, sequence, molecular_formula, molecular_weight,
  purity, size, format, price, compare_at_price, stock_quantity,
  is_active, is_featured, research_use_only, storage_information
) VALUES (
  ${escapeSql(p.id)},
  ${escapeSql(p.name)},
  ${escapeSql(p.slug)},
  ${escapeDollar(p.short_description)},
  ${escapeDollar(p.description)},
  ${escapeSql(p.category_id)},
  ${escapeSql(p.category)},
  ${escapeSql(p.product_code)},
  ${escapeSql(p.cas_number)},
  ${escapeSql(p.sequence)},
  ${escapeSql(p.molecular_formula)},
  ${escapeSql(p.molecular_weight)},
  ${escapeSql(p.purity)},
  ${escapeSql(p.size)},
  ${escapeSql(p.format)},
  ${escapeSql(p.price)},
  ${escapeSql(p.compare_at_price)},
  ${escapeSql(p.stock_quantity)},
  ${escapeSql(p.is_active)},
  ${escapeSql(p.is_featured)},
  ${escapeSql(p.research_use_only)},
  ${escapeSql(p.storage_information)}
) ON CONFLICT (id) DO NOTHING;\n\n`;

    // Images
    if (p.images && p.images.length > 0) {
      for (const img of p.images) {
        sql += `INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES (${escapeSql(img.id)}, ${escapeSql(p.id)}, ${escapeSql(img.image_url)}, ${escapeSql(img.alt_text)}, ${escapeSql(img.sort_order)}, ${escapeSql(img.is_primary)}) ON CONFLICT (id) DO NOTHING;\n`;
      }
    }

    // Documents
    if (p.documents && p.documents.length > 0) {
      for (const doc of p.documents) {
        sql += `INSERT INTO product_documents (id, product_id, title, document_type, file_url, batch_number, test_date, is_public) VALUES (${escapeSql(doc.id)}, ${escapeSql(p.id)}, ${escapeSql(doc.title)}, ${escapeSql(doc.document_type)}, ${escapeSql(doc.file_url)}, ${escapeSql(doc.batch_number)}, ${escapeSql(doc.test_date)}, ${escapeSql(doc.is_public)}) ON CONFLICT (id) DO NOTHING;\n`;
      }
    }

    // References
    if (p.references && p.references.length > 0) {
      for (const ref of p.references) {
        sql += `INSERT INTO product_references (id, product_id, title, authors, publication, year, url) VALUES (${escapeSql(ref.id)}, ${escapeSql(p.id)}, ${escapeSql(ref.title)}, ${escapeSql(ref.authors)}, ${escapeSql(ref.publication)}, ${escapeSql(ref.year)}, ${escapeSql(ref.url)}) ON CONFLICT (id) DO NOTHING;\n`;
      }
    }
  }

  // Seed Verification Batches & Codes
  sql += `\n-- VERIFICATION CODE BATCHES & GENUINE CODES SEED DATA\n`;
  sql += `INSERT INTO verification_code_batches (id, product_id, batch_name, batch_number, quantity, created_by)
VALUES ('batch-selank-2026', 'prod-selank-5mg', 'Selank 5mg Production Lot', 'PB-SLK-005-2026', 10, 'admin@peptrabio.com')
ON CONFLICT (id) DO NOTHING;\n`;

  const sampleCodes = [
    { code: 'VG5VU6', serial: 'SN-SLK-001', scans: 0 },
    { code: 'VG5VU7', serial: 'SN-SLK-002', scans: 0 },
    { code: 'VG5VU8', serial: 'SN-SLK-003', scans: 0 },
    { code: 'VG5VU9', serial: 'SN-SLK-004', scans: 0 },
    { code: 'VG5V10', serial: 'SN-SLK-005', scans: 0 },
    { code: 'BPC991', serial: 'SN-BPC-001', scans: 0 },
    { code: 'BPC992', serial: 'SN-BPC-002', scans: 0 },
    { code: 'TRZ881', serial: 'SN-TRZ-001', scans: 0 },
    { code: 'SEM771', serial: 'SN-SEM-001', scans: 0 },
    { code: 'TB5661', serial: 'SN-TB4-001', scans: 0 }
  ];

  for (const c of sampleCodes) {
    const prodId = c.code.startsWith('VG') ? 'prod-selank-5mg' : c.code.startsWith('BPC') ? 'prod-bpc-157' : c.code.startsWith('TRZ') ? 'prod-tirzepatide-10mg' : c.code.startsWith('SEM') ? 'prod-semax-5mg' : 'prod-tb-500-5mg';
    sql += `INSERT INTO product_verification_codes (id, product_id, batch_id, code, batch_number, serial_number, max_scans, scan_count, status)
VALUES ('pvc-${c.code.toLowerCase()}', '${prodId}', 'batch-selank-2026', '${c.code}', 'PB-SLK-005-2026', '${c.serial}', 3, ${c.scans}, 'active')
ON CONFLICT (id) DO NOTHING;\n`;
  }

  // Seed Orders & Items
  sql += `\n-- INITIAL ORDERS & ORDER ITEMS SEED DATA\n`;
  for (const ord of INITIAL_ORDERS) {
    sql += `INSERT INTO orders (
  id, order_number, user_id, status, payment_status, payment_method, payment_type,
  advance_percentage, advance_amount, remaining_cod_amount, utr_number,
  payment_submitted_at, payment_verified_at, payment_verified_by, currency,
  subtotal, shipping, tax, total, customer_email, customer_name, customer_phone,
  shipping_address, billing_address, compliance_acknowledged, notes, created_at, updated_at
) VALUES (
  ${escapeSql(ord.id)},
  ${escapeSql(ord.order_number)},
  ${escapeSql(ord.user_id || 'user-sample')},
  ${escapeSql(ord.status)},
  ${escapeSql(ord.payment_status)},
  ${escapeSql(ord.payment_method || 'partial_cod')},
  ${escapeSql(ord.payment_type || 'partial')},
  ${escapeSql(ord.advance_percentage || 10)},
  ${escapeSql(ord.advance_amount || 0)},
  ${escapeSql(ord.remaining_cod_amount || 0)},
  ${escapeSql(ord.utr_number || null)},
  ${escapeSql(ord.payment_submitted_at || null)},
  ${escapeSql(ord.payment_verified_at || null)},
  ${escapeSql(ord.payment_verified_by || null)},
  ${escapeSql(ord.currency || 'INR')},
  ${escapeSql(ord.subtotal)},
  0.00,
  0.00,
  ${escapeSql(ord.total)},
  ${escapeSql(ord.customer_email)},
  ${escapeSql(ord.customer_name)},
  ${escapeSql(ord.customer_phone || null)},
  ${escapeDollar(ord.shipping_address)},
  ${escapeDollar(ord.billing_address)},
  ${escapeSql(ord.compliance_acknowledged)},
  ${escapeSql(ord.notes || null)},
  ${escapeSql(ord.created_at)},
  ${escapeSql(ord.updated_at)}
) ON CONFLICT (id) DO NOTHING;\n`;

    if (ord.items && ord.items.length > 0) {
      for (const item of ord.items) {
        sql += `INSERT INTO order_items (id, order_id, product_id, product_name, product_code, quantity, unit_price, total_price) VALUES (${escapeSql(item.id)}, ${escapeSql(ord.id)}, ${escapeSql(item.product_id)}, ${escapeSql(item.product_name)}, ${escapeSql(item.product_code)}, ${escapeSql(item.quantity)}, ${escapeSql(item.unit_price)}, ${escapeSql(item.total_price)}) ON CONFLICT (id) DO NOTHING;\n`;
      }
    }
  }

  // Seed Admin Settings
  sql += `\n-- DEFAULT ADMIN SETTINGS\n`;

  sql += `INSERT INTO admin_settings (id, store_name, support_email, currency, compliance_notice)
VALUES ('default', 'PEPTRA BIO', 'support@peptrabio.com', 'INR', 'RESEARCH USE ONLY • ALL PEPTIDES ARE SOLD STRICTLY FOR IN VITRO LABORATORY RESEARCH')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();\n`;

  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`Successfully generated master SQL file at: ${outputPath}`);
}

generate().catch(console.error);
