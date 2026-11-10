import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Compass,
  FlaskConical,
  BookOpen,
  ShieldCheck,
  Headphones,
  Scale,
  UserCheck,
  ArrowRight,
  ExternalLink,
  Search,
} from 'lucide-react';
import { constructMetadata, generateBreadcrumbSchema, getSiteUrl } from '@/lib/seo-config';
import { SEED_PRODUCTS, SEED_CATEGORIES } from '@/lib/seed-data';
import { BLOG_POSTS } from '@/lib/blog-data';

export const metadata: Metadata = constructMetadata({
  title: 'HTML Website Sitemap & Research Directory',
  description:
    'Comprehensive directory of all research peptide specifications, analytical articles, HPLC verification tools, and laboratory compliance documentation on Peptra Bio.',
  path: '/sitemap',
  keywords: [
    'Peptra Bio sitemap',
    'peptide directory',
    'research peptide catalog index',
    'HPLC documentation links',
    'peptide research guides',
  ],
});

interface SitemapLink {
  label: string;
  href: string;
  subtitle?: string;
  tag?: string;
}

interface SitemapSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  description: string;
  links: SitemapLink[];
}

export default function HtmlSitemapPage() {
  const siteUrl = getSiteUrl();

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Sitemap', url: '/sitemap' },
  ];

  const sections: SitemapSection[] = [
    {
      title: '1. Research Peptides Catalog',
      icon: FlaskConical,
      badge: `${SEED_PRODUCTS.length} Peptides`,
      description: 'Ultra-pure lyophilized peptides and solvent reagents for scientific investigation.',
      links: SEED_PRODUCTS.map((prod) => ({
        label: prod.name,
        href: `/shop/${prod.slug}`,
        subtitle: `CAS: ${prod.cas_number || 'N/A'} • ${prod.size}`,
        tag: prod.category,
      })),
    },
    {
      title: '2. Research Categories',
      icon: Compass,
      badge: `${SEED_CATEGORIES.length} Categories`,
      description: 'Sequences cataloged by biochemical classification and research target.',
      links: [
        { label: 'All Peptides Catalog', href: '/shop', subtitle: 'Complete inventory list' },
        ...SEED_CATEGORIES.map((cat) => ({
          label: cat.name,
          href: `/shop?category=${cat.slug}`,
          subtitle: cat.description,
        })),
      ],
    },
    {
      title: '3. Scientific Articles & Research Insights',
      icon: BookOpen,
      badge: `${BLOG_POSTS.length} Articles`,
      description: 'Peer-reviewed insights, reconstitution protocols, and analytical chemistry notes.',
      links: [
        { label: 'Research Blog Hub', href: '/blog', subtitle: 'All published articles and analytical guides' },
        ...BLOG_POSTS.map((post) => ({
          label: post.title,
          href: `/blog/${post.slug}`,
          subtitle: `By ${post.author} • ${post.readTime}`,
          tag: post.category,
        })),
      ],
    },
    {
      title: '4. Authentication & Laboratory Quality',
      icon: ShieldCheck,
      badge: 'Analytical QA',
      description: 'Batch verification tools and purity confirmation protocols.',
      links: [
        { label: 'QR Peptide Verification Tool', href: '/verify', subtitle: 'Instant 3-stage cryptographic batch authentication' },
        { label: 'About Peptra Bio Synthesis', href: '/about', subtitle: 'rDNA peptide synthesis, HPLC and MS testing standards' },
      ],
    },
    {
      title: '5. Technical Inquiries & Researcher Support',
      icon: Headphones,
      badge: 'Help Desk',
      description: 'Communication channels with our scientific synthesis specialists.',
      links: [
        { label: 'Contact Laboratory Desk', href: '/contact', subtitle: 'General and institutional inquiries' },
        { label: 'Researcher Support Desk', href: '/support', subtitle: 'Ticketing system and documentation lookup' },
        { label: 'Submit Technical Ticket', href: '/support/new', subtitle: 'Direct inquiry for active orders & COAs' },
      ],
    },
    {
      title: '6. Institutional Compliance & Policies',
      icon: Scale,
      badge: 'Legal & RUO',
      description: 'Regulatory mandates, cold-chain standards, and research use agreements.',
      links: [
        { label: 'Compliance Policies Overview', href: '/policies', subtitle: 'Central regulatory & quality policies directory' },
        { label: 'Research Use Only (RUO) Policy', href: '/policies/research-use', subtitle: 'Mandatory non-clinical laboratory usage statement' },
        { label: 'Legal & Scientific Disclaimer', href: '/policies/disclaimer', subtitle: 'In vitro experimental scope notice' },
        { label: 'Terms of Sale & Laboratory Service', href: '/policies/terms', subtitle: 'Institutional procurement terms' },
        { label: 'Privacy & Data Protection', href: '/policies/privacy', subtitle: 'Researcher information and transaction security' },
        { label: 'Cold-Chain Shipping Policy', href: '/policies/shipping', subtitle: 'Temperature-controlled logistics protocols' },
        { label: 'Laboratory Return Policy', href: '/policies/returns', subtitle: 'Handling of transit damaged materials' },
        { label: 'Refund & Order Cancellation', href: '/policies/refund', subtitle: 'Order verification and refund standards' },
        { label: 'Cookie & Tracking Preferences', href: '/policies/cookie', subtitle: 'Technical cookies used on catalog' },
      ],
    },
    {
      title: '7. Customer & Institutional Account Portals',
      icon: UserCheck,
      badge: 'Portals',
      description: 'Requisition tracking, order history, and account settings.',
      links: [
        { label: 'Account Portal', href: '/account', subtitle: 'View past requisitions and tracking' },
        { label: 'Researcher Login', href: '/login', subtitle: 'Access institutional credentials' },
        { label: 'Account Registration', href: '/register', subtitle: 'Create a new researcher account' },
        { label: 'Shopping Cart', href: '/cart', subtitle: 'Active laboratory requisition cart' },
        { label: 'Checkout Portal', href: '/checkout', subtitle: 'Payment submission and order confirmation' },
      ],
    },
  ];

  return (
    <>
      {/* Schema.org Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />

      <div className="min-h-screen bg-tech-grid py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Breadcrumb Header */}
          <nav className="flex items-center space-x-2 text-xs font-orbitron text-content-muted">
            <Link href="/" className="hover:text-brand transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-brand font-semibold">HTML SITEMAP</span>
          </nav>

          {/* Hero Banner */}
          <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-brand">
              <Compass className="w-8 h-8" />
              <span className="font-orbitron text-xs font-bold uppercase tracking-widest bg-brand-light px-3 py-1 rounded-full">
                Sitemap & Directory
              </span>
            </div>
            <h1 className="font-orbitron font-extrabold text-2xl sm:text-4xl text-content-primary tracking-tight">
              PEPTRA BIO DIRECTORY & SITEMAP
            </h1>
            <p className="font-sans text-sm sm:text-base text-content-secondary max-w-3xl leading-relaxed">
              Navigate all publicly available peptide specifications, analytical research publications, authentication services, and compliance policies. This sitemap is automatically synchronized with our catalog.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-orbitron">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-subtle hover:bg-brand-light text-brand border border-brand-border rounded-xl transition-colors font-medium"
              >
                <span>Raw XML Sitemap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-content-muted">•</span>
              <span className="text-content-muted">Updated dynamically with active catalog items</span>
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm hover:border-brand transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center text-brand">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h2 className="font-orbitron font-bold text-sm sm:text-base text-content-primary">
                          {sec.title}
                        </h2>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-semibold bg-purple-50 text-brand border border-purple-200">
                        {sec.badge}
                      </span>
                    </div>

                    <p className="text-xs text-content-muted font-sans">
                      {sec.description}
                    </p>

                    <ul className="space-y-2 pt-2">
                      {sec.links.map((link, lIdx) => (
                        <li key={lIdx}>
                          <Link
                            href={link.href}
                            className="group/link flex items-start justify-between p-2 rounded-xl hover:bg-brand-subtle transition-colors"
                          >
                            <div className="pr-2">
                              <div className="font-orbitron font-semibold text-xs text-content-primary group-hover/link:text-brand transition-colors flex items-center gap-1.5">
                                <span>{link.label}</span>
                                {link.tag && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                                    {link.tag}
                                  </span>
                                )}
                              </div>
                              {link.subtitle && (
                                <div className="text-[11px] text-content-muted font-sans mt-0.5 line-clamp-1">
                                  {link.subtitle}
                                </div>
                              )}
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-content-muted group-hover/link:text-brand group-hover/link:translate-x-1 transition-all shrink-0 mt-1" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Research Use Only Compliance Box */}
          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs text-purple-900 leading-relaxed font-sans flex items-start space-x-3">
            <Scale className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div>
              <strong className="font-orbitron text-brand">RESEARCH COMPLIANCE MANDATE:</strong> All products indexed in this directory are synthesized exclusively for in vitro laboratory research and analytical calibration. None of the compounds listed are approved for human, clinical, veterinary, or therapeutic administration.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
