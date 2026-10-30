'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  fetchTicketById,
  fetchTicketMessages,
  sendTicketReply
} from '@/lib/support-store';
import { SupportTicket, TicketMessage, TicketAttachment } from '@/types/support';
import { useAuth } from '@/context/AuthContext';
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
  Plus,
  Download,
  Lock,
  User,
  Headphones
} from 'lucide-react';

export default function CustomerTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading, login } = useAuth();
  const rawId = (params?.id as string) || '';
  const idOrNumber = decodeURIComponent(rawId);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    if (!idOrNumber || !user) return;
    const t = await fetchTicketById(idOrNumber);
    if (t) {
      const isOwner =
        (user.email && t.customer_email && t.customer_email.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
        (user.id && t.customer_id && t.customer_id === user.id);

      if (isOwner) {
        setTicket(t);
        // Pass isStaff = false to strictly filter out internal notes!
        const msgs = await fetchTicketMessages(t.id, false);
        setMessages(msgs);
      }
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

    // Periodic sync every 4 seconds to pull fresh admin messages from server
    const interval = setInterval(loadData, 4000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('peptrabio_tickets_updated', handleCustom);
      clearInterval(interval);
    };
  }, [idOrNumber, user]);

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

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

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} is not supported. Use JPG, PNG, or PDF.`);
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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && attachments.length === 0) return;
    if (!ticket) return;

    setSending(true);
    try {
      await sendTicketReply({
        ticketId: ticket.id,
        senderName: ticket.customer_name || 'Customer',
        senderRole: 'customer',
        message: replyText.trim() || '(Attachment attached)',
        isInternalNote: false,
        attachments,
      });

      setReplyText('');
      setAttachments([]);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-orbitron text-xs text-content-muted">VERIFYING CREDENTIALS...</p>
      </div>
    );
  }

  if (!user) {
    const returnUrl = `/support/ticket/${idOrNumber}`;
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-brand-border shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-brand-light text-brand flex items-center justify-center mx-auto shadow-purple-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-light text-brand text-[10px] font-orbitron font-bold uppercase tracking-wider">
              <span>SIGN IN REQUIRED</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
              RESTRICTED TICKET THREAD
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
              Ticket conversations contain sensitive batch information and laboratory support notes. Please sign in to view this thread.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(returnUrl)}`}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-bold tracking-wider shadow-purple-sm transition-all"
            >
              SIGN IN TO VIEW THREAD
            </Link>
            <Link
              href={`/register?redirect=${encodeURIComponent(returnUrl)}`}
              className="w-full sm:w-auto px-8 py-3.5 border border-brand-border bg-surface-soft hover:bg-brand-light text-content-primary hover:text-brand rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-all"
            >
              CREATE ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-orbitron text-xs text-content-muted">LOADING TICKET CONVERSATION...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="font-orbitron font-bold text-2xl text-content-primary">
          SUPPORT TICKET NOT FOUND
        </h1>
        <p className="text-xs text-content-secondary font-sans max-w-sm mx-auto">
          The requested support ticket does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/support"
          className="inline-flex items-center px-6 py-3 bg-brand text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm hover:bg-brand-dark transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          RETURN TO SUPPORT PORTAL
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-purple-50 text-brand border-brand-border font-bold';
      case 'waiting_for_customer':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'closed':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/support"
          className="inline-flex items-center text-xs font-orbitron font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          BACK TO ALL TICKETS
        </Link>

        <Link
          href="/support/new"
          className="inline-flex items-center px-4 py-2 bg-brand-light text-brand hover:bg-brand hover:text-white border border-brand-border font-orbitron text-xs font-semibold rounded-full transition-all"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          NEW TICKET
        </Link>
      </div>

      {/* Ticket Header Card */}
      <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="font-mono text-xs font-bold text-brand bg-brand-light px-3 py-1 rounded-md border border-brand-border">
                {ticket.ticket_number}
              </span>
              <span className="px-3 py-1 rounded-full font-orbitron text-[10px] font-semibold tracking-wider bg-surface-soft text-content-secondary border border-brand-border/60">
                {ticket.category.toUpperCase()}
              </span>
              <span
                className={`px-3 py-1 rounded-full font-orbitron text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                  ticket.status
                )}`}
              >
                {ticket.status.replace(/_/g, ' ')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-orbitron font-extrabold text-content-primary pt-1">
              {ticket.subject}
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs font-sans text-content-muted space-y-1">
            <div>Created: <span className="text-content-primary font-medium">{new Date(ticket.created_at).toLocaleString()}</span></div>
            <div>Last Activity: <span className="text-content-primary font-medium">{new Date(ticket.updated_at).toLocaleString()}</span></div>
          </div>
        </div>

        {/* Attached Context Information (Verification Code / Order / Product) */}
        {(ticket.verification_code || ticket.order_number || ticket.product_name) && (
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-sans">
            {ticket.verification_code && (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-brand-border text-brand-dark">
                <ShieldCheck className="w-4 h-4 text-brand" />
                <span>Verification Code:</span>
                <strong className="font-mono">{ticket.verification_code}</strong>
              </div>
            )}
            {ticket.order_number && (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
                <span>Order Reference:</span>
                <strong className="font-mono">{ticket.order_number}</strong>
              </div>
            )}
            {ticket.product_name && (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-surface-soft border border-brand-border text-content-primary">
                <span>Product:</span>
                <strong>{ticket.product_name}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="bg-[#FAF8FD] border-2 border-brand-border rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h2 className="font-orbitron font-bold text-sm text-content-primary tracking-wider flex items-center space-x-2">
            <LifeBuoy className="w-4 h-4 text-brand" />
            <span>CONVERSATION THREAD ({messages.length})</span>
          </h2>
          <span className="text-[11px] font-sans text-content-muted">
            Directly connected with Peptra Bio Support
          </span>
        </div>

        <div className="space-y-6">
          {messages.map((msg) => {
            const isCustomer = msg.sender_role === 'customer';

            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-2 ${isCustomer ? 'items-end' : 'items-start'
                  }`}
              >
                {/* Sender Title Bar */}
                <div className="flex items-center space-x-2 text-xs font-sans">
                  {isCustomer ? (
                    <>
                      <span className="text-content-muted text-[11px]">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                      <span className="font-orbitron font-bold text-content-primary flex items-center">
                        {msg.sender_name} <User className="w-3.5 h-3.5 ml-1 text-content-muted" />
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold">
                        PB
                      </div>
                      <span className="font-orbitron font-bold text-brand flex items-center">
                        {msg.sender_name} <Headphones className="w-3.5 h-3.5 ml-1 text-brand" />
                      </span>
                      <span className="text-content-muted text-[11px]">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                {/* Message Box */}
                <div
                  className={`max-w-2xl rounded-2xl p-5 shadow-sm space-y-3 ${isCustomer
                      ? 'bg-white border-2 border-brand/40 text-content-primary rounded-tr-none'
                      : 'bg-white border-2 border-brand text-content-primary rounded-tl-none ring-4 ring-brand-light/60'
                    }`}
                >
                  <p className="text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="pt-2 border-t border-brand-border/60 flex flex-wrap gap-2">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-surface-soft hover:bg-brand-light border border-brand-border text-xs font-sans text-brand transition-colors"
                        >
                          {att.type.includes('pdf') ? (
                            <File className="w-4 h-4 text-red-500" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-brand" />
                          )}
                          <span className="font-medium truncate max-w-[160px]">{att.name}</span>
                          <Download className="w-3 h-3 text-content-muted" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply Box / Closed State */}
      {ticket.status === 'closed' ? (
        <div className="bg-white border-2 border-gray-300 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-orbitron font-bold text-base text-content-primary">
              THIS SUPPORT TICKET IS CLOSED
            </h3>
            <p className="text-xs text-content-secondary font-sans max-w-md mx-auto">
              This ticket has been marked as closed and cannot receive additional replies. If you require further assistance with your research batch or order, please create a new support ticket.
            </p>
          </div>
          <Link
            href="/support/new"
            className="inline-flex items-center px-6 py-3 bg-brand text-white font-orbitron text-xs font-bold rounded-full shadow-purple-sm hover:bg-brand-dark transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            CREATE NEW TICKET
          </Link>
        </div>
      ) : (
        <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron font-bold text-sm text-content-primary">
              REPLY TO TICKET
            </h3>
            {ticket.status === 'resolved' && (
              <span className="text-[11px] font-sans text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                Note: Sending a reply will automatically reopen this ticket.
              </span>
            )}
          </div>

          <form onSubmit={handleSendReply} className="space-y-4">
            <textarea
              rows={4}
              required={attachments.length === 0}
              placeholder="Type your reply or provide additional details..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-brand-border bg-surface-soft text-xs sm:text-sm font-sans focus:outline-none focus:border-brand leading-relaxed"
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

            {/* Actions Bar */}
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
                disabled={sending || (!replyText.trim() && attachments.length === 0)}
                className={`px-8 py-3 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-bold rounded-full shadow-purple-glow flex items-center space-x-2 transition-all ${sending ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                  }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'SENDING...' : 'SEND REPLY'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
