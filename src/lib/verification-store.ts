import {
  ProductVerificationCode,
  VerificationCodeBatch,
  ProductVerificationScan,
  VerifyApiResponse,
  VerificationCodeStatus
} from '@/types/verification';
import { getLocalProducts } from './products-store';
import { createClient } from './supabase/client';
import crypto from 'crypto';

const VERIFICATION_CODES_KEY = 'peptrabio_verification_codes_v1';
const VERIFICATION_BATCHES_KEY = 'peptrabio_verification_batches_v1';
const VERIFICATION_SCANS_KEY = 'peptrabio_verification_scans_v1';

// Unambiguous character set (excludes 0, O, 1, I, L)
const CODE_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generates a single cryptographically secure code in format: PV-XXXX-XXXX-XXXX
 */
export function generateSecureCode(): string {
  const parts: string[] = [];
  for (let p = 0; p < 3; p++) {
    let segment = '';
    const randomBytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      segment += CODE_CHARSET[randomBytes[i] % CODE_CHARSET.length];
    }
    parts.push(segment);
  }
  return `PV-${parts.join('-')}`;
}

/**
 * Generates N unique verification codes
 */
export function generateUniqueCodes(quantity: number, existingCodes: Set<string>): string[] {
  const generated: string[] = [];
  while (generated.length < quantity) {
    const code = generateSecureCode();
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      generated.push(code);
    }
  }
  return generated;
}

// Initial demo seeds for immediate testing
const INITIAL_CODES: ProductVerificationCode[] = [
  {
    id: 'vc-1001',
    product_id: 'prod-selank-5mg',
    code: 'PV-7K9X-2M4Q-8Z6P',
    batch_number: 'SLK-2025-04',
    serial_number: 'SN-001',
    max_scans: 3,
    scan_count: 0,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    product_name: 'Selank',
    product_code: 'PB-SLK-005',
  },
  {
    id: 'vc-1002',
    product_id: 'prod-bpc-157',
    code: 'PV-3H8Q-9X7M-4W2L',
    batch_number: 'BPC-2025-09',
    serial_number: 'SN-002',
    max_scans: 3,
    scan_count: 1,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    product_name: 'BPC-157',
    product_code: 'PB-BPC-005',
  },
  {
    id: 'vc-1003',
    product_id: 'prod-tb-500-5mg',
    code: 'PV-8D2M-5N6K-1P9R',
    batch_number: 'TB-2025-01',
    serial_number: 'SN-003',
    max_scans: 3,
    scan_count: 3,
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    product_name: 'TB-500 (Thymosin Beta-4)',
    product_code: 'PB-TB4-005',
  }
];

const INITIAL_SCANS: ProductVerificationScan[] = [
  {
    id: 'scan-1',
    verification_code_id: 'vc-1002',
    scan_number: 1,
    scanned_at: new Date(Date.now() - 86400000).toISOString(),
    ip_hash: 'a1b2c3d4...',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    result: 'genuine',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'scan-2',
    verification_code_id: 'vc-1003',
    scan_number: 1,
    scanned_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    ip_hash: 'e5f6g7h8...',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    result: 'genuine',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'scan-3',
    verification_code_id: 'vc-1003',
    scan_number: 2,
    scanned_at: new Date(Date.now() - 86400000).toISOString(),
    ip_hash: 'e5f6g7h8...',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    result: 'genuine',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'scan-4',
    verification_code_id: 'vc-1003',
    scan_number: 3,
    scanned_at: new Date().toISOString(),
    ip_hash: 'e5f6g7h8...',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    result: 'genuine',
    created_at: new Date().toISOString(),
  }
];

// In-memory server fallback cache
let serverCodes: ProductVerificationCode[] = [...INITIAL_CODES];
let serverScans: ProductVerificationScan[] = [...INITIAL_SCANS];
let serverBatches: VerificationCodeBatch[] = [];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getLocalVerificationCodes(): ProductVerificationCode[] {
  if (!isBrowser()) return serverCodes;
  try {
    const raw = localStorage.getItem(VERIFICATION_CODES_KEY);
    if (!raw) {
      localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(INITIAL_CODES));
      return INITIAL_CODES;
    }
    return JSON.parse(raw);
  } catch {
    return serverCodes;
  }
}

export function saveLocalVerificationCodes(codes: ProductVerificationCode[]): void {
  if (!isBrowser()) {
    serverCodes = [...codes];
    return;
  }
  try {
    localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(codes));
  } catch (err) {
    console.error('Error saving verification codes', err);
  }
}

export function getLocalVerificationScans(): ProductVerificationScan[] {
  if (!isBrowser()) return serverScans;
  try {
    const raw = localStorage.getItem(VERIFICATION_SCANS_KEY);
    if (!raw) {
      localStorage.setItem(VERIFICATION_SCANS_KEY, JSON.stringify(INITIAL_SCANS));
      return INITIAL_SCANS;
    }
    return JSON.parse(raw);
  } catch {
    return serverScans;
  }
}

export function saveLocalVerificationScans(scans: ProductVerificationScan[]): void {
  if (!isBrowser()) {
    serverScans = [...scans];
    return;
  }
  try {
    localStorage.setItem(VERIFICATION_SCANS_KEY, JSON.stringify(scans));
  } catch (err) {
    console.error('Error saving scans', err);
  }
}

export function getLocalVerificationBatches(): VerificationCodeBatch[] {
  if (!isBrowser()) return serverBatches;
  try {
    const raw = localStorage.getItem(VERIFICATION_BATCHES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return serverBatches;
  }
}

export function saveLocalVerificationBatches(batches: VerificationCodeBatch[]): void {
  if (!isBrowser()) {
    serverBatches = [...batches];
    return;
  }
  try {
    localStorage.setItem(VERIFICATION_BATCHES_KEY, JSON.stringify(batches));
  } catch (err) {
    console.error('Error saving batches', err);
  }
}

/**
 * Atomic Server-Side Verification Logic
 */
export async function executeAtomicVerification(
  code: string,
  ipHash?: string,
  userAgent?: string
): Promise<VerifyApiResponse> {
  const normalized = code.trim().toUpperCase();

  if (!normalized || normalized.length < 6) {
    return {
      status: 'invalid',
      message: 'We could not find this verification code. Please check the code printed on your product box and try again.'
    };
  }

  // 1. Try Supabase RPC if configured
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('verify_product_code', {
        p_code: normalized,
        p_ip_hash: ipHash || null,
        p_user_agent: userAgent || null
      });

      if (!error && data && data.status && data.status !== 'invalid') {
        return data as VerifyApiResponse;
      }
    } catch (e) {
      console.warn('Supabase verify RPC fallback to local execution', e);
    }
  }

  // 2. Atomic Local Transaction Execution
  const codes = getLocalVerificationCodes();
  const scans = getLocalVerificationScans();
  const products = getLocalProducts();

  const targetIndex = codes.findIndex((c) => c.code.toUpperCase() === normalized);

  if (targetIndex === -1) {
    return {
      status: 'invalid',
      message: 'We could not find this verification code. Please check the code printed on your product box and try again.'
    };
  }

  const codeRec = codes[targetIndex];

  // Check deactivated
  if (codeRec.status === 'deactivated') {
    const scanRec: ProductVerificationScan = {
      id: 'scan-' + Date.now(),
      verification_code_id: codeRec.id,
      scan_number: codeRec.scan_count,
      scanned_at: new Date().toISOString(),
      ip_hash: ipHash,
      user_agent: userAgent,
      result: 'deactivated',
      created_at: new Date().toISOString()
    };
    scans.unshift(scanRec);
    saveLocalVerificationScans(scans);

    return {
      status: 'deactivated',
      message: 'This verification code is currently unavailable. Please contact our support team for assistance.'
    };
  }

  // Check blocked
  if (codeRec.status === 'blocked') {
    const scanRec: ProductVerificationScan = {
      id: 'scan-' + Date.now(),
      verification_code_id: codeRec.id,
      scan_number: codeRec.scan_count,
      scanned_at: new Date().toISOString(),
      ip_hash: ipHash,
      user_agent: userAgent,
      result: 'blocked',
      created_at: new Date().toISOString()
    };
    scans.unshift(scanRec);
    saveLocalVerificationScans(scans);

    return {
      status: 'blocked',
      message: 'This verification code is currently unavailable. Please contact our support team for assistance.'
    };
  }

  // Check maximum scans
  if (codeRec.scan_count >= codeRec.max_scans) {
    const scanRec: ProductVerificationScan = {
      id: 'scan-' + Date.now(),
      verification_code_id: codeRec.id,
      scan_number: codeRec.scan_count + 1,
      scanned_at: new Date().toISOString(),
      ip_hash: ipHash,
      user_agent: userAgent,
      result: 'limit_reached',
      created_at: new Date().toISOString()
    };
    scans.unshift(scanRec);
    saveLocalVerificationScans(scans);

    return {
      status: 'limit_reached',
      scan_number: codeRec.scan_count + 1,
      max_scans: codeRec.max_scans,
      code: codeRec.code,
      message: 'Verification limit reached. Please contact our support team to verify the product and scan history.'
    };
  }

  // Valid scan -> Increment counter atomically
  const newScanCount = codeRec.scan_count + 1;
  const scansRemaining = codeRec.max_scans - newScanCount;

  codes[targetIndex] = {
    ...codeRec,
    scan_count: newScanCount,
    updated_at: new Date().toISOString()
  };
  saveLocalVerificationCodes(codes);

  // Record scan
  const scanRec: ProductVerificationScan = {
    id: 'scan-' + Date.now(),
    verification_code_id: codeRec.id,
    scan_number: newScanCount,
    scanned_at: new Date().toISOString(),
    ip_hash: ipHash,
    user_agent: userAgent,
    result: 'genuine',
    created_at: new Date().toISOString()
  };
  scans.unshift(scanRec);
  saveLocalVerificationScans(scans);

  // Fetch safe public product info
  const prod = products.find((p) => p.id === codeRec.product_id);

  return {
    status: 'genuine',
    scan_number: newScanCount,
    max_scans: codeRec.max_scans,
    scans_remaining: scansRemaining,
    code: codeRec.code,
    product: {
      name: prod?.name || codeRec.product_name || 'Research Peptide',
      product_code: prod?.product_code || codeRec.product_code || 'PB-SPEC',
      batch_number: codeRec.batch_number,
      size: prod?.size || '5 mg',
      purity: prod?.purity || '99%+',
      format: prod?.format || 'Lyophilized Solid'
    },
    verified_at: new Date().toISOString()
  };
}

/**
 * Creates a batch of verification codes in admin
 */
export async function createVerificationBatch(params: {
  product_id: string;
  batch_name?: string;
  batch_number: string;
  serial_prefix?: string;
  quantity: number;
  max_scans?: number;
}): Promise<ProductVerificationCode[]> {
  const codes = getLocalVerificationCodes();
  const products = getLocalProducts();
  const product = products.find((p) => p.id === params.product_id);

  const existingSet = new Set(codes.map((c) => c.code));
  const rawCodes = generateUniqueCodes(params.quantity, existingSet);

  const batchId = 'batch-' + Date.now();
  const newRecords: ProductVerificationCode[] = rawCodes.map((code, idx) => {
    const serial = params.serial_prefix
      ? `${params.serial_prefix}-${String(idx + 1).padStart(4, '0')}`
      : `SN-${String(codes.length + idx + 1).padStart(4, '0')}`;

    return {
      id: 'vc-' + Date.now() + '-' + idx,
      product_id: params.product_id,
      batch_id: batchId,
      code,
      batch_number: params.batch_number,
      serial_number: serial,
      max_scans: params.max_scans || 3,
      scan_count: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product_name: product?.name || 'Research Peptide',
      product_code: product?.product_code || 'PB-SPEC'
    };
  });

  const updated = [...newRecords, ...codes];
  saveLocalVerificationCodes(updated);

  // Sync with Supabase if active
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from('verification_code_batches').insert({
        id: batchId,
        product_id: params.product_id,
        batch_name: params.batch_name || params.batch_number,
        batch_number: params.batch_number,
        quantity: params.quantity
      });

      await supabase.from('product_verification_codes').insert(
        newRecords.map((r) => ({
          id: r.id,
          product_id: r.product_id,
          batch_id: r.batch_id,
          code: r.code,
          batch_number: r.batch_number,
          serial_number: r.serial_number,
          max_scans: r.max_scans,
          scan_count: 0,
          status: 'active'
        }))
      );
    } catch (e) {
      console.warn('Supabase batch insert error', e);
    }
  }

  return newRecords;
}

/**
 * Updates verification code status (active, deactivated, blocked)
 */
export async function updateCodeStatus(
  codeId: string,
  status: VerificationCodeStatus
): Promise<ProductVerificationCode | null> {
  const codes = getLocalVerificationCodes();
  const index = codes.findIndex((c) => c.id === codeId);
  if (index === -1) return null;

  codes[index] = {
    ...codes[index],
    status,
    updated_at: new Date().toISOString()
  };
  saveLocalVerificationCodes(codes);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase
        .from('product_verification_codes')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', codeId);
    } catch {
      // ignore
    }
  }

  return codes[index];
}

/**
 * Returns scan history for a specific code (Admin Only)
 */
export async function getCodeScanHistory(codeId: string): Promise<ProductVerificationScan[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('product_verification_scans')
        .select('*')
        .eq('verification_code_id', codeId)
        .order('scanned_at', { ascending: true });
      if (!error && data) {
        return data as ProductVerificationScan[];
      }
    } catch {
      // fallback
    }
  }
  const scans = getLocalVerificationScans();
  return scans.filter((s) => s.verification_code_id === codeId).sort((a, b) => a.scan_number - b.scan_number);
}
