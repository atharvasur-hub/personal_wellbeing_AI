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
  RotateCcw
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
  const [skillsVerified, setSkillsVerified] = useState<string>(() => {
    return getStorageItem('skills_verified', '0 Concepts');
  });
  const [goalVelocity, setGoalVelocity] = useState<string>(() => {
    return getStorageItem('goal_velocity', '0%');
  });
  const [vpmIndex, setVpmIndex] = useState<string>(() => {
    return getStorageItem('vpm_index', '$0.00/min');
  });

  const [pivotNotice, setPivotNotice] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Edit form temporary state
  const [editForm, setEditForm] = useState({
    name: userName,
    role: userRole,
    aspiration: userAspiration,
    email: userEmail,
    streak: focusStreak,
    level: userLevel,
    xp: userXP,
    focusTime: focusTime,
    skillsVerified: skillsVerified,
    goalVelocity: goalVelocity,
    vpmIndex: vpmIndex
  });

  // Sync focus time live from localStorage
  useEffect(() => {
    const syncFocusTime = () => {
      const savedTime = getStorageItem('focus_time', '0h 0m');
      setFocusTime(savedTime);
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
      streak: focusStreak,
      level: userLevel,
      xp: userXP,
      focusTime: focusTime,
      skillsVerified: skillsVerified,
      goalVelocity: goalVelocity,
      vpmIndex: vpmIndex
    });
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(editForm.name);
    setUserRole(editForm.role);
    setUserAspiration(editForm.aspiration);
    setUserEmail(editForm.email);
    setFocusStreak(editForm.streak);
    setUserLevel(editForm.level);
    setUserXP(editForm.xp);
    setFocusTime(editForm.focusTime);
    setSkillsVerified(editForm.skillsVerified);
    setGoalVelocity(editForm.goalVelocity);
    setVpmIndex(editForm.vpmIndex);

    // Save to LocalStorage (User-scoped)
    setStorageItem('name', editForm.name);
    setStorageItem('role', editForm.role);
    setStorageItem('aspiration', editForm.aspiration);
    setStorageItem('email', editForm.email);
    setStorageItem('streak', editForm.streak);
    setStorageItem('level', editForm.level);
    setStorageItem('xp', editForm.xp);
    setStorageItem('focus_time', editForm.focusTime);
    setStorageItem('skills_verified', editForm.skillsVerified);
    setStorageItem('goal_velocity', editForm.goalVelocity);
    setStorageItem('vpm_index', editForm.vpmIndex);

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

            {/* Dynamic Level Progress Bar */}
            {(() => {
              const lvl = parseInt(userLevel) || 1;
              const xpVal = parseInt((userXP || '0').toString().replace(/,/g, '')) || 0;
              const maxXP = lvl * 1000;
              const pct = Math.min(100, Math.round((xpVal / maxXP) * 100));
              const needed = Math.max(0, maxXP - xpVal);
              return (
                <div className={`w-full md:w-72 flex flex-col gap-3 rounded-2xl p-4 border ${
                  isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className={`flex items-center justify-between text-xs font-mono font-bold ${
                    isDarkMode ? 'text-slate-300' : 'text-stone-700'
                  }`}>
                    <span>Level Progression</span>
                    <span className="text-teal-600 font-bold">{pct}%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-200 border-stone-300/50'
                  }`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400" style={{ width: `${pct}%` }} />
                  </div>
                  <div className={`flex items-center justify-between text-[11px] font-mono ${
                    isDarkMode ? 'text-slate-400' : 'text-stone-500'
                  }`}>
                    <span>Next Rank: Level {lvl + 1}</span>
                    <span className="font-bold">+{needed.toLocaleString()} XP needed</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* 5. Aspiration Decay & Pivot Alert */}
        <AspirationPivotAlert isDarkMode={isDarkMode} onPivotAccept={handlePivotAccept} />

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
            skillsVerified={skillsVerified}
            goalVelocity={goalVelocity}
            vpmIndex={vpmIndex}
          />
        </div>

        {/* 3 & 4. Dual Graph Section: Radar Chart + Line Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3. Dynamic Identity & Aspirations Graph */}
          <IdentityAspirationsGraph isDarkMode={isDarkMode} />

          {/* 4. Generative "Future Self" Trajectory Simulator */}
          <FutureSelfSimulator isDarkMode={isDarkMode} />
        </div>

        {/* Bottom Feature Nodes Matrix & Summary */}
        <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col gap-6 transition-all ${
          isDarkMode 
            ? 'border-slate-800 bg-slate-900/90' 
            : 'border-stone-200/80 bg-white shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-black tracking-tight flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-stone-900'
              }`}>
                <Brain className="h-5 w-5 text-indigo-600" />
                Identity Graph Node Weights & Active Recall
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                Implicit profiling dynamically re-weights learning feeds to optimize for human potential.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isDarkMode 
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              6 Active Nodes Configured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Systems Architecture', level: 'Level 8/10', category: 'Core Mastery', color: 'from-indigo-500 to-violet-500', progress: 85 },
              { name: 'Deep Work Endurance', level: 'Level 7/10', category: 'Cognitive Capacity', color: 'from-emerald-500 to-teal-500', progress: 70 },
              { name: 'Rust Concurrency', level: 'Level 6/10', category: 'Technical Systems', color: 'from-amber-500 to-orange-500', progress: 60 },
              { name: 'Product Management', level: 'Level 9/10 (Elevated)', category: 'Strategic Execution', color: 'from-teal-500 to-cyan-500', progress: 92 },
              { name: 'AI Alignment & Safety', level: 'Level 8/10', category: 'Emerging Tech', color: 'from-violet-500 to-purple-500', progress: 78 },
              { name: 'Public Speaking', level: 'Level 5/10', category: 'Soft Skill', color: 'from-rose-500 to-pink-500', progress: 55 },
            ].map((node, i) => (
              <div key={i} className={`rounded-2xl p-4 border flex flex-col gap-3 justify-between ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200/80'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                      isDarkMode ? 'text-slate-400' : 'text-stone-500'
                    }`}>{node.category}</span>
                    <h4 className={`text-sm font-bold mt-0.5 ${
                      isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>{node.name}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600">{node.level}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-200 border-stone-300/40'
                }`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${node.color}`} style={{ width: `${node.progress}%` }} />
                </div>
              </div>
            ))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                    Focus Streak
                  </label>
                  <input
                    type="text"
                    value={editForm.streak}
                    onChange={(e) => setEditForm({ ...editForm, streak: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              {/* VPM Performance Metrics Section */}
              <div className="pt-2 border-t border-stone-200 dark:border-slate-800">
                <span className={`block text-xs font-mono font-bold uppercase mb-3 text-indigo-500`}>
                  VPM Performance Metrics
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                      Focus Time Reclaimed
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.focusTime}
                      onChange={(e) => setEditForm({ ...editForm, focusTime: e.target.value })}
                      placeholder="e.g. 2h 15m"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                      Skills Verified
                    </label>
                    <input
                      type="text"
                      value={editForm.skillsVerified}
                      onChange={(e) => setEditForm({ ...editForm, skillsVerified: e.target.value })}
                      placeholder="e.g. 12 Concepts"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                      Goal Velocity
                    </label>
                    <input
                      type="text"
                      value={editForm.goalVelocity}
                      onChange={(e) => setEditForm({ ...editForm, goalVelocity: e.target.value })}
                      placeholder="e.g. 84%"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                      Value per Minute (VPM)
                    </label>
                    <input
                      type="text"
                      value={editForm.vpmIndex}
                      onChange={(e) => setEditForm({ ...editForm, vpmIndex: e.target.value })}
                      placeholder="e.g. $4.82/min"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                    User Level
                  </label>
                  <input
                    type="text"
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                    XP Points
                  </label>
                  <input
                    type="text"
                    value={editForm.xp}
                    onChange={(e) => setEditForm({ ...editForm, xp: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
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
