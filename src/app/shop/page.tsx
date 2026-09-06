'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, ProductCategory } from '@/types';
import { fetchAllProducts, getLocalCategories } from '@/lib/products-store';
import { ProductCard } from '@/components/product/ProductCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  FlaskConical,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    async function load() {
      const prods = await fetchAllProducts();
      setProducts(prods);
      setCategories(getLocalCategories());
      setLoading(false);
    }
    load();
  }, []);

  // Sync state from query params on change
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    const sort = searchParams.get('sort');

    if (q !== null) setSearchQuery(q);
    if (cat !== null) setSelectedCategory(cat);
    if (sort !== null) setSortBy(sort);
  }, [searchParams]);

  // Update URL parameters
  const updateParams = (newCat: string, newSort: string, newQ: string) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set('q', newQ.trim());
    if (newCat && newCat !== 'all') params.set('category', newCat);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);

    const qs = params.toString();
    router.replace(`/shop${qs ? `?${qs}` : ''}`);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    updateParams(slug, sortBy, searchQuery);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateParams(selectedCategory, sort, searchQuery);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    updateParams(selectedCategory, sortBy, q);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setInStockOnly(false);
    router.replace('/shop');
  };

  // Active filters count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (inStockOnly) count++;
    if (searchQuery.trim()) count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [selectedCategory, inStockOnly, searchQuery, sortBy]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.is_active) return false;
        if (inStockOnly && p.stock_quantity <= 0) return false;

        if (selectedCategory !== 'all') {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && p.category !== cat.name && p.category_id !== cat.id) {
            return false;
          }
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc =
            p.short_description?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q);
          const matchCas = p.cas_number?.toLowerCase().includes(q);
          const matchSeq = p.sequence?.toLowerCase().includes(q);
          const matchCode = p.product_code?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCas && !matchSeq && !matchCode) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
  }, [products, categories, selectedCategory, searchQuery, sortBy, inStockOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      
      {/* Header & Title */}
      <div className="border-b border-brand-border pb-4 sm:pb-6 space-y-1.5 sm:space-y-2">
        <div className="flex items-center space-x-2 text-xs font-orbitron text-brand font-semibold uppercase tracking-wider">
          <FlaskConical className="w-4 h-4" />
          <span>Research Catalog</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-orbitron font-extrabold">
          RESEARCH PEPTIDE PRODUCTS
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary max-w-2xl font-sans hidden sm:block">
          All catalog formulations are synthesized for in vitro scientific research, biochemical analysis, and analytical laboratory calibration.
        </p>
      </div>

      {/* Main Controls Section */}
      <div className="space-y-3">
        
        {/* Row 1: Search & Filter Drawer Trigger Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search peptide, CAS#, formula..."
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-brand-border rounded-full text-xs font-sans text-content-primary placeholder-content-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-3 text-content-muted hover:text-content-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter & Sort Drawer Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center space-x-1.5 px-3.5 py-2.5 rounded-full bg-brand-light text-brand border border-brand/30 text-xs font-orbitron font-bold shrink-0 shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Desktop Sort & In-Stock Controls */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <label className="inline-flex items-center cursor-pointer text-xs font-sans text-content-secondary select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-brand focus:ring-brand mr-2"
              />
              <span>In Stock Only</span>
            </label>

            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white border border-brand-border rounded-full px-3.5 py-2 text-xs font-orbitron font-medium text-content-primary focus:outline-none focus:border-brand shadow-sm cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Category Filter Pills (Desktop Only) */}
        <div className="hidden md:flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-full font-orbitron text-xs font-semibold tracking-wider transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand text-white shadow-purple-sm'
                : 'bg-white border border-brand-border text-content-secondary hover:border-brand hover:text-brand'
            }`}
          >
            ALL CATEGORIES
          </button>

          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full font-orbitron text-[11px] sm:text-xs font-semibold tracking-wider whitespace-nowrap shrink-0 transition-all ${
                  active
                    ? 'bg-brand text-white shadow-purple-sm'
                    : 'bg-white border border-brand-border text-content-secondary hover:border-brand hover:text-brand'
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            );
          })}

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center text-[11px] font-orbitron text-accent-danger hover:underline px-2 py-1 whitespace-nowrap shrink-0 ml-auto"
            >
              <X className="w-3 h-3 mr-1" />
              RESET
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Summary Strip */}
      <div className="flex justify-between items-center text-xs text-content-muted font-sans border-b border-brand-border/40 pb-2">
        <span>
          Showing <strong className="text-brand font-orbitron">{filteredProducts.length}</strong> research products
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-[11px] text-content-secondary font-orbitron">
            {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Product Cards Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white border border-brand-border rounded-xl sm:rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4 animate-pulse">
              <div className="w-full aspect-square bg-brand-subtle rounded-lg sm:rounded-xl" />
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-2.5 sm:h-3 bg-gray-100 rounded w-full" />
              <div className="h-7 sm:h-8 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white border border-brand-border rounded-3xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mx-auto text-brand">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="font-orbitron font-bold text-xl text-content-primary">
            NO PRODUCTS FOUND
          </h2>
          <p className="text-xs text-content-secondary max-w-sm mx-auto font-sans">
            We could not find any research peptides matching your criteria. Try adjusting your filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all"
          >
            CLEAR ALL FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* MOBILE SLIDE-OVER FILTER MODAL */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-brand-border max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-brand" />
                <h3 className="font-orbitron font-bold text-base text-content-primary">
                  FILTERS & SORT
                </h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-brand-light text-content-muted hover:text-content-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6 text-xs">
              
              {/* Sort Selection */}
              <div className="space-y-2">
                <label className="font-orbitron font-bold text-[11px] text-content-primary uppercase tracking-wider block">
                  SORT ORDER
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'newest', label: 'Newest First' },
                    { id: 'price-asc', label: 'Price: Low to High' },
                    { id: 'price-desc', label: 'Price: High to Low' },
                    { id: 'name-asc', label: 'Name: A to Z' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSortChange(s.id)}
                      className={`px-3 py-2.5 rounded-xl font-orbitron text-[11px] font-medium border text-left flex items-center justify-between transition-all ${
                        sortBy === s.id
                          ? 'border-brand bg-brand-light text-brand font-bold'
                          : 'border-brand-border bg-surface-soft text-content-secondary'
                      }`}
                    >
                      <span>{s.label}</span>
                      {sortBy === s.id && <Check className="w-3.5 h-3.5 text-brand" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Only Toggle */}
              <div className="pt-2 border-t border-brand-border">
                <label
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-soft border border-brand-border cursor-pointer"
                >
                  <span className="font-orbitron font-semibold text-content-primary text-xs">
                    In Stock Only
                  </span>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                      inStockOnly ? 'bg-brand' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        inStockOnly ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Categories List */}
              <div className="space-y-2 pt-2 border-t border-brand-border">
                <label className="font-orbitron font-bold text-[11px] text-content-primary uppercase tracking-wider block">
                  RESEARCH CATEGORY
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full px-3.5 py-2.5 rounded-xl font-orbitron text-xs flex items-center justify-between border transition-all ${
                      selectedCategory === 'all'
                        ? 'border-brand bg-brand-light text-brand font-bold'
                        : 'border-brand-border bg-surface-soft text-content-secondary'
                    }`}
                  >
                    <span>All Categories</span>
                    {selectedCategory === 'all' && <Check className="w-4 h-4 text-brand" />}
                  </button>

                  {categories.map((cat) => {
                    const active = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`w-full px-3.5 py-2.5 rounded-xl font-orbitron text-xs flex items-center justify-between border transition-all ${
                          active
                            ? 'border-brand bg-brand-light text-brand font-bold'
                            : 'border-brand-border bg-surface-soft text-content-secondary'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {active && <Check className="w-4 h-4 text-brand" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-brand-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="px-4 py-3 rounded-xl border border-brand-border text-content-secondary font-orbitron text-xs font-semibold hover:text-accent-danger transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-orbitron text-xs font-bold shadow-purple-sm transition-all text-center"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-orbitron">Loading Catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
