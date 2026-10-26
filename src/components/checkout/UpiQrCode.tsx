'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, QrCode as QrIcon, ExternalLink, ShieldCheck } from 'lucide-react';
import { generateUpiUri } from '@/lib/payment-config';

interface UpiQrCodeProps {
  upiId: string;
  merchantName: string;
  amount: number;
  orderNumber: string;
  currency?: string;
  size?: number;
  showDetails?: boolean;
}

export function UpiQrCode({
  upiId,
  merchantName,
  amount,
  orderNumber,
  currency = 'INR',
  size = 220,
  showDetails = true,
}: UpiQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const upiUri = generateUpiUri({
    upiId,
    merchantName,
    amount,
    orderNumber,
    currency,
  });

  useEffect(() => {
    let isMounted = true;
    setError(null);

    QRCode.toDataURL(upiUri, {
      width: size * 2, // 2x for retina sharpness
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate dynamic UPI QR Code:', err);
        if (isMounted) setError('Unable to render QR code dynamically.');
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri, size]);

  const copyToClipboard = (text: string, type: 'upi' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Dynamic QR Container */}
      <div className="relative p-3.5 bg-white border-2 border-emerald-500/30 rounded-3xl shadow-md hover:shadow-lg transition-all duration-200">
        <div className="relative flex items-center justify-center bg-white rounded-2xl overflow-hidden p-2">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`UPI QR code for ₹${amount.toLocaleString('en-IN')}`}
              style={{ width: size, height: size }}
              className="object-contain rounded-xl"
            />
          ) : error ? (
            <div
              style={{ width: size, height: size }}
              className="flex flex-col items-center justify-center text-xs text-accent-danger p-4 text-center"
            >
              <span>{error}</span>
            </div>
          ) : (
            <div
              style={{ width: size, height: size }}
              className="flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-orbitron text-[10px] text-content-muted">GENERATING QR...</span>
            </div>
          )}
        </div>

        {/* Center UPI Badge on QR border */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-orbitron text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center space-x-1 whitespace-nowrap">
          <ShieldCheck className="w-3 h-3 text-white" />
          <span>OFFICIAL MERCHANT UPI</span>
        </div>
      </div>

      {showDetails && (
        <div className="w-full max-w-sm space-y-3 pt-1 font-sans text-xs">
          
          {/* Payable Amount Highlight */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <div>
              <span className="font-orbitron text-[10px] font-bold text-emerald-800 uppercase block">Exact Payable Amount</span>
              <span className="font-sans text-lg font-extrabold text-emerald-700 tracking-tight">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(amount.toString(), 'amount')}
              className="flex items-center space-x-1 text-[11px] font-orbitron font-semibold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-xs transition-colors"
            >
              {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAmount ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>

          {/* UPI ID Row */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8FD] border border-brand-border">
            <div className="min-w-0 pr-2">
              <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">UPI ID / VPA</span>
              <span className="font-mono text-xs font-bold text-content-primary truncate block">{upiId}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(upiId, 'upi')}
              className="flex items-center space-x-1 text-[11px] font-orbitron font-semibold text-brand hover:text-brand-dark bg-white px-2.5 py-1 rounded-lg border border-brand-border shadow-xs transition-colors shrink-0"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>

          {/* Pay via UPI App (Mobile deep link) */}
          <div className="pt-1">
            <a
              href={upiUri}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-orbitron text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <span>PAY VIA ANY UPI APP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <p className="text-[10px] text-content-muted text-center mt-1">
              Tap above on mobile to trigger GPay, PhonePe, Paytm, or BHIM.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
