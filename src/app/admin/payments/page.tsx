'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { Order, PaymentStatus } from '@/types';
import { getLocalOrders, verifyOrderPaymentInStore } from '@/lib/products-store';
import { getCurrentAdmin } from '@/lib/admin-store';
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  FileCheck,
  MessageSquare,
  AlertTriangle,
  ZoomIn,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { getPaymentStatusBadge, generateWhatsAppPaymentLink } from '@/lib/payment-config';

export default function AdminPaymentsPage() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeModalAction, setActiveModalAction] = useState<'verify' | 'reject' | null>(null);
  const [enlargedScreenshot, setEnlargedScreenshot] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentAdmin = getCurrentAdmin();

  const loadOrders = () => {
    setOrders(getLocalOrders());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleVerifyOrReject = async (action: 'verify' | 'reject') => {
    if (!selectedOrder) return;
    setIsProcessing(true);

    try {
      const updated = await verifyOrderPaymentInStore({
        orderId: selectedOrder.id,
        action,
        adminEmail: currentAdmin?.email || 'admin@peptrabio.com',
        verificationNotes: adminNotes,
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
      });

      loadOrders();
      showToast(
        action === 'verify'
          ? `Order #${selectedOrder.order_number} marked as PAYMENT RECEIVED (Customer account updated).`
          : `Order #${selectedOrder.order_number} payment REJECTED.`
      );

      if (updated) {
        setSelectedOrder(updated);
      } else {
        setSelectedOrder(null);
      }
      setActiveModalAction(null);
      setAdminNotes('');
      setRejectionReason('');
    } catch (err: any) {
      alert('Error updating payment status: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all') {
      const orderPayStatus = o.payment_status || 'unpaid';
      if (orderPayStatus !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchEmail = o.customer_email.toLowerCase().includes(q);
      const matchUtr = o.utr_number ? o.utr_number.toLowerCase().includes(q) : false;
      if (!matchNum && !matchName && !matchEmail && !matchUtr) return false;
    }
    return true;
  });

  const awaitingCount = orders.filter((o) => o.payment_status === 'awaiting_verification').length;
  const verifiedCount = orders.filter((o) => o.payment_status === 'verified').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-xl font-orbitron text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
                PAYMENT VERIFICATIONS
              </h1>
              {awaitingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold text-xs border border-amber-300 animate-pulse">
                  {awaitingCount} Awaiting Review
                </span>
              )}
            </div>
            <p className="text-xs text-content-secondary font-sans mt-0.5">
              Review UPI transaction references, compare expected amounts, verify payment proofs, and reconcile with merchant bank records.
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-white border border-brand-border rounded-xl text-xs font-orbitron font-semibold text-content-secondary hover:text-brand hover:border-brand flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH</span>
          </button>
        </div>

        {/* Manual Reconciliation Warning Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-900 text-xs font-sans flex items-start space-x-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-orbitron font-bold block text-xs mb-0.5 text-amber-950">
              MANDATORY BANK RECONCILIATION PROTOCOL
            </strong>
            <span>
              Customer-provided screenshots or UTR numbers are not conclusive proof of receipt. Always cross-check the submitted UTR and amount with the merchant bank statement or UPI business portal before marking payment as <strong>Verified</strong>.
            </span>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-brand absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, UTR, customer..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8FD] border border-brand-border rounded-full text-xs font-sans text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'awaiting_verification', label: `In Processing (${awaitingCount})` },
              { id: 'verified', label: `Payment Received (${verifiedCount})` },
              { id: 'rejected', label: 'Rejected' },
              { id: 'unpaid', label: 'Unpaid' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full font-orbitron text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-[#FAF8FD] text-content-secondary hover:text-content-primary hover:bg-emerald-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF8FD] text-content-muted font-orbitron text-[10px] border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4">Order # & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Payment Plan</th>
                  <th className="py-3.5 px-4">Advance Due</th>
                  <th className="py-3.5 px-4">Remaining COD</th>
                  <th className="py-3.5 px-4">Submitted UTR / Proof</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-content-muted">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusBadge = getPaymentStatusBadge(order.payment_status || 'unpaid');
                    return (
                      <tr key={order.id} className="hover:bg-brand-subtle/40 transition-colors">
                        
                        <td className="py-3.5 px-4">
                          <div className="font-orbitron font-bold text-brand">{order.order_number}</div>
                          <div className="text-[10px] text-content-muted">{new Date(order.created_at).toLocaleDateString()}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-content-primary">{order.customer_name}</div>
                          <div className="text-[11px] text-content-muted">{order.customer_email}</div>
                          {order.customer_phone && (
                            <div className="text-[10px] text-content-muted font-mono">{order.customer_phone}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-orbitron text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-brand border border-purple-200 uppercase">
                            {order.payment_type === 'full' ? '100% ONLINE' : '10% ADVANCE'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-emerald-700">
                            ₹{order.advance_amount ? order.advance_amount.toLocaleString('en-IN') : Math.round(order.total * 0.1).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-content-muted">Total: ₹{order.total.toLocaleString('en-IN')}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono font-medium text-content-primary">
                            ₹{(order.remaining_cod_amount ?? Math.round(order.total * 0.9)).toLocaleString('en-IN')}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {order.utr_number ? (
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-xs text-content-primary bg-gray-100 px-2 py-0.5 rounded">
                                {order.utr_number}
                              </span>
                              {order.screenshot_url && (
                                <button
                                  type="button"
                                  onClick={() => setEnlargedScreenshot(order.screenshot_url || null)}
                                  className="flex items-center text-[10px] text-brand hover:underline"
                                >
                                  <Eye className="w-3 h-3 mr-0.5" />
                                  <span>View Proof</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-content-muted italic">No UTR logged</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-orbitron font-bold uppercase border ${statusBadge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                            <span>{statusBadge.label}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setAdminNotes(order.payment_notes || '');
                              setRejectionReason(order.payment_rejection_reason || '');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-brand text-white hover:bg-brand-dark font-orbitron text-[10px] font-semibold transition-colors"
                          >
                            Verify
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

        {/* Detailed Verification Inspection Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border-2 border-brand-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-content-muted hover:bg-brand-light"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 border-b border-brand-border pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg text-content-primary">
                    VERIFY PAYMENT: {selectedOrder.order_number}
                  </h3>
                  <div className="text-xs text-content-muted">
                    Order Total: ₹{selectedOrder.total.toLocaleString('en-IN')} • Customer: {selectedOrder.customer_name}
                  </div>
                </div>
              </div>

              {/* Status & Plan Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-1">
                  <span className="font-orbitron text-[10px] text-content-muted uppercase block">Plan & Amount Expected</span>
                  <div className="font-orbitron font-bold text-sm text-emerald-800">
                    {selectedOrder.payment_type === 'full' ? 'FULL PAYMENT (100%)' : 'PARTIAL ADVANCE (10%)'}
                  </div>
                  <div className="text-emerald-700 font-mono font-bold">
                    Advance Expected: ₹{(selectedOrder.advance_amount || Math.round(selectedOrder.total * 0.1)).toLocaleString('en-IN')}
                  </div>
                  <div className="text-content-muted">
                    Balance COD: ₹{(selectedOrder.remaining_cod_amount || Math.round(selectedOrder.total * 0.9)).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-1">
                  <span className="font-orbitron text-[10px] text-content-muted uppercase block">Submitted UTR Reference</span>
                  <div className="font-mono font-bold text-sm text-content-primary">
                    {selectedOrder.utr_number || 'No UTR submitted yet'}
                  </div>
                  {selectedOrder.payment_submitted_at && (
                    <div className="text-[10px] text-content-muted">
                      Submitted on: {new Date(selectedOrder.payment_submitted_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Screenshot Preview */}
              {selectedOrder.screenshot_url ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron text-[10px] font-bold text-emerald-900 uppercase">
                      Attached Payment Screenshot Proof
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnlargedScreenshot(selectedOrder.screenshot_url || null)}
                      className="text-xs text-emerald-700 font-orbitron font-bold hover:underline flex items-center space-x-1"
                    >
                      <ZoomIn className="w-3.5 h-3.5 mr-0.5" />
                      <span>Enlarge Proof</span>
                    </button>
                  </div>
                  <div className="flex justify-center bg-white p-2 rounded-xl border border-emerald-200">
                    <img
                      src={selectedOrder.screenshot_url}
                      alt="Payment proof screenshot"
                      className="max-h-48 object-contain rounded cursor-pointer"
                      onClick={() => setEnlargedScreenshot(selectedOrder.screenshot_url || null)}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center text-xs text-content-muted font-sans">
                  No payment screenshot was uploaded via web form. Check WhatsApp support chat if submitted there.
                </div>
              )}

              {/* Internal Notes & Rejection Reason Input */}
              <div className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block font-orbitron text-[10px] font-bold text-content-muted uppercase mb-1">
                    Internal Verification Notes / Bank Auth Code
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Verified in ICICI Current Account statement. Auth ref #99214."
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand"
                  />
                </div>

                {activeModalAction === 'reject' && (
                  <div>
                    <label className="block font-orbitron text-[10px] font-bold text-accent-danger uppercase mb-1">
                      Reason for Rejection (Customer will be notified)
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. UTR number not found in merchant bank records or amount mismatched."
                      className="w-full px-3.5 py-2 rounded-xl border border-accent-danger/50 bg-red-50 text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {activeModalAction === 'reject' ? (
                  <>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleVerifyOrReject('reject')}
                      className="flex-1 py-3 px-5 rounded-full bg-accent-danger text-white font-orbitron text-xs font-bold hover:bg-red-700 transition-colors"
                    >
                      CONFIRM REJECTION
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalAction(null)}
                      className="py-3 px-5 rounded-full border border-brand-border text-content-secondary font-orbitron text-xs font-semibold hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleVerifyOrReject('verify')}
                      className="flex-1 py-3 px-5 rounded-full bg-emerald-600 text-white font-orbitron text-xs font-bold hover:bg-emerald-700 shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>MARK PAYMENT RECEIVED</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalAction('reject')}
                      className="py-3 px-5 rounded-full border border-red-300 text-red-600 hover:bg-red-50 font-orbitron text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>REJECT PAYMENT</span>
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Enlarged Screenshot Modal */}
        {enlargedScreenshot && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setEnlargedScreenshot(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setEnlargedScreenshot(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={enlargedScreenshot}
                alt="Enlarged payment screenshot"
                className="max-h-[85vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
