import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Loader2, Sparkles } from 'lucide-react';
import { fetchLeaderboard } from '../lib/backendApi';

export default function Leaderboard({ isDarkMode }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchLeaderboard();
      if (res && res.leaderboard) {
        setLeaderboard(res.leaderboard);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Medal className="w-6 h-6 text-yellow-400 drop-shadow-md" />;
      case 1: return <Medal className="w-5 h-5 text-slate-300 drop-shadow-sm" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600 drop-shadow-sm" />;
      default: return <span className={`font-mono text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>#{index + 1}</span>;
    }
  };

  const getRowStyle = (index) => {
    if (index === 0) {
      return isDarkMode 
        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200' 
        : 'bg-yellow-50 border-yellow-200 text-yellow-900';
    }
    if (index === 1) {
      return isDarkMode 
        ? 'bg-slate-800/60 border-slate-700 text-slate-200' 
        : 'bg-slate-50 border-slate-200 text-slate-800';
    }
    if (index === 2) {
      return isDarkMode 
        ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' 
        : 'bg-amber-50 border-amber-200 text-amber-900';
    }
    return isDarkMode 
      ? 'bg-slate-900/50 border-slate-800/50 text-slate-300' 
      : 'bg-white border-stone-100 text-stone-700';
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-100 text-violet-600'}`}>
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Global Leaderboard
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
            Rankings based on total focus sessions, content completed, and milestones achieved.
          </p>
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-stone-200'}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-violet-500' : 'text-violet-600'}`} />
            <p className={`font-mono text-sm ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>Loading rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Sparkles className={`w-12 h-12 ${isDarkMode ? 'text-slate-700' : 'text-stone-300'}`} />
            <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>No points awarded yet. Be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className={`grid grid-cols-[80px_1fr_120px] items-center p-4 border-b font-mono text-xs uppercase tracking-wider font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
              <div className="text-center">Rank</div>
              <div>Participant</div>
              <div className="text-right">Total Points</div>
            </div>
            
            <div className="flex flex-col p-2 gap-2">
              {leaderboard.map((user, index) => (
                <div 
                  key={index}
                  className={`grid grid-cols-[80px_1fr_120px] items-center p-4 rounded-2xl border transition-all hover:scale-[1.01] ${getRowStyle(index)}`}
                >
                  <div className="flex justify-center items-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="font-bold flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-yellow-950' : 
                      isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {user.name || 'Anonymous User'}
                  </div>
                  <div className="text-right font-mono font-extrabold text-lg">
                    {user.total_points.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
