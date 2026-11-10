import React from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo-config';

export const metadata: Metadata = constructMetadata({
  title: 'Reset Password Request',
  description: 'Request a password reset link for your institutional researcher account.',
  path: '/forgot-password',
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

