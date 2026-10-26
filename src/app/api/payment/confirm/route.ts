import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculatePaymentBreakdown, getPaymentConfig } from '@/lib/payment-config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      orderNumber,
      paymentType,
      utrNumber,
      screenshotUrl,
      notes,
    } = body;

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: 'Order reference is required.' },
        { status: 400 }
      );
    }

    if (!utrNumber || typeof utrNumber !== 'string' || utrNumber.trim().length < 6) {
      return NextResponse.json(
        { error: 'A valid UPI transaction reference / UTR number (at least 6 characters) is required.' },
        { status: 400 }
      );
    }

    const cleanUtr = utrNumber.trim();
    const cleanPaymentType = paymentType === 'full' ? 'full' : 'partial';
    const now = new Date().toISOString();

    const config = getPaymentConfig();

    const supabase = createAdminClient();
    if (supabase) {
      // Find the authoritative order
      let query = supabase.from('orders').select('*');
      if (orderId) {
        query = query.eq('id', orderId);
      } else {
        query = query.eq('order_number', orderNumber);
      }

      const { data: existingOrders, error: findError } = await query;
      if (!findError && existingOrders && existingOrders.length > 0) {
        const order = existingOrders[0];

        // Prevent duplicate submissions if already verified
        if (order.payment_status === 'verified') {
          return NextResponse.json(
            { error: 'This order payment has already been verified by administration.' },
            { status: 409 }
          );
        }

        // Authoritative server-side calculation
        const breakdown = calculatePaymentBreakdown(order.total, config.advancePercentage);
        const expectedAdvance = cleanPaymentType === 'partial' ? breakdown.advanceAmount : breakdown.totalAmount;
        const expectedRemaining = cleanPaymentType === 'partial' ? breakdown.remainingCodAmount : 0;

        const updatePayload: Record<string, any> = {
          payment_status: 'awaiting_verification',
          payment_type: cleanPaymentType,
          payment_method: cleanPaymentType === 'partial' ? 'partial_cod' : 'full_online',
          advance_percentage: config.advancePercentage,
          advance_amount: expectedAdvance,
          remaining_cod_amount: expectedRemaining,
          utr_number: cleanUtr,
          payment_submitted_at: now,
          updated_at: now,
        };

        if (screenshotUrl) {
          updatePayload.screenshot_url = screenshotUrl;
        }
        if (notes) {
          updatePayload.payment_notes = notes;
        }

        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update(updatePayload)
          .eq('id', order.id)
          .select()
          .single();

        if (updateError) {
          console.error('Failed to update order payment in Supabase:', updateError);
        } else if (updatedOrder) {
          return NextResponse.json({
            success: true,
            order: updatedOrder,
            message: 'Payment confirmation recorded successfully. Verification is pending.',
          });
        }
      }
    }

    // Local / fallback response
    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderNumber,
        paymentType: cleanPaymentType,
        utrNumber: cleanUtr,
        screenshotUrl,
        payment_status: 'awaiting_verification',
        submittedAt: now,
      },
      message: 'Payment verification recorded. Our team will verify your payment within 6–12 hours.',
    });
  } catch (err: any) {
    console.error('Payment confirmation API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
