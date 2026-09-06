import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <Link href="/policies" className="inline-flex items-center text-xs font-orbitron text-brand hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> BACK TO POLICIES HUB
      </Link>
      <div className="space-y-3 border-b border-brand-border pb-6">
        <h1 className="text-3xl font-orbitron font-extrabold text-content-primary">
          TERMS OF SALE & SERVICE
        </h1>
        <div className="text-xs text-content-muted">Effective Date: January 2025</div>
      </div>
      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">1. Agreement to Terms</h2>
          <p>
            By accessing or ordering from Peptra Bio, you agree to be bound by these Terms of Sale, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laboratory regulations.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">2. Age and Legal Capacity</h2>
          <p>
            Purchases may only be conducted by individuals aged 21 years or older representing accredited research institutions, academic centers, or authorized commercial laboratories.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">3. Pricing and Order Acceptance</h2>
          <p>
            All prices are denominated in USD. Peptra Bio reserves the right to decline or cancel any order at its discretion, including instances of catalog pricing errors, suspected regulatory non-compliance, or inventory discrepancies.
          </p>
        </div>
      </div>
    </div>
  );
}
