import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      action,
      adminEmail = 'admin@peptrabio.com',
      verificationNotes,
      rejectionReason,
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (action !== 'verify' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be either "verify" or "reject"' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const isVerified = action === 'verify';

    const updatePayload: Record<string, any> = {
      payment_status: isVerified ? 'verified' : 'rejected',
      payment_verified_at: now,
      payment_verified_by: adminEmail,
      updated_at: now,
    };

    if (isVerified) {
      // Advance fulfillment status from pending/unpaid to processing
      updatePayload.status = 'processing';
      if (verificationNotes) {
        updatePayload.payment_notes = verificationNotes;
      }
    } else {
      updatePayload.payment_rejection_reason = rejectionReason || 'Transaction could not be reconciled with merchant bank records.';
      if (verificationNotes) {
        updatePayload.payment_notes = verificationNotes;
      }
    }

    const supabase = createAdminClient();
    if (supabase) {
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Supabase payment verification update error:', error);
      }

      // Record in audit log
      try {
        await supabase.from('admin_audit_logs').insert({
          id: 'log-' + Date.now(),
          admin_email: adminEmail,
          action: isVerified ? 'payment_verified' : 'payment_rejected',
          entity_type: 'order_payment',
          entity_id: orderId,
          metadata: {
            order_id: orderId,
            action,
            notes: verificationNotes,
            rejection_reason: rejectionReason,
          },
          created_at: now,
        });
      } catch (auditErr) {
        console.warn('Audit log write error:', auditErr);
      }

      if (updatedOrder) {
        return NextResponse.json({
          success: true,
          order: updatedOrder,
          message: isVerified ? 'Payment verified successfully.' : 'Payment marked as rejected.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        payment_status: updatePayload.payment_status,
        verified_at: now,
        verified_by: adminEmail,
      },
      message: isVerified ? 'Payment verified successfully.' : 'Payment marked as rejected.',
    });
  } catch (err: any) {
    console.error('Admin payment verification error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
