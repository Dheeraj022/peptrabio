import { NextResponse } from 'next/server';
import { getServerVerificationCodes } from '@/lib/verification-store';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('product_verification_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ codes: data });
      }
    }
  } catch (err) {
    console.warn('Error reading verification codes from Supabase:', err);
  }

  const codes = getServerVerificationCodes();
  return NextResponse.json({ codes });
}
