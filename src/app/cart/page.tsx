'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldAlert,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center mx-auto text-brand">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-orbitron font-extrabold text-3xl text-content-primary">
          YOUR RESEARCH CART IS EMPTY
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary max-w-md mx-auto font-sans leading-relaxed">
          Explore our certified catalog of high-purity research peptides, neuropeptides, and cellular reference materials.
        </p>
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center px-8 py-4 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-glow transition-all"
          >
            <span>BROWSE RESEARCH CATALOG</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-content-primary">
            RESEARCH ORDER CART
          </h1>
          <p className="text-xs text-content-muted font-sans pt-1">
            Review your selected research materials before proceeding to compliance verification and checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-orbitron text-content-muted hover:text-accent-danger transition-colors self-start sm:self-auto"
        >
          CLEAR ENTIRE CART
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cart Items Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 bg-surface-soft border-b border-brand-border font-orbitron text-xs font-semibold text-content-secondary flex justify-between">
              <span>PRODUCT & SPECIFICATIONS</span>
              <span className="hidden sm:inline">LINE TOTAL</span>
            </div>
            <div className="divide-y divide-brand-border">
              {cart.map((item) => {
                const primaryImage =
                  item.product.images?.find((img) => img.is_primary)?.image_url ||
                  item.product.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={item.product.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Media + Info */}
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 rounded-2xl bg-[#FAF8FD] border border-brand-border overflow-hidden shrink-0">
                        <Image
                          src={primaryImage}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="space-y-1">
                        <Link
                          href={`/shop/${item.product.slug}`}
                          className="font-orbitron font-bold text-base text-content-primary hover:text-brand transition-colors block"
                        >
                          {item.product.name}
                        </Link>
                        <div className="text-xs text-content-muted font-sans">
                          {item.product.size} • {item.product.purity} • {item.product.category}
                        </div>
                        {item.product.cas_number && (
                          <div className="text-[11px] font-mono text-content-muted">
                            CAS: {item.product.cas_number}
                          </div>
                        )}
                        <div className="font-sans font-bold text-xs text-brand sm:hidden pt-1">
                          {formatPrice(item.product.price)} each
                        </div>
                      </div>
                    </div>

                    {/* Quantity + Line Total + Remove */}
                    <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-brand-border/40">
                      
                      {/* Controls */}
                      <div className="flex items-center border border-brand-border rounded-full bg-white px-2 py-1 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-content-secondary hover:text-brand rounded-full transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-sans font-bold text-content-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-content-secondary hover:text-brand rounded-full transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <div className="font-sans font-bold text-base text-content-primary tracking-tight">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                        <div className="text-[11px] text-content-muted font-sans hidden sm:block">
                          {formatPrice(item.product.price)} / vial
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-content-muted hover:text-accent-danger p-1 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/shop"
              className="inline-flex items-center text-xs font-orbitron font-semibold text-brand hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="font-orbitron font-bold text-lg text-content-primary border-b border-brand-border pb-3">
              ORDER SUMMARY
            </h2>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex justify-between text-content-secondary">
                <span>Items Subtotal ({totalItems} vials)</span>
                <span className="font-mono text-content-primary font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-content-secondary">
                <span>Cold-Chain Packaging</span>
                <span className="text-accent-success font-medium">Included</span>
              </div>
              <div className="flex justify-between text-content-secondary">
                <span>Estimated Standard Transit</span>
                <span className="font-mono text-content-primary">{formatPrice(15.00)}</span>
              </div>
              <div className="border-t border-brand-border pt-3 flex justify-between font-orbitron font-bold text-base text-content-primary">
                <span>Total Estimated</span>
                <span className="text-brand">{formatPrice(subtotal + 15)}</span>
              </div>
            </div>

            <Link
              href={user ? "/checkout" : "/login?redirect=/checkout"}
              className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-glow flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <span>{user ? 'PROCEED TO CHECKOUT' : 'SIGN IN TO CHECKOUT'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Compliance advisory box */}
            <div className="p-4 rounded-2xl bg-brand-subtle border border-brand-border flex items-start space-x-3 text-[11px] text-content-secondary font-sans leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span>
                By proceeding to checkout, you will be required to confirm that these materials are procured for authorized <strong className="text-brand">in vitro research use only</strong>.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
