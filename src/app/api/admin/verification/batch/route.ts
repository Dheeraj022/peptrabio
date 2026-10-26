import { NextRequest, NextResponse } from 'next/server';
import { addServerVerificationCodes } from '@/lib/verification-store';
import { ProductVerificationCode } from '@/types/verification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const codes: ProductVerificationCode[] = body.codes || [];
    if (Array.isArray(codes) && codes.length > 0) {
      addServerVerificationCodes(codes);
    }
    return NextResponse.json({ success: true, count: codes.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
