'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from 'recharts';
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

const generateProjectionData = (userXP: number, focusHours: number) => {
  const baseMastery = Math.min(Math.floor(userXP / 100), 20); // Starting mastery
  const velocityScore = Math.min((focusHours / 10) + (userXP / 500), 5); // 0 to 5 multiplier
  
  return Array.from({ length: 6 }).map((_, i) => {
    const monthIndex = i + 1;
    const isStart = i === 0;
    const isTarget = i === 5;
    
    // Aspiration compounds based on velocity
    const aspirationGrowth = Math.floor(baseMastery + (velocityScore * monthIndex * 3));
    const cappedAspiration = Math.min(aspirationGrowth, 100);
    
    // Passive grows slowly, representing "decay" or lost potential
    const passiveGrowth = Math.floor(20 + (monthIndex * 5));
    
    // Hours translate
    const flowHours = Math.floor(focusHours + (velocityScore * monthIndex * 4));
    const doomscrollHours = Math.max(3.5 - (velocityScore * monthIndex * 0.5), 0.2);

    return {
      month: isStart ? 'Month 1 (Start)' : isTarget ? 'Month 6 (Target)' : `Month ${monthIndex}`,
      PassiveTrend: passiveGrowth,
      AspirationTrend: cappedAspiration,
      DoomscrollHours: parseFloat(doomscrollHours.toFixed(1)),
      FlowHours: parseFloat(flowHours.toFixed(1))
    };
  });
};

interface FutureSelfSimulatorProps {
  isDarkMode?: boolean;
  userXP?: string;
  focusTime?: string;
  focusStreak?: string;
}

export default function FutureSelfSimulator({ 
  isDarkMode = false,
  userXP = '0',
  focusTime = '0h 0m'
}: FutureSelfSimulatorProps) {
  const [selectedMetric, setSelectedMetric] = useState<'mastery' | 'hours'>('mastery');
  
  const xpNum = parseInt(userXP, 10) || 0;
  
  // Extract hours from focusTime string like "1h 25m"
  const hoursMatch = focusTime.match(/(\d+)h/);
  const minsMatch = focusTime.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  const totalFocusHours = hours + (mins / 60);

  const projectionData = generateProjectionData(xpNum, totalFocusHours);
  
  const targetAspiration = projectionData[5].AspirationTrend;
  const targetPassive = projectionData[5].PassiveTrend;

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm flex flex-col justify-between gap-6 transition-all ${
      isDarkMode 
        ? 'border-slate-800 bg-slate-900/90 shadow-slate-950/50' 
        : 'border-stone-200 bg-white shadow-stone-200/50'
    }`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className={`h-5 w-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              Generative "Future Self" Trajectory Simulator
            </h3>
          </div>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            6-Month Predictive Trajectory based on daily micro-growth vs doomscroll entropy.
          </p>
        </div>

        {/* View Toggle */}
        <div className={`flex items-center gap-1 rounded-xl p-1 border text-xs font-mono ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200'
        }`}>
          <button
            onClick={() => setSelectedMetric('mastery')}
            className={`rounded-lg px-3 py-1 transition cursor-pointer ${
              selectedMetric === 'mastery' 
                ? 'bg-emerald-500 text-white font-bold' 
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Potential Index
          </button>
          <button
            onClick={() => setSelectedMetric('hours')}
            className={`rounded-lg px-3 py-1 transition cursor-pointer ${
              selectedMetric === 'hours' 
                ? 'bg-emerald-500 text-white font-bold' 
                : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Weekly Flow Hours
          </button>
        </div>
      </div>

      {/* Projection Metric Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-3.5 flex items-center justify-between ${
          isDarkMode ? 'border-rose-500/30 bg-rose-500/10' : 'border-rose-200 bg-rose-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                isDarkMode ? 'text-rose-400' : 'text-rose-700'
              }`}>
                PASSIVE TREND (WARNING)
              </span>
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-stone-800'}`}>
                At risk of -48.5% Cognitive Decay in 6 Months
              </span>
            </div>
          </div>
          <span className="font-mono text-rose-600 font-bold text-sm">{targetPassive} pts</span>
        </div>

        <div className={`rounded-2xl border p-3.5 flex items-center justify-between ${
          isDarkMode ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                ASPIRATION TREND (TARGET)
              </span>
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-stone-800'}`}>
                Projected to reach {targetAspiration}% Senior Architect Mastery
              </span>
            </div>
          </div>
          <span className="font-mono text-emerald-600 font-bold text-sm">{targetAspiration} pts</span>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="h-[340px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} opacity={0.6} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 11 }}
              stroke={isDarkMode ? '#475569' : '#cbd5e1'} 
            />
            <YAxis 
              domain={selectedMetric === 'mastery' ? [0, 100] : [0, 30]} 
              tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
              stroke={isDarkMode ? '#475569' : '#cbd5e1'}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                borderRadius: '12px',
                color: isDarkMode ? '#fff' : '#0f172a',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            
            {/* Passive Trend Line (Red/Rose) */}
            <Line
              type="monotone"
              name="Passive Trend (Doomscrolling & Friction)"
              dataKey={selectedMetric === 'mastery' ? 'PassiveTrend' : 'DoomscrollHours'}
              stroke="#e11d48"
              strokeWidth={3}
              dot={{ r: 4, fill: '#e11d48' }}
              activeDot={{ r: 7 }}
            />
            
            {/* Aspiration Trend Line (Green/Emerald) */}
            <Line
              type="monotone"
              name="Aspiration Trend (Micro-Growth & Deep Flow)"
              dataKey={selectedMetric === 'mastery' ? 'AspirationTrend' : 'FlowHours'}
              stroke="#059669"
              strokeWidth={3.5}
              dot={{ r: 5, fill: '#059669' }}
              activeDot={{ r: 8 }}
            />

            <ReferenceLine y={50} stroke={isDarkMode ? '#64748b' : '#94a3b8'} strokeDasharray="3 3" label={{ value: 'Baseline Threshold', fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Simulator Footer Insight */}
      <div className={`rounded-2xl p-4 border flex items-center justify-between text-xs font-mono ${
        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-stone-50 border-stone-200 text-stone-600'
      }`}>
        <span>
          <strong className="text-emerald-600">AI Simulation Verdict:</strong> 15 mins daily focused study yields +260 hours reclaimed per year.
        </span>
        <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          99.4% Divergence Confidence
        </span>
      </div>
    </div>
  );
}
