'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DiscountCode, DiscountPaymentApplicability, DiscountType } from '@/types';
import {
  getStoredDiscounts,
  fetchDiscounts,
  createDiscountCode,
  deleteDiscountCode,
  toggleDiscountActive,
  saveStoredDiscounts
} from '@/lib/discounts-store';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Calendar,
  Percent,
  CreditCard,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  X,
  Layers,
  ArrowUpRight,
  Database,
  Cloud,
  CloudOff,
  Code2,
  RefreshCw
} from 'lucide-react';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<'all' | DiscountPaymentApplicability>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New Code Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as DiscountType,
    discount_value: 10,
    applicable_payment: 'both' as DiscountPaymentApplicability,
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    expires_at: '',
    is_active: true,
  });

  const loadData = async () => {
    // 1. Immediately render local cached discounts
    setDiscounts(getStoredDiscounts());
    setIsSyncing(true);

    // 2. Fetch fresh discounts from Supabase cloud database
    try {
      const syncRes = await fetchDiscounts(true);
      setDiscounts(syncRes.discounts);
      setIsCloudSynced(syncRes.isCloudSynced);
    } catch (err) {
      console.warn('Sync discounts note:', err);
      setIsCloudSynced(false);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    showToast(`Code "${code}" copied to clipboard!`);
  };

  const handleToggle = (id: string) => {
    const newStatus = toggleDiscountActive(id);
    loadData();
    showToast(`Discount code ${newStatus ? 'activated' : 'deactivated'}.`);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete discount code "${code}"?`)) {
      deleteDiscountCode(id);
      loadData();
      showToast(`Discount code "${code}" removed.`);
    }
  };

  const handleGenerateRandomCode = () => {
    const prefixes = ['PEPTRA', 'LAB', 'BIO', 'RESEARCH', 'SAVE', 'VIP'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    const code = `${randomPrefix}${formData.discount_type === 'percentage' ? formData.discount_value : randomNum}`;
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleSubmitNewDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.code.trim()) {
      setFormError('Please provide a coupon code.');
      return;
    }

    if (formData.discount_value <= 0) {
      setFormError('Discount value must be greater than 0.');
      return;
    }

    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    try {
      createDiscountCode({
        code: formData.code,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        applicable_payment: formData.applicable_payment,
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : undefined,
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : undefined,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : undefined,
        expires_at: formData.expires_at || undefined,
        is_active: formData.is_active,
      });

      loadData();
      setIsModalOpen(false);
      showToast(`Discount code "${formData.code.trim().toUpperCase()}" created successfully!`);
      // Reset form
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        applicable_payment: 'both',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        expires_at: '',
        is_active: true,
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to create discount code.');
    }
  };

  // Filtered List
  const filteredDiscounts = discounts.filter((d) => {
    if (filterPayment !== 'all' && d.applicable_payment !== filterPayment) return false;
    if (filterStatus === 'active' && !d.is_active) return false;
    if (filterStatus === 'inactive' && d.is_active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCode = d.code.toLowerCase().includes(q);
      const matchDesc = d.description?.toLowerCase().includes(q);
      if (!matchCode && !matchDesc) return false;
    }

    return true;
  });

  const totalCoupons = discounts.length;
  const activeCoupons = discounts.filter((d) => d.is_active).length;
  const totalUses = discounts.reduce((sum, d) => sum + (d.used_count || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-brand text-white px-5 py-3 rounded-2xl shadow-purple-glow font-orbitron text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-purple-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-brand-border pb-5">
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary flex items-center space-x-2.5">
                <Tag className="w-7 h-7 text-brand" />
                <span>DISCOUNT CODES & OFFERS</span>
              </h1>

              {/* Cloud Sync Status Badge */}
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(true)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-orbitron font-bold uppercase tracking-wider transition-all border ${
                  isCloudSynced === true
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : isCloudSynced === false
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
                title="Click to view Supabase database sync details & SQL migration"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-brand" />
                ) : isCloudSynced === true ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ) : (
                  <Database className="w-3 h-3 text-amber-600" />
                )}
                <span>
                  {isSyncing
                    ? 'Syncing Database...'
                    : isCloudSynced === true
                    ? 'Supabase Cloud Connected'
                    : 'Local Cache Mode (Click for SQL)'}
                </span>
                <Code2 className="w-3 h-3 ml-1 opacity-60" />
              </button>
            </div>
            <p className="text-xs text-content-secondary font-sans mt-1">
              Generate discount codes applicable on Full Online payment, Partial Advance (COD), or both.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto flex-wrap gap-y-2">
            <button
              type="button"
              onClick={loadData}
              disabled={isSyncing}
              className="px-3.5 py-2.5 border border-brand-border hover:border-brand bg-white text-content-secondary hover:text-brand font-orbitron text-xs rounded-full transition-all flex items-center space-x-1.5 shadow-xs"
              title="Refresh discounts from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>GENERATE NEW DISCOUNT CODE</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
            <span className="text-[10px] font-orbitron text-content-muted uppercase block">
              Total Discount Codes
            </span>
            <div className="font-orbitron font-extrabold text-2xl text-content-primary mt-1">
              {totalCoupons}
            </div>
            <div className="text-[11px] text-content-secondary mt-1 font-sans">
              Configured promotional codes
            </div>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
            <span className="text-[10px] font-orbitron text-content-muted uppercase block">
              Active & Live Coupons
            </span>
            <div className="font-orbitron font-extrabold text-2xl text-emerald-600 mt-1">
              {activeCoupons}
            </div>
            <div className="text-[11px] text-content-secondary mt-1 font-sans">
              Available for customer checkout
            </div>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
            <span className="text-[10px] font-orbitron text-content-muted uppercase block">
              Total Order Redemptions
            </span>
            <div className="font-orbitron font-extrabold text-2xl text-brand mt-1">
              {totalUses}
            </div>
            <div className="text-[11px] text-content-secondary mt-1 font-sans">
              Times discount applied by customers
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-brand absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or description..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Payment Filter */}
            <div className="flex items-center space-x-1.5 text-xs font-sans">
              <span className="text-content-muted text-[11px] font-orbitron">Payment:</span>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-brand-border text-xs bg-white font-orbitron text-content-secondary focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="all">All Payment Types</option>
                <option value="both">Both Payments</option>
                <option value="full">100% Complete Online Only</option>
                <option value="partial">Partial Advance (COD) Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 text-xs font-sans">
              <span className="text-content-muted text-[11px] font-orbitron">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-brand-border text-xs bg-white font-orbitron text-content-secondary focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Disabled Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Discounts Table */}
        <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FD] border-b border-brand-border text-content-muted font-orbitron text-[10px] uppercase">
                  <th className="py-3 px-4 font-bold">DISCOUNT CODE</th>
                  <th className="py-3 px-4 font-bold">TYPE & VALUE</th>
                  <th className="py-3 px-4 font-bold">APPLICABLE PAYMENT</th>
                  <th className="py-3 px-4 font-bold">CONDITIONS & LIMITS</th>
                  <th className="py-3 px-4 font-bold">REDEMPTIONS</th>
                  <th className="py-3 px-4 font-bold">STATUS</th>
                  <th className="py-3 px-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-content-muted font-orbitron">
                      No discount codes found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDiscounts.map((discount) => {
                    const isExpired = discount.expires_at && new Date(discount.expires_at).getTime() < Date.now();

                    return (
                      <tr key={discount.id} className="hover:bg-purple-50/20 transition-colors">
                        
                        {/* Code & Description */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-sm text-brand bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg tracking-wider">
                              {discount.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(discount.code)}
                              title="Copy code"
                              className="p-1 rounded text-content-muted hover:text-brand hover:bg-brand-light transition-colors"
                            >
                              {copiedCode === discount.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {discount.description && (
                            <div className="text-[11px] text-content-muted font-sans mt-1 max-w-xs truncate">
                              {discount.description}
                            </div>
                          )}
                        </td>

                        {/* Type & Value */}
                        <td className="py-3 px-4">
                          <span className="font-orbitron font-extrabold text-sm text-content-primary">
                            {discount.discount_type === 'percentage'
                              ? `${discount.discount_value}% OFF`
                              : `₹${discount.discount_value.toLocaleString('en-IN')} OFF`}
                          </span>
                          {discount.discount_type === 'percentage' && discount.max_discount_amount && (
                            <div className="text-[10px] text-content-muted font-mono">
                              Max cap: ₹{discount.max_discount_amount.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Applicable Payment Method */}
                        <td className="py-3 px-4">
                          {discount.applicable_payment === 'both' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full font-orbitron text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                              BOTH (FULL & COD)
                            </span>
                          )}
                          {discount.applicable_payment === 'full' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full font-orbitron text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              100% COMPLETE ONLINE ONLY
                            </span>
                          )}
                          {discount.applicable_payment === 'partial' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full font-orbitron text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                              PARTIAL ADVANCE (COD) ONLY
                            </span>
                          )}
                        </td>

                        {/* Conditions */}
                        <td className="py-3 px-4 font-sans text-xs">
                          {discount.min_order_amount ? (
                            <div className="text-content-secondary">
                              Min Order: <strong className="font-mono">₹{discount.min_order_amount.toLocaleString('en-IN')}</strong>
                            </div>
                          ) : (
                            <div className="text-content-muted">No minimum order</div>
                          )}
                          {discount.expires_at && (
                            <div className={`text-[11px] ${isExpired ? 'text-red-600 font-semibold' : 'text-content-muted'}`}>
                              {isExpired ? 'Expired: ' : 'Expires: '}
                              {new Date(discount.expires_at).toLocaleDateString()}
                            </div>
                          )}
                        </td>

                        {/* Redemptions */}
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-content-primary">
                            {discount.used_count || 0}
                          </span>
                          <span className="text-content-muted">
                            {discount.usage_limit ? ` / ${discount.usage_limit}` : ' (unlimited)'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggle(discount.id)}
                            className={`px-3 py-1 rounded-full font-orbitron text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                              discount.is_active && !isExpired
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {isExpired ? 'Expired' : discount.is_active ? 'Active' : 'Disabled'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(discount.id, discount.code)}
                            className="p-1.5 rounded-lg text-content-muted hover:text-accent-danger hover:bg-red-50 transition-colors"
                            title="Delete discount code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --------------------------------------------------------------- */}
      {/* GENERATE NEW DISCOUNT CODE MODAL */}
      {/* --------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-brand-border flex items-center justify-between bg-[#FAF8FD]">
              <div>
                <h3 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-brand" />
                  <span>GENERATE NEW DISCOUNT OFFER CODE</span>
                </h3>
                <p className="text-xs text-content-muted mt-0.5 font-sans">
                  Configure discount code rules, discount amount, and payment applicability.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-content-muted hover:text-content-primary hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitNewDiscount} className="p-6 overflow-y-auto space-y-5 text-xs font-sans">
              
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Code & Random Generator */}
              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1 font-bold">
                  COUPON / PROMO CODE *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                    placeholder="e.g. WELCOME10, FLAT500, PEPTRA20"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border font-mono text-sm uppercase font-bold text-brand focus:outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand border border-brand-border font-orbitron text-[10px] font-bold flex items-center space-x-1 shrink-0 transition-colors"
                    title="Auto generate code"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto Generate</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1 font-bold">
                  OFFER DESCRIPTION / CAMPAIGN NOTE
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 10% Off on Full Online Prepayment for New Research Labs"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-orbitron text-[10px] text-content-muted mb-1 font-bold">
                    DISCOUNT TYPE *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as DiscountType })}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border font-orbitron text-xs focus:outline-none focus:border-brand bg-white"
                  >
                    <option value="percentage">Percentage Discount (% Off)</option>
                    <option value="fixed">Fixed Rupee Discount (Flat ₹ Off)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-orbitron text-[10px] text-content-muted mb-1 font-bold">
                    {formData.discount_type === 'percentage' ? 'DISCOUNT PERCENTAGE (%) *' : 'DISCOUNT AMOUNT (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border font-mono text-sm font-bold text-brand focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* APPLICABLE PAYMENT METHOD (USER'S CORE REQUIREMENT) */}
              {/* ------------------------------------------------------------- */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border-2 border-brand-border space-y-3">
                <div>
                  <label className="block font-orbitron text-xs font-bold text-brand mb-0.5">
                    APPLICABLE PAYMENT METHOD *
                  </label>
                  <p className="text-[11px] text-content-muted">
                    Choose whether this coupon applies to complete payment, partial payment, or both.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Both */}
                  <label
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      formData.applicable_payment === 'both'
                        ? 'border-brand bg-white ring-2 ring-brand/20 shadow-xs'
                        : 'border-brand-border/70 bg-white/60 hover:border-brand/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="applicable_payment"
                        checked={formData.applicable_payment === 'both'}
                        onChange={() => setFormData({ ...formData, applicable_payment: 'both' })}
                        className="text-brand focus:ring-brand accent-brand"
                      />
                      <span className="font-orbitron font-bold text-xs text-content-primary">
                        BOTH
                      </span>
                    </div>
                    <span className="text-[10px] text-content-muted mt-2 leading-tight">
                      Valid for Full Online & Partial Advance (COD) payments.
                    </span>
                  </label>

                  {/* Option 2: Full Online Only */}
                  <label
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      formData.applicable_payment === 'full'
                        ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-brand-border/70 bg-white/60 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="applicable_payment"
                        checked={formData.applicable_payment === 'full'}
                        onChange={() => setFormData({ ...formData, applicable_payment: 'full' })}
                        className="text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                      />
                      <span className="font-orbitron font-bold text-xs text-emerald-900">
                        COMPLETE PAYMENT ONLY
                      </span>
                    </div>
                    <span className="text-[10px] text-content-muted mt-2 leading-tight">
                      Valid strictly when customer pays 100% online upfront.
                    </span>
                  </label>

                  {/* Option 3: Partial Advance COD Only */}
                  <label
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      formData.applicable_payment === 'partial'
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-brand-border/70 bg-white/60 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="applicable_payment"
                        checked={formData.applicable_payment === 'partial'}
                        onChange={() => setFormData({ ...formData, applicable_payment: 'partial' })}
                        className="text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                      <span className="font-orbitron font-bold text-xs text-blue-900">
                        PARTIAL PAYMENT ONLY
                      </span>
                    </div>
                    <span className="text-[10px] text-content-muted mt-2 leading-tight">
                      Valid strictly when customer chooses Partial Advance + COD.
                    </span>
                  </label>
                </div>
              </div>

              {/* Minimum Order & Maximum Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-orbitron text-[10px] text-content-muted mb-1 font-bold">
                    MINIMUM ORDER VALUE (₹) (OPTIONAL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    placeholder="e.g. 1500 (empty for no minimum)"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand font-mono"
                  />
                </div>

                {formData.discount_type === 'percentage' && (
                  <div>
                    <label className="block font-orbitron text-[10px] text-content-muted mb-1 font-bold">
                      MAX DISCOUNT CAP (₹) (OPTIONAL)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                      placeholder="e.g. 2000 (empty for no cap)"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limit & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-orbitron text-[10px] text-content-muted mb-1 font-bold">
                    TOTAL USAGE LIMIT (OPTIONAL)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="e.g. 100 (empty for unlimited)"
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand font-mono"
                  />
                </div>

                <div>
                  <label className="block font-orbitron text-[10px] text-content-muted mb-1 font-bold">
                    EXPIRATION DATE (OPTIONAL)
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand font-mono bg-white"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
                  />
                  <span className="font-orbitron text-xs font-semibold text-content-primary">
                    ACTIVATE THIS CODE IMMEDIATELY
                  </span>
                </label>
              </div>

              {/* Modal Submit Actions */}
              <div className="pt-4 border-t border-brand-border flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-brand-border text-content-secondary hover:bg-gray-100 font-orbitron text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-bold shadow-purple-sm transition-all"
                >
                  SAVE & ACTIVATE CODE
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Supabase SQL Migration Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border-2 border-brand-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setIsSqlModalOpen(false)}
              className="absolute top-5 right-5 text-content-muted hover:text-content-primary p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-brand flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg text-content-primary">
                  SUPABASE DATABASE SYNC
                </h3>
                <p className="text-xs text-content-secondary font-sans">
                  {isCloudSynced === true
                    ? '🟢 Your discount codes are actively synced with Supabase.'
                    : 'Run this SQL script once in your Supabase SQL Editor to enable real-time cloud sync across all devices.'}
                </p>
              </div>
            </div>

            <div className="bg-purple-50/60 border border-brand/20 rounded-xl p-3 my-3 text-xs text-brand-dark flex items-center justify-between">
              <span className="font-sans">
                Status:{' '}
                <strong className="font-orbitron">
                  {isCloudSynced === true
                    ? 'CONNECTED TO SUPABASE CLOUD'
                    : 'RUN SQL IN SUPABASE TO ACTIVATE CENTRAL STORE'}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  const sql = `-- ==============================================================================
-- PEPTRA BIO: DISCOUNT CODES & PROMOTIONS DATABASE SETUP
-- Paste and execute this in your Supabase SQL Editor:
-- ==============================================================================

CREATE TABLE IF NOT EXISTS discount_codes (
  id TEXT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  applicable_payment VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (applicable_payment IN ('both', 'full', 'partial')),
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes (UPPER(code));
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes (is_active);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on discount_codes" ON discount_codes FOR SELECT USING (true);
CREATE POLICY "Allow admin full access on discount_codes" ON discount_codes FOR ALL USING (true) WITH CHECK (true);

-- Add discount columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0.00;`;
                  navigator.clipboard.writeText(sql);
                  setSqlCopied(true);
                  setTimeout(() => setSqlCopied(false), 2500);
                }}
                className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg font-orbitron text-[10px] font-bold flex items-center space-x-1 transition-all shadow-xs"
              >
                {sqlCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{sqlCopied ? 'COPIED!' : 'COPY SQL SCRIPT'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-[11px] leading-relaxed border border-gray-800">
              <pre>{`-- 1. Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id TEXT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  applicable_payment VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (applicable_payment IN ('both', 'full', 'partial')),
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes (UPPER(code));
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes (is_active);

-- 3. Row Level Security policies
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on discount_codes" ON discount_codes FOR SELECT USING (true);
CREATE POLICY "Allow admin full access on discount_codes" ON discount_codes FOR ALL USING (true) WITH CHECK (true);

-- 4. Add discount columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0.00;`}</pre>
            </div>

            <div className="pt-4 border-t border-brand-border flex items-center justify-between mt-3 text-xs text-content-secondary">
              <span>Path: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">supabase/migrations/20261031_discount_codes.sql</code></span>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-content-primary rounded-xl font-orbitron text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

