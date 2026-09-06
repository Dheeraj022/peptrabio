'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ShoppingBag, Eye, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const primaryImage =
    product.images?.find((i) => i.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';

  const isOutOfStock = product.stock_quantity <= 0 || !product.is_active;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    router.push(`/shop/${product.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white border border-brand-border hover:border-brand rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      
      {/* Top Media & Badges */}
      <div>
        <div className="relative w-full aspect-square bg-[#FAF8FD] rounded-lg sm:rounded-xl overflow-hidden border border-brand-border/60 mb-2 sm:mb-4 group-hover:border-brand-border-strong transition-colors">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Top badges */}
          <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 items-start">
            {product.is_featured && (
              <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-brand text-white font-orbitron text-[8px] sm:text-[10px] font-bold tracking-wider rounded-full shadow-sm">
                FEATURED
              </span>
            )}
            {product.category && (
              <span className="hidden sm:inline-block px-2.5 py-1 bg-white/90 backdrop-blur-sm text-brand-dark font-orbitron text-[9px] font-semibold tracking-wider rounded-full border border-brand-border shadow-xs">
                {product.category.toUpperCase()}
              </span>
            )}
          </div>

          {/* Quick Actions overlay on hover */}
          <div className="hidden sm:flex absolute inset-0 bg-brand-dark/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
            <div
              className="p-3 bg-white text-brand rounded-full shadow-md hover:scale-110 transition-transform"
              title="View Research Specifications"
            >
              <Eye className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Product Identifiers & Name */}
        <div className="flex items-center justify-between mb-0.5 sm:mb-1">
          <span className="font-mono text-[9px] sm:text-[11px] text-brand font-medium truncate max-w-[55%]">
            {product.product_code || 'PB-SPEC'}
          </span>
          <span className="font-mono text-[9px] sm:text-[11px] text-content-muted font-medium shrink-0">
            {product.size}
          </span>
        </div>

        <h3 className="font-orbitron font-bold text-xs sm:text-base text-content-primary leading-tight sm:leading-snug mb-1 line-clamp-1 sm:line-clamp-2 group-hover:text-brand transition-colors">
          {product.name}
        </h3>

        {/* Short Description (Hidden on mobile 2-col for sleek density) */}
        <p className="hidden sm:block text-xs text-content-secondary line-clamp-2 mb-3 font-sans leading-relaxed">
          {product.short_description || product.description || 'Verified synthetic research peptide formulation.'}
        </p>

        {/* Technical metadata (CAS) */}
        {product.cas_number && (
          <div className="hidden sm:flex text-[11px] font-sans text-content-muted mb-3 items-center gap-1">
            <span className="font-orbitron text-[10px] text-gray-400">CAS:</span>
            <span>{product.cas_number}</span>
          </div>
        )}
      </div>

      {/* Pricing, Stock Status & CTAs */}
      <div className="pt-2 sm:pt-3 border-t border-brand-border/60">
        <div className="flex items-baseline justify-between mb-2 sm:mb-3">
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="font-sans font-bold text-sm sm:text-lg text-content-primary tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="font-sans font-medium text-[10px] sm:text-xs text-content-muted line-through hidden xs:inline">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="text-[8px] sm:text-[11px] font-orbitron flex items-center">
            {isOutOfStock ? (
              <span className="text-accent-danger flex items-center font-medium">
                <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                <span className="hidden xs:inline">OUT OF </span>STOCK
              </span>
            ) : isLowStock ? (
              <span className="text-accent-warning flex items-center font-medium">
                <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                LOW
              </span>
            ) : (
              <span className="text-accent-success flex items-center font-medium">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                <span className="hidden xs:inline">IN </span>STOCK
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <div
            className="flex items-center justify-center py-1.5 sm:py-2.5 px-1.5 sm:px-3 rounded-full border border-brand-border hover:border-brand text-content-primary hover:text-brand text-[10px] sm:text-xs font-orbitron font-semibold transition-all group/btn"
          >
            <span>DETAILS</span>
            <ArrowUpRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ml-0.5 sm:ml-1 opacity-70 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            disabled={isOutOfStock}
            className={`flex items-center justify-center py-1.5 sm:py-2.5 px-1.5 sm:px-3 rounded-full text-[10px] sm:text-xs font-orbitron font-semibold transition-all shadow-purple-sm ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-brand hover:bg-brand-dark text-white hover:scale-[1.02]'
            }`}
          >
            <ShoppingBag className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
            <span>ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
}
