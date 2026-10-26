-- ==============================================================================
-- Migration: Add UPI Payment & Partial Payment Tracking Columns to Orders Table
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Ensure required payment status and method columns exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'partial_cod';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'partial';

-- 2. Add advance and Cash on Delivery (COD) accounting breakdown
ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_percentage NUMERIC(5,2) DEFAULT 10.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS remaining_cod_amount NUMERIC(12,2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';

-- 3. Add UPI transaction and screenshot verification tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified_by VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_rejection_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- 4. Create index on payment_status and order_number for rapid lookups & admin verification
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_utr_number ON orders(utr_number);

-- 5. Add payment-proofs public storage bucket if not already configured
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to payment screenshots
DROP POLICY IF EXISTS "Public Read Access for Payment Proofs" ON storage.objects;
CREATE POLICY "Public Read Access for Payment Proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

-- Allow authenticated or public insert of payment screenshots
DROP POLICY IF EXISTS "Allow Upload of Payment Proofs" ON storage.objects;
CREATE POLICY "Allow Upload of Payment Proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

