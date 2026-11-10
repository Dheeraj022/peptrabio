import React from 'react';
import type { Metadata } from 'next';
import {
  constructMetadata,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Peptide Authentication & QR Batch Verification',
  description:
    'Instant cryptographic batch authentication and analytical purity verification. Verify 3-scan security lifecycle and access certified HPLC & LC-MS batch documentation.',
  path: '/verify',
  keywords: [
    'peptide verification',
    'verify peptide batch',
    'peptide QR code scan',
    'HPLC COA verification',
    'authentic research peptides',
    'peptide batch number lookup',
  ],
});

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Product Verification', url: '/verify' },
  ]);

  const faqSchema = generateFAQSchema([
    {
      question: 'How does the 3-stage peptide verification system work?',
      answer:
        'Each Peptra Bio vial features a tamper-evident serialized QR code. Scan 1 confirms initial unboxing and genuine status. Scan 2 records laboratory preparation. Scan 3 seals the vial lifecycle to permanently prevent tampering or counterfeit refilling.',
    },
    {
      question: 'Where can I inspect the Certificate of Analysis (COA)?',
      answer:
        'Upon scanning or entering your alphanumeric batch code, the complete analytical documentation including HPLC chromatograms and mass spectrometry reports will be displayed for download.',
    },
    {
      question: 'Are Peptra Bio peptides intended for human administration?',
      answer:
        'No. All peptide formulations synthesized by Peptra Bio are strictly certified for in vitro scientific research, receptor binding assays, and laboratory investigation only.',
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      {children}
    </>
  );
}

