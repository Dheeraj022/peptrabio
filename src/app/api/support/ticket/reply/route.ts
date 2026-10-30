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
      ticketId,
      senderName,
      senderRole = 'support',
      message,
      isInternalNote = false,
      attachments = [],
      newStatus,
    } = body;

    if (!ticketId || !message) {
      return NextResponse.json(
        { error: 'ticketId and message are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    // Resolve real ticket UUID if ticketId is either UUID or Ticket Number (e.g. TKT-10248)
    const { data: ticketRecord, error: ticketFindError } = await supabase
      .from('support_tickets')
      .select('id, customer_id, customer_email, status')
      .or(`id.eq.${ticketId},ticket_number.eq.${ticketId}`)
      .maybeSingle();

    if (ticketFindError || !ticketRecord) {
      console.warn('Could not find ticket in database for reply:', ticketId, ticketFindError);
    }

    const resolvedTicketId = ticketRecord ? ticketRecord.id : ticketId;
    const now = new Date().toISOString();
    const messageId = (body.messageId && String(body.messageId).trim()) || generateUUID();
    const eventId = (body.eventId && String(body.eventId).trim()) || generateUUID();

    const messageRecord = {
      id: messageId,
      ticket_id: resolvedTicketId,
      sender_name: String(senderName || 'Support Agent').trim(),
      sender_role: senderRole,
      message: String(message).trim(),
      is_internal_note: Boolean(isInternalNote),
      attachments: attachments || [],
      created_at: now,
    };

    const { error: msgInsertError } = await supabase
      .from('support_ticket_messages')
      .insert(messageRecord);

    if (msgInsertError) {
      console.error('Failed to insert reply into support_ticket_messages:', msgInsertError);
      return NextResponse.json({ error: msgInsertError.message }, { status: 500 });
    }

    // Update ticket status & updated_at in database
    const statusToUpdate = newStatus || (!isInternalNote
      ? senderRole === 'customer'
        ? 'in_progress'
        : 'waiting_for_customer'
      : undefined);

    const updatePayload: Record<string, any> = {
      updated_at: now,
    };
    if (statusToUpdate) {
      updatePayload.status = statusToUpdate;
    }

    await supabase
      .from('support_tickets')
      .update(updatePayload)
      .eq('id', resolvedTicketId);

    // Audit Event
    const eventRecord = {
      id: eventId,
      ticket_id: resolvedTicketId,
      event_type: isInternalNote ? 'Internal Note Added' : 'Reply Sent',
      actor_name: String(senderName || 'Support Agent').trim(),
      actor_role: senderRole,
      details: isInternalNote
        ? 'Staff added a private internal audit note'
        : `${senderRole === 'customer' ? 'Customer' : 'Support staff'} sent a message`,
      created_at: now,
    };

    await supabase.from('support_ticket_events').insert(eventRecord);

    return NextResponse.json({
      success: true,
      message: messageRecord,
      event: eventRecord,
    });
  } catch (err: any) {
    console.error('Support reply API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
