import React, { useState } from 'react';
import { Play, Clock, CheckCircle2, Brain, Sparkles, AlertTriangle } from 'lucide-react';
import ReactPlayer from 'react-player';
import { awardPoints } from '../lib/backendApi';

export default function VideoCard({ item, isDarkMode }) {
  const [completed, setCompleted] = useState(false);
  const isGap = item.isGapFix || item.is_gap_fix;
  const contentType = item.contentType || item.content_type || item.type;

  // Choose icon and labels based on media type
  let TypeIcon = Play;
  let typeLabel = "Video Course";
  if (contentType === 'short') {
    TypeIcon = Clock;
    typeLabel = "Quick Short";
  } else if (contentType === 'reel') {
    TypeIcon = Sparkles;
    typeLabel = "Visual Reel";
  }

  const cardStyles = isGap
    ? (isDarkMode 
        ? 'bg-amber-950/20 border-amber-500/60 hover:border-amber-400 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30' 
        : 'bg-amber-50/40 border-amber-300 hover:border-amber-400 shadow-lg shadow-amber-200 ring-1 ring-amber-200/50')
    : (isDarkMode 
        ? 'bg-slate-950/60 border-slate-800 hover:border-violet-500/40 shadow-sm' 
        : 'bg-stone-50/70 border-stone-100 hover:border-violet-200 shadow-md hover:bg-white');

  const badgeStyles = isGap
    ? (isDarkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-850 border border-amber-200')
    : (isDarkMode ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : 'bg-violet-50 text-violet-700 border border-violet-100');

  const handleVideoEnded = () => {
    if (completed) return;
    setCompleted(true);
    awardPoints('usr_default', 'video_watched', 10).then(() => {
      window.dispatchEvent(new CustomEvent('pointsAwarded', { detail: { points: 10 } }));
    }).catch(console.error);
  };

  return (
    <div className={`rounded-3xl p-5 border flex flex-col justify-between gap-5 transition-all duration-300 group hover:shadow-xl ${cardStyles}`}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {/* Knowledge Gap Badge Alert */}
          {isGap && (
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono uppercase flex items-center gap-1.5 self-start ${
              isDarkMode 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                : 'bg-rose-100 text-rose-800 border border-rose-200 shadow-xs'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
              <span>Knowledge Gap Identified - Target Review</span>
            </div>
          )}

          <div className="flex justify-between items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 ${badgeStyles}`}>
              <TypeIcon className="w-3 h-3 shrink-0" />
              {typeLabel}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              item.signalScore > 90 || item.signal_score > 90
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
            }`}>
              {item.signalScore || item.signal_score || 0}% Signal
            </span>
          </div>
        </div>

        {/* Embedded Video Player */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-md z-10">
          <ReactPlayer 
            url={item.url} 
            width="100%" 
            height="100%" 
            controls={true}
            onEnded={handleVideoEnded}
            config={{
              youtube: {
                playerVars: { modestbranding: 1 }
              }
            }}
          />
        </div>

        {/* Title & Detail */}
        <div>
          <h3 className={`text-sm font-extrabold transition line-clamp-1 ${
            isDarkMode 
              ? (isGap ? 'text-amber-400 group-hover:text-amber-350' : 'text-slate-100 group-hover:text-violet-400') 
              : (isGap ? 'text-amber-900 group-hover:text-amber-800' : 'text-stone-800 group-hover:text-violet-600')
          }`}>
            {item.title}
          </h3>
          <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
            isDarkMode ? 'text-slate-400' : 'text-stone-500'
          }`}>
            {item.reason}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Gamification Action Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (!completed) handleVideoEnded();
          }}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            completed 
              ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
              : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-stone-200 text-stone-600 hover:bg-stone-300')
          }`}
        >
          {completed ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Completed (+10 pts)
            </>
          ) : (
            'Mark as Complete'
          )}
        </button>
      </div>
    </div>
  );
