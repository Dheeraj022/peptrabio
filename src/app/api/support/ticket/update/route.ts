import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, status, priority, assigned_to, assigned_name, actorName = 'Admin' } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    // Resolve ticket UUID whether ticketId is UUID or ticket_number
    const { data: ticketRecord, error: findError } = await supabase
      .from('support_tickets')
      .select('id, ticket_number, status, priority, assigned_to, assigned_name')
      .or(`id.eq.${ticketId},ticket_number.eq.${ticketId}`)
      .maybeSingle();

    if (findError) {
      console.warn('Find ticket error in PATCH:', findError);
    }

    const resolvedId = ticketRecord ? ticketRecord.id : ticketId;
    const now = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      updated_at: now,
    };

    if (status) {
      updatePayload.status = status;
      if (status === 'resolved') {
        updatePayload.resolved_at = now;
      } else if (status === 'closed') {
        updatePayload.closed_at = now;
      }
    }

    if (priority) {
      updatePayload.priority = priority;
    }

    if (assigned_to !== undefined) {
      updatePayload.assigned_to = assigned_to || null;
      updatePayload.assigned_name = assigned_name || null;
    }

    const { error: updateError } = await supabase
      .from('support_tickets')
      .update(updatePayload)
      .eq('id', resolvedId);

    if (updateError) {
      console.error('Supabase support_tickets update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Add audit event in Supabase
    let eventType = 'Ticket Updated';
    let details = 'Ticket modified';

    if (status && ticketRecord && ticketRecord.status !== status) {
      eventType = 'Status Changed';
      details = `Status updated from ${ticketRecord.status.toUpperCase()} to ${status.toUpperCase()}`;
    } else if (priority && ticketRecord && ticketRecord.priority !== priority) {
      eventType = 'Priority Changed';
      details = `Priority changed from ${ticketRecord.priority.toUpperCase()} to ${priority.toUpperCase()}`;
    } else if (assigned_name) {
      eventType = 'Assigned';
      details = `Assigned to ${assigned_name}`;
    }

    await supabase.from('support_ticket_events').insert({
      ticket_id: resolvedId,
      event_type: eventType,
      actor_name: actorName,
      actor_role: 'admin',
      details,
      created_at: now,
    });

    return NextResponse.json({
      success: true,
      ticketId: resolvedId,
      updated: updatePayload,
    });
  } catch (err: any) {
    console.error('Ticket update route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
