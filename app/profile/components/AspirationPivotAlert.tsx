'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface SkippedTaskData {
  skippedTopic: string;
  engagedTopic: string;
  duration?: string;
}

interface AspirationPivotAlertProps {
  isDarkMode?: boolean;
  onPivotAccept?: (oldTopic: string, newTopic: string) => void;
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
}

export default function AspirationPivotAlert({ isDarkMode = false, onPivotAccept, currentUser }: AspirationPivotAlertProps) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'dismissed'>('dismissed');
  const [skippedTaskData, setSkippedTaskData] = useState<SkippedTaskData | null>(null);

  const getStorageKey = () => {
    return currentUser?.id ? `synapse_user_${currentUser.id}_skipped_accepted_task` : 'synapse_skipped_accepted_task';
  };

  useEffect(() => {
    const checkSkippedTask = () => {
      const key = getStorageKey();
      const raw = localStorage.getItem(key) || localStorage.getItem('synapse_skipped_accepted_task');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.skippedTopic) {
            setSkippedTaskData(parsed);
            setStatus('pending');
            return;
          }
        } catch (e) {
          if (typeof raw === 'string' && raw.trim()) {
            setSkippedTaskData({
              skippedTopic: raw,
              engagedTopic: 'Product Management',
              duration: '2 weeks'
            });
            setStatus('pending');
            return;
          }
        }
      }
      setSkippedTaskData(null);
      setStatus('dismissed');
    };

    checkSkippedTask();

    window.addEventListener('storage', checkSkippedTask);
    window.addEventListener('synapse_skipped_task_updated', checkSkippedTask);
    return () => {
      window.removeEventListener('storage', checkSkippedTask);
      window.removeEventListener('synapse_skipped_task_updated', checkSkippedTask);
    };
  }, [currentUser]);

  if (status === 'dismissed' || !skippedTaskData) {
    return null;
  }

  const handleDismiss = () => {
    setStatus('dismissed');
    localStorage.removeItem(getStorageKey());
    localStorage.removeItem('synapse_skipped_accepted_task');
  };

  const handleAccept = () => {
    setStatus('accepted');
    const oldTopic = skippedTaskData.skippedTopic;
    const newTopic = skippedTaskData.engagedTopic || 'Product Management';
    localStorage.removeItem(getStorageKey());
    localStorage.removeItem('synapse_skipped_accepted_task');
    if (onPivotAccept) onPivotAccept(oldTopic, newTopic);
  };

  const skippedTopic = skippedTaskData.skippedTopic;
  const engagedTopic = skippedTaskData.engagedTopic || 'Product Management';
  const duration = skippedTaskData.duration || '2 weeks';

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
                  <strong className={isDarkMode ? 'text-amber-300' : 'text-amber-700'}>Notice:</strong> You've skipped <span className="text-rose-600 font-semibold underline decoration-rose-400 font-mono text-xs">'{skippedTopic}'</span> content for {duration} but engaged heavily with <span className="text-teal-700 font-semibold underline decoration-teal-400 font-mono text-xs">'{engagedTopic}'</span>. Would you like to officially pivot your Identity Graph?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
              <button
                onClick={handleDismiss}
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
                onClick={handleAccept}
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
              <strong>Identity Graph Recalibrated!</strong> '{skippedTopic}' weight reduced by 40% and '{engagedTopic}' elevated to Primary Focus Node.
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-emerald-700 hover:text-emerald-900 text-xs underline cursor-pointer"
          >
            Hide Notice
          </button>
        </div>
      )}
    </div>
  );
}

