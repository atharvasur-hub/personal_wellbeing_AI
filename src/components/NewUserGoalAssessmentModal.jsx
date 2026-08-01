import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Brain, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  Clock, 
  Rocket,
  ShieldCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { 
  assessGoalWithAI,
  saveUserProfileToBackend,
  saveAspirationToBackend
} from '../lib/backendApi';

export default function NewUserGoalAssessmentModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  isDarkMode = false,
  onAssessmentComplete 
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Wizard Inputs
  const [baseline, setBaseline] = useState('First-year CS student, know basic C/Python');
  const [aspiration, setAspiration] = useState('Master VLSI Hardware Design & System Architecture');
  const [timeframe, setTimeframe] = useState('6 months');

  // AI Training status message
  const [aiStatusMessage, setAiStatusMessage] = useState('Configuring Agentic Skill Architect...');

  if (!isOpen) return null;

  const BASELINE_SUGGESTIONS = [
    'First-year CS student, know basic C/Python',
    'Self-taught web developer, know basic JS/HTML',
    'Junior software engineer, familiar with Git & basic SQL',
    'Business analyst, basic understanding of data tools'
  ];

  const ASPIRATION_SUGGESTIONS = [
    'Master VLSI Hardware Design & System Architecture',
    'Become a Principal ML/AI Engineer',
    'React & Frontend Performance Specialist',
    'Senior Full Stack & Cloud Architect'
  ];

  const TIMEFRAME_OPTIONS = [
    { label: '3 months', desc: 'Accelerated skill sprints' },
    { label: '6 months', desc: 'Standard mastery track' },
    { label: '12 months', desc: 'Deep domain transition' }
  ];

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4);
      runAgenticAssessment();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const runAgenticAssessment = async () => {
    setLoading(true);
    const userId = currentUser?.id || 'usr_default';

    try {
      setAiStatusMessage('Connecting to Gemini 1.5 Flash assessment engine...');
      await new Promise(r => setTimeout(r, 600));

      setAiStatusMessage('Analyzing skills gap & structuring milestone roadmap...');
      const response = await assessGoalWithAI(baseline, aspiration, timeframe, userId);
      
      await new Promise(r => setTimeout(r, 600));
      setAiStatusMessage('Seeding high-signal topics for feed curation...');

      if (response) {
        // Save values in user local storage
        const setKey = (key, val) => {
          if (currentUser?.id) {
            localStorage.setItem(`synapse_user_${currentUser.id}_${key}`, val);
          }
          localStorage.setItem(`synapse_profile_${key}`, val);
        };

        localStorage.setItem('synapse_onboarding_completed', 'true');
        setKey('name', currentUser?.name || 'New User');
        setKey('role', baseline);
        setKey('aspiration', aspiration);
        setKey('baseline', baseline);
        setKey('timeframe', timeframe);
        setKey('streak', '1-Day Focus Streak');
        setKey('level', '1');
        setKey('xp', '0');
        setKey('focus_time', '0h 0m');
        setKey('focus_time_trend', '+0.0%');
        localStorage.setItem('synapse_focus_seconds_total', '0');
        localStorage.setItem('synapse_profile_focus_time_trend', '+0.0%');
        setKey('skills_verified', '0 Concepts');
        setKey('goal_velocity', '10%');
        setKey('vpm_index', '$0.00/min');

        // Dynamic results
        localStorage.setItem('synapse_user_feed_topics', JSON.stringify(response.initial_feed_topics));
        localStorage.setItem('synapse_user_roadmap', JSON.stringify(response.roadmap));
        localStorage.setItem('synapse_user_condition_vector', response.condition_vector);
        localStorage.setItem('synapse_user_target_vector', response.target_vector);

        // Backup compatibility
        localStorage.setItem('synapse_user_aspiration', aspiration);
        localStorage.setItem('aspiration', aspiration);

        // Trigger updates in background
        try {
          await saveUserProfileToBackend({
            user_id: userId,
            name: currentUser?.name || 'New User',
            role: baseline,
            aspiration: aspiration,
            email: currentUser?.email || 'new_user@synapse.ai',
            streak: '1-Day Focus Streak',
            level: '1',
            xp: '0',
            focus_time: '0h 0m',
            skills_verified: '0 Concepts',
            goal_velocity: '10%',
            vpm_index: '$0.00/min'
          });
        } catch (e) {
          console.warn('Backend saveUserProfileToBackend failed', e);
        }

        try {
          await saveAspirationToBackend({
            user_id: userId,
            aspiration: aspiration,
            target_timeline: timeframe,
            current_level: 'Initial'
          });
        } catch (e) {
          console.warn('Backend saveAspirationToBackend failed', e);
        }
        
        await new Promise(r => setTimeout(r, 600));
        setAiStatusMessage('Model configured & aligned successfully!');
        await new Promise(r => setTimeout(r, 400));

        // Notify other components about the aspiration and feed steering updates
        window.dispatchEvent(new Event('aspirationUpdated'));
        window.dispatchEvent(new Event('feedTopicsUpdated'));

        if (onAssessmentComplete) {
          onAssessmentComplete({
            name: currentUser?.name || 'New User',
            role: baseline,
            baseline,
            aspiration,
            timeframe,
            roadmap: response.roadmap,
            initial_feed_topics: response.initial_feed_topics
          });
        }
      }
    } catch (err) {
      console.error('Onboarding assessment failed:', err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl rounded-[2rem] border p-6 sm:p-8 shadow-2xl transition-all relative overflow-hidden ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-indigo-500/10' 
          : 'bg-white border-stone-200 text-stone-900 shadow-stone-400/30'
      }`}>
        {/* Glowing top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 p-0.5 shadow-md">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isDarkMode ? 'bg-slate-950 text-indigo-400' : 'bg-white text-indigo-650'
              }`}>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  Agentic Onboarding
                </span>
                <span className="text-xs font-mono font-bold text-stone-400">Step {step} of 3</span>
              </div>
              <h2 className="text-lg font-black tracking-tight mt-0.5">
                Steer Your Curated Learning Journey
              </h2>
            </div>
          </div>
        </div>

        {/* STEP 1: CURRENT BACKGROUND / BASELINE */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
              Please describe your current engineering experience or background baseline. This baseline will be analyzed by Google Gemini to identify prerequisites and start your trajectory custom roadmap.
            </p>

            <div>
              <label className={`block text-xs font-mono font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                Suggestions:
              </label>
              <div className="flex flex-col gap-2 mb-3">
                {BASELINE_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setBaseline(sug)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition cursor-pointer ${
                      baseline === sug
                        ? isDarkMode
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                          : 'bg-indigo-50 text-indigo-950 border-indigo-300 font-bold'
                        : isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <div className="relative mt-3">
                <Brain className="absolute left-3.5 top-3 w-4 h-4 text-indigo-500" />
                <textarea
                  value={baseline}
                  onChange={(e) => setBaseline(e.target.value)}
                  placeholder="Or type custom baseline..."
                  rows={2}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-stone-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold text-xs shadow-md hover:from-indigo-500 hover:to-teal-400 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Aspiration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TARGET ASPIRATION */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
              Define your primary target aspiration. Google Gemini will compile your milestones and generate 5 specialized feed steering topics to prioritize high-signal learning content.
            </p>

            <div>
              <label className={`block text-xs font-mono font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                Suggestions:
              </label>
              <div className="flex flex-col gap-2 mb-3">
                {ASPIRATION_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setAspiration(sug)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition cursor-pointer ${
                      aspiration === sug
                        ? isDarkMode
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                          : 'bg-indigo-50 text-indigo-950 border-indigo-300 font-bold'
                        : isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <div className="relative mt-3">
                <Target className="absolute left-3.5 top-3 w-4 h-4 text-indigo-500" />
                <textarea
                  value={aspiration}
                  onChange={(e) => setAspiration(e.target.value)}
                  placeholder="Or type custom target aspiration..."
                  rows={2}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrevStep}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold text-xs shadow-md hover:from-indigo-500 hover:to-teal-400 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Timeframe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TIMEFRAME */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
              Select your horizon target timeframe. The Gemini AI will adjust milestones durations and frequency of recommended skill modules to align with your commitment constraint.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TIMEFRAME_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setTimeframe(opt.label)}
                  className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    timeframe === opt.label
                      ? isDarkMode
                        ? 'border-teal-500 bg-teal-500/10 text-teal-300 shadow-md font-bold'
                        : 'border-teal-600 bg-teal-50 text-teal-950 font-bold'
                      : isDarkMode
                        ? 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Clock className="w-5 h-5 mb-1.5 text-teal-500" />
                  <span className="text-xs font-mono font-extrabold">{opt.label}</span>
                  <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-stone-500'}`}>{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrevStep}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-400 text-white font-bold text-xs shadow-lg hover:brightness-110 transition flex items-center gap-2 cursor-pointer"
              >
                <Rocket className="w-4 h-4 animate-bounce" />
                <span>Initialize AI Roadmap</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: GENERATING ASSESSMENT LOADING */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-10 gap-6 text-center animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-teal-400 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-md">
              <h3 className="text-lg font-black tracking-tight">
                Architecting Your Skill Trajectory
              </h3>
              <p className={`text-xs font-mono font-medium animate-pulse ${
                isDarkMode ? 'text-teal-300' : 'text-teal-700'
              }`}>
                {aiStatusMessage}
              </p>
            </div>

            <div className={`w-full max-w-sm h-2 rounded-full overflow-hidden border ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200'
            }`}>
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 animate-pulse animate-duration-1000" style={{ width: '85%' }} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
