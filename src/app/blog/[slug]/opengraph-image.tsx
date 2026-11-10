import { ImageResponse } from 'next/og';
import { BLOG_POSTS } from '@/lib/blog-data';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug) || null;

  const title = post?.title || 'Peptide Research Analysis & Methodology';
  const category = post?.category || 'Scientific Guide';
  const author = post?.author || 'Peptra Bio Research Group';
  const readTime = post?.readTime || '5 min read';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: 'radial-gradient(circle at 80% 20%, #31135E 0%, #130722 55%, #080210 100%)',
          color: '#FFFFFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow Frame */}
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '24px',
            pointerEvents: 'none',
          }}
        />

        {/* Top bar: Brand + Category */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #672CAE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(139, 92, 246, 0.5)',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              ☤
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: '900',
                letterSpacing: '2px',
                color: '#FFFFFF',
              }}
            >
              PEPTRA BIO RESEARCH
            </span>
          </div>

          <div
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(168, 85, 247, 0.18)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              color: '#D8B4FE',
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {category}
          </div>
        </div>

        {/* Center: Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1000px' }}>
          <span style={{ fontSize: '14px', color: '#A855F7', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Analytical Article & Biochemical Guide
          </span>
          <div
            style={{
              fontSize: '48px',
              fontWeight: '900',
              lineHeight: 1.18,
              letterSpacing: '-0.5px',
              color: '#FFFFFF',
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer: Author & Read Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '20px',
            borderTop: '1px solid rgba(168, 85, 247, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#CBD5E1', fontSize: '14px' }}>
            <span>By {author}</span>
            <span>•</span>
            <span>{readTime}</span>
            <span>•</span>
            <span style={{ color: '#C084FC' }}>peptrabio.com/blog</span>
          </div>

          <div
            style={{
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '1px',
              color: '#F43F5E',
              background: 'rgba(244, 63, 94, 0.12)',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(244, 63, 94, 0.3)',
            }}
          >
            SCIENTIFIC INVESTIGATION ONLY
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
