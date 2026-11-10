import { ImageResponse } from 'next/og';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getProduct(slug: string) {
  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (!error && data) return data;
    }
  } catch {
    // fallback
  }
  return SEED_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
}

export default async function Image({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  const title = product?.name || 'Research Peptide Specification';
  const category = product?.category || 'Synthetic Peptide Reagent';
  const purity = product?.purity || '99.0%+';
  const sizeText = product?.size || '5 mg';
  const cas = product?.cas_number || 'Analytical Standard';
  const code = product?.product_code || 'PB-SPEC';

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
          background: 'radial-gradient(circle at 85% 15%, #4C1D95 0%, #17092B 55%, #0A0314 100%)',
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
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '24px',
            pointerEvents: 'none',
          }}
        />

        {/* Top bar: Brand + Product Code */}
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
              PEPTRA BIO
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                color: '#D8B4FE',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '1px',
              }}
            >
              {code}
            </span>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                color: '#6EE7B7',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '1px',
              }}
            >
              PURITY: {purity}
            </span>
          </div>
        </div>

        {/* Center: Category, Name & Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '2.5px',
              color: '#A855F7',
              textTransform: 'uppercase',
            }}
          >
            {category} • Research Peptide
          </span>
          <div
            style={{
              fontSize: '56px',
              fontWeight: '900',
              lineHeight: 1.1,
              letterSpacing: '-1px',
              color: '#FFFFFF',
              maxWidth: '960px',
            }}
          >
            {title}
          </div>

          {/* Metric Badges */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '10px 18px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
              }}
            >
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', letterSpacing: '1px' }}>CAS NUMBER</span>
              <span style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: '700', fontFamily: 'monospace' }}>{cas}</span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '10px 18px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
              }}
            >
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', letterSpacing: '1px' }}>VIAL FORMAT</span>
              <span style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: '700' }}>{sizeText} Lyophilized</span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '10px 18px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
              }}
            >
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', letterSpacing: '1px' }}>BATCH VERIFICATION</span>
              <span style={{ fontSize: '15px', color: '#A7F3D0', fontWeight: '700' }}>HPLC & MS Documented</span>
            </div>
          </div>
        </div>

        {/* Footer: Warning */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '18px',
            borderTop: '1px solid rgba(168, 85, 247, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C084FC', fontSize: '13px' }}>
            <span>Verified Laboratory Research Material • peptrabio.com</span>
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
            IN VITRO RESEARCH USE ONLY
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

