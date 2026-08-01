import React, { useState, useEffect } from 'react';
import { CheckCircle, PlayCircle, Lock, Compass, Trophy, Zap, ChevronRight } from 'lucide-react';

const DEFAULT_MILESTONES = [
  {
    id: 'node-1',
    title: 'Foundational Skill Specification',
    subtitle: 'Phase 1 • Orientation',
    type: 'Video Tutorial',
    duration_mins: 15,
    status: 'completed',
    description: 'Establish cognitive baseline metrics and calibrate goal trajectory.'
  },
  {
    id: 'node-2',
    title: 'Deep Focus Neural Sprint',
    subtitle: 'Phase 2 • Sprint Check-in',
    type: 'Focus Sprint',
    duration_mins: 25,
    status: 'completed',
    description: '25-minute uninterrupted execution block with Digital Guardian active.'
  },
  {
    id: 'node-3',
    title: 'Identity Graph Alignment & Media Curation',
    subtitle: 'Phase 3 • Active Journey Node',
    type: 'Interactive AI Feed',
    duration_mins: 10,
    status: 'active',
    description: 'AI-curated high-signal videos, shorts, reels, and articles matching your career aspiration.'
  },
  {
    id: 'node-4',
    title: 'Advanced System Design & Architecture',
    subtitle: 'Phase 4 • Locked Skill Matrix',
    type: 'Deep Dive Article',
    duration_mins: 45,
    status: 'locked',
    description: 'Master microservice state machines, caching layers, and high-concurrency loops.'
  },
  {
    id: 'node-5',
    title: 'Mastery Verification & VPM Index Audit',
    subtitle: 'Phase 5 • Final Calibration',
    type: 'Performance Audit',
    duration_mins: 20,
    status: 'locked',
    description: 'Verify 10/10 node mastery and optimize Value Per Minute productivity metric.'
  }
];

export default function UserJourneyTimeline({ milestones, isDarkMode = false }) {
  const [currentAspiration, setCurrentAspiration] = useState(() => {
    return localStorage.getItem('synapse_user_aspiration') || localStorage.getItem('aspiration') || 'Senior AI Architect';
  });

  const [roadmapNodes, setRoadmapNodes] = useState(() => {
    if (milestones && milestones.length > 0) return milestones;
    try {
      const saved = localStorage.getItem('synapse_user_roadmap');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return DEFAULT_MILESTONES;
  });

  const [activeCheckIn, setActiveCheckIn] = useState(false);

  // Sync state with localStorage & custom update events
  useEffect(() => {
    const syncState = () => {
      const savedAspiration = localStorage.getItem('synapse_user_aspiration') || localStorage.getItem('aspiration') || 'Senior AI Architect';
      setCurrentAspiration(savedAspiration);

      try {
        const savedRoadmap = localStorage.getItem('synapse_user_roadmap');
        if (savedRoadmap) {
          const parsed = JSON.parse(savedRoadmap);
          if (parsed && parsed.length > 0) setRoadmapNodes(parsed);
        }
      } catch (e) { }
    };

    syncState();
    window.addEventListener('synapse_roadmap_updated', syncState);
    return () => window.removeEventListener('synapse_roadmap_updated', syncState);
  }, []);

  const cleanRoleName = currentAspiration.replace(/^I want to (become|be) a /i, '').trim();

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">

      {/* Header Banner */}
      <div className="w-full mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
              <Compass className="w-5 h-5" />
            </div>
            <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-teal-600'}`}>
              AI Career Roadmap
            </span>
          </div>
          <h2 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>
            Skill Trajectory: <span className="text-teal-500">{cleanRoleName}</span>
          </h2>
        </div>

        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200 shadow-xs'}`}>
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <span className={`block text-[10px] font-mono uppercase ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>Target Role</span>
            <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-stone-800'}`}>{cleanRoleName}</span>
          </div>
        </div>
      </div>

      {/* Vertical Timeline Nodes */}
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
        {roadmapNodes.map((node, index) => (
          <div key={node.id || index} className="relative flex flex-col items-center w-full">

            {/* Connector Line */}
            {index !== 0 && (
              <div className={`w-1 h-12 my-1 transition-colors duration-500 ${
                node.status === 'completed'
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-400'
                  : node.status === 'active'
                  ? 'bg-gradient-to-b from-emerald-400 to-indigo-500 animate-pulse'
                  : isDarkMode ? 'bg-slate-800' : 'bg-stone-200'
              }`} />
            )}

            {/* Node Card */}
            <div className={`w-full p-6 border rounded-3xl transition-all duration-300 ${
              node.status === 'completed'
                ? isDarkMode
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'border-emerald-300 bg-emerald-50/60 text-stone-900 shadow-sm'
                : node.status === 'active'
                ? isDarkMode
                  ? 'border-indigo-500/60 bg-indigo-950/30 text-slate-100 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-2 ring-indigo-500/30 animate-pulse'
                  : 'border-teal-400 bg-teal-50/80 text-stone-900 shadow-md ring-2 ring-teal-400/20'
                : isDarkMode
                  ? 'border-slate-800/80 bg-slate-900/30 text-slate-500 opacity-50 blur-[0.5px]'
                  : 'border-stone-200 bg-stone-100/50 text-stone-400 opacity-60'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      node.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : node.status === 'active'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : 'bg-stone-500/10 text-stone-400 border-stone-500/20'
                    }`}>
                      {node.status || 'locked'}
                    </span>
                    <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                      {node.type} • {node.duration_mins} mins
                    </span>
                  </div>

                  <h3 className={`text-base font-extrabold tracking-wide ${
                    node.status === 'completed'
                      ? isDarkMode ? 'text-emerald-300' : 'text-emerald-900'
                      : node.status === 'active'
                      ? isDarkMode ? 'text-indigo-300' : 'text-teal-900'
                      : isDarkMode ? 'text-slate-400' : 'text-stone-500'
                  }`}>
                    {node.title}
                  </h3>

                  <p className={`text-xs mt-1.5 leading-relaxed ${
                    isDarkMode ? 'text-slate-400' : 'text-stone-600'
                  }`}>
                    {node.description}
                  </p>
                </div>

                {/* Status Indicator Icon */}
                <div className="shrink-0 mt-1">
                  {node.status === 'completed' && <CheckCircle className="text-emerald-500 w-7 h-7" />}
                  {node.status === 'active' && <PlayCircle className="text-indigo-400 w-7 h-7 animate-bounce" />}
                  {node.status === 'locked' && <Lock className="text-slate-500 w-6 h-6" />}
                </div>
              </div>

              {/* Active Accordion Expansion */}
              {node.status === 'active' && (
                <div className={`mt-5 pt-4 border-t flex flex-col gap-3 ${isDarkMode ? 'border-indigo-500/20' : 'border-teal-200'}`}>
                  <button
                    onClick={() => setActiveCheckIn(!activeCheckIn)}
                    className={`w-full py-3 px-5 rounded-2xl font-extrabold text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
                        : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>{activeCheckIn ? 'Check-in Recorded ✓' : 'Check-in & Consume Media'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {activeCheckIn && (
                    <div className={`p-3 rounded-xl text-xs font-mono border animate-fade-in ${
                      isDarkMode ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200' : 'bg-teal-50 border-teal-200 text-teal-900'
                    }`}>
                      🎯 Check-in verified for {cleanRoleName}! Media feed & VPM metrics synced.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { UserJourneyTimeline as JourneyMap };