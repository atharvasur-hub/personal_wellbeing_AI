import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { fetchUserPoints } from '../lib/backendApi';

export default function PointsBadge({ isDarkMode }) {
  const [points, setPoints] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    async function loadPoints() {
      const res = await fetchUserPoints();
      if (res && typeof res.total_points === 'number') {
        setPoints(res.total_points);
      }
    }
    loadPoints();

    const handlePointsAwarded = (e) => {
      // Instead of just incrementing, we reload to ensure perfect sync with backend truth
      loadPoints();
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    };

    window.addEventListener('pointsAwarded', handlePointsAwarded);
    return () => window.removeEventListener('pointsAwarded', handlePointsAwarded);
  }, []);

  return (
    <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 border shadow-sm ${
      animate 
        ? (isDarkMode ? 'bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-amber-100 border-amber-300 shadow-md scale-105') 
        : (isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200/80')
    }`}>
      <Sparkles className={`w-3.5 h-3.5 ${animate ? 'text-amber-400 animate-pulse' : 'text-amber-500'}`} />
      <div className={`font-mono font-extrabold text-xs transition-colors ${animate ? 'text-amber-500' : (isDarkMode ? 'text-slate-200' : 'text-stone-800')}`}>
        {points.toLocaleString()} PTS
      </div>
    </div>
  );
}
