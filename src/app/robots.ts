import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/checkout',
          '/checkout/*',
          '/account',
          '/account/*',
          '/cart',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/api/',
          '/api/*',
          '/support/ticket/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/checkout',
          '/account',
          '/cart',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/api/',
          '/support/ticket/*',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

