'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { Product, Order, AdminAuditLog } from '@/types';
import { getLocalProducts, getLocalOrders, getLocalAuditLogs } from '@/lib/products-store';
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  FileCheck2,
  Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  useEffect(() => {
    setProducts(getLocalProducts());
    setOrders(getLocalOrders());
    setAuditLogs(getLocalAuditLogs());
  }, []);

  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.stock_quantity > 0).length;
  const outOfStockProducts = products.filter((p) => p.stock_quantity === 0).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'processing' || o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
              ADMIN CONTROL CENTER
            </h1>
            <p className="text-xs text-content-secondary font-sans mt-0.5">
              Overview of peptide catalog inventory, active research orders, and audit log history.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/products/new"
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-colors shadow-purple-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ NEW PRODUCT</span>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-sm space-y-2">
            <div className="flex items-center justify-between text-content-muted">
              <span className="font-orbitron text-[10px] uppercase font-semibold">Total Catalog</span>
              <Package className="w-4 h-4 text-brand" />
            </div>
            <div className="font-orbitron font-extrabold text-2xl text-content-primary">
              {totalProducts}
            </div>
            <div className="text-[11px] text-content-muted font-sans">{inStockProducts} in stock active</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-sm space-y-2">
            <div className="flex items-center justify-between text-content-muted">
              <span className="font-orbitron text-[10px] uppercase font-semibold">Out of Stock</span>
              <AlertTriangle className="w-4 h-4 text-accent-danger" />
            </div>
            <div className="font-orbitron font-extrabold text-2xl text-accent-danger">
              {outOfStockProducts}
            </div>
            <div className="text-[11px] text-content-muted font-sans">Needs replenishment</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-sm space-y-2">
            <div className="flex items-center justify-between text-content-muted">
              <span className="font-orbitron text-[10px] uppercase font-semibold">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-brand" />
            </div>
            <div className="font-orbitron font-extrabold text-2xl text-content-primary">
              {totalOrders}
            </div>
            <div className="text-[11px] text-brand font-orbitron font-semibold">{formatPrice(totalRevenue)} Vol</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-sm space-y-2">
            <div className="flex items-center justify-between text-content-muted">
              <span className="font-orbitron text-[10px] uppercase font-semibold">Pending Orders</span>
              <Clock className="w-4 h-4 text-accent-warning" />
            </div>
            <div className="font-orbitron font-extrabold text-2xl text-accent-warning">
              {pendingOrders}
            </div>
            <div className="text-[11px] text-content-muted font-sans">Requires fulfillment</div>
          </div>

        </div>

        {/* 2 Columns: Recent Orders & Inventory Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Recent Orders */}
          <div className="lg:col-span-8 bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-brand" />
                <span>RECENT LABORATORY ORDERS</span>
              </h2>
              <Link href="/admin/orders" className="text-xs font-orbitron text-brand hover:underline">
                View All Orders →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="text-content-muted font-orbitron text-[10px] border-b border-brand-border">
                  <tr>
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Customer / Institution</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-brand-subtle/50">
                      <td className="py-3 px-3 font-orbitron font-bold text-brand">{order.order_number}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-content-primary">{order.customer_name}</div>
                        <div className="text-[11px] text-content-muted">{order.customer_email}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold">{formatPrice(order.total)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-orbitron text-[10px] font-semibold uppercase ${
                          order.status === 'delivered' || order.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'processing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-content-muted">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Recent Activity Logs */}
          <div className="lg:col-span-4 bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
                <Activity className="w-4 h-4 text-brand" />
                <span>AUDIT ACTIVITY</span>
              </h2>
            </div>

            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <div className="text-xs text-content-muted py-4 text-center">
                  System logs initialized. Actions will record here.
                </div>
              ) : (
                auditLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="text-xs border-b border-brand-border/40 pb-2.5 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-orbitron font-semibold text-[11px] text-brand">
                        {log.action.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-[10px] text-content-muted">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-content-secondary text-[11px]">
                      {String(log.metadata?.name || log.metadata?.order_number || log.entity_type || '')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
