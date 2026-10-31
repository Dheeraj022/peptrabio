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

-- 4. Purge any legacy temporary test discount codes
DELETE FROM discount_codes 
WHERE id IN ('disc-peptra10', 'disc-fullpay5', 'disc-partialcod', 'disc-flat500') 
   OR UPPER(code) IN ('PEPTRA10', 'FULLPAY5', 'PARTIALCOD', 'FLAT500');

-- 5. Add discount tracking columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0.00;

