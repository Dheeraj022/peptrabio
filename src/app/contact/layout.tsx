import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Laboratory Desk & Inquiries',
  description:
    'Contact the Peptra Bio scientific support desk for research requisition inquiries, bulk synthesis requests, and batch Certificate of Analysis (COA) documentation.',
  path: '/contact',
  keywords: [
    'contact Peptra Bio',
    'peptide laboratory contact',
    'bulk peptide synthesis inquiry',
    'research peptide customer support',
    'Peptra Bio Cambridge MA',
  ],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' },
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

