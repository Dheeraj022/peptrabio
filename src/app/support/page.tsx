'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SupportTicket, TicketStatus } from '@/types/support';
import { fetchCustomerTickets } from '@/lib/support-store';
import { useAuth } from '@/context/AuthContext';
import {
  LifeBuoy,
  Plus,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Inbox,
  User
} from 'lucide-react';

export default function CustomerSupportPage() {
  const { user, isLoading, login } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await fetchCustomerTickets();
      setTickets(data);
      setLoading(false);
    }
    load();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-orbitron text-xs text-content-muted animate-pulse">
          VERIFYING CREDENTIALS...
        </div>
      </div>
    );
  }

  // If user is not logged in, show authentication barrier
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-brand-border shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="w-16 h-16 rounded-2xl bg-brand-light text-brand flex items-center justify-center mx-auto shadow-purple-sm">
            <LifeBuoy className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-light text-brand text-[10px] font-orbitron font-bold uppercase tracking-wider">
              <span>RESEARCHER ACCESS ONLY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
              SUPPORT TICKETS ACCESS
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
              To track your laboratory inquiries, request verification investigations, or contact support specialists, please sign in with your verified researcher account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login?redirect=/support"
              className="w-full sm:w-auto px-8 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-bold tracking-wider shadow-purple-sm transition-all"
            >
              SIGN IN TO ACCOUNT
            </Link>
            <Link
              href="/register?redirect=/support"
              className="w-full sm:w-auto px-8 py-3.5 border border-brand-border bg-surface-soft hover:bg-brand-light text-content-primary hover:text-brand rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-all"
            >
              CREATE RESEARCHER ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.ticket_number.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.verification_code && t.verification_code.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: TicketStatus) => {
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300 font-bold';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'normal':
        return 'bg-purple-50 text-brand-dark border-brand-border';
      case 'low':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatStatusText = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#24123A] to-[#3B1B5E] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-purple opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-orbitron font-semibold text-purple-200">
              <LifeBuoy className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>PEPTRA BIO HELP & SUPPORT CENTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-orbitron font-extrabold text-white tracking-tight">
              {user ? `SUPPORT TICKETS • ${user.name.toUpperCase()}` : 'MY SUPPORT TICKETS'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 font-sans leading-relaxed">
              Track inquiries, request batch authenticity verification investigations, report order issues, or connect with our analytical chemistry support staff.
            </p>
          </div>

          <Link
            href="/support/new"
            className="inline-flex items-center justify-center px-6 py-4 bg-white text-brand hover:bg-purple-50 font-orbitron text-xs font-bold rounded-full shadow-lg transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>CREATE NEW TICKET</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        
        {/* Status Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Tickets' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'waiting_for_customer', label: 'Waiting for You' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'closed', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-orbitron text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-brand text-white shadow-purple-sm'
                  : 'bg-surface-soft text-content-secondary hover:text-brand hover:bg-brand-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand"
          />
        </div>

      </div>

      {/* Ticket List View */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-orbitron text-xs text-content-muted">LOADING SUPPORT TICKETS...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-white border border-brand-border rounded-3xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="font-orbitron font-bold text-lg text-content-primary">
            NO SUPPORT TICKETS FOUND
          </h3>
          <p className="text-xs text-content-secondary max-w-sm mx-auto font-sans">
            {searchQuery || statusFilter !== 'all'
              ? 'No tickets matched your search or status filter. Try clearing the filters.'
              : "You haven't created any support tickets yet. Need help with a batch or order?"}
          </p>
          <div className="pt-2">
            <Link
              href="/support/new"
              className="inline-flex items-center px-6 py-3 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              CREATE SUPPORT TICKET
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((t) => (
            <Link
              key={t.id}
              href={`/support/ticket/${t.ticket_number}`}
              className="block bg-white border border-brand-border hover:border-brand rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Left Side: Ticket Number, Subject, Category, Metadata */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <span className="font-mono text-xs font-bold text-brand bg-brand-light px-2.5 py-0.5 rounded-md border border-brand-border">
                      {t.ticket_number}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-orbitron text-[10px] font-semibold tracking-wider bg-surface-soft text-content-secondary border border-brand-border/60">
                      {t.category.toUpperCase()}
                    </span>
                    {t.verification_code && (
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-purple-50 text-brand border border-brand-border">
                        CODE: {t.verification_code}
                      </span>
                    )}
                    {t.order_number && (
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {t.order_number}
                      </span>
                    )}
                  </div>

                  <h3 className="font-orbitron font-bold text-base sm:text-lg text-content-primary group-hover:text-brand transition-colors leading-snug">
                    {t.subject}
                  </h3>

                  {t.last_message && (
                    <p className="text-xs text-content-secondary line-clamp-1 font-sans">
                      {t.last_message}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-[11px] text-content-muted font-sans pt-1">
                    <span>Created: {new Date(t.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Updated: {new Date(t.updated_at).toLocaleDateString()}</span>
                    {t.message_count && (
                      <>
                        <span>•</span>
                        <span className="flex items-center text-brand font-medium">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {t.message_count} {t.message_count === 1 ? 'message' : 'messages'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Side: Status Badge, Priority, Arrow */}
                <div className="flex items-center justify-between sm:justify-end space-x-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
                  <div className="flex flex-col sm:items-end gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full font-orbitron text-[10px] uppercase border tracking-wider ${getStatusBadge(
                        t.status
                      )}`}
                    >
                      {formatStatusText(t.status)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded font-orbitron text-[9px] uppercase border tracking-wider ${getPriorityBadge(
                        t.priority
                      )}`}
                    >
                      PRIORITY: {t.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-surface-soft group-hover:bg-brand group-hover:text-white text-content-muted flex items-center justify-center transition-all shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
