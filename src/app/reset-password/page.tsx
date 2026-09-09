'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (supabase) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

        {!success ? (
          <>
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
              <h2 className="font-orbitron font-extrabold text-2xl text-content-primary tracking-wide">
                SET NEW <span className="text-brand">PASSWORD</span>
              </h2>
              <p className="mt-2 text-xs text-content-muted font-sans max-w-xs mx-auto">
                Create a new secure password for your verified researcher account.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-600 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4 relative">
              <div>
                <label className="block font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-1.5">
                  New Password
                </label>
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

              <div>
                <label className="block font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-soft border border-brand-border text-xs text-content-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all shadow-purple-sm hover:shadow-purple-md flex items-center justify-center space-x-2 disabled:opacity-60 mt-4"
              >
                {loading ? (
                  <span>UPDATING PASSWORD...</span>
                ) : (
                  <>
                    <span>SAVE NEW PASSWORD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6 py-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-orbitron text-[11px] font-bold rounded-full uppercase tracking-wider">
                ✓ PASSWORD UPDATED
              </span>
              <h2 className="font-orbitron font-extrabold text-2xl text-content-primary">
                PASSWORD UPDATED!
              </h2>
              <p className="text-xs text-content-secondary max-w-xs mx-auto font-sans leading-relaxed">
                Your new password has been set. Redirecting you to sign in...
              </p>
            </div>

            <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </div>
        )}

        <div className="flex items-center justify-center space-x-2 text-[10px] text-content-muted font-orbitron text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          <span>Strict In-Vitro Research Compliance Verified</span>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-orbitron text-xs">Loading reset...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
