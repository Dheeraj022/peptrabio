'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { Product } from '@/types';
import {
  getLocalProducts,
  deleteProductById,
  toggleProductActive,
  saveOrUpdateProduct
} from '@/lib/products-store';
import {
  Plus,
  Search,
  Edit2,
  Copy,
  Trash2,
  Power,
  ExternalLink,
  AlertTriangle,
  X,
  CheckCircle2,
  Check
} from 'lucide-react';

export default function AdminProductsPage() {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    setProducts(getLocalProducts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleStatus = async (id: string) => {
    await toggleProductActive(id);
    loadData();
    showToast('Product status updated.');
  };

  const handleDuplicate = async (prod: Product) => {
    const duplicated: Partial<Product> = {
      ...prod,
      id: 'prod-' + Date.now(),
      name: `${prod.name} (Copy)`,
      slug: `${prod.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      product_code: `${prod.product_code || 'PB'}-CP`,
      is_active: false, // Start copies as draft/inactive
    };
    await saveOrUpdateProduct(duplicated);
    loadData();
    showToast('Product duplicated as draft.');
  };

  const handleDelete = async (id: string) => {
    await deleteProductById(id);
    setDeleteModalId(null);
    loadData();
    showToast('Product removed from catalog.');
  };

  // Filtered List
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedStatus === 'active' && !p.is_active) return false;
    if (selectedStatus === 'inactive' && p.is_active) return false;
    if (selectedStatus === 'out-of-stock' && p.stock_quantity > 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.product_code?.toLowerCase().includes(q);
      const matchCas = p.cas_number?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCas) return false;
    }

    return true;
  });

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const targetDeleteProduct = products.find((p) => p.id === deleteModalId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-brand text-white px-5 py-3 rounded-2xl shadow-purple-glow font-orbitron text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-purple-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
              PRODUCTS CATALOG
            </h1>
            <p className="text-xs text-content-secondary font-sans mt-0.5">
              Manage analytical research peptide specifications, pricing, inventory balances, and documentation.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm flex items-center space-x-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW PRODUCT</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-brand absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, CAS#..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8FD] border border-brand-border rounded-full text-xs font-sans text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-brand-border rounded-full px-3 py-2 text-xs font-orbitron text-content-primary focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">Category: All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-brand-border rounded-full px-3 py-2 text-xs font-orbitron text-content-primary focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive / Drafts</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Products Table (Section 19 of spec) */}
        <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF8FD] text-content-muted font-orbitron text-[10px] border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Purity & Size</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-content-muted">
                      No matching products in catalog.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const primaryImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';
                    return (
                      <tr key={product.id} className="hover:bg-brand-subtle/50 transition-colors">
                        
                        {/* Product Image & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-brand-subtle border border-brand-border shrink-0">
                              <Image
                                src={primaryImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            </div>
                            <div>
                              <div className="font-orbitron font-bold text-sm text-content-primary">
                                {product.name}
                              </div>
                              <div className="text-[11px] font-mono text-content-muted">
                                {product.product_code || product.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 font-orbitron text-[11px] text-content-secondary">
                          {product.category || 'Peptides'}
                        </td>

                        {/* Purity & Size */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-brand font-semibold">{product.purity || '99%+'}</div>
                          <div className="text-[11px] text-content-muted">{product.size || '5 mg'}</div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 font-mono font-bold text-content-primary">
                          {formatPrice(product.price)}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4">
                          <span className={`font-orbitron font-semibold text-xs ${
                            product.stock_quantity <= 0
                              ? 'text-accent-danger'
                              : product.stock_quantity <= 10
                              ? 'text-accent-warning'
                              : 'text-accent-success'
                          }`}>
                            {product.stock_quantity} vials
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-orbitron text-[10px] font-semibold uppercase ${
                            product.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.is_active ? 'Active' : 'Draft / Inactive'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            
                            {/* Preview */}
                            <Link
                              href={`/admin/products/${product.id}/preview`}
                              className="p-1.5 rounded-lg text-content-muted hover:text-brand hover:bg-brand-light transition-colors"
                              title="Preview product"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* Edit */}
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-1.5 rounded-lg text-content-muted hover:text-brand hover:bg-brand-light transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            {/* Duplicate */}
                            <button
                              onClick={() => handleDuplicate(product)}
                              className="p-1.5 rounded-lg text-content-muted hover:text-brand hover:bg-brand-light transition-colors"
                              title="Duplicate product"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {/* Toggle Active */}
                            <button
                              onClick={() => handleToggleStatus(product.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                product.is_active
                                  ? 'text-accent-success hover:bg-emerald-50'
                                  : 'text-content-muted hover:bg-gray-100'
                              }`}
                              title={product.is_active ? 'Deactivate' : 'Activate'}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteModalId(product.id)}
                              className="p-1.5 rounded-lg text-content-muted hover:text-accent-danger hover:bg-red-50 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal (Section 22 of spec) */}
        {deleteModalId && targetDeleteProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-2 border-brand-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-accent-danger flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-orbitron font-bold text-lg text-content-primary">
                  DELETE PRODUCT?
                </h3>
                <p className="text-xs text-content-secondary font-sans">
                  Are you sure you wish to delete <strong className="text-content-primary">{targetDeleteProduct.name}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setDeleteModalId(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-content-primary font-orbitron text-xs font-semibold rounded-full transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteModalId)}
                  className="py-2.5 px-4 bg-accent-danger hover:bg-red-700 text-white font-orbitron text-xs font-semibold rounded-full transition-all shadow-sm"
                >
                  DELETE PRODUCT
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
