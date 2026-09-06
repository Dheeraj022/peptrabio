import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <Link href="/policies" className="inline-flex items-center text-xs font-orbitron text-brand hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> BACK TO POLICIES HUB
      </Link>
      <div className="space-y-3 border-b border-brand-border pb-6">
        <h1 className="text-3xl font-orbitron font-extrabold text-content-primary">
          PRIVACY POLICY
        </h1>
        <div className="text-xs text-content-muted">Data Protection Standard</div>
      </div>
      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Information We Collect</h2>
          <p>
            We collect customer contact details, institutional affiliations, shipping addresses, and order history strictly for the lawful processing, packaging, and dispatch of research materials.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Data Security & Encryption</h2>
          <p>
            All communications and transaction submissions are encrypted using industry-standard Transport Layer Security (TLS 1.3 / SSL). We never sell, rent, or trade customer information to third-party marketing brokers.
          </p>
        </div>
      </div>
    </div>
  );
}
