import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, FlaskConical } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';

export function AnnouncementBar() {
  return (
    <div className="bg-[#1C122C] text-white text-xs py-2 px-4 border-b border-purple-900/40 font-orbitron tracking-wider">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-4 mx-auto md:mx-0">
          <span className="inline-flex items-center text-purple-300 font-semibold text-[11px] md:text-xs">
            <FlaskConical className="w-3.5 h-3.5 mr-1.5 text-purple-400 animate-pulse" />
            RESEARCH USE ONLY
          </span>
          <span className="hidden sm:inline text-purple-400/60">•</span>
          <span className="hidden sm:inline text-gray-300 text-[11px] md:text-xs font-sans">
            HPLC & MS Verified Batch Documentation
          </span>
          <span className="hidden md:inline text-purple-400/60">•</span>
          <span className="hidden md:inline text-gray-300 text-[11px] md:text-xs font-sans">
            Lyophilized Solid Formulation
          </span>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6 text-[11px] font-sans mx-auto lg:mx-0">
          <CurrencySelector variant="announcement" />
          <Link
            href="/verify"
            className="flex items-center text-purple-200 hover:text-white transition-colors font-orbitron text-[10px]"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-400" />
            VERIFY AUTHENTICITY
          </Link>
          <Link
            href="/policies/research-use"
            className="hidden sm:flex items-center text-purple-200 hover:text-white transition-colors"
          >
            Compliance
          </Link>
          <Link
            href="/contact"
            className="hidden md:flex items-center text-purple-200 hover:text-white transition-colors"
          >
            <FileText className="w-3.5 h-3.5 mr-1 text-purple-400" />
            Request COA
          </Link>
        </div>
      </div>
    </div>
  );
}
