import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  BookOpen, 
  Code, 
  Brain, 
  Clock, 
  ExternalLink, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { fetchAIRecommendations } from '../lib/contentRecommender';
import AudioPlayer from './AudioPlayer';
import SpeechCard from './SpeechCard';
import VideoCard from './VideoCard';

export default function CuratedFeed({ isDarkMode = false, currentUser = null }) {
  const staticFallbackItems = [
    {
      type: "video",
      title: "Deep Work – Achieve Peak Performance",
      youtubeId: "gTaJhjQHcf8",
      url: "https://www.youtube.com/watch?v=gTaJhjQHcf8",
      duration: "14 min",
      reason: "Why: Cal Newport deep work framework — directly boosts ability to reach your goal.",
      signalScore: 98,
      isGapFix: false
    },
    {
      type: "short",
      title: "The 5-Second Rule in 60 Seconds",
      youtubeId: "k2TaFVANNTg",
      url: "https://www.youtube.com/shorts/k2TaFVANNTg",
      duration: "60 sec",
      reason: "Why: Instant motivation trigger — activates momentum toward your goal.",
      signalScore: 96,
      isGapFix: false
    },
    {
      type: "reel",
      title: "Flow State Activation – Get Deep Focus",
      youtubeId: "QkOCbt_o2HY",
      url: "https://www.youtube.com/watch?v=QkOCbt_o2HY",
      duration: "45 sec",
      reason: "Why: Primes your brain for high-yield learning sessions.",
      signalScore: 95,
      isGapFix: false
    },
    {
      type: "article",
      title: "The Feynman Technique – Learn Anything",
      youtubeId: "",
      url: "https://fs.blog/feynman-technique/",
      duration: "6 min read",
      reason: "Why: The best learning strategy — explains through teaching to lock in understanding.",
      signalScore: 94,
      isGapFix: false
    }
  ];

  const [items, setItems] = useState(staticFallbackItems);
  const [loading, setLoading] = useState(false);
  const [currentGoal, setCurrentGoal] = useState('');

  const userId = currentUser?.id || 'usr_default';

  // Get goal text dynamically from localStorage
  const getGoalText = () => {
    const topicsStr = localStorage.getItem('synapse_user_feed_topics');
    if (topicsStr) {
      try {
        const topics = JSON.parse(topicsStr);
        if (Array.isArray(topics) && topics.length > 0) {
          return `Topics: ${topics.join(', ')}`;
        }
      } catch (e) {
        console.warn('Failed to parse feed topics:', e);
      }
    }
    return localStorage.getItem('synapse_user_aspiration') || 
           localStorage.getItem('aspiration') || 
           'React & Frontend Mastery';
  };

  useEffect(() => {
    // Render static fallback, no async API loops
    setCurrentGoal(getGoalText());

    // Custom events and storage event listeners
    const handleUpdate = () => {
      setCurrentGoal(getGoalText());
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('aspirationUpdated', handleUpdate);
    window.addEventListener('feedTopicsUpdated', handleUpdate);
    window.addEventListener('quizSubmitted', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('aspirationUpdated', handleUpdate);
      window.removeEventListener('feedTopicsUpdated', handleUpdate);
      window.removeEventListener('quizSubmitted', handleUpdate);
    };
  }, [userId]);

  // Calculate average signal score of current recommendations
  const avgSignalScore = items.length > 0 
    ? Math.round(items.reduce((acc, curr) => acc + curr.signalScore, 0) / items.length)
    : 96;

  return (
    <div className={`rounded-[2rem] p-6 md:p-8 border shadow-xl relative overflow-hidden backdrop-blur-xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-indigo-500/5' 
        : 'bg-white/80 border-stone-100/90 text-stone-900 shadow-stone-200/50'
    }`}>
      
      {/* Top Accent Gradient Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] ${
        isDarkMode 
          ? 'bg-gradient-to-r from-violet-500 via-indigo-500 to-teal-400' 
          : 'bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500'
      }`} />

      {/* Component Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-2xl ${
              isDarkMode ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-100 text-violet-600'
            }`}>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest font-mono uppercase text-violet-500 block">
                CONTENT SIGNAL EVALUATION ENGINE
              </span>
              <h2 className={`text-xl font-black tracking-tight ${
                isDarkMode ? 'text-white' : 'text-stone-900'
              }`}>
                AI CURATED FOR YOU
              </h2>
            </div>
          </div>

          <p className={`text-xs leading-relaxed max-w-2xl mt-1 ${
            isDarkMode ? 'text-slate-400' : 'text-stone-500'
          }`}>
            Scored for high signal-to-noise ratio based on your fatigue logs and {currentGoal} goals.
          </p>
        </div>

        {/* Overall Signal Score Badge */}
        <div className={`px-4 py-2 rounded-2xl border text-xs font-mono font-bold flex items-center gap-2 ${
          isDarkMode ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-violet-50 border-violet-100 text-violet-700'
        }`}>
          <Activity className="w-4 h-4 text-violet-500" />
          <span>Avg Signal Score: {avgSignalScore}%</span>
        </div>
      </div>

      {/* Grid rendering (Loading state vs Dynamic card lists) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`rounded-3xl p-5 border flex flex-col justify-between gap-5 animate-pulse min-h-[350px] ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-stone-50/40 border-stone-100'
            }`}>
              <div className="flex flex-col gap-3">
                <div className="h-4 bg-slate-700/40 rounded-full w-2/3" />
                <div className="aspect-video bg-slate-700/20 rounded-2xl" />
                <div className="h-3 bg-slate-700/30 rounded-full w-full" />
                <div className="h-3 bg-slate-700/30 rounded-full w-4/5" />
              </div>
              <div className="h-10 bg-slate-700/10 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const isGap = item.isGapFix;
            const contentType = item.contentType || item.content_type || item.type;

            if (contentType === 'podcast') {
              return <AudioPlayer key={index} item={item} isDarkMode={isDarkMode} />;
            }
            if (contentType === 'speech') {
              return <SpeechCard key={index} item={item} isDarkMode={isDarkMode} />;
            }
            if (contentType === 'video' || contentType === 'short' || contentType === 'reel') {
              return <VideoCard key={index} item={item} isDarkMode={isDarkMode} />;
            }

            // Choose icon and labels based on media type
            let TypeIcon = Play;
            let typeLabel = "The Core Concept";
            if (contentType === 'video') {
              TypeIcon = Play;
              typeLabel = "Video Course";
            } else if (contentType === 'short') {
              TypeIcon = Clock;
              typeLabel = "Quick Short";
            } else if (contentType === 'reel') {
              TypeIcon = Sparkles;
              typeLabel = "Visual Reel";
            } else if (contentType === 'article') {
              TypeIcon = BookOpen;
              typeLabel = "Deep Dive";
            } else {
              TypeIcon = Code;
              typeLabel = "Active Practice";
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

            const hasYoutube = item.youtubeId && item.youtubeId.length === 11;
            const thumbnailUrl = hasYoutube ? `https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg` : null;

            const fallbackGradients = [
              'from-violet-600 via-indigo-600 to-purple-500',
              'from-indigo-600 via-blue-600 to-cyan-500',
              'from-emerald-500 via-teal-600 to-cyan-500',
              'from-pink-500 via-purple-600 to-indigo-500'
            ];
            const gradient = isGap 
              ? 'from-rose-500 via-red-500 to-amber-500' 
              : fallbackGradients[index % fallbackGradients.length];

            return (
              <div 
                key={index}
                onClick={() => item.url && item.url !== '#' && window.open(item.url, '_blank')}
                className={`rounded-3xl p-5 border flex flex-col justify-between gap-5 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-xl ${cardStyles}`}
              >
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
                        item.signalScore > 90 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                          : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                      }`}>
                        {item.signalScore}% Signal
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail / Visual Block */}
                  {contentType !== 'article' ? (
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center shadow-md group-hover:scale-[1.02] transition-transform duration-300">
                      {thumbnailUrl ? (
                        <>
                          <img 
                            src={thumbnailUrl} 
                            alt={item.title} 
                            className="absolute inset-0 w-full h-full object-cover opacity-80" 
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
                        </>
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-tr ${gradient}`} />
                      )}
                      
                      <div className="w-10 h-10 rounded-full bg-white/90 text-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition cursor-pointer z-10">
                        <Play className="w-4 h-4 fill-current ml-0.5 text-violet-600" />
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px] font-bold backdrop-blur-xs">
                        {(contentType || item.type).toUpperCase()} • {item.duration}
                      </span>
                    </div>
                  ) : (
                    /* Article banner block */
                    <div className={`rounded-2xl p-4 border flex flex-col justify-between h-28 relative overflow-hidden ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200/60'
                    }`}>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isGap 
                          ? (isDarkMode ? 'text-amber-400' : 'text-amber-600')
                          : (isDarkMode ? 'text-indigo-400' : 'text-indigo-650')
                      }`}>
                        {isGap ? 'CRITICAL DRILL' : 'ESSENTIAL ARCHITECTURE'}
                      </span>
                      <p className={`text-xs font-serif italic leading-snug line-clamp-2 ${
                        isDarkMode ? 'text-slate-350' : 'text-stone-705'
                      }`}>
                        "{item.title}"
                      </p>
                      <div className="flex justify-between items-center text-[9px] font-mono text-stone-400">
                        <span>{item.duration}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  )}

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

                {/* AI Reasoning Reason */}
                <div className={`p-3 rounded-2xl border text-[11px] font-medium leading-normal flex items-start gap-2 ${
                  isGap
                    ? (isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50/80 border-amber-100 text-amber-900')
                    : (isDarkMode ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-violet-50/80 border-violet-100 text-violet-900')
                }`}>
                  <Brain className={`w-4 h-4 shrink-0 mt-0.5 ${isGap ? 'text-amber-500 animate-pulse' : 'text-violet-500'}`} />
                  <div>
                    <span className={`font-bold block text-[10px] font-mono uppercase tracking-wider ${isGap ? 'text-amber-500' : 'text-violet-500'}`}>
                      WHY THIS?
                    </span>
                    <span className="line-clamp-2">{item.reason}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
