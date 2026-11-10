import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Research Peptide Catalog | HPLC & MS Verified Peptides',
  description:
    'Browse precision-synthesized research peptides, neuropeptides, metabolic signaling sequences, and reconstitution reagents. Each batch backed by certified HPLC & MS analytical documentation.',
  path: '/shop',
  keywords: [
    'research peptide catalog',
    'buy research peptides online',
    'HPLC verified peptides',
    'analytical peptide reagents',
    'neuropeptides research',
    'cellular repair peptides',
    'bacteriostatic water',
    'BPC-157 research vial',
    'TB-500 research vial',
  ],
});

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Research Catalog', url: '/shop' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {children}
    </>
  );
}

