'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Star, 
  Brain, 
  Layers, 
  CheckCircle2,
  Edit3,
  X,
  Save,
  RotateCcw,
  Lock,
  Info
} from 'lucide-react';
import VpmMetricsRow from './components/VpmMetricsRow';
import IdentityAspirationsGraph from './components/IdentityAspirationsGraph';
import FutureSelfSimulator from './components/FutureSelfSimulator';
import AspirationPivotAlert from './components/AspirationPivotAlert';

interface ProfileVpmDashboardProps {
  isDarkMode?: boolean;
  currentUser?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    aspiration?: string;
  } | null;
}

export default function ProfileVpmDashboard({ isDarkMode = false, currentUser }: ProfileVpmDashboardProps) {
  // Helper to retrieve user-scoped localStorage items with clean initial defaults for new accounts
  const getStorageItem = (key: string, fallback: string): string => {
    if (currentUser?.id) {
      return localStorage.getItem(`synapse_user_${currentUser.id}_${key}`) || fallback;
    }
    return localStorage.getItem(`synapse_profile_${key}`) || fallback;
  };

  const setStorageItem = (key: string, val: string) => {
    if (currentUser?.id) {
      localStorage.setItem(`synapse_user_${currentUser.id}_${key}`, val);
    } else {
      localStorage.setItem(`synapse_profile_${key}`, val);
    }
  };

  const removeStorageItem = (key: string) => {
    if (currentUser?.id) {
      localStorage.removeItem(`synapse_user_${currentUser.id}_${key}`);
    }
    localStorage.removeItem(`synapse_profile_${key}`);
  };

  // Sync state with local storage or currentUser props
  const [userName, setUserName] = useState<string>(() => {
    return getStorageItem('name', currentUser?.name || 'New User');
  });
  const [userRole, setUserRole] = useState<string>(() => {
    return getStorageItem('role', currentUser?.role || 'Growth Aspirant (Initial State)');
  });
  const [userAspiration, setUserAspiration] = useState<string>(() => {
    return getStorageItem('aspiration', currentUser?.aspiration || 'Goal Not Set (Set Goal in Assessment)');
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return getStorageItem('email', currentUser?.email || 'new_user_session');
  });
  const [focusStreak, setFocusStreak] = useState<string>(() => {
    return getStorageItem('streak', '0-Day Focus Streak');
  });
  const [userLevel, setUserLevel] = useState<string>(() => {
    return getStorageItem('level', '1');
  });
  const [userXP, setUserXP] = useState<string>(() => {
    return getStorageItem('xp', '0');
  });

  // Dynamic VPM performance metrics
  const [focusTime, setFocusTime] = useState<string>(() => {
    return getStorageItem('focus_time', '0h 0m');
  });
  const [focusTimeTrend, setFocusTimeTrend] = useState<string>(() => {
    const focusSecs = parseInt(getStorageItem('focus_seconds_total', '0'), 10);
    const defaultTrend = focusSecs === 0 ? '+0.0%' : '+18.4%';
    return getStorageItem('focus_time_trend', defaultTrend);
  });
  const [skillsVerified, setSkillsVerified] = useState<string>(() => {
    return getStorageItem('skills_verified', '0 Concepts');
  });
  const [goalVelocity, setGoalVelocity] = useState<string>(() => {
    return getStorageItem('goal_velocity', '0%');
  });
  const [vpmIndex, setVpmIndex] = useState<string>(() => {
    return getStorageItem('vpm_index', '$0.00/min');
  });

  const [roadmap, setRoadmap] = useState<{ phase: string; duration: string }[]>(() => {
    const saved = getStorageItem('roadmap', '');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return [
      { phase: 'Phase 1: Systems Architecture Foundations', duration: '1 month' },
      { phase: 'Phase 2: Deep Work Endurance & Practice', duration: '1.5 months' },
      { phase: 'Phase 3: Rust Concurrency Sprints', duration: '1.5 months' },
      { phase: 'Phase 4: AI Alignment & Safety Auditing', duration: '2 months' }
    ];
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = getStorageItem('roadmap', '');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRoadmap(parsed);
          }
        } catch (e) {}
      }
    };
    handleUpdate();
    window.addEventListener('aspirationUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('aspirationUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentUser]);

  const [pivotNotice, setPivotNotice] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Edit form temporary state (User profile info only - metrics are system auto-tracked)
  const [editForm, setEditForm] = useState({
    name: userName,
    role: userRole,
    aspiration: userAspiration,
    email: userEmail,
  });

  // Sync focus time live from localStorage
  useEffect(() => {
    const syncFocusTime = () => {
      const savedTime = getStorageItem('focus_time', '0h 0m');
      const focusSecs = parseInt(getStorageItem('focus_seconds_total', '0'), 10);
      const defaultTrend = focusSecs === 0 ? '+0.0%' : '+18.4%';
      const savedTrend = getStorageItem('focus_time_trend', defaultTrend);
      setFocusTime(savedTime);
      setFocusTimeTrend(savedTrend);
    };
    syncFocusTime();
    const interval = setInterval(syncFocusTime, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Keep state updated when currentUser prop changes
  useEffect(() => {
    if (currentUser) {
      setUserName(getStorageItem('name', currentUser.name || 'New User'));
      setUserEmail(getStorageItem('email', currentUser.email || 'new_user_session'));
      if (currentUser.aspiration && !getStorageItem('aspiration', '')) {
        setUserAspiration(currentUser.aspiration);
      }
    }
  }, [currentUser]);

  const handleOpenEdit = () => {
    setEditForm({
      name: userName,
      role: userRole,
      aspiration: userAspiration,
      email: userEmail,
    });
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(editForm.name);
    setUserRole(editForm.role);
    setUserAspiration(editForm.aspiration);
    setUserEmail(editForm.email);

    // Save to LocalStorage (User-scoped)
    setStorageItem('name', editForm.name);
    setStorageItem('role', editForm.role);
    setStorageItem('aspiration', editForm.aspiration);
    setStorageItem('email', editForm.email);

    setIsEditing(false);
  };

  const handleResetDefaults = () => {
    const defaultName = currentUser?.name || 'New User';
    const defaultRole = 'Growth Aspirant (Initial State)';
    const defaultAspiration = currentUser?.aspiration || 'Goal Not Set (Set Goal in Assessment)';
    const defaultEmail = currentUser?.email || 'new_user_session';
    const defaultStreak = '0-Day Focus Streak';
    const defaultLevel = '1';
    const defaultXP = '0';
    const defaultFocusTime = '0h 0m';
    const defaultSkills = '0 Concepts';
    const defaultVelocity = '0%';
    const defaultVpm = '$0.00/min';

    setUserName(defaultName);
    setUserRole(defaultRole);
    setUserAspiration(defaultAspiration);
    setUserEmail(defaultEmail);
    setFocusStreak(defaultStreak);
    setUserLevel(defaultLevel);
    setUserXP(defaultXP);
    setFocusTime(defaultFocusTime);
    setSkillsVerified(defaultSkills);
    setGoalVelocity(defaultVelocity);
    setVpmIndex(defaultVpm);

    removeStorageItem('name');
    removeStorageItem('role');
    removeStorageItem('aspiration');
    removeStorageItem('email');
    removeStorageItem('streak');
    removeStorageItem('level');
    removeStorageItem('xp');
    removeStorageItem('focus_time');
    removeStorageItem('skills_verified');
    removeStorageItem('goal_velocity');
    removeStorageItem('vpm_index');

    setIsEditing(false);
  };

  const handlePivotAccept = (oldTopic: string, newTopic: string) => {
    setPivotNotice(`Successfully shifted identity focus from ${oldTopic} to ${newTopic}.`);
  };

  // Derive dynamic initials from current profile name
  const userInitials = userName
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'NU';

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-transparent text-stone-900'
    }`}>
      {/* Container */}
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Profile Hero Header */}
        <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-sm transition-all ${
          isDarkMode 
            ? 'border-slate-800 bg-slate-900/90 shadow-slate-950/50' 
            : 'border-stone-200/80 bg-white shadow-stone-200/40'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            {/* User Identity Info */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-teal-400 p-1 shadow-md shadow-indigo-500/20">
                  <div className={`w-full h-full rounded-[22px] flex items-center justify-center font-black text-2xl sm:text-3xl ${
                    isDarkMode ? 'bg-slate-950 text-white' : 'bg-stone-900 text-white'
                  }`}>
                    {userInitials}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-white text-white font-bold text-xs" title="Aspiration Engine Verified">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-stone-900'
                  }`}>
                    {userName}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    isDarkMode ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {userRole}
                  </span>
                  <button 
                    onClick={handleOpenEdit}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer hover:scale-105 active:scale-95 ${
                      isDarkMode 
                        ? 'bg-slate-800 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20' 
                        : 'bg-stone-100 text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                    title="Correct or edit profile information"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Profile Info</span>
                  </button>
                </div>

                <p className={`text-xs font-medium flex flex-wrap items-center gap-2 ${
                  isDarkMode ? 'text-slate-400' : 'text-stone-500'
                }`}>
                  <span>Target Goal: <strong className={isDarkMode ? 'text-slate-200' : 'text-stone-800'}>{userAspiration}</strong></span>
                  <span>•</span>
                  <span className="font-mono text-xs">ID / Email: {userEmail}</span>
                </p>

                {/* Badges and Streaks */}
                <div className="flex flex-wrap items-center gap-4 mt-1 text-xs font-mono">
                  <span className={`flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>{focusStreak}</span>
                  </span>
                  <span className={`flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    <Star className="h-4 w-4 fill-indigo-500 text-indigo-500" />
                    <span>Level {userLevel} • {userXP} / {(parseInt(userLevel) || 1) * 1000} XP</span>
                  </span>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* 5. Aspiration Decay & Pivot Alert */}
        <AspirationPivotAlert isDarkMode={isDarkMode} currentUser={currentUser} onPivotAccept={handlePivotAccept} />

        {/* Notification Toast if Pivot Accepted */}
        {pivotNotice && (
          <div className={`rounded-2xl border p-3 px-4 text-xs font-mono flex items-center justify-between ${
            isDarkMode 
              ? 'border-teal-500/30 bg-teal-500/10 text-teal-300' 
              : 'border-teal-200 bg-teal-50 text-teal-800'
          }`}>
            <span>{pivotNotice}</span>
            <button onClick={() => setPivotNotice(null)} className="text-slate-400 hover:text-stone-900 text-xs cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* 2. The "Value per Minute" (VPM) Metrics Row */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-black tracking-tight flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-stone-900'
              }`}>
                <Layers className="h-5 w-5 text-teal-600" />
                Value per Minute (VPM) Performance Metrics
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Real-time human potential optimization metrics and active recall verification.
              </p>
            </div>
          </div>

          <VpmMetricsRow 
            isDarkMode={isDarkMode} 
            focusTime={focusTime}
            focusTimeTrend={focusTimeTrend}
            skillsVerified={skillsVerified}
            goalVelocity={goalVelocity}
            vpmIndex={vpmIndex}
          />
        </div>

        {/* 3. Generative "Future Self" Trajectory Simulator */}
        <div className="grid grid-cols-1 gap-8">
          <FutureSelfSimulator isDarkMode={isDarkMode} />
        </div>
        {/* Bottom Feature Nodes Matrix & Summary */}
        <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col gap-6 transition-all ${
          isDarkMode 
            ? 'border-slate-800 bg-slate-900/90 shadow-slate-950/40' 
            : 'border-stone-200/80 bg-white shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-black tracking-tight flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-stone-900'
              }`}>
                <Brain className="h-5 w-5 text-indigo-650" />
                Dynamic Learning Roadmap & Milestones
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Google Gemini assessed curriculum mapping your baseline background to target career aspirations.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isDarkMode 
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              {roadmap.length} Milestones Configured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmap.map((node, i) => {
              const colors = [
                'from-indigo-500 to-violet-500',
                'from-emerald-500 to-teal-500',
                'from-amber-500 to-orange-500',
                'from-pink-500 to-rose-500'
              ];
              const gradient = colors[i % colors.length];
              const progress = [100, 75, 25, 0][i];
              
              return (
                <div key={i} className={`rounded-2xl p-5 border flex flex-col gap-4 justify-between transition-all duration-300 hover:scale-[1.02] shadow-xs hover:shadow-md ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200/80'
                }`}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block ${
                        isDarkMode ? 'text-slate-400' : 'text-stone-500'
                      }`}>
                        Milestone 0{i + 1} • {node.duration}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        progress === 100
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : progress > 0
                          ? 'bg-amber-500/10 text-amber-500 animate-pulse'
                          : isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-stone-100 text-stone-400'
                      }`}>
                        {progress === 100 ? 'Done' : progress > 0 ? 'Active' : 'Locked'}
                      </span>
                    </div>
                    <h4 className={`text-xs font-black mt-2 leading-snug line-clamp-2 ${
                      isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>
                      {node.phase}
                    </h4>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className={isDarkMode ? 'text-slate-500' : 'text-stone-400'}>Phase Complete</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-200 border-stone-300/40'
                    }`}>
                      <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-xl rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-800 text-slate-100' 
              : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Correct & Edit Profile Details</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                    Update any incorrect info displayed on your profile dashboard.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className={`p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-400 transition cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                    Role / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                  Target Career Goal / Aspiration
                </label>
                <input
                  type="text"
                  required
                  value={editForm.aspiration}
                  onChange={(e) => setEditForm({ ...editForm, aspiration: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                  User ID / Email
                </label>
                <input
                  type="text"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              {/* System-Tracked Performance Metrics (Read-Only) */}
              <div className={`p-4 rounded-2xl border mt-2 transition-all ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-stone-50/80 border-stone-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className={`text-xs font-mono font-bold uppercase text-indigo-500`}>
                      Tracked Progress Metrics (Auto-Calculated)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-mono font-semibold border border-indigo-500/20">
                    System Processed
                  </span>
                </div>

                <p className={`text-[11px] mb-3 flex items-start gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                  <span>
                    Focus streak and VPM performance metrics are automatically tracked from your deep work sessions, verified skills, and goal progress.
                  </span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className={`p-2.5 rounded-xl border flex flex-col ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
                  }`}>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-slate-500 uppercase">Focus Streak</span>
                    <span className="text-xs font-bold font-mono text-indigo-500 dark:text-indigo-400 mt-0.5">{focusStreak}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex flex-col ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
                  }`}>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-slate-500 uppercase">Focus Time</span>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{focusTime}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex flex-col ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
                  }`}>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-slate-500 uppercase">Skills Verified</span>
                    <span className="text-xs font-bold font-mono text-violet-600 dark:text-violet-400 mt-0.5">{skillsVerified}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex flex-col ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
                  }`}>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-slate-500 uppercase">Goal Velocity</span>
                    <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">{goalVelocity}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex flex-col ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
                  }`}>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-slate-500 uppercase">VPM Index</span>
                    <span className="text-xs font-bold font-mono text-teal-600 dark:text-teal-400 mt-0.5">{vpmIndex}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex flex-col ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
                  }`}>
                    <span className="text-[10px] font-mono text-stone-400 dark:text-slate-500 uppercase">Level & XP</span>
                    <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">Lvl {userLevel} ({userXP} XP)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-stone-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white' 
                      : 'border-stone-200 bg-stone-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isDarkMode ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold text-xs shadow-md hover:from-indigo-500 hover:to-teal-400 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
