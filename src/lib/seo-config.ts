import type { Metadata } from 'next';
import { Product } from '@/types';
import { BlogPost } from '@/types/blog';

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '');
  }
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  return 'https://peptrabio.com';
}

export const SITE_NAME = 'PEPTRA BIO';
export const DEFAULT_TITLE = 'PEPTRA BIO — Precision Synthesized Research Peptides';
export const DEFAULT_DESCRIPTION =
  'Precision synthesized research-grade peptides, neuropeptides, and cellular research materials with certified HPLC & MS analytical documentation exclusively for laboratory investigation.';

export const DEFAULT_KEYWORDS = [
  'research peptides',
  'HPLC verified peptides',
  'analytical grade peptides',
  'laboratory research peptides',
  'synthetic peptides',
  'BPC-157 research',
  'TB-500 research',
  'Selank research',
  'Semax research',
  'GHK-Cu peptide',
  'reconstitution solvents',
  'peptide synthesis documentation',
  'COA verified peptides',
  'scientific bioreagents',
];

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

export function constructMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  keywords = DEFAULT_KEYWORDS,
  ogImage,
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: ConstructMetadataProps = {}): Metadata {
  const siteUrl = getSiteUrl();
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const canonicalUrl = `${siteUrl}${cleanPath}`;
  
  // Format title with template
  const fullTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : DEFAULT_TITLE;

  // Resolved OG image URL
  const defaultOg = `${siteUrl}/opengraph-image`;
  const resolvedOgImage = ogImage
    ? (ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage.startsWith('/') ? ogImage : '/' + ogImage}`)
    : defaultOg;

  return {
    metadataBase: new URL(siteUrl),
    title: fullTitle,
    description,
    keywords,
    authors: authors?.map((a) => ({ name: a })) || [{ name: 'Peptra Bio Labs', url: siteUrl }],
    creator: 'Peptra Bio Inc.',
    publisher: 'Peptra Bio Inc.',
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_US',
      type,
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: `${fullTitle} — Social Preview`,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [resolvedOgImage],
      creator: '@peptrabio',
      site: '@peptrabio',
    },
  };
}

// =============================================================================
// JSON-LD STRUCTURED DATA SCHEMAS
// =============================================================================

export function generateOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'PEPTRA BIO INC.',
    legalName: 'Peptra Bio Laboratory Reagents Inc.',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/images/logo.png`,
      caption: 'Peptra Bio Laboratory Research Peptides',
    },
    image: `${siteUrl}/images/logo.png`,
    description: DEFAULT_DESCRIPTION,
    email: 'support@peptrabio.com',
    telephone: '+1-555-PEPTRA-1',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bio-Research Park, Technology Parkway Suite 300',
      addressLocality: 'Cambridge',
      addressRegion: 'MA',
      postalCode: '02139',
      addressCountry: 'US',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+1-555-PEPTRA-1',
        contactType: 'customer service',
        email: 'support@peptrabio.com',
        availableLanguage: ['English'],
      },
    ],
    sameAs: [
      'https://twitter.com/peptrabio',
      'https://www.linkedin.com/company/peptrabio',
    ],
  };
}

export function generateWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'PEPTRA BIO',
    description: DEFAULT_DESCRIPTION,
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url.startsWith('/') ? item.url : '/' + item.url}`,
    })),
  };
}

export function generateProductSchema(product: Product) {
  const siteUrl = getSiteUrl();
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    '/images/logo.png';
  
  const absoluteImageUrl = primaryImage.startsWith('http')
    ? primaryImage
    : `${siteUrl}${primaryImage.startsWith('/') ? primaryImage : '/' + primaryImage}`;

  const inStock = product.stock_quantity > 0 && product.is_active;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/shop/${product.slug}#product`,
    name: product.name,
    description: product.short_description || product.description || `${product.name} synthesized research peptide.`,
    image: [absoluteImageUrl],
    sku: product.product_code || product.id,
    mpn: product.product_code || product.id,
    brand: {
      '@type': 'Brand',
      name: 'Peptra Bio',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/shop/${product.slug}`,
      priceCurrency: 'USD',
      price: Number(product.price).toFixed(2),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'PEPTRA BIO',
      },
    },
    additionalProperty: [
      ...(product.cas_number ? [{ '@type': 'PropertyValue', name: 'CAS Number', value: product.cas_number }] : []),
      ...(product.purity ? [{ '@type': 'PropertyValue', name: 'Purity', value: product.purity }] : []),
      ...(product.size ? [{ '@type': 'PropertyValue', name: 'Vial Size', value: product.size }] : []),
      ...(product.molecular_formula ? [{ '@type': 'PropertyValue', name: 'Molecular Formula', value: product.molecular_formula }] : []),
      ...(product.molecular_weight ? [{ '@type': 'PropertyValue', name: 'Molecular Weight', value: `${product.molecular_weight} g/mol` }] : []),
    ],
  };
}

export function generateArticleSchema(post: BlogPost) {
  const siteUrl = getSiteUrl();
  const absoluteCover = post.image.startsWith('http')
    ? post.image
    : `${siteUrl}${post.image.startsWith('/') ? post.image : '/' + post.image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${siteUrl}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt,
    image: [absoluteCover],
    datePublished: new Date(post.publishedAt).toISOString(),
    dateModified: new Date(post.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PEPTRA BIO',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    articleSection: post.category,
    keywords: post.tags.join(', '),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
