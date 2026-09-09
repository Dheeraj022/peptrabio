'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your research email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        router.push(redirectPath);
      } else {
        setError(res.error || 'Invalid email or password. Please verify and try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

        {/* Brand Header */}
        <div className="text-center relative">
          <div className="relative w-28 h-20 mx-auto mb-2">
            <Image
              src="/images/logo.png"
              alt="Peptra Bio"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-content-primary tracking-wide">
            RESEARCHER <span className="text-brand">SIGN IN</span>
          </h2>
          <p className="mt-2 text-xs text-content-muted font-sans max-w-xs mx-auto">
            Access your laboratory requisitions, verified batch COAs, and customer support tickets.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-600 animate-in fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 relative">
          <div>
            <label className="block font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-1.5">
              Email Address / Academic ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.name@institution.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-soft border border-brand-border text-xs text-content-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-orbitron font-semibold text-brand hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-soft border border-brand-border text-xs text-content-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all shadow-purple-sm hover:shadow-purple-md flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <span>SIGN IN TO PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register CTA */}
        <div className="pt-4 border-t border-brand-border text-center">
          <p className="text-xs text-content-secondary">
            New researcher or laboratory?{' '}
            <Link
              href={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register'}
              className="font-orbitron font-bold text-brand hover:underline"
            >
              Create Researcher Account →
            </Link>
          </p>
        </div>

        {/* Compliance Footer */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-content-muted font-orbitron text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          <span>Strict In-Vitro Research Compliance Verified</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-orbitron text-xs">Loading sign in...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
