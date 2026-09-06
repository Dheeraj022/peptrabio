import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Truck,
  RotateCcw,
  DollarSign,
  Cookie,
  ArrowRight,
  Lock
} from 'lucide-react';

export default function PoliciesHubPage() {
  const policies = [
    {
      title: 'Research Use Policy',
      href: '/policies/research-use',
      icon: ShieldAlert,
      featured: true,
      description: 'Critical compliance declaration defining in vitro laboratory research-use requirements and prohibiting human/clinical application.',
    },
    {
      title: 'Legal Disclaimer',
      href: '/policies/disclaimer',
      icon: ShieldCheck,
      featured: false,
      description: 'Official statements regarding chemical classification, absence of medical treatment claims, and buyer responsibilities.',
    },
    {
      title: 'Terms of Sale & Service',
      href: '/policies/terms',
      icon: FileText,
      featured: false,
      description: 'Commercial terms governing research catalog purchases, compliance attestations, and institutional buyer terms.',
    },
    {
      title: 'Privacy Policy',
      href: '/policies/privacy',
      icon: Lock,
      featured: false,
      description: 'Commitments regarding data protection, encryption of institutional transaction records, and confidential order processing.',
    },
    {
      title: 'Shipping & Cold Chain Policy',
      href: '/policies/shipping',
      icon: Truck,
      featured: false,
      description: 'Protocols for temperature-controlled transit, protective packaging, dispatch timelines, and carrier logistics.',
    },
    {
      title: 'Return Policy',
      href: '/policies/returns',
      icon: RotateCcw,
      featured: false,
      description: 'Guidelines governing non-tampered batch returns, laboratory verification, and handling of damaged consignments.',
    },
    {
      title: 'Refund Policy',
      href: '/policies/refund',
      icon: DollarSign,
      featured: false,
      description: 'Conditions under which credits or order refunds are processed for non-conforming lots or transport damages.',
    },
    {
      title: 'Cookie Policy',
      href: '/policies/cookie',
      icon: Cookie,
      featured: false,
      description: 'Information regarding session cookies utilized for cart persistence and secure administrative authentication.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-light text-brand text-xs font-orbitron font-semibold tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LEGAL & COMPLIANCE FRAMEWORK</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-orbitron font-extrabold text-content-primary">
          POLICIES & COMPLIANCE
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
          Peptra Bio operates under strict compliance guidelines for the lawful distribution of research-grade biochemical peptides. Review our operational, shipping, and legal terms below.
        </p>
      </div>

      {/* Grid of Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => {
          const Icon = policy.icon;
          return (
            <Link
              key={policy.href}
              href={policy.href}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between group ${
                policy.featured
                  ? 'bg-purple-900 text-white border-purple-800 shadow-purple-glow md:col-span-2 lg:col-span-3'
                  : 'bg-white border-brand-border hover:border-brand hover:shadow-card-hover text-content-primary'
              }`}
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  policy.featured ? 'bg-purple-800 text-purple-200' : 'bg-brand-light text-brand'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex items-center justify-between">
                  <h2 className={`font-orbitron font-bold text-base ${
                    policy.featured ? 'text-white text-lg' : 'text-content-primary group-hover:text-brand'
                  }`}>
                    {policy.title}
                  </h2>
                  {policy.featured && (
                    <span className="px-3 py-1 rounded-full bg-purple-700 text-purple-200 font-orbitron text-[10px] font-bold">
                      PRIMARY MANDATORY POLICY
                    </span>
                  )}
                </div>

                <p className={`text-xs font-sans leading-relaxed ${
                  policy.featured ? 'text-purple-200 max-w-3xl' : 'text-content-secondary'
                }`}>
                  {policy.description}
                </p>
              </div>

              <div className={`pt-4 mt-2 flex items-center text-xs font-orbitron font-semibold ${
                policy.featured ? 'text-purple-300' : 'text-brand'
              }`}>
                <span>READ COMPLETE POLICY</span>
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
