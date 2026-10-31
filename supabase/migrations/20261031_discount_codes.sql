-- ==============================================================================
-- Migration: Discount Codes & Promotion Engine Setup
-- Database: Supabase PostgreSQL
-- Date: 2026-10-31
-- ==============================================================================

-- 1. Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create performance indexes for instant coupon lookups
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes (UPPER(code));
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes (is_active);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Allow public and clients to check and read discount codes
DROP POLICY IF EXISTS "Public can view active discount codes" ON discount_codes;
CREATE POLICY "Public can view active discount codes"
ON discount_codes FOR SELECT
USING (true);

-- Allow authenticated users / service role full management of discount codes
DROP POLICY IF EXISTS "Full access to discount codes" ON discount_codes;
CREATE POLICY "Full access to discount codes"
ON discount_codes FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Seed initial default discount codes
INSERT INTO discount_codes (
  id, code, description, discount_type, discount_value,
  applicable_payment, min_order_amount, max_discount_amount,
  usage_limit, used_count, is_active
) VALUES 
(
  'disc-peptra10',
  'PEPTRA10',
  '10% Launch Research Discount (Valid on all payment options)',
  'percentage',
  10.00,
  'both',
  1000.00,
  2500.00,
  500,
  24,
  true
),
(
  'disc-fullpay5',
  'FULLPAY5',
  '5% Extra Instant Discount on 100% Complete Online Payment',
  'percentage',
  5.00,
  'full',
  1500.00,
  1500.00,
  300,
  18,
  true
),
(
  'disc-partialcod',
  'PARTIALCOD',
  '₹300 Flat Discount on Partial Advance (COD) Requisitions',
  'fixed',
  300.00,
  'partial',
  3000.00,
  NULL,
  200,
  9,
  true
),
(
  'disc-flat500',
  'FLAT500',
  'Flat ₹500 Discount on Requisitions Above ₹4,000',
  'fixed',
  500.00,
  'both',
  4000.00,
  NULL,
  250,
  31,
  true
)
ON CONFLICT (code) DO NOTHING;

-- 5. Add discount tracking columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0.00;

