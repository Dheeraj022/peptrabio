import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Admin Console',
  description: 'Administrative management console for catalog, orders, and payment verification.',
  path: '/admin',
  noIndex: true,
});

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

