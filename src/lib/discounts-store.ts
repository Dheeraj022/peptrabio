import { DiscountCode, DiscountPaymentApplicability, DiscountType } from '@/types';

const DISCOUNTS_STORAGE_KEY = 'peptrabio_discounts_v1';

// Seed list is now empty - all discount codes are generated and managed by admin
export const SEED_DISCOUNTS: DiscountCode[] = [];

// Identifiers of temporary test codes to purge from any existing local storage
const TEMPORARY_DISCOUNT_IDS = new Set(['disc-peptra10', 'disc-fullpay5', 'disc-partialcod', 'disc-flat500']);
const TEMPORARY_DISCOUNT_CODES = new Set(['PEPTRA10', 'FULLPAY5', 'PARTIALCOD', 'FLAT500']);

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Returns currently cached discount codes synchronously from localStorage (or defaults).
 * Automatically purges any legacy temporary discount codes.
 */
export function getStoredDiscounts(): DiscountCode[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(DISCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Clean out any temporary codes that were previously saved
      const cleaned = parsed.filter(
        (d: DiscountCode) =>
          d &&
          !TEMPORARY_DISCOUNT_IDS.has(d.id) &&
          !TEMPORARY_DISCOUNT_CODES.has(d.code?.trim().toUpperCase())
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return [];
  } catch (err) {
    console.warn('Failed to load discounts from localStorage:', err);
    return [];
  }
}

/**
 * Persists discount codes to browser localStorage cache.
 */
export function saveStoredDiscounts(discounts: DiscountCode[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(discounts));
  } catch (err) {
    console.error('Failed to save discounts to localStorage:', err);
  }
}

/**
 * Asynchronously fetches discounts from Supabase database via /api/discounts.
 * Merges Supabase records with local store and caches locally.
 */
export async function fetchDiscounts(includeInactive: boolean = true): Promise<{
  discounts: DiscountCode[];
  isCloudSynced: boolean;
  message?: string;
}> {
  const local = getStoredDiscounts();

  if (!isBrowser()) {
    return { discounts: local, isCloudSynced: false };
  }

  try {
    const res = await fetch(`/api/discounts?includeInactive=${includeInactive}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.discounts)) {
        const remoteDiscounts = (data.discounts as DiscountCode[]).filter(
          (d) =>
            d &&
            !TEMPORARY_DISCOUNT_IDS.has(d.id) &&
            !TEMPORARY_DISCOUNT_CODES.has(d.code?.trim().toUpperCase())
        );
        
        // Merge remote and local
        const mergedMap = new Map<string, DiscountCode>();

        // Start with remote as source of truth
        remoteDiscounts.forEach((d) => mergedMap.set(d.id, d));

        // Preserve any newly added local discount that might not be synced yet
        local.forEach((ld) => {
          if (!mergedMap.has(ld.id) && !remoteDiscounts.some(rd => rd.code === ld.code)) {
            mergedMap.set(ld.id, ld);
          }
        });

        const mergedList = Array.from(mergedMap.values());
        saveStoredDiscounts(mergedList);

        return {
          discounts: mergedList,
          isCloudSynced: true,
          message: 'Synced with Supabase Cloud Database',
        };
      }
    }
  } catch (err) {
    console.warn('Could not sync with Supabase /api/discounts, using local cache:', err);
  }

  return {
    discounts: local,
    isCloudSynced: false,
    message: 'Operating in Local Cache Mode',
  };
}

// Background sync helpers
async function pushDiscountToSupabase(discount: DiscountCode): Promise<void> {
  if (!isBrowser()) return;
  try {
    await fetch('/api/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discount),
    });
  } catch (err) {
    console.warn('Failed to push discount code to Supabase:', err);
  }
}

async function syncToggleToSupabase(id: string): Promise<void> {
  if (!isBrowser()) return;
  try {
    await fetch('/api/discounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'toggle' }),
    });
  } catch (err) {
    console.warn('Failed to sync discount toggle to Supabase:', err);
  }
}

async function syncDeleteToSupabase(id: string): Promise<void> {
  if (!isBrowser()) return;
  try {
    await fetch(`/api/discounts?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Failed to sync discount delete to Supabase:', err);
  }
}

async function syncIncrementToSupabase(code: string): Promise<void> {
  if (!isBrowser()) return;
  try {
    await fetch('/api/discounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, action: 'increment' }),
    });
  } catch (err) {
    console.warn('Failed to sync discount usage increment to Supabase:', err);
  }
}

export function getDiscountByCode(code: string): DiscountCode | null {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  const all = getStoredDiscounts();
  return all.find((d) => d.code.toUpperCase() === clean) || null;
}

export interface DiscountValidationResult {
  valid: boolean;
  discount?: DiscountCode;
  discountAmount: number;
  message: string;
  paymentRestrictionNotice?: string;
  isPaymentMismatch?: boolean;
}

export function calculateDiscountAmount(discount: DiscountCode, subtotalINR: number): number {
  if (subtotalINR <= 0) return 0;

  let amount = 0;
  if (discount.discount_type === 'percentage') {
    amount = Math.round((subtotalINR * discount.discount_value) / 100);
    if (discount.max_discount_amount && amount > discount.max_discount_amount) {
      amount = discount.max_discount_amount;
    }
  } else {
    // Fixed amount
    amount = Math.min(subtotalINR, discount.discount_value);
  }

  return Math.max(0, amount);
}

export function validateDiscountCode(
  code: string,
  subtotalINR: number,
  paymentOption?: 'partial' | 'full'
): DiscountValidationResult {
  if (!code || !code.trim()) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'Please enter a discount code.',
    };
  }

  const discount = getDiscountByCode(code);
  if (!discount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Code "${code.trim().toUpperCase()}" is invalid or does not exist.`,
    };
  }

  if (!discount.is_active) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Discount code "${discount.code}" is currently disabled.`,
    };
  }

  if (discount.expires_at) {
    const expiry = new Date(discount.expires_at).getTime();
    if (expiry < Date.now()) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Discount code "${discount.code}" expired on ${new Date(discount.expires_at).toLocaleDateString()}.`,
      };
    }
  }

  if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Discount code "${discount.code}" has reached its maximum usage limit.`,
    };
  }

  if (discount.min_order_amount && subtotalINR < discount.min_order_amount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Code "${discount.code}" requires a minimum order value of ₹${discount.min_order_amount.toLocaleString('en-IN')}. (Current: ₹${subtotalINR.toLocaleString('en-IN')})`,
    };
  }

  const rawAmount = calculateDiscountAmount(discount, subtotalINR);

  // Check payment applicability: 'both' | 'full' | 'partial'
  if (discount.applicable_payment === 'full' && paymentOption === 'partial') {
    return {
      valid: true,
      discount,
      discountAmount: 0, // Not applied to partial
      isPaymentMismatch: true,
      message: `Code "${discount.code}" is valid exclusively on 100% Complete Online Payment. Switch to Full Payment to get ₹${rawAmount.toLocaleString('en-IN')} off!`,
      paymentRestrictionNotice: 'Complete Payment Only',
    };
  }

  if (discount.applicable_payment === 'partial' && paymentOption === 'full') {
    return {
      valid: true,
      discount,
      discountAmount: 0, // Not applied to full
      isPaymentMismatch: true,
      message: `Code "${discount.code}" is valid exclusively on Partial Advance (COD) Payment. Switch to Partial Payment to get ₹${rawAmount.toLocaleString('en-IN')} off!`,
      paymentRestrictionNotice: 'Partial Payment Only',
    };
  }

  const paymentNotice =
    discount.applicable_payment === 'full'
      ? 'Applied: Exclusive to 100% Complete Online Payment'
      : discount.applicable_payment === 'partial'
      ? 'Applied: Exclusive to Partial Advance (COD) Payment'
      : 'Applied: Valid on all payment methods';

  return {
    valid: true,
    discount,
    discountAmount: rawAmount,
    isPaymentMismatch: false,
    message: `Code "${discount.code}" applied successfully! You save ₹${rawAmount.toLocaleString('en-IN')}.`,
    paymentRestrictionNotice: paymentNotice,
  };
}

export function createDiscountCode(data: {
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  applicable_payment: DiscountPaymentApplicability;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  expires_at?: string;
  is_active?: boolean;
}): DiscountCode {
  const all = getStoredDiscounts();
  const cleanCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

  // Check if code already exists
  if (all.some((d) => d.code === cleanCode)) {
    throw new Error(`Discount code "${cleanCode}" already exists. Please choose a different code.`);
  }

  const newDiscount: DiscountCode = {
    id: 'disc-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    code: cleanCode,
    description: data.description?.trim() || '',
    discount_type: data.discount_type,
    discount_value: Number(data.discount_value),
    applicable_payment: data.applicable_payment,
    min_order_amount: data.min_order_amount ? Number(data.min_order_amount) : undefined,
    max_discount_amount: data.max_discount_amount ? Number(data.max_discount_amount) : undefined,
    usage_limit: data.usage_limit ? Number(data.usage_limit) : undefined,
    used_count: 0,
    is_active: data.is_active !== undefined ? data.is_active : true,
    expires_at: data.expires_at || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = [newDiscount, ...all];
  saveStoredDiscounts(updated);

  // Asynchronously mirror to Supabase
  pushDiscountToSupabase(newDiscount);

  return newDiscount;
}

export function updateDiscountCode(id: string, updates: Partial<DiscountCode>): DiscountCode | null {
  const all = getStoredDiscounts();
  const index = all.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const current = all[index];
  const updatedCode = updates.code
    ? updates.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
    : current.code;

  // Check collision if code changed
  if (updatedCode !== current.code && all.some((d) => d.id !== id && d.code === updatedCode)) {
    throw new Error(`Discount code "${updatedCode}" already exists.`);
  }

  const updatedItem: DiscountCode = {
    ...current,
    ...updates,
    code: updatedCode,
    updated_at: new Date().toISOString(),
  };

  all[index] = updatedItem;
  saveStoredDiscounts(all);

  // Asynchronously mirror to Supabase
  pushDiscountToSupabase(updatedItem);

  return updatedItem;
}

export function toggleDiscountActive(id: string): boolean {
  const all = getStoredDiscounts();
  const target = all.find((d) => d.id === id);
  if (!target) return false;

  target.is_active = !target.is_active;
  target.updated_at = new Date().toISOString();
  saveStoredDiscounts(all);

  // Asynchronously mirror to Supabase
  syncToggleToSupabase(id);

  return target.is_active;
}

export function deleteDiscountCode(id: string): boolean {
  const all = getStoredDiscounts();
  const filtered = all.filter((d) => d.id !== id);
  if (filtered.length === all.length) return false;

  saveStoredDiscounts(filtered);

  // Asynchronously mirror to Supabase
  syncDeleteToSupabase(id);

  return true;
}

export function incrementDiscountUsage(code: string): void {
  if (!code) return;
  const clean = code.trim().toUpperCase();
  const all = getStoredDiscounts();
  const target = all.find((d) => d.code === clean);
  if (target) {
    target.used_count = (target.used_count || 0) + 1;
    target.updated_at = new Date().toISOString();
    saveStoredDiscounts(all);
  }

  // Asynchronously mirror to Supabase
  syncIncrementToSupabase(clean);
}
