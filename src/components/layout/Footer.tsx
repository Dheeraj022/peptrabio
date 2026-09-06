import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Mail, MapPin, Clock, FileCheck } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

export function Footer() {
  return (
    <footer className="bg-[#120B1D] text-gray-300 border-t border-purple-900/50">
      {/* Upper Footer: Main Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" variant="footer" />
            <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-sm">
              Peptra Bio provides ultra-pure, HPLC and MS-verified synthetic peptide sequences formulated exclusively for in vitro scientific research, biochemical analysis, and laboratory calibration.
            </p>
            <div className="flex items-center space-x-2 text-xs text-purple-300 font-orbitron">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span>Full Batch Traceability & Public COAs</span>
            </div>
          </div>

          {/* Catalog Categories */}
          <div className="space-y-3">
            <h3 className="font-orbitron font-semibold text-xs tracking-wider text-white uppercase">
              Research Catalog
            </h3>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <Link href="/shop?category=neuropeptides" className="hover:text-purple-300 transition-colors">
                  Neuropeptides
                </Link>
              </li>
              <li>
                <Link href="/shop?category=cellular-research" className="hover:text-purple-300 transition-colors">
                  Cellular & Tissue Research
                </Link>
              </li>
              <li>
                <Link href="/shop?category=longevity-research" className="hover:text-purple-300 transition-colors">
                  Longevity & Epigenetics
                </Link>
              </li>
              <li>
                <Link href="/shop?category=metabolic-peptides" className="hover:text-purple-300 transition-colors">
                  Metabolic Peptides
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-purple-400 hover:underline font-orbitron text-[11px] block pt-1">
                  View All Products →
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-purple-300 hover:underline font-orbitron text-[11px] block pt-1">
                  Research Blog & Guides →
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Policies (All 8 routes) */}
          <div className="space-y-3">
            <h3 className="font-orbitron font-semibold text-xs tracking-wider text-white uppercase">
              Compliance & Policies
            </h3>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <Link href="/policies/research-use" className="text-purple-300 font-medium hover:underline">
                  Research Use Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/disclaimer" className="hover:text-purple-300 transition-colors">
                  Legal Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-purple-300 transition-colors">
                  Terms of Sale & Service
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-purple-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-purple-300 transition-colors">
                  Shipping & Cold Chain
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-purple-300 transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/refund" className="hover:text-purple-300 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/cookie" className="hover:text-purple-300 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Laboratory Inquiries */}
          <div className="space-y-3">
            <h3 className="font-orbitron font-semibold text-xs tracking-wider text-white uppercase">
              Documentation & Support
            </h3>
            <ul className="space-y-2.5 text-xs font-sans text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <a href="mailto:support@peptrabio.com" className="hover:text-white transition-colors">
                  support@peptrabio.com
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Mon – Fri: 9:00 AM – 5:00 PM EST</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Bio-Research Park, Cambridge, MA</span>
              </li>
              <li className="pt-2 flex flex-wrap gap-2">
                <Link
                  href="/contact"
                  className="inline-block px-3.5 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 rounded-full text-[11px] font-orbitron tracking-wider transition-colors"
                >
                  CONTACT DESK
                </Link>
                <Link
                  href="/support"
                  className="inline-block px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white border border-brand rounded-full text-[11px] font-orbitron tracking-wider transition-colors shadow-purple-sm"
                >
                  SUPPORT TICKETS
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Research Compliance Banner */}
        <div className="mt-12 p-5 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="p-2.5 rounded-xl bg-purple-900/80 text-purple-300 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-[11px] text-gray-300 leading-relaxed font-sans">
            <strong className="font-orbitron text-purple-300 font-semibold tracking-wide">
              COMPLIANCE & RESEARCH USE NOTICE:
            </strong>{' '}
            All chemical compounds and peptide sequences offered by Peptra Bio are synthesized strictly for laboratory research, in vitro studies, analytical testing, and scientific investigation. Products are not intended for human consumption, medical diagnosis, therapeutic use, veterinary use, or inclusion in food, drugs, or cosmetics. Any purchase implies full acceptance of our Research Use Policy.
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-purple-900/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-sans gap-2">
          <div>
            © {new Date().getFullYear()} PEPTRA BIO INC. ALL RIGHTS RESERVED.
          </div>
          <div className="flex space-x-4 font-orbitron text-[10px]">
            <Link href="/policies/research-use" className="hover:text-purple-400">RESEARCH ONLY</Link>
            <Link href="/policies/disclaimer" className="hover:text-purple-400">LEGAL DISCLAIMER</Link>
            <Link href="/account" className="hover:text-purple-400">RESEARCHER PORTAL</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
