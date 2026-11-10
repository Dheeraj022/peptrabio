import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo-config';
import { SEED_PRODUCTS, SEED_CATEGORIES } from '@/lib/seed-data';
import { BLOG_POSTS } from '@/lib/blog-data';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  // 1. Fetch live products from Supabase with fallback to SEED_PRODUCTS
  let products = [...SEED_PRODUCTS];
  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('slug, updated_at, created_at, is_active')
        .eq('is_active', true);
      if (!error && Array.isArray(data) && data.length > 0) {
        // Merge Supabase active products
        const dbSlugs = new Set(data.map((p) => p.slug));
        const merged = data.map((p) => ({
          slug: p.slug,
          updated_at: p.updated_at || p.created_at,
        }));
        for (const sp of SEED_PRODUCTS) {
          if (!dbSlugs.has(sp.slug) && sp.is_active) {
            merged.push({ slug: sp.slug, updated_at: sp.updated_at || sp.created_at });
          }
        }
        products = merged as any;
      }
    }
  } catch {
    // fallback to SEED_PRODUCTS
  }

  const currentDate = new Date();

  // 2. Static public marketing & institutional pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/verify`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${siteUrl}/support/new`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/sitemap`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    // Policies Hub & Individual Policies
    {
      url: `${siteUrl}/policies`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/policies/research-use`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${siteUrl}/policies/disclaimer`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/policies/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/policies/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/policies/shipping`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/policies/returns`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/policies/refund`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/policies/cookie`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 3. Category filters in shop
  const categoryRoutes: MetadataRoute.Sitemap = SEED_CATEGORIES.map((cat) => ({
    url: `${siteUrl}/shop?category=${cat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. Dynamic product detail pages
  const productRoutes: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${siteUrl}/shop/${prod.slug}`,
    lastModified: prod.updated_at ? new Date(prod.updated_at) : currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 5. Dynamic blog articles
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
