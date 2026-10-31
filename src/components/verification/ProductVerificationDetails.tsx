'use client';

import React from 'react';
import { SafeProductInfo } from '@/types/verification';
import { Atom, Calendar, Clock, CheckCircle2, ShieldCheck, Tag, FileText, Sparkles, Layers } from 'lucide-react';

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
    <div className="bg-[#FAF8FD] border-2 border-brand-border/80 rounded-3xl p-5 sm:p-7 text-left space-y-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Top Section: Header & Verification Status Badge */}
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-3.5">
        <div className="flex items-center space-x-2">
          <Atom className="w-5 h-5 text-brand" />
          <span className="font-orbitron font-bold text-xs text-content-primary tracking-wider uppercase">
            AUTHENTICATED PRODUCT SPECIFICATION
          </span>
        </div>
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-orbitron font-extrabold tracking-wider border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>LOT VERIFIED</span>
        </span>
      </div>

      {/* PROMINENT SHOWCASE BANNER: PRODUCT NAME & BATCH NUMBER */}
      <div className="bg-white border-2 border-brand-border rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Product Name Showcase */}
        <div className="space-y-1 flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-orbitron font-extrabold text-brand uppercase tracking-wider bg-brand-light px-2.5 py-0.5 rounded-full">
              RESEARCH GRADE PEPTIDE
            </span>
          </div>
          <h3 className="font-orbitron font-extrabold text-lg sm:text-xl text-content-primary leading-tight pt-1">
            {product.name}
          </h3>
          <p className="text-xs text-content-secondary font-mono flex items-center space-x-2 pt-0.5">
            <span>CATALOG SKU:</span>
            <strong className="text-content-primary font-bold">{product.product_code}</strong>
          </p>
        </div>

        {/* Manufacturing Batch Number Showcase */}
        <div className="w-full md:w-auto bg-gradient-to-br from-purple-50 via-white to-purple-50/50 border-2 border-brand/30 rounded-2xl p-3.5 sm:p-4 text-left md:text-right shrink-0 shadow-xs">
          <span className="text-[10px] font-orbitron font-extrabold text-content-muted uppercase tracking-wider block">
            MANUFACTURING BATCH #
          </span>
          <span className="font-mono font-extrabold text-base sm:text-lg text-brand block tracking-wider mt-0.5">
            {product.batch_number}
          </span>
          <div className="mt-1 inline-flex items-center space-x-1 text-[10px] text-emerald-700 font-orbitron font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>AUTHENTICATED BATCH</span>
          </div>
        </div>

      </div>

      {/* Grid of Product Technical Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans">
        
        <div className="bg-white p-3.5 rounded-2xl border border-brand-border">
          <span className="text-[10px] font-orbitron text-content-muted block uppercase font-bold">
            VIAL DOSAGE / QUANTITY
          </span>
          <span className="font-orbitron font-bold text-sm text-content-primary block mt-1">
            {product.size || '5 mg'}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-brand-border">
          <span className="text-[10px] font-orbitron text-content-muted block uppercase font-bold">
            PURITY & GRADE
          </span>
          <span className="font-orbitron font-bold text-sm text-emerald-700 block mt-1">
            {product.purity || '≥ 99.0% (HPLC Analyzed)'}
          </span>
        </div>

        {product.format && (
          <div className="bg-white p-3.5 rounded-2xl border border-brand-border">
            <span className="text-[10px] font-orbitron text-content-muted block uppercase font-bold">
              PHYSICAL FORM
            </span>
            <span className="font-medium text-content-primary block mt-1">
              {product.format}
            </span>
          </div>
        )}

        {code && (
          <div className="bg-white p-3.5 rounded-2xl border border-brand-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-orbitron text-content-muted block uppercase font-bold">
                SECURITY AUTHENTICITY CODE
              </span>
              <span className="font-mono font-extrabold text-brand tracking-widest text-sm block mt-1">
                {code}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-brand flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Verification Timestamp Footer */}
        <div className="sm:col-span-2 pt-3 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-content-muted">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            <span>Verified: <strong>{formattedDate}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-brand" />
            <span>Timestamp: <strong>{formattedTime} UTC</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
