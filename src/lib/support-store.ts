import {
  SupportTicket,
  TicketMessage,
  TicketEvent,
  CreateTicketInput,
  TicketStatus,
  TicketPriority,
  TicketStats,
  TicketAttachment
} from '@/types/support';
import { createClient } from './supabase/client';

const SUPPORT_TICKETS_KEY = 'peptrabio_support_tickets_v1';
const SUPPORT_MESSAGES_KEY = 'peptrabio_support_messages_v1';
const SUPPORT_EVENTS_KEY = 'peptrabio_support_events_v1';

// Dummy Ticket IDs to filter out legacy seeds
const LEGACY_DUMMY_IDS = new Set(['tkt-10245', 'tkt-10246', 'tkt-10247']);
const LEGACY_CUSTOMER_IDS = new Set(['user-researcher-1', 'user-researcher-2', 'user-researcher-3']);
const LEGACY_MSG_IDS = new Set(['msg-101', 'msg-102', 'msg-103', 'msg-104', 'msg-105']);
const LEGACY_EVT_IDS = new Set(['evt-1', 'evt-2', 'evt-3']);

// Initial Seeds (Clean - no dummy support tickets)
const INITIAL_TICKETS: SupportTicket[] = [];
const INITIAL_MESSAGES: TicketMessage[] = [];
const INITIAL_EVENTS: TicketEvent[] = [];

// Server-side in-memory cache
let serverTickets: SupportTicket[] = [];
let serverMessages: TicketMessage[] = [];
let serverEvents: TicketEvent[] = [];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getLocalTickets(): SupportTicket[] {
  if (!isBrowser()) return serverTickets;
  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_KEY);
    if (!raw) {
      localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: SupportTicket[] = JSON.parse(raw);
    const cleaned = parsed.filter(
      (t) => !LEGACY_DUMMY_IDS.has(t.id) && !(t.customer_id && LEGACY_CUSTOMER_IDS.has(t.customer_id))
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return serverTickets;
  }
}

export function saveLocalTickets(tickets: SupportTicket[]): void {
  if (!isBrowser()) {
    serverTickets = [...tickets];
    return;
  }
  try {
    localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Error saving support tickets', err);
  }
}

export function getLocalMessages(): TicketMessage[] {
  if (!isBrowser()) return serverMessages;
  try {
    const raw = localStorage.getItem(SUPPORT_MESSAGES_KEY);
    if (!raw) {
      localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: TicketMessage[] = JSON.parse(raw);
    const cleaned = parsed.filter(
      (m) => !LEGACY_DUMMY_IDS.has(m.ticket_id) && !LEGACY_MSG_IDS.has(m.id)
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return serverMessages;
  }
}

export function saveLocalMessages(messages: TicketMessage[]): void {
  if (!isBrowser()) {
    serverMessages = [...messages];
    return;
  }
  try {
    localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(messages));
  } catch (err) {
    console.error('Error saving support messages', err);
  }
}

export function getLocalEvents(): TicketEvent[] {
  if (!isBrowser()) return serverEvents;
  try {
    const raw = localStorage.getItem(SUPPORT_EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(SUPPORT_EVENTS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed: TicketEvent[] = JSON.parse(raw);
    const cleaned = parsed.filter(
      (e) => !LEGACY_DUMMY_IDS.has(e.ticket_id) && !LEGACY_EVT_IDS.has(e.id)
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(SUPPORT_EVENTS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return serverEvents;
  }
}

export function saveLocalEvents(events: TicketEvent[]): void {
  if (!isBrowser()) {
    serverEvents = [...events];
    return;
  }
  try {
    localStorage.setItem(SUPPORT_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Error saving support events', err);
  }
}

/**
 * Generates an atomic sequential ticket number (TKT-10001, ...)
 */
export function generateTicketNumber(existingTickets: SupportTicket[]): string {
  let highest = 10247;
  for (const t of existingTickets) {
    const match = t.ticket_number.match(/TKT-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highest) highest = num;
    }
  }
  return `TKT-${highest + 1}`;
}

/**
 * Fetch all tickets (with message counts)
 */
export async function fetchAllTickets(): Promise<SupportTicket[]> {
  let tickets = getLocalTickets();
  const messages = getLocalMessages();

  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const dbTicketIds = new Set(data.map((t) => t.id));
        const localOnly = tickets.filter((t) => !dbTicketIds.has(t.id));
        tickets = [...data, ...localOnly];
        saveLocalTickets(tickets);
      }
    } catch (e) {
      console.warn('Supabase fetchAllTickets fallback:', e);
    }
  }

  return tickets.map((t) => {
    const msgs = messages.filter((m) => m.ticket_id === t.id && !m.is_internal_note);
    const lastMsg = msgs[msgs.length - 1];
    return {
      ...t,
      message_count: msgs.length,
      last_message: lastMsg ? lastMsg.message : undefined,
    };
  }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

/**
 * Fetch tickets for a specific customer
 * Strictly isolates tickets to only the authenticated user's email / user ID
 */
export async function fetchCustomerTickets(customerEmail?: string, customerId?: string): Promise<SupportTicket[]> {
  if (!customerEmail && !customerId) return [];
  const all = await fetchAllTickets();
  const normalizedEmail = customerEmail ? customerEmail.trim().toLowerCase() : '';
  
  return all.filter((t) => {
    const matchesEmail = normalizedEmail && t.customer_email && t.customer_email.trim().toLowerCase() === normalizedEmail;
    const matchesId = customerId && t.customer_id && t.customer_id === customerId;
    return Boolean(matchesEmail || matchesId);
  });
}

/**
 * Fetch a single ticket by ID or Ticket Number
 */
export async function fetchTicketById(idOrNumber: string): Promise<SupportTicket | null> {
  const localTickets = getLocalTickets();
  const local = localTickets.find(
    (t) =>
      t.id.toLowerCase() === idOrNumber.toLowerCase() ||
      t.ticket_number.toLowerCase() === idOrNumber.toLowerCase()
  );

  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .or(`id.eq.${idOrNumber},ticket_number.eq.${idOrNumber}`)
        .maybeSingle();

      if (!error && data) {
        const fetched = data as SupportTicket;
        const idx = localTickets.findIndex((t) => t.id === fetched.id);
        if (idx !== -1) {
          localTickets[idx] = fetched;
        } else {
          localTickets.unshift(fetched);
        }
        saveLocalTickets(localTickets);
        return fetched;
      }
    } catch (e) {
      console.warn('Supabase fetchTicketById error:', e);
    }
  }

  return local || null;
}

/**
 * Fetch messages for a ticket
 * Filters out internal notes if isStaff is false!
 */
export async function fetchTicketMessages(ticketIdOrNumber: string, isStaff = false): Promise<TicketMessage[]> {
  const localTickets = getLocalTickets();
  const ticketObj = localTickets.find(
    (t) => t.id.toLowerCase() === ticketIdOrNumber.toLowerCase() || t.ticket_number.toLowerCase() === ticketIdOrNumber.toLowerCase()
  );
  const targetId = ticketObj ? ticketObj.id : ticketIdOrNumber;

  let allLocalMessages = getLocalMessages();
  let ticketMessages = allLocalMessages.filter((m) => m.ticket_id === targetId || m.ticket_id === ticketIdOrNumber);

  const supabase = createClient();
  if (supabase) {
    try {
      const query = supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', targetId)
        .order('created_at', { ascending: true });

      if (!isStaff) {
        query.eq('is_internal_note', false);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const msgIds = new Set(data.map((m) => m.id));
        const localOnly = ticketMessages.filter((m) => !msgIds.has(m.id));
        ticketMessages = [...data, ...localOnly];

        // Also sync these fresh messages into local cache so future renders are instant
        const otherMessages = allLocalMessages.filter((m) => m.ticket_id !== targetId && m.ticket_id !== ticketIdOrNumber);
        saveLocalMessages([...otherMessages, ...ticketMessages]);
      }
    } catch (e) {
      console.warn('Supabase fetchTicketMessages fallback:', e);
    }
  }

  ticketMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (!isStaff) {
    return ticketMessages.filter((m) => !m.is_internal_note);
  }
  return ticketMessages;
}

/**
 * Fetch audit events for a ticket
 */
export async function fetchTicketEvents(ticketIdOrNumber: string): Promise<TicketEvent[]> {
  const localTickets = getLocalTickets();
  const ticketObj = localTickets.find(
    (t) => t.id.toLowerCase() === ticketIdOrNumber.toLowerCase() || t.ticket_number.toLowerCase() === ticketIdOrNumber.toLowerCase()
  );
  const targetId = ticketObj ? ticketObj.id : ticketIdOrNumber;

  let allLocalEvents = getLocalEvents();
  let events = allLocalEvents.filter((e) => e.ticket_id === targetId || e.ticket_id === ticketIdOrNumber);

  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('support_ticket_events')
        .select('*')
        .eq('ticket_id', targetId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const evtIds = new Set(data.map((e) => e.id));
        const localOnly = events.filter((e) => !evtIds.has(e.id));
        events = [...data, ...localOnly];

        const otherEvents = allLocalEvents.filter((e) => e.ticket_id !== targetId && e.ticket_id !== ticketIdOrNumber);
        saveLocalEvents([...otherEvents, ...events]);
      }
    } catch {}
  }

  return events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

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

/**
 * Create a new support ticket
 */
export async function createTicket(input: CreateTicketInput): Promise<SupportTicket> {
  const tickets = getLocalTickets();
  const messages = getLocalMessages();
  const events = getLocalEvents();

  const ticketNumber = generateTicketNumber(tickets);
  const now = new Date().toISOString();
  const newTicketId = generateUUID();
  const initialMessageId = generateUUID();
  const eventId = generateUUID();

  const newTicket: SupportTicket = {
    id: newTicketId,
    ticket_number: ticketNumber,
    customer_id: input.customer_id && input.customer_id.length === 36 ? input.customer_id : undefined,
    customer_name: input.customer_name.trim(),
    customer_email: input.customer_email.trim(),
    subject: input.subject.trim(),
    category: input.category,
    priority: input.priority || 'normal',
    status: 'open',
    order_number: input.order_number?.trim() || undefined,
    product_name: input.product_name?.trim() || undefined,
    verification_code: input.verification_code?.trim() || undefined,
    created_at: now,
    updated_at: now,
  };

  // Initial message
  const initialMessage: TicketMessage = {
    id: initialMessageId,
    ticket_id: newTicketId,
    sender_name: input.customer_name.trim(),
    sender_role: 'customer',
    message: input.message.trim(),
    is_internal_note: false,
    attachments: input.attachments || [],
    created_at: now,
  };

  // Event
  const event: TicketEvent = {
    id: eventId,
    ticket_id: newTicketId,
    event_type: 'Ticket Created',
    actor_name: input.customer_name.trim(),
    actor_role: 'customer',
    details: `Ticket created via customer support portal (Category: ${input.category})`,
    created_at: now,
  };

  tickets.unshift(newTicket);
  messages.push(initialMessage);
  events.push(event);

  saveLocalTickets(tickets);
  saveLocalMessages(messages);
  saveLocalEvents(events);

  // Sync with Supabase via API route
  try {
    const res = await fetch('/api/support/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        id: newTicketId,
        ticket_number: ticketNumber,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Failed to insert support ticket into Supabase via API:', errData);
    } else {
      const resJson = await res.json();
      if (resJson.ticket) {
        return resJson.ticket as SupportTicket;
      }
    }
  } catch (err) {
    console.warn('Support ticket API sync failed, relying on local store fallback:', err);
  }

  // Notify active listeners across windows/tabs
  if (isBrowser()) {
    window.dispatchEvent(new Event('peptrabio_tickets_updated'));
  }

  return newTicket;
}

/**
 * Send a reply to an existing ticket
 */
export async function sendTicketReply(params: {
  ticketId: string;
  senderName: string;
  senderRole: 'customer' | 'support' | 'admin';
  message: string;
  isInternalNote?: boolean;
  attachments?: TicketAttachment[];
}): Promise<TicketMessage> {
  const tickets = getLocalTickets();
  const messages = getLocalMessages();
  const events = getLocalEvents();

  const ticketIndex = tickets.findIndex(
    (t) => t.id === params.ticketId || t.ticket_number.toLowerCase() === params.ticketId.toLowerCase()
  );
  if (ticketIndex === -1) {
    throw new Error('Ticket not found');
  }

  const ticket = tickets[ticketIndex];
  const targetId = ticket.id;
  const now = new Date().toISOString();

  // Closed ticket check for customer
  if (ticket.status === 'closed' && params.senderRole === 'customer') {
    throw new Error('This ticket is closed. Please create a new support ticket.');
  }

  const newMessage: TicketMessage = {
    id: `msg-${Date.now()}`,
    ticket_id: targetId,
    sender_name: params.senderName,
    sender_role: params.senderRole,
    message: params.message.trim(),
    is_internal_note: !!params.isInternalNote,
    attachments: params.attachments || [],
    created_at: now,
  };

  messages.push(newMessage);

  // Status transitions
  if (!params.isInternalNote) {
    if (params.senderRole === 'customer') {
      if (ticket.status === 'waiting_for_customer') {
        ticket.status = 'in_progress';
      } else if (ticket.status === 'resolved') {
        ticket.status = 'open';
      }
    } else if (params.senderRole === 'support' || params.senderRole === 'admin') {
      ticket.status = 'waiting_for_customer';
    }
  }

  ticket.updated_at = now;
  tickets[ticketIndex] = ticket;

  // Log audit event
  const event: TicketEvent = {
    id: `evt-${Date.now()}`,
    ticket_id: targetId,
    event_type: params.isInternalNote ? 'Internal Note Added' : 'Reply Sent',
    actor_name: params.senderName,
    actor_role: params.senderRole,
    details: params.isInternalNote
      ? 'Staff added a private internal audit note'
      : `${params.senderRole === 'customer' ? 'Customer' : 'Support staff'} sent a message`,
    created_at: now,
  };
  events.push(event);

  saveLocalTickets(tickets);
  saveLocalMessages(messages);
  saveLocalEvents(events);

  // Sync reply and audit event to Supabase database via server endpoint
  try {
    fetch('/api/support/ticket/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId: targetId,
        senderName: params.senderName,
        senderRole: params.senderRole,
        message: params.message.trim(),
        isInternalNote: !!params.isInternalNote,
        attachments: params.attachments || [],
        newStatus: ticket.status,
      }),
    }).catch((err) => console.warn('Reply API sync error:', err));
  } catch (err) {
    console.warn('Reply sync error:', err);
  }

  if (isBrowser()) {
    window.dispatchEvent(new Event('peptrabio_tickets_updated'));
  }

  return newMessage;
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  actorName = 'Support Admin',
  actorRole: 'support' | 'admin' = 'admin'
): Promise<SupportTicket> {
  const tickets = getLocalTickets();
  const events = getLocalEvents();

  const ticketIndex = tickets.findIndex(
    (t) => t.id === ticketId || t.ticket_number.toLowerCase() === ticketId.toLowerCase()
  );
  if (ticketIndex === -1) throw new Error('Ticket not found');

  const ticket = tickets[ticketIndex];
  const oldStatus = ticket.status;
  const now = new Date().toISOString();

  ticket.status = newStatus;
  ticket.updated_at = now;

  if (newStatus === 'resolved') {
    ticket.resolved_at = now;
  } else if (newStatus === 'closed') {
    ticket.closed_at = now;
  }

  tickets[ticketIndex] = ticket;

  events.push({
    id: `evt-${Date.now()}`,
    ticket_id: ticket.id,
    event_type: 'Status Changed',
    actor_name: actorName,
    actor_role: actorRole,
    details: `Status updated from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`,
    created_at: now,
  });

  saveLocalTickets(tickets);
  saveLocalEvents(events);

  if (isBrowser()) {
    window.dispatchEvent(new Event('peptrabio_tickets_updated'));
  }

  return ticket;
}

/**
 * Update ticket priority
 */
export async function updateTicketPriority(
  ticketId: string,
  newPriority: TicketPriority,
  actorName = 'Support Admin'
): Promise<SupportTicket> {
  const tickets = getLocalTickets();
  const events = getLocalEvents();

  const ticketIndex = tickets.findIndex(
    (t) => t.id === ticketId || t.ticket_number.toLowerCase() === ticketId.toLowerCase()
  );
  if (ticketIndex === -1) throw new Error('Ticket not found');

  const ticket = tickets[ticketIndex];
  const oldPriority = ticket.priority;
  const now = new Date().toISOString();

  ticket.priority = newPriority;
  ticket.updated_at = now;
  tickets[ticketIndex] = ticket;

  events.push({
    id: `evt-${Date.now()}`,
    ticket_id: ticket.id,
    event_type: 'Priority Changed',
    actor_name: actorName,
    actor_role: 'admin',
    details: `Priority changed from ${oldPriority.toUpperCase()} to ${newPriority.toUpperCase()}`,
    created_at: now,
  });

  saveLocalTickets(tickets);
  saveLocalEvents(events);

  if (isBrowser()) {
    window.dispatchEvent(new Event('peptrabio_tickets_updated'));
  }

  return ticket;
}

/**
 * Assign ticket to agent
 */
export async function assignTicket(
  ticketId: string,
  assignedTo: string,
  assignedName: string,
  actorName = 'Support Admin'
): Promise<SupportTicket> {
  const tickets = getLocalTickets();
  const events = getLocalEvents();

  const ticketIndex = tickets.findIndex(
    (t) => t.id === ticketId || t.ticket_number.toLowerCase() === ticketId.toLowerCase()
  );
  if (ticketIndex === -1) throw new Error('Ticket not found');

  const ticket = tickets[ticketIndex];
  const now = new Date().toISOString();

  ticket.assigned_to = assignedTo;
  ticket.assigned_name = assignedName;
  ticket.updated_at = now;
  tickets[ticketIndex] = ticket;

  events.push({
    id: `evt-${Date.now()}`,
    ticket_id: ticket.id,
    event_type: 'Assigned',
    actor_name: actorName,
    actor_role: 'admin',
    details: `Assigned to ${assignedName}`,
    created_at: now,
  });

  saveLocalTickets(tickets);
  saveLocalEvents(events);

  if (isBrowser()) {
    window.dispatchEvent(new Event('peptrabio_tickets_updated'));
  }

  return ticket;
}

/**
 * Delete a support ticket and its related messages and events
 */
export async function deleteTicket(ticketId: string): Promise<boolean> {
  const tickets = getLocalTickets();
  const ticketToDelete = tickets.find((t) => t.id === ticketId || t.ticket_number.toLowerCase() === ticketId.toLowerCase());
  const actualId = ticketToDelete ? ticketToDelete.id : ticketId;

  const updatedTickets = tickets.filter((t) => t.id !== actualId && t.ticket_number.toLowerCase() !== ticketId.toLowerCase());
  saveLocalTickets(updatedTickets);

  const messages = getLocalMessages();
  const updatedMessages = messages.filter((m) => m.ticket_id !== actualId && m.ticket_id !== ticketId);
  saveLocalMessages(updatedMessages);

  const events = getLocalEvents();
  const updatedEvents = events.filter((e) => e.ticket_id !== actualId && e.ticket_id !== ticketId);
  saveLocalEvents(updatedEvents);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from('support_tickets').delete().eq('id', actualId);
    } catch (e) {
      console.warn('Supabase delete ticket fallback', e);
    }
  }

  if (isBrowser()) {
    window.dispatchEvent(new Event('peptrabio_tickets_updated'));
  }

  return true;
}

/**
 * Compute Helpdesk KPI Stats
 */
export function computeTicketStats(tickets: SupportTicket[]): TicketStats {
  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    waiting_for_customer: tickets.filter((t) => t.status === 'waiting_for_customer').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
    urgent: tickets.filter((t) => t.priority === 'urgent' && t.status !== 'closed' && t.status !== 'resolved').length,
  };
}

