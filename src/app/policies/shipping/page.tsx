import React from 'react';
import Link from 'next/link';
import { Truck, ArrowLeft } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      <Link href="/policies" className="inline-flex items-center text-xs font-orbitron text-brand hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> BACK TO POLICIES HUB
      </Link>
      <div className="space-y-3 border-b border-brand-border pb-6">
        <h1 className="text-3xl font-orbitron font-extrabold text-content-primary">
          SHIPPING & COLD CHAIN POLICY
        </h1>
        <div className="text-xs text-content-muted">Logistics & Packaging Standards</div>
      </div>
      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Packaging & Stability</h2>
          <p>
            All peptide products are supplied as dry, vacuum-sealed lyophilized powders. In this formulation, compounds demonstrate high thermal stability during ambient and expedited transit. Shipments are packed in protective insulated cartons.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">Dispatch Timelines</h2>
          <p>
            Orders confirmed Monday through Friday before 2:00 PM EST are packaged and queued for courier pickup within 24–48 hours. Tracking details are transmitted to the purchaser upon dispatch.
          </p>
        </div>
      </div>
    </div>
  );
}
