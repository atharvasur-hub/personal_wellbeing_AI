import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  Cpu, 
  Award, 
  Zap, 
  Play, 
  ChevronRight, 
  RefreshCw,
  Info,
  Sparkles,
  Flame,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  HelpCircle as HintIcon,
  Shield,
  Smile
} from 'lucide-react';
import { askDeepSkillQA, submitDeepSkillQuizAnswer } from '../lib/backendApi';

// Dynamic domain calibration configurations mapped to goals
const GOAL_DOMAINS = {
  vlsi: [
    { name: 'Digital Logic Foundations', difficulty: 'Basic', levelKey: 'lvl_digital_logic', desc: 'Boolean algebra, gates, combinational logic & state machines.' },
    { name: 'Verilog RTL Development', difficulty: 'Intermediate', levelKey: 'lvl_verilog', desc: 'Hardware description languages, timing models & testbenches.' },
    { name: 'FPGA Design & Synthesizers', difficulty: 'Intermediate', levelKey: 'lvl_fpga', desc: 'Timing analysis, synthesis constraints, physical layout routing.' },
    { name: 'VLSI Design & System-on-Chip', difficulty: 'Advanced', levelKey: 'lvl_vlsi', desc: 'CMOS transistors, dynamic layouts, floorplanning & clock trees.' },
    { name: 'Computer Architecture & RISC-V', difficulty: 'Advanced', levelKey: 'lvl_comp_arch', desc: 'Pipelined execution, out-of-order schedulers & memory hierarchies.' }
  ],
  frontend: [
    { name: 'Modern ES6+ Javascript & DOM', difficulty: 'Basic', levelKey: 'lvl_js_basics', desc: 'Closures, prototype chains, event loop & DOM APIs.' },
    { name: 'React Architecture & Hooks', difficulty: 'Intermediate', levelKey: 'lvl_react_core', desc: 'State synchronization, custom hooks, context & concurrent rendering.' },
    { name: 'Web Performance Optimization', difficulty: 'Intermediate', levelKey: 'lvl_web_perf', desc: 'Lighthouse metrics, code-splitting, bundle profiling & tree shaking.' },
    { name: 'Browser Rendering Internals', difficulty: 'Advanced', levelKey: 'lvl_rendering_internals', desc: 'Critical rendering path, layout reflows, paint containment & composites.' },
    { name: 'Frontend Security & CSP/XSS Defenses', difficulty: 'Advanced', levelKey: 'lvl_fe_security', desc: 'Cross-site scripting, CSRF protections, secure cookie management.' }
  ],
  ai_ml: [
    { name: 'Linear Algebra & Calculus', difficulty: 'Basic', levelKey: 'lvl_math', desc: 'Matrices, backpropagation, eigenvalues, partial gradients.' },
    { name: 'Supervised Learning & PyTorch', difficulty: 'Intermediate', levelKey: 'lvl_pytorch', desc: 'Deep networks, autograd mechanics, loss functions & optimizers.' },
    { name: 'Transformer & Attention Mechanisms', difficulty: 'Advanced', levelKey: 'lvl_transformers', desc: 'Self-attention scales, positional encoders, causal masking.' },
    { name: 'LLM Fine-Tuning & Quantization', difficulty: 'Advanced', levelKey: 'lvl_llm_ops', desc: 'LoRA, QLoRA adapters, perplexity evaluation, parameter scaling.' },
    { name: 'AI Alignment & Bias Mitigation', difficulty: 'Advanced', levelKey: 'lvl_ai_safety', desc: 'Value alignment principles, red-teaming & jailbreak defenses.' }
  ],
  default: [
    { name: 'Algorithms & Big-O Complexity', difficulty: 'Basic', levelKey: 'lvl_algo', desc: 'Asymptotic notation, basic searches, sorting & recursion.' },
    { name: 'Data Structures (Trees & Graphs)', difficulty: 'Intermediate', levelKey: 'lvl_ds', desc: 'Heaps, BST, hash tables, graph traversals (BFS/DFS).' },
    { name: 'System Design & High Availability', difficulty: 'Intermediate', levelKey: 'lvl_sys_design', desc: 'Sharding, CDNs, load balancers & caching architectures.' },
    { name: 'Concurrency & Systems Sprints', difficulty: 'Advanced', levelKey: 'lvl_concurrency', desc: 'Semaphores, multithreading, mutexes & deadlock avoidance.' },
    { name: 'Distributed Consensus & Replication', difficulty: 'Advanced', levelKey: 'lvl_distributed', desc: 'Raft consensus, Paxos models, split-brain resolution & quorums.' }
  ]
};

// Positive and supportive comments for incorrect answers
const ENCOURAGING_FEEDBACKS = [
  "🌱 Brilliant path, but not quite the matching logic! Let's redirect our synapse and try another option.",
  "💡 Beautiful guess! This actually expands your understanding of details. Give it another shot!",
  "🚀 Synapse re-routing! Your learning model is adapting right now. Pick another path!",
  "🌈 Excellent deduction try! Every step closer brings clarity. Try one of the other options!",
  "🛡️ Streak shielded! We have blocked any penalties. Let's select another candidate answer!"
];

// Fun status reactions based on correct responses
const CONGRATS_REACTIONS = [
  "🎉 Outstanding calibration! You matched the concept perfectly!",
  "🧠 Synaptic coherence achieved! You mastered this node!",
  "🔮 Brilliant recall velocity! The model is fully optimized!",
  "⚡ Knowledge verified! Your learning efficiency is climbing!",
  "🌟 Aspiration unlocked! A beautiful step towards your ultimate goal!"
];

export default function VerifiedSkillsActiveRecall({ 
  isDarkMode = false, 
  currentUser 
}) {
  const userId = currentUser?.id || 'usr_default';

  // Dynamic domains selection based on aspiration
  const [selectedGoalType, setSelectedGoalType] = useState('default');
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  
  // Quiz states
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  
  // Adaptive Multi-choice selections
  const [failedOptions, setFailedOptions] = useState([]); // Track options clicked that were wrong
  const [selectedOption, setSelectedOption] = useState(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [attemptsUsed, setAttemptsUsed] = useState(0);

  const [boosterMode, setBoosterMode] = useState('Turbo'); // 'Turbo', 'Shield', 'Zen'
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [streak, setStreak] = useState(0);

  // Level trackers
  const [domainProgress, setDomainProgress] = useState({});

  // Core metrics
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [neuralAccuracy, setNeuralAccuracy] = useState('85.4%');
  const [neuralLoss, setNeuralLoss] = useState('0.145');
  const [epochs, setEpochs] = useState(12);

  // Load user aspiration & determine domain map
  useEffect(() => {
    const aspiration = localStorage.getItem('synapse_profile_aspiration') || currentUser?.aspiration || '';
    const cleanAsp = aspiration.toLowerCase();
    
    let goalType = 'default';
    if (cleanAsp.includes('vlsi') || cleanAsp.includes('hardware') || cleanAsp.includes('silicon') || cleanAsp.includes('architecture')) {
      goalType = 'vlsi';
    } else if (cleanAsp.includes('react') || cleanAsp.includes('frontend') || cleanAsp.includes('web') || cleanAsp.includes('ui')) {
      goalType = 'frontend';
    } else if (cleanAsp.includes('ai') || cleanAsp.includes('ml') || cleanAsp.includes('machine') || cleanAsp.includes('learning') || cleanAsp.includes('deep')) {
      goalType = 'ai_ml';
    }
    
    setSelectedGoalType(goalType);
    const selectedDomains = GOAL_DOMAINS[goalType];
    setDomains(selectedDomains);
    setSelectedDomain(selectedDomains[0]);

    // Load domain levels & progress
    const prog = {};
    selectedDomains.forEach(dom => {
      const savedLvl = parseInt(localStorage.getItem(`synapse_calibration_level_${dom.levelKey}`) || '1', 10);
      const savedXp = parseInt(localStorage.getItem(`synapse_calibration_xp_${dom.levelKey}`) || '0', 10);
      prog[dom.levelKey] = { level: savedLvl, xp: savedXp };
    });
    setDomainProgress(prog);

    // General stats
    const displaySkillsCount = localStorage.getItem('synapse_profile_skills_verified') || '0 Concepts';
    setVerifiedCount(parseInt(displaySkillsCount.split(' ')[0]) || 0);

    setNeuralAccuracy(localStorage.getItem('synapse_neural_accuracy') || '85.4%');
    setNeuralLoss(localStorage.getItem('synapse_neural_loss') || '0.145');
    setEpochs(parseInt(localStorage.getItem('synapse_neural_epochs') || '12', 10));
    setStreak(parseInt(localStorage.getItem('synapse_calibration_streak') || '0', 10));
  }, [currentUser]);

  const handleStartQuiz = async () => {
    if (!selectedDomain) return;
    setLoadingQuiz(true);
    setActiveQuiz(null);
    setSelectedOption(null);
    setFailedOptions([]);
    setSupportMessage('');
    setAttemptsUsed(0);
    setQuizSubmitted(false);
    setQuizResult(null);

    const domProg = domainProgress[selectedDomain.levelKey] || { level: 1, xp: 0 };
    const difficultyLevel = selectedDomain.difficulty;

    try {
      const res = await askDeepSkillQA(
        selectedDomain.name, 
        `Generate an interactive multiple-choice question verifying my concept mastery at Calibration level: ${domProg.level} (${difficultyLevel}). Make the question challenging, interesting, and technical.`,
        [], 
        userId
      );
      if (res && res.quiz_challenge) {
        setActiveQuiz({
          skill: selectedDomain.name,
          levelKey: selectedDomain.levelKey,
          question: res.quiz_challenge.question,
          options: res.quiz_challenge.options,
          correctOption: res.quiz_challenge.correct_option,
          explanation: res.quiz_challenge.explanation,
          answerText: res.answer
        });
      }
    } catch (err) {
      console.error('Failed to retrieve dynamic quiz challenge:', err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Option select handler - provides support instead of immediate failure
  const handleOptionClick = (idx) => {
    if (quizSubmitted) return;
    setSelectedOption(idx);

    const isCorrect = idx === activeQuiz.correctOption;

    if (!isCorrect) {
      // If incorrect, add to failed list, show encouraging message, and keep going
      setFailedOptions(prev => [...prev, idx]);
      setAttemptsUsed(prev => prev + 1);
      
      const randomEncouragement = ENCOURAGING_FEEDBACKS[Math.floor(Math.random() * ENCOURAGING_FEEDBACKS.length)];
      setSupportMessage(randomEncouragement);
    } else {
      // Correct! Trigger final submission
      handleCorrectAnswer(idx);
    }
  };

  const handleCorrectAnswer = async (idx) => {
    setLoadingQuiz(true);
    try {
      const res = await submitDeepSkillQuizAnswer(
        activeQuiz.skill,
        activeQuiz.question,
        idx,
        activeQuiz.correctOption,
        userId
      );

      if (res) {
        setQuizSubmitted(true);

        // Positive XP scaling - never penalize or subtract XP
        let baseXP = 50;
        let xpGained = baseXP;

        // Apply booster boosts
        if (boosterMode === 'Turbo') {
          // Double XP if gotten on first try
          xpGained = attemptsUsed === 0 ? baseXP * 2 : baseXP;
        } else if (boosterMode === 'Zen') {
          // Flat constant comfortable XP
          xpGained = 60;
        } else {
          // Shield mode
          xpGained = attemptsUsed === 0 ? 80 : 40;
        }

        // Apply global XP increments
        const currentXP = parseInt(localStorage.getItem('synapse_profile_xp') || '0', 10);
        const nextXP = currentXP + xpGained;
        localStorage.setItem('synapse_profile_xp', nextXP.toString());
        if (currentUser?.id) {
          localStorage.setItem(`synapse_user_${currentUser.id}_xp`, nextXP.toString());
        }

        // Streak tracker (Never goes down, stays or increments!)
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        localStorage.setItem('synapse_calibration_streak', nextStreak.toString());

        // Concept verified updates
        const nextCount = verifiedCount + 1;
        setVerifiedCount(nextCount);
        localStorage.setItem('synapse_profile_skills_verified', `${nextCount} Concepts`);
        if (currentUser?.id) {
          localStorage.setItem(`synapse_user_${currentUser.id}_skills_verified`, `${nextCount} Concepts`);
        }

        // Update Specific Domain Level / Progress
        const currentProg = domainProgress[activeQuiz.levelKey] || { level: 1, xp: 0 };
        const addedDomainXp = attemptsUsed === 0 ? 40 : 25; // Always progress!
        
        let newDomainXp = currentProg.xp + addedDomainXp;
        let newLevel = currentProg.level;
        let levelUpTriggered = false;

        if (newDomainXp >= 100) {
          newLevel += 1;
          newDomainXp = newDomainXp % 100;
          levelUpTriggered = true;
        }

        const updatedProg = {
          ...domainProgress,
          [activeQuiz.levelKey]: { level: newLevel, xp: newDomainXp }
        };
        setDomainProgress(updatedProg);
        localStorage.setItem(`synapse_calibration_level_${activeQuiz.levelKey}`, newLevel.toString());
        localStorage.setItem(`synapse_calibration_xp_${activeQuiz.levelKey}`, newDomainXp.toString());

        // Update Neural accuracy
        const nextAccuracy = Math.min(99.9, parseFloat(neuralAccuracy) + 0.6).toFixed(1) + '%';
        const nextLoss = Math.max(0.01, parseFloat(neuralLoss) - 0.009).toFixed(3);
        const nextEpochs = epochs + 1;

        setNeuralAccuracy(nextAccuracy);
        setNeuralLoss(nextLoss);
        setEpochs(nextEpochs);

        localStorage.setItem('synapse_neural_accuracy', nextAccuracy);
        localStorage.setItem('synapse_neural_loss', nextLoss.toString());
        localStorage.setItem('synapse_neural_epochs', nextEpochs.toString());

        const congratsReaction = CONGRATS_REACTIONS[Math.floor(Math.random() * CONGRATS_REACTIONS.length)];

        setQuizResult({
          xpGained,
          levelUpTriggered,
          newLevel,
          reactionText: congratsReaction,
          explanation: activeQuiz.explanation
        });

        // Trigger updates globally
        window.dispatchEvent(new Event('aspirationUpdated'));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Maps level numbers to titles
  const getLevelTitle = (lvl) => {
    if (lvl === 1) return 'Lvl 1 - Novice';
    if (lvl === 2) return 'Lvl 2 - Apprentice';
    if (lvl === 3) return 'Lvl 3 - Specialist';
    if (lvl === 4) return 'Lvl 4 - Expert';
    return `Lvl ${lvl} - Grandmaster`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in">
      
      {/* Top gamified header strip */}
      <div className={`rounded-3xl p-5 border flex flex-col sm:flex-row justify-between items-center gap-4 ${
        isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20 text-slate-100' : 'bg-indigo-50/50 border-indigo-100 text-indigo-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight uppercase flex items-center gap-1.5">
              <span>Cognitive Calibration Arena</span>
              <Smile className="w-5 h-5 text-indigo-400" />
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-indigo-300' : 'text-indigo-755'} font-medium`}>
              Happy & positive concept check. No failures, no penalties — only pathways to mastery!
            </p>
          </div>
        </div>

        {/* Streak Counter Badge */}
        <div className="flex items-center gap-2.5">
          {streak > 0 && (
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border text-xs font-mono font-black ${
              isDarkMode 
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                : 'bg-amber-50 border-amber-200 text-amber-800 shadow-xs'
            }`}>
              <Flame className="w-4.5 h-4.5 text-amber-500 animate-bounce" />
              <span>{streak} SPRINT STREAK</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Card 1: Verified Concepts */}
        <div className={`rounded-3xl border p-5 relative overflow-hidden transition-all shadow-sm ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-indigo-500/5' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-indigo-500">Verified Skills</span>
            <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black font-mono">{verifiedCount}</h3>
            <span className="text-xs font-bold text-indigo-500">Concepts</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2 font-medium">Verified via active recall space quizzes.</p>
        </div>

        {/* Card 2: Neural Net Accuracy */}
        <div className={`rounded-3xl border p-5 relative overflow-hidden transition-all shadow-sm ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-500">Model Accuracy</span>
            <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black font-mono">{neuralAccuracy}</h3>
            <span className="text-xs font-bold text-emerald-500">Fit</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2 font-medium">Neural embedding calibration level.</p>
        </div>

        {/* Card 3: Model Loss */}
        <div className={`rounded-3xl border p-5 relative overflow-hidden transition-all shadow-sm ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500/10 blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-500">Loss Entropy</span>
            <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black font-mono">{neuralLoss}</h3>
            <span className="text-xs font-bold text-amber-500">Epoch {epochs}</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2 font-medium">Cognitive entropy remaining weight.</p>
        </div>

      </div>

      {/* Main interactive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Domain Selector Side Card */}
        <div className={`rounded-3xl border p-5 flex flex-col gap-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div>
            <h3 className="text-sm font-black tracking-tight uppercase">Select Topic / Domain</h3>
            <p className="text-xs text-stone-400 mt-1">Select a milestone node matching your aspiration goal.</p>
          </div>

          <div className="flex flex-col gap-2">
            {domains.map((dom) => {
              const isSelected = selectedDomain?.levelKey === dom.levelKey;
              const curProg = domainProgress[dom.levelKey] || { level: 1, xp: 0 };
              
              let badgeColor = '';
              if (dom.difficulty === 'Basic') badgeColor = isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-100';
              else if (dom.difficulty === 'Intermediate') badgeColor = isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-100';
              else badgeColor = isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-105';

              return (
                <button
                  key={dom.levelKey}
                  onClick={() => {
                    setSelectedDomain(dom);
                    setActiveQuiz(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-indigo-500/15 border-indigo-500/60 text-indigo-300 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-indigo-50/50 border-indigo-200 text-indigo-850 shadow-xs'
                      : isDarkMode
                        ? 'bg-slate-950 border-slate-800/85 text-slate-350 hover:bg-slate-800'
                        : 'bg-stone-50 border-stone-150 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-extrabold">{dom.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                      {dom.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                    <span>{getLevelTitle(curProg.level)}</span>
                    <span>{curProg.xp}% calibrated</span>
                  </div>

                  {/* Level Calibration mini progress bar */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-150 border-stone-200/50'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r from-indigo-500 to-teal-400`}
                      style={{ width: `${curProg.xp}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={loadingQuiz || !selectedDomain}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500 text-white font-extrabold text-xs shadow-md hover:scale-[1.01] transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loadingQuiz ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current animate-pulse" />
            )}
            <span>Generate Recall Challenge</span>
          </button>
        </div>

        {/* Right Active Quiz Interface Area */}
        <div className="lg:col-span-2">
          
          {loadingQuiz && !activeQuiz && (
            <div className={`rounded-3xl border p-12 flex flex-col items-center justify-center gap-4 text-center ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="flex flex-col gap-1 mt-2">
                <h4 className="text-sm font-black">Generating Adaptive Challenge</h4>
                <p className="text-xs text-stone-400">Gemini AI is parsing target levels to render a custom active recall question...</p>
              </div>
            </div>
          )}

          {!loadingQuiz && !activeQuiz && (
            <div className={`rounded-3xl border p-12 flex flex-col items-center justify-center gap-4 text-center ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-950 border-slate-850 text-indigo-400' : 'bg-indigo-50 border-indigo-105 text-indigo-750'}`}>
                <HelpCircle className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h4 className="text-sm font-black">Ready for Concept Calibration</h4>
                <p className="text-xs text-stone-400">Select a skill domain from the left list. Customize your parameters, then initiate your active recall sprint.</p>
              </div>
            </div>
          )}

          {activeQuiz && (
            <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col gap-6 animate-fade-in ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-105 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    Concept Calibration Sprint
                  </span>
                  <span className="text-[9px] font-bold text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Shield Active
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-400">
                  Calibration Level: {getLevelTitle((domainProgress[activeQuiz.levelKey] || { level: 1 }).level)}
                </span>
              </div>

              {/* Question */}
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-extrabold leading-snug">{activeQuiz.question}</h4>
              </div>

              {/* Encouragement / Supportive Message Banner */}
              {supportMessage && !quizSubmitted && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 animate-fade-in ${
                  isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-900'
                }`}>
                  <Smile className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{supportMessage}</span>
                </div>
              )}

              {/* Options */}
              <div className="flex flex-col gap-3">
                {activeQuiz.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isFailed = failedOptions.includes(idx);
                  const isCorrect = idx === activeQuiz.correctOption;

                  let optStyle = isDarkMode
                    ? 'bg-slate-950 border-slate-850 hover:bg-slate-800 text-slate-350'
                    : 'bg-stone-50 border-stone-150 hover:bg-stone-100 text-stone-700';

                  if (isFailed) {
                    optStyle = isDarkMode
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-400/70 cursor-not-allowed opacity-50'
                      : 'bg-amber-50/50 border-amber-200 text-amber-700/70 cursor-not-allowed opacity-60';
                  } else if (isSelected && !quizSubmitted) {
                    optStyle = isDarkMode 
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold shadow-md'
                      : 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-xs';
                  } else if (quizSubmitted) {
                    if (isCorrect) {
                      optStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold border-2';
                    } else {
                      optStyle = 'opacity-30';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isFailed && handleOptionClick(idx)}
                      disabled={isFailed || quizSubmitted}
                      className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  );
                })}
              </div>

              {/* Supportive Calibration Booster Mode Details */}
              {!quizSubmitted && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold font-mono uppercase text-stone-400 tracking-wider">
                    Choose Boost Mode (Always Positive!):
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'Turbo', label: '⚡ Turbo Power', benefit: '+100 XP first-try / +50 XP fallback' },
                      { key: 'Shield', label: '🛡️ Safe Shield', benefit: '+80 XP first-try / +40 XP fallback' },
                      { key: 'Zen', label: '🧘 Zen Flow', benefit: 'Flat constant +60 XP' }
                    ].map(choice => (
                      <button
                        key={choice.key}
                        onClick={() => setBoosterMode(choice.key)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          boosterMode === choice.key
                            ? isDarkMode
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                              : 'bg-indigo-50 border-indigo-250 text-indigo-800 font-bold'
                            : isDarkMode
                              ? 'bg-slate-950 border-slate-850 text-slate-400'
                              : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        <div className="text-xs font-extrabold">{choice.label}</div>
                        <div className="text-[8px] font-mono mt-0.5 text-stone-400">{choice.benefit}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit / Result block */}
              {quizSubmitted && (
                <div className={`p-5 rounded-2xl border flex flex-col gap-4 animate-fade-in bg-emerald-500/10 border-emerald-500/20 text-emerald-500`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 animate-bounce" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        CALIBRATION SUCCESSFULLY COMPLETED!
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-md">
                      +{quizResult.xpGained} XP Boosted
                    </span>
                  </div>

                  <p className="text-xs font-extrabold italic mt-1 text-stone-850 dark:text-slate-100">
                    {quizResult.reactionText}
                  </p>

                  {quizResult.levelUpTriggered && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-450 text-slate-900 text-xs font-black uppercase flex items-center gap-2 animate-bounce">
                      <Sparkles className="w-4 h-4" />
                      <span>LEVEL UP! {activeQuiz.skill} rank increased to level {quizResult.newLevel}!</span>
                    </div>
                  )}

                  <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-350' : 'text-stone-700'}`}>
                    {quizResult.explanation}
                  </p>
                  
                  {/* Detailed explanation context */}
                  <div className={`p-4 rounded-xl text-xs font-medium border ${
                    isDarkMode ? 'bg-slate-950/85 border-slate-800/80' : 'bg-stone-50 border-stone-200/40'
                  }`}>
                    <span className="font-bold text-[10px] font-mono uppercase block text-stone-400 mb-2">Technical Context:</span>
                    <p className={isDarkMode ? 'text-slate-400' : 'text-stone-600'}>{activeQuiz.answerText}</p>
                  </div>

                  <button
                    onClick={handleStartQuiz}
                    className={`mt-2 py-3 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800' 
                        : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Another Calibration Sprint
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
