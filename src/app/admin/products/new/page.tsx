'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductEditorForm } from '@/components/admin/ProductEditorForm';

export default function AddProductPage() {
  return (
    <AdminLayout>
      <ProductEditorForm />
    </AdminLayout>
  );
}
