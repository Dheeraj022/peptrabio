'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext';
import { Product } from '@/types';
import { fetchProductById } from '@/lib/products-store';
import {
  Eye,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  FlaskConical,
  Edit2
} from 'lucide-react';

export default function ProductPreviewPage() {
  const { formatPrice } = useCurrency();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id) {
        const p = await fetchProductById(id);
        setProduct(p);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center font-orbitron">Loading product preview...</div>;
  }

  if (!product) {
    return <div className="p-12 text-center font-orbitron">Product not found.</div>;
  }

  const primaryImage =
    product.images?.find((i) => i.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="space-y-6">
      
      {/* Top Admin Sticky Banner */}
      <div className="bg-purple-900 text-white px-4 py-3 border-b border-purple-700 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 font-orbitron text-xs">
            <Eye className="w-4 h-4 text-purple-300" />
            <span className="font-bold">ADMIN PREVIEW MODE</span>
            <span className="text-purple-300 hidden sm:inline">• Status: {product.is_active ? 'ACTIVE' : 'DRAFT'}</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full flex items-center space-x-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>EDIT PRODUCT</span>
            </Link>
            <Link
              href="/admin/products"
              className="px-4 py-1.5 bg-purple-950 hover:bg-purple-800 text-purple-200 font-orbitron text-xs rounded-full"
            >
              EXIT
            </Link>
          </div>
        </div>
      </div>

      {/* Render Product View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-6">
            <div className="relative aspect-square w-full bg-[#FAF8FD] rounded-3xl overflow-hidden border-2 border-brand-border shadow-md">
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="px-3 py-1 bg-brand text-white font-orbitron text-xs font-bold rounded-full">
                  RESEARCH USE ONLY
                </span>
                <span className="px-3 py-1 bg-white/90 text-brand border border-brand-border font-orbitron text-xs font-semibold rounded-full">
                  {product.purity || '99.0%+'}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs font-orbitron text-brand font-semibold">{product.category}</div>
            <h1 className="text-3xl font-orbitron font-extrabold text-content-primary">{product.name}</h1>
            
            <div className="p-4 rounded-2xl bg-brand-subtle border border-brand-border flex items-baseline justify-between">
              <span className="font-orbitron font-extrabold text-3xl text-brand">{formatPrice(product.price)}</span>
              <span className="text-xs text-content-muted font-sans">Per {product.size} Vial</span>
            </div>

            <p className="text-xs text-content-secondary font-sans leading-relaxed">
              {product.short_description || product.description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-brand-border">
                <div className="text-[10px] font-orbitron text-content-muted">CAS NUMBER</div>
                <div className="font-mono text-xs font-bold">{product.cas_number || 'N/A'}</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-brand-border">
                <div className="text-[10px] font-orbitron text-content-muted">MOL WEIGHT</div>
                <div className="font-mono text-xs font-bold">{product.molecular_weight || 'N/A'} g/mol</div>
              </div>
            </div>

            {product.sequence && (
              <div className="p-3.5 rounded-xl bg-white border border-brand-border space-y-1">
                <div className="text-[10px] font-orbitron text-content-muted">SEQUENCE</div>
                <div className="font-mono text-xs text-content-primary bg-brand-subtle p-2 rounded break-all">
                  {product.sequence}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
