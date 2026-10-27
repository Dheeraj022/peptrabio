'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  User,
  Mail,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  authenticateAdminAsync,
  createAdminProfileAsync,
  resetAdminPasswordAsync
} from '@/lib/admin-store';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'create' | 'forgot'>('signin');

  // Sign in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Create Admin Profile state
  const [fullName, setFullName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPasskey, setForgotPasskey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password) {
      setError('Please enter both administrator email and credential password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authenticateAdminAsync(email.trim(), password);
      if (res.success) {
        setSuccess('Authentication verified with Supabase Auth. Redirecting to admin dashboard...');
        setTimeout(() => {
          router.push('/admin');
        }, 500);
      } else {
        setError(res.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim()) {
      setError('Please enter your full administrator name.');
      return;
    }

    if (!createEmail.trim()) {
      setError('Please enter an administrator email address.');
      return;
    }

    if (createPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (createPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (!passkey.trim()) {
      setError('Secret Admin Passkey is required to create an admin profile.');
      return;
    }

    setLoading(true);
    try {
      const res = await createAdminProfileAsync({
        name: fullName.trim(),
        email: createEmail.trim(),
        password: createPassword,
        passkey: passkey.trim(),
        role: 'Administrator'
      });

      if (res.success && res.user) {
        setSuccess(`Administrator account created in Supabase Authentication (User UUID: ${res.user.id.slice(0, 8)}...). Redirecting to dashboard...`);
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      } else {
        setError(res.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during administrator registration.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!forgotEmail.trim()) {
      setError('Please enter your administrator email address.');
      return;
    }

    if (!forgotPasskey.trim()) {
      setError('Secret Authorization Passkey is required to reset administrator password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password confirmation does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetAdminPasswordAsync(forgotEmail.trim(), forgotPasskey.trim(), newPassword);
      if (res.success) {
        setSuccess(res.message);
        setEmail(forgotEmail);
        setPassword('');
        setForgotEmail('');
        setForgotPasskey('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          setMode('signin');
          setSuccess('Password reset successfully in Supabase Auth. Please sign in with your new credentials.');
        }, 1200);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120B1D] text-white flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-[#1C122C] border-2 border-purple-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="relative w-28 h-20 mx-auto mb-1 bg-white p-1 rounded-2xl shadow-lg">
            <Image
              src="/images/logo.png"
              alt="Peptra Bio"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl tracking-wider">
            PEPTRA<span className="text-purple-400">ADMIN</span>
          </h1>
          <p className="text-xs text-gray-400 font-sans">
            Authorized Personnel Portal for Catalog & Order Management
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Create Admin */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-purple-950/80 rounded-2xl border border-purple-900/60">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
                setSuccess(null);
              }}
              className={`py-2.5 px-3 rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'signin'
                  ? 'bg-brand text-white shadow-purple-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('create');
                setError(null);
                setSuccess(null);
              }}
              className={`py-2.5 px-3 rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'create'
                  ? 'bg-brand text-white shadow-purple-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>CREATE PROFILE</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                ADMINISTRATOR EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-orbitron text-[10px] text-purple-300">
                  CREDENTIAL PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotEmail(email);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-[10px] text-purple-400 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('create');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs text-purple-300 hover:text-white transition-colors"
              >
                Need a new administrator profile? <strong className="underline text-purple-200">Create Profile</strong>
              </button>
            </div>
          </form>
        )}

        {/* CREATE ADMIN PROFILE FORM */}
        {mode === 'create' && (
          <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                FULL NAME & TITLE
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Alex Rivera"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                ADMINISTRATOR EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
              <div>
                <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                  CONFIRM
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>

            {/* SECRET PASSKEY */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/90 to-purple-900/60 border border-purple-600/80 shadow-inner space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-orbitron font-bold text-[10px] text-purple-200 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-accent-warning animate-pulse" />
                  <span>SECRET AUTHORIZATION PASSKEY</span>
                </label>
                <span className="font-mono text-[9px] bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700">
                  REQUIRED
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPasskey ? "text" : "password"}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter Secret Passkey (RGAM26)"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-purple-950 border border-purple-500 text-white placeholder-purple-400 font-mono text-xs tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white p-1"
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-purple-300/80 font-sans">
                Enter the confidential authorization passkey issued to administrators.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-60 mt-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'CREATING PROFILE...' : 'CREATE ADMIN PROFILE & ENTER'}</span>
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs font-sans">
            <div className="flex items-center space-x-2 border-b border-purple-900/60 pb-3">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-orbitron font-bold text-sm text-white">RESET ADMIN PASSWORD</h3>
                <p className="text-[11px] text-gray-400">Passkey verification required for security</p>
              </div>
            </div>

            <div>
              <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                ADMINISTRATOR EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@peptrabio.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>

            {/* SECRET PASSKEY */}
            <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-600/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-orbitron font-bold text-[10px] text-purple-200 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-accent-warning animate-pulse" />
                  <span>AUTHORIZATION PASSKEY</span>
                </label>
                <span className="font-mono text-[9px] bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700">
                  REQUIRED
                </span>
              </div>
              <input
                type="password"
                value={forgotPasskey}
                onChange={(e) => setForgotPasskey(e.target.value)}
                placeholder="Enter Secret Passkey"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-purple-950 border border-purple-500 text-white placeholder-purple-400 font-mono text-xs tracking-widest focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
              <div>
                <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
                  CONFIRM NEW
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-60 mt-1"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'RESETTING PASSWORD...' : 'RESET ADMIN PASSWORD'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs text-purple-300 hover:text-white transition-colors"
              >
                Remembered your password? <strong className="underline text-purple-200">Sign In</strong>
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-purple-900/40">
          <Link href="/" className="text-xs text-gray-400 hover:text-white underline">
            ← Return to Public Website
          </Link>
        </div>

      </div>
    </div>
  );
}
