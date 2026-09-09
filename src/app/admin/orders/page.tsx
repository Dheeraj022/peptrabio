'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { Order, OrderStatus } from '@/types';
import { getLocalOrders, updateOrderStatus } from '@/lib/products-store';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  XCircle,
  Eye,
  ShieldCheck,
  X
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadOrders = () => {
    setOrders(getLocalOrders());
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    loadOrders();
    showToast(`Order status updated to ${newStatus}.`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
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
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Compliance Check</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-content-muted">
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

                      <td className="py-3.5 px-4 font-mono font-bold text-content-primary">
                        {formatPrice(order.total)}
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
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg text-content-muted hover:text-brand hover:bg-brand-light transition-colors"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
              
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-content-muted hover:bg-brand-light"
              >
                <X className="w-5 h-5" />
              </button>

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

              {/* Status change row inside modal */}
              <div className="flex items-center justify-between bg-brand-subtle p-3.5 rounded-2xl border border-brand-border">
                <span className="font-orbitron text-xs font-semibold text-content-primary">UPDATE STATUS:</span>
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
                  <div className="font-medium text-content-primary">{selectedOrder.shipping_address.street}</div>
                  <div className="text-content-secondary">
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                  </div>
                  <div className="text-content-secondary">{selectedOrder.shipping_address.country}</div>
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

              {/* Totals */}
              <div className="border-t border-brand-border pt-3 space-y-1.5 text-xs font-sans text-right">
                <div className="text-content-secondary">Subtotal: {formatPrice(selectedOrder.subtotal)}</div>
                <div className="text-content-secondary">Shipping: {formatPrice(selectedOrder.shipping)}</div>
                <div className="font-orbitron font-bold text-base text-brand">Total: {formatPrice(selectedOrder.total)}</div>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
