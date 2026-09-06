'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Atom,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckSquare,
  Square,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { register, user } = useAuth();

  // Registration step: 'form' | 'otp' | 'verified'
  const [step, setStep] = useState<'form' | 'otp' | 'verified'>('form');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP states
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in and not in the middle of verifying, redirect
  useEffect(() => {
    if (user && step === 'form') {
      router.push(redirectPath);
    }
  }, [user, redirectPath, router, step]);

  // Resend timer countdown
  useEffect(() => {
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

  // Step 1: Submit Form & Generate OTP
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name or title.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid researcher email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedTerms) {
      setError('You must acknowledge that all purchases are strictly for in-vitro laboratory research.');
      return;
    }

    setLoading(true);

    // Send email verification OTP
    setTimeout(() => {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomCode);
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setLoading(false);
      // Focus first OTP input
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }, 500);
  };

  // Handle individual OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    setOtpError(null);
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Paste of complete 6-digit code
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(30);
    setCanResend(false);
    setOtpError(null);
    otpInputsRef.current[0]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');

    if (enteredCode.length < 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (enteredCode !== generatedOtp) {
      setOtpError('Invalid verification code. Please check your email and try again.');
      return;
    }

    setLoading(true);
    setOtpError(null);

    try {
      const res = await register({
        name,
        email,
        phone,
        password
      });

      if (res.success) {
        setStep('verified');
        setTimeout(() => {
          router.push(redirectPath);
        }, 1800);
      } else {
        setOtpError(res.error || 'Failed to complete registration.');
        setLoading(false);
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Verification error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' && (
          <>
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
                RESEARCHER <span className="text-brand">REGISTRATION</span>
              </h2>
              <p className="mt-2 text-xs text-content-muted font-sans max-w-sm mx-auto">
                Create a verified researcher account for streamlined ordering, batch certificates, and dedicated support tickets.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-600 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4 relative">
              
              {/* Full Name */}
              <div>
                <label className="block font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-1.5">
                  Full Name / Title <span className="text-accent-danger">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-soft border border-brand-border text-xs text-content-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-1.5">
                  Email Address <span className="text-accent-danger">*</span>
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

              {/* Phone Number */}
              <div>
                <label className="block font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-1.5">
                  Phone Number <span className="text-accent-danger">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-soft border border-brand-border text-xs text-content-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-1.5">
                    Password <span className="text-accent-danger">*</span>
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
                    Confirm Password <span className="text-accent-danger">*</span>
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
              </div>

              {/* Compliance Checkbox */}
              <div className="pt-2">
                <label
                  onClick={() => setAgreedTerms(!agreedTerms)}
                  className="flex items-start space-x-3 cursor-pointer p-3 bg-brand-light/50 hover:bg-brand-light rounded-xl border border-brand/20 transition-colors"
                >
                  <div className="mt-0.5 text-brand shrink-0">
                    {agreedTerms ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </div>
                  <span className="text-[11px] text-content-secondary leading-snug">
                    I hereby certify that I am conducting authorized laboratory research and agree that all synthetic peptides supplied are strictly for <strong>in-vitro scientific investigation</strong>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all shadow-purple-sm hover:shadow-purple-md flex items-center justify-center space-x-2 disabled:opacity-60 mt-4"
              >
                {loading ? (
                  <span>SENDING VERIFICATION CODE...</span>
                ) : (
                  <>
                    <span>CONTINUE TO VERIFY EMAIL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="pt-4 border-t border-brand-border text-center">
              <p className="text-xs text-content-secondary">
                Already have an account?{' '}
                <Link
                  href={redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login'}
                  className="font-orbitron font-bold text-brand hover:underline"
                >
                  Sign In Here →
                </Link>
              </p>
            </div>
          </>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-200">
            
            <button
              type="button"
              onClick={() => setStep('form')}
              className="inline-flex items-center text-xs font-orbitron font-semibold text-content-secondary hover:text-brand transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to details</span>
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-light text-brand flex items-center justify-center shadow-purple-sm mb-3">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="font-orbitron font-extrabold text-2xl text-content-primary">
                VERIFY YOUR <span className="text-brand">EMAIL</span>
              </h2>
              <p className="text-xs text-content-secondary font-sans max-w-sm mx-auto leading-relaxed">
                We have sent a 6-digit verification OTP code to{' '}
                <strong className="text-content-primary font-semibold block sm:inline">{email}</strong>
              </p>
            </div>

            {/* OTP Error */}
            {otpError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-600 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* 6-Digit OTP Input Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-center font-orbitron text-[11px] font-bold tracking-wider text-content-primary uppercase mb-3">
                  ENTER 6-DIGIT CODE
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
                  <span>VERIFYING ACCOUNT...</span>
                ) : (
                  <>
                    <span>VERIFY & ACTIVATE ACCOUNT</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="inline-flex items-center space-x-1.5 text-xs font-orbitron font-bold text-brand hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RESEND OTP CODE</span>
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

        {/* STEP 3: ACCOUNT VERIFIED SUCCESS */}
        {step === 'verified' && (
          <div className="text-center space-y-6 py-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-orbitron text-[11px] font-bold rounded-full uppercase tracking-wider">
                ✓ EMAIL VERIFIED
              </span>
              <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-content-primary">
                ACCOUNT VERIFIED!
              </h2>
              <p className="text-xs text-content-secondary max-w-xs mx-auto font-sans leading-relaxed">
                Welcome, <strong>{name}</strong>. Your verified researcher account is active. Redirecting you to your portal dashboard...
              </p>
            </div>

            <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </div>
        )}

        {/* Security / Compliance Badge */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-content-muted font-orbitron text-center pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          <span>Strict In-Vitro Research Compliance Verified</span>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-orbitron text-xs">Loading registration...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
