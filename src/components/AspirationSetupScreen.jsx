import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Loader2, CheckCircle, Zap } from 'lucide-react';
import { fetchAIRecommendations } from '../lib/contentRecommender';
import { saveAspirationToBackend, fetchAIRoadmap } from '../lib/backendApi';

const ROLE_SUGGESTIONS = [
  'Senior AI/ML Engineer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'UX Designer',
  'DevOps / Cloud Engineer',
  'Cybersecurity Analyst',
  'Blockchain Developer',
];

const STAGES = [
  { icon: '🧠', label: 'Analyzing your career intent...' },
  { icon: '🎯', label: 'Crafting your personalized roadmap...' },
  { icon: '📚', label: 'Curating high-signal media resources...' },
  { icon: '✨', label: 'Activating your Identity Graph...' },
];

export default function AspirationSetupScreen({ currentUser, onComplete }) {
  const [input, setInput] = useState('');
  const [stage, setStage] = useState('input'); // 'input' | 'loading' | 'done'
  const [loadingStep, setLoadingStep] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const goal = input.trim();
    if (!goal) return;

    setStage('loading');
    setLoadingStep(0);

    // Animate loading steps
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < STAGES.length) {
        setLoadingStep(step);
      } else {
        clearInterval(interval);
      }
    }, 700);

    // Save aspiration
    localStorage.setItem('synapse_user_aspiration', goal);
    localStorage.setItem('aspiration', goal);
    localStorage.setItem('synapse_onboarding_completed', 'true');
    localStorage.removeItem('synapse_new_login_prompt');

    // Fire both AI calls in parallel
    const [recs, roadmapData] = await Promise.all([
      fetchAIRecommendations(goal),
      fetchAIRoadmap(goal),
      saveAspirationToBackend(goal),
    ]);

    clearInterval(interval);

    if (roadmapData && roadmapData.nodes) {
      localStorage.setItem('synapse_user_roadmap', JSON.stringify(roadmapData.nodes));
    }
    if (recs && recs.length > 0) {
      localStorage.setItem('synapse_curated_media', JSON.stringify(recs));
    }

    window.dispatchEvent(new Event('synapse_roadmap_updated'));
    window.dispatchEvent(new Event('synapse_media_updated'));

    setLoadingStep(STAGES.length);
    setStage('done');

    // Brief pause then complete
    setTimeout(() => {
      onComplete({ aspiration: goal, roadmap: roadmapData?.nodes, media: recs });
    }, 900);
  };

  const handleChip = (role) => {
    setInput(role);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cleanName = (currentUser?.name || currentUser?.email || 'there').split(' ')[0];
  const cleanRole = input.replace(/^I want to (become|be) a?n?\s*/i, '').trim();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#09090b]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-600/25 via-violet-700/15 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-cyan-500/15 via-teal-600/10 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-800/10 to-transparent blur-2xl" />
        {/* grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-8">

        {/* Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Synapse AI • Identity Initialization</span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.05]">
            Hey {cleanName},<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              who do you want
            </span>
            <br />
            <span className="text-white">to become?</span>
          </h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Your answer activates an AI career architect that generates a custom skill roadmap and curates the highest-signal media resources — just for you.
          </p>
        </div>

        {/* Input / Loading / Done states */}
        {stage === 'input' && (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <div className="relative w-full">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g. Senior AI Engineer, Full Stack Developer, Data Scientist..."
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 rounded-2xl px-6 py-5 text-white placeholder-slate-500 text-base outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
            </div>

            {/* Role Suggestion Chips */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              {ROLE_SUGGESTIONS.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleChip(role)}
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-full border transition-all duration-150 cursor-pointer ${
                    input === role
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/10'
                  }`}
                >
                  + {role}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full py-4 px-8 rounded-2xl font-extrabold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer
                bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4" />
              <span>Activate My AI Career Architect</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {stage === 'loading' && (
          <div className="w-full flex flex-col items-center gap-8">
            {/* Animated orb */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 animate-pulse blur-xl opacity-60" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>

            {/* Loading steps */}
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {STAGES.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                  i < loadingStep ? 'text-emerald-400' : i === loadingStep ? 'text-white' : 'text-slate-600'
                }`}>
                  <span className="text-base">{i < loadingStep ? '✅' : s.icon}</span>
                  <span className={`font-mono ${i === loadingStep ? 'font-bold' : ''}`}>{s.label}</span>
                </div>
              ))}
            </div>

            {cleanRole && (
              <p className="text-slate-500 text-xs font-mono">
                Building your roadmap to become a{' '}
                <span className="text-indigo-400 font-bold">{cleanRole}</span>
              </p>
            )}
          </div>
        )}

        {stage === 'done' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Roadmap Generated!</p>
              <p className="text-slate-400 text-sm mt-1">Launching your personalized workspace...</p>
            </div>
          </div>
        )}

        {/* Footer copy */}
        {stage === 'input' && (
          <p className="text-slate-600 text-xs font-mono">
            Powered by Gemini AI • Your goal is encrypted and stored securely
          </p>
        )}
      </div>
    </div>
  );
}
