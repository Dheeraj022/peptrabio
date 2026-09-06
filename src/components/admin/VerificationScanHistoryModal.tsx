'use client';

import React, { useEffect, useState } from 'react';
import { ProductVerificationCode, ProductVerificationScan } from '@/types/verification';
import { getCodeScanHistory } from '@/lib/verification-store';
import {
  History,
  X,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Calendar,
  Clock,
  Laptop,
  CheckCircle2,
  Atom
} from 'lucide-react';

export function VerificationScanHistoryModal({
  codeRecord,
  onClose,
}: {
  codeRecord: ProductVerificationCode;
  onClose: () => void;
}) {
  const [scans, setScans] = useState<ProductVerificationScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getCodeScanHistory(codeRecord.id);
      setScans(data);
      setLoading(false);
    }
    load();
  }, [codeRecord.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-brand-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-content-muted hover:bg-brand-light transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-brand-border pb-4">
          <History className="w-6 h-6 text-brand" />
          <div>
            <h3 className="font-orbitron font-bold text-base text-content-primary">
              VERIFICATION SCAN AUDIT TRAIL
            </h3>
            <span className="text-xs text-content-muted font-mono">
              Code: {codeRecord.code} • Batch: {codeRecord.batch_number}
            </span>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3 bg-brand-subtle p-4 rounded-2xl border border-brand-border text-center text-xs">
          <div>
            <span className="text-[10px] font-orbitron text-content-muted block">SCAN COUNT</span>
            <span className="font-orbitron font-bold text-sm text-brand">{codeRecord.scan_count} / {codeRecord.max_scans}</span>
          </div>
          <div>
            <span className="text-[10px] font-orbitron text-content-muted block">STATUS</span>
            <span className="font-orbitron font-bold text-xs uppercase text-accent-success">{codeRecord.status}</span>
          </div>
          <div>
            <span className="text-[10px] font-orbitron text-content-muted block">SERIAL</span>
            <span className="font-mono font-semibold text-content-primary">{codeRecord.serial_number || 'N/A'}</span>
          </div>
        </div>

        {/* Scan Log History Table */}
        <div className="space-y-3">
          <h4 className="font-orbitron font-bold text-xs text-content-primary">
            SERVER SCAN EVENT LOGS
          </h4>

          {loading ? (
            <div className="py-8 text-center font-orbitron text-xs">
              <Atom className="w-6 h-6 text-brand animate-spin mx-auto mb-2" />
              <span>Fetching scan history...</span>
            </div>
          ) : scans.length === 0 ? (
            <div className="p-6 bg-[#FAF8FD] rounded-2xl border border-brand-border text-center text-xs text-content-muted">
              No scan events logged for this code yet. (0/3 scans used)
            </div>
          ) : (
            <div className="border border-brand-border rounded-2xl divide-y divide-brand-border/60 overflow-hidden text-xs">
              {scans.map((scan) => (
                <div key={scan.id} className="p-4 bg-white flex flex-col sm:flex-row justify-between gap-2 hover:bg-brand-subtle/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-orbitron font-bold text-xs text-brand">
                        Scan #{scan.scan_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-orbitron text-[9px] font-semibold uppercase ${
                        scan.result === 'genuine'
                          ? 'bg-emerald-100 text-emerald-800'
                          : scan.result === 'limit_reached'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {scan.result}
                      </span>
                    </div>

                    <div className="text-[11px] text-content-muted flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-brand" />
                      <span>{new Date(scan.scanned_at).toLocaleString()}</span>
                    </div>

                    {scan.user_agent && (
                      <div className="text-[10px] text-content-secondary font-mono truncate max-w-md">
                        UA: {scan.user_agent}
                      </div>
                    )}
                  </div>

                  {scan.ip_hash && (
                    <div className="text-right text-[10px] font-mono text-content-muted self-start sm:self-auto">
                      IP Hash: {scan.ip_hash}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-brand-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-brand text-white font-orbitron text-xs font-semibold rounded-full hover:bg-brand-dark transition-all"
          >
            CLOSE AUDIT VIEW
          </button>
        </div>

      </div>
    </div>
  );
}
