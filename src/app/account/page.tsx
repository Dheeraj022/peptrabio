'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  LifeBuoy,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  FileText,
  Clock
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'tickets' | 'settings'>('overview');
  const [editMode, setEditMode] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zip, setZip] = useState(user?.address?.zip || '');

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, isLoading, router]);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setInstitution(user.institution || '');
      setPhone(user.phone || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setZip(user.address?.zip || '');
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-orbitron text-xs text-content-secondary animate-pulse">
          Loading researcher profile...
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      institution,
      phone,
      address: {
        ...user.address,
        street,
        city,
        state,
        zip,
      }
    });
    setEditMode(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
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
                Verified Researcher
              </span>
            </div>
            <p className="text-xs text-content-secondary font-sans mt-0.5">
              {user.phone ? `${user.phone} • ` : ''}{user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/support/new"
            className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-colors shadow-purple-sm flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>NEW TICKET</span>
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
          { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy },
          { id: 'orders', label: 'Requisitions & Orders', icon: ShoppingBag },
          { id: 'settings', label: 'Lab Settings', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-orbitron text-xs font-semibold tracking-wider transition-all whitespace-nowrap ${
                active
                  ? 'border-brand text-brand bg-brand-light/30'
                  : 'border-transparent text-content-muted hover:text-content-primary hover:border-brand-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
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
                Researcher Profile Details
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
                    <label className="block font-orbitron text-[10px] font-bold text-content-muted uppercase mb-1">Laboratory / Institution</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-orbitron text-[10px] font-bold text-content-muted uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-brand-border bg-surface-soft text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-orbitron text-[10px] font-bold text-content-muted uppercase mb-1">Shipping Lab Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street address"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1">
                  <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">Full Name</span>
                  <div className="font-semibold text-content-primary flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-brand" />
                    <span>{user.name}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">Institutional Email</span>
                  <div className="font-semibold text-content-primary flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-brand" />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">Laboratory / Affiliation</span>
                  <div className="font-semibold text-content-primary flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-brand" />
                    <span>{user.institution || 'MIT Molecular Biology Dept'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">Phone Contact</span>
                  <div className="font-semibold text-content-primary flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-brand" />
                    <span>{user.phone || '+1 (617) 555-0199'}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1 pt-2 border-t border-brand-border">
                  <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">Laboratory Shipping Address</span>
                  <div className="font-semibold text-content-primary flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-brand mt-0.5" />
                    <span>
                      {user.address?.street || '77 Massachusetts Ave, Bldg 16'}, {user.address?.city || 'Cambridge'}, {user.address?.state || 'MA'} {user.address?.zip || '02139'}, United States
                    </span>
                  </div>
                </div>
              </div>
            )}
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
                  className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-bold text-center tracking-wider transition-colors"
                >
                  VIEW MY TICKETS →
                </Link>
                <Link
                  href="/support/new"
                  className="w-full py-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 rounded-xl font-orbitron text-[11px] font-medium text-center tracking-wider transition-colors"
                >
                  SUBMIT NEW TICKET
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-brand">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="font-orbitron font-bold text-xs text-content-primary">Product Authenticity Check</h4>
              </div>
              <p className="text-xs text-content-muted font-sans leading-relaxed">
                Scan or enter the verification code on your physical product packaging to verify batch authenticity.
              </p>
              <Link
                href="/verify"
                className="inline-flex items-center space-x-1.5 text-xs font-orbitron font-bold text-brand hover:underline pt-1"
              >
                <span>Go to Public Verification</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
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

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
          <div className="border-b border-brand-border pb-4">
            <h2 className="font-orbitron font-bold text-base text-content-primary">
              Laboratory Requisition History
            </h2>
            <p className="text-xs text-content-muted font-sans">
              Orders placed for research materials and analytical peptide standards.
            </p>
          </div>

          {/* Sample Requisition Item */}
          <div className="p-4 rounded-2xl bg-surface-soft border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-brand">#ORD-90241</span>
                <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-orbitron font-semibold uppercase">
                  Shipped (Cold Chain)
                </span>
              </div>
              <div className="text-xs text-content-primary font-medium">
                Selank (5mg Vial) × 2, BPC-157 (10mg Vial) × 1
              </div>
              <div className="text-[11px] text-content-muted">
                Placed on 04 Sep 2026 • Tracking: FEDEX-COLD-8829104
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/support/new?category=Order%20Status&order=ORD-90241"
                className="px-3 py-1.5 rounded-xl border border-brand-border text-xs font-orbitron font-medium hover:border-brand text-brand hover:bg-brand-light transition-colors"
              >
                Inquire
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
          <div className="border-b border-brand-border pb-4">
            <h2 className="font-orbitron font-bold text-base text-content-primary">
              Laboratory Compliance & Security
            </h2>
            <p className="text-xs text-content-muted font-sans">
              Manage your compliance certificates and laboratory credentials.
            </p>
          </div>

          <div className="space-y-4 max-w-xl text-xs">
            <div className="p-4 rounded-2xl bg-brand-light/50 border border-brand/20 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <div>
                <span className="font-orbitron font-bold text-brand block mb-1">
                  Active In-Vitro Research Acknowledgment
                </span>
                <p className="text-content-secondary leading-relaxed">
                  Your account is registered as an authorized laboratory researcher. All synthetic peptide sequences purchased through this account are certified solely for analytical and in-vitro research purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
