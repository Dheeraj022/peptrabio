export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_for_customer'
  | 'resolved'
  | 'closed';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TicketCategory =
  | 'Order Issue'
  | 'Product Issue'
  | 'Product Verification'
  | 'Payment Issue'
  | 'Shipping'
  | 'Refund'
  | 'Technical Issue'
  | 'General Support'
  | 'Other';

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id?: string;
  sender_name: string;
  sender_role: 'customer' | 'support' | 'admin';
  message: string;
  is_internal_note: boolean;
  attachments?: TicketAttachment[];
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to?: string;
  assigned_name?: string;
  order_id?: string;
  order_number?: string;
  product_id?: string;
  product_name?: string;
  verification_code_id?: string;
  verification_code?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  // Computed fields
  message_count?: number;
  last_message?: string;
}

export interface TicketEvent {
  id: string;
  ticket_id: string;
  event_type: string;
  actor_name: string;
  actor_role: 'customer' | 'support' | 'admin' | 'system';
  details?: string;
  created_at: string;
}

export interface CreateTicketInput {
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  category: TicketCategory;
  priority?: 'low' | 'normal' | 'high'; // Customer cannot choose 'urgent'
  message: string;
  order_number?: string;
  product_name?: string;
  verification_code?: string;
  attachments?: TicketAttachment[];
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  waiting_for_customer: number;
  resolved: number;
  closed: number;
  urgent: number;
}
