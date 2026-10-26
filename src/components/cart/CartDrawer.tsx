'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldAlert, ShoppingBag } from 'lucide-react';

export function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with smooth fade-in */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-fade"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div className="w-screen max-w-md bg-white border-l border-brand-border shadow-2xl flex flex-col pointer-events-auto animate-drawer-slide">
          {/* Header */}
          <div className="p-5 border-b border-brand-border flex items-center justify-between bg-surface-soft">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-orbitron font-bold text-base sm:text-lg text-content-primary">
                RESEARCH CART ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-content-muted hover:text-content-primary hover:bg-brand-light transition-all hover:rotate-90 duration-200"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Research Use Notice in Cart */}
          <div className="bg-brand-subtle px-4 py-2.5 border-b border-brand-border/60 flex items-start space-x-2 text-[11px] text-content-secondary">
            <ShieldAlert className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <span>
              All materials are strictly for <strong className="text-brand">in vitro laboratory research use only</strong>. Not for human or veterinary use.
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 animate-cart-item">
                <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-brand">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-orbitron font-semibold text-content-primary">Your cart is empty</p>
                <p className="text-xs text-content-secondary max-w-xs">
                  Explore our high-purity synthesized research peptides catalog to add items.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 bg-brand text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm hover:bg-brand-dark transition-all hover:scale-105"
                >
                  BROWSE PEPTIDES
                </Link>
              </div>
            ) : (
              cart.map((item, idx) => {
                const img =
                  item.product.images?.find((i) => i.is_primary)?.image_url ||
                  item.product.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={item.product.id}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    className="flex space-x-3.5 p-3 rounded-2xl border border-brand-border bg-white hover:border-brand/60 hover:shadow-sm transition-all duration-200 relative group animate-cart-item"
                  >
                    <div className="relative w-16 h-16 rounded-xl bg-[#FAF8FD] overflow-hidden border border-brand-border flex-shrink-0">
                      <Image
                        src={img}
                        alt={item.product.name}
                        fill
                        className="object-cover p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-orbitron font-semibold text-xs text-content-primary truncate max-w-[180px]">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] font-mono text-content-muted">
                            {item.product.size}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-content-muted hover:text-accent-danger p-1 transition-colors hover:scale-110"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-brand-border rounded-full bg-[#FAF8FD] px-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-brand-light text-content-secondary rounded-full transition-colors active:scale-90"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-orbitron font-semibold text-content-primary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-brand-light text-content-secondary rounded-full transition-colors active:scale-90"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="font-sans font-bold text-brand text-sm tracking-tight">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-brand-border bg-surface-soft space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-content-secondary">
                  <span>Estimated Shipping</span>
                  <span className="text-accent-success font-medium">Calculated at Checkout</span>
                </div>
                <div className="flex justify-between items-baseline text-sm font-orbitron font-bold text-content-primary">
                  <span>Subtotal</span>
                  <span className="font-sans text-lg text-brand font-extrabold tracking-tight">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 px-4 border border-brand text-brand hover:bg-brand-light font-orbitron text-xs font-semibold rounded-full text-center transition-all hover:scale-[1.02]"
                >
                  VIEW CART
                </Link>
                <Link
                  href={user ? "/checkout" : "/login?redirect=/checkout"}
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 px-4 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full text-center shadow-purple-sm flex items-center justify-center group transition-all hover:scale-[1.02]"
                >
                  {user ? 'CHECKOUT' : 'SIGN IN TO ORDER'}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
