import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles,
  Flame,
  Brain,
  Zap,
  Lock
} from 'lucide-react';
import { saveHabitSteeringLogToSupabase } from '../lib/supabaseClient';

export default function FocusRoom({ isDarkMode = false }) {
  // Focus Room States
  const [selectedDurationMins, setSelectedDurationMins] = useState(25);
  const [customMinsInput, setCustomMinsInput] = useState('');
  const [focusTask, setFocusTask] = useState('Master React Hooks & useEffect Memory Leak Audit');
  
  // Timer States
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isCompleted, setIsCompleted] = useState(false);

  // Focus Lock & Distraction States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [showDistractionShield, setShowDistractionShield] = useState(false);
  const [ambientAudioActive, setAmbientAudioActive] = useState(false);

  const containerRef = useRef(null);

  // 1. COUNTDOWN TIMER INTERVAL
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      
      // Save completed focus session to Supabase
      saveHabitSteeringLogToSupabase({
        intercept_trigger: 'focus_sprint_complete',
        time_saved_minutes: Math.round(totalSeconds / 60),
        redirected_sprint: focusTask,
        user_accepted: true
      });
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, secondsLeft, totalSeconds, focusTask]);

  // 2. BLOCK CLOSING WEBSITE (beforeunload Event Listener)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isActive && secondsLeft > 0) {
        e.preventDefault();
        e.returnValue = "Focus Session in Progress! Closing this site will forfeit your focus streak.";
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive, secondsLeft]);

  // 3. BLOCK TAB SWITCHING & OPENING OTHER APPS (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive && !isCompleted) {
        setDistractionCount(prev => prev + 1);
        setShowDistractionShield(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, isCompleted]);

  // FULLSCREEN TOGGLE
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // START FOCUS SESSION
  const handleStartFocus = (e) => {
    if (e) e.preventDefault();
    const mins = parseInt(customMinsInput) || selectedDurationMins;
    const secs = mins * 60;
    
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsActive(true);
    setIsPaused(false);
    setIsCompleted(false);
    setDistractionCount(0);
    setShowDistractionShield(false);

    // Optional: Enter fullscreen on start
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  };

  // STOP / RESET FOCUS SESSION
  const handleResetFocus = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsCompleted(false);
    setSecondsLeft(selectedDurationMins * 60);
    setShowDistractionShield(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // TIME FORMATTING (MM:SS)
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100) || 0;

  return (
    <div 
      ref={containerRef}
      className={`w-full max-w-5xl mx-auto transition-all duration-300 relative ${
        isFullscreen ? 'p-10 flex flex-col justify-center min-h-screen bg-slate-950 text-white' : ''
      }`}
    >
      
      {/* SELECTION STATE (BEFORE TIMER STARTS) */}
      {!isActive && !isCompleted && (
        <div className={`rounded-[2rem] p-8 md:p-12 border shadow-2xl backdrop-blur-xl animate-fade-in flex flex-col gap-8 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white/80 border-stone-100 text-stone-900'
        }`}>
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-2xl ${
                isDarkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-teal-100 text-teal-600'
              }`}>
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest font-mono uppercase text-teal-500 block">
                  FOCUS LOCK CHAMBER
                </span>
                <h2 className="text-2xl font-black tracking-tight">Configure Deep Work Sprint</h2>
              </div>
            </div>
            <p className={`text-xs leading-relaxed max-w-xl ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Select your focus duration. Once locked, tab switching and closing the site will be strictly intercepted by the Digital Guardian.
            </p>
          </div>

          {/* Task Objective Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase font-mono tracking-wider text-stone-400">
              Sprint Objective / Task
            </label>
            <input
              type="text"
              value={focusTask}
              onChange={(e) => setFocusTask(e.target.value)}
              placeholder="What specific task will you complete in this sprint?"
              className={`w-full border rounded-2xl px-5 py-3.5 text-xs md:text-sm font-semibold focus:outline-none transition shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500' 
                  : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-teal-500'
              }`}
            />
          </div>

          {/* Preset Duration Buttons */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-extrabold uppercase font-mono tracking-wider text-stone-400">
              Select Focus Duration (Minutes)
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { mins: 5, label: '5 Mins', tag: 'Micro Refresher' },
                { mins: 15, label: '15 Mins', tag: 'Quick Sprint' },
                { mins: 25, label: '25 Mins', tag: 'Pomodoro Standard' },
                { mins: 45, label: '45 Mins', tag: 'Deep Flow Block' }
              ].map((item) => (
                <button
                  key={item.mins}
                  type="button"
                  onClick={() => { setSelectedDurationMins(item.mins); setCustomMinsInput(''); }}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                    selectedDurationMins === item.mins && !customMinsInput
                      ? isDarkMode 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20'
                      : isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800' 
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-base font-black">{item.label}</span>
                  <span className="text-[10px] font-mono opacity-80">{item.tag}</span>
                </button>
              ))}
            </div>

            {/* Custom Minutes Input */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-bold text-stone-400">Or Custom Minutes:</span>
              <input
                type="number"
                min="1"
                max="180"
                value={customMinsInput}
                onChange={(e) => {
                  setCustomMinsInput(e.target.value);
                  if (e.target.value) setSelectedDurationMins(parseInt(e.target.value));
                }}
                placeholder="e.g. 60"
                className={`w-24 border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800'
                }`}
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleStartFocus}
            className={`w-full py-4 rounded-2xl text-white font-black text-sm tracking-wider uppercase shadow-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              isDarkMode 
                ? 'bg-gradient-to-r from-indigo-500 via-violet-600 to-teal-400 hover:shadow-indigo-500/25' 
                : 'bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-500 hover:shadow-teal-500/25'
            }`}
          >
            <Lock className="w-5 h-5" />
            <span>Lock Focus Chamber & Start Timer</span>
          </button>
        </div>
      )}

      {/* ACTIVE COUNTDOWN TIMER CHAMBER */}
      {isActive && (
        <div className={`rounded-[2.5rem] p-8 md:p-14 border shadow-2xl backdrop-blur-2xl text-center flex flex-col items-center justify-center gap-8 relative overflow-hidden animate-fade-in ${
          isDarkMode 
            ? 'bg-slate-900/95 border-indigo-500/30 text-slate-100 shadow-indigo-500/20' 
            : 'bg-white/95 border-teal-200 text-stone-900 shadow-teal-500/20'
        }`}>
          
          {/* Top Live Lock Status Bar */}
          <div className="flex items-center justify-between w-full pb-4 border-b border-stone-200/40">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>FOCUS LOCK ACTIVE • ANTI-CLOSING SHIELD ON</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAmbientAudioActive(!ambientAudioActive)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  ambientAudioActive 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                    : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-stone-100 border-stone-200 text-stone-500'
                }`}
                title="Toggle 40Hz Binaural Ambient Audio"
              >
                {ambientAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">40Hz Binaural</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-stone-100 border-stone-200 text-stone-700'
                }`}
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Current Task Display */}
          <div className="flex flex-col gap-1 max-w-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">ACTIVE TASK</span>
            <h3 className="text-base font-extrabold line-clamp-1">{focusTask}</h3>
          </div>

          {/* Giant Countdown Clock & Progress Circle */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-72 h-72 transform -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="120"
                stroke="currentColor"
                strokeWidth="12"
                className={isDarkMode ? 'text-slate-800' : 'text-stone-100'}
                fill="transparent"
              />
              <circle
                cx="144"
                cy="144"
                r="120"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={753}
                strokeDashoffset={753 - (753 * progressPct) / 100}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${
                  isDarkMode ? 'text-indigo-400' : 'text-teal-500'
                }`}
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-6xl md:text-7xl font-black font-mono tracking-tighter">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs font-mono font-bold text-stone-400 mt-2">
                {progressPct}% Completed
              </span>
            </div>
          </div>

          {/* Distraction Stats */}
          {distractionCount > 0 && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Tab-switch Intercepts Logged: {distractionCount}</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                isPaused 
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-md' 
                  : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-stone-100 border-stone-200 text-stone-800'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? 'Resume Sprint' : 'Pause'}</span>
            </button>

            <button
              onClick={handleResetFocus}
              className="px-6 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-rose-500/20 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cancel Sprint</span>
            </button>
          </div>
        </div>
      )}

      {/* SPRINT COMPLETE CELEBRATION STATE */}
      {isCompleted && (
        <div className={`rounded-[2.5rem] p-10 md:p-14 border shadow-2xl backdrop-blur-xl text-center flex flex-col items-center justify-center gap-6 animate-fade-in ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-stone-100 text-stone-900'
        }`}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold tracking-widest font-mono uppercase text-emerald-500">
              FOCUS LOCK SUCCESSFUL
            </span>
            <h2 className="text-3xl font-black">Sprint Completed!</h2>
            <p className={`text-xs max-w-md ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              You maintained unbroken focus for {Math.round(totalSeconds / 60)} minutes. Your synaptic growth XP has been updated.
            </p>
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className={`p-4 rounded-2xl border text-center ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className="text-[10px] font-mono text-stone-400 font-bold block">XP EARNED</span>
              <span className="text-xl font-black text-amber-500 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-current" />
                +{Math.round(totalSeconds / 60) * 10} XP
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-center ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className="text-[10px] font-mono text-stone-400 font-bold block">DISTRACTIONS</span>
              <span className="text-xl font-black text-emerald-500">
                {distractionCount} Logged
              </span>
            </div>
          </div>

          <button
            onClick={handleResetFocus}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
          >
            Return to Focus Room Dashboard
          </button>
        </div>
      )}

      {/* ANTI-TAB SWITCH INTERCEPT SHIELD MODAL */}
      {showDistractionShield && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in text-white text-center">
          <div className="max-w-md p-8 rounded-3xl border border-amber-500/30 bg-slate-900 shadow-2xl flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-amber-400">FOCUS LOCK INTERCEPT</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Digital Guardian detected tab switching or opening other apps. Return to your active sprint to preserve your focus streak!
            </p>
            <button
              onClick={() => setShowDistractionShield(false)}
              className="w-full py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:bg-amber-400 transition cursor-pointer"
            >
              Resume Focus Sprint
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
