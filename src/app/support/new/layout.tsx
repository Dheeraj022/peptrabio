import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata, generateBreadcrumbSchema } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Submit Technical Support Ticket',
  description:
    'Submit a new laboratory inquiry or order assistance ticket directly to the Peptra Bio technical support team.',
  path: '/support/new',
  keywords: [
    'submit peptide support ticket',
    'peptide technical inquiry',
    'laboratory requisition assistance',
  ],
});

export default function NewTicketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Support', url: '/support' },
    { name: 'New Ticket', url: '/support/new' },
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

