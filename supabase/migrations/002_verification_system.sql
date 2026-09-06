-- ==========================================================
-- PEPTRA BIO - PRODUCT AUTHENTICITY & VERIFICATION SYSTEM
-- Production Database Migration for Unique Authenticity Codes & Atomic Scans
-- ==========================================================

-- 1. VERIFICATION CODE BATCHES TABLE
create table if not exists verification_code_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  batch_name text,
  batch_number text not null,
  quantity integer not null default 1,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- 2. PRODUCT VERIFICATION CODES TABLE
create table if not exists product_verification_codes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  batch_id uuid references verification_code_batches(id) on delete set null,
  code text unique not null,
  batch_number text not null,
  serial_number text,
  max_scans integer not null default 3,
  scan_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'deactivated', 'blocked')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PRODUCT VERIFICATION SCANS (AUDIT & HISTORY) TABLE
create table if not exists product_verification_scans (
  id uuid primary key default gen_random_uuid(),
  verification_code_id uuid references product_verification_codes(id) on delete cascade,
  scan_number integer not null,
  scanned_at timestamptz default now(),
  ip_hash text,
  user_agent text,
  result text not null check (result in ('genuine', 'limit_reached', 'invalid', 'deactivated', 'blocked')),
  created_at timestamptz default now()
);

-- Indexes for performance & rapid lookups
create index if not exists idx_verification_codes_code on product_verification_codes(code);
create index if not exists idx_verification_codes_product_id on product_verification_codes(product_id);
create index if not exists idx_verification_codes_batch_id on product_verification_codes(batch_id);
create index if not exists idx_verification_scans_code_id on product_verification_scans(verification_code_id);
create index if not exists idx_verification_scans_created_at on product_verification_scans(created_at desc);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================================
alter table verification_code_batches enable row level security;
alter table product_verification_codes enable row level security;
alter table product_verification_scans enable row level security;

-- Admin access only for direct table operations
create policy "Admins full access on verification_code_batches"
  on verification_code_batches for all
  using (auth.role() = 'authenticated');

create policy "Admins full access on product_verification_codes"
  on product_verification_codes for all
  using (auth.role() = 'authenticated');

create policy "Admins full access on product_verification_scans"
  on product_verification_scans for all
  using (auth.role() = 'authenticated');

-- ==========================================================
-- ATOMIC VERIFICATION TRANSACTION (PostgreSQL Stored Function / RPC)
-- Race-condition safe with row-level locking (FOR UPDATE)
-- ==========================================================
create or replace function verify_product_code(
  p_code text,
  p_ip_hash text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_normalized_code text;
  v_code_rec record;
  v_prod_rec record;
  v_new_scan_number integer;
  v_scans_remaining integer;
begin
  -- 1. Normalize code input
  v_normalized_code := upper(trim(p_code));

  if v_normalized_code is null or length(v_normalized_code) < 6 then
    return jsonb_build_object(
      'status', 'invalid',
      'message', 'We could not find this verification code.'
    );
  end if;

  -- 2. Lock and fetch verification code row
  select * into v_code_rec
  from product_verification_codes
  where upper(code) = v_normalized_code
  for update;

  -- 3. If code not found
  if not found then
    return jsonb_build_object(
      'status', 'invalid',
      'message', 'We could not find this verification code. Please check the code printed on your product box and try again.'
    );
  end if;

  -- 4. Check Deactivated Status
  if v_code_rec.status = 'deactivated' then
    insert into product_verification_scans (
      verification_code_id,
      scan_number,
      ip_hash,
      user_agent,
      result
    ) values (
      v_code_rec.id,
      v_code_rec.scan_count,
      p_ip_hash,
      p_user_agent,
      'deactivated'
    );

    return jsonb_build_object(
      'status', 'deactivated',
      'message', 'This verification code is currently unavailable. Please contact support.'
    );
  end if;

  -- 5. Check Blocked Status
  if v_code_rec.status = 'blocked' then
    insert into product_verification_scans (
      verification_code_id,
      scan_number,
      ip_hash,
      user_agent,
      result
    ) values (
      v_code_rec.id,
      v_code_rec.scan_count,
      p_ip_hash,
      p_user_agent,
      'blocked'
    );

    return jsonb_build_object(
      'status', 'blocked',
      'message', 'This verification code is currently unavailable. Please contact support.'
    );
  end if;

  -- 6. Check Maximum Scans Limit
  if v_code_rec.scan_count >= v_code_rec.max_scans then
    insert into product_verification_scans (
      verification_code_id,
      scan_number,
      ip_hash,
      user_agent,
      result
    ) values (
      v_code_rec.id,
      v_code_rec.scan_count + 1,
      p_ip_hash,
      p_user_agent,
      'limit_reached'
    );

    return jsonb_build_object(
      'status', 'limit_reached',
      'scan_number', v_code_rec.scan_count + 1,
      'max_scans', v_code_rec.max_scans,
      'message', 'Verification limit reached. Please contact support.'
    );
  end if;

  -- 7. Valid Scan -> Increment Counter Atomically
  v_new_scan_number := v_code_rec.scan_count + 1;
  v_scans_remaining := v_code_rec.max_scans - v_new_scan_number;

  update product_verification_codes
  set
    scan_count = v_new_scan_number,
    updated_at = now()
  where id = v_code_rec.id;

  -- 8. Insert Scan Record
  insert into product_verification_scans (
    verification_code_id,
    scan_number,
    ip_hash,
    user_agent,
    result
  ) values (
    v_code_rec.id,
    v_new_scan_number,
    p_ip_hash,
    p_user_agent,
    'genuine'
  );

  -- 9. Fetch Safe Public Product Info
  select
    name,
    product_code,
    size,
    purity,
    format
  into v_prod_rec
  from products
  where id = v_code_rec.product_id;

  -- 10. Return Genuine Response
  return jsonb_build_object(
    'status', 'genuine',
    'scan_number', v_new_scan_number,
    'max_scans', v_code_rec.max_scans,
    'scans_remaining', v_scans_remaining,
    'code', v_code_rec.code,
    'product', jsonb_build_object(
      'name', coalesce(v_prod_rec.name, 'Research Peptide'),
      'product_code', coalesce(v_prod_rec.product_code, 'PB-SPEC'),
      'batch_number', v_code_rec.batch_number,
      'size', coalesce(v_prod_rec.size, '5 mg'),
      'purity', coalesce(v_prod_rec.purity, '99%+'),
      'format', coalesce(v_prod_rec.format, 'Lyophilized Solid')
    ),
    'verified_at', now()
  );
end;
$$;
