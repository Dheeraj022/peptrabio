import { NextRequest, NextResponse } from 'next/server';
import { addServerVerificationCodes } from '@/lib/verification-store';
import { ProductVerificationCode } from '@/types/verification';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const codes: ProductVerificationCode[] = body.codes || [];
    const batch = body.batch;

    if (Array.isArray(codes) && codes.length > 0) {
      addServerVerificationCodes(codes);
    }

    const supabase = createAdminClient();
    if (supabase) {
      if (batch) {
        const codeStrings = codes.map((c) => c.code);
        await supabase.from('verification_code_batches').upsert({
          id: batch.id,
          product_id: batch.product_id,
          batch_name: batch.batch_name || batch.batch_number,
          batch_number: batch.batch_number,
          quantity: batch.quantity,
          codes: codeStrings,
          authenticity_codes: codeStrings.join(', '),
          created_at: batch.created_at || new Date().toISOString()
        });
      }

      if (Array.isArray(codes) && codes.length > 0) {
        await supabase.from('product_verification_codes').upsert(
          codes.map((r) => ({
            id: r.id,
            product_id: r.product_id,
            batch_id: r.batch_id,
            code: r.code,
            authenticity_code: r.code,
            batch_number: r.batch_number,
            serial_number: r.serial_number,
            max_scans: r.max_scans,
            scan_count: r.scan_count || 0,
            status: r.status || 'active',
            created_at: r.created_at || new Date().toISOString(),
            updated_at: r.updated_at || new Date().toISOString()
          }))
        );
      }
    }

    return NextResponse.json({ success: true, count: codes.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
