'use client';

import React, { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Check
} from 'lucide-react';

function ForgotPasswordContent() {
  const router = useRouter();

  // Step sequence: 'request' -> 'otp' -> 'new_password' -> 'success'
  const [step, setStep] = useState<'request' | 'otp' | 'new_password' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  React.useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Handle individual OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    setError(null);
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  // STEP 1: Submit email to request OTP via Supabase
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid researcher email address.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (supabase) {
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${siteUrl}/reset-password`,
        });

        if (resetError) {
          if (resetError.message.toLowerCase().includes('rate limit')) {
            setError('Too many reset requests. Please wait a few minutes before trying again.');
            setLoading(false);
            return;
          }
          console.warn('Supabase reset notice:', resetError.message);
        }
      }
    } catch (err: any) {
      console.warn('Reset request error:', err);
    }

    setStep('otp');
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(30);
    setCanResend(false);
    setLoading(false);
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 150);
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.resetPasswordForEmail(email.trim());
      }
    } catch (err) {
      console.warn('Resend error:', err);
    }
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(30);
    setCanResend(false);
    otpInputsRef.current[0]?.focus();
  };

  // STEP 2: Verify 6-digit OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setError('Please enter the complete 6-digit recovery code.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (supabase) {
        // Try recovery verification
        const { data: vData, error: vError } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: enteredCode,
          type: 'recovery',
        });

        if (!vError && (vData?.session || vData?.user)) {
          setStep('new_password');
          setLoading(false);
          return;
        }

        // Try email OTP type
        const { data: vData2, error: vError2 } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: enteredCode,
          type: 'email',
        });

        if (!vError2 && (vData2?.session || vData2?.user)) {
          setStep('new_password');
          setLoading(false);
          return;
        }

        if (vError || vError2) {
          setError(vError?.message || vError2?.message || 'Invalid or expired recovery code. Please check your email.');
          setLoading(false);
          return;
        }
      } else {
        // Local fallback
        setStep('new_password');
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setError(err?.message || 'Error verifying recovery code.');
      setLoading(false);
      return;
    }

    setStep('new_password');
    setLoading(false);
  };

  // STEP 3: Submit New Password & Confirm Password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (supabase) {
        const { error: pError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (pError) {
          setError(pError.message);
          setLoading(false);
          return;
        }
      }

      // Update local storage db record if exists
      const rawUsers = localStorage.getItem('peptrabio_registered_users');
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (idx !== -1) {
          users[idx].passwordHash = newPassword;
          localStorage.setItem('peptrabio_registered_users', JSON.stringify(users));
        }
      }

      setStep('success');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

        {/* STEP 1: REQUEST EMAIL */}
        {step === 'request' && (
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
                RESET <span className="text-brand">PASSWORD</span>
              </h2>
              <p className="mt-2 text-xs text-content-muted font-sans max-w-xs mx-auto">
                Enter your registered researcher email address to receive a secure recovery code.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-600 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestReset} className="mt-6 space-y-5 relative">
              <div>
                <label className="block font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-1.5">
                  Researcher Email Address
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
                    placeholder="researcher@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-soft border border-brand-border text-xs text-content-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all shadow-purple-sm hover:shadow-purple-md flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>SENDING RECOVERY CODE...</span>
                ) : (
                  <>
                    <span>SEND RECOVERY CODE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-brand-border text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-xs font-orbitron font-semibold text-content-secondary hover:text-brand transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </>
        )}

        {/* STEP 2: ONLY 6-DIGIT CODE SCREEN */}
        {step === 'otp' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-200">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="inline-flex items-center text-xs font-orbitron font-semibold text-content-secondary hover:text-brand transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back</span>
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-light text-brand flex items-center justify-center shadow-purple-sm mb-3">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="font-orbitron font-extrabold text-2xl text-content-primary">
                VERIFY <span className="text-brand">CODE</span>
              </h2>
              <p className="text-xs text-content-secondary font-sans max-w-sm mx-auto leading-relaxed">
                Enter the 6-digit recovery code sent to{' '}
                <strong className="text-content-primary font-semibold block sm:inline">{email}</strong>
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-600 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-center font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-3">
                  ENTER 6-DIGIT RECOVERY CODE
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputsRef.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg font-bold rounded-2xl border-2 border-brand-border bg-surface-soft text-content-primary focus:outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all shadow-purple-sm hover:shadow-purple-md flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>VERIFYING CODE...</span>
                ) : (
                  <>
                    <span>CONTINUE TO SET NEW PASSWORD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="inline-flex items-center space-x-1.5 text-xs font-orbitron font-bold text-brand hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RESEND RECOVERY CODE</span>
                  </button>
                ) : (
                  <span className="text-xs text-content-muted font-sans">
                    Resend code in <strong className="font-mono text-brand font-semibold">{resendTimer}s</strong>
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: NEW PASSWORD & CONFIRM PASSWORD SCREEN (AFTER CODE VERIFICATION) */}
        {step === 'new_password' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-200">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-sm mb-3">
                <Check className="w-7 h-7" />
              </div>
              <h2 className="font-orbitron font-extrabold text-2xl text-content-primary">
                SET NEW <span className="text-brand">PASSWORD</span>
              </h2>
              <p className="text-xs text-content-secondary font-sans max-w-sm mx-auto leading-relaxed">
                Code verified. Choose a new secure password for{' '}
                <strong className="text-content-primary font-semibold block sm:inline">{email}</strong>
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-600 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSetNewPassword} className="space-y-4">
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
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-soft border border-brand-border text-xs text-content-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                    autoFocus
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
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
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
                  <span>SAVING NEW PASSWORD...</span>
                ) : (
                  <>
                    <span>RESET & ACTIVATE PASSWORD</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div className="text-center space-y-6 py-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-orbitron text-[11px] font-bold rounded-full uppercase tracking-wider">
                ✓ PASSWORD UPDATED
              </span>
              <h2 className="font-orbitron font-extrabold text-2xl text-content-primary">
                PASSWORD RESET COMPLETE!
              </h2>
              <p className="text-xs text-content-secondary max-w-xs mx-auto font-sans leading-relaxed">
                Your credentials have been securely updated. Redirecting you to the sign-in portal...
              </p>
            </div>

            <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </div>
        )}

        {/* Security Compliance */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-content-muted font-orbitron text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          <span>Strict In-Vitro Research Compliance Verified</span>
        </div>

      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-orbitron text-xs">Loading recovery...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
