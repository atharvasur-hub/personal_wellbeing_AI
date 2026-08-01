import React, { useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Headphones } from 'lucide-react';

export default function AudioPlayer({ item, isDarkMode }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(p || 0);
  };

  const isGap = item.isGapFix || item.is_gap_fix;
  const cardStyles = isGap
    ? (isDarkMode 
        ? 'bg-amber-950/20 border-amber-500/60 shadow-amber-500/5 ring-1 ring-amber-500/30' 
        : 'bg-amber-50/40 border-amber-300 shadow-amber-200 ring-1 ring-amber-200/50')
    : (isDarkMode 
        ? 'bg-slate-950/60 border-slate-800 shadow-sm hover:border-violet-500/40' 
        : 'bg-stone-50/70 border-stone-100 shadow-md hover:border-violet-200 hover:bg-white');

  return (
    <div className={`rounded-3xl p-5 border flex flex-col justify-between gap-4 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-xl ${cardStyles}`} onClick={() => item.url && item.url !== '#' && window.open(item.url, '_blank')}>
      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 ${isDarkMode ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : 'bg-violet-50 text-violet-700 border border-violet-100'}`}>
          <Headphones className="w-3 h-3 shrink-0" />
          Podcast
        </span>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${item.signalScore > 90 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
          {item.signalScore || item.signal_score}% Signal
        </span>
      </div>

      <div className="flex items-center gap-4 my-2">
        <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-stone-200 text-stone-500'}`}>
          {item.thumbnailUrl || item.thumbnail_url ? (
            <img src={item.thumbnailUrl || item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <Headphones className="w-8 h-8" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-extrabold line-clamp-2 ${isDarkMode ? 'text-slate-100 group-hover:text-violet-400' : 'text-stone-800 group-hover:text-violet-600'} transition`}>
            {item.title}
          </h3>
          <p className={`text-[10px] font-mono mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            {item.duration || 'Unknown Duration'}
          </p>
        </div>
      </div>

      {/* Audio controls */}
      <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-stone-200'}`}>
          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center mt-2 px-4">
          <button className={`p-1.5 rounded-full transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-200 text-stone-500'}`}>
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={togglePlay} className={`p-3 rounded-full text-white shadow-md transition transform active:scale-95 ${isDarkMode ? 'bg-violet-600 hover:bg-violet-500' : 'bg-violet-500 hover:bg-violet-400'}`}>
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button className={`p-1.5 rounded-full transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-stone-200 text-stone-500'}`}>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
        <audio 
          ref={audioRef} 
          src={item.sourceUrl || item.source_url || item.url} 
          onTimeUpdate={handleTimeUpdate} 
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
}
