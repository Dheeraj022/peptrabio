'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Order, OrderStatus } from '@/types';
import { fetchCustomerOrders, fetchCustomerOrdersAsync } from '@/lib/products-store';
import {
  User,
  Mail,
  Phone,
  LogOut,
  LifeBuoy,
  ShoppingBag,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  FileText,
  Clock,
  Truck,
  Package,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getPaymentStatusBadge } from '@/lib/payment-config';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, updateProfile, isLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'tickets'>('overview');
  const [editMode, setEditMode] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const userOrders = await fetchCustomerOrdersAsync(user.email, user.id);
      setOrders(userOrders);
    } catch {
      setOrders(fetchCustomerOrders(user.email, user.id));
    } finally {
      setOrdersLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-orbitron text-xs text-content-secondary animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      phone,
    });
    setEditMode(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const copyOrderNumber = (orderNum: string) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedOrderId(orderNum);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchItem = o.items?.some(i => i.product_name.toLowerCase().includes(q) || (i.product_code && i.product_code.toLowerCase().includes(q)));
      if (!matchNum && !matchItem) return false;
    }
    return true;
  });

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Payment Pending',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'paid':
        return {
          label: 'Order Confirmed',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'processing':
        return {
          label: 'Processing & QC',
          bg: 'bg-purple-50 text-brand border-brand-border',
          dot: 'bg-brand animate-pulse',
        };
      case 'shipped':
        return {
          label: 'Shipped (Cold Chain)',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500 animate-pulse',
        };
      case 'delivered':
        return {
          label: 'Delivered & Verified',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
        };
      case 'refunded':
        return {
          label: 'Refunded',
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          dot: 'bg-gray-400',
        };
      default:
        return {
          label: status,
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          dot: 'bg-gray-400',
        };
    }
  };

  const getOrderTimelineSteps = (status: OrderStatus) => {
    const steps = [
      { id: 'placed', label: 'Order Placed', desc: 'Payment verified & order queued' },
      { id: 'qc', label: 'QC & Cold Packing', desc: 'Lyophilized vials boxed with cold monitoring' },
      { id: 'shipped', label: 'Cold-Chain Dispatch', desc: 'In-transit with temperature tags' },
      { id: 'delivered', label: 'Delivered', desc: 'Package signed & received' },
    ];

    let currentStepIndex = 1;
    if (status === 'pending') currentStepIndex = 0;
    else if (status === 'paid') currentStepIndex = 1;
    else if (status === 'processing') currentStepIndex = 2;
    else if (status === 'shipped') currentStepIndex = 3;
    else if (status === 'delivered') currentStepIndex = 4;
    else if (status === 'cancelled' || status === 'refunded') currentStepIndex = -1;

    return { steps, currentStepIndex };
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center text-white text-xl font-orbitron font-bold shadow-purple-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-orbitron font-bold text-xl sm:text-2xl text-content-primary">
                {user.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-light text-brand text-[10px] font-orbitron font-bold uppercase tracking-wider border border-brand/20">
                Verified Account
              </span>
            </div>
            <p className="text-xs text-content-secondary font-sans mt-0.5">
              {user.phone ? `${user.phone} • ` : ''}{user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/shop"
            className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-colors shadow-purple-sm flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>NEW ORDER</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-brand-border bg-surface-soft hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-content-secondary rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-colors flex items-center space-x-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>LOG OUT</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-brand-border mb-8 overflow-x-auto space-x-2 sm:space-x-4">
        {[
          { id: 'overview', label: 'Overview & Profile', icon: User },
          { id: 'orders', label: 'My Orders', icon: ShoppingBag, count: orders.length },
          { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-orbitron text-xs font-semibold tracking-wider transition-all whitespace-nowrap ${active
                ? 'border-brand text-brand bg-brand-light/30'
                : 'border-transparent text-content-muted hover:text-content-primary hover:border-brand-border'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${active ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h2 className="font-orbitron font-bold text-base text-content-primary">
                Profile Details
              </h2>
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className="text-xs font-orbitron font-bold text-brand hover:underline"
              >
                {editMode ? 'Cancel Edit' : 'Edit Details'}
              </button>
            </div>

            {savedMsg && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-orbitron text-[10px] font-bold text-content-muted uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-orbitron text-[10px] font-bold text-content-muted uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-bold transition-colors shadow-sm"
                >
                  SAVE CHANGES
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">Full Name</span>
                  <div className="font-semibold text-content-primary flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-brand" />
                    <span>{user.name}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">Email Address</span>
                  <div className="font-semibold text-content-primary flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-brand" />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">Phone Contact</span>
                  <div className="font-semibold text-content-primary flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-brand" />
                    <span>{user.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Orders Overview Section */}
            <div className="pt-6 border-t border-brand-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-brand" />
                  <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-content-primary">
                    Recent Orders & Shipments
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-orbitron font-bold text-brand hover:underline flex items-center space-x-1"
                >
                  <span>View All ({orders.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="p-4 rounded-2xl bg-surface-soft border border-brand-border text-center py-6">
                  <p className="text-xs text-content-secondary font-sans mb-2">No orders placed yet.</p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center text-xs font-orbitron font-bold text-brand hover:underline"
                  >
                    Browse Peptide Catalog →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {orders.slice(0, 2).map((order) => {
                    const statusBadge = getOrderStatusBadge(order.status);
                    return (
                      <div
                        key={order.id}
                        onClick={() => {
                          setActiveTab('orders');
                          setExpandedOrderId(order.id);
                        }}
                        className="p-3.5 rounded-2xl bg-surface-soft border border-brand-border hover:border-brand transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-brand group-hover:underline">
                              {order.order_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-orbitron font-bold uppercase border ${statusBadge.bg}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                          <p className="text-xs text-content-secondary line-clamp-1 font-sans">
                            {order.items?.map(i => `${i.product_name} (×${i.quantity})`).join(', ') || 'Peptide materials'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs">
                          <span className="font-mono font-bold text-content-primary">
                            {formatPrice(order.total)}
                          </span>
                          <span className="text-brand font-orbitron text-[10px] font-bold group-hover:translate-x-0.5 transition-transform">
                            Details →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1A102A] to-[#120B1D] text-white rounded-3xl p-6 border border-purple-900/60 shadow-lg space-y-4">
              <div className="flex items-center space-x-2 text-purple-400">
                <LifeBuoy className="w-5 h-5" />
                <h3 className="font-orbitron font-bold text-sm text-white">Need Support?</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Track your open support inquiries or submit a new inquiry regarding batch verification, order status, or cold chain logistics.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/support"
                  className="w-full text-center px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-bold transition-all shadow-purple-sm"
                >
                  VIEW MY TICKETS →
                </Link>
                <Link
                  href="/support/new"
                  className="w-full text-center px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-orbitron text-xs font-semibold transition-all"
                >
                  SUBMIT NEW TICKET
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-brand">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-orbitron font-bold text-xs text-content-primary">
                  Product Authenticity Check
                </h3>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed font-sans">
                Scan or enter the verification code on your physical product packaging to verify batch authenticity.
              </p>
              <Link
                href="/verify"
                className="inline-flex items-center text-xs font-orbitron font-bold text-brand hover:underline"
              >
                Go to Public Verification <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>

        </div>
      )}

      {/* Tab: My Orders (Order tracking, history & live updates) */}
      {activeTab === 'orders' && (
        <div className="space-y-6">

          {/* Orders Header & Search */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
              <div>
                <h2 className="font-orbitron font-bold text-lg text-content-primary">
                  My Orders & Requisition History
                </h2>
                <p className="text-xs text-content-muted font-sans mt-0.5">
                  Track batch fulfillments, cold-chain logistics, and live delivery milestones.
                </p>
              </div>
              <Link
                href="/shop"
                className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-colors shadow-purple-sm flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ NEW REQUISITION</span>
              </Link>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Status Filters */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'processing', label: 'Processing' },
                  { id: 'shipped', label: 'Shipped (Cold Chain)' },
                  { id: 'delivered', label: 'Delivered' },
                  { id: 'paid', label: 'Confirmed' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full font-orbitron text-xs font-semibold whitespace-nowrap transition-all ${orderStatusFilter === tab.id
                      ? 'bg-brand text-white shadow-purple-sm'
                      : 'bg-surface-soft text-content-secondary hover:text-brand hover:bg-brand-light'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order # or product..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs font-sans focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Orders List */}
          {ordersLoading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-orbitron text-xs text-content-muted">LOADING YOUR ORDERS...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white border border-brand-border rounded-3xl p-8 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-orbitron font-bold text-lg text-content-primary">
                NO ORDERS FOUND
              </h3>
              <p className="text-xs text-content-secondary max-w-md mx-auto font-sans">
                {orderSearch || orderStatusFilter !== 'all'
                  ? 'No orders match your filter criteria. Try searching with another keyword or resetting filters.'
                  : "You haven't placed any research peptide orders yet. Explore our verified analytical catalog to submit your first requisition."}
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center px-6 py-3 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  BROWSE RESEARCH PEPTIDES
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusBadge = getOrderStatusBadge(order.status);
                const isExpanded = expandedOrderId === order.id;
                const { steps, currentStepIndex } = getOrderTimelineSteps(order.status);
                const trackingNumber = `FEDEX-COLD-${order.order_number.replace(/\D/g, '') || '8829104'}`;

                return (
                  <div
                    key={order.id}
                    className="bg-white border-2 border-brand-border rounded-3xl overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-200"
                  >
                    {/* Main Order Card Row */}
                    <div className="p-6 sm:p-7 space-y-5">

                      {/* Top Meta Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-4">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-sm font-bold text-brand">
                              {order.order_number}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyOrderNumber(order.order_number)}
                              className="p-1 text-content-muted hover:text-brand transition-colors"
                              title="Copy Order Number"
                            >
                              {copiedOrderId === order.order_number ? (
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-orbitron font-bold uppercase tracking-wider border ${statusBadge.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                            <span>{statusBadge.label}</span>
                          </span>

                          {order.payment_status && (() => {
                            const pBadge = getPaymentStatusBadge(order.payment_status);
                            return (
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-orbitron font-bold uppercase tracking-wider border ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span>Payment: {pBadge.label}</span>
                              </span>
                            );
                          })()}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-4 text-xs">
                          <span className="text-content-muted font-sans">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="font-mono font-bold text-base text-content-primary">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Live Multi-step Progress Tracker */}
                      {currentStepIndex >= 0 && (
                        <div className="py-2">
                          <div className="hidden md:grid grid-cols-4 gap-2 relative">
                            {/* Connecting Line */}
                            <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0" />
                            <div
                              className="absolute top-4 left-6 h-0.5 bg-brand transition-all duration-500 -z-0"
                              style={{ width: `${Math.max(0, (Math.min(currentStepIndex, 3) / 3) * 100)}%` }}
                            />

                            {steps.map((step, idx) => {
                              const isCompleted = idx < currentStepIndex;
                              const isCurrent = idx === currentStepIndex;
                              return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center text-center px-1">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-bold transition-all ${isCompleted
                                      ? 'bg-brand text-white shadow-purple-sm'
                                      : isCurrent
                                        ? 'bg-white border-2 border-brand text-brand ring-4 ring-purple-100'
                                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                                      }`}
                                  >
                                    {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                                  </div>
                                  <span className={`font-orbitron text-[11px] font-bold mt-2 ${isCurrent ? 'text-brand' : isCompleted ? 'text-content-primary' : 'text-gray-400'}`}>
                                    {step.label}
                                  </span>
                                  <span className="text-[10px] text-content-muted font-sans leading-tight mt-0.5">
                                    {step.desc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Mobile compact tracker */}
                          <div className="md:hidden flex items-center justify-between p-3 rounded-2xl bg-surface-soft border border-brand-border text-xs">
                            <div className="flex items-center space-x-2">
                              <Truck className="w-4 h-4 text-brand animate-pulse" />
                              <span className="font-orbitron font-semibold text-content-primary">
                                Current Status: <span className="text-brand">{statusBadge.label}</span>
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-content-muted">
                              Step {Math.min(currentStepIndex + 1, 4)} of 4
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Items Summary Preview */}
                      <div className="space-y-2">
                        <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase tracking-wider block">
                          Ordered Peptide Items ({order.items?.reduce((acc, i) => acc + i.quantity, 0) || 1} units)
                        </span>

                        <div className="divide-y divide-brand-border/40 border border-brand-border rounded-2xl overflow-hidden bg-surface-soft">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item) => (
                              <div key={item.id} className="p-3.5 flex items-center justify-between text-xs gap-4">
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="font-bold text-content-primary truncate font-orbitron">
                                    {item.product_name}
                                  </div>
                                  {item.product_code && (
                                    <div className="font-mono text-[10px] text-content-muted">
                                      SKU: {item.product_code}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="font-mono font-bold text-content-primary">
                                    {formatPrice(item.total_price)}
                                  </div>
                                  <div className="text-[10px] text-content-muted font-sans">
                                    Qty: {item.quantity} × {formatPrice(item.unit_price)}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3.5 text-xs text-content-secondary">
                              Analytical Research Grade Peptide Materials (Lyophilized)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Controls */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-surface-soft hover:bg-brand-light text-brand font-orbitron text-xs font-semibold border border-brand-border transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Logistics & Details' : 'View Full Logistics & Details'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/support/new?category=Order%20Status&order=${encodeURIComponent(order.order_number)}`}
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark font-orbitron text-xs font-semibold shadow-purple-sm transition-colors"
                          >
                            <LifeBuoy className="w-3.5 h-3.5 mr-1.5" />
                            <span>Inquire on Order</span>
                          </Link>
                        </div>
                      </div>

                    </div>

                    {/* Expandable Full Logistics & In-Depth Details */}
                    {isExpanded && (
                      <div className="p-6 bg-surface-soft border-t-2 border-brand-border space-y-6 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">

                          {/* Cold-Chain Shipping Logistics */}
                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border space-y-3">
                            <div className="flex items-center space-x-2 text-brand font-orbitron font-bold">
                              <Truck className="w-4 h-4" />
                              <span>Cold-Chain Fulfillment Logistics</span>
                            </div>

                            <div className="space-y-2 font-sans text-content-secondary">
                              <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-content-muted">Shipping Method:</span>
                                <span className="font-medium text-content-primary">FedEx Priority Cold-Chain (Dry Ice)</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-content-muted">Tracking Reference:</span>
                                <span className="font-mono font-bold text-brand">{trackingNumber}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-content-muted">Temperature Monitored:</span>
                                <span className="font-medium text-emerald-700">Certified (-20°C Thermal Tag)</span>
                              </div>
                              <div className="flex justify-between py-1">
                                <span className="text-content-muted">Laboratory Attestation:</span>
                                <span className="font-medium text-content-primary">In-Vitro Analytical Use Only</span>
                              </div>
                            </div>
                          </div>

                          {/* Destination & Order Financials */}
                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-border space-y-3">
                            <div className="flex items-center space-x-2 text-brand font-orbitron font-bold">
                              <FileText className="w-4 h-4" />
                              <span>Destination & Payment Breakdown</span>
                            </div>

                            <div className="space-y-2 font-sans text-content-secondary">
                              <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-content-muted">Subtotal:</span>
                                <span className="font-mono font-medium text-content-primary">{formatPrice(order.subtotal)}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-content-muted">Insulated Cold-Chain Freight:</span>
                                <span className="font-mono font-medium text-content-primary">{formatPrice(order.shipping)}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-content-muted">Total Order Amount:</span>
                                <span className="font-mono font-bold text-content-primary">{formatPrice(order.total)}</span>
                              </div>
                              {order.payment_type === 'partial' && order.advance_amount !== undefined ? (
                                <>
                                  <div className="flex justify-between py-1 border-b border-gray-100 text-emerald-700">
                                    <span className="font-medium">10% Advance Paid:</span>
                                    <span className="font-mono font-bold">₹{order.advance_amount.toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="flex justify-between py-1 border-b border-gray-100 text-amber-700">
                                    <span className="font-medium">Remaining COD Balance:</span>
                                    <span className="font-mono font-bold">₹{order.remaining_cod_amount?.toLocaleString('en-IN')}</span>
                                  </div>
                                </>
                              ) : null}
                              {order.utr_number && (
                                <div className="flex justify-between py-1 border-b border-gray-100">
                                  <span className="text-content-muted">UPI UTR Ref:</span>
                                  <span className="font-mono text-content-primary font-bold">{order.utr_number}</span>
                                </div>
                              )}
                              {order.shipping_address && (
                                <div className="pt-1">
                                  <span className="text-content-muted block text-[11px] mb-0.5">Shipping Destination:</span>
                                  <p className="font-medium text-content-primary leading-tight text-[11px]">
                                    {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}, {order.shipping_address.country}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Tab: Tickets */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
            <div>
              <h2 className="font-orbitron font-bold text-base text-content-primary">
                My Support Inquiries
              </h2>
              <p className="text-xs text-content-muted font-sans">
                Real-time updates and direct messaging with Peptra Bio technical specialists.
              </p>
            </div>
            <Link
              href="/support/new"
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-colors shadow-purple-sm self-start sm:self-auto"
            >
              + SUBMIT NEW TICKET
            </Link>
          </div>

          <div className="text-center py-8">
            <p className="text-xs text-content-secondary mb-4">
              To view all your tickets with filters and live thread responses:
            </p>
            <Link
              href="/support"
              className="inline-block px-6 py-3 bg-brand-light text-brand border border-brand/30 rounded-2xl font-orbitron text-xs font-bold tracking-wider hover:bg-brand hover:text-white transition-colors"
            >
              OPEN SUPPORT PORTAL →
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
