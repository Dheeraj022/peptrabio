'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode as QrIcon,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { UpiQrCode } from './UpiQrCode';
import { PaymentConfirmationForm } from './PaymentConfirmationForm';

export interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderId?: string;
  totalAmount: number;
  advanceAmount?: number;
  remainingCodAmount?: number;
  initialPaymentType?: 'partial' | 'full';
  advancePercentage?: number;
  upiId: string;
  merchantName: string;
  whatsappNumber: string;
  items?: Array<{
    id?: string;
    product_name: string;
    product_code?: string;
    quantity: number;
    unit_price?: number;
    total_price?: number;
  }>;
  existingUtr?: string | null;
  existingStatus?: string | null;
  closeButtonText?: string;
  onPaymentConfirmed?: (details: { utrNumber: string; screenshotUrl?: string }) => void;
}

export function UpiPaymentModal({
  isOpen,
  onClose,
  orderNumber,
  orderId,
  totalAmount,
  advanceAmount,
  remainingCodAmount,
  initialPaymentType = 'partial',
  advancePercentage = 10,
  upiId,
  merchantName,
  whatsappNumber,
  items,
  existingUtr = '',
  existingStatus = 'unpaid',
  closeButtonText = 'CLOSE',
  onPaymentConfirmed,
}: UpiPaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'partial' | 'full'>(initialPaymentType || 'partial');

  // Synchronize when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(initialPaymentType || 'partial');
    }
  }, [isOpen, initialPaymentType]);

  if (!isOpen) return null;

  // Calculate advance and remaining
  const calculatedAdvance = advanceAmount && advanceAmount > 0
    ? advanceAmount
    : Math.round((totalAmount * (advancePercentage || 10)) / 100);

  const calculatedRemaining = remainingCodAmount && remainingCodAmount > 0
    ? remainingCodAmount
    : Math.max(0, totalAmount - calculatedAdvance);

  const isEligibleForPartial = totalAmount > calculatedAdvance && calculatedAdvance > 0;
  const currentPayableNow = selectedPlan === 'partial' && isEligibleForPartial
    ? calculatedAdvance
    : totalAmount;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white border-2 border-brand-border rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF8FD] border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-orbitron font-extrabold text-sm sm:text-base text-content-primary">
                  COMPLETE REQUISITION PAYMENT
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-orbitron text-[10px] font-bold">
                  INSTANT UPI
                </span>
              </div>
              <p className="text-xs text-content-muted font-sans mt-0.5">
                Scan QR or tap to open UPI app • Order #{orderNumber}
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
        <div className="p-5 sm:p-7 max-h-[82vh] overflow-y-auto space-y-6">

          {/* Requisition Order Quick Meta */}
          <div className="p-4 rounded-2xl bg-surface-soft border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase">
                  Requisition ID:
                </span>
                <span className="font-mono font-bold text-brand">
                  {orderNumber}
                </span>
              </div>
              {items && items.length > 0 && (
                <p className="text-content-secondary font-sans text-[11px] line-clamp-1">
                  {items.map((i) => `${i.product_name} (×${i.quantity})`).join(', ')}
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase block">
                Total Order Value
              </span>
              <span className="font-mono font-extrabold text-base text-content-primary">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Plan Selector (Partial vs Full) */}
          {isEligibleForPartial && (
            <div className="space-y-2">
              <span className="font-orbitron text-[10px] font-bold text-content-muted uppercase tracking-wider block">
                Choose Payment Option
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 10% Advance (COD) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('partial')}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    selectedPlan === 'partial'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-brand-border bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-orbitron text-xs font-bold text-content-primary">
                      10% Advance (COD)
                    </span>
                    {selectedPlan === 'partial' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="font-mono text-base font-extrabold text-emerald-700">
                    ₹{calculatedAdvance.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-content-muted mt-1 font-sans leading-tight">
                    Pay ₹{calculatedAdvance.toLocaleString('en-IN')} now. Remaining ₹{calculatedRemaining.toLocaleString('en-IN')} upon FedEx delivery.
                  </p>
                </button>

                {/* 100% Full Payment */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('full')}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    selectedPlan === 'full'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-brand-border bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-orbitron text-xs font-bold text-content-primary">
                      Full Payment (100%)
                    </span>
                    {selectedPlan === 'full' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="font-mono text-base font-extrabold text-emerald-700">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-content-muted mt-1 font-sans leading-tight">
                    Pay full amount online for contactless delivery & prioritized laboratory cold-chain dispatch.
                  </p>
                </button>
              </div>
            </div>
          )}
          
          {/* Dynamic QR Code Section */}
          <div className="bg-[#FAF8FD] p-6 rounded-3xl border border-brand-border flex flex-col items-center">
            <UpiQrCode
              upiId={upiId}
              merchantName={merchantName}
              amount={currentPayableNow}
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
            paymentType={selectedPlan}
            amountToPay={currentPayableNow}
            totalOrderAmount={totalAmount}
            whatsappNumber={whatsappNumber}
            existingUtr={existingUtr || ''}
            existingStatus={existingStatus || 'unpaid'}
            alreadyConfirmed={existingStatus === 'awaiting_verification'}
            onSuccess={onPaymentConfirmed}
          />

        </div>

        {/* Modal Footer */}
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
            {closeButtonText}
          </button>
        </div>

      </div>
    </div>
  );
}
