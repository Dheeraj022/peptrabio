'use client';

import React from 'react';
import { SafeProductInfo } from '@/types/verification';
import { Atom, Package, Calendar, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export function ProductVerificationDetails({
  product,
  code,
  verifiedAt,
}: {
  product: SafeProductInfo;
  code?: string;
  verifiedAt?: string;
}) {
  const formattedDate = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString();

  const formattedTime = verifiedAt
    ? new Date(verifiedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : new Date().toLocaleTimeString();

  return (
    <div className="bg-[#FAF8FD] border border-brand-border rounded-3xl p-6 sm:p-7 text-left space-y-4 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
        <div className="flex items-center space-x-2">
          <Atom className="w-5 h-5 text-brand" />
          <span className="font-orbitron font-bold text-xs text-content-primary tracking-wider">
            AUTHENTICATED PRODUCT SPECIFICATION
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-orbitron font-bold">
          LOT VERIFIED
        </span>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
        
        <div>
          <span className="text-[10px] font-orbitron text-content-muted block uppercase">PRODUCT NAME</span>
          <span className="font-orbitron font-bold text-sm text-content-primary block mt-0.5">
            {product.name}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-orbitron text-content-muted block uppercase">CATALOG SKU / CODE</span>
          <span className="font-mono font-semibold text-content-primary block mt-0.5">
            {product.product_code}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-orbitron text-content-muted block uppercase">MANUFACTURING BATCH #</span>
          <span className="font-mono font-bold text-brand block mt-0.5">
            {product.batch_number}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-orbitron text-content-muted block uppercase">VIAL SIZE / DOSAGE</span>
          <span className="font-medium text-content-primary block mt-0.5">
            {product.size} {product.purity ? `• ${product.purity}` : ''}
          </span>
        </div>

        {code && (
          <div className="sm:col-span-2 bg-white p-3 rounded-2xl border border-brand-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-orbitron text-content-muted block uppercase">AUTHENTICITY CODE</span>
              <span className="font-mono font-bold text-brand tracking-wider text-xs">{code}</span>
            </div>
            <ShieldCheck className="w-4 h-4 text-brand" />
          </div>
        )}

        <div className="sm:col-span-2 pt-2 border-t border-brand-border/40 flex flex-wrap items-center justify-between text-[11px] text-content-muted">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            <span>Verified: {formattedDate}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-brand" />
            <span>Time: {formattedTime} UTC</span>
          </div>
        </div>

      </div>

    </div>
  );
}
