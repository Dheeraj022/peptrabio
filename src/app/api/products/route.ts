import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*, images:product_images(*), documents:product_documents(*), references:product_references(*)')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json({ products: data, source: 'supabase' });
      }
    }
  } catch (err) {
    console.warn('API /api/products Supabase query fallback:', err);
  }

  // Gracefully return updated seed products as standard fallback
  return NextResponse.json({ products: SEED_PRODUCTS, source: 'seed' });
}

export async function POST(req: NextRequest) {
  try {
    const product: Product = await req.json();
    if (!product || !product.id || !product.name) {
      return NextResponse.json({ error: 'Product id and name required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 503 });
    }

    // Upsert into products table
    const productRecord = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      short_description: product.short_description || '',
      description: product.description || '',
      category: product.category,
      category_id: product.category_id,
      product_code: product.product_code,
      cas_number: product.cas_number || 'N/A',
      sequence: product.sequence || null,
      molecular_formula: product.molecular_formula || null,
      molecular_weight: product.molecular_weight || null,
      purity: product.purity || '99%+',
      size: product.size || '5 mg',
      format: product.format || 'Lyophilized Solid',
      price: Number(product.price) || 0,
      compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
      stock_quantity: Number(product.stock_quantity) || 0,
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      research_use_only: true,
      storage_information: product.storage_information || 'Store at -20°C.',
      updated_at: new Date().toISOString(),
    };

    const { error: prodErr } = await supabase.from('products').upsert(productRecord);
    if (prodErr) {
      console.error('Supabase product upsert error:', prodErr);
      return NextResponse.json({ error: prodErr.message }, { status: 500 });
    }

    // Sync product images
    if (Array.isArray(product.images) && product.images.length > 0) {
      try {
        await supabase.from('product_images').delete().eq('product_id', product.id);
        const imagesToInsert = product.images.map((img, idx) => ({
          id: img.id || `img-${product.id}-${idx}`,
          product_id: product.id,
          image_url: img.image_url,
          alt_text: img.alt_text || product.name,
          sort_order: img.sort_order ?? idx,
          is_primary: img.is_primary ?? (idx === 0),
        }));
        await supabase.from('product_images').insert(imagesToInsert);
      } catch (imgErr) {
        console.warn('Supabase product images sync error:', imgErr);
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error('API /api/products POST error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

