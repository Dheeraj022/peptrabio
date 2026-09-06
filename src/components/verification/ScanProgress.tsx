'use client';

import React from 'react';
import { Check } from 'lucide-react';

export function ScanProgress({ scanNumber, maxScans = 3 }: { scanNumber: number; maxScans?: number }) {
  const steps = Array.from({ length: maxScans }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-sm mx-auto py-3">
      <div className="flex items-center justify-between relative">
        
        {/* Connecting line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-brand-border z-0" />
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-brand transition-all duration-500 z-0"
          style={{
            width: `${Math.min(100, Math.max(0, ((scanNumber - 1) / (maxScans - 1)) * 100))}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = step <= scanNumber;
          const isCurrent = step === scanNumber;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron text-xs font-bold transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-brand text-white border-2 border-brand shadow-purple-sm'
                    : 'bg-white text-content-muted border-2 border-brand-border'
                } ${isCurrent ? 'ring-4 ring-brand-light scale-110' : ''}`}
              >
                {isCompleted ? (
                  step < scanNumber ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    step
                  )
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-[10px] font-orbitron mt-1 font-semibold uppercase tracking-wider ${
                  isCurrent ? 'text-brand' : isCompleted ? 'text-content-primary' : 'text-content-muted'
                }`}
              >
                Scan {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
