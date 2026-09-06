import React from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <Link href="/policies" className="inline-flex items-center text-xs font-orbitron text-brand hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> BACK TO POLICIES HUB
      </Link>
      <div className="space-y-3 border-b border-brand-border pb-6">
        <h1 className="text-3xl font-orbitron font-extrabold text-content-primary">
          RETURN POLICY
        </h1>
        <div className="text-xs text-content-muted">Chain of Custody & Security Policy</div>
      </div>
      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Chain-of-Custody Restrictions</h2>
          <p>
            Due to strict laboratory quality assurance requirements and temperature-sensitive storage parameters, <strong>unsealed or opened peptide vials cannot be returned for restocking</strong>. This policy ensures all customers receive virgin, uncompromised lots directly from our quality-controlled synthesis repository.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Transit Damage Inquiries</h2>
          <p>
            If a package arrives with visible mechanical damage or vial breakage, please retain all original packaging materials and contact support@peptrabio.com within 48 hours of receipt with photographic documentation.
          </p>
        </div>
      </div>
    </div>
  );
}
