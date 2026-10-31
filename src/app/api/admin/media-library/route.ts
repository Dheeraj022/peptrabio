import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'images');
    const categories = ['products', 'labelbox', 'uploads'];
    const results: { url: string; name: string; folder: string }[] = [];

    for (const folder of categories) {
      const folderPath = path.join(publicDir, folder);
      try {
        const files = await fs.readdir(folderPath);
        for (const file of files) {
          if (file.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
            const cleanTitle = file
              .replace(/\.[^/.]+$/, '')
              .replace(/[-_]/g, ' ')
              .toUpperCase();
            results.push({
              url: `/images/${folder}/${file}`,
              name: cleanTitle,
              folder,
            });
          }
        }
      } catch {
        // Folder might be empty
      }
    }

    return NextResponse.json({ success: true, items: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

