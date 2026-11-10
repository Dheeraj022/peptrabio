import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Researcher Account Portal',
  description: 'Manage institutional laboratory profile, view order tracking, and download batch invoices.',
  path: '/account',
  noIndex: true,
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

