import React from 'react';
import type { Metadata } from 'next';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  constructMetadata,
  generateProductSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo-config';

async function getProduct(slug: string) {
  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (!error && data) return data;
    }
  } catch {
    // fallback
  }
  return SEED_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return constructMetadata({
      title: 'Peptide Research Specification',
      description: 'Precision synthesized research-grade peptide specification with HPLC batch documentation.',
      path: `/shop/${params.slug}`,
    });
  }

  const primaryImage =
    product.images?.find((img: any) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url;

  return constructMetadata({
    title: `${product.name} (${product.size}) | Research Peptide Specification`,
    description:
      product.short_description ||
      `Certified ${product.name} research peptide (${product.size}) with HPLC & MS analytical documentation. Formulated strictly for laboratory in vitro investigations.`,
    path: `/shop/${product.slug}`,
    keywords: [
      product.name,
      `${product.name} peptide`,
      `${product.name} research`,
      product.product_code,
      product.cas_number,
      product.category,
      'HPLC tested peptide',
      'analytical grade sequence',
      'in vitro research reagent',
    ].filter(Boolean),
    ogImage: primaryImage,
  });
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    ...(product?.category ? [{ name: product.category, url: `/shop?category=${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` }] : []),
    { name: product ? product.name : params.slug, url: `/shop/${params.slug}` },
  ];

  const productSchema = product ? generateProductSchema(product) : null;
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {children}
    </>
  );
}

