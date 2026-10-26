'use client';

import React from 'react';
import { X, ShieldCheck, Lock, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import { UpiQrCode } from './UpiQrCode';
import { PaymentConfirmationForm } from './PaymentConfirmationForm';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderId?: string;
  totalAmount: number;
  upiId: string;
  merchantName: string;
  whatsappNumber: string;
  onPaymentConfirmed?: (details: { utrNumber: string; screenshotUrl?: string }) => void;
}

export function UpiPaymentModal({
  isOpen,
  onClose,
  orderNumber,
  orderId,
  totalAmount,
  upiId,
  merchantName,
  whatsappNumber,
  onPaymentConfirmed,
}: UpiPaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-2 border-brand-border rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF8FD] border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-orbitron font-extrabold text-sm sm:text-base text-content-primary">
                  COMPLETE ONLINE UPI PAYMENT
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-orbitron text-[10px] font-bold">
                  100% ONLINE
                </span>
              </div>
              <p className="text-xs text-content-muted font-sans mt-0.5">
                Scan QR or tap to open UPI app. Requisition Order #{orderNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-content-muted hover:text-content-primary hover:bg-brand-light transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Dynamic QR Code Section */}
          <div className="bg-[#FAF8FD] p-6 rounded-3xl border border-brand-border flex flex-col items-center">
            <UpiQrCode
              upiId={upiId}
              merchantName={merchantName}
              amount={totalAmount}
              orderNumber={orderNumber}
              currency="INR"
              size={240}
              showDetails={true}
            />
          </div>

          {/* Payment Confirmation & WhatsApp Screenshot Submission */}
          <PaymentConfirmationForm
            orderId={orderId}
            orderNumber={orderNumber}
            paymentType="full"
            amountToPay={totalAmount}
            totalOrderAmount={totalAmount}
            whatsappNumber={whatsappNumber}
            onSuccess={onPaymentConfirmed}
          />

        </div>

        {/* Modal Footer with Close Button */}
        <div className="p-4 bg-gray-50 border-t border-brand-border flex items-center justify-between text-xs font-sans">
          <div className="flex items-center text-content-muted text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
            <span>256-Bit SSL Encrypted Requisition</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-brand-border hover:bg-gray-100 text-content-primary font-orbitron text-xs font-semibold transition-colors"
          >
            RETURN TO CHECKOUT
          </button>
        </div>

      </div>
    </div>
  );
}
