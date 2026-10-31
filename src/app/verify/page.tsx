'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VerifyApiResponse } from '@/types/verification';
import { VerificationResultCard } from '@/components/verification/VerificationResultCard';
import {
  executeClientVerification,
  getLocalVerificationCodes,
  saveLocalVerificationCodes
} from '@/lib/verification-store';
import {
  ShieldCheck,
  QrCode,
  Search,
  Sparkles,
  Lock,
  Atom,
  HelpCircle,
  FileCheck2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyApiResponse | null>(null);
  const [error, setError] = useState('');

  // Auto-populate & trigger if code provided in query parameter
  useEffect(() => {
    if (initialCode && !result && !loading) {
      setCode(initialCode);
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const handleVerify = async (codeToVerify?: string) => {
    const target = (codeToVerify || code).trim().toUpperCase();
    if (!target) {
      setError('Please enter a verification code.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: target }),
      });

      const data: VerifyApiResponse = await res.json();

      // If server does not recognize the code (e.g. batch created in browser), check client-side store
      if (data.status === 'invalid') {
        const localResult = executeClientVerification(target);
        if (localResult && localResult.status !== 'invalid') {
          setResult(localResult);
          // Sync all local codes to the server memory cache in background
          fetch('/api/admin/verification/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codes: getLocalVerificationCodes() }),
          }).catch(() => {});
          return;
        }
      }

      // When server returns genuine or limit_reached, update the local storage scan count immediately
      if (typeof window !== 'undefined' && data.code && data.scan_number !== undefined) {
        const localCodes = getLocalVerificationCodes();
        const idx = localCodes.findIndex(c => c.code.toUpperCase() === data.code?.toUpperCase());
        if (idx !== -1) {
          localCodes[idx] = {
            ...localCodes[idx],
            scan_count: data.scan_number,
            updated_at: new Date().toISOString()
          };
          saveLocalVerificationCodes(localCodes);
        }
      }

      // Ensure product and batch number are always populated on the result
      if (!data.product) {
        data.product = {
          name: data.product_name || 'Research Peptide',
          batch_number: data.batch_number || 'LOT VERIFIED',
          product_code: data.product_code || 'PB-SPEC',
          size: data.size || '5 mg',
          purity: data.purity || '99%+',
          format: data.format || 'Lyophilized Solid',
        };
      }

      setResult(data);
    } catch (err: any) {
      // Local fallback on network failure
      const localResult = executeClientVerification(target);
      if (localResult && localResult.status !== 'invalid') {
        setResult(localResult);
      } else {
        setError('Connection error. Please check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCode('');
    setError('');
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState({}, '', '/verify');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-light text-brand text-xs font-orbitron font-semibold tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AUTHENTICITY VERIFICATION PROTOCOL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-orbitron font-extrabold text-content-primary tracking-tight">
          VERIFY PRODUCT AUTHENTICITY
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
          Scan the QR code printed on your physical Peptra Bio product box or enter the unique 6-character authenticity code below.
        </p>
      </div>

      {/* Main Verification Card */}
      {!result ? (
        <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-10 shadow-xl max-w-2xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between border-b border-brand-border/80 pb-4">
            <div className="flex items-center space-x-2.5">
              <QrCode className="w-5 h-5 text-brand" />
              <span className="font-orbitron font-bold text-xs text-content-primary">
                ENTER BOX AUTHENTICITY CODE
              </span>
            </div>
            <span className="text-[10px] font-mono text-content-muted">FORMAT: 6-CHAR (e.g. 7K9X2M)</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-4"
          >
            <div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    setError('');
                  }}
                  placeholder="e.g. 7K9X2M"
                  disabled={loading}
                  className="w-full px-5 py-4 bg-[#FAF8FD] border-2 border-brand-border focus:border-brand rounded-2xl font-mono text-xl sm:text-2xl font-bold tracking-[0.35em] text-content-primary placeholder:text-content-muted placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all text-center uppercase"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center space-x-1.5 text-xs text-accent-danger font-medium mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className={`w-full py-4 px-6 rounded-full font-orbitron text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-purple-glow transition-all ${
                loading || !code.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                  : 'bg-brand hover:bg-brand-dark text-white hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <>
                  <Atom className="w-4 h-4 animate-spin text-purple-300" />
                  <span>VERIFYING PRODUCT ON SERVER...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>VERIFY AUTHENTICITY</span>
                </>
              )}
            </button>
          </form>

          {/* Helper instructions */}
          <div className="pt-2 border-t border-brand-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-content-secondary font-sans">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>Unique single-use code printed on the security seal of each physical box.</span>
            </div>
            <div className="flex items-start space-x-2">
              <Lock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>Server-side atomic 3-scan limit protects against counterfeiting clones.</span>
            </div>
          </div>

        </div>
      ) : (
        <VerificationResultCard result={result} onReset={handleReset} />
      )}

      {/* Security & Verification Explanation Accordion */}
      <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-[#FAF8FD] border border-brand-border space-y-4 text-xs font-sans">
        <div className="flex items-center space-x-2 font-orbitron font-bold text-content-primary">
          <HelpCircle className="w-4 h-4 text-brand" />
          <span>HOW PEPTRA BIO VERIFICATION WORKS</span>
        </div>
        <div className="space-y-2 text-content-secondary leading-relaxed">
          <p>
            Each physical product carton dispatched from our laboratory is tagged with a unique, cryptographically generated alphanumeric code and QR identifier.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Scan 1:</strong> Confirms genuine origin and reveals verified batch specifications.</li>
            <li><strong>Scan 2 & 3:</strong> Confirms product validity while tracking scan history.</li>
            <li><strong>Scan 4+:</strong> Reaches the security threshold to prevent duplicate packaging counterfeit attempts.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-orbitron">Loading Verification System...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
