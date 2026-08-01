import React, { useState } from 'react';
import { Flame, Compass, Brain, Trophy, History, Rocket, ArrowRight, CheckCircle2, LayoutGrid, List } from 'lucide-react';

const UserJourneyTimeline = ({ isDarkMode }) => {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'grid'

  const milestones = [
    {
      id: 'past',
      status: 'completed',
      title: 'Past Baseline',
      subtitle: '6 Months Ago',
      icon: History,
      color: 'rose',
      description: 'Passive content consumption; high attention decay. High doomscrolling time.',
      metrics: [
        { label: 'Doomscroll Time', value: '3.5 hrs/day' },
        { label: 'Focus Duration', value: '1.2 hrs blocks' },
        { label: 'Identity Mastery', value: '2/10 Avg' },
      ],
    },
    {
      id: 'current',
      status: 'active',
      title: 'Active Current State',
      subtitle: 'Real-time',
      icon: Flame,
      color: 'teal',
      description: 'Actively shifting from consumption to creation. Gaining momentum.',
      metrics: [
        { label: 'Doomscroll Time', value: '< 45 mins/day' },
        { label: 'Focus Duration', value: '3.0 hrs blocks' },
        { label: 'Identity Mastery', value: '6/10 Avg' },
      ],
      progress: 65,
    },
    {
      id: 'future',
      status: 'locked',
      title: 'Future Target Horizon',
      subtitle: 'In 6 Months',
      icon: Rocket,
      color: 'indigo',
      description: 'Deep work mastery. Effortless flow states and high creative output.',
      metrics: [
        { label: 'Doomscroll Time', value: '0 hrs/day' },
        { label: 'Focus Duration', value: '4.5 hrs blocks' },
        { label: 'Identity Mastery', value: '9/10 Avg' },
      ],
    },
    {
      id: 'mastery',
      status: 'locked',
      title: 'Peak Mastery',
      subtitle: 'Long-term Goal',
      icon: Trophy,
      color: 'amber',
      description: 'Complete autonomy over attention and dopamine systems.',
      metrics: [
        { label: 'Flow States', value: 'Daily' },
        { label: 'Distraction', value: 'Zero' },
        { label: 'Self-Efficacy', value: '10/10' },
      ],
    }
  ];

  const getColorClasses = (color, status) => {
    const baseColors = {
      rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500', active: 'bg-rose-500' },
      teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-500', active: 'bg-teal-500' },
      indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-500', active: 'bg-indigo-500' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', active: 'bg-amber-500' },
      stone: { bg: 'bg-stone-500/10', border: 'border-stone-500/20', text: 'text-stone-500', active: 'bg-stone-500' },
      slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-500', active: 'bg-slate-500' },
    };

    if (status === 'locked') {
      return isDarkMode ? baseColors.slate : baseColors.stone;
    }
    return baseColors[color] || baseColors.teal;
  };

  return (
    <div className={`p-6 md:p-12 rounded-3xl transition-all duration-500 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/80 text-white' : 'bg-white border-stone-200 text-stone-900 shadow-sm'
      } border`}>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Compass className={`w-8 h-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h2 className="text-3xl font-black tracking-tight">Journey Map</h2>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Track your historical trajectory and future growth horizons.
          </p>
        </div>

        {/* View Toggle */}
        <div className={`flex items-center p-1 rounded-full border ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-stone-100 border-stone-200'
          }`}>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${viewMode === 'timeline'
                ? (isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white text-indigo-600 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-700')
              }`}
          >
            <List className="w-4 h-4" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${viewMode === 'grid'
                ? (isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white text-indigo-600 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-stone-700')
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'timeline' ? (
        <div className="relative">
          {/* Vertical line for timeline */}
          <div className={`absolute left-8 top-8 bottom-8 w-0.5 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-stone-200'
            }`} />

          <div className="flex flex-col gap-12 relative">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              const colors = getColorClasses(milestone.color, milestone.status);

              return (
                <div key={milestone.id} className="flex gap-6 group">
                  {/* Timeline Node */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    {milestone.status === 'active' && (
                      <div className="absolute -bottom-2 w-4 h-4 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900 animate-pulse" />
                    )}
                    {milestone.status === 'completed' && (
                      <div className="absolute -bottom-2 w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isDarkMode
                      ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                    } ${milestone.status === 'locked' ? 'opacity-60 grayscale' : ''}`}>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold tracking-widest uppercase font-mono px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                            {milestone.status}
                          </span>
                          <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>
                            {milestone.subtitle}
                          </span>
                        </div>
                        <h3 className={`text-xl font-bold ${colors.text}`}>
                          {milestone.title}
                        </h3>
                      </div>

                      {milestone.status === 'active' && milestone.progress && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-teal-500">{milestone.progress}% Complete</span>
                          <div className={`w-32 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-stone-100'}`}>
                            <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${milestone.progress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-300' : 'text-stone-600'}`}>
                      {milestone.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {milestone.metrics.map((metric, i) => (
                        <div key={i} className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-stone-50 border-stone-100'
                          }`}>
                          <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-stone-400'
                            }`}>
                            {metric.label}
                          </span>
                          <span className={`font-mono text-sm font-bold ${colors.text}`}>
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((milestone) => {
            const Icon = milestone.icon;
            const colors = getColorClasses(milestone.color, milestone.status);

            return (
              <div key={milestone.id} className={`rounded-3xl p-6 border flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${isDarkMode
                  ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                  : 'bg-white border-stone-200 hover:border-stone-300'
                } ${milestone.status === 'locked' ? 'opacity-60 grayscale' : ''}`}>

                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${colors.bg} ${colors.text} border ${colors.border}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[9px] font-bold tracking-widest uppercase font-mono px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                    {milestone.subtitle}
                  </span>
                </div>

                <h3 className={`text-lg font-bold mb-2 ${colors.text}`}>
                  {milestone.title}
                </h3>

                <p className={`text-xs mb-6 flex-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  {milestone.description}
                </p>

                {milestone.status === 'active' && milestone.progress && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-teal-500 uppercase">Progress</span>
                      <span className="text-[10px] font-mono font-bold text-teal-500">{milestone.progress}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-stone-100'}`}>
                      <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${milestone.progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-auto">
                  {milestone.metrics.map((metric, i) => (
                    <div key={i} className={`flex justify-between items-center p-2 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-stone-50 border-stone-100'
                      }`}>
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>
                        {metric.label}
                      </span>
                      <span className={`font-mono text-xs font-bold ${colors.text}`}>
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserJourneyTimeline;
