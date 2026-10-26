import { NextRequest, NextResponse } from 'next/server';
import { getServerVerificationCodes, deleteServerVerificationCode } from '@/lib/verification-store';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('product_verification_codes')
        .select('*, products(name, product_code)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map((c: any) => ({
          ...c,
          product_name: c.products?.name || c.product_name || 'Research Peptide',
          product_code: c.products?.product_code || c.product_code || 'PB-SPEC'
        }));
        return NextResponse.json({ codes: formatted, source: 'supabase' });
      }
    }
  } catch (err) {
    console.warn('Error reading verification codes from Supabase:', err);
  }

  const codes = getServerVerificationCodes();
  return NextResponse.json({ codes, source: 'memory' });
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const code = searchParams.get('code');

    // 1. Delete from server memory
    deleteServerVerificationCode(id || undefined, code || undefined);

    // 2. Delete from Supabase
    const supabase = createAdminClient();
    if (supabase) {
      if (id) {
        await supabase.from('product_verification_scans').delete().eq('verification_code_id', id);
      }
      if (id || code) {
        let query = supabase.from('product_verification_codes').delete();
        if (id && code) {
          query = query.or(`id.eq.${id},code.ilike.${code}`);
        } else if (id) {
          query = query.eq('id', id);
        } else if (code) {
          query = query.ilike('code', code);
        }
        const { error } = await query;
        if (error) {
          console.warn('Supabase delete code error:', error);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Verification code deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/admin/verification/codes error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
