import React from 'react';
import Link from 'next/link';
import { Cookie, ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <Link href="/policies" className="inline-flex items-center text-xs font-orbitron text-brand hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> BACK TO POLICIES HUB
      </Link>
      <div className="space-y-3 border-b border-brand-border pb-6">
        <h1 className="text-3xl font-orbitron font-extrabold text-content-primary">
          COOKIE POLICY
        </h1>
        <div className="text-xs text-content-muted">Session and State Management Standards</div>
      </div>
      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Functional Cookies</h2>
          <p>
            We utilize essential, strictly functional session storage and cookies to maintain your shopping cart state, persist catalog filter preferences, and manage authenticated administrator sessions.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">No Third-Party Ad Tracking</h2>
          <p>
            Peptra Bio does not deploy intrusive third-party cross-site advertising trackers or behavioral targeting pixels.
          </p>
        </div>
      </div>
    </div>
  );
}
