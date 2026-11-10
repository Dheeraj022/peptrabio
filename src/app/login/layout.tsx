import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Researcher Login Portal',
  description: 'Log in to your Peptra Bio laboratory researcher account to access requisitions and tracking.',
  path: '/login',
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

