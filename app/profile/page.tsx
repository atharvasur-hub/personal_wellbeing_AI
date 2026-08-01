'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  Star, 
  Brain, 
  Layers, 
  CheckCircle2
} from 'lucide-react';
import VpmMetricsRow from './components/VpmMetricsRow';
import IdentityAspirationsGraph from './components/IdentityAspirationsGraph';
import FutureSelfSimulator from './components/FutureSelfSimulator';
import AspirationPivotAlert from './components/AspirationPivotAlert';

interface ProfileVpmDashboardProps {
  isDarkMode?: boolean;
}

export default function ProfileVpmDashboard({ isDarkMode = false }: ProfileVpmDashboardProps) {
  const [userName, setUserName] = useState('Atharva Sur');
  const [userRole, setUserRole] = useState('Growth Catalyst • Tier 3');
  const [userAspiration, setUserAspiration] = useState('Senior AI Architect');
  const [pivotNotice, setPivotNotice] = useState<string | null>(null);

  const handlePivotAccept = (oldTopic: string, newTopic: string) => {
    setPivotNotice(`Successfully shifted identity focus from ${oldTopic} to ${newTopic}.`);
  };

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
                    AS
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-white text-white font-bold text-xs">
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
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                    isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    Aspiration Engine Verified
                  </span>
                </div>

                <p className={`text-xs font-medium flex items-center gap-2 ${
                  isDarkMode ? 'text-slate-400' : 'text-stone-500'
                }`}>
                  <span>Target Goal: <strong className={isDarkMode ? 'text-slate-200' : 'text-stone-800'}>{userAspiration}</strong></span>
                  <span>•</span>
                  <span className="font-mono text-xs">ID: usr_wellbeing_2026</span>
                </p>

                {/* Badges and Streaks */}
                <div className="flex flex-wrap items-center gap-4 mt-1 text-xs font-mono">
                  <span className={`flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>4-Day Focus Streak</span>
                  </span>
                  <span className={`flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    <Star className="h-4 w-4 fill-indigo-500 text-indigo-500" />
                    <span>Level 14 • 3,420 / 4,000 XP</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className={`w-full md:w-72 flex flex-col gap-3 rounded-2xl p-4 border ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className={`flex items-center justify-between text-xs font-mono font-bold ${
                isDarkMode ? 'text-slate-300' : 'text-stone-700'
              }`}>
                <span>Level Progression</span>
                <span className="text-teal-600 font-bold">85.5%</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-200 border-stone-300/50'
              }`}>
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400" style={{ width: '85.5%' }} />
              </div>
              <div className={`flex items-center justify-between text-[11px] font-mono ${
                isDarkMode ? 'text-slate-400' : 'text-stone-500'
              }`}>
                <span>Next Rank: Master Catalyst</span>
                <span className="font-bold">+580 XP needed</span>
              </div>
            </div>
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
            <button onClick={() => setPivotNotice(null)} className="text-slate-400 hover:text-stone-900 text-xs">Dismiss</button>
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

          <VpmMetricsRow isDarkMode={isDarkMode} />
        </div>

        {/* 3 & 4. Dual Graph Section: Radar Chart + Line Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3. Dynamic Identity & Aspirations Graph */}
          <IdentityAspirationsGraph isDarkMode={isDarkMode} />

          {/* 4. Generative "Future Self" Trajectory Simulator */}
          <FutureSelfSimulator isDarkMode={isDarkMode} />
        </div>

        {/* Bottom Feature Nodes Matrix & Hackathon Summary */}
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
    </div>
  );
}
