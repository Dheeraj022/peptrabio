'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { createNewOrder } from '@/lib/products-store';
import { Order, OrderItem } from '@/types';
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
  UserCheck
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user, isLoading } = useAuth();

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
    country: 'United States',
    sameBilling: true,
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'United States',
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

  const [complianceAcknowledged, setComplianceAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const shippingCost = 15.00;
  const grandTotal = subtotal + shippingCost;

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
      setErrorMsg('Please complete all required shipping fields.');
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

      const newOrder = await createNewOrder({
        user_id: user.id,
        status: 'paid',
        subtotal,
        shipping: shippingCost,
        tax: 0,
        total: grandTotal,
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
      setErrorMsg(err.message || 'Error processing order.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <div className="bg-white border-2 border-brand-border rounded-3xl p-8 sm:p-12 shadow-xl space-y-6 text-center">
          
          <div className="w-20 h-20 rounded-full bg-accent-success/10 text-accent-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-brand-light text-brand font-orbitron text-xs font-bold tracking-wider">
              ORDER CONFIRMED & QUEUED FOR QC DISPATCH
            </span>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
              THANK YOU FOR YOUR ORDER
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary font-sans max-w-lg mx-auto">
              Your research lot requisition has been logged. An analytical packing slip and COA verification link have been dispatched to <strong className="text-content-primary font-mono">{completedOrder.customer_email}</strong>.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="p-6 rounded-2xl bg-brand-subtle border border-brand-border text-left space-y-4 text-xs font-sans">
            <div className="flex justify-between items-center border-b border-brand-border/60 pb-3">
              <div>
                <span className="font-orbitron text-[10px] text-content-muted block">ORDER REFERENCE NUMBER</span>
                <span className="font-orbitron font-bold text-sm text-brand">{completedOrder.order_number}</span>
              </div>
              <div className="text-right">
                <span className="font-orbitron text-[10px] text-content-muted block">ORDER STATUS</span>
                <span className="font-orbitron font-semibold text-accent-success uppercase">CONFIRMED (PAID)</span>
              </div>
            </div>

            <div>
              <span className="font-orbitron text-[10px] text-content-muted block mb-1">SHIPPING DESTINATION</span>
              <div className="text-content-primary font-medium">
                {completedOrder.shipping_address.first_name} {completedOrder.shipping_address.last_name}
                {completedOrder.shipping_address.company && ` — ${completedOrder.shipping_address.company}`}
              </div>
              <div className="text-content-secondary">
                {completedOrder.shipping_address.street}, {completedOrder.shipping_address.city}, {completedOrder.shipping_address.state} {completedOrder.shipping_address.postal_code}, {completedOrder.shipping_address.country}
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-brand-border/60 pt-3 space-y-2">
              <span className="font-orbitron text-[10px] text-content-muted block">CATALOG REQUISITION ITEMS</span>
              {completedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span className="font-mono font-semibold text-content-primary">{formatPrice(item.total_price)}</span>
                </div>
              ))}
              <div className="border-t border-brand-border/40 pt-2 flex justify-between font-orbitron font-bold text-sm text-content-primary">
                <span>Total Paid</span>
                <span className="text-brand">{formatPrice(completedOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all"
            >
              CONTINUE BROWSING CATALOG
            </Link>
            <Link
              href="/admin/orders"
              className="px-8 py-3.5 bg-white border border-brand-border text-brand hover:bg-brand-light font-orbitron text-xs font-semibold rounded-full transition-all"
            >
              INSPECT IN ADMIN DASHBOARD
            </Link>
          </div>

        </div>
      </div>
    );
  }

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
          className="inline-flex items-center px-6 py-3 bg-brand text-white font-orbitron text-xs rounded-full"
        >
          GO TO SHOP
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Checkout Title */}
      <div className="border-b border-brand-border pb-4">
        <div className="flex items-center space-x-2 text-xs font-orbitron text-brand font-semibold uppercase">
          <Lock className="w-4 h-4" />
          <span>Encrypted Order Processing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
          RESEARCH ORDER CHECKOUT
        </h1>
      </div>

      {/* Logged in User Bar */}
      <div className="p-4 rounded-2xl bg-brand-light/40 border border-brand/30 flex items-center space-x-3 text-xs">
        <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-orbitron font-bold text-xs shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-orbitron font-bold text-content-primary flex items-center space-x-2">
            <span>{user.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-accent-success/10 text-accent-success text-[10px] font-mono font-bold">
              LOGGED IN
            </span>
          </div>
          <p className="text-[11px] text-content-secondary font-sans">{user.email}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-xs font-medium flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Form Fields */}
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

          {/* 2. Shipping Destination */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-mono">2</span>
              <span>SHIPPING ADDRESS</span>
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
                  POSTAL / ZIP CODE *
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
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans bg-white"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Order Notes */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-orbitron font-bold text-base text-content-primary flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-mono">3</span>
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

        {/* Right Column: Order Summary & Mandatory Compliance Agreement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            
            <h2 className="font-orbitron font-bold text-lg text-content-primary border-b border-brand-border pb-3">
              REQUISITION SUMMARY
            </h2>

            {/* Items List */}
            <div className="divide-y divide-brand-border/60 max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-2 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-orbitron font-semibold text-content-primary">
                      {item.product.name} ({item.product.size})
                    </div>
                    <div className="text-content-muted">Qty: {item.quantity} × {formatPrice(item.product.price)}</div>
                  </div>
                  <div className="font-mono font-bold text-content-primary">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-brand-border pt-4 space-y-2 text-xs font-sans">
              <div className="flex justify-between text-content-secondary">
                <span>Products Subtotal</span>
                <span className="font-mono font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-content-secondary">
                <span>Cold-Chain Carrier Express</span>
                <span className="font-mono font-medium">{formatPrice(shippingCost)}</span>
              </div>
              <div className="border-t border-brand-border pt-3 flex justify-between font-orbitron font-extrabold text-base text-content-primary">
                <span>Total Amount Due</span>
                <span className="text-brand">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* STRICT MANDATORY COMPLIANCE CHECKBOX (CRITICAL REQUIREMENT) */}
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
                    MANDATORY RESEARCH USE ACKNOWLEDGEMENT *
                  </strong>
                  I acknowledge and certify that all products ordered are intended solely for <strong>in vitro laboratory research, chemical analysis, or academic investigation</strong>. I explicitly confirm that no products will be used for human consumption, diagnosis, treatment, disease prevention, or veterinary use. I agree to the <Link href="/policies/research-use" target="_blank" className="text-brand underline font-semibold">Research Use Policy</Link> and <Link href="/policies/terms" target="_blank" className="text-brand underline font-semibold">Terms of Sale</Link>.
                </span>
              </label>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={submitting || !complianceAcknowledged}
              className={`w-full py-4 px-6 rounded-full font-orbitron text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-purple-glow transition-all ${
                !complianceAcknowledged || submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400'
                  : 'bg-brand hover:bg-brand-dark text-white hover:scale-[1.02]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'PROCESSING REQUISITION...' : `PLACE RESEARCH ORDER — ${formatPrice(grandTotal)}`}</span>
            </button>

            <div className="flex items-center justify-center space-x-4 text-[10px] font-orbitron text-content-muted pt-1">
              <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1 text-accent-success" /> SSL SECURED</span>
              <span>•</span>
              <span>HPLC VERIFIED BATCH</span>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}
