import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const ticketId = (formData.get('ticketId') as string) || 'ticket';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    const mime = file.type.toLowerCase();
    const isAllowed = ALLOWED_MIME_TYPES.some((t) => mime.includes(t.split('/')[1]) || mime === t);
    if (!isAllowed && !mime.startsWith('image/') && !mime.includes('pdf')) {
      return NextResponse.json(
        { error: 'File format not supported. Please upload an image, PDF, or text document.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Try uploading to Supabase Storage Bucket ('support-attachments') if configured
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'bin';
        const sanitizedBaseName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${ticketId}_${Date.now()}_${sanitizedBaseName}`;
        const filePath = `attachments/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('support-attachments')
          .upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('support-attachments')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              name: file.name,
              size: file.size,
              type: file.type || 'application/octet-stream',
            });
          }
        }
      } catch (storageErr) {
        console.warn('Supabase bucket storage unavailable, falling back to base64 Data URI:', storageErr);
      }
    }

    // 2. Guaranteed fallback: Persist as Data URI string in JSON attachments column
    // This stores directly into Supabase database support_ticket_messages table
    const base64String = `data:${file.type || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      success: true,
      url: base64String,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    });
  } catch (err: any) {
    console.error('Support file upload error:', err);
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}
