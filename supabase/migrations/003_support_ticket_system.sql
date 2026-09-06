-- ==============================================================================
-- PEPTRA BIO — 003_SUPPORT_TICKET_SYSTEM.SQL
-- Production Support Ticket System Migration
-- ==============================================================================

-- 1. Create Atomic Sequence for Ticket Numbers (TKT-10001, TKT-10002, ...)
CREATE SEQUENCE IF NOT EXISTS support_ticket_seq START WITH 10001 INCREMENT BY 1;

-- Function to generate human-readable ticket number atomically
CREATE OR REPLACE FUNCTION generate_next_ticket_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TKT-' || nextval('support_ticket_seq')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 2. Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL DEFAULT generate_next_ticket_number(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_name TEXT,
  order_id TEXT,
  order_number TEXT,
  product_id TEXT,
  product_name TEXT,
  verification_code_id UUID REFERENCES product_verification_codes(id) ON DELETE SET NULL,
  verification_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Indexes for fast filtering and searching
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_verification ON support_tickets(verification_code);
CREATE INDEX IF NOT EXISTS idx_support_tickets_order ON support_tickets(order_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- 3. Create support_ticket_messages table
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'support', 'admin')),
  message TEXT NOT NULL,
  is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_internal ON support_ticket_messages(is_internal_note);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created ON support_ticket_messages(created_at ASC);

-- 4. Create support_ticket_events audit trail table
CREATE TABLE IF NOT EXISTS support_ticket_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_events_ticket ON support_ticket_events(ticket_id);

-- 5. Row Level Security (RLS)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_events ENABLE ROW LEVEL SECURITY;

-- Tickets Policies
-- Customers can view their own tickets
CREATE POLICY "Customers can view own tickets"
  ON support_tickets
  FOR SELECT
  USING (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'support') OR auth.users.email LIKE '%@peptrabio.com')
    )
  );

-- Customers can create tickets
CREATE POLICY "Customers can create tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id OR customer_id IS NULL OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
    )
  );

-- Support/Admin can update tickets
CREATE POLICY "Staff can update tickets"
  ON support_tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'support') OR auth.users.email LIKE '%@peptrabio.com')
    )
  );

-- Messages Policies
-- Customers can view messages of their tickets EXCEPT internal notes
CREATE POLICY "Customers view non-internal messages of own tickets"
  ON support_ticket_messages
  FOR SELECT
  USING (
    (
      EXISTS (
        SELECT 1 FROM support_tickets
        WHERE support_tickets.id = support_ticket_messages.ticket_id
        AND support_tickets.customer_id = auth.uid()
      )
      AND is_internal_note = FALSE
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'support') OR auth.users.email LIKE '%@peptrabio.com')
    )
  );

-- Customers can insert messages into their own open tickets (non-internal only)
CREATE POLICY "Customers can reply to own tickets"
  ON support_ticket_messages
  FOR INSERT
  WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM support_tickets
        WHERE support_tickets.id = support_ticket_messages.ticket_id
        AND (support_tickets.customer_id = auth.uid() OR auth.uid() IS NOT NULL)
        AND support_tickets.status != 'closed'
      )
      AND is_internal_note = FALSE
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'support') OR auth.users.email LIKE '%@peptrabio.com')
    )
  );

-- Events Policies (Admin/Support only)
CREATE POLICY "Staff can view and create ticket events"
  ON support_ticket_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' IN ('admin', 'support') OR auth.users.email LIKE '%@peptrabio.com')
    )
  );

-- 6. Trigger to automatically update updated_at on ticket changes
CREATE OR REPLACE FUNCTION trigger_update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  ELSIF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_modtime
BEFORE UPDATE ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION trigger_update_ticket_timestamp();

-- 7. Trigger on message insert to automatically adjust ticket status
CREATE OR REPLACE FUNCTION trigger_on_ticket_message_inserted()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket_status TEXT;
BEGIN
  SELECT status INTO v_ticket_status FROM support_tickets WHERE id = NEW.ticket_id;
  
  -- If customer replies:
  IF NEW.sender_role = 'customer' AND NOT NEW.is_internal_note THEN
    IF v_ticket_status = 'waiting_for_customer' THEN
      UPDATE support_tickets SET status = 'in_progress', updated_at = NOW() WHERE id = NEW.ticket_id;
    ELSIF v_ticket_status = 'resolved' THEN
      UPDATE support_tickets SET status = 'open', updated_at = NOW() WHERE id = NEW.ticket_id;
    ELSE
      UPDATE support_tickets SET updated_at = NOW() WHERE id = NEW.ticket_id;
    END IF;
  -- If staff replies (public):
  ELSIF NEW.sender_role IN ('support', 'admin') AND NOT NEW.is_internal_note THEN
    UPDATE support_tickets SET status = 'waiting_for_customer', updated_at = NOW() WHERE id = NEW.ticket_id;
  ELSE
    UPDATE support_tickets SET updated_at = NOW() WHERE id = NEW.ticket_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ticket_message_added
AFTER INSERT ON support_ticket_messages
FOR EACH ROW
EXECUTE FUNCTION trigger_on_ticket_message_inserted();
