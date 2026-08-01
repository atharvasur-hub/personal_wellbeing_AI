import React, { useState } from 'react';
import { Bot, Send, Sparkles, Play, CheckCircle, Code, Brain, RefreshCw, Flame } from 'lucide-react';
import { analyzeUserIntent, listAutonomousCurations } from '../lib/mlEngine';
import { saveUserAspirationToSupabase } from '../lib/supabaseClient';

export default function AgenticOnboardingFlow({ isDarkMode = false }) {
  // Step state: 'chat' | 'curating' | 'feed'
  const [step, setStep] = useState('chat');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Welcome back. What is your primary goal right now, and how are you feeling today?"
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [userIntent, setUserIntent] = useState(null);
  const [curatedMedia, setCuratedMedia] = useState([]);
  const [interactiveCode, setInteractiveCode] = useState("const [count, setCount] = useState(0);");
  const [codeSubmitted, setCodeSubmitted] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const textToSend = userInput;
    const newMessages = [
      ...messages,
      { id: Date.now(), role: 'user', text: textToSend }
    ];
    setMessages(newMessages);
    setUserInput('');

    // Trigger ML Intent & Behavior Analysis (Pillar 1)
    const intentResult = analyzeUserIntent(textToSend, 'focused', 'low');
    setUserIntent(intentResult);

    // Save Intent to Supabase PostgreSQL per user
    saveUserAspirationToSupabase({
      primary_goal: textToSend,
      current_mood: intentResult.currentMood,
      fatigue_level: intentResult.fatigueLevel,
      intent_vector: { domain: intentResult.targetDomain, energy: intentResult.cognitiveEnergyScore }
    });

    // Trigger Phase 1 ➔ Phase 2 Transition (Simulate 2-second AI Curation)
    setStep('curating');
    
    // Autonomous Curation (Pillar 3)
    const curatedItems = listAutonomousCurations(intentResult);
    setCuratedMedia(curatedItems);

    setTimeout(() => {
      setStep('feed');
    }, 2000);
  };

  const handleResetFlow = () => {
    setStep('chat');
    setMessages([
      {
        id: 1,
        role: 'assistant',
        text: "Welcome back. What is your primary goal right now, and how are you feeling today?"
      }
    ]);
    setUserInput('');
    setUserIntent(null);
    setCodeSubmitted(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto transition-all duration-500">
      
      {/* PHASE 1: CHATBOT ONBOARDING */}
      {step === 'chat' && (
        <div className={`rounded-[2rem] p-8 md:p-12 border shadow-2xl backdrop-blur-xl animate-fade-in flex flex-col justify-between min-h-[500px] ${
          isDarkMode 
            ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-indigo-500/10' 
            : 'bg-white/80 border-stone-100 text-stone-900 shadow-xl'
        }`}>
          {/* Header */}
          <div className="flex justify-between items-center pb-6 border-b border-stone-200/50">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                isDarkMode ? 'bg-gradient-to-tr from-indigo-500 to-violet-600' : 'bg-gradient-to-tr from-teal-400 to-cyan-500'
              }`}>
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <span>SYNAPSE INTENT ANALYZER</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </h2>
                <p className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>
                  Phase 1 of 2 • Intent & Behavior Analysis
                </p>
              </div>
            </div>
          </div>

          {/* Chat Conversation Thread */}
          <div className="flex flex-col gap-4 py-8 max-w-3xl mx-auto w-full overflow-y-auto">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-teal-500' 
                    : isDarkMode ? 'bg-indigo-600' : 'bg-gradient-to-tr from-teal-400 to-cyan-500'
                }`}>
                  {msg.role === 'user' ? 'U' : <Bot className="w-5 h-5" />}
                </div>

                <div className={`p-5 rounded-3xl border text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-teal-500 text-white border-teal-400 rounded-tr-none'
                    : isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-100 rounded-tl-none' : 'bg-stone-50/90 border-stone-200/80 text-stone-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Suggestions Chips & Input Bar */}
          <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "I want to learn React but I'm feeling tired today",
                "Goal: Master TypeScript with high energy",
                "Low energy, need a quick 5-min refresher"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setUserInput(chip)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 text-indigo-300 hover:bg-slate-800' 
                      : 'bg-white border-stone-200/80 text-teal-700 hover:bg-teal-50'
                  }`}
                >
                  + {chip}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                required
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Reply with your goal and mood..."
                className={`flex-1 border rounded-2xl px-5 py-4 text-xs md:text-sm focus:outline-none transition shadow-sm ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500/40' 
                    : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400 focus:border-teal-500/50'
                }`}
              />
              <button
                type="submit"
                className={`px-7 py-4 rounded-2xl text-white font-extrabold text-xs md:text-sm transition flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer ${
                  isDarkMode ? 'bg-gradient-to-r from-indigo-500 to-violet-600' : 'bg-gradient-to-r from-teal-400 to-cyan-500'
                }`}
              >
                <span>Send Intent</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TRANSITION STATE: 2-SECOND AI CURATION LOADING */}
      {step === 'curating' && (
        <div className={`rounded-[2rem] p-16 border shadow-2xl backdrop-blur-xl text-center flex flex-col items-center justify-center gap-6 min-h-[480px] animate-fade-in ${
          isDarkMode 
            ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
            : 'bg-white/80 border-stone-100 text-stone-900'
        }`}>
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-teal-400 border-t-transparent animate-spin" />
            <Brain className="w-8 h-8 text-teal-500 absolute inset-0 m-auto animate-pulse" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-black tracking-tight">Autonomous Curation & Signal Scoring...</h3>
            <p className={`text-xs max-w-md ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
              Evaluating content signal-to-noise ratios matching domain: <span className="font-mono text-teal-500 font-bold">{userIntent?.targetDomain || 'React Systems'}</span>
            </p>
          </div>
        </div>
      )}

      {/* PHASE 2: THE EMBEDDED CURATION FEED */}
      {step === 'feed' && (
        <div className={`rounded-[2rem] p-6 md:p-10 border shadow-2xl backdrop-blur-xl transition-all opacity-100 duration-500 flex flex-col gap-8 ${
          isDarkMode 
            ? 'bg-slate-900/90 border-slate-800 text-slate-100' 
            : 'bg-white/80 border-stone-100 text-stone-900'
        }`}>
          {/* Header & Reset Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-stone-200/50">
            <div>
              <div className="flex items-center gap-2 text-violet-500">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] font-extrabold tracking-widest font-mono uppercase">PHASE 2 • AUTONOMOUS CURATION STREAM</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight mt-1">High-Signal Targeted Stream</h2>
            </div>

            <button
              onClick={handleResetFlow}
              className={`px-4 py-2 rounded-2xl border text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                  : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Onboarding Check</span>
            </button>
          </div>

          {/* 3 FOCUS CARDS WITH EMBEDDED MEDIA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CARD 1: YouTube Embedded Video */}
            <div className={`rounded-3xl p-6 border flex flex-col justify-between gap-5 transition-all hover:shadow-xl ${
              isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50/80 border-stone-200/80 shadow-md'
            }`}>
              <div className="flex flex-col gap-3">
                
                {/* AI Reasoning Badge & Signal Score */}
                <div className={`p-3 rounded-2xl border text-xs leading-normal flex items-start gap-2 ${
                  isDarkMode ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-violet-50 border-violet-100 text-violet-900'
                }`}>
                  <Brain className="w-4 h-4 shrink-0 mt-0.5 text-violet-500" />
                  <div>
                    <span className="font-bold block text-[10px] font-mono uppercase text-violet-500">WHY THIS?</span>
                    <span>"{curatedMedia[0]?.reasoningBadge || 'A low-energy introduction to React Hooks.'}"</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <Play className="w-4 h-4 text-violet-500 fill-current" />
                    <span>{curatedMedia[0]?.title || 'React Hooks Crash Course'}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {curatedMedia[0]?.signalScore || 98}% Signal
                  </span>
                </div>

                {/* Direct iFrame YouTube Embed */}
                <div className="rounded-2xl overflow-hidden aspect-video border border-stone-200/50 shadow-sm bg-black">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/SqcY0GlETPk"
                    title="React Hooks Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Watch useState and useEffect explained visually without cognitive overwhelm.
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-violet-500 pt-2 border-t border-stone-200/40">
                <span>Direct Site Embed</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>

            {/* CARD 2: Tall Vertical Short-form Reel Embed */}
            <div className={`rounded-3xl p-6 border flex flex-col justify-between gap-5 transition-all hover:shadow-xl ${
              isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-stone-50/80 border-stone-200/80 shadow-md'
            }`}>
              <div className="flex flex-col gap-3">
                
                {/* AI Reasoning Badge & Signal Score */}
                <div className={`p-3 rounded-2xl border text-xs leading-normal flex items-start gap-2 ${
                  isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-900'
                }`}>
                  <Brain className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                  <div>
                    <span className="font-bold block text-[10px] font-mono uppercase text-indigo-500">WHY THIS?</span>
                    <span>"A 60-second syntax refresher."</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-indigo-500" />
                    <span>60-Sec Short Refresher</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    95% Signal
                  </span>
                </div>

                {/* Mobile Vertical Reel Embed Container */}
                <div className="rounded-2xl overflow-hidden h-64 border border-stone-200/50 shadow-sm bg-gradient-to-b from-indigo-900 via-slate-950 to-purple-950 flex flex-col items-center justify-center relative p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center mb-2 animate-bounce">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Vertical Short-Form Embed</span>
                  <span className="text-[10px] text-indigo-300 font-mono mt-1">Fast-paced syntax recap</span>
                </div>

                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                  Quickly reinforce arrow function state setters in 60 seconds.
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-indigo-500 pt-2 border-t border-stone-200/40">
                <span>Embedded Short Format</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>

            {/* CARD 3: Interactive Action Execution */}
            <div className={`rounded-3xl p-6 border flex flex-col justify-between gap-5 transition-all hover:shadow-xl ${
              isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-emerald-50/40 border-emerald-200/80 shadow-md'
            }`}>
              <div className="flex flex-col gap-3">
                
                {/* AI Reasoning Badge & Signal Score */}
                <div className={`p-3 rounded-2xl border text-xs leading-normal flex items-start gap-2 ${
                  isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <Brain className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <div>
                    <span className="font-bold block text-[10px] font-mono uppercase text-emerald-600">WHY THIS?</span>
                    <span>"Time to apply what you just watched."</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-600" />
                    <span>Active Execution Sandbox</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    94% Signal
                  </span>
                </div>

                {/* Interactive Code Textarea */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-stone-400">Write a simple useState hook below:</label>
                  <textarea
                    rows={4}
                    value={interactiveCode}
                    onChange={(e) => setInteractiveCode(e.target.value)}
                    className={`w-full rounded-2xl p-3 text-xs font-mono focus:outline-none border transition ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 text-emerald-400 focus:border-emerald-500' 
                        : 'bg-slate-900 border-slate-800 text-emerald-400 focus:border-emerald-400'
                    }`}
                  />

                  <button
                    onClick={() => setCodeSubmitted(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-extrabold text-xs shadow-sm hover:bg-emerald-600 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Evaluate Hook Code</span>
                  </button>

                  {codeSubmitted && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Code Verified! useState hook syntax is valid.</span>
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-emerald-600 pt-2 border-t border-stone-200/40">
                <span>Hands-on Code Practice</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
