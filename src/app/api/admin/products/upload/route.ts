import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/svg+xml',
  'image/gif',
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const productName = (formData.get('productName') as string) || 'product';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // 1. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 15MB' },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPG, PNG, WebP, GIF, and SVG images are allowed.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanName = productName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);
    const fileName = `${cleanName}_${Date.now()}.${fileExt}`;

    // 3. Save locally to public/images/uploads/
    let publicUrl = `/images/uploads/${fileName}`;
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const targetPath = path.join(uploadDir, fileName);
      await fs.writeFile(targetPath, buffer);
    } catch (fsErr) {
      console.warn('Local disk write failed:', fsErr);
    }

    // 4. Try Supabase Storage if configured and available
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const filePath = `catalog/${fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            publicUrl = publicUrlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn('Supabase product bucket storage unavailable, using local static route:', storageErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
    });
  } catch (err: any) {
    console.error('Product image upload error:', err);
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}

