'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface AspirationPivotAlertProps {
  isDarkMode?: boolean;
  onPivotAccept?: (oldTopic: string, newTopic: string) => void;
}

export default function AspirationPivotAlert({ isDarkMode = false, onPivotAccept }: AspirationPivotAlertProps) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'dismissed'>('pending');

  if (status === 'dismissed') {
    return null;
  }

  return (
    <div className="w-full transition-all duration-300">
      {status === 'pending' ? (
        <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all ${
          isDarkMode 
            ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-900 shadow-amber-500/5' 
            : 'border-amber-200 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-white shadow-amber-500/5'
        }`}>
          {/* Top glowing accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`mt-0.5 rounded-xl p-2.5 shrink-0 border ${
                isDarkMode 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                  : 'bg-amber-100 text-amber-700 border-amber-200'
              }`}>
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase border ${
                    isDarkMode 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                      : 'bg-amber-100 text-amber-800 border-amber-300/60'
                  }`}>
                    AI Recalibration Sync
                  </span>
                  <span className={`flex items-center gap-1 text-[11px] font-mono ${
                    isDarkMode ? 'text-slate-400' : 'text-stone-500'
                  }`}>
                    <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                    Implicit Profiling Triggered
                  </span>
                </div>
                <p className={`text-sm font-medium leading-relaxed ${
                  isDarkMode ? 'text-slate-200' : 'text-stone-800'
                }`}>
                  <strong className={isDarkMode ? 'text-amber-300' : 'text-amber-700'}>Notice:</strong> You've skipped <span className="text-rose-600 font-semibold underline decoration-rose-400 font-mono text-xs">'Hardware Engineering'</span> content for 2 weeks but engaged heavily with <span className="text-teal-700 font-semibold underline decoration-teal-400 font-mono text-xs">'Product Management'</span>. Would you like to officially pivot your Identity Graph?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
              <button
                onClick={() => setStatus('dismissed')}
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white' 
                    : 'border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                <XCircle className="h-4 w-4 text-stone-400" />
                Dismiss
              </button>
              <button
                onClick={() => {
                  setStatus('accepted');
                  if (onPivotAccept) onPivotAccept('Hardware Engineering', 'Product Management');
                }}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-orange-500 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Accept Pivot
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl border p-4 text-xs font-semibold flex items-center justify-between shadow-xs ${
          isDarkMode 
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>
              <strong>Identity Graph Recalibrated!</strong> 'Hardware Engineering' weight reduced by 40% and 'Product Management' elevated to Primary Focus Node.
            </span>
          </div>
          <button
            onClick={() => setStatus('dismissed')}
            className="text-emerald-700 hover:text-emerald-900 text-xs underline cursor-pointer"
          >
            Hide Notice
          </button>
        </div>
      )}
    </div>
  );
}
