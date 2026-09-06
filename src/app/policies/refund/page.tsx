import React from 'react';
import Link from 'next/link';
import { DollarSign, ArrowLeft } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <Link href="/policies" className="inline-flex items-center text-xs font-orbitron text-brand hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> BACK TO POLICIES HUB
      </Link>
      <div className="space-y-3 border-b border-brand-border pb-6">
        <h1 className="text-3xl font-orbitron font-extrabold text-content-primary">
          REFUND POLICY
        </h1>
        <div className="text-xs text-content-muted">Financial Settlement Policy</div>
      </div>
      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Non-Conforming Material Claims</h2>
          <p>
            If analytical testing conducted by the buyer reveals that a lot does not conform to the certified purity or molecular weight stated on the accompanying COA, a formal technical review may be requested within 30 days of receipt.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Resolution Options</h2>
          <p>
            Upon validation of analytical discrepancies, Peptra Bio will provide either an expedited replacement batch from an alternative lot or a complete refund to the original method of payment.
          </p>
        </div>
      </div>
    </div>
  );
}
