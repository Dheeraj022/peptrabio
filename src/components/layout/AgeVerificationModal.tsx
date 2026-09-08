'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'peptra_age_verified';
const EXPIRY_KEY = 'peptra_age_verified_expiry';

export function AgeVerificationModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [denied, setDenied] = useState(false);
  const [errorHighlight, setErrorHighlight] = useState(false);

  // Exempt Terms & Conditions and all policy pages so visitors can review terms and policies freely
  const isExemptPage = pathname?.startsWith('/policies');

  useEffect(() => {
    try {
      // Check localStorage first
      const verifiedLocal = localStorage.getItem(STORAGE_KEY);
      const expiry = localStorage.getItem(EXPIRY_KEY);

      if (verifiedLocal === 'true') {
        if (expiry) {
          const expiryTime = parseInt(expiry, 10);
          if (Date.now() < expiryTime) {
            // Still valid within 30 days
            return;
          } else {
            // Expired, clear and prompt again
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(EXPIRY_KEY);
          }
        } else {
          return;
        }
      }

      // Check sessionStorage
      const verifiedSession = sessionStorage.getItem(STORAGE_KEY);
      if (verifiedSession === 'true') {
        return;
      }

      // If not verified, open the modal
      setIsOpen(true);
    } catch {
      // If storage access is restricted, show modal
      setIsOpen(true);
    }
  }, []);

  // Prevent background scrolling while modal is open (unless on an exempt page)
  useEffect(() => {
    if (isOpen && !isExemptPage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isExemptPage]);

  const handleConfirmYes = () => {
    if (!isAgreed) {
      setErrorHighlight(true);
      setTimeout(() => setErrorHighlight(false), 1500);
      return;
    }

    try {
      if (rememberMe) {
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const expiryTime = Date.now() + thirtyDaysInMs;
        localStorage.setItem(STORAGE_KEY, 'true');
        localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
      } else {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch {
      // Ignore storage errors
    }

    setIsOpen(false);
  };

  const handleConfirmNo = () => {
    setDenied(true);
  };

  const handleLeaveSite = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen || isExemptPage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-backdrop-fade">
      {/* Modal Container with Purple Neon Glow */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl border-2 border-[#8B34EA]/60 shadow-[0_0_60px_rgba(103,44,174,0.45)] overflow-hidden">
        
        {/* Subtle Ambient Background Wash & Technical Grid */}
        <div className="absolute inset-0 bg-tech-grid-dense opacity-80 pointer-events-none" />
        <div className="absolute -left-20 top-1/4 w-52 h-52 bg-[#8B34EA]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 bottom-1/4 w-52 h-52 bg-[#672CAE]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 flex flex-col items-center text-center">
          {!denied ? (
            <>
              {/* Brand Logo & Tagline */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-48 sm:w-56 h-20 sm:h-24 mb-1">
                  <Image
                    src="/images/logo.png"
                    alt="PEPTRA BIO"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl font-extrabold font-orbitron text-[#672CAE] tracking-tight mb-2">
                Age Verification
              </h2>

              {/* Subtitle */}
              <p className="font-orbitron text-base sm:text-lg font-medium text-content-primary mb-7 tracking-wide">
                Are you over 18 years of age?
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-xs mb-8">
                {/* No Button */}
                <button
                  type="button"
                  onClick={handleConfirmNo}
                  className="flex-1 py-3 px-6 rounded-xl bg-[#672CAE] hover:bg-[#57239A] text-white font-orbitron font-bold text-sm tracking-wider shadow-md hover:shadow-purple-sm transition-all duration-200 active:scale-95"
                >
                  No
                </button>

                {/* Yes Button */}
                <button
                  type="button"
                  onClick={handleConfirmYes}
                  className={`flex-1 py-3 px-6 rounded-xl font-orbitron font-bold text-sm tracking-wider transition-all duration-200 ${
                    isAgreed
                      ? 'bg-gradient-to-r from-[#672CAE] to-[#8B34EA] hover:from-[#57239A] hover:to-[#7828D4] text-white shadow-md hover:shadow-purple-sm active:scale-95 cursor-pointer'
                      : 'bg-[#EAEBED] text-[#A0A5B1] hover:bg-[#E2E4E8] cursor-pointer'
                  }`}
                >
                  Yes
                </button>
              </div>

              {/* Checkboxes Section */}
              <div className="w-full text-left space-y-4 pt-2 border-t border-brand-border/60">
                {/* Agreement Checkbox */}
                <label
                  className={`flex items-start gap-3.5 cursor-pointer select-none group p-2 rounded-xl transition-all ${
                    errorHighlight ? 'bg-red-50 ring-2 ring-accent-danger/50' : 'hover:bg-brand-subtle/70'
                  }`}
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isAgreed}
                    onClick={() => setIsAgreed(!isAgreed)}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                      isAgreed
                        ? 'bg-[#672CAE] border-[#672CAE] text-white shadow-sm'
                        : errorHighlight
                        ? 'border-accent-danger bg-white ring-2 ring-accent-danger/30'
                        : 'border-[#CBD2E0] bg-white group-hover:border-[#672CAE]'
                    }`}
                  >
                    {isAgreed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-xs sm:text-[13px] leading-relaxed text-content-secondary">
                    I confirm that I am 18+ years of age, have read and agree to the{' '}
                    <Link
                      href="/policies/terms"
                      target="_blank"
                      className="text-[#D97706] hover:text-[#B45309] font-medium underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms & Conditions
                    </Link>{' '}
                    and acknowledge that products are for research use only.
                  </span>
                </label>

                {/* Remember Me Checkbox */}
                <label className="flex items-center gap-3.5 cursor-pointer select-none group p-2 rounded-xl hover:bg-brand-subtle/70 transition-all">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={rememberMe}
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                      rememberMe
                        ? 'bg-[#1E1E24] border-[#1E1E24] text-white shadow-sm'
                        : 'border-[#CBD2E0] bg-white group-hover:border-[#1E1E24]'
                    }`}
                  >
                    {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <span className="text-xs sm:text-[13px] font-orbitron font-medium text-content-primary">
                    Remember me for 30 days
                  </span>
                </label>

                {errorHighlight && (
                  <div className="flex items-center gap-2 text-xs text-accent-danger font-medium animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Please confirm that you are 18+ and agree to the Terms & Conditions.</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Access Denied Refusal View */
            <div className="py-6 flex flex-col items-center text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-accent-danger mb-4 shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-orbitron font-bold text-content-primary mb-2">
                Access Restricted
              </h3>

              <p className="text-xs sm:text-sm text-content-secondary max-w-md mb-6 leading-relaxed">
                You must be at least 18 years of age to view this site and purchase laboratory research materials. All compounds are strictly synthesized for in-vitro research and laboratory investigation.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                <button
                  type="button"
                  onClick={handleLeaveSite}
                  className="w-full py-3 px-5 rounded-xl bg-accent-danger hover:bg-red-700 text-white font-orbitron font-bold text-xs tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Leave Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDenied(false)}
                  className="w-full py-3 px-5 rounded-xl border border-brand-border hover:bg-brand-subtle text-content-secondary font-orbitron font-semibold text-xs transition-all"
                >
                  I made a mistake
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
