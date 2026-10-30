'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  fetchTicketById,
  fetchTicketMessages,
  fetchTicketEvents,
  sendTicketReply,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket
} from '@/lib/support-store';
import {
  SupportTicket,
  TicketMessage,
  TicketEvent,
  TicketStatus,
  TicketPriority,
  TicketAttachment
} from '@/types/support';
import {
  LifeBuoy,
  ArrowLeft,
  Send,
  Paperclip,
  X,
  File,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Download,
  Lock,
  User,
  Headphones,
  UserCheck,
  History,
  FileText,
  Building,
  AlertTriangle,
  Flame,
  MessageSquare
} from 'lucide-react';

const SUPPORT_AGENTS = [
  { id: 'staff-agent-1', name: 'Support Agent Alex' },
  { id: 'staff-agent-2', name: 'Support Specialist Elena' },
  { id: 'staff-agent-3', name: 'Dr. Marcus Vance (QA Director)' },
];

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || '';
  const ticketId = decodeURIComponent(rawId);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply Composer state
  const [replyMode, setReplyMode] = useState<'public' | 'internal'>('public');
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Status & Assignment Controls
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('open');
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority>('normal');
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    if (!ticketId) return;
    const t = await fetchTicketById(ticketId);
    if (t) {
      setTicket(t);
      setSelectedStatus(t.status);
      setSelectedPriority(t.priority);
      setSelectedAgent(t.assigned_to || '');

      // Staff view: isStaff = true so we see internal notes!
      const msgs = await fetchTicketMessages(t.id, true);
      setMessages(msgs);

      const evts = await fetchTicketEvents(t.id);
      setEvents(evts);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'peptrabio_support_tickets_v1' ||
        e.key === 'peptrabio_support_messages_v1' ||
        e.key === 'peptrabio_support_events_v1'
      ) {
        loadData();
      }
    };

    const handleCustom = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('peptrabio_tickets_updated', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('peptrabio_tickets_updated', handleCustom);
    };
  }, [ticketId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: TicketAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 10MB.`);
        continue;
      }
      const blobUrl = URL.createObjectURL(file);
      newAttachments.push({
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: blobUrl,
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && attachments.length === 0) return;
    if (!ticket) return;

    setSubmitting(true);
    try {
      await sendTicketReply({
        ticketId: ticket.id,
        senderName: 'Support Agent Alex',
        senderRole: 'support',
        message: replyText.trim() || '(Attachment attached)',
        isInternalNote: replyMode === 'internal',
        attachments,
      });

      setReplyText('');
      setAttachments([]);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      await updateTicketStatus(ticket.id, newStatus, 'Support Admin', 'admin');
      setSelectedStatus(newStatus);
      await loadData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket) return;
    try {
      await updateTicketPriority(ticket.id, newPriority, 'Support Admin');
      setSelectedPriority(newPriority);
      await loadData();
    } catch (err) {
      alert('Failed to update priority');
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!ticket) return;
    const agent = SUPPORT_AGENTS.find((a) => a.id === agentId);
    if (!agent) return;

    try {
      await assignTicket(ticket.id, agent.id, agent.name, 'Support Admin');
      setSelectedAgent(agent.id);
      await loadData();
    } catch (err) {
      alert('Failed to assign ticket');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-24 space-y-3">
          <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-orbitron text-xs text-content-muted">LOADING TICKET WORKSPACE...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout>
        <div className="max-w-xl mx-auto text-center py-20 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-orbitron font-bold text-lg text-content-primary">TICKET NOT FOUND</h2>
          <p className="text-xs text-content-muted font-sans">
            The requested ticket does not exist or has been deleted.
          </p>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center px-4 py-2 bg-brand text-white font-orbitron text-xs font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO TICKETS
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Top Breadcrumb / Nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/tickets"
            className="inline-flex items-center text-xs font-orbitron font-semibold text-brand hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            BACK TO ALL TICKETS
          </Link>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-content-muted">ID: {ticket.id}</span>
          </div>
        </div>

        {/* Header Summary Bar */}
        <div className="bg-white border-2 border-brand-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="font-mono font-bold text-sm text-brand bg-brand-light px-3 py-1 rounded-md border border-brand-border">
                {ticket.ticket_number}
              </span>
              <span className="px-3 py-1 rounded-full font-orbitron text-[10px] font-semibold tracking-wider bg-surface-soft text-content-secondary border border-brand-border">
                {ticket.category.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-orbitron font-extrabold text-content-primary pt-1">
              {ticket.subject}
            </h1>
            <div className="text-xs text-content-muted font-sans flex items-center space-x-4">
              <span>Customer: <strong>{ticket.customer_name}</strong> ({ticket.customer_email})</span>
              <span>•</span>
              <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Status Select */}
            <div>
              <label className="block text-[9px] font-orbitron text-content-muted uppercase mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="px-3 py-1.5 rounded-xl border border-brand-border text-xs font-orbitron font-bold bg-white text-brand focus:outline-none cursor-pointer"
              >
                <option value="open">OPEN</option>
                <option value="in_progress">IN PROGRESS</option>
                <option value="waiting_for_customer">WAITING FOR CUSTOMER</option>
                <option value="resolved">RESOLVED</option>
                <option value="closed">CLOSED</option>
              </select>
            </div>

            {/* Priority Select */}
            <div>
              <label className="block text-[9px] font-orbitron text-content-muted uppercase mb-1">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                className="px-3 py-1.5 rounded-xl border border-brand-border text-xs font-orbitron font-bold bg-white text-content-primary focus:outline-none cursor-pointer"
              >
                <option value="low">LOW</option>
                <option value="normal">NORMAL</option>
                <option value="high">HIGH</option>
                <option value="urgent">URGENT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Conversation Left + Context Sidebar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Conversation Thread & Dual Composer */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Thread Card */}
            <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h2 className="font-orbitron font-bold text-sm text-content-primary flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-brand" />
                  <span>THREAD & AUDIT HISTORY ({messages.length})</span>
                </h2>
                <span className="text-[11px] font-sans text-brand font-medium">
                  Internal notes highlighted in gold
                </span>
              </div>

              <div className="space-y-6">
                {messages.map((msg) => {
                  const isInternal = msg.is_internal_note;
                  const isCustomer = msg.sender_role === 'customer';

                  if (isInternal) {
                    return (
                      <div
                        key={msg.id}
                        className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-2 text-amber-950 shadow-xs"
                      >
                        <div className="flex items-center justify-between text-xs font-sans">
                          <span className="font-orbitron font-bold text-amber-900 flex items-center">
                            <Lock className="w-3.5 h-3.5 mr-1 text-amber-700" />
                            INTERNAL STAFF NOTE — {msg.sender_name}
                          </span>
                          <span className="text-[11px] text-amber-800">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                        <div className="text-[10px] font-orbitron text-amber-700 uppercase pt-1">
                          🔒 Visible only to authorized staff. Hidden from customer portal.
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-1.5 ${
                        isCustomer ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-xs font-sans">
                        <span className="font-orbitron font-bold text-content-primary">
                          {msg.sender_name} ({msg.sender_role.toUpperCase()})
                        </span>
                        <span className="text-content-muted text-[11px]">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div
                        className={`max-w-2xl rounded-2xl p-5 shadow-sm space-y-3 ${
                          isCustomer
                            ? 'bg-[#FAF8FD] border border-brand-border text-content-primary rounded-tl-none'
                            : 'bg-brand text-white rounded-tr-none'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="pt-2 border-t border-white/20 flex flex-wrap gap-2">
                            {msg.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-sans transition-colors ${
                                  isCustomer
                                    ? 'bg-white border border-brand-border text-brand'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                              >
                                {att.type.includes('pdf') ? (
                                  <File className="w-3.5 h-3.5 text-red-500" />
                                ) : (
                                  <ImageIcon className="w-3.5 h-3.5" />
                                )}
                                <span className="font-medium truncate max-w-[160px]">{att.name}</span>
                                <Download className="w-3 h-3 opacity-70" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dual Composer (Public Reply vs Internal Staff Note) */}
            <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              
              {/* Tabs: Public Response vs Internal Note */}
              <div className="flex items-center space-x-2 border-b border-brand-border pb-3">
                <button
                  type="button"
                  onClick={() => setReplyMode('public')}
                  className={`px-4 py-2 rounded-xl font-orbitron text-xs font-bold transition-all ${
                    replyMode === 'public'
                      ? 'bg-brand text-white shadow-purple-sm'
                      : 'bg-surface-soft text-content-secondary hover:text-brand'
                  }`}
                >
                  PUBLIC RESPONSE (TO CUSTOMER)
                </button>
                <button
                  type="button"
                  onClick={() => setReplyMode('internal')}
                  className={`px-4 py-2 rounded-xl font-orbitron text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    replyMode === 'internal'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>INTERNAL STAFF NOTE</span>
                </button>
              </div>

              <form onSubmit={handleSendResponse} className="space-y-4">
                <textarea
                  rows={4}
                  required={attachments.length === 0}
                  placeholder={
                    replyMode === 'internal'
                      ? 'Write a private note for staff audit only (will NOT be sent to customer)...'
                      : 'Write a response to the customer...'
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-sans focus:outline-none leading-relaxed ${
                    replyMode === 'internal'
                      ? 'bg-amber-50/50 border-amber-300 focus:border-amber-500 text-amber-950'
                      : 'bg-surface-soft border-brand-border focus:border-brand'
                  }`}
                />

                {/* Attachments preview */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-brand-light border border-brand-border rounded-xl text-xs font-sans text-brand-dark"
                      >
                        {att.type.includes('pdf') ? (
                          <File className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-brand" />
                        )}
                        <span className="truncate max-w-[160px] font-medium">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="text-content-muted hover:text-accent-danger transition-colors p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Controls */}
                <div className="flex items-center justify-between pt-2">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-full border border-brand-border hover:border-brand bg-surface-soft hover:bg-brand-light text-brand font-orbitron text-xs font-semibold transition-all">
                    <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                    <span>ATTACH FILE</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting || (!replyText.trim() && attachments.length === 0)}
                    className={`px-8 py-3 font-orbitron text-xs font-bold rounded-full shadow-md flex items-center space-x-2 transition-all ${
                      replyMode === 'internal'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-brand hover:bg-brand-dark text-white shadow-purple-glow'
                    } ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {submitting
                        ? 'POSTING...'
                        : replyMode === 'internal'
                        ? 'SAVE INTERNAL NOTE'
                        : 'SEND RESPONSE TO CUSTOMER'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Column: Context Information & Assignment Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Verification Context Card */}
            {ticket.verification_code && (
              <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-brand rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 text-brand">
                  <ShieldCheck className="w-5 h-5 text-brand" />
                  <h3 className="font-orbitron font-extrabold text-xs uppercase tracking-wider">
                    VERIFICATION INVESTIGATION
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-orbitron text-content-muted block">VERIFICATION CODE</span>
                    <strong className="font-mono text-sm text-brand">{ticket.verification_code}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-orbitron text-content-muted block">ASSOCIATED PRODUCT</span>
                    <strong className="text-content-primary">{ticket.product_name || 'Selank (5mg)'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-orbitron text-content-muted block">BATCH AUDIT STATUS</span>
                    <span className="inline-flex items-center text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Active Manufacturing Lot #SLK-2025-04
                    </span>
                  </div>
                </div>

                <Link
                  href="/admin/verification"
                  className="block w-full py-2 px-3 bg-brand text-white font-orbitron text-center text-[10px] font-bold rounded-xl hover:bg-brand-dark transition-colors"
                >
                  OPEN VERIFICATION MANAGER
                </Link>
              </div>
            )}

            {/* Assignment & Management Card */}
            <div className="bg-white border-2 border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-content-primary border-b border-brand-border pb-3">
                <UserCheck className="w-4 h-4 text-brand" />
                <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider">
                  TICKET ASSIGNMENT
                </h3>
              </div>

              <div>
                <label className="block text-[10px] font-orbitron text-content-muted uppercase mb-1">
                  Assigned Support Agent
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand cursor-pointer"
                >
                  <option value="">-- Unassigned --</option>
                  {SUPPORT_AGENTS.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-brand-border space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-content-muted">Category:</span>
                  <span className="font-medium text-content-primary">{ticket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Priority:</span>
                  <span className="font-bold uppercase text-brand">{ticket.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Current Status:</span>
                  <span className="font-bold uppercase text-brand">{ticket.status.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>

            {/* Audit Trail Events Timeline */}
            <div className="bg-white border-2 border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-content-primary border-b border-brand-border pb-3">
                <History className="w-4 h-4 text-brand" />
                <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider">
                  AUDIT TIMELINE ({events.length})
                </h3>
              </div>

              <div className="space-y-3">
                {events.map((evt) => (
                  <div key={evt.id} className="text-xs font-sans border-l-2 border-brand/40 pl-3 py-0.5 space-y-0.5">
                    <div className="font-orbitron font-bold text-[11px] text-content-primary">
                      {evt.event_type}
                    </div>
                    <div className="text-content-secondary text-[11px]">
                      {evt.details}
                    </div>
                    <div className="text-[10px] text-content-muted">
                      {evt.actor_name} • {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
