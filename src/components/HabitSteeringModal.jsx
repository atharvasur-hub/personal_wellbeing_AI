import React from 'react';
import { ShieldCheck, Flame, ArrowRight, X, Zap } from 'lucide-react';
import { saveHabitLogToBackend } from '../lib/backendApi';

export default function HabitSteeringModal({ isOpen, onClose, isDarkMode = false }) {
  if (!isOpen) return null;

  const handleAcceptRedirect = () => {
    saveHabitLogToBackend({
      intercept_trigger: 'doomscroll',
      time_saved_minutes: 15,
      redirected_sprint: 'React Hooks Sprint',
      user_accepted: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className={`w-full max-w-lg border rounded-3xl p-6 md:p-8 shadow-2xl animate-slide-up flex flex-col gap-6 relative overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-stone-100 text-stone-900'
      }`}>
        
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest font-mono uppercase text-amber-500 block">
                PROACTIVE HABIT GUARDIAN
              </span>
              <h3 className="text-lg font-black tracking-tight">Time-Wasting Pattern Intercepted</h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-stone-100 border-stone-200 text-stone-400 hover:text-stone-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
          Synapse Digital Guardian detected passive social scrolling (X/Twitter, 15 mins). Redirecting back to your primary goal to prevent cognitive burnout:
        </p>

        {/* Impact Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-4 rounded-2xl border flex flex-col gap-1 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200/60'
          }`}>
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">TIME SAVED</span>
            <span className="text-base font-black text-amber-500 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-current" />
              15 Mins
            </span>
          </div>

          <div className={`p-4 rounded-2xl border flex flex-col gap-1 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200/60'
          }`}>
            <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">COGNITIVE IMPACT</span>
            <span className="text-base font-black text-emerald-500 flex items-center gap-1">
              <Zap className="w-4 h-4 fill-current" />
              +24% Prefrontal
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleAcceptRedirect}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Steer Back to React Hooks Sprint</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className={`w-full py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
              isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            Dismiss Intercept (Continue Browsing)
          </button>
        </div>

      </div>
    </div>
  );
}
