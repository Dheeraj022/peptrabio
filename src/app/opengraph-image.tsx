import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'PEPTRA BIO — Advanced Research Peptide Materials';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          background: 'radial-gradient(circle at 80% 20%, #3B1261 0%, #150A24 60%, #0A0412 100%)',
          color: '#FFFFFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle grid pattern border */}
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '24px',
            pointerEvents: 'none',
          }}
        />

        {/* Header Bar: Logo & Verification Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #672CAE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              ☤
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  letterSpacing: '3px',
                  color: '#FFFFFF',
                }}
              >
                PEPTRA BIO
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '3px',
                  color: '#C084FC',
                  textTransform: 'uppercase',
                }}
              >
                Where Purity Meets Efficacy
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '999px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              color: '#E9D5FF',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '1px',
            }}
          >
            ✓ HPLC & LC-MS VERIFIED
          </div>
        </div>

        {/* Center: Hero Heading & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '980px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '800',
              letterSpacing: '3px',
              color: '#A855F7',
              textTransform: 'uppercase',
            }}
          >
            Laboratory Research Grade Catalog
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: '900',
              lineHeight: 1.15,
              letterSpacing: '-1px',
              color: '#FFFFFF',
            }}
          >
            Advanced Synthetic Peptide Materials & Sequences
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#D8B4FE',
              lineHeight: 1.4,
              maxWidth: '860px',
            }}
          >
            High-purity lyophilized research peptides with third-party analytical batch verification for scientific calibration, in vitro receptor binding, and cellular research.
          </div>
        </div>

        {/* Footer: Credentials & RUO Warning */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '20px',
            borderTop: '1px solid rgba(168, 85, 247, 0.2)',
          }}
        >
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#CBD5E1' }}>
            <span>• 99.0%+ Purity Standard</span>
            <span>• Public Lot COAs</span>
            <span>• Cold-Chain Logistics</span>
            <span>• QR Authentication</span>
          </div>

          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              color: '#F43F5E',
              background: 'rgba(244, 63, 94, 0.12)',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(244, 63, 94, 0.3)',
            }}
          >
            STRICTLY FOR IN VITRO RESEARCH USE ONLY
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

