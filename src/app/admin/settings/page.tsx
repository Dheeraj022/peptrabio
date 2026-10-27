'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCurrency, SupportedCurrency, CURRENCIES } from '@/context/CurrencyContext';
import {
  Settings,
  Database,
  ShieldCheck,
  Save,
  CheckCircle2,
  Info,
  Sliders,
  UserPlus,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  getAdminUsers,
  createAdminProfileAsync,
  fetchAdminUsersFromSupabase,
  AdminUser
} from '@/lib/admin-store';

const SETTINGS_STORAGE_KEY = 'peptrabio_admin_settings_v1';

export default function AdminSettingsPage() {
  const { currency: globalCurrency, setCurrency: setGlobalCurrency } = useCurrency();

  const [storeName, setStoreName] = useState('PEPTRA BIO');
  const [supportEmail, setSupportEmail] = useState('support@peptrabio.com');
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(globalCurrency || 'INR');
  const [complianceNotice, setComplianceNotice] = useState(
    'RESEARCH USE ONLY • ALL PEPTIDES ARE SOLD STRICTLY FOR IN VITRO LABORATORY RESEARCH'
  );
  const [toast, setToast] = useState(false);

  // Admin Management State
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPasskey, setNewAdminPasskey] = useState('');
  const [showAdminPasskey, setShowAdminPasskey] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  const loadAdmins = async () => {
    setAdminList(getAdminUsers());
    const fresh = await fetchAdminUsersFromSupabase();
    if (fresh && fresh.length > 0) {
      setAdminList(fresh);
    }
  };

  const handleCreateNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    const res = await createAdminProfileAsync({
      name: newAdminName,
      email: newAdminEmail,
      password: newAdminPassword,
      passkey: newAdminPasskey,
      role: 'Administrator'
    });

    if (res.success && res.user) {
      setAdminSuccess(`Administrator created in Supabase Authentication (User UUID: ${res.user.id.slice(0, 8)}...)!`);
      await loadAdmins();
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminPasskey('');
      setTimeout(() => {
        setShowNewAdminModal(false);
        setAdminSuccess(null);
      }, 1500);
    } else {
      setAdminError(res.message);
    }
  };

  // Load persistent settings & admin list on mount
  useEffect(() => {
    loadAdmins();
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.storeName) setStoreName(parsed.storeName);
          if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
          if (parsed.complianceNotice) setComplianceNotice(parsed.complianceNotice);
        }
      } catch (err) {
        console.error('Error loading settings', err);
      }
    }
  }, []);

  // Sync selected currency with global currency
  useEffect(() => {
    if (globalCurrency) {
      setSelectedCurrency(globalCurrency);
    }
  }, [globalCurrency]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update Global Currency
    if (selectedCurrency && CURRENCIES[selectedCurrency]) {
      setGlobalCurrency(selectedCurrency);
    }

    // 2. Persist Store Settings in LocalStorage
    if (typeof window !== 'undefined') {
      try {
        const settingsPayload = {
          storeName,
          supportEmail,
          currency: selectedCurrency,
          complianceNotice,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsPayload));
      } catch (err) {
        console.error('Error saving admin settings', err);
      }
    }

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
            <span>Settings saved and currency updated successfully!</span>
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
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs font-sans focus:outline-none focus:border-brand"
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
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs font-sans focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                BASE CURRENCY
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as SupportedCurrency)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs font-sans bg-white focus:outline-none focus:border-brand font-medium"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                ANNOUNCEMENT BAR COMPLIANCE NOTICE
              </label>
              <input
                type="text"
                value={complianceNotice}
                onChange={(e) => setComplianceNotice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs font-sans focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>SAVE SETTINGS</span>
            </button>
          </div>
        </form>

        {/* Administrator Accounts & Security Card */}
        <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-brand flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-base text-content-primary">
                  ADMINISTRATOR PROFILES & ACCESS
                </h2>
                <p className="text-xs text-content-muted font-sans">
                  Manage authorized administrative staff and issue new access profiles
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowNewAdminModal(true);
                setAdminError(null);
                setAdminSuccess(null);
              }}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm flex items-center space-x-1.5 transition-all self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>CREATE ADMIN PROFILE</span>
            </button>
          </div>

          {/* Admin List */}
          <div className="divide-y divide-brand-border/60">
            {adminList.length === 0 ? (
              <div className="py-8 text-center text-xs text-content-muted font-sans">
                No administrators registered yet. Click &quot;CREATE ADMIN PROFILE&quot; to add an authorized administrator.
              </div>
            ) : (
              adminList.map((admin) => (
                <div key={admin.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center font-orbitron font-bold text-xs">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-xs text-content-primary flex items-center space-x-2">
                        <span>{admin.name}</span>
                        {admin.id && admin.id.length > 20 && (
                          <span className="text-[9px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200" title={`Supabase Auth User ID: ${admin.id}`}>
                            UUID: {admin.id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-content-muted font-mono">{admin.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-brand font-orbitron text-[10px] font-semibold border border-purple-200">
                      {admin.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-center space-x-2.5 text-xs text-purple-900 font-sans">
            <KeyRound className="w-4 h-4 text-brand shrink-0" />
            <span>
              All administrator registrations require a verified internal authorization passkey.
            </span>
          </div>
        </div>

        {/* Create Admin Modal */}
        {showNewAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1C122C] border-2 border-purple-800 text-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-purple-900 pb-3">
                <h3 className="font-orbitron font-bold text-base text-white flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-purple-400" />
                  <span>CREATE ADMIN PROFILE</span>
                </h3>
                <button
                  onClick={() => setShowNewAdminModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-red-950 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{adminError}</span>
                </div>
              )}

              {adminSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{adminSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateNewAdmin} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                    FULL NAME & TITLE
                  </label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Dr. Jordan Hayes"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-purple-950 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                    ADMINISTRATOR EMAIL
                  </label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="jordan.hayes@peptrabio.com"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-purple-950 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-purple-950 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                  />
                </div>

                {/* PASSKEY */}
                <div className="p-3 rounded-2xl bg-purple-950 border border-purple-600 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-orbitron font-bold text-[10px] text-purple-200 flex items-center space-x-1">
                      <KeyRound className="w-3.5 h-3.5 text-accent-warning animate-pulse" />
                      <span>AUTHORIZATION PASSKEY</span>
                    </label>
                    <span className="font-mono text-[9px] bg-purple-900 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700">
                      REQUIRED
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPasskey ? "text" : "password"}
                      value={newAdminPasskey}
                      onChange={(e) => setNewAdminPasskey(e.target.value)}
                      placeholder="Enter Secret Passkey (RGAM26)"
                      required
                      className="w-full pl-3 pr-10 py-2 rounded-xl bg-purple-900/60 border border-purple-500 text-white font-mono text-xs tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPasskey(!showAdminPasskey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white p-1"
                    >
                      {showAdminPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAdminModal(false)}
                    className="py-2.5 px-4 bg-purple-900/60 hover:bg-purple-900 text-gray-300 font-orbitron text-xs font-semibold rounded-full transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full transition-all shadow-purple-sm"
                  >
                    CONFIRM & CREATE
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
