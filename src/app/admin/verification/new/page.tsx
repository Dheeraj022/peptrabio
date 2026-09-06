'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Product } from '@/types';
import { ProductVerificationCode } from '@/types/verification';
import { getLocalProducts } from '@/lib/products-store';
import { createVerificationBatch } from '@/lib/verification-store';
import { VerificationQRCodeModal } from '@/components/admin/VerificationQRCodeModal';
import {
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  QrCode,
  Download,
  CheckCircle2,
  Atom,
  Lock,
  Layers
} from 'lucide-react';

export default function NewVerificationBatchPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [batchNumber, setBatchNumber] = useState('SLK-2025-01');
  const [batchName, setBatchName] = useState('');
  const [serialPrefix, setSerialPrefix] = useState('SN');
  const [quantity, setQuantity] = useState(25);
  const [maxScans, setMaxScans] = useState(3);
  const [generating, setGenerating] = useState(false);

  // Results state
  const [generatedCodes, setGeneratedCodes] = useState<ProductVerificationCode[] | null>(null);
  const [selectedQR, setSelectedQR] = useState<ProductVerificationCode | null>(null);

  useEffect(() => {
    const prods = getLocalProducts();
    setProducts(prods);
    if (prods.length > 0) {
      setSelectedProductId(prods[0].id);
      if (prods[0].product_code) {
        setBatchNumber(`${prods[0].product_code}-2025`);
      }
    }
  }, []);

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const p = products.find((x) => x.id === prodId);
    if (p && p.product_code) {
      setBatchNumber(`${p.product_code}-2025`);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !batchNumber.trim() || quantity <= 0) return;

    setGenerating(true);

    try {
      const results = await createVerificationBatch({
        product_id: selectedProductId,
        batch_name: batchName.trim() || batchNumber.trim(),
        batch_number: batchNumber.trim(),
        serial_prefix: serialPrefix.trim() || undefined,
        quantity: Number(quantity),
        max_scans: Number(maxScans) || 3,
      });

      setGeneratedCodes(results);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportGeneratedCSV = () => {
    if (!generatedCodes || generatedCodes.length === 0) return;

    const headers = [
      'Code',
      'Product Name',
      'Product Code',
      'Batch Number',
      'Serial Number',
      'Maximum Scans',
      'Status',
      'Created At'
    ];

    const rows = generatedCodes.map((c) => [
      c.code,
      `"${c.product_name || 'Peptide'}"`,
      c.product_code || '',
      c.batch_number,
      c.serial_number || '',
      c.max_scans,
      c.status,
      c.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Batch_${batchNumber}_Codes_${generatedCodes.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl font-sans">
        
        {/* Header */}
        <div className="border-b border-brand-border pb-5">
          <Link
            href="/admin/verification"
            className="inline-flex items-center text-xs font-orbitron text-brand hover:underline mb-1"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            BACK TO VERIFICATION CODES
          </Link>
          <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
            GENERATE AUTHENTICITY CODES
          </h1>
          <p className="text-xs text-content-secondary font-sans mt-0.5">
            Create cryptographically secure, collision-free codes and QR parameters for product box packaging.
          </p>
        </div>

        {/* Generation Form */}
        {!generatedCodes ? (
          <form onSubmit={handleGenerate} className="bg-white border-2 border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            <div className="flex items-center space-x-3 border-b border-brand-border pb-4">
              <ShieldCheck className="w-6 h-6 text-brand" />
              <h2 className="font-orbitron font-bold text-base text-content-primary">
                BATCH CODE GENERATION PARAMETERS
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-sans">
              
              {/* Product Select */}
              <div className="sm:col-span-2">
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  SELECT PRODUCT CATALOG ITEM *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-brand-border text-xs font-orbitron font-medium text-content-primary bg-white focus:outline-none focus:border-brand cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.size}) • {p.product_code || p.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Number */}
              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  MANUFACTURING BATCH NUMBER *
                </label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. SLK-2025-04"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border font-mono text-xs focus:outline-none focus:border-brand"
                />
              </div>

              {/* Batch Name (Optional) */}
              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  BATCH LABEL / PRODUCTION RUN (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. Q1 Laboratory Run"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  QUANTITY OF CODES TO GENERATE *
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border font-mono text-xs font-bold text-brand focus:outline-none focus:border-brand"
                />
                <span className="text-[10px] text-content-muted">One code per physical box. Example: 25, 50, 100</span>
              </div>

              {/* Serial Prefix */}
              <div>
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  SERIAL NUMBER PREFIX (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={serialPrefix}
                  onChange={(e) => setSerialPrefix(e.target.value)}
                  placeholder="e.g. SN-A"
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border font-mono text-xs focus:outline-none focus:border-brand"
                />
              </div>

              {/* Max Scans */}
              <div className="sm:col-span-2">
                <label className="block font-orbitron text-[10px] text-content-muted mb-1">
                  MAXIMUM ALLOWED SUCCESSFUL SCANS PER BOX (DEFAULT: 3)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={maxScans}
                  onChange={(e) => setMaxScans(Number(e.target.value))}
                  className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-brand-border font-mono text-xs font-bold text-content-primary focus:outline-none focus:border-brand"
                />
                <span className="text-[10px] text-content-muted block mt-1">
                  Standard security protocol enforces 3 scans before requiring customer support intervention.
                </span>
              </div>

            </div>

            {/* Cryptographic notice */}
            <div className="p-4 rounded-2xl bg-[#FAF8FD] border border-brand-border text-xs text-content-secondary space-y-1">
              <div className="font-orbitron font-bold text-brand flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>CRYPTOGRAPHIC RANDOM GENERATION</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Codes are generated using high-entropy random byte streams in format <strong>PV-XXXX-XXXX-XXXX</strong> with ambiguous characters (0/O, 1/I) removed.
              </p>
            </div>

            <div className="pt-2 border-t border-brand-border flex justify-end">
              <button
                type="submit"
                disabled={generating}
                className="px-8 py-3.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-glow flex items-center space-x-2 transition-all hover:scale-[1.01]"
              >
                {generating ? (
                  <>
                    <Atom className="w-4 h-4 animate-spin text-purple-300" />
                    <span>GENERATING {quantity} SECURE CODES...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>GENERATE {quantity} CODES</span>
                  </>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* Generation Results Screen */
          <div className="space-y-6">
            
            <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-emerald-950">
                <CheckCircle2 className="w-8 h-8 text-accent-success shrink-0" />
                <div>
                  <h3 className="font-orbitron font-bold text-base text-emerald-900">
                    {generatedCodes.length} VERIFICATION CODES GENERATED SUCCESSFULLY
                  </h3>
                  <div className="text-xs text-emerald-800">
                    Batch Number: {batchNumber} • Status: Active & Ready for Box Printing
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleExportGeneratedCSV}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-orbitron text-xs font-semibold rounded-full shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT BATCH CSV</span>
                </button>
              </div>
            </div>

            {/* Table of Generated Codes */}
            <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-brand-border flex items-center justify-between bg-surface-soft">
                <span className="font-orbitron font-bold text-xs text-content-primary">
                  GENERATED BATCH PREVIEW ({generatedCodes.length} CODES)
                </span>
                <Link
                  href="/admin/verification"
                  className="text-xs font-orbitron text-brand hover:underline"
                >
                  View All Codes Table →
                </Link>
              </div>

              <div className="overflow-x-auto max-h-[450px]">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#FAF8FD] text-content-muted font-orbitron text-[10px] border-b border-brand-border sticky top-0">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Generated Code</th>
                      <th className="py-3 px-4">Serial Number</th>
                      <th className="py-3 px-4">Max Scans</th>
                      <th className="py-3 px-4">QR Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {generatedCodes.map((c, i) => (
                      <tr key={c.id} className="hover:bg-brand-subtle/50">
                        <td className="py-2.5 px-4 font-mono text-content-muted">{i + 1}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-brand tracking-wider">{c.code}</td>
                        <td className="py-2.5 px-4 font-mono text-content-secondary">{c.serial_number}</td>
                        <td className="py-2.5 px-4 font-orbitron text-xs">{c.max_scans} scans</td>
                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => setSelectedQR(c)}
                            className="p-1 text-content-muted hover:text-brand hover:bg-brand-light rounded-lg transition-colors flex items-center space-x-1 font-orbitron text-[10px]"
                          >
                            <QrCode className="w-4 h-4 text-brand" />
                            <span>VIEW QR</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setGeneratedCodes(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-content-primary font-orbitron text-xs font-semibold rounded-full transition-all"
              >
                CREATE ANOTHER BATCH
              </button>
              <Link
                href="/admin/verification"
                className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm transition-all"
              >
                RETURN TO VERIFICATION DASHBOARD
              </Link>
            </div>

          </div>
        )}

        {/* QR Modal */}
        {selectedQR && (
          <VerificationQRCodeModal
            codeRecord={selectedQR}
            onClose={() => setSelectedQR(null)}
          />
        )}

      </div>
    </AdminLayout>
  );
}
