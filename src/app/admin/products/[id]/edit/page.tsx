'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductEditorForm } from '@/components/admin/ProductEditorForm';
import { Product } from '@/types';
import { fetchProductById } from '@/lib/products-store';
import { Atom } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
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
    return (
      <AdminLayout>
        <div className="p-12 text-center font-orbitron">
          <Atom className="w-8 h-8 text-brand animate-spin mx-auto mb-2" />
          <span>LOADING PRODUCT SPECIFICATION...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="p-12 text-center font-orbitron text-accent-danger">
          PRODUCT NOT FOUND
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ProductEditorForm initialProduct={product} />
    </AdminLayout>
  );
}
