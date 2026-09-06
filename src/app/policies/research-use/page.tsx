import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ResearchUsePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      
      <Link
        href="/policies"
        className="inline-flex items-center text-xs font-orbitron text-brand hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        BACK TO POLICIES HUB
      </Link>

      <div className="space-y-3 border-b border-brand-border pb-6">
        <div className="flex items-center space-x-2 text-xs font-orbitron text-brand font-semibold uppercase">
          <ShieldAlert className="w-4 h-4" />
          <span>Core Compliance Policy</span>
        </div>
        <h1 className="text-3xl font-orbitron font-extrabold text-content-primary">
          RESEARCH USE ONLY (RUO) POLICY
        </h1>
        <div className="text-xs text-content-muted">Last Updated: January 2025 • Policy ID: POL-RUO-01</div>
      </div>

      {/* Critical Highlight Alert */}
      <div className="p-6 rounded-3xl bg-purple-900 text-white space-y-3 shadow-purple-glow">
        <h2 className="font-orbitron font-bold text-base text-purple-200">
          STRICT MANDATORY STATEMENT
        </h2>
        <p className="text-xs text-purple-100 leading-relaxed">
          All chemical compounds, reagents, and peptide sequences supplied by Peptra Bio are sold strictly and exclusively for <strong>in vitro laboratory research, analytical testing, and biochemical investigation</strong> by qualified scientific professionals. These products are NOT drugs, foods, cosmetics, medical devices, or supplements and are NOT intended for human or animal administration under any circumstances.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-content-secondary leading-relaxed">
        
        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">
            1. Prohibited Uses
          </h2>
          <p>The purchaser agrees that products obtained from Peptra Bio shall NOT be used for:</p>
          <ul className="list-disc pl-5 space-y-1 text-content-primary font-medium">
            <li>Any in vivo human or animal clinical diagnostic or therapeutic applications.</li>
            <li>Direct ingestion, injection, topical administration, or self-dosing.</li>
            <li>Integration into consumer products, pharmaceutical preparations, or cosmetics without required statutory authorizations.</li>
            <li>Resale to non-qualified individuals or unauthorized third-party commercial distribution.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">
            2. Buyer Attestation & Laboratory Competence
          </h2>
          <p>
            By placing an order, the purchaser explicitly represents and warrants that they are an authorized researcher, laboratory technician, or institutional representative possessing suitable chemical containment equipment, proper personal protective equipment (PPE), and appropriate training to handle lyophilized research compounds.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">
            3. Regulatory Classification
          </h2>
          <p>
            Products have not been evaluated or approved by the United States Food and Drug Administration (FDA), European Medicines Agency (EMA), or equivalent international health authorities for safety or therapeutic efficacy. No therapeutic claims are made, expressed, or implied.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-orbitron font-bold text-base text-content-primary">
            4. Order Rejection & Account Termination
          </h2>
          <p>
            Peptra Bio reserves the unilateral right to cancel orders and close accounts if there is reason to believe that materials will be utilized in violation of this Research Use Policy or applicable local, state, or federal laws.
          </p>
        </div>

      </div>

    </div>
  );
}
