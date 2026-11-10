'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header' | 'footer';
  variant?: 'light' | 'dark' | 'header' | 'footer';
  className?: string;
  href?: string;
  src?: string;
}

export function Logo({
  size = 'header',
  variant = 'light',
  className = '',
  href = '/',
  src
}: LogoProps) {
  // Height presets for bold, clear visibility
  const heightMap = {
    sm: 'h-12 sm:h-14 w-auto',
    md: 'h-14 sm:h-16 w-auto',
    header: 'h-14 sm:h-16 md:h-20 w-auto',
    lg: 'h-20 sm:h-24 md:h-28 w-auto',
    xl: 'h-24 sm:h-32 md:h-36 w-auto',
    footer: 'h-24 sm:h-28 md:h-36 w-auto',
  };

  const maxHeightMap = {
    sm: 'max-h-[56px]',
    md: 'max-h-[64px]',
    header: 'max-h-[88px]',
    lg: 'max-h-[120px]',
    xl: 'max-h-[144px]',
    footer: 'max-h-[150px]',
  };

  const isDarkBg = variant === 'dark';
  const logoSrc = src || (variant === 'footer' ? '/Peptra%20Bio%20Futuristic%20DNA%20Logo.png' : '/images/logo.png');

  const content = (
    <div className={`inline-flex items-center group select-none ${className}`}>
      <div
        className={`relative transition-all duration-300 group-hover:scale-105 flex items-center justify-center ${
          isDarkBg
            ? 'bg-white p-2 rounded-2xl shadow-lg shadow-purple-950/50 border border-purple-800/40'
            : 'py-0.5'
        }`}
      >
        <Image
          src={logoSrc}
          alt="PEPTRA BIO — Where Purity Meets Efficacy"
          width={480}
          height={400}
          className={`${heightMap[size]} ${maxHeightMap[size]} object-contain`}
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
