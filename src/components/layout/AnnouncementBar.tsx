import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, FlaskConical } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';

export function AnnouncementBar() {
  return (
    <div className="bg-[#1C122C] text-white text-xs py-2 px-3 sm:px-4 border-b border-purple-900/40 font-orbitron tracking-wider overflow-x-auto scrollbar-none whitespace-nowrap">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-6 min-w-max md:min-w-0">
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          <span className="inline-flex items-center text-purple-300 font-semibold text-[11px] md:text-xs">
            <FlaskConical className="w-3.5 h-3.5 mr-1.5 text-purple-400 animate-pulse shrink-0" />
            RESEARCH USE ONLY
          </span>
          <span className="text-purple-400/60">•</span>
          <span className="text-gray-300 text-[11px] md:text-xs font-sans">
            Synthetic Peptide rDNA Technology
          </span>
          <span className="text-purple-400/60">•</span>
          <span className="text-gray-300 text-[11px] md:text-xs font-sans">
            HPLC & MS Verified Batch Documentation
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-5 text-[11px] font-sans shrink-0">
          <CurrencySelector variant="announcement" />
          <Link
            href="/verify"
            className="flex items-center text-purple-200 hover:text-white transition-colors font-orbitron text-[10px] shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-400 shrink-0" />
            VERIFY AUTHENTICITY
          </Link>
          <Link
            href="/policies/research-use"
            className="flex items-center text-purple-200 hover:text-white transition-colors shrink-0"
          >
            Compliance
          </Link>
          <Link
            href="/contact"
            className="flex items-center text-purple-200 hover:text-white transition-colors shrink-0"
          >
            <FileText className="w-3.5 h-3.5 mr-1 text-purple-400 shrink-0" />
            Request COA
          </Link>
        </div>
      </div>
    </div>
  );
}
