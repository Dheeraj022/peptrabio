import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DiscountCode } from '@/types';

export const dynamic = 'force-dynamic';

// GET: Retrieve discount codes from Supabase
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { discounts: null, error: 'Database client unavailable' },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase discount_codes table query note:', error.message);
      return NextResponse.json(
        { discounts: null, error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json({ discounts: data as DiscountCode[] });
  } catch (err: any) {
    console.error('Error fetching discounts from Supabase:', err);
    return NextResponse.json(
      { discounts: null, error: err.message || 'Server error' },
      { status: 200 }
    );
  }
}

// POST: Create or upsert discount code
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    const body = await req.json();
    const {
      id,
      code,
      description = '',
      discount_type,
      discount_value,
      applicable_payment = 'both',
      min_order_amount = null,
      max_discount_amount = null,
      usage_limit = null,
      used_count = 0,
      is_active = true,
      expires_at = null,
    } = body;

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json(
        { error: 'code, discount_type, and discount_value are required' },
        { status: 400 }
      );
    }

    const cleanCode = String(code).trim().toUpperCase();
    const cleanId = id || ('disc-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    const now = new Date().toISOString();

    const record = {
      id: cleanId,
      code: cleanCode,
      description: description ? String(description).trim() : '',
      discount_type,
      discount_value: Number(discount_value),
      applicable_payment,
      min_order_amount: min_order_amount ? Number(min_order_amount) : null,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      used_count: Number(used_count) || 0,
      is_active: Boolean(is_active),
      expires_at: expires_at || null,
      created_at: body.created_at || now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('discount_codes')
      .upsert(record, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting discount code in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ discount: data });
  } catch (err: any) {
    console.error('Error handling POST /api/discounts:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PATCH: Toggle active status or increment usage count
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    const body = await req.json();
    const { id, code, action } = body;

    if (action === 'toggle' && id) {
      // Fetch current is_active
      const { data: curr } = await supabase.from('discount_codes').select('is_active').eq('id', id).single();
      const nextActive = curr ? !curr.is_active : true;

      const { data, error } = await supabase
        .from('discount_codes')
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ discount: data });
    }

    if (action === 'increment' && (code || id)) {
      const matchCol = id ? 'id' : 'code';
      const matchVal = id || String(code).trim().toUpperCase();

      const { data: curr } = await supabase
        .from('discount_codes')
        .select('used_count')
        .eq(matchCol, matchVal)
        .single();

      const newCount = (curr?.used_count || 0) + 1;
      const { data, error } = await supabase
        .from('discount_codes')
        .update({ used_count: newCount, updated_at: new Date().toISOString() })
        .eq(matchCol, matchVal)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ discount: data });
    }

    // Generic update
    if (id) {
      const { data, error } = await supabase
        .from('discount_codes')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ discount: data });
    }

    return NextResponse.json({ error: 'Invalid update request' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Remove discount code
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Discount id is required' }, { status: 400 });
    }

    const { error } = await supabase.from('discount_codes').delete().eq('id', id);
    if (error) {
      console.error('Error deleting discount code from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('Error handling DELETE /api/discounts:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

