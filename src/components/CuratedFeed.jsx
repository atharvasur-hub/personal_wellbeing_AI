import React from 'react';
import { Sparkles, Play, BookOpen, Code, Brain, Clock, ExternalLink, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

export default function CuratedFeed({ isDarkMode = false }) {
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
            Scored for high signal-to-noise ratio based on your current fatigue logs and React hooks goal.
          </p>
        </div>

        {/* Overall Signal Score Badge */}
        <div className={`px-4 py-2 rounded-2xl border text-xs font-mono font-bold flex items-center gap-2 ${
          isDarkMode ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-violet-50 border-violet-100 text-violet-700'
        }`}>
          <Activity className="w-4 h-4 text-violet-500" />
          <span>Avg Signal Score: 96%</span>
        </div>
      </div>

      {/* 3 Media Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: "The Core Concept" (Video Snippet) */}
        <div className={`rounded-3xl p-5 border flex flex-col justify-between gap-5 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
          isDarkMode 
            ? 'bg-slate-950/60 border-slate-800 hover:border-violet-500/40 shadow-sm' 
            : 'bg-stone-50/70 border-stone-100 hover:border-violet-200 shadow-md hover:bg-white'
        }`}>
          
          <div className="flex flex-col gap-3">
            {/* Media Type Badge & Signal Ratio */}
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 ${
                isDarkMode ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : 'bg-violet-50 text-violet-700 border border-violet-100'
              }`}>
                <Play className="w-3 h-3 fill-current" />
                The Core Concept
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                98% Signal Ratio
              </span>
            </div>

            {/* Video Thumbnail Placeholder with Play Overlay */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-md group-hover:scale-[1.02] transition-transform">
              <div className="absolute inset-0 bg-black/20" />
              <div className="w-12 h-12 rounded-full bg-white/90 text-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition cursor-pointer z-10">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px] font-bold backdrop-blur-xs">
                YouTube • 12 min
              </span>
            </div>

            {/* Card Content Title & Subtitle */}
            <div>
              <h3 className={`text-sm font-extrabold transition ${
                isDarkMode ? 'text-slate-100 group-hover:text-violet-400' : 'text-stone-800 group-hover:text-violet-600'
              }`}>
                Understanding useEffect Dependencies
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${
                isDarkMode ? 'text-slate-400' : 'text-stone-500'
              }`}>
                Master dependency arrays, cleanup functions, and state synchronization pitfalls.
              </p>
            </div>
          </div>

          {/* AI Reasoning Badge */}
          <div className={`p-3 rounded-2xl border text-[11px] font-medium leading-normal flex items-start gap-2 ${
            isDarkMode ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-violet-50/80 border-violet-100 text-violet-900'
          }`}>
            <Brain className="w-4 h-4 shrink-0 mt-0.5 text-violet-500" />
            <div>
              <span className="font-bold block text-[10px] font-mono uppercase tracking-wider text-violet-500">WHY THIS?</span>
              <span>"You struggled with re-renders yesterday."</span>
            </div>
          </div>
        </div>

        {/* CARD 2: "Deep Dive" (Article / Text) */}
        <div className={`rounded-3xl p-5 border flex flex-col justify-between gap-5 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
          isDarkMode 
            ? 'bg-slate-950/60 border-slate-800 hover:border-indigo-500/40 shadow-sm' 
            : 'bg-stone-50/70 border-stone-100 hover:border-indigo-200 shadow-md hover:bg-white'
        }`}>
          
          <div className="flex flex-col gap-3">
            {/* Media Type Badge & Signal Ratio */}
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 ${
                isDarkMode ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              }`}>
                <BookOpen className="w-3 h-3" />
                Deep Dive
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                95% Signal Ratio
              </span>
            </div>

            {/* Article Reader Minimalist Banner */}
            <div className={`rounded-2xl p-4 border flex flex-col justify-between h-28 relative overflow-hidden ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200/60'
            }`}>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`}>
                ESSENTIAL ARCHITECTURE
              </span>
              <p className={`text-xs font-serif italic leading-snug line-clamp-2 ${
                isDarkMode ? 'text-slate-300' : 'text-stone-700'
              }`}>
                "State isn't just data—it is a snapshot of your component UI over time."
              </p>
              <div className="flex justify-between items-center text-[9px] font-mono text-stone-400">
                <span>5 min read</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card Content Title & Subtitle */}
            <div>
              <h3 className={`text-sm font-extrabold transition ${
                isDarkMode ? 'text-slate-100 group-hover:text-indigo-400' : 'text-stone-800 group-hover:text-indigo-600'
              }`}>
                A mental model for React state.
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${
                isDarkMode ? 'text-slate-400' : 'text-stone-500'
              }`}>
                Deconstruct component batching, render passes, and immutable memory references.
              </p>
            </div>
          </div>

          {/* AI Reasoning Badge */}
          <div className={`p-3 rounded-2xl border text-[11px] font-medium leading-normal flex items-start gap-2 ${
            isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50/80 border-indigo-100 text-indigo-900'
          }`}>
            <Brain className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
            <div>
              <span className="font-bold block text-[10px] font-mono uppercase tracking-wider text-indigo-500">WHY THIS?</span>
              <span>"A high-leverage foundational concept."</span>
            </div>
          </div>
        </div>

        {/* CARD 3: "Active Execution" (Interactive / Tool Sandbox) */}
        <div className={`rounded-3xl p-5 border flex flex-col justify-between gap-5 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
          isDarkMode 
            ? 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 shadow-sm' 
            : 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-200 shadow-md hover:bg-white'
        }`}>
          
          <div className="flex flex-col gap-3">
            {/* Media Type Badge & Signal Ratio */}
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 ${
                isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                <Code className="w-3 h-3" />
                Active Execution
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                94% Signal Ratio
              </span>
            </div>

            {/* Interactive Coding Preview Banner */}
            <div className="rounded-2xl p-4 border font-mono text-[11px] leading-relaxed flex flex-col justify-between h-28 relative overflow-hidden bg-slate-900 border-slate-800 text-emerald-400">
              <div className="flex items-center justify-between text-[9px] text-slate-400 pb-1 border-b border-slate-800">
                <span>useDebounce.js</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-slate-300 font-mono text-[10px]">
                const debounced = useDebounce(value, 300);
              </p>
              <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold">
                <span>Launch Sandbox Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card Content Title & Subtitle */}
            <div>
              <h3 className={`text-sm font-extrabold transition ${
                isDarkMode ? 'text-slate-100 group-hover:text-emerald-400' : 'text-stone-800 group-hover:text-emerald-700'
              }`}>
                Build a custom useDebounce hook in the Sandbox.
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${
                isDarkMode ? 'text-slate-400' : 'text-stone-500'
              }`}>
                Test input delay logic and timer cleanup routines directly in the browser compiler.
              </p>
            </div>
          </div>

          {/* AI Reasoning Badge */}
          <div className={`p-3 rounded-2xl border text-[11px] font-medium leading-normal flex items-start gap-2 ${
            isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <Brain className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <span className="font-bold block text-[10px] font-mono uppercase tracking-wider text-emerald-600">WHY THIS?</span>
              <span>"Time to apply what you just watched."</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
