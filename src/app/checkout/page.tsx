'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { createNewOrder } from '@/lib/products-store';
import { Order, OrderItem, PaymentType } from '@/types';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Building,
  FileCheck2,
  Check,
  QrCode as QrIcon,
  Truck,
  MessageSquare,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import {
  calculatePaymentBreakdown,
  generateWhatsAppPaymentLink,
  getPaymentStatusBadge
} from '@/lib/payment-config';
import { UpiQrCode } from '@/components/checkout/UpiQrCode';
import { PaymentConfirmationForm } from '@/components/checkout/PaymentConfirmationForm';
import { UpiPaymentModal } from '@/components/checkout/UpiPaymentModal';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { formatPrice, convertPrice, currency } = useCurrency();
  const { user, isLoading } = useAuth();

  // Payment configuration loaded dynamically
  const [paymentConfig, setPaymentConfig] = useState({
    upiId: 'peptrabio@icici',
    upiMerchantName: 'Peptra Bio Labs',
    advancePercentage: 10,
    whatsappSupportNumber: '919876543210',
    currency: 'INR',
  });

  // Load payment config from server
  useEffect(() => {
    fetch('/api/payment/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.config) {
          setPaymentConfig(data.config);
        }
      })
      .catch((err) => console.warn('Payment config fetch fallback:', err));
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    sameBilling: true,
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'India',
    notes: '',
  });

  // Pre-fill user details from authenticated account
  useEffect(() => {
    if (user) {
      setFormData((prev) => {
        const parts = (user.name || '').trim().split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        return {
          ...prev,
          email: prev.email || user.email || '',
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastName,
          phone: prev.phone || user.phone || '',
        };
      });
    }
  }, [user]);

  // Two payment options: 'partial' (10% Advance + COD) or 'full' (100% Online UPI)
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentType>('partial');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [expandedPaymentDetails, setExpandedPaymentDetails] = useState<boolean>(true);

  // UTR / Screenshot state in checkout form
  const [checkoutUtr, setCheckoutUtr] = useState<string>('');
  const [checkoutScreenshotUrl, setCheckoutScreenshotUrl] = useState<string>('');

  const [complianceAcknowledged, setComplianceAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Standard shipping cost
  const shippingCost = 15.00;
  const rawGrandTotalUSD = subtotal + shippingCost;

  // Convert to INR for UPI transactions (or local currency)
  const grandTotalINR = currency === 'INR' ? convertPrice(rawGrandTotalUSD) : Math.round(rawGrandTotalUSD * 86.5);

  // Authoritative payment calculation (e.g. 10% advance on ₹8,999 = ₹900, COD = ₹8,099)
  const breakdown = calculatePaymentBreakdown(grandTotalINR, paymentConfig.advancePercentage);
  const currentPayableNow = selectedPaymentOption === 'partial' ? breakdown.advanceAmount : breakdown.totalAmount;
  const currentRemainingCod = selectedPaymentOption === 'partial' ? breakdown.remainingCodAmount : 0;

  // Generate temporary order reference number for UPI QR before submit
  const [tempOrderNumber] = useState<string>(() => 'PB-ORD-' + Math.floor(10000 + Math.random() * 90000));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('You must be signed in to your account to place an order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!complianceAcknowledged) {
      setErrorMsg('You must agree to the Research Use Only compliance acknowledgment to proceed.');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.street || !formData.city || !formData.postalCode) {
      setErrorMsg('Please complete all required customer and delivery address fields.');
      return;
    }

    setSubmitting(true);

    try {
      const orderItems: OrderItem[] = cart.map((item) => ({
        id: 'item-' + Math.random().toString(36).substring(2, 9),
        order_id: '',
        product_id: item.product.id,
        product_name: item.product.name,
        product_code: item.product.product_code,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const shippingAddress = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.company,
        street: formData.street,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
      };

      const billingAddress = formData.sameBilling
        ? shippingAddress
        : {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company,
            street: formData.billingStreet || formData.street,
            apartment: '',
            city: formData.billingCity || formData.city,
            state: formData.billingState || formData.state,
            postal_code: formData.billingPostalCode || formData.postalCode,
            country: formData.billingCountry || formData.country,
          };

      // Payment Status: if UTR is already provided, mark 'awaiting_verification', else 'unpaid'
      const initialPaymentStatus = checkoutUtr.trim() ? 'awaiting_verification' : 'unpaid';

      const newOrder = await createNewOrder({
        user_id: user.id,
        order_number: tempOrderNumber,
        status: 'pending',
        payment_status: initialPaymentStatus,
        payment_method: selectedPaymentOption === 'partial' ? 'partial_cod' : 'full_online',
        payment_type: selectedPaymentOption,
        advance_percentage: paymentConfig.advancePercentage,
        advance_amount: currentPayableNow,
        remaining_cod_amount: currentRemainingCod,
        utr_number: checkoutUtr.trim() || undefined,
        screenshot_url: checkoutScreenshotUrl || undefined,
        currency: 'INR',
        subtotal,
        shipping: shippingCost,
        tax: 0,
        total: grandTotalINR,
        customer_email: formData.email || user.email,
        customer_name: `${formData.firstName} ${formData.lastName}`.trim() || user.name,
        customer_phone: formData.phone || user.phone,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        compliance_acknowledged: true,
        notes: formData.notes,
        items: orderItems,
      });

      setCompletedOrder(newOrder);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing order requisition.');
    } finally {
      setSubmitting(false);
    }
  };

  // AUTH LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-orbitron text-xs text-content-secondary flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span>VERIFYING ACCOUNT SESSION...</span>
        </div>
      </div>
    );
  }

  // MANDATORY USER LOGIN BARRIER
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-white border-2 border-brand-border rounded-3xl p-8 sm:p-12 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto shadow-purple-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-brand-light text-brand font-orbitron text-xs font-bold tracking-wider">
              ACCOUNT LOGIN REQUIRED
            </span>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
              SIGN IN TO PLACE ORDER
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary font-sans max-w-md mx-auto leading-relaxed">
              You must have an account and be logged in to order research materials, track shipment milestones, and manage order history.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login?redirect=/checkout"
              className="px-8 py-3.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all"
            >
              SIGN IN TO CHECKOUT
            </Link>
            <Link
              href="/register?redirect=/checkout"
              className="px-8 py-3.5 bg-white border border-brand-border text-brand hover:bg-brand-light font-orbitron text-xs font-semibold rounded-full transition-all"
            >
              CREATE AN ACCOUNT
            </Link>
          </div>

          <div className="pt-2">
            <Link href="/cart" className="text-xs text-content-muted hover:text-brand hover:underline font-orbitron">
              ← RETURN TO CART
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUCCESS / POST-ORDER INVOICE SCREEN (Inspired by clean invoice layout)
  // =========================================================================
  if (completedOrder) {
    const paymentBadge = getPaymentStatusBadge(completedOrder.payment_status);
    const invoiceWhatsappUrl = generateWhatsAppPaymentLink({
      whatsappNumber: paymentConfig.whatsappSupportNumber,
      orderNumber: completedOrder.order_number,
      paymentType: completedOrder.payment_type || 'partial',
      amountPaid: completedOrder.advance_amount || 0,
      utr: completedOrder.utr_number,
    });

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
        
        {/* Invoice Card */}
        <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          
          {/* Top Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-brand-light text-brand font-orbitron text-[11px] font-bold tracking-wider">
                OFFICIAL ORDER INVOICE & REQUISITION RECEIPT
              </span>
              <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
                ORDER #{completedOrder.order_number}
              </h1>
              <div className="text-xs text-content-muted font-sans flex items-center space-x-3">
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Order Date: {new Date(completedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>•</span>
                <span>Currency: INR (₹)</span>
              </div>
            </div>

            {/* Payment Status Pill */}
            <div className="text-left sm:text-right space-y-1">
              <span className="font-orbitron text-[10px] text-content-muted uppercase block">Payment Verification Status</span>
              <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-orbitron font-bold uppercase ${paymentBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${paymentBadge.dot}`} />
                <span>{paymentBadge.label}</span>
              </div>
            </div>
          </div>

          {/* Payment Verification Notice Alert */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-sans leading-relaxed flex items-start space-x-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-orbitron font-bold block text-xs mb-0.5 text-amber-950">
                PAYMENT VERIFICATION PENDING
              </strong>
              <span>
                Payment verification is pending. Our team will verify your payment within <strong>6–12 hours</strong>. Your order payment status will be updated after verification.
              </span>
            </div>
          </div>

          {/* Customer & Delivery Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
            <div className="p-5 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-2">
              <div className="font-orbitron font-bold text-[11px] text-brand uppercase tracking-wider">
                CUSTOMER INFORMATION
              </div>
              <div className="font-semibold text-content-primary text-sm">{completedOrder.customer_name}</div>
              <div className="text-content-secondary">{completedOrder.customer_email}</div>
              {completedOrder.customer_phone && <div className="text-content-secondary">Phone: {completedOrder.customer_phone}</div>}
              {completedOrder.shipping_address?.company && (
                <div className="text-content-muted pt-1">Company: {completedOrder.shipping_address.company}</div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-2">
              <div className="font-orbitron font-bold text-[11px] text-brand uppercase tracking-wider">
                DELIVERY ADDRESS
              </div>
              <div className="text-content-primary font-medium">
                {completedOrder.shipping_address.street}
                {completedOrder.shipping_address.apartment && `, ${completedOrder.shipping_address.apartment}`}
              </div>
              <div className="text-content-secondary">
                {completedOrder.shipping_address.city}, {completedOrder.shipping_address.state} — {completedOrder.shipping_address.postal_code}
              </div>
              <div className="text-content-muted">{completedOrder.shipping_address.country}</div>
            </div>
          </div>

          {/* Itemized Requisition Products Table */}
          <div className="space-y-3">
            <div className="font-orbitron font-bold text-xs text-content-primary uppercase tracking-wider">
              ORDER REQUISITION ITEMS
            </div>
            
            <div className="border border-brand-border rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#FAF8FD] text-content-muted font-orbitron text-[10px] border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50">
                  {completedOrder.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-subtle/30">
                      <td className="py-3.5 px-4">
                        <div className="font-orbitron font-semibold text-content-primary">{item.product_name}</div>
                        {item.product_code && <div className="font-mono text-[10px] text-content-muted">SKU: {item.product_code}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-content-secondary">₹{Math.round(item.unit_price * 86.5).toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-content-primary">₹{Math.round(item.total_price * 86.5).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Accounting Breakdown Card (Clean White with Green Accents) */}
          <div className="p-6 rounded-3xl bg-white border-2 border-emerald-500/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="font-orbitron font-bold text-xs text-content-primary uppercase">
                PAYMENT BREAKDOWN ({completedOrder.payment_type === 'partial' ? '10% ADVANCE + COD' : '100% ONLINE UPI'})
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-orbitron text-[10px] font-bold">
                {completedOrder.payment_type === 'partial' ? 'PARTIAL PAYMENT' : 'FULL PAYMENT'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
              
              {/* Total Order Amount */}
              <div className="p-4 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-1">
                <span className="font-orbitron text-[10px] text-content-muted block uppercase">Total Order Amount</span>
                <span className="font-sans text-lg font-extrabold text-content-primary">
                  ₹{completedOrder.total.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-content-muted block">Includes standard freight</span>
              </div>

              {/* Advance Amount Paid / Payable */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-1">
                <span className="font-orbitron text-[10px] text-emerald-800 block uppercase font-bold">
                  {completedOrder.payment_type === 'partial' ? '10% Advance (Paid/Due)' : 'Full Amount (Paid/Due)'}
                </span>
                <span className="font-sans text-lg font-extrabold text-emerald-700">
                  ₹{(completedOrder.advance_amount || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  {completedOrder.utr_number ? `UTR: ${completedOrder.utr_number}` : 'Via Official UPI QR'}
                </span>
              </div>

              {/* Remaining COD Amount */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                <span className="font-orbitron text-[10px] text-content-muted block uppercase">Remaining Cash on Delivery</span>
                <span className="font-sans text-lg font-extrabold text-content-primary">
                  ₹{(completedOrder.remaining_cod_amount || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-content-muted block">
                  {completedOrder.remaining_cod_amount && completedOrder.remaining_cod_amount > 0
                    ? 'Payable to courier upon delivery'
                    : 'Nil (Fully Paid)'}
                </span>
              </div>

            </div>
          </div>

          {/* Payment Confirmation & WhatsApp Screenshot Submission */}
          {completedOrder.payment_status !== 'verified' && (
            <PaymentConfirmationForm
              orderId={completedOrder.id}
              orderNumber={completedOrder.order_number}
              paymentType={completedOrder.payment_type || 'partial'}
              amountToPay={completedOrder.advance_amount || completedOrder.total}
              totalOrderAmount={completedOrder.total}
              whatsappNumber={paymentConfig.whatsappSupportNumber}
              alreadyConfirmed={Boolean(completedOrder.utr_number)}
              existingUtr={completedOrder.utr_number || ''}
              existingStatus={completedOrder.payment_status}
              onSuccess={(details) => {
                setCompletedOrder((prev) =>
                  prev
                    ? {
                        ...prev,
                        payment_status: 'awaiting_verification',
                        utr_number: details.utrNumber,
                        screenshot_url: details.screenshotUrl,
                      }
                    : null
                );
              }}
            />
          )}

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all text-center"
            >
              CONTINUE SHOPPING
            </Link>
            <Link
              href="/account"
              className="px-8 py-3.5 bg-white border border-brand-border text-brand hover:bg-brand-light font-orbitron text-xs font-semibold rounded-full transition-all text-center"
            >
              VIEW IN MY ORDERS
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-content-primary font-orbitron text-xs font-semibold rounded-full transition-all flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT INVOICE</span>
            </button>
          </div>

        </div>

      </div>
    );
  }

  // EMPTY CHECKOUT REDIRECT
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-orbitron font-bold text-2xl text-content-primary">
          NO ITEMS IN CHECKOUT
        </h1>
        <p className="text-xs text-content-secondary">
          Add research materials from the catalog to proceed to order checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center px-6 py-3 bg-brand text-white font-orbitron text-xs rounded-full shadow-purple-sm"
        >
          GO TO SHOP
        </Link>
      </div>
    );
  }

  // =========================================================================
  // MAIN CHECKOUT FORM (Two-column desktop / Stacked mobile)
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Checkout Title */}
      <div className="border-b border-brand-border pb-4">
        <div className="flex items-center space-x-2 text-xs font-orbitron text-brand font-semibold uppercase">
          <Lock className="w-4 h-4" />
          <span>Encrypted Order Processing & UPI Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
          RESEARCH ORDER CHECKOUT
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-xs font-medium flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Form Fields & Payment Options */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Customer Information */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-mono">1</span>
              <span>CUSTOMER INFORMATION</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  FIRST NAME *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  LAST NAME *
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  COMPANY NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-mono">2</span>
              <span>DELIVERY ADDRESS</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="sm:col-span-2">
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  STREET ADDRESS *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  APARTMENT, SUITE, ETC. (OPTIONAL)
                </label>
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  CITY *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  STATE / PROVINCE *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  POSTAL / PIN CODE *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-content-muted font-orbitron text-[10px] mb-1">
                  COUNTRY
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans bg-white cursor-pointer"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. TWO SELECTABLE PAYMENT OPTIONS (CRITICAL REQUIREMENT) */}
          <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-mono">3</span>
                <span>SELECT PAYMENT OPTION</span>
              </h2>
              <span className="text-[10px] font-orbitron text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                UPI / COD READY
              </span>
            </div>

            {/* Radio Selection Cards for Option A & Option B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option A: Partial Payment (10% Advance + 90% COD) */}
              <div
                onClick={() => setSelectedPaymentOption('partial')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                  selectedPaymentOption === 'partial'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-brand-border bg-white hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={selectedPaymentOption === 'partial'}
                      onChange={() => setSelectedPaymentOption('partial')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-orbitron font-bold text-xs text-content-primary block">
                        PARTIAL PAYMENT
                      </span>
                      <span className="text-[11px] text-content-muted font-sans block">
                        {paymentConfig.advancePercentage}% Advance + Balance COD
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-orbitron text-[9px] font-bold">
                    RECOMMENDED
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-border/60 space-y-1 font-sans text-xs">
                  <div className="flex justify-between">
                    <span className="text-content-muted">Pay Now (Advance):</span>
                    <span className="font-bold text-emerald-700 text-sm">₹{breakdown.advanceAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Remaining COD:</span>
                    <span className="font-medium text-content-primary">₹{breakdown.remainingCodAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Option B: Complete Online Payment (100% UPI) */}
              <div
                onClick={() => setSelectedPaymentOption('full')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                  selectedPaymentOption === 'full'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-brand-border bg-white hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={selectedPaymentOption === 'full'}
                      onChange={() => setSelectedPaymentOption('full')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-orbitron font-bold text-xs text-content-primary block">
                        FULL ONLINE PAYMENT
                      </span>
                      <span className="text-[11px] text-content-muted font-sans block">
                        100% UPI Instant Payment
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-orbitron text-[9px] font-bold">
                    0% COD
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-border/60 space-y-1 font-sans text-xs">
                  <div className="flex justify-between">
                    <span className="text-content-muted">Pay Now (Full):</span>
                    <span className="font-bold text-emerald-700 text-sm">₹{breakdown.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Balance on Delivery:</span>
                    <span className="font-medium text-accent-success font-mono">₹0 (Fully Paid)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Expandable Payment Section for Chosen Option */}
            <div className="bg-[#FAF8FD] border border-brand-border rounded-2xl p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-orbitron font-bold text-xs">
                  <QrIcon className="w-4 h-4 text-emerald-600" />
                  <span>
                    {selectedPaymentOption === 'partial'
                      ? `DYNAMIC UPI QR FOR ${paymentConfig.advancePercentage}% ADVANCE`
                      : 'DYNAMIC UPI QR FOR FULL ORDER AMOUNT'}
                  </span>
                </div>
                {selectedPaymentOption === 'full' && (
                  <button
                    type="button"
                    onClick={() => setIsUpiModalOpen(true)}
                    className="text-xs font-orbitron font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                  >
                    <span>Open Modal View</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </button>
                )}
              </div>

              {/* Dynamic QR Code Render */}
              <div className="flex flex-col items-center">
                <UpiQrCode
                  upiId={paymentConfig.upiId}
                  merchantName={paymentConfig.upiMerchantName}
                  amount={currentPayableNow}
                  orderNumber={tempOrderNumber}
                  currency="INR"
                  size={200}
                  showDetails={true}
                />
              </div>

              {/* Inline Payment Confirmation & UTR Submission Form */}
              <PaymentConfirmationForm
                orderNumber={tempOrderNumber}
                paymentType={selectedPaymentOption}
                amountToPay={currentPayableNow}
                totalOrderAmount={breakdown.totalAmount}
                whatsappNumber={paymentConfig.whatsappSupportNumber}
                onSuccess={(details) => {
                  setCheckoutUtr(details.utrNumber);
                  if (details.screenshotUrl) setCheckoutScreenshotUrl(details.screenshotUrl);
                }}
              />

            </div>

          </div>

          {/* 4. Order Notes */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-mono">4</span>
              <span>ORDER NOTES (OPTIONAL)</span>
            </h2>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
            />
          </div>

        </div>

        {/* Right Column: Requisition Summary & Split Accounting Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 shadow-md space-y-6 sticky top-24">
            
            <h2 className="font-orbitron font-bold text-lg text-content-primary border-b border-brand-border pb-3">
              REQUISITION SUMMARY
            </h2>

            {/* Items List */}
            <div className="divide-y divide-brand-border/60 max-h-56 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-2 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-orbitron font-semibold text-content-primary">
                      {item.product.name} ({item.product.size})
                    </div>
                    <div className="text-content-muted">Qty: {item.quantity} × ₹{Math.round(item.product.price * 86.5).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="font-mono font-bold text-content-primary">
                    ₹{Math.round(item.product.price * item.quantity * 86.5).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-brand-border pt-4 space-y-2 text-xs font-sans">
              <div className="flex justify-between text-content-secondary">
                <span>Products Subtotal</span>
                <span className="font-mono font-medium">₹{Math.round(subtotal * 86.5).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-content-secondary">
                <span>Cold-Chain Express Shipping</span>
                <span className="font-mono font-medium">₹{Math.round(shippingCost * 86.5).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-brand-border pt-2 flex justify-between font-orbitron font-extrabold text-base text-content-primary">
                <span>Total Order Amount</span>
                <span className="text-brand">₹{breakdown.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Split Payment Accounting Card (Green Accents) */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-400 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="font-orbitron font-bold text-xs text-emerald-900 uppercase">
                  PAYMENT PLAN: {selectedPaymentOption === 'partial' ? '10% ADVANCE' : '100% ONLINE'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-mono font-bold border border-emerald-300">
                  {selectedPaymentOption === 'partial' ? 'COD APPLICABLE' : 'ZERO COD'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between text-emerald-950">
                  <span>Payable Now (UPI):</span>
                  <span className="font-mono font-extrabold text-emerald-700 text-sm">
                    ₹{currentPayableNow.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-950">
                  <span>Cash on Delivery (Remaining):</span>
                  <span className="font-mono font-bold text-content-primary">
                    ₹{currentRemainingCod.toLocaleString('en-IN')}
                  </span>
                </div>
                {checkoutUtr && (
                  <div className="pt-1 text-[11px] font-mono text-emerald-800 border-t border-emerald-200">
                    Logged UTR: <span className="font-bold">{checkoutUtr}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mandatory Compliance Agreement */}
            <div className="p-4 rounded-2xl bg-purple-50 border-2 border-brand/40 space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={complianceAcknowledged}
                  onChange={(e) => setComplianceAcknowledged(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-brand focus:ring-brand accent-brand shrink-0 cursor-pointer"
                />
                <span className="text-[11px] text-purple-950 font-sans leading-relaxed">
                  <strong className="font-orbitron text-brand block mb-1">
                    RESEARCH USE ACKNOWLEDGEMENT *
                  </strong>
                  I certify that all products ordered are intended solely for <strong>in vitro laboratory research, chemical analysis, or academic investigation</strong>. I explicitly confirm that no materials will be used for human or veterinary administration. I agree to the <Link href="/policies/research-use" target="_blank" className="text-brand underline font-semibold">Research Use Policy</Link> and <Link href="/policies/terms" target="_blank" className="text-brand underline font-semibold">Terms of Sale</Link>.
                </span>
              </label>
            </div>

            {/* Submit Order Requisition CTA */}
            <button
              type="submit"
              disabled={submitting || !complianceAcknowledged}
              className={`w-full py-4 px-6 rounded-full font-orbitron text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-purple-glow transition-all ${
                !complianceAcknowledged || submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {submitting
                  ? 'LOGGING REQUISITION...'
                  : selectedPaymentOption === 'partial'
                  ? `CONFIRM ORDER (PAY ADVANCE ₹${currentPayableNow.toLocaleString('en-IN')})`
                  : `CONFIRM FULL ORDER (₹${currentPayableNow.toLocaleString('en-IN')})`}
              </span>
            </button>

            <div className="flex items-center justify-center space-x-4 text-[10px] font-orbitron text-content-muted pt-1">
              <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> SSL SECURED</span>
              <span>•</span>
              <span>UPI RECONCILED</span>
              <span>•</span>
              <span>HPLC VERIFIED</span>
            </div>

          </div>
        </div>

      </form>

      {/* Option B Modal Popup */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        orderNumber={tempOrderNumber}
        totalAmount={breakdown.totalAmount}
        upiId={paymentConfig.upiId}
        merchantName={paymentConfig.upiMerchantName}
        whatsappNumber={paymentConfig.whatsappSupportNumber}
        onPaymentConfirmed={(details) => {
          setCheckoutUtr(details.utrNumber);
          if (details.screenshotUrl) setCheckoutScreenshotUrl(details.screenshotUrl);
          setIsUpiModalOpen(false);
        }}
      />

    </div>
  );
}
