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

// Initial Seeds for demo & initial testing
const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-10245',
    ticket_number: 'TKT-10245',
    customer_id: 'user-researcher-1',
    customer_name: 'Dr. Sarah Mitchell',
    customer_email: 'lab.researcher@biotech-institute.edu',
    subject: 'Product Verification Limit Reached on Selank 5mg',
    category: 'Product Verification',
    priority: 'high',
    status: 'in_progress',
    assigned_to: 'staff-agent-1',
    assigned_name: 'Support Agent Alex',
    product_id: 'prod-selank-5mg',
    product_name: 'Selank (5mg)',
    verification_code: '7K9X2M',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'tkt-10246',
    ticket_number: 'TKT-10246',
    customer_id: 'user-researcher-2',
    customer_name: 'Dr. Julian Vance',
    customer_email: 'j.vance@neuro-genomics.org',
    subject: 'Cold-Chain Delivery Timing Inquiry for BPC-157 / TB-500',
    category: 'Shipping',
    priority: 'normal',
    status: 'waiting_for_customer',
    assigned_to: 'staff-agent-2',
    assigned_name: 'Support Specialist Elena',
    order_id: 'ord-1002',
    order_number: 'PB-ORD-9822',
    product_name: 'BPC-157 + TB-500 Blend',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'tkt-10247',
    ticket_number: 'TKT-10247',
    customer_id: 'user-researcher-3',
    customer_name: 'Marcus Brody, MSc',
    customer_email: 'm.brody@cellular-dynamics.ac.uk',
    subject: 'Request for Extended HPLC Chromatogram Report',
    category: 'Technical Issue',
    priority: 'low',
    status: 'resolved',
    assigned_to: 'staff-agent-1',
    assigned_name: 'Support Agent Alex',
    product_name: 'CJC-1295 DAC',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    resolved_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

const INITIAL_MESSAGES: TicketMessage[] = [
  {
    id: 'msg-101',
    ticket_id: 'tkt-10245',
    sender_id: 'user-researcher-1',
    sender_name: 'Dr. Sarah Mitchell',
    sender_role: 'customer',
    message: 'Hello Peptra Bio Support, I attempted to verify my physical box of Selank (5mg) with code 7K9X2M, but the page states that the verification scan limit of 3 has been reached. Could you please check the scan history and confirm this batch?',
    is_internal_note: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'msg-102',
    ticket_id: 'tkt-10245',
    sender_id: 'staff-agent-1',
    sender_name: 'Support Agent Alex',
    sender_role: 'support',
    message: 'Internal review: Checked backend audit logs for code 7K9X2M. Code is valid, generated in batch SLK-2025-04. 3 scans originated from IP subnet in Cambridge, MA.',
    is_internal_note: true,
    created_at: new Date(Date.now() - 86400000 * 1.8).toISOString(),
  },
  {
    id: 'msg-103',
    ticket_id: 'tkt-10245',
    sender_id: 'staff-agent-1',
    sender_name: 'Support Agent Alex',
    sender_role: 'support',
    message: 'Dear Dr. Mitchell, Thank you for reaching out. We have audited the verification history for your code 7K9X2M. The unit is 100% genuine and verified from Batch SLK-2025-04. Please upload a photo of the box QR code for final authentication verification so we can reset your scan allowance if needed.',
    is_internal_note: false,
    created_at: new Date(Date.now() - 86400000 * 1.7).toISOString(),
  },
  {
    id: 'msg-104',
    ticket_id: 'tkt-10246',
    sender_id: 'user-researcher-2',
    sender_name: 'Dr. Julian Vance',
    sender_role: 'customer',
    message: 'Hi team, We placed order PB-ORD-9822 containing BPC-157 and TB-500. Could you confirm if dry ice / insulated cold packs are included for Saturday delivery?',
    is_internal_note: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'msg-105',
    ticket_id: 'tkt-10246',
    sender_id: 'staff-agent-2',
    sender_name: 'Support Specialist Elena',
    sender_role: 'support',
    message: 'Hello Dr. Vance, Yes, all peptide lyophilized vials are dispatched in insulated foam cold-chain containers with certified temperature monitoring tags. We have dispatched tracking via FedEx Priority.',
    is_internal_note: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

const INITIAL_EVENTS: TicketEvent[] = [
  {
    id: 'evt-1',
    ticket_id: 'tkt-10245',
    event_type: 'Ticket Created',
    actor_name: 'Dr. Sarah Mitchell',
    actor_role: 'customer',
    details: 'Ticket created with category Product Verification',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'evt-2',
    ticket_id: 'tkt-10245',
    event_type: 'Assigned',
    actor_name: 'System',
    actor_role: 'system',
    details: 'Assigned to Support Agent Alex',
    created_at: new Date(Date.now() - 86400000 * 1.9).toISOString(),
  },
  {
    id: 'evt-3',
    ticket_id: 'tkt-10245',
    event_type: 'Status Changed',
    actor_name: 'Support Agent Alex',
    actor_role: 'support',
    details: 'Status changed from Open to In Progress',
    created_at: new Date(Date.now() - 86400000 * 1.7).toISOString(),
  }
];

// Server-side in-memory cache
let serverTickets: SupportTicket[] = [...INITIAL_TICKETS];
let serverMessages: TicketMessage[] = [...INITIAL_MESSAGES];
let serverEvents: TicketEvent[] = [...INITIAL_EVENTS];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getLocalTickets(): SupportTicket[] {
  if (!isBrowser()) return serverTickets;
  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_KEY);
    if (!raw) {
      localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(raw);
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
      localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(raw);
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
      localStorage.setItem(SUPPORT_EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    return JSON.parse(raw);
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
  const tickets = getLocalTickets();
  const messages = getLocalMessages();

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
 */
export async function fetchCustomerTickets(customerEmail?: string): Promise<SupportTicket[]> {
  const all = await fetchAllTickets();
  if (!customerEmail) return all;
  return all.filter((t) => t.customer_email.toLowerCase() === customerEmail.toLowerCase());
}

/**
 * Fetch a single ticket by ID or Ticket Number
 */
export async function fetchTicketById(idOrNumber: string): Promise<SupportTicket | null> {
  const tickets = getLocalTickets();
  const found = tickets.find(
    (t) =>
      t.id.toLowerCase() === idOrNumber.toLowerCase() ||
      t.ticket_number.toLowerCase() === idOrNumber.toLowerCase()
  );
  return found || null;
}

/**
 * Fetch messages for a ticket
 * Filters out internal notes if isStaff is false!
 */
export async function fetchTicketMessages(ticketId: string, isStaff = false): Promise<TicketMessage[]> {
  const messages = getLocalMessages();
  const ticketMessages = messages.filter((m) => m.ticket_id === ticketId);

  if (!isStaff) {
    return ticketMessages.filter((m) => !m.is_internal_note);
  }
  return ticketMessages;
}

/**
 * Fetch audit events for a ticket
 */
export async function fetchTicketEvents(ticketId: string): Promise<TicketEvent[]> {
  const events = getLocalEvents();
  return events
    .filter((e) => e.ticket_id === ticketId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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
  const newTicketId = `tkt-${Date.now()}`;

  const newTicket: SupportTicket = {
    id: newTicketId,
    ticket_number: ticketNumber,
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
    id: `msg-${Date.now()}`,
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
    id: `evt-${Date.now()}`,
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

  const ticketIndex = tickets.findIndex((t) => t.id === params.ticketId);
  if (ticketIndex === -1) {
    throw new Error('Ticket not found');
  }

  const ticket = tickets[ticketIndex];
  const now = new Date().toISOString();

  // Closed ticket check for customer
  if (ticket.status === 'closed' && params.senderRole === 'customer') {
    throw new Error('This ticket is closed. Please create a new support ticket.');
  }

  const newMessage: TicketMessage = {
    id: `msg-${Date.now()}`,
    ticket_id: params.ticketId,
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
    ticket_id: params.ticketId,
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

  const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
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
    ticket_id: ticketId,
    event_type: 'Status Changed',
    actor_name: actorName,
    actor_role: actorRole,
    details: `Status updated from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`,
    created_at: now,
  });

  saveLocalTickets(tickets);
  saveLocalEvents(events);

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

  const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
  if (ticketIndex === -1) throw new Error('Ticket not found');

  const ticket = tickets[ticketIndex];
  const oldPriority = ticket.priority;
  const now = new Date().toISOString();

  ticket.priority = newPriority;
  ticket.updated_at = now;
  tickets[ticketIndex] = ticket;

  events.push({
    id: `evt-${Date.now()}`,
    ticket_id: ticketId,
    event_type: 'Priority Changed',
    actor_name: actorName,
    actor_role: 'admin',
    details: `Priority changed from ${oldPriority.toUpperCase()} to ${newPriority.toUpperCase()}`,
    created_at: now,
  });

  saveLocalTickets(tickets);
  saveLocalEvents(events);

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

  const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
  if (ticketIndex === -1) throw new Error('Ticket not found');

  const ticket = tickets[ticketIndex];
  const now = new Date().toISOString();

  ticket.assigned_to = assignedTo;
  ticket.assigned_name = assignedName;
  ticket.updated_at = now;
  tickets[ticketIndex] = ticket;

  events.push({
    id: `evt-${Date.now()}`,
    ticket_id: ticketId,
    event_type: 'Assigned',
    actor_name: actorName,
    actor_role: 'admin',
    details: `Assigned to ${assignedName}`,
    created_at: now,
  });

  saveLocalTickets(tickets);
  saveLocalEvents(events);

  return ticket;
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
