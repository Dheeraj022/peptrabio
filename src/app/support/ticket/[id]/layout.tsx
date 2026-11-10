import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Support Ticket Correspondence',
  description: 'Private technical support correspondence with Peptra Bio specialists.',
  path: '/support',
  noIndex: true,
});

export default function TicketDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

