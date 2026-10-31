'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { Product, ProductImage, ProductDocument, ProductReference } from '@/types';
import { saveOrUpdateProduct, getLocalCategories } from '@/lib/products-store';
import {
  Save,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  FileCheck2,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Upload,
  ArrowUp,
  ArrowDown,
  Star,
  ImagePlus,
  Camera,
  RefreshCw,
  FolderOpen,
  X,
  Search
} from 'lucide-react';

export function ProductEditorForm({ initialProduct }: { initialProduct?: Product }) {
  const router = useRouter();
  const { formatPrice, currencyConfig } = useCurrency();

  const [formData, setFormData] = useState<Partial<Product>>(
    initialProduct || {
      name: '',
      slug: '',
      product_code: 'PB-' + Math.floor(1000 + Math.random() * 9000),
      category: 'Neuropeptides',
      category_id: 'cat-1',
      short_description: '',
      description: '',
      cas_number: '',
      sequence: '',
      molecular_formula: '',
      molecular_weight: undefined,
      purity: '99.0% (HPLC)',
      size: '5 mg',
      format: 'Lyophilized Solid / Sealed Glass Vial',
      price: 50.00,
      compare_at_price: undefined,
      stock_quantity: 20,
      is_active: true,
      is_featured: false,
      research_use_only: true,
      storage_information: 'Store at -20°C upon receipt. Protect from light.',
      images: [
        {
          id: 'img-1',
          product_id: '',
          image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
          alt_text: 'Research Vial Specimen',
          sort_order: 0,
          is_primary: true,
        }
      ],
      documents: [
        {
          id: 'doc-1',
          product_id: '',
          title: 'Batch Certificate of Analysis',
          document_type: 'COA',
          file_url: '#coa',
          batch_number: 'BATCH-2025-01',
          test_date: new Date().toISOString().split('T')[0],
          is_public: true,
        }
      ],
      references: [],
    }
  );

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const categories = getLocalCategories();

  // Media Library Modal state
  const [libraryModalIndex, setLibraryModalIndex] = useState<number | null>(null);
  const [libraryImages, setLibraryImages] = useState<{ url: string; name: string; folder: string }[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'products' | 'labelbox' | 'uploads'>('all');

  const openMediaLibrary = async (targetIndex: number) => {
    setLibraryModalIndex(targetIndex);
    if (libraryImages.length === 0) {
      setLibraryLoading(true);
      try {
        const res = await fetch('/api/admin/media-library');
        if (res.ok) {
          const data = await res.json();
          if (data.items) setLibraryImages(data.items);
        }
      } catch (err) {
        console.error('Failed to load media library:', err);
      } finally {
        setLibraryLoading(false);
      }
    }
  };

  const handleSelectLibraryImage = (url: string, name?: string) => {
    if (libraryModalIndex === null) return;
    if (libraryModalIndex >= 0) {
      // Replace existing image at target index
      setFormData((prev) => {
        const next = [...(prev.images || [])];
        if (next[libraryModalIndex]) {
          next[libraryModalIndex] = {
            ...next[libraryModalIndex],
            image_url: url,
            alt_text: name || next[libraryModalIndex].alt_text || formData.name || 'Product Photo',
          };
        }
        return { ...prev, images: next };
      });
    } else if (libraryModalIndex === -1) {
      // Add as new image to product
      const currentCount = formData.images?.length || 0;
      const newImg: ProductImage = {
        id: 'img-' + Date.now(),
        product_id: formData.id || '',
        image_url: url,
        alt_text: name || (formData.name ? `${formData.name} - View ${currentCount + 1}` : 'Product Photo'),
        sort_order: currentCount,
        is_primary: currentCount === 0,
      };
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImg].map((img, idx) => ({
          ...img,
          sort_order: idx,
          is_primary: idx === 0,
        })),
      }));
    }
    setLibraryModalIndex(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Auto generate slug from name if new
      if (name === 'name' && !initialProduct) {
        setFormData((prev) => ({
          ...prev,
          slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        }));
      }
    }
  };

  // Upload single file helper
  const uploadSingleImage = async (file: File): Promise<string> => {
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('productName', formData.name || 'product');

      const res = await fetch('/api/admin/products/upload', {
        method: 'POST',
        body,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (e) {
      console.warn('Server upload fallback to base64:', e);
    }

    // Client-side fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Image upload and showcase reordering helpers
  const handleImageFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);

    try {
      const newImages: ProductImage[] = [];
      const currentCount = formData.images?.length || 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} exceeds the 10MB limit.`);
          continue;
        }

        const url = await uploadSingleImage(file);
        const position = currentCount + newImages.length;
        newImages.push({
          id: 'img-' + Date.now() + '-' + i,
          product_id: formData.id || '',
          image_url: url,
          alt_text: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          sort_order: position,
          is_primary: position === 0,
        });
      }

      setFormData((prev) => {
        const combined = [...(prev.images || []), ...newImages];
        return {
          ...prev,
          images: combined.map((img, idx) => ({
            ...img,
            sort_order: idx,
            is_primary: idx === 0,
          })),
        };
      });
    } catch (err: any) {
      console.error('Failed to process image upload:', err);
      alert('Error uploading image: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleReplaceImageFile = async (index: number, file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadSingleImage(file);
      setFormData((prev) => {
        const next = [...(prev.images || [])];
        if (next[index]) {
          next[index] = {
            ...next[index],
            image_url: url,
            alt_text: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          };
        }
        return { ...prev, images: next };
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageViaUrl = () => {
    const currentCount = formData.images?.length || 0;
    const newImg: ProductImage = {
      id: 'img-' + Date.now(),
      product_id: formData.id || '',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      alt_text: formData.name ? `${formData.name} - View ${currentCount + 1}` : 'Product Showcase Image',
      sort_order: currentCount,
      is_primary: currentCount === 0,
    };
    setFormData((prev) => {
      const next = [...(prev.images || []), newImg];
      return {
        ...prev,
        images: next.map((img, idx) => ({
          ...img,
          sort_order: idx,
          is_primary: idx === 0,
        })),
      };
    });
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    const images = [...(formData.images || [])];
    if (toIndex < 0 || toIndex >= images.length) return;
    const [item] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, item);

    const reindexed = images.map((img, idx) => ({
      ...img,
      sort_order: idx,
      is_primary: idx === 0,
    }));
    setFormData((prev) => ({ ...prev, images: reindexed }));
  };

  const handleSetPrimary = (index: number) => {
    handleMoveImage(index, 0);
  };

  const handleDirectOrderChange = (fromIndex: number, targetPosition1Based: number) => {
    const toIndex = Math.max(0, Math.min((formData.images?.length || 1) - 1, targetPosition1Based - 1));
    handleMoveImage(fromIndex, toIndex);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const remaining = (prev.images || []).filter((_, i) => i !== index);
      return {
        ...prev,
        images: remaining.map((img, idx) => ({
          ...img,
          sort_order: idx,
          is_primary: idx === 0,
        })),
      };
    });
  };

  // Document helpers
  const handleAddDocument = () => {
    const newDoc: ProductDocument = {
      id: 'doc-' + Date.now(),
      product_id: formData.id || '',
      title: 'Safety Data Sheet (SDS)',
      document_type: 'SDS',
      file_url: '#sds',
      batch_number: 'LOT-2025',
      test_date: new Date().toISOString().split('T')[0],
      is_public: true,
    };
    setFormData((prev) => ({ ...prev, documents: [...(prev.documents || []), newDoc] }));
  };

  const handleRemoveDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (publishStatus?: boolean) => {
    setSaving(true);
    const payload = {
      ...formData,
      is_active: publishStatus !== undefined ? publishStatus : formData.is_active,
    };
    const saved = await saveOrUpdateProduct(payload);
    setSaving(false);
    setSuccessToast(true);
    setTimeout(() => {
      router.push('/admin/products');
    }, 800);
  };

  return (
    <div className="space-y-8 pb-20 font-sans">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-brand text-white px-5 py-3 rounded-2xl shadow-purple-glow font-orbitron text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-purple-300" />
          <span>Product saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center text-xs font-orbitron text-brand hover:underline mb-1"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            BACK TO PRODUCTS
          </Link>
          <h1 className="text-2xl font-orbitron font-extrabold text-content-primary">
            {initialProduct ? `EDIT: ${initialProduct.name}` : 'CREATE NEW RESEARCH PEPTIDE'}
          </h1>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center space-x-3">
          {formData.id && (
            <Link
              href={`/admin/products/${formData.id}/preview`}
              target="_blank"
              className="px-4 py-2 border border-brand-border hover:border-brand text-content-primary hover:text-brand font-orbitron text-xs font-semibold rounded-full flex items-center space-x-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>PREVIEW</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-content-primary font-orbitron text-xs font-semibold rounded-full transition-all"
          >
            SAVE DRAFT
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="px-6 py-2 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'SAVING...' : 'PUBLISH PRODUCT'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 Cols: Detailed Sections */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Basic Information */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-orbitron font-bold text-sm text-content-primary border-b border-brand-border pb-3">
              1. BASIC INFORMATION
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  PRODUCT NAME *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name || ''}
                  onChange={handleTextChange}
                  placeholder="e.g. Selank"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans font-medium"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  URL SLUG *
                </label>
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug || ''}
                  onChange={handleTextChange}
                  placeholder="e.g. selank"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  PRODUCT SKU / CODE
                </label>
                <input
                  type="text"
                  name="product_code"
                  value={formData.product_code || ''}
                  onChange={handleTextChange}
                  placeholder="PB-SLK-005"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  CATEGORY *
                </label>
                <select
                  name="category"
                  value={formData.category || 'Neuropeptides'}
                  onChange={handleTextChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans bg-white cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  SHORT SCIENTIFIC SUMMARY
                </label>
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description || ''}
                  onChange={handleTextChange}
                  placeholder="Heptapeptide analogue of tuftsin synthesized for neurological research models."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  FULL CATALOG SPECIFICATION DESCRIPTION
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description || ''}
                  onChange={handleTextChange}
                  placeholder="Detailed chemical properties, synthesis structure, and analytical overview..."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Chemical & Analytical Specifications */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-orbitron font-bold text-sm text-content-primary border-b border-brand-border pb-3">
              2. CHEMICAL SPECIFICATIONS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  CAS NUMBER
                </label>
                <input
                  type="text"
                  name="cas_number"
                  value={formData.cas_number || ''}
                  onChange={handleTextChange}
                  placeholder="129954-34-3"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  MOLECULAR FORMULA
                </label>
                <input
                  type="text"
                  name="molecular_formula"
                  value={formData.molecular_formula || ''}
                  onChange={handleTextChange}
                  placeholder="C33H57N11O9"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  MOLECULAR WEIGHT (G/MOL)
                </label>
                <input
                  type="text"
                  name="molecular_weight"
                  value={formData.molecular_weight || ''}
                  onChange={handleTextChange}
                  placeholder="e.g. 751.87 or 1419.6, 889"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  AMINO ACID SEQUENCE
                </label>
                <input
                  type="text"
                  name="sequence"
                  value={formData.sequence || ''}
                  onChange={handleTextChange}
                  placeholder="Thr-Lys-Pro-Arg-Pro-Gly-Pro"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  ASSAY PURITY
                </label>
                <input
                  type="text"
                  name="purity"
                  value={formData.purity || '99.0%+'}
                  onChange={handleTextChange}
                  placeholder="99.4% (HPLC)"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  VIAL SIZE
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size || '5 mg'}
                  onChange={handleTextChange}
                  placeholder="5 mg"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  PHYSICAL FORMAT
                </label>
                <input
                  type="text"
                  name="format"
                  value={formData.format || 'Lyophilized Solid / Vial'}
                  onChange={handleTextChange}
                  placeholder="Lyophilized Solid / Vial"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  STORAGE & PROTOCOL INSTRUCTIONS
                </label>
                <input
                  type="text"
                  name="storage_information"
                  value={formData.storage_information || ''}
                  onChange={handleTextChange}
                  placeholder="Store lyophilized solid at -20°C. Protect from moisture."
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-sans"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Media & Images */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
              <div>
                <h2 className="font-orbitron font-bold text-sm text-content-primary flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-brand" />
                  <span>3. PRODUCT MEDIA & PHOTOGRAPHY</span>
                </h2>
                <p className="text-[11px] text-content-muted mt-0.5">
                  Upload high-resolution peptide imagery and define showcase presentation sequence (1, 2, 3...).
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleImageFiles(e.target.files);
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-orbitron font-semibold flex items-center space-x-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Photos'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openMediaLibrary(-1)}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-brand border border-purple-200 rounded-xl text-xs font-orbitron font-medium flex items-center space-x-1.5 transition-colors"
                  title="Choose from pre-loaded peptide catalog photos"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Catalog Library</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddImageViaUrl}
                  className="px-3 py-1.5 bg-brand-subtle hover:bg-purple-100 text-brand border border-brand-border rounded-xl text-xs font-orbitron font-medium flex items-center space-x-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files) {
                  handleImageFiles(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-brand bg-purple-50/70 scale-[0.99]'
                  : 'border-brand-border/80 bg-[#FAF8FD] hover:border-brand/60 hover:bg-purple-50/40'
              }`}
            >
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
                  {uploadingImage ? (
                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImagePlus className="w-5 h-5" />
                  )}
                </div>
                <div className="text-xs font-orbitron font-semibold text-content-primary">
                  {uploadingImage ? 'Uploading & Processing Image(s)...' : 'Drag & drop product images here, or browse files'}
                </div>
                <p className="text-[11px] text-content-muted">
                  Supports JPG, PNG, WebP, SVG up to 10MB each. Select multiple files to bulk upload.
                </p>
              </div>
            </div>

            {/* Showcase Order Guide Callout */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/70 flex items-start space-x-2.5 text-xs text-purple-950">
              <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed text-[11px]">
                <span className="font-orbitron font-bold text-brand">SHOWCASE ORDER (1 - 2 - 3):</span>{' '}
                <span>
                  <strong>Position #1</strong> is the Primary Showcase Cover displayed on the Shop catalog, product cards, and hero view.
                  Positions <strong>#2, #3, etc.</strong> are secondary gallery views. Use the <strong>↑ / ↓</strong> arrows or select <strong>Rank 1, 2, 3</strong> directly to reorder.
                </span>
              </div>
            </div>

            {/* Showcase Ordered Images List */}
            <div className="space-y-3">
              {(!formData.images || formData.images.length === 0) ? (
                <div className="text-center py-8 text-content-muted text-xs font-orbitron border border-dashed border-brand-border rounded-2xl">
                  No product images attached yet. Click &quot;Upload Photos&quot; or &quot;Add URL&quot; to begin.
                </div>
              ) : (
                formData.images.map((img, idx) => {
                  const isPrimary = idx === 0;
                  const totalImages = formData.images?.length || 1;

                  return (
                    <div
                      key={img.id || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPrimary
                          ? 'bg-purple-50/40 border-brand/50 shadow-sm'
                          : 'bg-[#FAF8FD] border-brand-border/80 hover:border-brand-border'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Position Badge & Thumbnail */}
                        <div className="flex items-center space-x-3 shrink-0">
                          {/* Rank Badge */}
                          <div className="w-20 text-center shrink-0">
                            {isPrimary ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-brand text-white font-orbitron text-[10px] font-bold shadow-sm">
                                <Star className="w-3 h-3 fill-current text-yellow-300" />
                                <span>#1 Cover</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white border border-brand-border text-content-secondary font-orbitron text-[10px] font-semibold">
                                #{idx + 1} View
                              </span>
                            )}
                          </div>

                          {/* Thumbnail with Clickable Change Image Overlay */}
                          <label
                            className="w-16 h-16 rounded-xl bg-white border border-brand-border overflow-hidden shrink-0 relative group shadow-sm cursor-pointer block"
                            title="Click to change this photo"
                          >
                            <img
                              src={img.image_url}
                              alt={img.alt_text || `Product view ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-brand-dark/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[8px] font-orbitron font-semibold text-center p-1">
                              <Camera className="w-3.5 h-3.5 mb-0.5 text-purple-200" />
                              <span>CHANGE</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleReplaceImageFile(idx, f);
                              }}
                            />
                          </label>
                        </div>

                        {/* URL & Alt Text Controls */}
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-orbitron text-[10px] text-content-muted w-14 shrink-0">
                              URL:
                            </span>
                            <input
                              type="text"
                              value={img.image_url}
                              onChange={(e) => {
                                const next = [...(formData.images || [])];
                                next[idx].image_url = e.target.value;
                                setFormData({ ...formData, images: next });
                              }}
                              placeholder="Image URL (https://... or uploaded file)"
                              className="w-full px-3 py-1.5 rounded-lg border border-brand-border text-xs font-mono focus:outline-none focus:border-brand bg-white"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-orbitron text-[10px] text-content-muted w-14 shrink-0">
                              Alt Text:
                            </span>
                            <input
                              type="text"
                              value={img.alt_text || ''}
                              onChange={(e) => {
                                const next = [...(formData.images || [])];
                                next[idx].alt_text = e.target.value;
                                setFormData({ ...formData, images: next });
                              }}
                              placeholder="e.g. Front vial label view"
                              className="w-full px-3 py-1.5 rounded-lg border border-brand-border text-xs font-sans focus:outline-none focus:border-brand bg-white"
                            />
                          </div>
                        </div>

                        {/* Reordering & Action Controls */}
                        <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-border/60">
                          {/* Direct Rank Dropdown (1, 2, 3...) */}
                          <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-xl border border-brand-border">
                            <span className="text-[10px] font-orbitron text-content-muted">Rank:</span>
                            <select
                              value={idx + 1}
                              onChange={(e) => handleDirectOrderChange(idx, Number(e.target.value))}
                              aria-label={`Showcase rank for image ${idx + 1}`}
                              className="font-orbitron font-bold text-xs text-brand bg-transparent focus:outline-none cursor-pointer"
                            >
                              {Array.from({ length: totalImages }, (_, i) => i + 1).map((pos) => (
                                <option key={pos} value={pos}>
                                  #{pos} {pos === 1 ? '(Cover)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Up & Down Arrows */}
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, idx - 1)}
                              disabled={idx === 0}
                              title="Move up in showcase order"
                              aria-label={`Move image ${idx + 1} up`}
                              className="p-1.5 rounded-lg border border-brand-border bg-white text-content-secondary hover:text-brand hover:border-brand disabled:opacity-30 disabled:hover:text-content-secondary disabled:hover:border-brand-border transition-colors"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, idx + 1)}
                              disabled={idx === totalImages - 1}
                              title="Move down in showcase order"
                              aria-label={`Move image ${idx + 1} down`}
                              className="p-1.5 rounded-lg border border-brand-border bg-white text-content-secondary hover:text-brand hover:border-brand disabled:opacity-30 disabled:hover:text-content-secondary disabled:hover:border-brand-border transition-colors"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Set as Cover Button (if not primary) */}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              title="Set as #1 Primary Cover image"
                              className="px-2.5 py-1 rounded-xl bg-white hover:bg-brand hover:text-white text-brand border border-brand-border font-orbitron text-[10px] font-semibold transition-colors"
                            >
                              Make #1
                            </button>
                          )}

                          {/* Prominent Change Image Button */}
                          <label
                            className="cursor-pointer px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-brand hover:text-white text-brand border border-purple-300 font-orbitron text-[10px] font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                            title="Change this photo by uploading a replacement file"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Change Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleReplaceImageFile(idx, f);
                              }}
                            />
                          </label>

                          {/* Choose from Library / Catalog Button */}
                          <button
                            type="button"
                            onClick={() => openMediaLibrary(idx)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-content-secondary hover:text-brand border border-brand-border font-orbitron text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                            title="Choose from catalog library of vials and boxes"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Catalog</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove image"
                            className="p-1.5 rounded-lg text-content-muted hover:text-accent-danger hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card 4: Documents & Certificates */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h2 className="font-orbitron font-bold text-sm text-content-primary">
                4. CERTIFICATES OF ANALYSIS (COA) & DOCUMENTATION
              </h2>
              <button
                type="button"
                onClick={handleAddDocument}
                className="text-xs font-orbitron text-brand hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Document</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.documents?.map((doc, idx) => (
                <div key={doc.id || idx} className="flex items-center space-x-3 p-3 rounded-2xl bg-[#FAF8FD] border border-brand-border">
                  <FileCheck2 className="w-5 h-5 text-brand shrink-0" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={doc.title}
                      onChange={(e) => {
                        const next = [...(formData.documents || [])];
                        next[idx].title = e.target.value;
                        setFormData({ ...formData, documents: next });
                      }}
                      placeholder="Document Title"
                      className="px-3 py-1.5 rounded-lg border border-brand-border text-xs"
                    />
                    <input
                      type="text"
                      value={doc.batch_number || ''}
                      onChange={(e) => {
                        const next = [...(formData.documents || [])];
                        next[idx].batch_number = e.target.value;
                        setFormData({ ...formData, documents: next });
                      }}
                      placeholder="Batch #"
                      className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-mono"
                    />
                    <select
                      value={doc.document_type}
                      onChange={(e: any) => {
                        const next = [...(formData.documents || [])];
                        next[idx].document_type = e.target.value;
                        setFormData({ ...formData, documents: next });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-brand-border text-xs bg-white"
                    >
                      <option value="COA">COA</option>
                      <option value="SDS">SDS</option>
                      <option value="Specification Sheet">Specification Sheet</option>
                      <option value="Research Reference">Research Reference</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(idx)}
                    className="p-1 text-content-muted hover:text-accent-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Pricing, Inventory & Compliance Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Commerce / Inventory Card */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="font-orbitron font-bold text-sm text-content-primary border-b border-brand-border pb-3">
              COMMERCE & INVENTORY
            </h2>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-orbitron text-[10px] text-content-muted">
                    UNIT PRICE *
                  </label>
                  <span className="font-mono text-[10px] text-brand font-semibold">
                    {formatPrice(formData.price || 0)}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="price"
                  value={formData.price ?? 50}
                  onChange={handleTextChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-base font-orbitron font-bold text-brand"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-orbitron text-[10px] text-content-muted">
                    COMPARE-AT ORIGINAL PRICE
                  </label>
                  {formData.compare_at_price && (
                    <span className="font-mono text-[10px] text-content-muted">
                      {formatPrice(formData.compare_at_price)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.01"
                  name="compare_at_price"
                  value={formData.compare_at_price || ''}
                  onChange={handleTextChange}
                  placeholder="Optional original price"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  STOCK QUANTITY (VIALS) *
                </label>
                <input
                  type="number"
                  required
                  name="stock_quantity"
                  value={formData.stock_quantity ?? 10}
                  onChange={handleTextChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-orbitron text-[10px] text-content-muted">
                    CATALOG SHOWCASE ORDER (1, 2, 3...)
                  </label>
                  <span className="font-mono text-[10px] text-brand">
                    Priority on Shop
                  </span>
                </div>
                <input
                  type="number"
                  name="showcase_order"
                  min="1"
                  step="1"
                  value={formData.showcase_order ?? ''}
                  onChange={handleTextChange}
                  placeholder="e.g. 1, 2, 3 (lower shows first)"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand text-xs font-mono"
                />
                <p className="text-[10px] text-content-muted mt-1">
                  Products with #1, #2, #3 appear first on the shop page & showcase grid.
                </p>
              </div>

              <div className="pt-2 space-y-3 border-t border-brand-border/60">
                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active ?? true}
                    onChange={handleTextChange}
                    className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
                  />
                  <span className="font-orbitron text-xs font-semibold text-content-primary">
                    ACTIVE IN PUBLIC CATALOG
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured ?? false}
                    onChange={handleTextChange}
                    className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
                  />
                  <span className="font-orbitron text-xs font-semibold text-content-primary">
                    FEATURED ON HOMEPAGE
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Compliance Card (Section 20 of spec) */}
          <div className="p-6 rounded-3xl bg-purple-50 border border-purple-200 text-xs text-purple-950 font-sans space-y-3">
            <div className="font-orbitron font-bold text-brand flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>COMPLIANCE ENFORCEMENT</span>
            </div>
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              <div className="flex items-center space-x-1.5 text-accent-success font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Research Use Only: Enforced</span>
              </div>
              <div className="flex items-center space-x-1.5 text-accent-success font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Human Dosing Instructions: Prohibited</span>
              </div>
              <div className="flex items-center space-x-1.5 text-accent-success font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Therapeutic Claims: Blocked</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Media Library Modal for Selecting or Changing Photos */}
      {libraryModalIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-brand-border flex items-center justify-between bg-[#FAF8FD]">
              <div>
                <h3 className="font-orbitron font-bold text-sm sm:text-base text-content-primary flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4 text-brand" />
                  <span>
                    {libraryModalIndex >= 0
                      ? `CHANGE PHOTO (POSITION #${libraryModalIndex + 1})`
                      : 'ADD PHOTO FROM CATALOG LIBRARY'}
                  </span>
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Choose from 58+ pre-rendered peptide vials, packaging boxes, and uploaded photos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLibraryModalIndex(null)}
                className="p-2 rounded-xl text-content-muted hover:text-content-primary hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filter & Search Bar */}
            <div className="p-4 border-b border-brand-border bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Category Filter Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
                {(['all', 'products', 'labelbox', 'uploads'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLibraryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-orbitron text-xs font-semibold whitespace-nowrap transition-colors ${
                      libraryFilter === cat
                        ? 'bg-brand text-white shadow-xs'
                        : 'bg-gray-100 text-content-secondary hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' && 'All Photos'}
                    {cat === 'products' && 'Product Vials'}
                    {cat === 'labelbox' && 'Packaging Boxes'}
                    {cat === 'uploads' && 'Uploaded Files'}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-brand absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search peptide (e.g. AOD, BPC)..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand font-sans"
                />
              </div>
            </div>

            {/* Images Grid */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 bg-[#FCFBFD]">
              {libraryLoading ? (
                <div className="col-span-full py-16 text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-orbitron text-xs text-content-muted">Loading peptide photos...</p>
                </div>
              ) : (
                libraryImages
                  .filter((item) => {
                    if (libraryFilter !== 'all' && item.folder !== libraryFilter) return false;
                    if (librarySearch.trim()) {
                      const q = librarySearch.toLowerCase().trim();
                      return item.name.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLibraryImage(item.url, item.name)}
                      className="group cursor-pointer bg-white border border-brand-border hover:border-brand rounded-2xl p-2 shadow-xs hover:shadow-purple-sm transition-all text-center flex flex-col justify-between"
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FAF8FD] border border-brand-border/60 mb-2">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-2 py-1 bg-brand text-white font-orbitron text-[9px] font-bold rounded-lg shadow-sm">
                            Select Photo
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-orbitron font-bold text-[10px] text-content-primary truncate">
                          {item.name}
                        </div>
                        <div className="font-mono text-[9px] text-content-muted uppercase">
                          {item.folder === 'labelbox' ? 'Box packaging' : item.folder === 'products' ? 'Vial' : 'Upload'}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-brand-border bg-white flex items-center justify-between text-xs">
              <span className="text-content-muted font-sans text-[11px]">
                Click any photo to immediately apply it.
              </span>
              <button
                type="button"
                onClick={() => setLibraryModalIndex(null)}
                className="px-4 py-1.5 rounded-xl border border-brand-border text-content-secondary hover:bg-gray-100 font-orbitron text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
