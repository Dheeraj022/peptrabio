'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { getLocalOrders, fetchAllOrdersAsync, updateOrderStatus, updateOrderPaymentStatus, deleteOrder } from '@/lib/products-store';
import { getPaymentStatusBadge } from '@/lib/payment-config';
import { verifyAdminPassword } from '@/lib/admin-store';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  XCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Trash2,
  Lock,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Delete Order with Admin Password Verification State
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrders = async () => {
    // 1. Instant optimistic load from local storage
    setOrders(getLocalOrders());
    // 2. Fetch fresh orders from database & sync
    const freshOrders = await fetchAllOrdersAsync();
    setOrders(freshOrders);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const displayedPrice = targetOrder ? formatPrice(getOrderTotal(targetOrder)) : undefined;
    await updateOrderStatus(orderId, newStatus, displayedPrice);
    loadOrders();
    showToast(`Order status updated to ${newStatus.toUpperCase()}. Notification sent to ${targetOrder?.customer_email || 'customer'}.`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => prev ? {
        ...prev,
        status: newStatus,
        payment_status: (newStatus === 'paid' || newStatus === 'processing' || newStatus === 'shipped' || newStatus === 'delivered')
          ? 'verified'
          : (newStatus === 'refunded' ? 'refunded' : prev.payment_status)
      } : null);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    await updateOrderPaymentStatus(orderId, newPaymentStatus);
    loadOrders();
    showToast(`Payment status updated to ${newPaymentStatus}.`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => prev ? {
        ...prev,
        payment_status: newPaymentStatus,
        status: newPaymentStatus === 'verified' && prev.status === 'pending' ? 'paid' : prev.status
      } : null);
    }
  };

  const getOrderTotal = (order: Order) => {
    if (order.subtotal && order.total && order.subtotal > 0) {
      if (Math.abs(order.total - order.subtotal * 86.5) < 5 || order.total > order.subtotal * 10) {
        return order.subtotal + (order.shipping || 0);
      }
    }
    return order.total;
  };

  const initiateDeleteOrder = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOrderToDelete(order);
    setDeletePassword('');
    setDeleteError('');
    setShowPassword(false);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToDelete) return;

    if (!deletePassword.trim()) {
      setDeleteError('Please enter administrator password or secret passkey to confirm.');
      return;
    }

    if (!verifyAdminPassword(deletePassword)) {
      setDeleteError('Incorrect administrator password or passkey. Please check and try again.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const success = await deleteOrder(orderToDelete.id);
      if (success) {
        if (selectedOrder?.id === orderToDelete.id) {
          setSelectedOrder(null);
        }
        showToast(`Order ${orderToDelete.order_number} has been deleted permanently.`);
        loadOrders();
        setOrderToDelete(null);
        setDeletePassword('');
      } else {
        setDeleteError('Failed to delete order from storage.');
      }
    } catch (err) {
      console.error(err);
      setDeleteError('An unexpected error occurred while deleting the order.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchEmail = o.customer_email.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchEmail) return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-brand text-white px-5 py-3 rounded-2xl shadow-purple-glow font-orbitron text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-purple-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
              ORDERS MANAGEMENT
            </h1>
            <p className="text-xs text-content-secondary font-sans mt-0.5">
              Review and manage customer research requisitions, fulfillment statuses, and compliance attestations.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-brand absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer, email..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8FD] border border-brand-border rounded-full text-xs font-sans text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-brand-border rounded-full px-3 py-2 text-xs font-orbitron text-content-primary focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">Status: All Orders</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF8FD] text-content-muted font-orbitron text-[10px] border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer & Institution</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total & Due Balance</th>
                  <th className="py-3.5 px-4">Compliance Check</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-content-muted">
                      No orders found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-brand-subtle/50 transition-colors">
                      
                      <td className="py-3.5 px-4">
                        <div className="font-orbitron font-bold text-brand">{order.order_number}</div>
                        <div className="text-[10px] text-content-muted">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-content-primary">{order.customer_name}</div>
                        <div className="text-[11px] text-content-muted">{order.customer_email}</div>
                        {order.shipping_address?.company && (
                          <div className="text-[10px] text-brand font-medium">{order.shipping_address.company}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-orbitron font-semibold text-content-primary">
                          {order.items?.reduce((sum, i) => sum + i.quantity, 0) || 1} vials
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {(() => {
                          const totalInr = Math.round(getOrderTotal(order) * 86.5);
                          const isPartial = order.payment_type === 'partial';
                          const isDeliveredOrFull = order.status === 'delivered';
                          const advPct = (order.advance_percentage || 10) / 100;
                          
                          // Calculate due amount
                          const advancePaid = (order.advance_amount && order.advance_amount > 100)
                            ? order.advance_amount
                            : Math.round(totalInr * advPct);
                            
                          const remainingDue = (order.remaining_cod_amount && order.remaining_cod_amount > 100)
                            ? order.remaining_cod_amount
                            : (totalInr - advancePaid);

                          return (
                            <div className="space-y-1">
                              <div className="font-mono font-bold text-content-primary">
                                {formatPrice(getOrderTotal(order))}
                              </div>

                              {isPartial ? (
                                isDeliveredOrFull ? (
                                  <div className="text-[10px] font-orbitron font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">
                                    ✓ Fully Collected
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-sans">
                                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center space-x-1">
                                      <span>Due:</span>
                                      <strong className="font-mono">₹{remainingDue.toLocaleString('en-IN')}</strong>
                                      <span className="text-[9px] text-amber-600">(COD)</span>
                                    </span>
                                  </div>
                                )
                              ) : (
                                <div className="text-[10px] font-orbitron text-content-muted">
                                  {order.payment_status === 'verified' ? (
                                    <span className="text-emerald-700 font-semibold">Due: ₹0 (Paid Full)</span>
                                  ) : (
                                    <span className="text-content-muted font-medium">Full Pre-paid</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-3.5 px-4">
                        {order.compliance_acknowledged ? (
                          <span className="inline-flex items-center text-[10px] font-orbitron font-semibold text-accent-success">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            ACKNOWLEDGED
                          </span>
                        ) : (
                          <span className="text-[10px] font-orbitron text-accent-danger">
                            UNVERIFIED
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {(() => {
                          const pBadge = getPaymentStatusBadge(order.payment_status || 'unpaid');
                          return (
                            <div className="space-y-1">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-orbitron text-[9px] font-bold uppercase tracking-wider border ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span>{pBadge.label}</span>
                              </span>
                              {order.payment_status === 'awaiting_verification' && (
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => handlePaymentStatusChange(order.id, 'verified')}
                                    className="text-[9px] font-orbitron font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300 transition-colors shadow-xs"
                                  >
                                    ✓ Mark Payment Received
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 rounded-full font-orbitron text-[10px] font-semibold uppercase border cursor-pointer focus:outline-none ${
                            order.status === 'delivered' || order.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.status === 'shipped' || order.status === 'processing'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : order.status === 'cancelled'
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-content-muted hover:text-brand hover:bg-brand-light transition-colors"
                            title="View order details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => initiateDeleteOrder(order, e)}
                            className="p-1.5 rounded-lg text-content-muted hover:text-accent-danger hover:bg-red-50 transition-colors"
                            title="Delete order (Requires Admin Password)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-2 border-brand-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              
              <div className="absolute top-5 right-5 flex items-center space-x-2">
                <button
                  onClick={() => initiateDeleteOrder(selectedOrder)}
                  className="px-3 py-1.5 rounded-full text-accent-danger hover:bg-red-50 border border-red-200 transition-colors flex items-center text-xs font-orbitron font-semibold"
                  title="Delete this order"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full text-content-muted hover:bg-brand-light transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-3 border-b border-brand-border pb-4">
                <ShoppingBag className="w-7 h-7 text-brand" />
                <div>
                  <h3 className="font-orbitron font-bold text-lg text-content-primary">
                    ORDER {selectedOrder.order_number}
                  </h3>
                  <div className="text-xs text-content-muted">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Status and Payment change rows inside modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between bg-brand-subtle p-3 rounded-2xl border border-brand-border">
                  <span className="font-orbitron text-xs font-semibold text-content-primary">FULFILLMENT:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                    className="px-3 py-1 rounded-full font-orbitron text-xs font-semibold uppercase bg-white border border-brand text-brand cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-brand-subtle p-3 rounded-2xl border border-brand-border">
                  <span className="font-orbitron text-xs font-semibold text-content-primary">PAYMENT:</span>
                  <select
                    value={selectedOrder.payment_status || 'unpaid'}
                    onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value as PaymentStatus)}
                    className="px-3 py-1 rounded-full font-orbitron text-xs font-semibold uppercase bg-white border border-brand text-brand cursor-pointer"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="awaiting_verification">In Processing (Verification Pending)</option>
                    <option value="verified">Payment Received</option>
                    <option value="rejected">Payment Rejected</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Customer & Destination info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-1">
                  <div className="font-orbitron font-bold text-[10px] text-brand uppercase">Customer Information</div>
                  <div className="font-medium text-content-primary">{selectedOrder.customer_name}</div>
                  <div className="text-content-secondary">{selectedOrder.customer_email}</div>
                  {selectedOrder.customer_phone && <div className="text-content-secondary">{selectedOrder.customer_phone}</div>}
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-1">
                  <div className="font-orbitron font-bold text-[10px] text-brand uppercase">Shipping Destination</div>
                  <div className="font-medium text-content-primary">{selectedOrder.shipping_address?.street || 'N/A'}</div>
                  <div className="text-content-secondary">
                    {selectedOrder.shipping_address?.city || ''}, {selectedOrder.shipping_address?.state || ''} {selectedOrder.shipping_address?.postal_code || ''}
                  </div>
                  <div className="text-content-secondary">{selectedOrder.shipping_address?.country || ''}</div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="font-orbitron font-bold text-xs text-content-primary">ORDER REQUISITION ITEMS</div>
                <div className="border border-brand-border rounded-2xl divide-y divide-brand-border/60 overflow-hidden text-xs">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between items-center bg-white">
                      <div>
                        <div className="font-orbitron font-semibold text-content-primary">{item.product_name}</div>
                        <div className="text-content-muted">Qty: {item.quantity} × {formatPrice(item.unit_price)}</div>
                      </div>
                      <div className="font-mono font-bold text-content-primary">{formatPrice(item.total_price)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Breakdown */}
              <div className="border-t border-brand-border pt-3 space-y-1.5 text-xs font-sans text-right">
                <div className="text-content-secondary">Subtotal: {formatPrice(selectedOrder.subtotal)}</div>
                <div className="text-content-secondary">Shipping: {formatPrice(selectedOrder.shipping)}</div>
                <div className="font-orbitron font-bold text-base text-brand">Total: {formatPrice(getOrderTotal(selectedOrder))}</div>

                {selectedOrder.payment_type === 'partial' && (
                  (() => {
                    const totalInr = Math.round(getOrderTotal(selectedOrder) * 86.5);
                    const advPct = (selectedOrder.advance_percentage || 10) / 100;
                    const advancePaid = (selectedOrder.advance_amount && selectedOrder.advance_amount > 100)
                      ? selectedOrder.advance_amount
                      : Math.round(totalInr * advPct);
                    const remainingDue = (selectedOrder.remaining_cod_amount && selectedOrder.remaining_cod_amount > 100)
                      ? selectedOrder.remaining_cod_amount
                      : (totalInr - advancePaid);

                    return (
                      <div className="pt-2 border-t border-gray-100 space-y-1 text-xs">
                        <div className="text-emerald-700 font-semibold flex justify-end items-center space-x-2">
                          <span>10% Advance Received:</span>
                          <span className="font-mono font-bold">₹{advancePaid.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-amber-800 font-bold flex justify-end items-center space-x-2">
                          <span>Due Balance on Delivery (COD):</span>
                          <span className="font-mono bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            ₹{remainingDue.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

            </div>
          </div>
        )}

        {/* Admin Password Protected Delete Order Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border-2 border-red-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-brand-border/60 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-content-primary">
                      DELETE ORDER
                    </h3>
                    <p className="text-[11px] text-content-secondary font-sans">
                      Admin authorization required to proceed
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDeleting) setOrderToDelete(null);
                  }}
                  className="p-1.5 rounded-full text-content-muted hover:bg-brand-light transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Order Summary Card */}
              <div className="bg-[#FAF8FD] border border-brand-border rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-orbitron font-semibold text-content-muted uppercase">Target Order:</span>
                  <span className="font-orbitron font-bold text-brand">{orderToDelete.order_number}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-content-muted">Customer:</span>
                  <span className="font-medium text-content-primary truncate max-w-[200px]">{orderToDelete.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-content-muted">Total:</span>
                  <span className="font-mono font-bold text-content-primary">{formatPrice(orderToDelete.total)}</span>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 border border-red-200/80 rounded-2xl p-3.5 flex items-start space-x-2.5 text-red-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Caution:</span> This action is permanent and cannot be undone. All manifest records and line items will be purged.
                </div>
              </div>

              {/* Password verification form */}
              <form onSubmit={handleConfirmDelete} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-orbitron font-bold text-content-primary uppercase tracking-wider mb-1.5">
                    Admin Password or Passkey
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-brand absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        if (deleteError) setDeleteError('');
                      }}
                      placeholder="Enter admin password or secret passkey"
                      disabled={isDeleting}
                      autoFocus
                      className={`w-full pl-10 pr-10 py-2.5 bg-[#FAF8FD] border rounded-xl text-xs font-sans text-content-primary focus:outline-none transition-colors ${
                        deleteError ? 'border-red-400 bg-red-50/30' : 'border-brand-border focus:border-brand'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-content-muted hover:text-content-primary p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {deleteError && (
                    <p className="mt-1.5 text-xs text-red-600 font-sans flex items-center">
                      <span className="mr-1">❌</span> {deleteError}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setOrderToDelete(null)}
                    className="px-4 py-2 rounded-full border border-brand-border text-xs font-orbitron font-semibold text-content-secondary hover:bg-brand-light transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || !deletePassword.trim()}
                    className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-orbitron font-bold tracking-wider shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all flex items-center space-x-1.5"
                  >
                    {isDeleting ? (
                      <span>Deleting...</span>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirm Deletion</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
