import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Researcher Support Center & Help Desk',
  description:
    'Access scientific support resources, browse laboratory documentation, open technical inquiry tickets, and track active requisitions with Peptra Bio specialists.',
  path: '/support',
  keywords: [
    'peptide support center',
    'researcher help desk',
    'peptide order tracking',
    'laboratory ticket desk',
    'Peptra Bio customer service',
  ],
});

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Support Center', url: '/support' },
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

