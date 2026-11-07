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
        // Merge Supabase products with SEED_PRODUCTS so any products not yet in Supabase are not lost.
        // Supabase products take precedence (with current is_active, prices, etc.).
        const supabaseIds = new Set(data.map((p: any) => p.id));
        const merged = [...data];
        for (const sp of SEED_PRODUCTS) {
          if (!supabaseIds.has(sp.id)) {
            merged.push(sp);
          }
        }
        return NextResponse.json({ products: merged, source: 'supabase' });
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

    // Upsert into products table (using columns matching products table schema)
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
      is_active: typeof product.is_active === 'boolean' ? product.is_active : true,
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

    return NextResponse.json({ success: true, product: productRecord });
  } catch (err: any) {
    console.error('API /api/products POST error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Product id required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 503 });
    }

    const { showcase_order, ...cleanUpdates } = updates;
    const updatePayload: Record<string, any> = {
      ...cleanUpdates,
      updated_at: new Date().toISOString(),
    };
    if (updatePayload.price !== undefined) {
      updatePayload.price = Number(updatePayload.price) || 0;
    }
    if (updatePayload.compare_at_price !== undefined) {
      updatePayload.compare_at_price = updatePayload.compare_at_price ? Number(updatePayload.compare_at_price) : null;
    }
    if (updatePayload.stock_quantity !== undefined) {
      updatePayload.stock_quantity = Number(updatePayload.stock_quantity) || 0;
    }

    // Check if product exists in Supabase
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      // If it doesn't exist in Supabase yet, find in SEED_PRODUCTS and upsert with updates
      const seedProduct = SEED_PRODUCTS.find((p) => p.id === id);
      if (seedProduct) {
        const fullRecord: Record<string, any> = {
          id: seedProduct.id,
          name: seedProduct.name,
          slug: seedProduct.slug,
          short_description: seedProduct.short_description || '',
          description: seedProduct.description || '',
          category: seedProduct.category,
          category_id: seedProduct.category_id,
          product_code: seedProduct.product_code,
          cas_number: seedProduct.cas_number || 'N/A',
          sequence: seedProduct.sequence || null,
          molecular_formula: seedProduct.molecular_formula || null,
          molecular_weight: seedProduct.molecular_weight || null,
          purity: seedProduct.purity || '99%+',
          size: seedProduct.size || '5 mg',
          format: seedProduct.format || 'Lyophilized Solid',
          price: updatePayload.price !== undefined ? updatePayload.price : (Number(seedProduct.price) || 0),
          compare_at_price: updatePayload.compare_at_price !== undefined ? updatePayload.compare_at_price : (seedProduct.compare_at_price ? Number(seedProduct.compare_at_price) : null),
          stock_quantity: updatePayload.stock_quantity !== undefined ? updatePayload.stock_quantity : (Number(seedProduct.stock_quantity) || 0),
          is_active: typeof updates.is_active === 'boolean' ? updates.is_active : (seedProduct.is_active ?? true),
          is_featured: seedProduct.is_featured ?? false,
          research_use_only: true,
          storage_information: seedProduct.storage_information || 'Store at -20°C.',
          updated_at: new Date().toISOString(),
          ...cleanUpdates,
        };

        const { error: insertErr } = await supabase.from('products').upsert(fullRecord);
        if (insertErr) {
          console.error('Supabase seed product upsert error on patch:', insertErr);
          return NextResponse.json({ error: insertErr.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, product: fullRecord });
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase product patch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error('API /api/products PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product id required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 503 });
    }

    await supabase.from('product_images').delete().eq('product_id', id);
    await supabase.from('product_documents').delete().eq('product_id', id);
    await supabase.from('product_references').delete().eq('product_id', id);

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Supabase product delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('API /api/products DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
