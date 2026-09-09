'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header' | 'footer';
  variant?: 'light' | 'dark' | 'header' | 'footer';
  className?: string;
  href?: string;
}

export function Logo({
  size = 'header',
  variant = 'light',
  className = '',
  href = '/'
}: LogoProps) {
  // Height presets for bold, clear visibility
  const heightMap = {
    sm: 'h-12 sm:h-14 w-auto',
    md: 'h-14 sm:h-16 w-auto',
    header: 'h-14 sm:h-16 md:h-20 w-auto',
    lg: 'h-18 sm:h-22 w-auto',
    xl: 'h-24 sm:h-28 w-auto',
    footer: 'h-16 sm:h-20 w-auto',
  };

  const isDarkBg = variant === 'dark' || variant === 'footer';

  const content = (
    <div className={`inline-flex items-center group select-none ${className}`}>
      <div
        className={`relative transition-all duration-300 group-hover:scale-105 flex items-center justify-center ${
          isDarkBg
            ? 'bg-white p-1.5 rounded-2xl shadow-lg shadow-purple-950/50 border border-purple-800/40'
            : 'py-0.5'
        }`}
      >
        <Image
          src="/images/logo.png"
          alt="PEPTRA BIO — Where Purity Meets Efficacy"
          width={360}
          height={280}
          className={`${heightMap[size]} object-contain max-h-[88px]`}
          priority
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
