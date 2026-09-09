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
    sm: 'h-10 sm:h-12 w-auto',
    md: 'h-14 sm:h-16 w-auto',
    header: 'h-20 sm:h-26 md:h-28 w-auto',
    lg: 'h-20 sm:h-26 w-auto',
    xl: 'h-28 sm:h-36 w-auto',
    footer: 'h-16 sm:h-20 w-auto',
  };

  const isDarkBg = variant === 'dark' || variant === 'footer';

  const content = (
    <div className={`inline-flex items-center group select-none ${className}`}>
      <div
        className={`relative transition-all duration-300 group-hover:scale-105 flex items-center justify-center ${
          isDarkBg
            ? 'bg-white p-2 rounded-2xl shadow-lg shadow-purple-950/50 border border-purple-800/40'
            : 'py-1'
        }`}
      >
        <Image
          src="/images/logo.png"
          alt="PEPTRA BIO — Where Purity Meets Efficacy"
          width={360}
          height={300}
          className={`${heightMap[size]} object-contain max-h-[115px]`}
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
