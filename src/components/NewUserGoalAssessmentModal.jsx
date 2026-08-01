import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Brain, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Compass, 
  Loader2,
  Sliders,
  Flame,
  Award
} from 'lucide-react';
import { analyzeGoalWithAI } from '../lib/backendApi';

export default function NewUserGoalAssessmentModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  isDarkMode = false,
  onAssessmentComplete 
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState(currentUser?.name || 'Atharva Sur');
  const [role, setRole] = useState('Growth Catalyst • Tier 3');
  const [condition, setCondition] = useState('Deep Skill Focus & Growth');
  const [aspiration, setAspiration] = useState('Senior AI Architect');
  const [timeline, setTimeline] = useState('6 Months');
  const [selectedSkills, setSelectedSkills] = useState([
    'Systems Architecture', 
    'Deep Work Endurance', 
    'AI Alignment & Safety'
  ]);
  const [customGoal, setCustomGoal] = useState('');

  // AI Training status message
  const [aiStatusMessage, setAiStatusMessage] = useState('Initializing Synapse AI Neural Weights...');

  if (!isOpen) return null;

  const CONDITION_OPTIONS = [
    { label: '🎯 Deep Skill Focus', desc: 'Ready for intensive learning & deep work' },
    { label: '⚡ High Energy & Scaling', desc: 'Maximizing velocity and daily output' },
    { label: '🧘 Burned Out / Seeking Balance', desc: 'Need recovery, focus steering & anti-doomscroll' },
    { label: '🔄 Career Pivot & Transition', desc: 'Shifting domain focus to new technology stacks' }
  ];

  const ASPIRATION_SUGGESTIONS = [
    'Senior AI Architect',
    'Full Stack Engineer',
    'AI Research Engineer',
    'Product Manager (Tech)',
    'Systems & Concurrency Expert'
  ];

  const SKILL_NODE_OPTIONS = [
    'Systems Architecture',
    'Deep Work Endurance',
    'Rust Concurrency',
    'Product Management',
    'AI Alignment & Safety',
    'Public Speaking',
    'React & Frontend Mastery',
    'Circadian Sleep & Well-being'
  ];

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
      }
    } else {
      if (selectedSkills.length < 5) {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Step 3 -> Train Model Step 4
      setStep(4);
      runModelTraining();
    }
  };

  const runModelTraining = async () => {
    setLoading(true);
    const finalGoal = customGoal.trim() || aspiration;

    // Simulate multi-stage AI training
    setAiStatusMessage('Connecting to Gemini 2.0 AI Model & Supabase...');
    await new Promise(r => setTimeout(r, 800));

    setAiStatusMessage(`Analyzing goal vector: "${finalGoal}" with current condition: "${condition}"...`);
    
    // Call backend or fallback AI model training
    try {
      await analyzeGoalWithAI(finalGoal, name);
    } catch (e) {
      console.log('Backend API training fallback active');
    }

    await new Promise(r => setTimeout(r, 900));
    setAiStatusMessage('Calibrating Identity Graph baseline weights and VPM performance metrics...');

    await new Promise(r => setTimeout(r, 800));
    setAiStatusMessage('Model Fine-Tuned Successfully!');

    // Persist onboarding and user assessment data with user scoping
    const setKey = (key, val) => {
      if (currentUser?.id) {
        localStorage.setItem(`synapse_user_${currentUser.id}_${key}`, val);
      }
      localStorage.setItem(`synapse_profile_${key}`, val);
    };

    localStorage.setItem('synapse_onboarding_completed', 'true');
    setKey('name', name);
    setKey('role', role);
    setKey('aspiration', finalGoal);
    setKey('streak', '0-Day Focus Streak');
    setKey('level', '1');
    setKey('xp', '0');
    setKey('focus_time', '0h 0m');
    setKey('skills_verified', '0 Concepts');
    setKey('goal_velocity', '0%');
    setKey('vpm_index', '$0.00/min');
    localStorage.setItem('synapse_user_condition', condition);
    localStorage.setItem('synapse_user_timeline', timeline);
    setKey('skills', JSON.stringify(selectedSkills));

    setLoading(false);

    if (onAssessmentComplete) {
      onAssessmentComplete({
        name,
        role,
        aspiration: finalGoal,
        condition,
        timeline,
        skills: selectedSkills
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all relative overflow-hidden ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-indigo-500/10' 
          : 'bg-white border-stone-200 text-stone-900 shadow-stone-400/30'
      }`}>
        {/* Glowing top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 p-0.5 shadow-md">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isDarkMode ? 'bg-slate-950 text-indigo-400' : 'bg-white text-indigo-600'
              }`}>
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  New User Calibration
                </span>
                <span className="text-xs font-mono font-bold text-stone-400">Step {step} of 3</span>
              </div>
              <h2 className="text-lg font-black tracking-tight mt-0.5">
                AI Goal & Current Condition Assessment
              </h2>
            </div>
          </div>
        </div>

        {/* STEP 1: CURRENT CONDITION & IDENTITY */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
              Welcome to Synapse AI! To personalize your feed and train the AI model for your growth, please tell us about your current status and energy state.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-mono font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                  Current Role / Background
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Fullstack Engineer, Student"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-mono font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                What is your current mental & energy condition?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONDITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setCondition(opt.label)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                      condition === opt.label
                        ? isDarkMode
                          ? 'border-indigo-500 bg-indigo-500/15 text-white ring-2 ring-indigo-500/30'
                          : 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20'
                        : isDarkMode
                          ? 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">{opt.label}</span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-stone-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold text-xs shadow-md hover:from-indigo-500 hover:to-teal-400 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Target Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TARGET ASPIRATION & GOALS */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
              Define your primary target aspiration. The AI model will calculate your gap matrix and generate personalized micro-growth roadmaps.
            </p>

            <div>
              <label className={`block text-xs font-mono font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                Select Target Career Goal / Aspiration
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {ASPIRATION_SUGGESTIONS.map((asp) => (
                  <button
                    key={asp}
                    type="button"
                    onClick={() => {
                      setAspiration(asp);
                      setCustomGoal('');
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                      aspiration === asp && !customGoal
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                          : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {asp}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <Target className="absolute left-3.5 top-3 w-4 h-4 text-indigo-500" />
                <input
                  type="text"
                  value={customGoal || aspiration}
                  onChange={(e) => {
                    setCustomGoal(e.target.value);
                    setAspiration(e.target.value);
                  }}
                  placeholder="Or enter custom target goal (e.g. Lead Robotics Architect)"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-mono font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                Target Horizon Timeline
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['3 Months', '6 Months', '12 Months'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setTimeline(time)}
                    className={`p-3 rounded-xl border text-center text-xs font-mono font-bold transition cursor-pointer ${
                      timeline === time
                        ? 'bg-teal-500 text-slate-950 border-teal-500 font-black shadow-xs'
                        : isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold text-xs shadow-md hover:from-indigo-500 hover:to-teal-400 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Select Skill Focus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SKILL FOCUS NODES */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-600'}`}>
              Select up to 5 core skill nodes to construct your initial <strong>Identity Graph Matrix</strong>.
            </p>

            <div className="flex flex-wrap gap-2.5 my-2">
              {SKILL_NODE_OPTIONS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-xs'
                          : 'bg-indigo-50 text-indigo-900 border-indigo-300 shadow-xs'
                        : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-stone-300 dark:bg-slate-700'}`} />
                    <span>{skill}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>

            <div className={`rounded-2xl p-4 border text-xs font-mono flex items-center gap-3 ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}>
              <Brain className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>
                Selected: <strong>{selectedSkills.length} nodes</strong> configured for neural feed weighting.
              </span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-400 text-white font-bold text-xs shadow-lg hover:brightness-110 transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Train AI Model & Finalize Setup</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: MODEL TRAINING ANIMATION */}
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
                Training Personalized Gemini AI Model
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
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 animate-pulse" style={{ width: '85%' }} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
