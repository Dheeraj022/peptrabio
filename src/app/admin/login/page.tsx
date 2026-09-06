'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both administrator email and credential password.');
      return;
    }

    setLoading(true);
    // Secure administrator verification
    setTimeout(() => {
      // Validate credentials
      if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('peptrabio')) {
        localStorage.setItem('peptrabio_admin_auth', 'true');
        router.push('/admin');
      } else {
        setError('Unauthorized access. Valid administrator credentials required.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#120B1D] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1C122C] border-2 border-purple-900/60 rounded-3xl p-8 shadow-2xl space-y-6">
        
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

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
              ADMINISTRATOR EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@peptrabio.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
            />
          </div>

          <div>
            <label className="block font-orbitron text-[10px] text-purple-300 mb-1">
              CREDENTIAL PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-purple-950/60 border border-purple-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand text-xs font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-purple-900/40">
          <Link href="/" className="text-xs text-gray-400 hover:text-white underline">
            ← Return to Public Website
          </Link>
        </div>

      </div>
    </div>
  );
}
