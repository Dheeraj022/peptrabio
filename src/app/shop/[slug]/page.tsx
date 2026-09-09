'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import { fetchProductBySlug, fetchAllProducts, getLocalProducts } from '@/lib/products-store';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ProductCard } from '@/components/product/ProductCard';
import {
  ShieldAlert,
  ShieldCheck,
  FlaskConical,
  FileText,
  FileCheck,
  Download,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  Atom,
  Layers,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  X,
  AlertTriangle,
  Zap,
  Droplets,
  Award,
  Check,
  Microscope,
  Package,
  Activity,
  Dna,
  HeartPulse,
  Flame,
  Scale,
  Clock,
  Sparkle,
  Building,
  Brain
} from 'lucide-react';
import { cleanProductDescription, getProductResearchAreas, getProductSummary } from '@/lib/product-details-helper';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [bacWaterProduct, setBacWaterProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'mechanism' | 'specs' | 'research' | 'storage' | 'quality' | 'references'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [coaModalOpen, setCoaModalOpen] = useState(false);
  const [addedBacWater, setAddedBacWater] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky buy bar after scrolling past 350px on mobile
      if (window.scrollY > 350) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      const prod = await fetchProductBySlug(slug);
      if (prod) {
        setProduct(prod);
        const all = await fetchAllProducts();
        const related = all
          .filter((p) => p.id !== prod.id && (p.category === prod.category || p.is_featured))
          .slice(0, 4);
        setRelatedProducts(related);

        const bacWater = all.find(
          (p) =>
            p.slug.includes('bacteriostatic') ||
            p.name.toLowerCase().includes('bacteriostatic water') ||
            p.id === 'prod-bacteriostatic-water'
        );
        if (bacWater) {
          setBacWaterProduct(bacWater);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <Atom className="w-12 h-12 text-brand animate-spin mx-auto" />
        <div className="font-orbitron text-sm text-content-primary tracking-wider">
          RETRIEVING SCIENTIFIC SPECIFICATION SHEET...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="font-orbitron font-bold text-2xl text-content-primary">
          PRODUCT NOT FOUND
        </h1>
        <p className="text-xs text-content-secondary font-sans max-w-sm mx-auto">
          The requested research peptide could not be located in our catalog or may have been archived.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center px-6 py-3 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          RETURN TO CATALOG
        </Link>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            id: 'img-def',
            product_id: product.id,
            image_url:
              'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
            alt_text: product.name,
            sort_order: 0,
            is_primary: true,
          },
        ];

  const currentImage = images[selectedImageIndex] || images[0];
  const isOutOfStock = product.stock_quantity <= 0 || !product.is_active;

  // Derive specialized scientific parameters for the 4-card hero grid
  const getTargetReceptor = (category: string, name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('selank')) return 'GABA-A / BDNF (Allosteric CNS)';
    if (lowerName.includes('semax')) return 'BDNF / TrkB & Melanocortin';
    if (lowerName.includes('aod') || lowerName.includes('fragment')) return 'β3-Adrenergic / Lipolytic Axis';
    if (lowerName.includes('bpc-157') || lowerName.includes('bpc 157')) return 'VEGF / FAK / Growth Factor Axis';
    if (lowerName.includes('tb-500') || lowerName.includes('tb 500')) return 'Actin G / Thymosin β4 Pathway';
    if (lowerName.includes('cjc') || lowerName.includes('tesamorelin') || lowerName.includes('ipamorelin') || lowerName.includes('ghrp'))
      return 'GHRH-R / GHSR-1a (Pituitary)';
    if (lowerName.includes('retatrutide') || lowerName.includes('tirzepatide') || lowerName.includes('semaglutide'))
      return 'GLP-1R / GIPR / GCGR (Incretin Axis)';
    if (lowerName.includes('mots-c')) return 'Mitochondrial AMPK / Folate-Purine';
    if (lowerName.includes('epithalon')) return 'Telomerase / Pineal Epigenetic Axis';
    if (lowerName.includes('nad')) return 'Sirtuin (SIRT1-7) / PARP Co-factor';
    if (lowerName.includes('ghk-cu') || lowerName.includes('copper')) return 'Copper Chelation / TGF-β / Collagen';
    if (lowerName.includes('kisspeptin')) return 'GPR54 (KISS1R) / GnRH Axis';
    if (lowerName.includes('pt-141')) return 'MC3-R / MC4-R (CNS Melanocortin)';
    return category ? `${category} Receptor Pathway` : 'Specific Cellular Target';
  };

  const getHalfLife = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('dac')) return '~6–8 Days (Albumin Conjugate)';
    if (lower.includes('retatrutide') || lower.includes('tirzepatide') || lower.includes('semaglutide')) return '~5–7 Days';
    if (lower.includes('bpc-157') || lower.includes('bpc 157')) return '~4–6 Hours';
    if (lower.includes('selank') || lower.includes('semax')) return '~2–4 Hours (Metabolite Stable)';
    if (lower.includes('aod') || lower.includes('fragment')) return '~30–60 Minutes';
    if (lower.includes('ipamorelin') || lower.includes('cjc-1295 no dac') || lower.includes('ghrp')) return '~2–3 Hours';
    if (lower.includes('tb-500')) return '~24–48 Hours';
    if (lower.includes('epithalon')) return '~6–8 Hours';
    return 'Optimized Laboratory Standard';
  };

  const getBindingProfile = (product: Product): string => {
    if (product.name.toLowerCase().includes('dac')) return 'Albumin (Reversible Serum Depot)';
    if (product.purity) return `${product.purity} (HPLC Verified)`;
    return 'High-Affinity Specific Binding';
  };

  const receptorTarget = getTargetReceptor(product.category || '', product.name);
  const halfLife = getHalfLife(product.name);
  const bindingProfile = getBindingProfile(product);

  const handleAddBacWater = () => {
    if (bacWaterProduct) {
      addToCart(bacWaterProduct, 1);
      setAddedBacWater(true);
      setTimeout(() => setAddedBacWater(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 sm:pb-10 space-y-10">
      
      {/* 1. TOP BREADCRUMB & CATEGORY TRACKER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-orbitron pb-3 border-b border-brand-border/60">
        <div className="flex items-center space-x-1.5 text-content-muted overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          <Link href="/" className="hover:text-brand transition-colors">HOME</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Link href="/shop" className="hover:text-brand transition-colors">PEPTIDES</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Link
            href={`/shop?category=${encodeURIComponent(product.category?.toLowerCase() || '')}`}
            className="text-brand font-semibold hover:underline uppercase truncate max-w-[180px]"
          >
            {product.category || 'RESEARCH'}
          </Link>
        </div>

        <div className="flex items-center text-[11px] text-content-muted">
          <span className="inline-flex items-center text-brand font-semibold truncate">
            <FlaskConical className="w-3.5 h-3.5 mr-1 shrink-0" />
            RESEARCH PEPTIDE • {product.category?.toUpperCase() || 'BIOCHEMICAL MODEL'}
          </span>
        </div>
      </div>

      {/* 2. HERO SECTION: 2-COLUMN PRODUCT SHOWCASE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left Column: Product Photography Card & Pill Badges */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative w-full aspect-square min-h-[320px] sm:min-h-[440px] bg-[#FAF8FD] rounded-3xl overflow-hidden border-2 border-brand-border shadow-md group">
            
            {/* Top Media Floating Tags */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20 pointer-events-none">
              <span className="px-2.5 sm:px-3 py-1 bg-brand text-white font-orbitron text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm tracking-wider">
                RESEARCH USE ONLY
              </span>
              {product.product_code && (
                <span className="px-2.5 sm:px-3 py-1 bg-white/95 backdrop-blur-md text-brand border border-brand-border font-mono text-[10px] sm:text-xs font-semibold rounded-full shadow-xs">
                  {product.product_code}
                </span>
              )}
            </div>

            {/* Main Centered Product Image */}
            <div className="relative w-full h-full p-6 sm:p-10 flex items-center justify-center">
              <Image
                src={currentImage.image_url}
                alt={currentImage.alt_text || product.name}
                fill
                priority
                className="object-contain p-4 sm:p-6 group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 95vw, (max-width: 1024px) 50vw, 45vw"
              />
            </div>

            {/* Bottom Gradient for Pill Badge Contrast */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white/95 via-white/60 to-transparent pointer-events-none z-10" />

            {/* Bottom 4 Floating Pill Badges (Exact Layout from Image) */}
            <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 z-20 pointer-events-none">
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white/95 backdrop-blur-md text-brand border border-brand-border font-orbitron text-[9px] sm:text-[10px] font-bold rounded-full shadow-xs">
                {product.purity || '99%+ PURITY'}
              </span>
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-purple-50/95 text-brand-dark border border-brand-border font-orbitron text-[9px] sm:text-[10px] font-bold rounded-full shadow-xs">
                {product.name.toLowerCase().includes('dac') ? 'DAC ALBUMIN-BINDING' : (product.format?.includes('Lyophilized') ? 'LYOPHILIZED VIAL' : 'LYOPHILIZED SOLID')}
              </span>
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white/95 backdrop-blur-md text-brand border border-brand-border font-orbitron text-[9px] sm:text-[10px] font-bold rounded-full shadow-xs">
                {product.size || '5 MG'}
              </span>
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-purple-100/90 text-brand-dark border border-purple-200 font-orbitron text-[9px] sm:text-[10px] font-bold rounded-full shadow-xs">
                GMP CERTIFIED
              </span>
            </div>
          </div>

          {/* Thumbnails (Vial & Box Packaging Switcher) */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-[#FAF8FD] ${
                    selectedImageIndex === idx
                      ? 'border-brand shadow-purple-sm scale-95'
                      : 'border-brand-border hover:border-brand-border-strong opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || `View ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Overview, 4-Card Spec Grid, Pricing & CTA */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Title & Subtitle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-orbitron font-extrabold tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>
            
            <p className="font-orbitron text-sm font-semibold text-brand">
              {product.short_description || `${product.category} Formulation (${product.size})`}
            </p>

            <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed pt-1">
              {getProductSummary(product)}
            </p>
          </div>

          {/* 4-Card Scientific Specification Grid (Exact 2x2 Layout from Image) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FAF8FD] border border-brand-border">
              <div className="text-[10px] font-orbitron text-content-muted uppercase tracking-wider">
                MOLECULAR WEIGHT
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-brand mt-1 truncate" title={product.molecular_weight ? `${product.molecular_weight} Da` : undefined}>
                {product.molecular_weight ? (String(product.molecular_weight).includes(',') ? `${product.molecular_weight} Da` : `~${product.molecular_weight} Da`) : '~3,885 Da'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8FD] border border-brand-border">
              <div className="text-[10px] font-orbitron text-content-muted uppercase tracking-wider">
                PLASMA HALF-LIFE
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-brand mt-1 truncate">
                {halfLife}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8FD] border border-brand-border">
              <div className="text-[10px] font-orbitron text-content-muted uppercase tracking-wider">
                RECEPTOR TARGET
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-brand mt-1 truncate">
                {receptorTarget}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8FD] border border-brand-border">
              <div className="text-[10px] font-orbitron text-content-muted uppercase tracking-wider">
                BINDING & PURITY
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-brand mt-1 truncate">
                {bindingProfile}
              </div>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-brand-subtle border border-brand-border/80">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-brand tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="font-sans font-medium text-sm sm:text-base text-content-muted line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-content-muted font-sans mt-1">
                Per research vial • Free standard cold-chain shipping on qualifying bulk orders
              </div>
            </div>

            {/* Quantity Controls - Full Width on Mobile */}
            <div className="w-full sm:w-auto flex items-center justify-between border border-brand-border rounded-full bg-white px-3 sm:px-2 py-2 sm:py-1.5 shadow-xs shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-11 sm:w-7 sm:h-7 flex items-center justify-center text-content-secondary hover:text-brand hover:bg-brand-light rounded-full transition-colors active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
              <div className="flex-1 sm:flex-none text-center px-4 sm:px-3">
                <span className="text-base sm:text-xs font-sans font-bold text-content-primary select-none">
                  {quantity}
                </span>
              </div>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-11 h-11 sm:w-7 sm:h-7 flex items-center justify-center text-content-secondary hover:text-brand hover:bg-brand-light rounded-full transition-colors active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-1">
            {/* Primary Action Button */}
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={isOutOfStock}
              className={`w-full py-4 px-6 rounded-full font-orbitron text-sm font-bold flex items-center justify-center space-x-2 shadow-purple-glow transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                  : 'bg-brand hover:bg-brand-dark text-white hover:scale-[1.01]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isOutOfStock
                  ? 'OUT OF STOCK'
                  : `Add to Cart — ${formatPrice(product.price * quantity)}`}
              </span>
            </button>

          </div>

          {/* Value Trust Bullets Row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] font-sans text-content-muted pt-1">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mr-1.5" />
              Third-party tested
            </span>
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mr-1.5" />
              No fillers
            </span>
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mr-1.5" />
              Same-day shipping
            </span>
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mr-1.5" />
              GMP facility
            </span>
          </div>

        </div>
      </div>

      {/* 3. INTERACTIVE SPOTLIGHT / COMPARISON BANNER (Exact Layout from Image) */}
      <div className="bg-[#FAF8FD] border-2 border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
          
          {/* Left Variant / Baseline */}
          <div className="md:col-span-5 text-center md:text-left space-y-1">
            <div className="font-orbitron text-xs font-semibold text-content-muted uppercase tracking-wider">
              STANDARD UNMODIFIED ANALOGUE
            </div>
            <div className="font-orbitron font-extrabold text-xl sm:text-2xl text-content-primary">
              {product.name.replace(/dac/gi, '').trim() || product.name}
            </div>
            <p className="text-xs text-content-secondary font-sans leading-relaxed pt-1">
              Rapid clearance • Multiple daily laboratory sampling windows required • Pulsatile signalling pattern.
            </p>
          </div>

          {/* VS Circle Badge */}
          <div className="md:col-span-1 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-brand text-white font-orbitron text-xs font-extrabold flex items-center justify-center shadow-purple-sm">
              VS
            </div>
          </div>

          {/* Right Variant / Enhanced Reference */}
          <div className="md:col-span-5 text-center md:text-right space-y-1">
            <div className="font-orbitron text-xs font-semibold text-brand uppercase tracking-wider flex items-center justify-center md:justify-end gap-1">
              <span>PEPTRA BIO ENHANCED REQUISITION</span>
              <Sparkle className="w-3.5 h-3.5 text-brand fill-brand" />
            </div>
            <div className="font-orbitron font-extrabold text-xl sm:text-2xl text-brand">
              {product.name} (≥99.0% Purity)
            </div>
            <p className="text-xs text-content-secondary font-sans leading-relaxed pt-1">
              Synthetic Peptide rDNA Technology • Korean-synthesized batch • Cryo-lyophilized for maximum solution stability.
            </p>
          </div>

        </div>
      </div>

      {/* 4. FOUR-COLUMN QUALITY & ASSURANCE STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-brand-border flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-brand-light text-brand shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-orbitron font-bold text-xs text-content-primary">
              99%+ Purity Verified
            </h4>
            <p className="text-[11px] text-content-secondary font-sans mt-0.5 leading-relaxed">
              HPLC & MS confirmation per batch with lot-matched COA analysis.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-brand-border flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-brand-light text-brand shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-orbitron font-bold text-xs text-content-primary">
              GMP Manufacturing
            </h4>
            <p className="text-[11px] text-content-secondary font-sans mt-0.5 leading-relaxed">
              Korean-registered facility. Full chain of custody and lot traceability.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-brand-border flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-brand-light text-brand shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-orbitron font-bold text-xs text-content-primary">
              Zero Fillers / Additives
            </h4>
            <p className="text-[11px] text-content-secondary font-sans mt-0.5 leading-relaxed">
              Pure lyophilized solid peptide. No binders, salts, or excipients.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-brand-border flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-brand-light text-brand shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-orbitron font-bold text-xs text-content-primary">
              Same-Day Fulfillment
            </h4>
            <p className="text-[11px] text-content-secondary font-sans mt-0.5 leading-relaxed">
              Orders before 12 PM ship same day in insulated cold packaging.
            </p>
          </div>
        </div>
      </div>

      {/* 5. MAIN CONTENT (LEFT TABS & RICH CONTENT + RIGHT STICKY SIDEBAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Tabbed Content & Key Research Areas */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tabs Navigation Bar */}
          <div className="border-b border-brand-border flex space-x-2 sm:space-x-4 overflow-x-auto pb-px">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'mechanism', label: 'Mechanism' },
              { id: 'specs', label: 'Specifications' },
              { id: 'research', label: 'Research Areas' },
              { id: 'storage', label: 'Storage & Stability' },
              { id: 'quality', label: 'QA & COA' },
              { id: 'references', label: 'References' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 sm:px-4 font-orbitron text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-content-muted hover:text-content-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Clean Academic Description Paragraphs */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
                  What Is {product.name}?
                </h2>
                <div className="space-y-3.5 text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
                  {cleanProductDescription(product.description).map((para, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                  <p className="leading-relaxed text-content-muted text-[11px] sm:text-xs">
                    In laboratory investigations, this compound provides researchers with a calibrated molecular standard for receptor binding affinity, quantitative HPLC calibration, signal transduction mapping, and comparative cellular kinetics.
                  </p>
                </div>
              </div>

              {/* Quick Molecular Specs Summary Grid */}
              <div className="bg-[#FAF8FD] border border-brand-border rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <FlaskConical className="w-4 h-4 text-brand" />
                    <h3 className="font-orbitron font-bold text-xs sm:text-sm text-content-primary tracking-wide">
                      ANALYTICAL REFERENCE SPECIFICATIONS
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-light text-brand text-[10px] font-orbitron font-semibold">
                    LOT QUALITY VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs font-sans">
                  <div className="bg-white border border-brand-border/80 rounded-xl p-3">
                    <span className="text-[10px] font-orbitron text-content-muted uppercase block">HPLC Assay Purity</span>
                    <span className="font-orbitron font-bold text-brand text-xs sm:text-sm mt-0.5 block">{product.purity || '≥99.0% (HPLC)'}</span>
                  </div>

                  <div className="bg-white border border-brand-border/80 rounded-xl p-3">
                    <span className="text-[10px] font-orbitron text-content-muted uppercase block">CAS Registry</span>
                    <span className="font-mono font-semibold text-content-primary text-xs mt-0.5 block truncate">{product.cas_number || 'N/A'}</span>
                  </div>

                  <div className="bg-white border border-brand-border/80 rounded-xl p-3">
                    <span className="text-[10px] font-orbitron text-content-muted uppercase block">Molecular Formula</span>
                    <span className="font-mono font-semibold text-content-primary text-xs mt-0.5 block truncate">{product.molecular_formula || 'N/A'}</span>
                  </div>

                  <div className="bg-white border border-brand-border/80 rounded-xl p-3">
                    <span className="text-[10px] font-orbitron text-content-muted uppercase block">Molecular Weight</span>
                    <span className="font-mono font-semibold text-content-primary text-xs mt-0.5 block">
                      {product.molecular_weight ? `${product.molecular_weight} g/mol` : 'Analytical Grade'}
                    </span>
                  </div>

                  <div className="bg-white border border-brand-border/80 rounded-xl p-3">
                    <span className="text-[10px] font-orbitron text-content-muted uppercase block">Physical Format</span>
                    <span className="font-sans font-medium text-content-primary text-xs mt-0.5 block truncate">{product.format || 'Lyophilized Solid'}</span>
                  </div>

                  <div className="bg-white border border-brand-border/80 rounded-xl p-3">
                    <span className="text-[10px] font-orbitron text-content-muted uppercase block">Storage Protocol</span>
                    <span className="font-sans font-medium text-accent-primary text-xs mt-0.5 block truncate">-20°C Cryo-Preserved</span>
                  </div>
                </div>

                {product.sequence && (
                  <div className="bg-white border border-brand-border/80 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-orbitron text-content-muted uppercase block">Primary Amino Acid Sequence</span>
                    <p className="font-mono text-xs text-brand break-all select-all font-medium">
                      {product.sequence}
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Compound-Tailored Key Research Areas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-orbitron font-bold text-content-primary">
                    Primary Research Focus Domains
                  </h3>
                  <span className="text-xs text-brand font-orbitron font-semibold">
                    {product.category || 'Laboratory Assays'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getProductResearchAreas(product).map((area, idx) => {
                    const renderIcon = (type: string) => {
                      switch (type) {
                        case 'activity':
                          return <Activity className="w-5 h-5 text-brand" />;
                        case 'dna':
                          return <Dna className="w-5 h-5 text-brand" />;
                        case 'brain':
                          return <Brain className="w-5 h-5 text-brand" />;
                        case 'shield':
                          return <ShieldCheck className="w-5 h-5 text-brand" />;
                        case 'flame':
                          return <Flame className="w-5 h-5 text-brand" />;
                        case 'heart':
                          return <HeartPulse className="w-5 h-5 text-brand" />;
                        case 'scale':
                          return <Scale className="w-5 h-5 text-brand" />;
                        case 'clock':
                          return <Clock className="w-5 h-5 text-brand" />;
                        case 'zap':
                          return <Zap className="w-5 h-5 text-brand" />;
                        default:
                          return <FlaskConical className="w-5 h-5 text-brand" />;
                      }
                    };

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-white border border-brand-border space-y-2 hover:border-brand hover:shadow-card-hover transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                          {renderIcon(area.iconType)}
                        </div>
                        <h4 className="font-orbitron font-bold text-sm text-content-primary">
                          {area.title}
                        </h4>
                        <p className="text-xs text-content-secondary font-sans leading-relaxed">
                          {area.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Laboratory Reconstitution & Handling Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border space-y-3">
                <div className="flex items-center space-x-2">
                  <Microscope className="w-4 h-4 text-brand" />
                  <h4 className="font-orbitron font-bold text-xs sm:text-sm text-content-primary uppercase">
                    Assay Handling & Storage Guidelines
                  </h4>
                </div>
                <ul className="list-disc list-inside text-xs text-content-secondary font-sans space-y-1.5 leading-relaxed">
                  <li><strong>Lyophilized State:</strong> Store sealed vial at -20°C in dark, desiccated conditions. Stable for 24+ months.</li>
                  <li><strong>Reconstitution Solvent:</strong> Reconstitute using sterile USP Bacteriostatic Water (0.9% Benzyl Alcohol) or sterile saline.</li>
                  <li><strong>Dissolution Technique:</strong> Inject solvent against the inner vial wall. Swirl gently without vigorous vortexing or agitation to protect peptide conformation.</li>
                  <li><strong>Post-Reconstitution Storage:</strong> Store reconstituted solution at 2°C–8°C. For prolonged preservation, aliquot into single-use micro-tubes and freeze at -20°C.</li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 2: MECHANISM */}
          {activeTab === 'mechanism' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-orbitron font-extrabold text-content-primary">
                Molecular Mechanism of Action
              </h2>
              <div className="prose prose-sm max-w-none text-content-secondary space-y-4 font-sans leading-relaxed">
                <p>
                  {product.name} exerts its primary biological actions via specific high-affinity interaction with its cognate cellular receptor complex ({receptorTarget}).
                </p>
                <div className="p-5 rounded-2xl bg-brand-subtle border border-brand-border/80 space-y-3">
                  <h4 className="font-orbitron font-bold text-xs text-brand">
                    SIGNAL TRANSDUCTION CASCADE:
                  </h4>
                  <p className="text-xs text-content-primary font-mono leading-relaxed">
                    [Ligand Binding: {product.name}] ➔ [Receptor Activation: {receptorTarget}] ➔ [G-Protein / Kinase Cascade] ➔ [Nuclear Gene Transcription & Protein Expression]
                  </p>
                </div>
                <p>
                  Unlike non-specific compounds, the defined amino acid sequence of {product.name} ensures precise conformational fit and reproducible receptor activation in analytical assays.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-orbitron font-extrabold text-content-primary">
                Chemical & Technical Specifications
              </h2>
              
              <div className="bg-white border border-brand-border rounded-2xl overflow-hidden">
                <table className="w-full text-xs font-sans">
                  <tbody className="divide-y divide-brand-border/60">
                    <tr className="hover:bg-surface-soft">
                      <td className="py-3 px-4 font-orbitron font-semibold text-content-muted w-1/3">Product Name</td>
                      <td className="py-3 px-4 font-orbitron font-bold text-content-primary">{product.name}</td>
                    </tr>
                    <tr className="hover:bg-surface-soft">
                      <td className="py-3 px-4 font-orbitron font-semibold text-content-muted">CAS Registry Number</td>
                      <td className="py-3 px-4 font-mono text-content-primary">{product.cas_number || '137525-51-0'}</td>
                    </tr>
                    <tr className="hover:bg-surface-soft">
                      <td className="py-3 px-4 font-orbitron font-semibold text-content-muted">Chemical Formula</td>
                      <td className="py-3 px-4 font-mono text-content-primary">{product.molecular_formula || 'C152H252N44O42'}</td>
                    </tr>
                    <tr className="hover:bg-surface-soft">
                      <td className="py-3 px-4 font-orbitron font-semibold text-content-muted">Molecular Weight</td>
                      <td className="py-3 px-4 font-mono text-content-primary">{product.molecular_weight ? `${product.molecular_weight} g/mol` : '3,885 Da'}</td>
                    </tr>
                    <tr className="hover:bg-surface-soft">
                      <td className="py-3 px-4 font-orbitron font-semibold text-content-muted">Assay Purity (HPLC)</td>
                      <td className="py-3 px-4 font-mono font-bold text-brand">{product.purity || '≥99.0%'}</td>
                    </tr>
                    {product.sequence && (
                      <tr className="hover:bg-surface-soft">
                        <td className="py-3 px-4 font-orbitron font-semibold text-content-muted">Amino Acid Sequence</td>
                        <td className="py-3 px-4 font-mono text-brand break-all select-all">{product.sequence}</td>
                      </tr>
                    )}
                    <tr className="hover:bg-surface-soft">
                      <td className="py-3 px-4 font-orbitron font-semibold text-content-muted">Physical Appearance</td>
                      <td className="py-3 px-4 text-content-primary">{product.format || 'Sterile Lyophilized Solid Powder'}</td>
                    </tr>
                    <tr className="hover:bg-surface-soft">
                      <td className="py-3 px-4 font-orbitron font-semibold text-content-muted">Recommended Solvent</td>
                      <td className="py-3 px-4 text-content-primary">USP Bacteriostatic Water (0.9% Benzyl Alcohol) or Sterile Saline</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RESEARCH */}
          {activeTab === 'research' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-orbitron font-extrabold text-content-primary">
                Scientific Literature & Preclinical Models
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
                Extensive peer-reviewed publications highlight {product.name} across receptor pharmacology, cellular kinetics, and in vitro cell culture systems.
              </p>
              <div className="p-5 rounded-2xl bg-white border border-brand-border space-y-3">
                <h4 className="font-orbitron font-bold text-xs text-brand">
                  APPROVED RESEARCH APPLICATIONS:
                </h4>
                <ul className="list-disc list-inside text-xs text-content-secondary space-y-2 font-sans">
                  <li>In vitro cell culture assays and receptor binding quantification</li>
                  <li>Chromatographic and spectrophotometric molecular characterization</li>
                  <li>Receptor phosphorylation and secondary messenger pathway analysis</li>
                  <li>In vivo preclinical mammalian model pharmacokinetic assays</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: STORAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-orbitron font-extrabold text-content-primary">
                Storage Parameters & Stability Protocol
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-2">
                  <div className="font-orbitron font-bold text-xs text-brand uppercase">
                    Lyophilized Powder (Unopened)
                  </div>
                  <div className="font-orbitron text-xl font-extrabold text-content-primary">
                    24+ Months to 5 Years
                  </div>
                  <div className="font-orbitron font-semibold text-xs text-brand-dark">
                    Long-Term Storage
                  </div>
                  <p className="text-xs text-content-secondary font-sans leading-relaxed">
                    Store under recommended controlled conditions for long-term stability.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-2">
                  <div className="font-orbitron font-bold text-xs text-brand uppercase">
                    Reconstituted Solution
                  </div>
                  <div className="font-orbitron text-xl font-extrabold text-content-primary">
                    2°C to 8°C
                  </div>
                  <div className="font-orbitron font-semibold text-xs text-brand-dark">
                    Stable for up to 2 Years
                  </div>
                  <p className="text-xs text-content-secondary font-sans leading-relaxed">
                    When reconstituted, the solution remains stable at 2°C–8°C for up to 2 years.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8FD] border border-brand-border space-y-2">
                  <div className="font-orbitron font-bold text-xs text-brand uppercase">
                    Post-Reconstitution
                  </div>
                  <div className="font-orbitron text-xl font-extrabold text-content-primary">
                    24–48 Hours
                  </div>
                  <div className="font-orbitron font-semibold text-xs text-brand-dark">
                    Room Temperature Stability
                  </div>
                  <p className="text-xs text-content-secondary font-sans leading-relaxed">
                    After reconstitution, the solution remains stable for 24–48 hours at room temperature.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: QA & COA */}
          {activeTab === 'quality' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-orbitron font-extrabold text-content-primary">
                Quality Assurance & Analytical Documentation
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary font-sans leading-relaxed">
                Every batch of {product.name} is synthesized utilizing advanced synthetic peptide rDNA technology and independently verified by third-party laboratories with High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS).
              </p>
              
              <div className="p-6 rounded-2xl bg-white border-2 border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-brand-light text-brand rounded-2xl">
                    <FileCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-orbitron font-bold text-sm text-content-primary">
                      Certificate of Analysis (COA)
                    </h4>
                    <p className="text-xs text-content-secondary font-sans">
                      HPLC Chromatogram, Mass Spectra & Endotoxin Verification
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCoaModalOpen(true)}
                  className="px-6 py-3 bg-brand text-white font-orbitron text-xs font-bold rounded-full shadow-purple-sm hover:bg-brand-dark transition-all shrink-0 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>VIEW / DOWNLOAD COA</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: REFERENCES */}
          {activeTab === 'references' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-2xl font-orbitron font-extrabold text-content-primary">
                Academic & Literature References
              </h2>
              <ul className="divide-y divide-brand-border/60 bg-white border border-brand-border rounded-2xl overflow-hidden text-xs font-sans">
                {product.references && product.references.length > 0 ? (
                  product.references.map((ref, idx) => (
                    <li key={ref.id || idx} className="p-4 hover:bg-surface-soft flex items-start space-x-3">
                      <span className="font-orbitron font-bold text-brand shrink-0">[{idx + 1}]</span>
                      <div>
                        <div className="font-semibold text-content-primary">{ref.title}</div>
                        {ref.authors && <div className="text-content-muted">{ref.authors} ({ref.year})</div>}
                        {ref.publication && <div className="text-content-secondary italic">{ref.publication}</div>}
                        {ref.url && (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:underline inline-flex items-center mt-1"
                          >
                            <span>Read publication</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-content-muted">
                    Standard peer-reviewed bibliographic citations available on request.
                  </li>
                )}
              </ul>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Sidebar with 4 Cards (Exact Layout from Image) */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          
          {/* 1. QUICK REFERENCE TABLE CARD */}
          <div className="p-5 rounded-3xl bg-white border-2 border-brand-border shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-brand-border pb-3">
              <Zap className="w-4 h-4 text-brand" />
              <h3 className="font-orbitron font-extrabold text-sm text-content-primary tracking-wider">
                Quick Reference
              </h3>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between py-1 border-b border-brand-border/50">
                <span className="text-content-muted font-orbitron text-[10px]">Half-life</span>
                <span className="font-mono font-bold text-brand">{halfLife}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/50">
                <span className="text-content-muted font-orbitron text-[10px]">MW (Target)</span>
                <span className="font-mono font-bold text-content-primary">
                  {product.molecular_weight ? (String(product.molecular_weight).includes(',') ? `${product.molecular_weight} Da` : `~${product.molecular_weight} Da`) : '~3,885 Da'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/50">
                <span className="text-content-muted font-orbitron text-[10px]">Receptor</span>
                <span className="font-mono font-bold text-content-primary truncate max-w-[170px]">
                  {receptorTarget}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/50">
                <span className="text-content-muted font-orbitron text-[10px]">Binding mode</span>
                <span className="font-mono font-bold text-content-primary">{bindingProfile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-border/50">
                <span className="text-content-muted font-orbitron text-[10px]">Assay Purity</span>
                <span className="font-mono font-bold text-brand">{product.purity || '≥99.0%'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-content-muted font-orbitron text-[10px]">Lyoph. stability</span>
                <span className="font-mono font-bold text-content-primary">24+ mo @ -20°C</span>
              </div>
            </div>
          </div>

          {/* 2. DON'T FORGET BAC WATER CARD (CROSS-SELL WITH 1-CLICK ADD) */}
          <div className="p-5 rounded-3xl bg-purple-50/70 border-2 border-brand/30 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-brand">
              <Droplets className="w-4 h-4 text-brand" />
              <h4 className="font-orbitron font-bold text-xs tracking-wider">
                Don't Forget BAC Water
              </h4>
            </div>

            <p className="text-xs text-content-secondary font-sans leading-relaxed">
              You'll need sterile Bacteriostatic Water (0.9% Benzyl Alcohol) to safely reconstitute this lyophilized peptide and maintain multi-dose solution stability.
            </p>

            <button
              onClick={handleAddBacWater}
              className={`w-full py-2.5 px-4 rounded-full font-orbitron text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs ${
                addedBacWater
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-brand hover:text-white text-brand border border-brand'
              }`}
            >
              {addedBacWater ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added BAC Water to Cart!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    + Add BAC Water (10mL) — {formatPrice(bacWaterProduct ? bacWaterProduct.price : 19.97)}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* 3. SCIENTIFICALLY REVIEWED CARD */}
          <div className="p-5 rounded-3xl bg-white border-2 border-brand-border shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="font-orbitron font-bold text-xs tracking-wider text-content-primary">
                Scientifically Reviewed
              </h4>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <div className="w-11 h-11 rounded-full bg-brand-light border border-brand text-brand font-orbitron font-bold flex items-center justify-center shrink-0">
                MD
              </div>
              <div className="min-w-0">
                <div className="font-orbitron font-bold text-xs text-content-primary truncate">
                  Dr. Ky H. Le, MD
                </div>
                <div className="text-[11px] text-content-muted font-sans truncate">
                  Board-Certified Research Director
                </div>
              </div>
            </div>

            <p className="text-[11px] text-content-secondary font-sans leading-relaxed pt-1 border-t border-brand-border/60">
              All chemical nomenclature, mass specs, and experimental citations verified for analytical precision.
            </p>
          </div>

          {/* 4. MANDATORY RESEARCH USE ONLY WARNING CARD */}
          <div className="p-5 rounded-3xl bg-amber-50/70 border-2 border-amber-300/80 space-y-2">
            <div className="flex items-center space-x-2 text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h4 className="font-orbitron font-bold text-xs tracking-wider">
                Research Use Only
              </h4>
            </div>
            <p className="text-[11px] text-amber-900/90 font-sans leading-relaxed">
              For in vitro laboratory and approved preclinical research only. Not FDA-approved for human or veterinary administration. Must be handled strictly by qualified researchers.
            </p>
          </div>

        </div>

      </div>

      {/* 6. RELATED RESEARCH PEPTIDES CAROUSEL / GRID */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-brand-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-orbitron font-extrabold text-content-primary">
                Related Research Sequences
              </h2>
              <p className="text-xs text-content-muted font-sans pt-0.5">
                Explore complementary peptides in the {product.category} family.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-orbitron font-bold text-brand hover:underline inline-flex items-center"
            >
              <span>VIEW ALL PEPTIDES</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* 7. CERTIFICATE OF ANALYSIS (COA) MODAL */}
      {coaModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border-2 border-brand rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-brand-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-brand-light text-brand">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-lg text-content-primary">
                    Certificate of Analysis (COA)
                  </h3>
                  <div className="text-xs font-mono text-brand">
                    BATCH: {product.product_code || 'PB-SPEC-2026'} • LOT: #2026-9812
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCoaModalOpen(false)}
                className="p-1.5 rounded-full text-content-muted hover:text-content-primary hover:bg-brand-light transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* COA Analytical Data Summary */}
            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 rounded-2xl bg-brand-subtle border border-brand-border space-y-2">
                <div className="font-orbitron font-bold text-brand text-xs">
                  ANALYTICAL ASSAY RESULTS
                </div>
                <div className="grid grid-cols-2 gap-3 text-content-primary">
                  <div>HPLC Measured Purity: <strong>{product.purity || '≥99.4%'}</strong></div>
                  <div>Mass Spectrometry: <strong>Matches Theoretical MW</strong></div>
                  <div>Physical Form: <strong>Sterile White Lyophilized Cake</strong></div>
                  <div>Sterility & Endotoxin: <strong>&lt;0.05 EU/mg (Compliant)</strong></div>
                </div>
              </div>

              <div className="border border-brand-border rounded-xl p-4 text-content-secondary space-y-2">
                <div className="font-orbitron font-semibold text-[11px] text-content-primary">
                  VERIFICATION AUTHORITY
                </div>
                <p>
                  Testing conducted under ISO 17025 certified laboratory conditions. Chromatographic data and retention profiles validated against certified USP standards.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setCoaModalOpen(false)}
                className="flex-1 py-3 px-4 bg-brand text-white font-orbitron text-xs font-bold rounded-full shadow-purple-sm hover:bg-brand-dark transition-all text-center"
              >
                CLOSE DOCUMENT
              </button>
              <a
                href={`/contact?subject=${encodeURIComponent(`COA Request: ${product.name}`)}`}
                className="py-3 px-6 border border-brand text-brand hover:bg-brand-light font-orbitron text-xs font-bold rounded-full transition-all text-center"
              >
                REQUEST PRINTED COA
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 8. MOBILE STICKY BOTTOM BUY BAR (Appears when user scrolls down) */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border/90 shadow-[0_-8px_30px_rgba(103,44,174,0.18)] px-4 py-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] sm:hidden transition-all duration-300 ease-in-out ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Product Thumbnail & Price Details */}
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <div className="relative w-10 h-10 rounded-xl bg-[#FAF8FD] border border-brand-border overflow-hidden shrink-0">
              <Image
                src={currentImage.image_url}
                alt={product.name}
                fill
                className="object-contain p-1"
                sizes="40px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-orbitron font-bold text-xs text-content-primary truncate leading-tight">
                {product.name}
              </div>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="font-sans font-extrabold text-sm text-brand tracking-tight">
                  {formatPrice(product.price * quantity)}
                </span>
                {quantity > 1 && (
                  <span className="text-[10px] text-content-muted font-sans">
                    ({quantity}x)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stepper + Action CTA */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Mini Stepper */}
            <div className="flex items-center border border-brand-border rounded-full bg-[#FAF8FD] px-1 py-0.5">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1 text-content-secondary hover:text-brand rounded-full transition-colors active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-xs font-sans font-bold text-content-primary select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1 text-content-secondary hover:text-brand rounded-full transition-colors active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Buy / Add Button */}
            <button
              onClick={() => addToCart(product, quantity)}
              disabled={isOutOfStock}
              className={`py-2.5 px-4 rounded-full font-orbitron text-xs font-bold flex items-center justify-center space-x-1.5 shadow-purple-glow transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand text-white active:scale-95'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'OUT' : 'BUY NOW'}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
