'use client';

import React from 'react';
import Link from 'next/link';
import { VerifyApiResponse } from '@/types/verification';
import { ScanProgress } from './ScanProgress';
import { ProductVerificationDetails } from './ProductVerificationDetails';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  XCircle,
  Headphones,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Lock
} from 'lucide-react';

export function VerificationResultCard({
  result,
  onReset,
}: {
  result: VerifyApiResponse;
  onReset: () => void;
}) {
  const code = result.code || '';
  const contactUrl = `/support/new?category=Product%20Verification${
    code ? `&code=${encodeURIComponent(code)}` : ''
  }&subject=${encodeURIComponent(`Product Verification Support — Code: ${code}`)}`;

  // 1. GENUINE SCANS (Scan 1, Scan 2, Scan 3)
  if (result.status === 'genuine') {
    const scanNumber = result.scan_number || 1;
    const scansRemaining = result.scans_remaining ?? (3 - scanNumber);

    return (
      <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Genuine Icon & Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-accent-success flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-orbitron text-xs font-extrabold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>✓ PRODUCT IS GENUINE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
            {scanNumber === 1
              ? 'FIRST SCAN'
              : scanNumber === 2
              ? 'SECOND SCAN'
              : 'THIRD SCAN'}
          </h2>

          <p className="text-xs sm:text-sm text-content-secondary font-sans max-w-md mx-auto leading-relaxed">
            {scanNumber === 1 &&
              'This code is genuine. This is the first scan of this product.'}
            {scanNumber === 2 &&
              'This product code is genuine. This is the second scan of this product.'}
            {scanNumber === 3 &&
              'This product code is genuine. This is the third scan of this product.'}
          </p>
        </div>

        {/* Scan Progress Bar */}
        <ScanProgress scanNumber={scanNumber} maxScans={result.max_scans || 3} />

        {/* Scans Remaining Indicator */}
        <div className="p-3 rounded-2xl bg-brand-subtle border border-brand-border/80 flex items-center justify-between text-xs font-orbitron">
          <span className="text-content-muted">AUTHENTICATION LIFECYCLE</span>
          <span className="font-bold text-brand">
            {scansRemaining > 0
              ? `${scansRemaining} ${scansRemaining === 1 ? 'MORE SCAN' : 'SCANS'} REMAINING`
              : 'NO SCANS REMAINING'}
          </span>
        </div>

        {/* Product Details Card - Always Showcase Batch No & Product Name */}
        <ProductVerificationDetails
          product={
            result.product || {
              name: result.product_name || 'Research Peptide',
              batch_number: result.batch_number || 'LOT VERIFIED',
              product_code: result.product_code || 'PB-SPEC',
              size: result.size || '5 mg',
              purity: result.purity || '99%+',
              format: result.format || 'Lyophilized Solid',
            }
          }
          code={result.code}
          verifiedAt={result.verified_at}
        />

        {/* Scan 3 Special Support Card */}
        {scanNumber >= 3 && (
          <div className="p-6 rounded-3xl bg-purple-900 text-white text-left space-y-3 shadow-purple-glow">
            <div className="flex items-center space-x-2 font-orbitron font-bold text-sm text-purple-200">
              <Headphones className="w-4 h-4 text-purple-300" />
              <span>NEED HELP WITH SCAN HISTORY?</span>
            </div>
            <p className="text-xs text-purple-100 font-sans leading-relaxed">
              This code has reached its maximum verification scans (3/3). If you are checking this product again, please contact our support team to verify the product and scan history.
            </p>
            <Link
              href={contactUrl}
              className="inline-flex items-center px-6 py-2.5 bg-white text-brand hover:bg-brand-light font-orbitron text-xs font-bold rounded-full transition-all"
            >
              <span>CONTACT SUPPORT</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>VERIFY ANOTHER PRODUCT</span>
          </button>
        </div>

      </div>
    );
  }

  // 2. LIMIT REACHED STATE (Scan 4+)
  if (result.status === 'limit_reached') {
    return (
      <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-accent-warning flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-orbitron text-xs font-bold tracking-wider">
            SECURITY SCAN LIMIT
          </span>
          <h2 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
            VERIFICATION LIMIT REACHED
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary font-sans max-w-md mx-auto leading-relaxed">
            This verification code has already been scanned 3 times. For security reasons, no additional automatic verification is available. Please contact our support team to check this product.
          </p>
        </div>

        {/* Showcase Batch No & Product Name on Limit Reached */}
        {(result.product || result.product_name || result.batch_number) && (
          <ProductVerificationDetails
            product={
              result.product || {
                name: result.product_name || 'Research Peptide',
                batch_number: result.batch_number || 'N/A',
                product_code: result.product_code || 'PB-SPEC',
                size: result.size || '5 mg',
                purity: result.purity || '99%+',
                format: result.format || 'Lyophilized Solid',
              }
            }
            code={result.code}
            verifiedAt={result.verified_at}
          />
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={contactUrl}
            className="px-8 py-3.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all flex items-center justify-center space-x-2"
          >
            <Headphones className="w-4 h-4" />
            <span>CONTACT SUPPORT</span>
          </Link>
          <button
            onClick={onReset}
            className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-content-primary font-orbitron text-xs font-semibold rounded-full transition-all"
          >
            TRY ANOTHER CODE
          </button>
        </div>

      </div>
    );
  }

  // 3. INVALID CODE STATE
  if (result.status === 'invalid') {
    return (
      <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-accent-danger flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-accent-danger font-orbitron text-xs font-bold tracking-wider">
            UNRECOGNIZED CODE
          </span>
          <h2 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
            VERIFICATION FAILED
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary font-sans max-w-md mx-auto leading-relaxed">
            We could not find this verification code. Please check the code printed on your product box and try again. If you believe this product should be genuine, please contact support.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-8 py-3.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all"
          >
            RE-ENTER CODE
          </button>
          <Link
            href={contactUrl}
            className="px-6 py-3.5 bg-white border border-brand-border text-brand hover:bg-brand-light font-orbitron text-xs font-semibold rounded-full transition-all flex items-center justify-center space-x-1.5"
          >
            <Headphones className="w-4 h-4" />
            <span>CONTACT SUPPORT</span>
          </Link>
        </div>

      </div>
    );
  }

  // 4. DEACTIVATED OR BLOCKED CODE STATE
  return (
    <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      <div className="w-16 h-16 rounded-2xl bg-gray-100 text-content-secondary flex items-center justify-center mx-auto">
        <Lock className="w-10 h-10 text-brand" />
      </div>

      <div className="space-y-2">
        <span className="px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-brand font-orbitron text-xs font-bold tracking-wider">
          STATUS RESTRICTION
        </span>
        <h2 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
          VERIFICATION UNAVAILABLE
        </h2>
        <p className="text-xs sm:text-sm text-content-secondary font-sans max-w-md mx-auto leading-relaxed">
          This verification code is currently unavailable. Please contact our support team for assistance.
        </p>
      </div>

      {code && (
        <div className="p-3 bg-brand-subtle rounded-2xl border border-brand-border inline-block text-xs font-mono font-bold text-brand">
          Code: {code}
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={contactUrl}
          className="px-8 py-3.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all flex items-center justify-center space-x-2"
        >
          <Headphones className="w-4 h-4" />
          <span>CONTACT SUPPORT</span>
        </Link>
        <button
          onClick={onReset}
          className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-content-primary font-orbitron text-xs font-semibold rounded-full transition-all"
        >
          ENTER ANOTHER CODE
        </button>
      </div>

    </div>
  );
}
