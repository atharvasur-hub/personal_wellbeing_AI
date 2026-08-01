import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle2,
  Shield,
  Lock,
  CloudRain
} from 'lucide-react';
import { saveFocusSessionToBackend, awardPoints } from '../lib/backendApi';

export default function FocusRoom({ isDarkMode = false, currentUser }) {
  // Manual Time Input States (Hours & Minutes)
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(25);
  const [focusTask, setFocusTask] = useState('Master React Hooks & Memory Leak Audit');

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

  // NEW: White Noise Audio States & Refs
  const [whiteNoiseActive, setWhiteNoiseActive] = useState(false);
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  const containerRef = useRef(null);

  // 1. WHITE NOISE AUDIO ENGINE (Web Audio API)
  useEffect(() => {
    if (whiteNoiseActive) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();

        // Create white noise buffer (5 seconds of random pink/white noise data)
        const bufferSize = audioCtxRef.current.sampleRate * 2;
        const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1; // White noise random generator
        }

        noiseNodeRef.current = audioCtxRef.current.createBufferSource();
        noiseNodeRef.current.buffer = noiseBuffer;
        noiseNodeRef.current.loop = true;

        // Create volume gain node for smooth control
        gainNodeRef.current = audioCtxRef.current.createGain();
        gainNodeRef.current.gain.value = 0.15; // Comfortable background level

        noiseNodeRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioCtxRef.current.destination);
        noiseNodeRef.current.start(0);
      } catch (err) {
        console.warn('Web Audio API error:', err);
      }
    } else {
      // Clean up audio nodes on toggle off
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
          noiseNodeRef.current.disconnect();
        } catch (e) { }
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    }

    return () => {
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
        } catch (e) { }
      }
    };
  }, [whiteNoiseActive]);

  // Turn off audio automatically when session ends or resets
  useEffect(() => {
    if (!isActive || isCompleted) {
      setWhiteNoiseActive(false);
      setAmbientAudioActive(false);
    }
  }, [isActive, isCompleted]);

  // 2. COUNTDOWN TIMER INTERVAL
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);

      // Accumulate completed session duration in localStorage after session completion
      const prevSecs = parseInt(localStorage.getItem('synapse_focus_seconds_total') || '0', 10);
      const updatedSecs = prevSecs + totalSeconds;
      localStorage.setItem('synapse_focus_seconds_total', updatedSecs.toString());

      // Calculate percentage increase
      let pctIncrease = 0;
      if (prevSecs > 0) {
        pctIncrease = (totalSeconds / prevSecs) * 100;
      } else {
        pctIncrease = 100.0;
      }
      const trendStr = `+${pctIncrease.toFixed(1)}%`;
      localStorage.setItem('synapse_profile_focus_time_trend', trendStr);
      if (currentUser?.id) {
        localStorage.setItem(`synapse_user_${currentUser.id}_focus_time_trend`, trendStr);
      }

      const hrs = Math.floor(updatedSecs / 3600);
      const mins = Math.floor((updatedSecs % 3600) / 60);
      const secs = updatedSecs % 60;

      let formatted = '0h 0m';
      if (hrs > 0) {
        formatted = `${hrs}h ${mins}m`;
      } else if (mins > 0) {
        formatted = `0h ${mins}m`;
      } else if (secs > 0) {
        formatted = `${secs}s`;
      }
      localStorage.setItem('synapse_profile_focus_time', formatted);
      if (currentUser?.id) {
        localStorage.setItem(`synapse_user_${currentUser.id}_focus_time`, formatted);
      }

      // Dispatch layout events for reactivity
      window.dispatchEvent(new Event('aspirationUpdated'));
      window.dispatchEvent(new Event('storage'));

      saveFocusSessionToBackend({
        task_name: focusTask,
        duration_minutes: Math.round(totalSeconds / 60),
        distractions_blocked: distractionCount
      });
      
      // Award Gamification Points (50 pts for focus session)
      awardPoints('usr_default', 'focus_mode_complete', 50).then(() => {
        window.dispatchEvent(new CustomEvent('pointsAwarded', { detail: { points: 50 } }));
      }).catch(console.error);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, secondsLeft, totalSeconds, focusTask, currentUser]);

  // 3. BLOCK CLOSING WEBSITE (beforeunload Event Listener)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isActive && secondsLeft > 0) {
        e.preventDefault();
        e.returnValue = "Focus Lock Active! You cannot close the website during a focus session.";
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive, secondsLeft]);

  // 4. STRICT ESCAPE KEY INTERCEPT (Prevent Esc Key Exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isActive && !isCompleted && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setDistractionCount(prev => prev + 1);
        setShowDistractionShield(true);

        if (containerRef.current && !document.fullscreenElement) {
          containerRef.current.requestFullscreen().catch(() => { });
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isActive && !isCompleted) {
        setDistractionCount(prev => prev + 1);
        setShowDistractionShield(true);
        if (containerRef.current) {
          containerRef.current.requestFullscreen().catch(() => { });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isActive, isCompleted]);

  // 5. BLOCK TAB SWITCHING & OTHER APPS (Page Visibility API)
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

  // START MANUAL FOCUS SESSION
  const handleStartFocus = (e) => {
    if (e) e.preventDefault();
    const hrs = parseInt(inputHours) || 0;
    const mins = parseInt(inputMinutes) || 0;
    const totalSecs = (hrs * 3600) + (mins * 60);

    if (totalSecs <= 0) {
      alert("Please enter a valid time duration greater than 0 minutes.");
      return;
    }

    setTotalSeconds(totalSecs);
    setSecondsLeft(totalSecs);
    setIsActive(true);
    setIsPaused(false);
    setIsCompleted(false);
    setDistractionCount(0);
    setShowDistractionShield(false);

    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    }
  };

  // RESET FOCUS SESSION
  const handleResetFocus = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsCompleted(false);
    setShowDistractionShield(false);
    setWhiteNoiseActive(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  // TIME FORMATTING (HH:MM:SS)
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100) || 0;

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-5xl mx-auto transition-all duration-300 relative ${isFullscreen ? 'p-10 flex flex-col justify-center min-h-screen bg-slate-950 text-white' : ''
        }`}
    >

      {/* MANUAL TIME SELECTION FORM */}
      {!isActive && !isCompleted && (
        <div className={`rounded-[2rem] p-8 md:p-12 border shadow-2xl backdrop-blur-xl animate-fade-in flex flex-col gap-8 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white/80 border-stone-100 text-stone-900'
          }`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-2xl ${isDarkMode ? 'bg-indigo-500/15 text-indigo-400' : 'bg-teal-100 text-teal-600'
                }`}>
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest font-mono uppercase text-teal-500 block">
                  MANUAL TIME PICKER CHAMBER
                </span>
                <h2 className="text-2xl font-black tracking-tight">Set Focus Duration Manually</h2>
              </div>
            </div>
            <p className={`text-xs leading-relaxed max-w-xl ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Input your exact target hours and minutes. Once locked, the Escape key, tab switching, and closing the site will be strictly blocked.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase font-mono tracking-wider text-stone-400">
              Sprint Objective / Task
            </label>
            <input
              type="text"
              value={focusTask}
              onChange={(e) => setFocusTask(e.target.value)}
              placeholder="What specific task will you complete in this sprint?"
              className={`w-full border rounded-2xl px-5 py-3.5 text-xs md:text-sm font-semibold focus:outline-none transition shadow-sm ${isDarkMode
                ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-teal-500'
                }`}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-extrabold uppercase font-mono tracking-wider text-stone-400">
              Set Target Focus Time
            </label>

            <div className={`p-6 rounded-3xl border flex items-center justify-center gap-6 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200/80'
              }`}>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono font-bold uppercase text-stone-400">HOURS</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={inputHours}
                  onChange={(e) => setInputHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-24 text-center text-3xl font-black font-mono border rounded-2xl py-3 focus:outline-none ${isDarkMode ? 'bg-slate-900 border-indigo-500/40 text-indigo-300' : 'bg-white border-teal-200 text-teal-700'
                    }`}
                />
              </div>

              <span className="text-3xl font-black font-mono text-stone-400 mt-4">:</span>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono font-bold uppercase text-stone-400">MINUTES</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className={`w-24 text-center text-3xl font-black font-mono border rounded-2xl py-3 focus:outline-none ${isDarkMode ? 'bg-slate-900 border-indigo-500/40 text-indigo-300' : 'bg-white border-teal-200 text-teal-700'
                    }`}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleStartFocus}
            className={`w-full py-4 rounded-2xl text-white font-black text-sm tracking-wider uppercase shadow-xl transition flex items-center justify-center gap-2 cursor-pointer ${isDarkMode
              ? 'bg-gradient-to-r from-indigo-500 via-violet-600 to-teal-400 hover:shadow-indigo-500/25'
              : 'bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-500 hover:shadow-teal-500/25'
              }`}
          >
            <Lock className="w-5 h-5" />
            <span>Lock Focus Chamber ({inputHours}h {inputMinutes}m)</span>
          </button>
        </div>
      )}

      {/* ACTIVE COUNTDOWN TIMER CHAMBER */}
      {isActive && (
        <div className={`rounded-[2.5rem] p-8 md:p-14 border shadow-2xl backdrop-blur-2xl text-center flex flex-col items-center justify-center gap-8 relative overflow-hidden animate-fade-in ${isDarkMode
          ? 'bg-slate-900/95 border-indigo-500/30 text-slate-100 shadow-indigo-500/20'
          : 'bg-white/95 border-teal-200 text-stone-900 shadow-teal-500/20'
          }`}>

          <div className="flex items-center justify-between w-full pb-4 border-b border-stone-200/40">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>STRICT FOCUS LOCK • ESCAPE KEY BLOCKED</span>
            </div>

            <div className="flex items-center gap-2">
              {/* WHITE NOISE GENERATOR TOGGLE BUTTON */}
              <button
                onClick={() => setWhiteNoiseActive(!whiteNoiseActive)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${whiteNoiseActive
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm'
                  : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-stone-100 border-stone-200 text-stone-500'
                  }`}
                title="Toggle Clean White Noise Generator"
              >
                <CloudRain className="w-4 h-4" />
                <span>White Noise {whiteNoiseActive ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setAmbientAudioActive(!ambientAudioActive)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${ambientAudioActive
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-stone-100 border-stone-200 text-stone-500'
                  }`}
                title="Toggle 40Hz Binaural Ambient Audio"
              >
                {ambientAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">40Hz Binaural</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 max-w-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">ACTIVE TASK</span>
            <h3 className="text-base font-extrabold line-clamp-1">{focusTask}</h3>
          </div>

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
                className={`transition-all duration-1000 ${isDarkMode ? 'text-indigo-400' : 'text-teal-500'
                  }`}
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl md:text-6xl font-black font-mono tracking-tighter">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs font-mono font-bold text-stone-400 mt-2">
                {progressPct}% Completed
              </span>
            </div>
          </div>

          {distractionCount > 0 && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Esc / Tab-switch Intercepts Logged: {distractionCount}</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${isPaused
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

            <button
              onClick={() => setSecondsLeft(3)}
              className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-500/20 transition cursor-pointer"
              title="Fast forward to 3 seconds remaining for testing completed session"
            >
              <span>Fast Forward</span>
            </button>
          </div>
        </div>
      )}

      {/* SPRINT COMPLETE CELEBRATION STATE */}
      {isCompleted && (
        <div className={`rounded-[2.5rem] p-10 md:p-14 border shadow-2xl backdrop-blur-xl text-center flex flex-col items-center justify-center gap-6 animate-fade-in ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-stone-100 text-stone-900'
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
              You maintained unbroken focus for {Math.round(totalSeconds / 60)} minutes.
            </p>
          </div>

          <button
            onClick={handleResetFocus}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
          >
            Return to Focus Room Dashboard
          </button>
        </div>
      )}

      {/* DISTRACTION SHIELD MODAL */}
      {showDistractionShield && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in text-white text-center">
          <div className="max-w-md p-8 rounded-3xl border border-amber-500/30 bg-slate-900 shadow-2xl flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-amber-400">ESCAPE KEY BLOCKED</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Focus Lock is active! Pressing the Escape key or switching tabs is intercepted to keep you in your flow state.
            </p>
            <button
              onClick={() => {
                setShowDistractionShield(false);
                if (containerRef.current && !document.fullscreenElement) {
                  containerRef.current.requestFullscreen().catch(() => { });
                }
              }}
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