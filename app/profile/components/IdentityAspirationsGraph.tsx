'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from 'recharts';
import { Sparkles, Cpu } from 'lucide-react';

const initialData = [
  { subject: 'Systems Architecture', Current: 85, Target: 98, fullMark: 100 },
  { subject: 'Deep Work Endurance', Current: 70, Target: 95, fullMark: 100 },
  { subject: 'Public Speaking', Current: 55, Target: 85, fullMark: 100 },
  { subject: 'Rust Concurrency', Current: 60, Target: 90, fullMark: 100 },
  { subject: 'Product Management', Current: 82, Target: 92, fullMark: 100 },
  { subject: 'AI Alignment & Safety', Current: 78, Target: 96, fullMark: 100 },
];

interface IdentityAspirationsGraphProps {
  isDarkMode?: boolean;
}

export default function IdentityAspirationsGraph({ isDarkMode = false }: IdentityAspirationsGraphProps) {
  const [data, setData] = useState(initialData);
  const [activeSeries, setActiveSeries] = useState<'both' | 'current' | 'target'>('both');

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm flex flex-col justify-between gap-6 transition-all ${
      isDarkMode 
        ? 'border-slate-800 bg-slate-900/90 shadow-slate-950/50' 
        : 'border-stone-200 bg-white shadow-stone-200/50'
    }`}>
      {/* Header with Title & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className={`h-5 w-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Dynamic Identity & Aspirations Graph
            </h3>
          </div>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Real-time radar comparison between Current State and Aspirational Target.
          </p>
        </div>

        {/* Filter Toggle Pills */}
        <div className={`flex items-center gap-1 rounded-xl p-1 border text-xs font-mono ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200'
        }`}>
          <button
            onClick={() => setActiveSeries('both')}
            className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
              activeSeries === 'both' 
                ? 'bg-indigo-600 text-white font-bold' 
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Both
          </button>
          <button
            onClick={() => setActiveSeries('current')}
            className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
              activeSeries === 'current' 
                ? 'bg-teal-500 text-slate-950 font-bold' 
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setActiveSeries('target')}
            className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
              activeSeries === 'target' 
                ? 'bg-violet-500 text-white font-bold' 
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Target
          </button>
        </div>
      </div>

      {/* Visual Badge: Implicit Profiling Active */}
      <div className={`relative overflow-hidden rounded-2xl border p-3.5 flex items-center gap-3 ${
        isDarkMode 
          ? 'border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-slate-950/80 to-slate-950' 
          : 'border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-indigo-50/30 to-white'
      }`}>
        <div className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
          <span className={`font-bold flex items-center gap-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Implicit Profiling Active:
          </span>
          <span className={`font-mono text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
            Node weights adjusted based on <strong className="text-amber-600 font-bold">14 recent skips</strong> and <strong className="text-emerald-600 font-bold">42 clicks</strong>.
          </span>
        </div>
      </div>

      {/* Recharts Radar Chart */}
      <div className="h-[340px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: isDarkMode ? '#cbd5e1' : '#334155', fontSize: 11, fontWeight: 600 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10 }}
              stroke={isDarkMode ? '#334155' : '#cbd5e1'}
            />
            
            {(activeSeries === 'both' || activeSeries === 'current') && (
              <Radar
                name="Current State"
                dataKey="Current"
                stroke="#0d9488"
                fill="#0d9488"
                fillOpacity={isDarkMode ? 0.4 : 0.25}
              />
            )}
            
            {(activeSeries === 'both' || activeSeries === 'target') && (
              <Radar
                name="Aspirational Target"
                dataKey="Target"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={isDarkMode ? 0.35 : 0.2}
              />
            )}

            <Tooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                borderRadius: '12px',
                color: isDarkMode ? '#fff' : '#0f172a',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend Summary */}
      <div className={`grid grid-cols-2 gap-3 pt-3 border-t text-xs ${
        isDarkMode ? 'border-slate-800' : 'border-stone-100'
      }`}>
        <div className="flex items-center gap-2 text-teal-600 font-semibold">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span>Current State Avg: 71.6% Mastery</span>
        </div>
        <div className="flex items-center gap-2 text-violet-600 font-semibold justify-end">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
          <span>Target Horizon Avg: 93.2% Mastery</span>
        </div>
      </div>
    </div>
  );
}
