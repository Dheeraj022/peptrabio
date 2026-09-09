'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductVerificationCode, VerificationCodeStatus } from '@/types/verification';
import {
  getLocalVerificationCodes,
  updateCodeStatus,
  deleteVerificationCode
} from '@/lib/verification-store';
import { VerificationQRCodeModal } from '@/components/admin/VerificationQRCodeModal';
import { VerificationScanHistoryModal } from '@/components/admin/VerificationScanHistoryModal';
import {
  ShieldCheck,
  Plus,
  Search,
  QrCode,
  History,
  Download,
  Power,
  Ban,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

export default function AdminVerificationPage() {
  const [codes, setCodes] = useState<ProductVerificationCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scanFilter, setScanFilter] = useState('all');

  // Modals
  const [selectedQR, setSelectedQR] = useState<ProductVerificationCode | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<ProductVerificationCode | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{
    code: ProductVerificationCode;
    action: VerificationCodeStatus;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ProductVerificationCode | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    setCodes(getLocalVerificationCodes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleStatusUpdate = async (codeId: string, status: VerificationCodeStatus) => {
    await updateCodeStatus(codeId, status);
    setActionConfirm(null);
    loadData();
    showToast(`Code status set to ${status}.`);
  };

  const handleDeleteCode = async (codeId: string) => {
    await deleteVerificationCode(codeId);
    setDeleteConfirm(null);
    loadData();
    showToast('Verification code permanently deleted.');
  };

  // CSV Export for packaging / printing team (Section 14 of spec)
  const handleExportCSV = () => {
    if (codes.length === 0) return;

    const headers = [
      'Code',
      'Product Name',
      'Product Code',
      'Batch Number',
      'Serial Number',
      'Maximum Scans',
      'Scan Count',
      'Status',
      'Created At'
    ];

    const rows = filteredCodes.map((c) => [
      c.code,
      `"${c.product_name || 'Peptide'}"`,
      c.product_code || '',
      c.batch_number,
      c.serial_number || '',
      c.max_scans,
      c.scan_count,
      c.status,
      c.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PeptraBio_Verification_Codes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported verification codes CSV for packaging team.');
  };

  // Stats calculation
  const totalCodes = codes.length;
  const activeCodes = codes.filter((c) => c.status === 'active').length;
  const scannedCodes = codes.filter((c) => c.scan_count > 0).length;
  const fullyScannedCodes = codes.filter((c) => c.scan_count >= c.max_scans).length;
  const deactivatedCodes = codes.filter((c) => c.status === 'deactivated' || c.status === 'blocked').length;

  // Filtered List
  const filteredCodes = codes.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (scanFilter === 'unscanned' && c.scan_count !== 0) return false;
    if (scanFilter === 'scanned' && c.scan_count === 0) return false;
    if (scanFilter === 'fully-scanned' && c.scan_count < c.max_scans) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCode = c.code.toLowerCase().includes(q);
      const matchBatch = c.batch_number.toLowerCase().includes(q);
      const matchProduct = c.product_name?.toLowerCase().includes(q);
      const matchSerial = c.serial_number?.toLowerCase().includes(q);
      if (!matchCode && !matchBatch && !matchProduct && !matchSerial) return false;
    }

    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-brand text-white px-5 py-3 rounded-2xl shadow-purple-glow font-orbitron text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-purple-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-extrabold text-content-primary">
              AUTHENTICITY & VERIFICATION CODES
            </h1>
            <p className="text-xs text-content-secondary font-sans mt-0.5">
              Generate unique box authentication codes, view QR packaging labels, export CSVs, and audit server scan logs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white border border-brand-border hover:border-brand text-content-primary hover:text-brand font-orbitron text-xs font-semibold rounded-full shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-brand" />
              <span>EXPORT CSV</span>
            </button>

            <Link
              href="/admin/verification/new"
              className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>GENERATE CODES</span>
            </Link>
          </div>
        </div>

        {/* 5 KPI Metric Cards (Section 22 of spec) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-sm space-y-1">
            <div className="flex items-center justify-between text-content-muted">
              <span className="font-orbitron text-[10px] uppercase font-semibold">Total Codes</span>
              <ShieldCheck className="w-4 h-4 text-brand" />
            </div>
            <div className="font-orbitron font-extrabold text-xl text-content-primary">
              {totalCodes}
            </div>
            <div className="text-[10px] text-content-muted">Generated units</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-sm space-y-1">
            <div className="flex items-center justify-between text-content-muted">
              <span className="font-orbitron text-[10px] uppercase font-semibold">Active Codes</span>
              <CheckCircle2 className="w-4 h-4 text-accent-success" />
            </div>
            <div className="font-orbitron font-extrabold text-xl text-accent-success">
              {activeCodes}
            </div>
            <div className="text-[10px] text-content-muted">Ready for scan</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-sm space-y-1">
            <div className="flex items-center justify-between text-content-muted">
              <span className="font-orbitron text-[10px] uppercase font-semibold">Scanned</span>
              <Sparkles className="w-4 h-4 text-brand" />
            </div>
            <div className="font-orbitron font-extrabold text-xl text-brand">
              {scannedCodes}
            </div>
            <div className="text-[10px] text-content-muted">&gt;0 scans logged</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-sm space-y-1">
            <div className="flex items-center justify-between text-content-muted">
              <span className="font-orbitron text-[10px] uppercase font-semibold">3/3 Max Scans</span>
              <AlertTriangle className="w-4 h-4 text-accent-warning" />
            </div>
            <div className="font-orbitron font-extrabold text-xl text-accent-warning">
              {fullyScannedCodes}
            </div>
            <div className="text-[10px] text-content-muted">Limit reached</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-sm space-y-1">
            <div className="flex items-center justify-between text-content-muted">
              <span className="font-orbitron text-[10px] uppercase font-semibold">Deactivated</span>
              <Lock className="w-4 h-4 text-content-muted" />
            </div>
            <div className="font-orbitron font-extrabold text-xl text-content-secondary">
              {deactivatedCodes}
            </div>
            <div className="text-[10px] text-content-muted">Restricted</div>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-brand absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, product, batch #, serial..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8FD] border border-brand-border rounded-full text-xs font-sans text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-brand-border rounded-full px-3.5 py-2 text-xs font-orbitron text-content-primary focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={scanFilter}
              onChange={(e) => setScanFilter(e.target.value)}
              className="bg-white border border-brand-border rounded-full px-3.5 py-2 text-xs font-orbitron text-content-primary focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">Scans: All</option>
              <option value="unscanned">0/3 Unscanned</option>
              <option value="scanned">1-3 Scanned</option>
              <option value="fully-scanned">3/3 Max Scans</option>
            </select>
          </div>
        </div>

        {/* Verification Codes Table (Section 12 of spec) */}
        <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF8FD] text-content-muted font-orbitron text-[10px] border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4">Authenticity Code</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Batch Number</th>
                  <th className="py-3.5 px-4">Serial</th>
                  <th className="py-3.5 px-4">Scans Used</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredCodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-content-muted font-sans">
                      No verification codes found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-brand-subtle/50 transition-colors">
                      
                      {/* Code */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-brand tracking-wider">
                          {code.code}
                        </div>
                        <div className="text-[10px] text-content-muted">
                          {new Date(code.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="font-orbitron font-semibold text-content-primary">
                          {code.product_name || 'Research Peptide'}
                        </div>
                        <div className="text-[10px] font-mono text-content-muted">
                          {code.product_code || ''}
                        </div>
                      </td>

                      {/* Batch */}
                      <td className="py-3 px-4 font-mono font-bold text-content-secondary">
                        {code.batch_number}
                      </td>

                      {/* Serial */}
                      <td className="py-3 px-4 font-mono text-content-muted">
                        {code.serial_number || '—'}
                      </td>

                      {/* Scans */}
                      <td className="py-3 px-4">
                        <span className={`font-orbitron font-bold text-xs ${
                          code.scan_count === 0
                            ? 'text-content-muted'
                            : code.scan_count >= code.max_scans
                            ? 'text-accent-warning'
                            : 'text-brand'
                        }`}>
                          {code.scan_count} / {code.max_scans}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-orbitron text-[10px] font-bold uppercase ${
                          code.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : code.status === 'deactivated'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {code.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* View QR */}
                          <button
                            onClick={() => setSelectedQR(code)}
                            className="p-1.5 rounded-lg text-content-muted hover:text-brand hover:bg-brand-light transition-colors"
                            title="View Packaging QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* View Scan History */}
                          <button
                            onClick={() => setSelectedHistory(code)}
                            className="p-1.5 rounded-lg text-content-muted hover:text-brand hover:bg-brand-light transition-colors"
                            title="View Scan Audit History"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Toggle Active / Deactivate */}
                          {code.status === 'active' ? (
                            <button
                              onClick={() => setActionConfirm({ code, action: 'deactivated' })}
                              className="p-1.5 rounded-lg text-content-muted hover:text-accent-warning hover:bg-amber-50 transition-colors"
                              title="Deactivate Code"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setActionConfirm({ code, action: 'active' })}
                              className="p-1.5 rounded-lg text-content-muted hover:text-accent-success hover:bg-emerald-50 transition-colors"
                              title="Re-activate Code"
                            >
                              <Power className="w-4 h-4 text-accent-success" />
                            </button>
                          )}

                          {/* Block */}
                          <button
                            onClick={() => setActionConfirm({ code, action: 'blocked' })}
                            className="p-1.5 rounded-lg text-content-muted hover:text-accent-danger hover:bg-red-50 transition-colors"
                            title="Block Code"
                          >
                            <Ban className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirm(code)}
                            className="p-1.5 rounded-lg text-content-muted hover:text-accent-danger hover:bg-red-50 transition-colors"
                            title="Delete Code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code Modal */}
        {selectedQR && (
          <VerificationQRCodeModal
            codeRecord={selectedQR}
            onClose={() => setSelectedQR(null)}
          />
        )}

        {/* Scan History Audit Modal */}
        {selectedHistory && (
          <VerificationScanHistoryModal
            codeRecord={selectedHistory}
            onClose={() => setSelectedHistory(null)}
          />
        )}

        {/* Action Confirmation Modal (Section 15 of spec) */}
        {actionConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-2 border-brand-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-brand flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-orbitron font-bold text-lg text-content-primary">
                  CONFIRM STATUS CHANGE
                </h3>
                <p className="text-xs text-content-secondary font-sans">
                  Are you sure you want to set the status of code <strong className="font-mono text-brand">{actionConfirm.code.code}</strong> to <strong className="font-orbitron uppercase">{actionConfirm.action}</strong>?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActionConfirm(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-content-primary font-orbitron text-xs font-semibold rounded-full transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleStatusUpdate(actionConfirm.code.id, actionConfirm.action)}
                  className="py-2.5 px-4 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full transition-all shadow-sm"
                >
                  CONFIRM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-2 border-red-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-accent-danger flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-orbitron font-bold text-lg text-content-primary">
                  DELETE VERIFICATION CODE
                </h3>
                <p className="text-xs text-content-secondary font-sans">
                  Are you sure you want to permanently delete code <strong className="font-mono text-brand">{deleteConfirm.code}</strong> for <span className="font-medium text-content-primary">{deleteConfirm.product_name}</span>? This action cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-content-primary font-orbitron text-xs font-semibold rounded-full transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleDeleteCode(deleteConfirm.id)}
                  className="py-2.5 px-4 bg-accent-danger hover:bg-red-700 text-white font-orbitron text-xs font-semibold rounded-full transition-all shadow-sm"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
