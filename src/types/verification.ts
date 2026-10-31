export type VerificationCodeStatus = 'active' | 'deactivated' | 'blocked';

export type VerificationScanResult = 'genuine' | 'limit_reached' | 'invalid' | 'deactivated' | 'blocked';

export type ProductVerificationCode = {
  id: string;
  product_id: string;
  batch_id?: string;
  code: string;
  batch_number: string;
  serial_number?: string;
  max_scans: number;
  scan_count: number;
  status: VerificationCodeStatus;
  created_at: string;
  updated_at: string;
  product_name?: string;
  product_code?: string;
};

export type VerificationCodeBatch = {
  id: string;
  product_id: string;
  batch_name?: string;
  batch_number: string;
  quantity: number;
  created_by?: string;
  created_at: string;
};

export type ProductVerificationScan = {
  id: string;
  verification_code_id: string;
  scan_number: number;
  scanned_at: string;
  ip_hash?: string;
  user_agent?: string;
  result: VerificationScanResult;
  created_at: string;
};

export type SafeProductInfo = {
  name: string;
  product_code: string;
  batch_number: string;
  size: string;
  purity?: string;
  format?: string;
};

export type VerifyApiResponse = {
  status: VerificationScanResult;
  scan_number?: number;
  scan_count?: number;
  max_scans?: number;
  scans_remaining?: number;
  code?: string;
  product?: SafeProductInfo;
  product_name?: string;
  batch_number?: string;
  product_code?: string;
  size?: string;
  purity?: string;
  format?: string;
  storage?: string;
  serial_number?: string;
  first_verified_at?: string;
  last_verified_at?: string;
  verified_at?: string;
  message?: string;
};
