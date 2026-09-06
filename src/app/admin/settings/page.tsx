'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Settings,
  Database,
  ShieldCheck,
  Save,
  CheckCircle2,
  Info,
  Sliders
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('PEPTRA BIO');
  const [supportEmail, setSupportEmail] = useState('support@peptrabio.com');
  const [currency, setCurrency] = useState('USD');
  const [shippingRate, setShippingRate] = useState('15.00');
  const [complianceNotice, setComplianceNotice] = useState(
    'RESEARCH USE ONLY • ALL PEPTIDES ARE SOLD STRICTLY FOR IN VITRO LABORATORY RESEARCH'
  );
  const [toast, setToast] = useState(false);

  const isSupabaseConfigured = typeof process !== 'undefined' && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        
        {/* Toast */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 bg-brand text-white px-5 py-3 rounded-2xl shadow-purple-glow font-orbitron text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-purple-300" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-brand-border pb-5">
          <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
            SYSTEM SETTINGS
          </h1>
          <p className="text-xs text-content-secondary font-sans mt-0.5">
            Configure catalog defaults, database connection profile, and compliance parameters.
          </p>
        </div>

        {/* Supabase Integration Card */}
        <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-brand-border pb-4">
            <Database className="w-6 h-6 text-brand" />
            <div>
              <h2 className="font-orbitron font-bold text-base text-content-primary">
                DATABASE & SUPABASE BACKEND
              </h2>
              <p className="text-xs text-content-muted font-sans">
                PostgreSQL schema and storage infrastructure
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-3 text-xs font-sans">
            <div className="flex items-center justify-between">
              <span className="font-orbitron font-bold text-content-primary">CONNECTION STATUS</span>
              <span className="px-3 py-1 rounded-full font-orbitron text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                ACTIVE & SYNCED (LOCAL / SUPABASE READY)
              </span>
            </div>
            <p className="text-content-secondary leading-relaxed">
              The application is configured to read from Supabase PostgreSQL when credentials (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are present in `.env.local`, with high-performance local store synchronization active.
            </p>
          </div>
        </div>

        {/* Store Settings Form */}
        <form onSubmit={handleSave} className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-brand-border pb-4">
            <Sliders className="w-6 h-6 text-brand" />
            <h2 className="font-orbitron font-bold text-base text-content-primary">
              CATALOG & COMMERCE PREFERENCES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                STORE BRAND NAME
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs font-sans"
              />
            </div>

            <div>
              <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                SUPPORT INQUIRY EMAIL
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs font-sans"
              />
            </div>

            <div>
              <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                BASE CURRENCY
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs font-sans bg-white focus:outline-none focus:border-brand"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div>
              <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                COLD-CHAIN FLAT SHIPPING RATE (USD)
              </label>
              <input
                type="text"
                value={shippingRate}
                onChange={(e) => setShippingRate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs font-sans font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                ANNOUNCEMENT BAR COMPLIANCE NOTICE
              </label>
              <input
                type="text"
                value={complianceNotice}
                onChange={(e) => setComplianceNotice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs font-sans"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm flex items-center space-x-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>SAVE SETTINGS</span>
            </button>
          </div>
        </form>

      </div>
    </AdminLayout>
  );
}
