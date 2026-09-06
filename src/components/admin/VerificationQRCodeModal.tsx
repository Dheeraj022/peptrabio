'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { ProductVerificationCode } from '@/types/verification';
import { QrCode, Download, Printer, X, ShieldCheck, Copy, Check } from 'lucide-react';

export function VerificationQRCodeModal({
  codeRecord,
  onClose,
}: {
  codeRecord: ProductVerificationCode;
  onClose: () => void;
}) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://peptrabio.com';
  const verifyUrl = `${siteUrl}/verify?code=${encodeURIComponent(codeRecord.code)}`;

  useEffect(() => {
    async function generate() {
      try {
        const url = await QRCode.toDataURL(verifyUrl, {
          width: 360,
          margin: 2,
          color: {
            dark: '#120B1D',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
        setDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    }
    generate();
  }, [verifyUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${codeRecord.code}_${codeRecord.batch_number}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-brand-border rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-content-muted hover:bg-brand-light transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-brand-border pb-4">
          <QrCode className="w-6 h-6 text-brand" />
          <div>
            <h3 className="font-orbitron font-bold text-base text-content-primary">
              AUTHENTICITY QR CODE
            </h3>
            <span className="text-xs text-content-muted font-sans">
              High-Resolution Packaging Label Code
            </span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-[#FAF8FD] rounded-2xl border-2 border-brand-border shadow-inner flex flex-col items-center">
            {dataUrl ? (
              <img src={dataUrl} alt="Product QR Code" className="w-56 h-56 rounded-xl shadow-sm" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center font-orbitron text-xs">
                Generating QR...
              </div>
            )}
            <div className="font-mono font-bold text-sm text-brand tracking-widest mt-2">
              {codeRecord.code}
            </div>
          </div>

          <div className="text-center space-y-1 text-xs font-sans">
            <div className="font-semibold text-content-primary">
              {codeRecord.product_name} • Batch: {codeRecord.batch_number}
            </div>
            {codeRecord.serial_number && (
              <div className="text-content-muted font-mono">Serial: {codeRecord.serial_number}</div>
            )}
            <div className="text-[11px] text-content-secondary break-all font-mono bg-brand-subtle p-2 rounded-xl mt-2 select-all">
              {verifyUrl}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-border">
          <button
            onClick={handleCopyLink}
            className="py-2.5 px-4 bg-brand-subtle hover:bg-brand-light text-brand border border-brand-border font-orbitron text-xs font-semibold rounded-full flex items-center justify-center space-x-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED' : 'COPY URL'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-2.5 px-4 bg-brand hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-sm flex items-center justify-center space-x-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD PNG</span>
          </button>
        </div>

      </div>
    </div>
  );
}
