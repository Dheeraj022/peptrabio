import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Secure Requisition Checkout',
  description: 'Complete research peptide requisition submission with encrypted payment verification.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

