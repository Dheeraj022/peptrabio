import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <Link href="/policies" className="inline-flex items-center text-xs font-orbitron text-brand hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> BACK TO POLICIES HUB
      </Link>
      <div className="space-y-3 border-b border-brand-border pb-6">
        <h1 className="text-3xl font-orbitron font-extrabold text-content-primary">
          LEGAL & SCIENTIFIC DISCLAIMER
        </h1>
        <div className="text-xs text-content-muted">Peptra Bio Legal Operations</div>
      </div>
      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">No Medical or Clinical Claims</h2>
          <p>
            The content, literature abstracts, and product specifications provided on this website are compiled strictly for informational, educational, and chemical catalog identification purposes. Nothing on this website constitutes medical advice, clinical recommendation, or encouragement of human self-treatment.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Limitation of Liability</h2>
          <p>
            Peptra Bio, its directors, employees, and scientific partners shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the handling, storage, improper use, or disposal of any chemical material purchased through this catalog.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Indemnification</h2>
          <p>
            The buyer agrees to indemnify, defend, and hold harmless Peptra Bio from and against any and all claims, liabilities, damages, costs, and expenses arising out of the buyer's possession, use, storage, or distribution of products supplied.
          </p>
        </div>
      </div>
    </div>
  );
}
