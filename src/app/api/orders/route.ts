import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_number,
      customer_email,
      customer_name,
      customer_phone,
      subtotal,
      shipping,
      tax,
      total,
      status = 'pending',
      payment_status = 'unpaid',
      payment_method = 'partial_cod',
      payment_type = 'partial',
      advance_percentage = 10,
      advance_amount = 0,
      remaining_cod_amount = 0,
      utr_number = null,
      screenshot_url = null,
      payment_submitted_at = null,
      currency = 'INR',
      shipping_address,
      billing_address,
      compliance_acknowledged = true,
      notes,
      items = [],
      user_id,
    } = body;

    if (!customer_email || !customer_name) {
      return NextResponse.json(
        { error: 'Customer email and name are required' },
        { status: 400 }
      );
    }

    const orderId = body.id || generateUUID();
    const formattedOrderNumber = order_number || 'PB-ORD-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date().toISOString();

    const orderRecord = {
      id: orderId,
      order_number: formattedOrderNumber,
      user_id: user_id || null,
      status: status || 'pending',
      payment_status: payment_status || 'unpaid',
      payment_method: payment_method || 'partial_cod',
      payment_type: payment_type || 'partial',
      advance_percentage: Number(advance_percentage) || 10,
      advance_amount: Number(advance_amount) || 0,
      remaining_cod_amount: Number(remaining_cod_amount) || 0,
      utr_number: utr_number ? String(utr_number).trim() : null,
      screenshot_url: screenshot_url ? String(screenshot_url) : null,
      payment_submitted_at: payment_submitted_at || (utr_number ? now : null),
      currency: currency || 'INR',
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      tax: Number(tax) || 0,
      total: Number(total) || 0,
      customer_email: String(customer_email).trim(),
      customer_name: String(customer_name).trim(),
      customer_phone: customer_phone ? String(customer_phone).trim() : null,
      shipping_address: shipping_address || {},
      billing_address: billing_address || {},
      compliance_acknowledged: Boolean(compliance_acknowledged),
      notes: notes || null,
      created_at: now,
      updated_at: now,
    };

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const { error: orderError } = await supabase.from('orders').insert(orderRecord);

    if (orderError) {
      console.error('Supabase orders table insert error:', orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Process order items if present
    const createdItems = [];
    if (Array.isArray(items) && items.length > 0) {
      const itemsToInsert = items.map((item: any) => {
        const itemId = item.id || generateUUID();
        return {
          id: itemId,
          order_id: orderId,
          product_id: item.product_id || null,
          product_name: item.product_name || 'Peptide Material',
          product_code: item.product_code || null,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          total_price: Number(item.total_price) || (Number(item.unit_price) * Number(item.quantity) || 0),
        };
      });

      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error('Supabase order_items insert error:', itemsError);
      } else {
        createdItems.push(...(insertedItems || []));
      }
    }

    const finalOrder = {
      ...orderRecord,
      items: createdItems.length > 0 ? createdItems : items,
    };

    return NextResponse.json({ success: true, order: finalOrder }, { status: 201 });
  } catch (err: any) {
    console.error('Order creation API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ orders: [] }, { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    let query = supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });

    if (email) {
      query = query.eq('customer_email', email.trim());
    } else if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase orders fetch error:', error);
      return NextResponse.json({ orders: [], error: error.message }, { status: 500 });
    }

    const reconciledOrders = (data || []).map((o: any) => {
      let total = o.total;
      if (o.subtotal && o.total && o.subtotal > 0) {
        const expectedUsdTotal = o.subtotal + (o.shipping || 0);
        if (Math.abs(o.total - o.subtotal * 86.5) < 5 || o.total > o.subtotal * 10) {
          total = expectedUsdTotal;
        }
      }

      let payment_status = o.payment_status;
      let payment_verified_at = o.payment_verified_at;
      if (
        (o.status === 'paid' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered') &&
        o.payment_status === 'awaiting_verification'
      ) {
        payment_status = 'verified';
        payment_verified_at = o.payment_verified_at || o.updated_at || new Date().toISOString();
      }

      return {
        ...o,
        total,
        payment_status,
        payment_verified_at,
      };
    });

    return NextResponse.json({ orders: reconciledOrders }, { status: 200 });
  } catch (err: any) {
    console.error('Order GET API error:', err);
    return NextResponse.json({ orders: [], error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { id, status, payment_status, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      ...rest,
      updated_at: now,
    };

    if (status) {
      updatePayload.status = status;
      // Auto-reconcile payment if marked as paid/processing/shipped/delivered
      if (status === 'paid' || status === 'processing' || status === 'shipped' || status === 'delivered') {
        if (!payment_status || payment_status === 'awaiting_verification' || payment_status === 'verified') {
          updatePayload.payment_status = 'verified';
          updatePayload.payment_verified_at = now;
        }
      } else if (status === 'refunded') {
        updatePayload.payment_status = 'refunded';
      }
    }

    if (payment_status) {
      updatePayload.payment_status = payment_status;
      if (payment_status === 'verified') {
        updatePayload.payment_verified_at = now;
      }
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase patch order error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: data }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: 'Updated locally' }, { status: 200 });
  } catch (err: any) {
    console.error('Order PATCH API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (supabase) {
      // First delete associated order items
      await supabase.from('order_items').delete().eq('order_id', id);
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete order error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Order DELETE API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
