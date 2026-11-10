import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Shopping Cart & Active Requisitions',
  description: 'View your active research peptide requisitions and prepare for laboratory procurement.',
  path: '/cart',
  noIndex: true,
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

