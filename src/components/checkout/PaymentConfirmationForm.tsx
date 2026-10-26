'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileCheck,
  MessageSquare,
  Lock,
  ArrowRight,
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { generateWhatsAppPaymentLink } from '@/lib/payment-config';

interface PaymentConfirmationFormProps {
  orderId?: string;
  orderNumber: string;
  paymentType: 'partial' | 'full';
  amountToPay: number;
  totalOrderAmount: number;
  whatsappNumber: string;
  onSuccess?: (details: { utrNumber: string; screenshotUrl?: string }) => void;
  alreadyConfirmed?: boolean;
  existingUtr?: string;
  existingStatus?: string;
}

export function PaymentConfirmationForm({
  orderId,
  orderNumber,
  paymentType,
  amountToPay,
  totalOrderAmount,
  whatsappNumber,
  onSuccess,
  alreadyConfirmed = false,
  existingUtr = '',
  existingStatus = 'awaiting_verification',
}: PaymentConfirmationFormProps) {
  const [utrNumber, setUtrNumber] = useState<string>(existingUtr);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(alreadyConfirmed);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 5MB limit. Please choose a smaller image.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Invalid file format. Please upload JPG, PNG, or WebP screenshot.');
      return;
    }

    setScreenshotFile(file);
    const localUrl = URL.createObjectURL(file);
    setScreenshotPreview(localUrl);

    // Auto-upload screenshot to get URL
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      formData.append('orderNumber', orderNumber);

      const res = await fetch('/api/payment/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setScreenshotUrl(data.url);
        }
      }
    } catch (err) {
      console.warn('Screenshot upload fallback:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setErrorMsg('Please enter your 12-digit UPI Reference / UTR Number.');
      return;
    }

    if (cleanUtr.length < 6) {
      setErrorMsg('Please enter a valid UPI transaction reference (minimum 6 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderNumber,
          paymentType,
          utrNumber: cleanUtr,
          screenshotUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment confirmation.');
      }

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess({ utrNumber: cleanUtr, screenshotUrl: screenshotUrl || undefined });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording payment confirmation.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappUrl = generateWhatsAppPaymentLink({
    whatsappNumber,
    orderNumber,
    paymentType,
    amountPaid: amountToPay,
    utr: utrNumber.trim() || undefined,
  });

  return (
    <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* 5-Step Instructions */}
      <div className="bg-[#FAF8FD] rounded-2xl p-4 sm:p-5 border border-brand-border space-y-3">
        <div className="flex items-center space-x-2 text-emerald-800 font-orbitron font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PAYMENT & VERIFICATION INSTRUCTIONS</span>
        </div>

        <ol className="text-xs font-sans text-content-secondary space-y-2 list-none pl-0">
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Scan the QR code using your preferred UPI app (GPay, PhonePe, Paytm, BHIM, etc.).</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Complete the payment for the exact amount displayed: <strong className="text-emerald-700 font-mono">₹{amountToPay.toLocaleString('en-IN')}</strong>.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Take a screenshot of the successful payment confirmation with the 12-digit UTR/Reference ID.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
            <span>Send your payment screenshot to our official WhatsApp number using the button below.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">5</span>
            <span>Our team will verify your payment within <strong>6–12 hours</strong> and update your order.</span>
          </li>
        </ol>
      </div>

      {/* Verification Pending Banner if already submitted */}
      {isSuccess ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-4 animate-in fade-in">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-orbitron font-bold text-sm text-emerald-900">
                PAYMENT CONFIRMATION RECEIVED
              </h4>
              <p className="text-xs text-emerald-800 font-sans leading-relaxed">
                Payment verification is pending. Our team will verify your payment within 6–12 hours. Your order payment status will be updated after verification.
              </p>
              {utrNumber && (
                <div className="pt-1 text-xs font-mono text-emerald-900">
                  Logged UTR / Ref: <strong>{utrNumber}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Prominent WhatsApp Submission Button */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-orbitron text-xs sm:text-sm font-bold rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.01]"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>SEND PAYMENT SCREENSHOT ON WHATSAPP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <p className="text-[11px] text-content-muted text-center mt-2 font-sans">
              Note: Please attach your payment screenshot manually in WhatsApp after opening the chat.
            </p>
          </div>
        </div>
      ) : (
        /* Payment Confirmation Form */
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          
          <div className="border-b border-brand-border pb-3">
            <h3 className="font-orbitron font-bold text-sm text-content-primary">
              SUBMIT PAYMENT CONFIRMATION
            </h3>
            <p className="text-[11px] text-content-muted font-sans mt-0.5">
              Enter your UPI transaction reference to link payment with your order.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-accent-danger/10 border border-accent-danger/30 text-accent-danger flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Read-only Order Number */}
            <div>
              <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                ORDER REFERENCE ID (READ-ONLY)
              </label>
              <input
                type="text"
                readOnly
                value={orderNumber}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-gray-50 text-content-secondary font-mono text-xs cursor-not-allowed select-all"
              />
            </div>

            {/* Read-only Amount Paid */}
            <div>
              <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                AMOUNT PAYABLE ({paymentType.toUpperCase()} PAYMENT)
              </label>
              <input
                type="text"
                readOnly
                value={`₹${amountToPay.toLocaleString('en-IN')}`}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-gray-50 text-emerald-700 font-mono font-bold text-xs cursor-not-allowed"
              />
            </div>

            {/* UPI Reference / UTR Number (REQUIRED) */}
            <div className="sm:col-span-2">
              <label className="block text-content-primary font-orbitron text-[10px] font-bold mb-1">
                UPI TRANSACTION / UTR REFERENCE ID <span className="text-accent-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 428192039102 (from GPay / PhonePe / Paytm receipt)"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand font-mono text-xs"
              />
              <span className="text-[10px] text-content-muted font-sans mt-0.5 block">
                Find this 12-digit number in your UPI app payment receipt labeled 'UTR', 'UPI Ref ID', or 'Transaction ID'.
              </span>
            </div>

            {/* Optional Screenshot Upload */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-content-primary font-orbitron text-[10px] font-bold">
                PAYMENT CONFIRMATION SCREENSHOT (OPTIONAL)
              </label>

              {screenshotPreview ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-300">
                  <div className="flex items-center space-x-3 truncate">
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot"
                      className="w-12 h-12 object-cover rounded-lg border border-emerald-300 shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-emerald-950 block text-xs truncate">
                        {screenshotFile?.name || 'Screenshot attached'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-sans">
                        {uploading ? 'Uploading to secure verification vault...' : 'Ready for verification submission'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="p-1 text-content-muted hover:text-accent-danger rounded-lg transition-colors ml-2"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-brand-border hover:border-emerald-500 bg-[#FAF8FD] cursor-pointer transition-colors group">
                  <Upload className="w-6 h-6 text-brand group-hover:text-emerald-600 transition-colors mb-1" />
                  <span className="font-orbitron text-xs font-semibold text-content-primary">
                    Click to attach payment screenshot
                  </span>
                  <span className="text-[10px] text-content-muted font-sans mt-0.5">
                    JPG, PNG, or WebP up to 5MB (or send directly on WhatsApp)
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting || uploading}
              className={`flex-1 py-3.5 px-6 rounded-full font-orbitron text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all ${
                submitting || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01]'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{submitting ? 'RECORDING CONFIRMATION...' : 'CONFIRM UPI PAYMENT'}</span>
            </button>

            {/* Direct WhatsApp Option */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-orbitron text-xs font-bold flex items-center justify-center space-x-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>SEND ON WHATSAPP</span>
            </a>
          </div>

        </form>
      )}

    </div>
  );
}
