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
      const awarded = e.detail?.points || 0;
      setPoints(prev => prev + awarded);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    };

    window.addEventListener('pointsAwarded', handlePointsAwarded);
    return () => window.removeEventListener('pointsAwarded', handlePointsAwarded);
  }, []);

  return (
    <div className={`px-4 py-2 mt-4 mx-4 rounded-xl flex items-center justify-between transition-all duration-300 ${
      animate ? (isDarkMode ? 'bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-amber-100 shadow-md scale-105') : (isDarkMode ? 'bg-slate-800' : 'bg-stone-100')
    }`}>
      <div className="flex items-center gap-2">
        <Sparkles className={`w-4 h-4 ${animate ? 'text-amber-400 animate-pulse' : (isDarkMode ? 'text-slate-400' : 'text-stone-500')}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Points</span>
      </div>
      <div className={`font-mono font-extrabold text-sm transition-colors ${animate ? 'text-amber-500' : (isDarkMode ? 'text-slate-200' : 'text-stone-800')}`}>
        {points.toLocaleString()}
      </div>
    </div>
  );
}
