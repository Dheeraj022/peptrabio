'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { fetchAllProducts } from '@/lib/products-store';
import { ProductCard } from '@/components/product/ProductCard';
import {
  ShieldCheck,
  FlaskConical,
  FileCheck2,
  Atom,
  ArrowRight,
  Search,
  CheckCircle2,
  Sparkles,
  Layers,
  ThermometerSnowflake,
  ExternalLink
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchAllProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const featuredProducts = products.filter((p) => p.is_featured && p.is_active).slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-brand-border/60">
        {/* Subtle decorative purple glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-light border border-brand/20 text-brand text-xs font-orbitron font-semibold tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>CERTIFIED ANALYTICAL RESEARCH CATALOG</span>
              </div>

              {/* Main Headline in Orbitron */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-orbitron font-extrabold tracking-tight leading-[1.15]">
                ADVANCED <br />
                RESEARCH MATERIALS
              </h1>

              {/* Sub-headline */}
              <p className="font-orbitron text-base sm:text-lg text-content-secondary font-medium tracking-wide">
                Precision. Documentation. Research.
              </p>

              {/* Description */}
              <p className="text-sm sm:text-base text-content-secondary max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
                Explore a curated catalog of research-use peptides with certified HPLC purity verification, mass spectrometry documentation, and batch traceability for scientific laboratories.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-4 bg-brand hover:bg-brand-dark text-white font-orbitron text-sm font-semibold rounded-full shadow-purple-glow hover:scale-[1.02] transition-all flex items-center justify-center group"
                >
                  <span>SHOP PRODUCTS</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/about"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-brand-subtle text-content-primary hover:text-brand border border-brand-border hover:border-brand font-orbitron text-sm font-semibold rounded-full transition-all flex items-center justify-center"
                >
                  LEARN MORE
                </Link>
              </div>

              {/* Fast Spec Stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-brand-border/60 max-w-md mx-auto lg:mx-0 text-center">
                <div>
                  <div className="font-orbitron font-bold text-xl text-brand">99%+</div>
                  <div className="text-[11px] text-content-muted font-sans uppercase">HPLC Purity</div>
                </div>
                <div>
                  <div className="font-orbitron font-bold text-xl text-content-primary">100%</div>
                  <div className="text-[11px] text-content-muted font-sans uppercase">Batch COAs</div>
                </div>
                <div>
                  <div className="font-orbitron font-bold text-xl text-content-primary">-20°C</div>
                  <div className="text-[11px] text-content-muted font-sans uppercase">Cold Stored</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Futuristic Vial Presentation */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Glow ring */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-purple-300/10 rounded-3xl filter blur-2xl -z-10" />

                {/* Hero Showcase Card */}
                <div className="bg-white border-2 border-brand-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                  
                  {/* Top card header */}
                  <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Atom className="w-5 h-5 text-brand" />
                      <span className="font-orbitron font-bold text-xs text-content-primary tracking-wider">
                        BATCH ANALYTICAL SPECIMEN
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-accent-success/10 text-accent-success text-[10px] font-orbitron font-semibold">
                      PASSED QC
                    </span>
                  </div>

                  {/* High Quality Vial Image */}
                  <div className="relative aspect-video sm:aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF8FD] border border-brand-border mb-4">
                    <Image
                      src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80"
                      alt="Peptra Bio Lyophilized Research Vial"
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white flex justify-between items-end">
                      <div>
                        <div className="font-orbitron font-bold text-sm tracking-wider">SELANK (5 MG)</div>
                        <div className="text-[10px] text-gray-200 font-sans">Sequence: Thr-Lys-Pro-Arg-Pro-Gly-Pro</div>
                      </div>
                      <div className="font-orbitron text-xs font-semibold px-2.5 py-1 bg-brand/90 backdrop-blur-md rounded-full">
                        $68.00
                      </div>
                    </div>
                  </div>

                  {/* Micro Specs List */}
                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex justify-between py-1 border-b border-brand-border/40 text-content-secondary">
                      <span className="font-orbitron text-[11px]">Formula</span>
                      <span className="font-mono text-content-primary font-medium">C33H57N11O9</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-brand-border/40 text-content-secondary">
                      <span className="font-orbitron text-[11px]">Molecular Weight</span>
                      <span className="font-mono text-content-primary font-medium">751.87 g/mol</span>
                    </div>
                    <div className="flex justify-between py-1 text-content-secondary">
                      <span className="font-orbitron text-[11px]">Storage</span>
                      <span className="text-content-primary">-20°C Desiccated</span>
                    </div>
                  </div>

                  {/* Card footer CTA */}
                  <div className="mt-4 pt-4 border-t border-brand-border">
                    <Link
                      href="/shop/selank"
                      className="w-full py-2.5 bg-brand-light hover:bg-brand text-brand hover:text-white font-orbitron text-xs font-semibold rounded-full flex items-center justify-center transition-all"
                    >
                      <span>INSPECT SPECIFICATION SHEET</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST & SCIENTIFIC VERIFICATION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-brand-border hover:border-brand transition-all shadow-sm flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-brand-light text-brand shrink-0">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-xs text-content-primary uppercase tracking-wider mb-1">
                HPLC & MS Analysis
              </h3>
              <p className="text-xs text-content-secondary font-sans leading-relaxed">
                Every batch is subjected to high-performance liquid chromatography for certified &gt;99% purity.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-brand-border hover:border-brand transition-all shadow-sm flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-brand-light text-brand shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-xs text-content-primary uppercase tracking-wider mb-1">
                Public Batch COAs
              </h3>
              <p className="text-xs text-content-secondary font-sans leading-relaxed">
                Downloadable Certificates of Analysis and mass spectrometer spectrum sheets for all catalog lots.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-brand-border hover:border-brand transition-all shadow-sm flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-brand-light text-brand shrink-0">
              <ThermometerSnowflake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-xs text-content-primary uppercase tracking-wider mb-1">
                Cold Chain Integrity
              </h3>
              <p className="text-xs text-content-secondary font-sans leading-relaxed">
                Sealed lyophilized glass vials dispatched in insulated packaging to prevent peptide degradation.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-brand-border hover:border-brand transition-all shadow-sm flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-brand-light text-brand shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-xs text-content-primary uppercase tracking-wider mb-1">
                Compliance Assured
              </h3>
              <p className="text-xs text-content-secondary font-sans leading-relaxed">
                Synthesized solely for accredited in vitro laboratory investigations and educational research.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <div className="text-xs font-orbitron text-brand font-semibold tracking-wider uppercase mb-1">
              Curated Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary tracking-tight">
              FEATURED RESEARCH PRODUCTS
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center text-xs font-orbitron font-semibold text-brand hover:text-brand-dark transition-colors"
          >
            <span>VIEW COMPLETE CATALOG</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* 4 Cards Responsive Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-brand-border rounded-xl sm:rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4 animate-pulse">
                <div className="w-full aspect-square bg-brand-subtle rounded-lg sm:rounded-xl" />
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-2.5 sm:h-3 bg-gray-100 rounded w-full" />
                <div className="h-7 sm:h-8 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. RESEARCH CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8FD] border border-brand-border rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-content-primary">
              EXPLORE RESEARCH CATEGORIES
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary font-sans">
              Discover peptides classified by biochemical research domain and molecular structure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link
              href="/shop?category=neuropeptides"
              className="p-6 rounded-2xl bg-white border border-brand-border hover:border-brand hover:shadow-card-hover transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-light text-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Atom className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-sm text-content-primary group-hover:text-brand transition-colors mb-1.5">
                Neuropeptides
              </h3>
              <p className="text-xs text-content-secondary font-sans line-clamp-2 mb-3">
                Regulators of neurotrophic factors, memory models, and neural signaling pathways.
              </p>
              <span className="text-[11px] font-orbitron font-semibold text-brand flex items-center">
                Browse Neuropeptides →
              </span>
            </Link>

            <Link
              href="/shop?category=cellular-research"
              className="p-6 rounded-2xl bg-white border border-brand-border hover:border-brand hover:shadow-card-hover transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-light text-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-sm text-content-primary group-hover:text-brand transition-colors mb-1.5">
                Cellular & Tissue
              </h3>
              <p className="text-xs text-content-secondary font-sans line-clamp-2 mb-3">
                Extracellular matrix repair, angiogenesis, and collagen synthesis research sequences.
              </p>
              <span className="text-[11px] font-orbitron font-semibold text-brand flex items-center">
                Browse Cellular →
              </span>
            </Link>

            <Link
              href="/shop?category=longevity-research"
              className="p-6 rounded-2xl bg-white border border-brand-border hover:border-brand hover:shadow-card-hover transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-light text-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-sm text-content-primary group-hover:text-brand transition-colors mb-1.5">
                Longevity & Telomeres
              </h3>
              <p className="text-xs text-content-secondary font-sans line-clamp-2 mb-3">
                Cellular senescence regulators, chromatin interaction models, and epigenetic peptides.
              </p>
              <span className="text-[11px] font-orbitron font-semibold text-brand flex items-center">
                Browse Longevity →
              </span>
            </Link>

            <Link
              href="/shop?category=metabolic-peptides"
              className="p-6 rounded-2xl bg-white border border-brand-border hover:border-brand hover:shadow-card-hover transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-light text-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron font-bold text-sm text-content-primary group-hover:text-brand transition-colors mb-1.5">
                Metabolic Peptides
              </h3>
              <p className="text-xs text-content-secondary font-sans line-clamp-2 mb-3">
                Mitochondrial-derived peptides (MDPs) and cellular energy homeostasis modulators.
              </p>
              <span className="text-[11px] font-orbitron font-semibold text-brand flex items-center">
                Browse Metabolic →
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* 5. QUALITY & DOCUMENTATION SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#120B1D] text-white rounded-3xl p-8 sm:p-14 border border-purple-900/60 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full bg-purple-900/80 text-purple-300 font-orbitron text-xs font-semibold">
                ANALYTICAL RIGOR
              </span>
              <h2 className="font-orbitron font-bold text-2xl sm:text-4xl leading-tight">
                CERTIFICATE OF ANALYSIS ON EVERY BATCH
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed max-w-2xl">
                We believe scientific transparency is non-negotiable. Every catalog shipment corresponds to a traceable batch code with verified mass spectrometry and HPLC purity chromatograms available online.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-orbitron">
                <div className="flex items-center space-x-2 text-purple-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>&gt;99.0% High-Purity Standard</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Independent Laboratory Tested</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Tamper-Evident Seals</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center lg:items-end space-y-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-glow hover:scale-105 transition-all text-center"
              >
                REQUEST CUSTOM COA
              </Link>
              <Link
                href="/policies/research-use"
                className="text-xs text-purple-300 hover:text-white font-sans underline"
              >
                Read our Research Compliance Guidelines
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
