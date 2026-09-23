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
      customer_name,
      customer_email,
      customer_id,
      subject,
      category = 'General Support',
      priority = 'normal',
      message,
      order_number,
      product_name,
      verification_code,
      attachments = [],
    } = body;

    if (!customer_name || !customer_email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required.' },
        { status: 400 }
      );
    }

    const ticketId = body.id && body.id.length === 36 ? body.id : generateUUID();
    const messageId = generateUUID();
    const eventId = generateUUID();
    const now = new Date().toISOString();

    const ticketNumber = body.ticket_number || 'TKT-' + Math.floor(10000 + Math.random() * 90000);

    const ticketRecord = {
      id: ticketId,
      ticket_number: ticketNumber,
      customer_id: customer_id && customer_id.length === 36 ? customer_id : null,
      customer_name: String(customer_name).trim(),
      customer_email: String(customer_email).trim(),
      subject: String(subject).trim(),
      category: String(category).trim(),
      priority,
      status: 'open',
      order_number: order_number ? String(order_number).trim() : null,
      product_name: product_name ? String(product_name).trim() : null,
      verification_code: verification_code ? String(verification_code).trim() : null,
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

    // Insert Ticket
    const { error: ticketError } = await supabase.from('support_tickets').insert(ticketRecord);
    if (ticketError) {
      console.error('Supabase support_tickets insert error:', ticketError);
      return NextResponse.json({ error: ticketError.message }, { status: 500 });
    }

    // Insert Initial Message
    const messageRecord = {
      id: messageId,
      ticket_id: ticketId,
      sender_name: String(customer_name).trim(),
      sender_role: 'customer',
      message: String(message).trim(),
      is_internal_note: false,
      attachments: attachments || [],
      created_at: now,
    };
    await supabase.from('support_ticket_messages').insert(messageRecord);

    // Insert Initial Audit Event
    const eventRecord = {
      id: eventId,
      ticket_id: ticketId,
      event_type: 'Ticket Created',
      actor_name: String(customer_name).trim(),
      actor_role: 'customer',
      details: `Ticket created via website desk (Category: ${category})`,
      created_at: now,
    };
    await supabase.from('support_ticket_events').insert(eventRecord);

    return NextResponse.json(
      {
        success: true,
        ticket: {
          ...ticketRecord,
          messages: [messageRecord],
          events: [eventRecord],
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Support ticket API error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
