import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('screenshot') as File | null;
    const orderNumber = (formData.get('orderNumber') as string) || 'PB-PAY';

    if (!file) {
      return NextResponse.json({ error: 'No screenshot file provided' }, { status: 400 });
    }

    // 1. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 5MB' },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try Supabase Storage if available
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `payment_${orderNumber}_${Date.now()}.${fileExt}`;
        const filePath = `screenshots/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              filename: fileName,
            });
          }
        }
      } catch (storageErr) {
        console.warn('Supabase bucket storage unavailable, falling back to base64 encoding:', storageErr);
      }
    }

    // Fallback: Safe Base64 Data URI for immediate persistence & zero-dependency local preview
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      success: true,
      url: base64String,
      filename: file.name,
    });
  } catch (err: any) {
    console.error('Payment screenshot upload error:', err);
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}
