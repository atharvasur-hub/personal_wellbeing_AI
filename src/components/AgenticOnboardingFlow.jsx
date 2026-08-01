import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, Play, BookOpen,
  Brain, RefreshCw, Flame,
  Film, Loader2, ChevronRight, Check
} from 'lucide-react';
import { fetchAIRecommendations } from '../lib/contentRecommender';
import { saveAspirationToBackend, fetchAIRoadmap } from '../lib/backendApi';
import { saveUserAspirationToSupabase } from '../lib/supabaseClient';

// Media type config — video and article only
const MEDIA_CONFIG = {
  video: {
    label: '📹 Video Tutorial',
    badgeBg: isDark => isDark ? 'bg-violet-500/15 border-violet-500/20 text-violet-300' : 'bg-violet-50 border-violet-100 text-violet-700',
    accentColor: 'text-violet-500',
    embedPrefix: 'https://www.youtube-nocookie.com/embed/'
  },
  article: {
    label: '📖 Deep Dive Article',
    badgeBg: isDark => isDark ? 'bg-indigo-500/15 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-700',
    accentColor: 'text-indigo-500',
    embedPrefix: null
  }
};

const SIGNAL_SCORES = { video: 98, article: 94 };

// YouTube Player with auto-fallback when video is unavailable/embedding disabled
function YouTubePlayer({ videoId, title }) {
  const [fallback, setFallback] = React.useState(!videoId || videoId.length < 5);
  const iframeRef = React.useRef(null);

  // Listen for YouTube postMessage errors (100=not found, 101/150=embedding not allowed)
  React.useEffect(() => {
    const handler = (event) => {
      try {
        if (!event.data) return;
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        // YouTube iframe API sends error events via postMessage
        if (data?.event === 'infoDelivery' && data?.info?.error) {
          setFallback(true);
        }
        // Also catch the onError event
        if (data?.event === 'onError') {
          setFallback(true);
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const searchQuery = encodeURIComponent(title || 'learn programming');

  if (fallback) {
    return (
      <div className="aspect-video w-full bg-black flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          src={`https://www.youtube.com/embed?listType=search&list=${searchQuery}&autoplay=0`}
          title={`Search: ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="aspect-video w-full bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onError={() => setFallback(true)}
      />
    </div>
  );
}

// In-App Media Viewer Modal
function MediaModal({ item, isDarkMode, onClose }) {
  const config = MEDIA_CONFIG[item.type] || MEDIA_CONFIG.video;
  const isVideo = item.type !== 'article';

  // Close on Escape key
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-stone-200'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-stone-200'}`}>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold font-mono uppercase border ${config.badgeBg(isDarkMode)}`}>
              {config.label}
            </span>
            <h3 className={`text-sm font-extrabold line-clamp-1 ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>
              {item.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer text-lg font-bold ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        {isVideo ? (
          <YouTubePlayer videoId={item.youtubeId} title={item.title} />
        ) : (
          /* Article in-app reader */
          <div className={`flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-stone-50'}`} style={{ height: '60vh' }}>
            <iframe
              src={item.url}
              title={item.title}
              className="w-full flex-1 border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}

        {/* Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-stone-200'}`}>
          <div className={`text-[10px] font-mono flex items-start gap-1.5 flex-1 mr-4 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            <Brain className={`w-3 h-3 shrink-0 mt-0.5 ${config.accentColor}`} />
            <span>{item.reason || 'Curated based on your goal.'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono font-bold ${config.accentColor}`}>{item.duration}</span>
            <button
              onClick={onClose}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Media Card
function MediaCard({ item, index, isDarkMode }) {
  const config = MEDIA_CONFIG[item.type] || MEDIA_CONFIG.video;
  const signalScore = SIGNAL_SCORES[item.type] || 94;
  const [showModal, setShowModal] = React.useState(false);
  const isVideo = item.type !== 'article';

  return (
    <>
      {showModal && (
        <MediaModal item={item} isDarkMode={isDarkMode} onClose={() => setShowModal(false)} />
      )}

      <div className={`rounded-3xl p-5 border flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group ${
        isDarkMode
          ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          : 'bg-white border-stone-200/80 shadow-md hover:shadow-xl'
      }`}>

        {/* Card Top Bar */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold font-mono uppercase border flex items-center gap-1 ${config.badgeBg(isDarkMode)}`}>
            <span>{index + 1}.</span>
            <span>{config.label}</span>
          </span>
          <span className="text-[9px] font-mono text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {signalScore}% Signal
          </span>
        </div>

        {/* Media Embed / Preview Area — clicking opens in-app modal */}
        <button
          onClick={() => setShowModal(true)}
          className="relative w-full cursor-pointer group/media rounded-2xl overflow-hidden border border-transparent hover:border-indigo-500/30 transition-all duration-200"
          aria-label={`Open ${item.title}`}
        >
          {isVideo && item.youtubeId ? (
            <div className="aspect-video bg-black relative">
              <img
                src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                alt={item.title}
                className="w-full h-full object-cover opacity-80 group-hover/media:opacity-60 transition"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover/media:scale-110 transition-transform duration-200">
                  <Play className="w-6 h-6 text-slate-900 fill-slate-900 ml-1" />
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-mono font-bold">{item.duration}</span>
              </div>
            </div>
          ) : isVideo ? (
            <div className="aspect-video bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center border border-white/10">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover/media:bg-white/20 transition">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
              <span className="text-[10px] text-white/50 font-mono mt-2">{config.label}</span>
            </div>
          ) : (
            /* Article preview card — in-app, no redirect */
            <div className={`rounded-2xl h-32 border flex flex-col justify-between p-4 transition group-hover/media:border-indigo-500/40 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-200/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase text-indigo-500">DEEP DIVE ARTICLE</span>
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <p className={`text-[11px] font-serif italic leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                "{item.title}"
              </p>
              <span className="text-[9px] font-mono text-indigo-400 font-bold truncate">{item.url?.replace('https://', '')}</span>
            </div>
          )}
        </button>

        {/* Title */}
        <h3 className={`font-extrabold text-xs leading-snug line-clamp-2 ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>
          {item.title}
        </h3>

        {/* AI Reasoning Badge */}
        <div className={`p-2.5 rounded-xl border text-[10px] leading-normal flex items-start gap-1.5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-stone-50 border-stone-200/60 text-stone-500'
        }`}>
          <Brain className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${config.accentColor}`} />
          <span>{item.reason || 'Curated based on your goal.'}</span>
        </div>

        {/* Footer — open in-app, no redirect */}
        <div className="flex items-center justify-between mt-auto">
          <span className={`text-[9px] font-mono font-bold ${config.accentColor}`}>
            {item.duration}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className={`text-[9px] font-bold font-mono flex items-center gap-1 hover:underline transition cursor-pointer ${config.accentColor}`}
          >
            <span>{isVideo ? 'Watch' : 'Read'}</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </>
  );
}

// -----------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------
export default function AgenticOnboardingFlow({ isDarkMode = false }) {
  // Load valid cached media from localStorage (skip stale entries without youtubeId)
  const loadCachedMedia = () => {
    try {
      const cached = JSON.parse(localStorage.getItem('synapse_curated_media') || '[]');
      // Only use cached media if ALL video/short/reel entries have real YouTube IDs
      const isValid = cached.length >= 4 && cached
        .filter(i => i.type !== 'article')
        .every(i => i.youtubeId && i.youtubeId.length > 0 && i.signalScore > 0);
      return isValid ? cached : null;
    } catch { return null; }
  };

  const savedAspiration = localStorage.getItem('synapse_user_aspiration') || localStorage.getItem('aspiration');
  const cachedMedia = loadCachedMedia();

  const [step, setStep] = useState(() =>
    savedAspiration && cachedMedia ? 'feed' : 'chat'
  );
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: "Welcome! I'm your Synapse AI Growth Architect.\n\nWhat do you want to **become**? (e.g. Senior AI Architect, Full Stack Developer, Quantum Engineer, Data Scientist...)\n\nTell me what role or goal you want to achieve and I will store it in your profile and generate 4 targeted media resources — a Video, Short, Reel, and Article — tailored for you. 🎯"
    }
  ]);
  const [input, setInput] = useState('');
  const [userGoal, setUserGoal] = useState(savedAspiration || '');
  const [recommendations, setRecommendations] = useState(cachedMedia || []);
  const [curatingStep, setCuratingStep] = useState(0);
  const bottomRef = useRef(null);

  const CURATING_STEPS = [
    'Analyzing your target role & career intent...',
    'Scanning YouTube & media repositories for high-signal content...',
    'Filtering noise & ranking by skill relevance...',
    'Generating your personalized multi-format media feed...'
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step]);

  // On mount: if current recommendations are stale (no youtubeId), go back to chat to re-fetch
  useEffect(() => {
    if (step === 'feed' && recommendations.length > 0) {
      const hasStale = recommendations.some(
        i => i.type !== 'article' && (!i.youtubeId || i.youtubeId.length === 0 || i.signalScore === 0)
      );
      if (hasStale) {
        localStorage.removeItem('synapse_curated_media');
        setStep('chat');
        setRecommendations([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate curating steps
  useEffect(() => {
    if (step !== 'curating') return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i < CURATING_STEPS.length) {
        setCuratingStep(i);
      } else {
        clearInterval(interval);
      }
    }, 650);
    return () => clearInterval(interval);
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const goalText = input.trim();
    if (!goalText) return;

    setInput('');
    setUserGoal(goalText);

    // Save aspiration to local storage & backend
    localStorage.setItem('synapse_user_aspiration', goalText);
    localStorage.setItem('aspiration', goalText);
    localStorage.setItem('synapse_onboarding_completed', 'true');
    localStorage.removeItem('synapse_new_login_prompt');

    // Append user message
    const userMsg = { id: Date.now(), role: 'user', text: goalText };
    setMessages(prev => [...prev, userMsg]);

    // Append AI "thinking" reply
    const aiReply = {
      id: Date.now() + 1,
      role: 'ai',
      text: `Understood! Storing your goal: **"${goalText}"** and generating 4 targeted media resources — a Video, Short, Reel, and Article — to help you become a ${goalText.replace(/I want to become a/i, '').trim()}. Stand by...`
    };
    setMessages(prev => [...prev, aiReply]);

    // Transition to curating phase
    setStep('curating');
    setCuratingStep(0);

    // Save to Backend API & Supabase
    saveAspirationToBackend(goalText);
    saveUserAspirationToSupabase({
      primary_goal: goalText,
      current_mood: 'focused',
      fatigue_level: 'low',
      intent_vector: { source: 'onboarding_chat' }
    });

    // Fetch AI recommendations & AI roadmap (Gemini + fallback)
    const [recs, roadmapData] = await Promise.all([
      fetchAIRecommendations(goalText),
      fetchAIRoadmap(goalText)
    ]);

    if (roadmapData && roadmapData.nodes) {
      localStorage.setItem('synapse_user_roadmap', JSON.stringify(roadmapData.nodes));
    }
    window.dispatchEvent(new Event('synapse_roadmap_updated'));

    setRecommendations(recs);
    // Cache media in localStorage for future loads
    if (recs && recs.length > 0) {
      localStorage.setItem('synapse_curated_media', JSON.stringify(recs));
    }
    setStep('feed');
  };

  const handleChipClick = (chip) => setInput(chip);

  const handleReset = () => {
    setStep('chat');
    setUserGoal('');
    setRecommendations([]);
    setMessages([{
      id: 1,
      role: 'ai',
      text: "Welcome! What do you want to **become**? Tell me your dream role or goal and I will store it and generate 4 targeted media resources tailored exactly for you. 🎯"
    }]);
  };

  const chips = [
    'I want to become a Senior AI Architect',
    'I want to become a Full Stack Web Developer',
    'I want to become a Machine Learning Engineer',
    'I want to become a System Design Specialist',
    'I want to become a Quantum Computing Researcher'
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">

      {/* ─── PHASE 1: CHAT ──────────────────────────────── */}
      {step === 'chat' && (
        <div className={`rounded-[2rem] border shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-stone-100 shadow-xl'
        }`}>

          {/* Header */}
          <div className={`px-8 py-5 border-b flex items-center gap-3 ${
            isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-stone-100 bg-stone-50/60'
          }`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
              isDarkMode ? 'bg-gradient-to-tr from-indigo-500 to-violet-600' : 'bg-gradient-to-tr from-teal-400 to-cyan-500'
            }`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm font-black flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>
                SYNAPSE AI GOAL ARCHITECT
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              </h2>
              <p className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>
                Powered by Google Gemini • Phase 1 of 2
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-5 px-8 py-6 min-h-[280px]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse ml-auto max-w-[80%]' : 'mr-auto max-w-[85%]'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-teal-500'
                    : isDarkMode ? 'bg-indigo-600' : 'bg-gradient-to-tr from-teal-400 to-cyan-500'
                }`}>
                  {msg.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed border shadow-sm whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-teal-500 text-white border-teal-400 rounded-tr-none'
                    : isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-200 rounded-tl-none'
                      : 'bg-stone-50 border-stone-200/60 text-stone-800 rounded-tl-none'
                }`}>
                  {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick Chips */}
          <div className={`px-8 pt-2 flex flex-wrap gap-2 ${isDarkMode ? '' : ''}`}>
            {chips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-indigo-300 hover:bg-slate-800 hover:border-indigo-500/40'
                    : 'bg-white border-stone-200 text-teal-700 hover:bg-teal-50 hover:border-teal-200'
                }`}
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tell me your goal (e.g. I want to master React Hooks)..."
              className={`flex-1 border rounded-2xl px-5 py-3.5 text-sm focus:outline-none transition ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500/40'
                  : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400 focus:border-teal-400'
              }`}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`px-6 py-3.5 rounded-2xl font-extrabold text-sm text-white flex items-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-40 cursor-pointer ${
                isDarkMode
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600'
                  : 'bg-gradient-to-r from-teal-400 to-cyan-500'
              }`}
            >
              <span>Curate 4 for Me</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ─── CURATING PHASE ─────────────────────────────── */}
      {step === 'curating' && (
        <div className={`rounded-[2rem] border shadow-2xl text-center flex flex-col items-center justify-center gap-8 py-20 px-8 min-h-[420px] ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-stone-100'
        }`}>
          <div className="relative">
            <div className={`w-20 h-20 rounded-full border-4 border-t-transparent animate-spin ${
              isDarkMode ? 'border-indigo-500' : 'border-teal-400'
            }`} />
            <Brain className={`w-8 h-8 absolute inset-0 m-auto animate-pulse ${
              isDarkMode ? 'text-indigo-400' : 'text-teal-500'
            }`} />
          </div>

          <div className="flex flex-col gap-2">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
              isDarkMode ? 'text-indigo-400' : 'text-teal-500'
            }`}>
              AI MODEL CURATING YOUR FEED
            </span>
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>
              Analyzing: "{userGoal}"
            </h3>
          </div>

          {/* Animated step list */}
          <div className="flex flex-col gap-2 w-full max-w-sm text-left">
            {CURATING_STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs font-mono transition-all duration-300 ${
                  i <= curatingStep ? 'opacity-100' : 'opacity-20'
                }`}
              >
                {i < curatingStep ? (
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : i === curatingStep ? (
                  <Loader2 className={`w-4 h-4 shrink-0 animate-spin ${isDarkMode ? 'text-indigo-400' : 'text-teal-500'}`} />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-stone-400 shrink-0" />
                )}
                <span className={i <= curatingStep
                  ? isDarkMode ? 'text-slate-200' : 'text-stone-700'
                  : isDarkMode ? 'text-slate-600' : 'text-stone-400'
                }>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── PHASE 2: 4 CURATED CARDS ───────────────────── */}
      {step === 'feed' && (
        <div className={`rounded-[2rem] border shadow-2xl backdrop-blur-xl flex flex-col gap-8 p-8 md:p-10 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-stone-100 shadow-xl'
        }`}>

          {/* Feed Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className={`flex items-center gap-2 mb-1 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-extrabold tracking-widest font-mono uppercase">
                  AI CURATED • 4 FORMATS MATCHED TO YOUR GOAL
                </span>
              </div>
              <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>
                Your Personalized Feed
              </h2>
              <p className={`text-xs mt-1 max-w-lg ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Based on goal: <span className={`font-mono font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>"{userGoal}"</span>
              </p>
            </div>

            <button
              onClick={handleReset}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change Goal
            </button>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendations.map((item, i) => (
              <MediaCard key={item.id || i} item={item} index={i} isDarkMode={isDarkMode} />
            ))}
          </div>

          {/* Bottom CTA Row */}
          <div className={`pt-4 border-t flex items-center justify-between text-xs font-mono ${
            isDarkMode ? 'border-slate-800 text-slate-500' : 'border-stone-100 text-stone-400'
          }`}>
            <span>Signal Evaluation: AI scored each item against your goal intent</span>
            <button
              onClick={handleReset}
              className={`flex items-center gap-1 font-bold hover:underline cursor-pointer ${
                isDarkMode ? 'text-indigo-400' : 'text-teal-600'
              }`}
            >
              Refine Goal <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
