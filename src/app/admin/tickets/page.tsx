'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  fetchAllTickets,
  updateTicketStatus,
  updateTicketPriority,
  computeTicketStats
} from '@/lib/support-store';
import {
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketStats
} from '@/types/support';
import {
  LifeBuoy,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Flame,
  UserCheck,
  ArrowUpDown,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    in_progress: 0,
    waiting_for_customer: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated_desc' | 'created_desc' | 'priority_desc'>('updated_desc');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllTickets();
    setTickets(data);
    setStats(computeTicketStats(data));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusQuickChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus, 'Admin', 'admin');
      await loadData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Filter & Sort
  const filteredTickets = tickets
    .filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.ticket_number.toLowerCase().includes(q) ||
          t.customer_name.toLowerCase().includes(q) ||
          t.customer_email.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.verification_code && t.verification_code.toLowerCase().includes(q)) ||
          (t.order_number && t.order_number.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority_desc') {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (sortBy === 'created_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-brand border-brand-border font-bold';
      case 'waiting_for_customer':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white font-extrabold animate-pulse';
      case 'high':
        return 'bg-amber-500 text-white font-bold';
      case 'normal':
        return 'bg-purple-50 text-brand-dark border border-brand-border';
      case 'low':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-orbitron font-extrabold text-2xl text-content-primary">
              CUSTOMER SUPPORT TICKETS
            </h1>
            <p className="text-xs text-content-muted font-sans pt-1">
              Helpdesk management, product authenticity verification inquiries, and customer communication triage.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-brand-border bg-white hover:bg-brand-light text-brand transition-colors shadow-sm"
              title="Refresh Tickets"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/support/new"
              target="_blank"
              className="px-4 py-2.5 bg-brand text-white font-orbitron text-xs font-semibold rounded-xl shadow-purple-sm hover:bg-brand-dark transition-all flex items-center space-x-1.5"
            >
              <span>+ NEW TICKET</span>
            </Link>
          </div>
        </div>

        {/* 6 KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <div className="text-[10px] font-orbitron text-content-muted uppercase">Total Tickets</div>
            <div className="font-orbitron font-extrabold text-2xl text-content-primary mt-1">
              {stats.total}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs">
            <div className="text-[10px] font-orbitron text-blue-700 uppercase">Open</div>
            <div className="font-orbitron font-extrabold text-2xl text-blue-600 mt-1">
              {stats.open}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs">
            <div className="text-[10px] font-orbitron text-brand uppercase">In Progress</div>
            <div className="font-orbitron font-extrabold text-2xl text-brand mt-1">
              {stats.in_progress}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
            <div className="text-[10px] font-orbitron text-amber-700 uppercase">Waiting on User</div>
            <div className="font-orbitron font-extrabold text-2xl text-amber-600 mt-1">
              {stats.waiting_for_customer}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
            <div className="text-[10px] font-orbitron text-emerald-700 uppercase">Resolved</div>
            <div className="font-orbitron font-extrabold text-2xl text-emerald-600 mt-1">
              {stats.resolved}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 shadow-xs">
            <div className="text-[10px] font-orbitron text-red-700 uppercase flex items-center">
              <Flame className="w-3 h-3 mr-1 text-red-500" />
              Urgent
            </div>
            <div className="font-orbitron font-extrabold text-2xl text-red-600 mt-1">
              {stats.urgent}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket #, customer, code, order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_for_customer">Waiting for Customer</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="updated_desc">Recently Updated</option>
                <option value="created_desc">Newest First</option>
                <option value="priority_desc">Highest Priority</option>
              </select>
            </div>

          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-orbitron text-xs text-content-muted">LOADING TICKETS...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-orbitron font-bold text-base text-content-primary">NO TICKETS FOUND</h3>
              <p className="text-xs text-content-muted font-sans">
                Try adjusting your search criteria or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-surface-soft border-b border-brand-border font-orbitron text-[10px] text-content-muted uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Subject & Context</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-brand-subtle/50 transition-colors">
                      
                      {/* Ticket Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-brand whitespace-nowrap">
                        <Link href={`/admin/tickets/${t.id}`} className="hover:underline">
                          {t.ticket_number}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-content-primary">{t.customer_name}</div>
                        <div className="text-[11px] text-content-muted font-mono">{t.customer_email}</div>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          href={`/admin/tickets/${t.id}`}
                          className="font-orbitron font-semibold text-content-primary hover:text-brand transition-colors block truncate"
                        >
                          {t.subject}
                        </Link>
                        <div className="flex items-center space-x-2 pt-0.5">
                          {t.verification_code && (
                            <span className="font-mono text-[10px] text-brand bg-purple-50 px-1.5 py-0.2 rounded border border-brand-border">
                              PV: {t.verification_code}
                            </span>
                          )}
                          {t.order_number && (
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              {t.order_number}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-orbitron text-[10px] text-content-secondary uppercase">
                          {t.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded font-orbitron text-[9px] uppercase tracking-wider ${getPriorityBadge(
                            t.priority
                          )}`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full font-orbitron text-[10px] uppercase border tracking-wider ${getStatusBadge(
                            t.status
                          )}`}
                        >
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Assigned */}
                      <td className="py-3.5 px-4 text-[11px] text-content-secondary whitespace-nowrap">
                        {t.assigned_name || (
                          <span className="text-content-muted italic">Unassigned</span>
                        )}
                      </td>

                      {/* Updated */}
                      <td className="py-3.5 px-4 text-[11px] text-content-muted whitespace-nowrap">
                        {new Date(t.updated_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/tickets/${t.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-light text-brand font-orbitron text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>VIEW</span>
                        </Link>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
