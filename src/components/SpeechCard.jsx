import React from 'react';
import { Mic, Quote } from 'lucide-react';

export default function SpeechCard({ item, isDarkMode }) {
  const isGap = item.isGapFix || item.is_gap_fix;
  const cardStyles = isGap
    ? (isDarkMode 
        ? 'bg-amber-950/20 border-amber-500/60 hover:border-amber-400 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30' 
        : 'bg-amber-50/40 border-amber-300 hover:border-amber-400 shadow-lg shadow-amber-200 ring-1 ring-amber-200/50')
    : (isDarkMode 
        ? 'bg-slate-950/60 border-slate-800 hover:border-violet-500/40 shadow-sm' 
        : 'bg-stone-50/70 border-stone-100 hover:border-violet-200 shadow-md hover:bg-white');

  return (
    <div 
      className={`rounded-3xl p-5 border flex flex-col justify-between gap-4 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-xl ${cardStyles}`}
      onClick={() => item.url && item.url !== '#' && window.open(item.url, '_blank')}
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 ${isDarkMode ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : 'bg-violet-50 text-violet-700 border border-violet-100'}`}>
            <Mic className="w-3 h-3 shrink-0" />
            Speech
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${item.signalScore > 90 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
            {item.signalScore || item.signal_score}% Signal
          </span>
        </div>

        <div className={`mt-2 flex-1 rounded-2xl p-4 border relative overflow-hidden flex flex-col justify-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'}`}>
          <Quote className={`absolute top-2 right-2 w-12 h-12 opacity-10 ${isDarkMode ? 'text-slate-400' : 'text-stone-300'}`} />
          <h3 className={`text-sm font-extrabold italic leading-snug line-clamp-3 relative z-10 transition ${isDarkMode ? 'text-slate-200 group-hover:text-violet-300' : 'text-stone-800 group-hover:text-violet-700'}`}>
            "{item.title}"
          </h3>
        </div>

        <div className="mt-auto pt-2">
          <p className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            {item.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
