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
  AlertTriangle
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
  const categories = getLocalCategories();

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

  // Image helpers
  const handleAddImage = () => {
    const newImg: ProductImage = {
      id: 'img-' + Date.now(),
      product_id: formData.id || '',
      image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Secondary view',
      sort_order: (formData.images?.length || 0),
      is_primary: false,
    };
    setFormData((prev) => ({ ...prev, images: [...(prev.images || []), newImg] }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
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
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h2 className="font-orbitron font-bold text-sm text-content-primary">
                3. PRODUCT MEDIA & PHOTOGRAPHY
              </h2>
              <button
                type="button"
                onClick={handleAddImage}
                className="text-xs font-orbitron text-brand hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Image</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.images?.map((img, idx) => (
                <div key={img.id || idx} className="flex items-center space-x-3 p-3 rounded-2xl bg-[#FAF8FD] border border-brand-border">
                  <div className="w-12 h-12 rounded-xl bg-white border border-brand-border overflow-hidden shrink-0 relative">
                    <img src={img.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={img.image_url}
                      onChange={(e) => {
                        const next = [...(formData.images || [])];
                        next[idx].image_url = e.target.value;
                        setFormData({ ...formData, images: next });
                      }}
                      placeholder="Image URL (https://...)"
                      className="w-full px-3 py-1.5 rounded-lg border border-brand-border text-xs font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1 text-content-muted hover:text-accent-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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

    </div>
  );
}
