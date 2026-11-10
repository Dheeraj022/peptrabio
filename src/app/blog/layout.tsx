import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Peptide Research Insights, Protocols & Analytical Guides',
  description:
    'Scientific articles, reconstitution protocols, HPLC chromatography analysis, and peer-reviewed literature reviews on synthesized peptide sequences and laboratory reagents.',
  path: '/blog',
  keywords: [
    'peptide research blog',
    'peptide reconstitution guide',
    'HPLC peptide analysis',
    'peptide storage protocols',
    'BPC-157 research studies',
    'analytical biochemistry guides',
  ],
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Research Blog', url: '/blog' },
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

