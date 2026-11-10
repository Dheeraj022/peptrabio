import React from 'react';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-data';
import {
  constructMetadata,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo-config';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) {
    return constructMetadata({
      title: 'Research Article',
      description: 'Peptide research analysis, chromatography, and laboratory methodologies.',
      path: `/blog/${params.slug}`,
    });
  }

  return constructMetadata({
    title: `${post.title} | Research Analysis`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: [
      ...post.tags,
      post.category,
      'peptide research article',
      'analytical biochemistry study',
      'laboratory methodology',
    ],
    ogImage: post.image,
    type: 'article',
    publishedTime: new Date(post.publishedAt).toISOString(),
    modifiedTime: new Date(post.publishedAt).toISOString(),
    authors: [post.author],
  });
}

export default function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Research Blog', url: '/blog' },
    ...(post?.category ? [{ name: post.category, url: '/blog' }] : []),
    { name: post ? post.title : params.slug, url: `/blog/${params.slug}` },
  ];

  const articleSchema = post ? generateArticleSchema(post) : null;
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleSchema),
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
