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
  ArrowLeft,
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
  ExternalLink,
  User,
  MapPin,
  Edit2
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

  // Multi-step checkout state: Step 1 (Info) -> Step 2 (Payment Option) -> Step 3 (Pay & Verify)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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

  // UTR / Screenshot state in checkout form
  const [checkoutUtr, setCheckoutUtr] = useState<string>('');
  const [checkoutScreenshotUrl, setCheckoutScreenshotUrl] = useState<string>('');

  const [complianceAcknowledged, setComplianceAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Free shipping rate across entire site
  const shippingCost = 0;
  const rawGrandTotalUSD = subtotal;

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

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('You must be signed in to your account to place an order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMsg('Please enter your full first and last name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please provide a valid institutional email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Phone number is required for courier delivery and WhatsApp verification.');
      return;
    }
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.postalCode.trim()) {
      setErrorMsg('Please complete all required delivery address fields (Street, City, State, and PIN code).');
      return;
    }

    // Scroll smoothly to top and advance to Step 2
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Submission -> Creates Order & Advances to Step 3 (Payment & Verification)
  const handleConfirmOrder = async (e: React.FormEvent) => {
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

    setSubmitting(true);

    try {
      const orderItems: OrderItem[] = cart.map((item) => {
        const itemImg =
          item.product.images?.find((img) => img.is_primary)?.image_url ||
          item.product.images?.[0]?.image_url ||
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';

        return {
          id: 'item-' + Math.random().toString(36).substring(2, 9),
          order_id: '',
          product_id: item.product.id,
          product_name: item.product.name,
          product_code: item.product.product_code,
          quantity: item.quantity,
          unit_price: item.product.price,
          total_price: item.product.price * item.quantity,
          image_url: itemImg,
        };
      });

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

      const newOrder = await createNewOrder({
        user_id: user.id,
        order_number: tempOrderNumber,
        status: 'pending',
        payment_status: 'unpaid',
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
        total: rawGrandTotalUSD,
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
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // EMPTY CHECKOUT REDIRECT (only if not on completed step 3)
  if (cart.length === 0 && !completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
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

  // STEP METADATA FOR PROGRESS STEPPER
  const stepItems = [
    { number: 1, label: 'Delivery Info', icon: Truck },
    { number: 2, label: 'Payment Option', icon: CreditCard },
    { number: 3, label: 'Pay & Verify', icon: QrIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Checkout Title & Top Encrypted Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-orbitron text-brand font-semibold uppercase">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Order Processing & UPI Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
            RESEARCH ORDER CHECKOUT
          </h1>
        </div>

        {/* Multi-Step Wizard Indicator */}
        <div className="flex items-center space-x-2 sm:space-x-3 bg-white p-2 rounded-2xl border border-brand-border shadow-sm">
          {stepItems.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const isAccessible = currentStep >= step.number || (step.number === 2 && Boolean(formData.street));

            return (
              <React.Fragment key={step.number}>
                <button
                  type="button"
                  disabled={!isAccessible || currentStep === 3}
                  onClick={() => {
                    if (isAccessible && currentStep !== 3) {
                      setCurrentStep(step.number as any);
                    }
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all text-xs font-orbitron font-bold ${isCurrent
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                      : 'text-content-muted cursor-not-allowed opacity-60'
                    }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isCurrent ? 'bg-white text-emerald-700' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.number}
                  </span>
                  <span className="hidden md:inline">{step.label}</span>
                </button>
                {idx < stepItems.length - 1 && (
                  <div className={`w-4 h-0.5 ${currentStep > idx + 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-xs font-medium flex items-center space-x-2 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1 & STEP 2: TWO-COLUMN FORM LAYOUT */}
      {/* ========================================================================= */}
      {currentStep !== 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Column: Step Content */}
          <div className="lg:col-span-7 space-y-6">

            {/* ----------------------------------------------------------------- */}
            {/* STEP 1: CUSTOMER & DELIVERY INFORMATION */}
            {/* ----------------------------------------------------------------- */}
            {currentStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-6 animate-in fade-in duration-200">

                {/* 1. Customer Information Card */}
                <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-brand-border pb-3">
                    <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-mono">1</span>
                      <span>CUSTOMER INFORMATION</span>
                    </h2>
                    <span className="text-[11px] font-sans text-content-muted">Primary Researcher</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        FIRST NAME *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="e.g. Your Name"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        LAST NAME *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        INSTITUTIONAL EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="researcher@lab.org"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        PHONE NUMBER * (FOR COLD-CHAIN DISPATCH)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        LABORATORY / COMPANY NAME (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="e.g. BioCore Analytical Laboratories"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Address Card */}
                <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-brand-border pb-3">
                    <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-mono">2</span>
                      <span>DELIVERY DESTINATION</span>
                    </h2>
                    <span className="text-[11px] font-sans text-content-muted flex items-center">
                      <Truck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Insulated Cold-Chain Freight
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="sm:col-span-2">
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        STREET ADDRESS *
                      </label>
                      <input
                        type="text"
                        name="street"
                        required
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="e.g. Street Address"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        APARTMENT, SUITE, LAB UNIT (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        placeholder="e.g. Lab Suite 4B"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        CITY *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. West Delhi"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        STATE / PROVINCE *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g. Delhi"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        POSTAL / PIN CODE *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g. 110059"
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
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

                    <div className="sm:col-span-2">
                      <label className="block text-content-muted font-orbitron text-[10px] mb-1 font-bold">
                        SPECIAL DELIVERY INSTRUCTIONS (OPTIONAL)
                      </label>
                      <textarea
                        name="notes"
                        rows={2}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="e.g. Receiving dock open 9 AM - 5 PM. Keep insulated container level."
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 1 Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full font-orbitron text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 bg-brand hover:bg-brand-dark text-white shadow-purple-glow transition-all hover:scale-[1.01]"
                >
                  <span>CONTINUE TO PAYMENT METHOD</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* STEP 2: PAYMENT PLAN & ORDER CONFIRMATION */}
            {/* ----------------------------------------------------------------- */}
            {currentStep === 2 && (
              <form onSubmit={handleConfirmOrder} className="space-y-6 animate-in fade-in duration-200">

                {/* Review Address Brief Card with Quick Edit */}
                <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 text-xs font-sans">
                    <span className="font-orbitron font-bold text-[10px] text-content-muted uppercase block">
                      DELIVERING TO
                    </span>
                    <p className="font-semibold text-content-primary">
                      {formData.firstName} {formData.lastName} {formData.company ? `(${formData.company})` : ''}
                    </p>
                    <p className="text-content-secondary">
                      {formData.street}, {formData.city}, {formData.state} {formData.postalCode}, {formData.country} • Ph: {formData.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center space-x-1.5 text-xs font-orbitron font-bold text-brand hover:underline shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Change Details</span>
                  </button>
                </div>

                {/* Select Payment Option Card */}
                <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-brand-border pb-4">
                    <div>
                      <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                        <span>SELECT PAYMENT OPTION</span>
                      </h2>
                      <p className="text-xs text-content-secondary font-sans mt-0.5">
                        Choose between partial advance payment or complete upfront payment via UPI.
                      </p>
                    </div>
                    <span className="text-[10px] font-orbitron text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold shrink-0">
                      UPI / COD READY
                    </span>
                  </div>

                  {/* Radio Selection Cards for Option A & Option B */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Option A: Partial Payment (10% Advance + 90% COD) */}
                    <div
                      onClick={() => setSelectedPaymentOption('partial')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPaymentOption === 'partial'
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

                      <div className="mt-4 pt-3 border-t border-brand-border/60 space-y-1.5 font-sans text-xs">
                        <div className="flex justify-between">
                          <span className="text-content-muted font-medium">Pay Now (10% Advance):</span>
                          <span className="font-mono font-extrabold text-emerald-700 text-sm">₹{breakdown.advanceAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-content-muted">Remaining on Delivery (COD):</span>
                          <span className="font-mono font-medium text-content-primary">₹{breakdown.remainingCodAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-white border border-emerald-200/80 text-[11px] text-emerald-900 leading-tight">
                        Pay 10% now via UPI to secure laboratory preparation. Pay the remaining 90% balance on physical delivery via Cash on Delivery.
                      </div>
                    </div>

                    {/* Option B: Complete Online Payment (100% UPI) */}
                    <div
                      onClick={() => setSelectedPaymentOption('full')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPaymentOption === 'full'
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

                      <div className="mt-4 pt-3 border-t border-brand-border/60 space-y-1.5 font-sans text-xs">
                        <div className="flex justify-between">
                          <span className="text-content-muted font-medium">Pay Now (Full):</span>
                          <span className="font-mono font-extrabold text-emerald-700 text-sm">₹{breakdown.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-content-muted">Balance on Delivery:</span>
                          <span className="font-mono font-medium text-emerald-700">₹0 (Fully Paid)</span>
                        </div>
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-white border border-blue-200/80 text-[11px] text-blue-900 leading-tight">
                        Pay 100% full amount now via UPI QR for instant order reconciliation and zero Cash on Delivery hassle upon arrival.
                      </div>
                    </div>

                  </div>

                </div>

                {/* Mandatory Compliance Agreement */}
                <div className="p-5 rounded-3xl bg-purple-50/80 border-2 border-brand/40 space-y-3">
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

                {/* Action Controls for Step 2 */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-6 py-4 rounded-full border border-brand-border hover:bg-gray-50 text-content-secondary font-orbitron text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>BACK TO INFORMATION</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !complianceAcknowledged}
                    className={`flex-1 w-full py-4 px-6 rounded-full font-orbitron text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-purple-glow transition-all ${!complianceAcknowledged || submitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01]'
                      }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {submitting
                        ? 'GENERATING ORDER INVOICE...'
                        : selectedPaymentOption === 'partial'
                          ? `CONFIRM ORDER (PAY ADVANCE ₹${currentPayableNow.toLocaleString('en-IN')}) →`
                          : `CONFIRM FULL ORDER (₹${currentPayableNow.toLocaleString('en-IN')}) →`}
                    </span>
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Right Column: Requisition Summary & Accounting Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 shadow-md space-y-6 sticky top-24">

              <h2 className="font-orbitron font-bold text-lg text-content-primary border-b border-brand-border pb-3">
                REQUISITION SUMMARY
              </h2>

              {/* Items List */}
              <div className="divide-y divide-brand-border/60 max-h-64 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => {
                  const itemImg =
                    item.product.images?.find((img) => img.is_primary)?.image_url ||
                    item.product.images?.[0]?.image_url ||
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';

                  return (
                    <div key={item.product.id} className="pt-2.5 pb-1 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Product Image Thumbnail */}
                        <div className="relative w-12 h-12 rounded-xl bg-[#FAF8FD] overflow-hidden border border-brand-border shrink-0 shadow-sm">
                          <Image
                            src={itemImg}
                            alt={item.product.name}
                            fill
                            className="object-cover p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-orbitron font-semibold text-content-primary truncate max-w-[200px] sm:max-w-[240px]">
                            {item.product.name}
                          </div>
                          <div className="text-content-muted text-[11px] font-sans flex items-center space-x-1.5 mt-0.5">
                            {item.product.size && (
                              <span className="font-mono bg-surface-soft px-1.5 py-0.2 rounded border border-brand-border/60 text-[10px]">
                                {item.product.size}
                              </span>
                            )}
                            <span>Qty: {item.quantity} × ₹{Math.round(item.product.price * 86.5).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-content-primary shrink-0 text-right">
                        ₹{Math.round(item.product.price * item.quantity * 86.5).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calculations Breakdown */}
              <div className="border-t border-brand-border pt-4 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-content-secondary">
                  <span>Products Subtotal</span>
                  <span className="font-mono font-medium">₹{Math.round(subtotal * 86.5).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-content-secondary">
                  <span>Shipping & Delivery</span>
                  <span className="font-mono font-medium text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="border-t border-brand-border pt-2 flex justify-between font-orbitron font-extrabold text-base text-content-primary">
                  <span>Total Order Amount</span>
                  <span className="text-brand">₹{breakdown.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Split Payment Accounting Card: Only visible during Step 2 (Payment Option selection) */}
              {currentStep === 2 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-400 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="font-orbitron font-bold text-xs text-emerald-900 uppercase">
                      PAYMENT PLAN: {selectedPaymentOption === 'partial' ? `${paymentConfig.advancePercentage}% ADVANCE` : '100% ONLINE'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-mono font-bold border border-emerald-300">
                      {selectedPaymentOption === 'partial' ? 'COD APPLICABLE' : 'ZERO COD'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-sans">
                    <div className="flex justify-between text-emerald-950">
                      <span className="font-medium">Payable Now (UPI):</span>
                      <span className="font-mono font-extrabold text-emerald-700 text-sm">
                        ₹{currentPayableNow.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-950">
                      <span className="font-medium">Cash on Delivery (Remaining):</span>
                      <span className="font-mono font-bold text-content-primary">
                        ₹{currentRemainingCod.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center space-x-4 text-[10px] font-orbitron text-content-muted pt-1">
                <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> SSL SECURED</span>
                <span>•</span>
                <span>UPI RECONCILED</span>
                <span>•</span>
                <span>HPLC VERIFIED</span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DEDICATED UPI PAYMENT & VERIFICATION SCREEN */}
      {/* ========================================================================= */}
      {currentStep === 3 && completedOrder && (() => {
        const paymentBadge = getPaymentStatusBadge(completedOrder.payment_status);
        const invoiceWhatsappUrl = generateWhatsAppPaymentLink({
          whatsappNumber: paymentConfig.whatsappSupportNumber,
          orderNumber: completedOrder.order_number,
          paymentType: completedOrder.payment_type || 'partial',
          amountPaid: completedOrder.advance_amount || currentPayableNow,
          utr: completedOrder.utr_number,
        });

        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">

            {/* Invoice Header Card */}
            <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">

              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-brand-light text-brand font-orbitron text-[11px] font-bold tracking-wider">
                      STEP 3: PAYMENT VERIFICATION
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-orbitron font-bold">
                      REQUISITION LOGGED
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
                    ORDER #{completedOrder.order_number}
                  </h1>
                  <div className="text-xs text-content-muted font-sans flex items-center space-x-3">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Order Date: {new Date(completedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>Currency: INR (₹)</span>
                  </div>
                </div>

                {/* Payment Status Pill */}
                <div className="text-left sm:text-right space-y-1">
                  <span className="font-orbitron text-[10px] text-content-muted uppercase block">Payment Status</span>
                  <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-orbitron font-bold uppercase ${paymentBadge.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${paymentBadge.dot}`} />
                    <span>{paymentBadge.label}</span>
                  </div>
                </div>
              </div>

              {/* Payment Verification Pending Notice */}
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

              {/* Customer & Destination Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                <div className="p-5 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-2">
                  <div className="font-orbitron font-bold text-[11px] text-brand uppercase tracking-wider flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>CUSTOMER INFORMATION</span>
                  </div>
                  <div className="font-semibold text-content-primary text-sm">{completedOrder.customer_name}</div>
                  <div className="text-content-secondary">{completedOrder.customer_email}</div>
                  {completedOrder.customer_phone && <div className="text-content-secondary">Phone: {completedOrder.customer_phone}</div>}
                  {completedOrder.shipping_address?.company && (
                    <div className="text-content-muted pt-1">Laboratory: {completedOrder.shipping_address.company}</div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-2">
                  <div className="font-orbitron font-bold text-[11px] text-brand uppercase tracking-wider flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>DELIVERY DESTINATION</span>
                  </div>
                  <div className="text-content-primary font-medium">
                    {completedOrder.shipping_address?.street}
                    {completedOrder.shipping_address?.apartment ? `, ${completedOrder.shipping_address.apartment}` : ''}
                  </div>
                  <div className="text-content-secondary">
                    {completedOrder.shipping_address?.city}, {completedOrder.shipping_address?.state} {completedOrder.shipping_address?.postal_code}
                  </div>
                  <div className="text-content-muted">{completedOrder.shipping_address?.country}</div>
                </div>
              </div>

              {/* Itemized Requisition Manifest Table */}
              <div className="space-y-3">
                <div className="font-orbitron font-bold text-xs text-content-primary uppercase tracking-wider">
                  ITEMIZED REQUISITION MANIFEST
                </div>

                <div className="overflow-x-auto border border-brand-border rounded-2xl">
                  <table className="w-full text-xs font-sans text-left">
                    <thead className="bg-[#FAF8FD] border-b border-brand-border text-content-muted font-orbitron text-[10px] uppercase">
                      <tr>
                        <th className="py-3 px-4">Product Description</th>
                        <th className="py-3 px-4 text-center">Quantity</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {completedOrder.items?.map((item) => {
                        const itemImg =
                          item.image_url ||
                          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="relative w-11 h-11 rounded-xl bg-[#FAF8FD] overflow-hidden border border-brand-border shrink-0 shadow-sm">
                                  <Image
                                    src={itemImg}
                                    alt={item.product_name}
                                    fill
                                    className="object-cover p-1"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-content-primary block font-orbitron">{item.product_name}</span>
                                  {item.product_code && (
                                    <span className="font-mono text-[10px] text-content-muted">Batch SKU: {item.product_code}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-medium">{item.quantity}</td>
                            <td className="py-3 px-4 text-right font-mono">{formatPrice(item.unit_price)}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-content-primary">
                              {formatPrice(item.total_price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Complete Financial Breakdown & Split Accounting */}
              <div className="p-6 rounded-2xl bg-white border-2 border-emerald-500 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="font-orbitron font-bold text-sm text-content-primary">
                    FINANCIAL REQUISITION SUMMARY
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-orbitron font-bold uppercase">
                    {completedOrder.payment_type === 'partial' ? '10% Advance + 90% COD' : '100% Online Complete'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-content-muted block mb-1">Total Order Amount</span>
                    <span className="font-mono font-extrabold text-base text-content-primary">
                      {formatPrice(completedOrder.total)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-800 font-medium block mb-1">
                      {completedOrder.payment_type === 'partial' ? '10% Advance Amount' : 'Full Amount'} (Payable Now)
                    </span>
                    <span className="font-mono font-extrabold text-lg text-emerald-700">
                      ₹{(completedOrder.advance_amount || currentPayableNow).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-amber-800 font-medium block mb-1">Remaining COD Balance</span>
                    <span className="font-mono font-extrabold text-base text-amber-900">
                      ₹{(completedOrder.remaining_cod_amount ?? currentRemainingCod).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic QR Code & Payment Confirmation Section */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF8FD] border-2 border-emerald-400 space-y-6">

                <div className="text-center space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-orbitron text-[10px] font-bold tracking-wider">
                    PAY VIA OFFICIAL MERCHANT UPI QR
                  </span>
                  <h3 className="font-orbitron font-bold text-lg text-content-primary">
                    {completedOrder.payment_type === 'partial'
                      ? `SCAN QR TO PAY ₹${(completedOrder.advance_amount || currentPayableNow).toLocaleString('en-IN')} (10% ADVANCE)`
                      : `SCAN QR TO PAY ₹${completedOrder.total.toLocaleString('en-IN')} (FULL AMOUNT)`}
                  </h3>
                  <p className="text-xs text-content-secondary font-sans max-w-md mx-auto">
                    Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI banking app.
                  </p>
                </div>

                {/* QR Code Canvas */}
                <div className="flex flex-col items-center">
                  <UpiQrCode
                    upiId={paymentConfig.upiId}
                    merchantName={paymentConfig.upiMerchantName}
                    amount={completedOrder.advance_amount || currentPayableNow}
                    orderNumber={completedOrder.order_number}
                    currency="INR"
                    size={220}
                    showDetails={true}
                  />
                </div>

                {/* 5-Step Instructions & UTR Confirmation Form */}
                <PaymentConfirmationForm
                  orderNumber={completedOrder.order_number}
                  paymentType={completedOrder.payment_type || 'partial'}
                  amountToPay={completedOrder.advance_amount || currentPayableNow}
                  totalOrderAmount={completedOrder.total}
                  whatsappNumber={paymentConfig.whatsappSupportNumber}
                  onSuccess={(details) => {
                    setCheckoutUtr(details.utrNumber);
                    if (details.screenshotUrl) setCheckoutScreenshotUrl(details.screenshotUrl);
                    setCompletedOrder((prev) => prev ? {
                      ...prev,
                      payment_status: 'awaiting_verification',
                      utr_number: details.utrNumber,
                      screenshot_url: details.screenshotUrl || prev.screenshot_url,
                    } : null);
                  }}
                />

              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-border">
                <Link
                  href="/account"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold shadow-purple-sm transition-all text-center"
                >
                  VIEW IN MY ORDERS & TRACK DISPATCH →
                </Link>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-brand-border hover:bg-gray-50 text-content-primary font-orbitron text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT REQUISITION INVOICE</span>
                </button>
              </div>

            </div>

          </div>
        );
      })()}

    </div>
  );
}
