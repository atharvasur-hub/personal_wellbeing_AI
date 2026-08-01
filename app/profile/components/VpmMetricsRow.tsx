'use client';

import React from 'react';
import { 
  Clock, 
  Brain, 
  Zap, 
  TrendingUp, 
  ArrowUpRight
} from 'lucide-react';

interface VpmMetricsRowProps {
  isDarkMode?: boolean;
  focusTime?: string;
  skillsVerified?: string;
  goalVelocity?: string;
  vpmIndex?: string;
}

export default function VpmMetricsRow({ 
  isDarkMode = false,
  focusTime,
  skillsVerified,
  goalVelocity,
  vpmIndex
}: VpmMetricsRowProps) {
  // Priority: Prop -> localStorage -> Default Fallback
  const displayFocusTime = focusTime || localStorage.getItem('synapse_profile_focus_time') || '2h 15m';
  const displaySkills = skillsVerified || localStorage.getItem('synapse_profile_skills_verified') || '12 Concepts';
  const displayVelocity = goalVelocity || localStorage.getItem('synapse_profile_goal_velocity') || '84%';
  const displayVpm = vpmIndex || localStorage.getItem('synapse_profile_vpm_index') || '$4.82/min';

  const metrics = [
    {
      id: 'focus_time',
      title: 'Focus Time Reclaimed',
      value: displayFocusTime,
      subtext: 'this week',
      change: '+18.4%',
      isPositive: true,
      icon: Clock,
      gradient: isDarkMode ? 'from-emerald-500/20 via-teal-500/10 to-transparent' : 'from-emerald-100 via-teal-50 to-transparent',
      borderColor: isDarkMode ? 'border-emerald-500/30' : 'border-emerald-200',
      iconColor: isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeColor: isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Dopamine doomscrolling converted into deep work flow.'
    },
    {
      id: 'skills_verified',
      title: 'Skills Verified',
      value: displaySkills,
      subtext: 'Mastered via active recall',
      change: '+3 this week',
      isPositive: true,
      icon: Brain,
      gradient: isDarkMode ? 'from-indigo-500/20 via-violet-500/10 to-transparent' : 'from-indigo-100 via-violet-50 to-transparent',
      borderColor: isDarkMode ? 'border-indigo-500/30' : 'border-indigo-200',
      iconColor: isDarkMode ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-indigo-700 bg-indigo-50 border-indigo-200',
      badgeColor: isDarkMode ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: '94% retention rate on spaced repetition quizzes.'
    },
    {
      id: 'goal_velocity',
      title: 'Goal Velocity',
      value: displayVelocity,
      subtext: 'on track for Target Role',
      change: '+5.2% speedup',
      isPositive: true,
      icon: Zap,
      gradient: isDarkMode ? 'from-amber-500/20 via-orange-500/10 to-transparent' : 'from-amber-100 via-orange-50 to-transparent',
      borderColor: isDarkMode ? 'border-amber-500/30' : 'border-amber-200',
      iconColor: isDarkMode ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-50 border-amber-200',
      badgeColor: isDarkMode ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Calculated trajectory towards Target Career Goal.'
    },
    {
      id: 'vpm_index',
      title: 'Value per Minute (VPM)',
      value: displayVpm,
      subtext: 'Cognitive ROI',
      change: '+24% VPM Boost',
      isPositive: true,
      icon: TrendingUp,
      gradient: isDarkMode ? 'from-cyan-500/20 via-blue-500/10 to-transparent' : 'from-cyan-100 via-teal-50 to-transparent',
      borderColor: isDarkMode ? 'border-cyan-500/30' : 'border-teal-200',
      iconColor: isDarkMode ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-teal-700 bg-teal-50 border-teal-200',
      badgeColor: isDarkMode ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-teal-50 text-teal-800 border-teal-200',
      description: 'High-value synthesis vs passive media consumption.'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      {metrics.map((m) => {
        const IconComponent = m.icon;
        return (
          <div
            key={m.id}
            className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-300 flex flex-col justify-between gap-4 ${
              isDarkMode 
                ? `bg-slate-900/90 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/50 ${m.borderColor}` 
                : `bg-white hover:shadow-md hover:border-stone-300 ${m.borderColor}`
            }`}
          >
            {/* Ambient Background Gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${m.gradient} blur-2xl pointer-events-none`} />

            {/* Card Header */}
            <div className="flex items-start justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider font-mono ${
                isDarkMode ? 'text-slate-400' : 'text-stone-500'
              }`}>
                {m.title}
              </span>
              <div className={`p-2.5 rounded-xl border ${m.iconColor}`}>
                <IconComponent className="h-5 w-5" />
              </div>
            </div>

            {/* Metric Value & Badges */}
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className={`text-2xl font-black tracking-tight font-mono ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  {m.value}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-0.5 ${m.badgeColor}`}>
                  <ArrowUpRight className="h-3 w-3" />
                  {m.change}
                </span>
              </div>
              <p className={`text-xs font-medium ${
                isDarkMode ? 'text-slate-400' : 'text-stone-500'
              }`}>
                {m.subtext}
              </p>
            </div>

            {/* Description Footer */}
            <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${
              isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-stone-100 text-stone-500'
            }`}>
              <span>{m.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
