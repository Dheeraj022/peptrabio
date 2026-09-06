import React from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Atom,
  ShieldCheck,
  FlaskConical,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-light text-brand text-xs font-orbitron font-semibold tracking-wider">
          <Atom className="w-3.5 h-3.5" />
          <span>SCIENTIFIC INTEGRITY & STANDARDS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-orbitron font-extrabold text-content-primary tracking-tight">
          ADVANCED PEPTIDE RESEARCH INFRASTRUCTURE
        </h1>
        <p className="text-xs sm:text-base text-content-secondary font-sans leading-relaxed">
          Peptra Bio supplies certified, high-performance research peptides and synthetic biological sequences to academic institutions, biotechnology enterprises, and accredited analytical laboratories.
        </p>
      </div>

      {/* 4 Standards Cards (from Section 40 of spec) */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-orbitron font-bold text-2xl text-content-primary">
            OUR CORE STANDARDS
          </h2>
          <p className="text-xs text-content-muted font-sans mt-1">
            Built from the ground up to support reproducible laboratory science.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-3xl bg-white border border-brand-border hover:border-brand shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-orbitron font-bold text-sm text-content-primary uppercase">
              DOCUMENTATION
            </h3>
            <p className="text-xs text-content-secondary font-sans leading-relaxed">
              Every sequence is accompanied by unambiguous analytical profiles, molecular weight calculations, and verifiable batch test records.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-brand-border hover:border-brand shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-orbitron font-bold text-sm text-content-primary uppercase">
              TRACEABILITY
            </h3>
            <p className="text-xs text-content-secondary font-sans leading-relaxed">
              Batch-level tracking codes ensure end-to-end custody records from solid-phase peptide synthesis through final lyophilization.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-brand-border hover:border-brand shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-orbitron font-bold text-sm text-content-primary uppercase">
              TRANSPARENCY
            </h3>
            <p className="text-xs text-content-secondary font-sans leading-relaxed">
              Straightforward catalog pricing, realistic chemical purity benchmarks, and publicly accessible Certificates of Analysis.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-brand-border hover:border-brand shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="font-orbitron font-bold text-sm text-content-primary uppercase">
              RESEARCH FOCUS
            </h3>
            <p className="text-xs text-content-secondary font-sans leading-relaxed">
              Strictly non-therapeutic positioning focused on supporting lawful, reproducible in vitro biochemistry and molecular pharmacology.
            </p>
          </div>

        </div>
      </div>

      {/* Analytical Testing Workflow */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#FAF8FD] border border-brand-border space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="font-orbitron text-xs text-brand font-bold uppercase">Quality Assurance Process</span>
          <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-content-primary">
            ANALYTICAL PURITY TESTING
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
            Our synthesis protocols adhere to high-grade solid phase peptide synthesis (SPPS) methodologies followed by dual-stage analytical verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-brand-border space-y-2">
            <div className="font-orbitron font-bold text-sm text-brand">1. RP-HPLC CHROMATOGRAPHY</div>
            <p className="text-xs text-content-secondary font-sans leading-relaxed">
              Reversed-Phase High-Performance Liquid Chromatography isolates target peptide sequences and quantifies net chemical purity exceeding 99%.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-brand-border space-y-2">
            <div className="font-orbitron font-bold text-sm text-brand">2. MASS SPECTROMETRY (MS)</div>
            <p className="text-xs text-content-secondary font-sans leading-relaxed">
              Electrospray Ionization Mass Spectrometry (ESI-MS) confirms exact molecular mass conformity to theoretical amino acid sequence specifications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-brand-border space-y-2">
            <div className="font-orbitron font-bold text-sm text-brand">3. VACUUM LYOPHILIZATION</div>
            <p className="text-xs text-content-secondary font-sans leading-relaxed">
              Free-flowing lyophilized solids sealed under sterile conditions to preserve chemical stability during cold-chain and ambient dispatch.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-brand-border/60">
          <div className="text-xs text-content-secondary">
            Looking for specific batch verification or documentation?
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all flex items-center"
          >
            <span>CONTACT SCIENTIFIC DESK</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
