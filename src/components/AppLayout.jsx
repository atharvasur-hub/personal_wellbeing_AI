import React, { useState, useEffect } from 'react';
import {
  Home,
  Clock,
  Compass,
  User,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Bell,
  Brain,
  Sparkles,
  Flame,
  Check,
  CheckCircle2,
  Circle,
  Moon,
  Sun,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import CuratedFeed from './CuratedFeed';
import AgenticOnboardingFlow from './AgenticOnboardingFlow';
import HabitSteeringModal from './HabitSteeringModal';
import FocusRoom from './FocusRoom';
import NewUserGoalAssessmentModal from './NewUserGoalAssessmentModal';
import UserJourneyTimeline from './UserJourneyTimeline';
import ProfileVpmDashboard from './ProfileVpmDashboard';
import {
  fetchChatHistoryFromSupabase,
  saveChatMessageToSupabase,
  clearChatHistoryInSupabase,
  saveReflectionToSupabase,
  supabase
} from '../lib/supabaseClient';
import { generateAIResponse } from '../lib/aiService';
import { checkBackendHealth } from '../lib/backendApi';

export default function AppLayout({ currentUser, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIChatInterface, setShowAIChatInterface] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(() => {
    return !localStorage.getItem('synapse_onboarding_completed');
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Check backend health periodically
  useEffect(() => {
    let mounted = true;
    async function checkHealth() {
      const isOnline = await checkBackendHealth();
      if (mounted) setBackendOnline(isOnline);
    }
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Dynamic user data from Auth
  const userName = currentUser?.name || 'Atharva Sur';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AS';

  // Reflection Modal States
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionMood, setReflectionMood] = useState('focused');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Dedicated AI Interface Chat Messages
  const [aiInterfaceMessages, setAiInterfaceMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: `Greetings ${userName}. I am your Synapse AI Growth Architect powered by Google Gemini and Supabase PostgreSQL. How can I assist your progression today?`,
      suggestions: ["Analyze My Aspiration Gap", "Generate 60-Sec Focus Sprint", "Simulate 5-Year Trajectory"]
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Roadmap Mock States
  const [roadmapItems, setRoadmapItems] = useState([
    { id: 1, text: "Assemble NumPy transformer logic", completed: true },
    { id: 2, text: "Take 1-minute box breath check", completed: true },
    { id: 3, text: "Audit component render profilers", completed: false }
  ]);

  // Load chat history from Supabase if connected
  useEffect(() => {
    async function loadHistory() {
      const history = await fetchChatHistoryFromSupabase();
      if (history && history.length > 0) {
        setAiInterfaceMessages(history.map(item => ({
          id: item.id,
          role: item.role,
          text: item.text,
          suggestions: item.suggestions || []
        })));
      }
    }
    loadHistory();
  }, []);

  // Achievements & Badges Data
  const achievements = [
    {
      id: 'synaptic-pioneer',
      title: 'Synaptic Pioneer',
      desc: 'Completed 10 consecutive deep focus sprints without distraction.',
      unlocked: true,
      category: 'Focus',
      icon: Zap,
      date: 'Unlocked 3 days ago',
      color: 'from-amber-400 to-orange-500'
    },
    {
      id: 'dopamine-taperer',
      title: 'Dopamine Taperer',
      desc: 'Reduced passive scrolling time by 80% using focus intercepts.',
      unlocked: true,
      category: 'Wellbeing',
      icon: ShieldCheck,
      date: 'Unlocked 5 days ago',
      color: 'from-teal-400 to-cyan-500'
    },
    {
      id: 'circadian-master',
      title: 'Circadian Master',
      desc: 'Logged 7 days of 10,000 lux morning sunlight routines.',
      unlocked: true,
      category: 'Recovery',
      icon: Sun,
      date: 'Unlocked 1 week ago',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      id: 'pivot-explorer',
      title: 'Pivot Explorer',
      desc: 'Recalibrated identity graph node weights upon interest shift.',
      unlocked: true,
      category: 'Identity',
      icon: Compass,
      date: 'Unlocked 2 weeks ago',
      color: 'from-indigo-400 to-violet-500'
    },
    {
      id: 'neural-architect',
      title: 'Neural Architect',
      desc: 'Reach 10/10 node mastery across all Technical System nodes.',
      unlocked: false,
      progress: 85,
      category: 'Mastery',
      icon: Brain,
      color: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'flow-master',
      title: 'Flow Master',
      desc: 'Maintain 20+ hours of verified deep work in a single sprint week.',
      unlocked: false,
      progress: 72,
      category: 'Performance',
      icon: Trophy,
      color: 'from-violet-400 to-purple-500'
    }
  ];

  // Notifications Mock Data
  const notifications = [
    { id: 1, text: "Focus Intercept: Blocked X/Twitter (saved 15 mins)", time: "10m ago", read: false },
    { id: 2, text: "Aspiration Pivot Detected in Creative Coding", time: "1h ago", read: false },
    { id: 3, text: "Restorative Box Breathing recommended (High Fatigue)", time: "3h ago", read: true }
  ];

  const handleSendAiInterface = async (queryText) => {
    const textToSend = queryText || aiInputText;
    if (!textToSend.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: textToSend };
    setAiInterfaceMessages(prev => [...prev, userMsg]);
    setAiInputText('');
    setIsAiThinking(true);

    saveChatMessageToSupabase('user', textToSend);

    const result = await generateAIResponse(textToSend, aiInterfaceMessages);

    const aiMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      text: result.text,
      suggestions: result.suggestions
    };

    setAiInterfaceMessages(prev => [...prev, aiMsg]);
    setIsAiThinking(false);

    saveChatMessageToSupabase('assistant', result.text, result.suggestions);
  };

  const handleClearThread = async () => {
    setAiInterfaceMessages([
      {
        id: 1,
        role: 'assistant',
        text: "Conversation thread cleared. How can I guide your next growth session?",
        suggestions: ["Analyze My Aspiration Gap", "Generate 60-Sec Focus Sprint", "Simulate 5-Year Trajectory"]
      }
    ]);
    await clearChatHistoryInSupabase();
  };

  const handleSaveReflection = async (e) => {
    e.preventDefault();
    setReflectionSaved(true);

    await saveReflectionToSupabase(reflectionMood, reflectionText);

    setTimeout(() => {
      setShowReflection(false);
      setReflectionSaved(false);
      setReflectionText('');
      setReflectionMood('focused');
    }, 1500);
  };

  const toggleRoadmapItem = (id) => {
    setRoadmapItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'focus', label: 'Focus Room', icon: Clock },
    { id: 'journey', label: 'Journey Map', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className={`min-h-screen flex font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#FAFAF9] text-stone-900'
      }`}>

      {/* Sidebar Navigation */}
      <aside
        className={`border-r flex flex-col justify-between shrink-0 transition-all duration-300 relative ${isDarkMode
          ? 'bg-slate-900 border-slate-800/80 text-slate-100'
          : 'bg-[#FAF8F7] border-stone-200/50 text-stone-900'
          } ${sidebarCollapsed ? 'w-20 p-4' : 'w-72 p-6'}`}
      >
        <div>
          {/* Back Action Chevron */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`w-10 h-10 rounded-full border shadow-sm flex items-center justify-center transition hover:shadow-md cursor-pointer ${isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-white border-stone-200/60 text-stone-600 hover:text-stone-900'
                }`}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Section Header Label */}
          {!sidebarCollapsed && (
            <div className={`mb-4 px-2 text-xs font-extrabold tracking-widest font-mono uppercase ${isDarkMode ? 'text-slate-500' : 'text-stone-400'
              }`}>
              SELF-COMPILER
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 relative group cursor-pointer ${isActive
                    ? isDarkMode
                      ? 'bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30 shadow-indigo-500/10'
                      : 'bg-white text-stone-900 font-bold shadow-sm border border-stone-100'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-white/60'
                    }`}
                >
                  <ItemIcon className={`w-5 h-5 shrink-0 transition-transform ${isActive
                    ? isDarkMode ? 'text-indigo-400 scale-105' : 'text-teal-500 scale-105'
                    : 'text-stone-400 group-hover:scale-105'
                    }`} />
                  {!sidebarCollapsed && <span className="animate-fade-in">{item.label}</span>}

                  {sidebarCollapsed && (
                    <div className={`absolute left-16 px-3 py-1.5 rounded-xl text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition duration-150 z-40 whitespace-nowrap shadow-xl ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-stone-900 text-white'
                      }`}>
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Capsule & Logout */}
        <div className={`p-3 rounded-2xl border shadow-sm flex items-center justify-between transition-opacity duration-300 ${isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white/80 border-stone-200/50 text-stone-900'
          }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0 ${isDarkMode
              ? 'bg-gradient-to-tr from-indigo-500 to-violet-500'
              : 'bg-gradient-to-tr from-teal-400 to-cyan-500'
              }`}>
              {userInitials}
            </div>
            {!sidebarCollapsed && (
              <div className="animate-fade-in overflow-hidden">
                <h4 className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>{userName}</h4>
                <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>{currentUser?.email || 'Logged In'}</p>
              </div>
            )}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className={`p-2 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${isDarkMode
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                }`}
              title="Log Out of Session"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="hidden sm:inline">Log Out</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-colors duration-300 ${isDarkMode
        ? 'bg-gradient-to-br from-slate-950 via-[#0D1322] to-slate-950'
        : 'bg-gradient-to-br from-[#F5EFEF] via-[#E8F5F1] to-[#FAFAF9]'
        }`}>

        {/* Top Header */}
        <header className="p-6 md:px-10 flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-extrabold tracking-widest font-mono uppercase ${isDarkMode ? 'text-slate-500' : 'text-stone-400'
              }`}>
              {activeMenu === 'dashboard' && 'GROWTH WORKSPACE'}
              {activeMenu === 'profile' && 'IDENTITY & TRAJECTORY PROFILE'}
              {activeMenu === 'focus' && 'FOCUS ROOM'}
              {activeMenu === 'journey' && 'JOURNEY MAP'}
            </span>

            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${backendOnline
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-stone-500/10 border-stone-500/20 text-stone-400'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <span>{backendOnline ? 'FASTAPI BACKEND: ONLINE (PORT 8000)' : 'FASTAPI BACKEND: OFFLINE'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowAssessmentModal(true)}
              className={`px-3 py-2 rounded-full border shadow-sm flex items-center gap-1.5 text-xs font-extrabold transition cursor-pointer ${isDarkMode
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                }`}
              title="Recalibrate Goal & Current Condition Assessment"
            >
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span className="hidden md:inline">Goal Assessment</span>
            </button>

            <button
              onClick={() => setShowHabitModal(true)}
              className={`px-3 py-2 rounded-full border shadow-sm flex items-center gap-1.5 text-xs font-extrabold transition cursor-pointer ${isDarkMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                }`}
              title="Test Digital Guardian Habit Intercept"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Test Digital Guardian</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className={`px-3 py-2 rounded-full border shadow-sm flex items-center gap-1.5 text-xs font-extrabold transition-all duration-300 cursor-pointer ${isDarkMode
                  ? 'bg-slate-900 border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
                  : 'bg-white border-stone-200/80 text-rose-600 hover:bg-rose-50'
                  }`}
                title="Log Out of Session"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            )}

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3.5 py-2 rounded-full border shadow-sm flex items-center gap-2 text-xs font-extrabold transition-all duration-300 cursor-pointer ${isDarkMode
                ? 'bg-slate-900 border-indigo-500/40 text-indigo-300 hover:bg-slate-800'
                : 'bg-white border-stone-200/80 text-stone-700 hover:bg-stone-50'
                }`}
              title="Toggle Dark / Light Mode"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowReflection(true)}
              className={`w-10 h-10 rounded-full border shadow-sm flex items-center justify-center transition hover:shadow-md cursor-pointer ${isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/40'
                : 'bg-white border-stone-200/60 text-stone-700 hover:text-teal-600'
                }`}
              title="Daily Reflection"
            >
              <PenTool className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-10 h-10 rounded-full border shadow-sm flex items-center justify-center transition relative hover:shadow-md cursor-pointer ${isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/40'
                : 'bg-white border-stone-200/60 text-stone-700 hover:text-teal-600'
                }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-indigo-400' : 'bg-rose-400'
                }`} />
            </button>

            {showNotifications && (
              <div className={`absolute right-0 top-12 w-80 rounded-3xl border p-5 shadow-2xl z-50 flex flex-col gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-stone-200/80 text-stone-900'
                }`}>
                <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-stone-100'}`}>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-stone-800'}`}>System Logs</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className={`text-[10px] font-bold cursor-pointer ${isDarkMode ? 'text-indigo-400' : 'text-teal-600'}`}
                  >
                    Close
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border text-xs leading-relaxed flex flex-col gap-1 transition ${notif.read
                        ? isDarkMode ? 'bg-slate-950/40 border-slate-800/50 text-slate-500' : 'bg-stone-50 border-stone-100 text-stone-400'
                        : isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-slate-300' : 'bg-teal-50/50 border-teal-100 text-stone-700'
                        }`}
                    >
                      <p>{notif.text}</p>
                      <span className={`text-[9px] font-mono text-right ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>{notif.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">

            {/* Dashboard View */}
            {activeMenu === 'dashboard' && (
              <>
                {/* Main Greeting Banner */}
                <div className="flex flex-col gap-2">
                  <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>
                    Welcome back,<br />
                    <span className={`text-transparent bg-clip-text ${isDarkMode
                      ? 'bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-300'
                      : 'bg-gradient-to-r from-teal-400 to-cyan-500'
                      }`}>
                      {userName}
                    </span>
                  </h1>
                  <p className={`text-sm md:text-base max-w-xl leading-relaxed mt-1 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'
                    }`}>
                    Your prefrontal cortex is rested. Today is ideal for deep learning matrices and neural structures.
                  </p>
                </div>

                {/* AGENTIC ONBOARDING & EMBEDDED MEDIA FEED FLOW */}
                <AgenticOnboardingFlow isDarkMode={isDarkMode} />

                {/* PROMINENT AI CURATED FEED SECTION */}
                <CuratedFeed isDarkMode={isDarkMode} />

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 1. Baseline Metrics Card */}
                  <div className={`rounded-3xl p-6 md:p-8 border relative overflow-hidden flex flex-col justify-between min-h-[360px] group transition-all duration-300 ${isDarkMode
                    ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl shadow-indigo-500/5 hover:border-indigo-500/30'
                    : 'bg-white border-stone-100/80 text-stone-900 shadow-sm hover:shadow-md'
                    }`}>
                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl ${isDarkMode
                      ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400'
                      : 'bg-gradient-to-r from-teal-400 to-cyan-400'
                      }`} />

                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-teal-50 text-teal-600 border-teal-100/60'
                            }`}>
                            <Brain className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className={`text-base font-extrabold tracking-wide ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>BASELINE METRICS</h3>
                            <span className={`text-xs font-bold tracking-wider font-mono ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>IDENTITY GRAPH</span>
                          </div>
                        </div>

                        <span className={`px-3.5 py-1 rounded-full text-xs font-bold border ${isDarkMode
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          : 'bg-teal-50/80 text-teal-700 border-teal-100'
                          }`}>
                          12 active nodes
                        </span>
                      </div>

                      <p className={`text-xs md:text-sm leading-relaxed max-w-lg mb-6 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'
                        }`}>
                        Visualizes the current gap between your cognitive baseline and target career aspirations. Drag nodes to shift priority and trigger habit updates.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold shadow-2xs transition cursor-pointer ${isDarkMode
                          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25'
                          : 'bg-indigo-50/80 text-indigo-900 border border-indigo-100 hover:bg-indigo-100/60'
                          }`}>
                          <span>Deep Learning</span>
                          <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] shadow-2xs ${isDarkMode ? 'bg-indigo-950 text-indigo-400' : 'bg-white text-indigo-600'
                            }`}>10/10</span>
                        </div>

                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold shadow-2xs transition cursor-pointer ${isDarkMode
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 hover:bg-teal-500/25'
                          : 'bg-teal-50/80 text-teal-900 border border-teal-100 hover:bg-teal-100/60'
                          }`}>
                          <span>React Performance</span>
                          <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] shadow-2xs ${isDarkMode ? 'bg-teal-950 text-teal-400' : 'bg-white text-teal-600'
                            }`}>8/10</span>
                        </div>

                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold shadow-2xs transition cursor-pointer ${isDarkMode
                          ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:bg-violet-500/25'
                          : 'bg-purple-50/80 text-purple-900 border border-purple-100 hover:bg-purple-100/60'
                          }`}>
                          <span>Circadian Sleep</span>
                          <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] shadow-2xs ${isDarkMode ? 'bg-violet-950 text-violet-400' : 'bg-white text-purple-600'
                            }`}>7/10</span>
                        </div>

                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold shadow-2xs transition cursor-pointer ${isDarkMode
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                          : 'bg-amber-50/80 text-amber-900 border border-amber-100 hover:bg-amber-100/60'
                          }`}>
                          <span>Stoicism</span>
                          <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] shadow-2xs ${isDarkMode ? 'bg-amber-950 text-amber-400' : 'bg-white text-amber-600'
                            }`}>9/10</span>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-8 pt-4 border-t flex justify-between items-center text-xs font-mono ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-stone-100 text-stone-400'
                      }`}>
                      <span>Aspiration gap: -14% remaining</span>
                      <span className={`font-bold hover:underline cursor-pointer ${isDarkMode ? 'text-indigo-400' : 'text-teal-600'
                        }`}>Open Graph Sandbox →</span>
                    </div>
                  </div>

                  {/* 2. Goal Roadmap Card */}
                  <div className={`rounded-3xl p-6 md:p-8 border relative overflow-hidden flex flex-col justify-between min-h-[360px] group transition-all duration-300 ${isDarkMode
                    ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl shadow-indigo-500/5 hover:border-indigo-500/30'
                    : 'bg-white border-stone-100/80 text-stone-900 shadow-sm hover:shadow-md'
                    }`}>
                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl ${isDarkMode
                      ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400'
                      : 'bg-gradient-to-r from-teal-400 to-cyan-400'
                      }`} />

                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-2xl border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-teal-50 text-teal-600 border-teal-100/60'
                            }`}>
                            <Flame className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className={`text-base font-extrabold tracking-wide ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>GOAL ROADMAP</h3>
                            <span className={`text-xs font-bold tracking-wider font-mono ${isDarkMode ? 'text-slate-500' : 'text-stone-400'}`}>ACTIVE SPRINTS</span>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${isDarkMode
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          : 'bg-teal-50 text-teal-700 border-teal-100'
                          }`}>
                          Velocity 8.4
                        </span>
                      </div>

                      <p className={`text-xs md:text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-stone-500'
                        }`}>
                        A dynamic sequence mapping milestones. Complete actions early to claim the synaptic Easter Egg.
                      </p>

                      <div className="flex flex-col gap-3.5">
                        {roadmapItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleRoadmapItem(item.id)}
                            className="flex items-center gap-3 text-xs text-left w-full transition hover:text-white cursor-pointer"
                          >
                            {item.completed ? (
                              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-teal-500'}`} />
                            ) : (
                              <Circle className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-slate-600' : 'text-stone-300'}`} />
                            )}
                            <span className={`${item.completed
                              ? isDarkMode ? 'line-through text-slate-500' : 'line-through text-stone-400'
                              : isDarkMode ? 'text-slate-200 font-semibold' : 'text-stone-700 font-semibold'
                              }`}>
                              {item.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-1.5">
                      <div className={`flex justify-between text-[10px] font-mono font-bold ${isDarkMode ? 'text-slate-500' : 'text-stone-400'
                        }`}>
                        <span>Milestone Progress</span>
                        <span>{Math.round((roadmapItems.filter(i => i.completed).length / roadmapItems.length) * 100)}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200/50'
                        }`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-400' : 'bg-gradient-to-r from-teal-400 to-cyan-500'
                            }`}
                          style={{ width: `${(roadmapItems.filter(i => i.completed).length / roadmapItems.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* FOCUS ROOM VIEW */}
            {activeMenu === 'focus' && (
              <FocusRoom isDarkMode={isDarkMode} />
            )}

            {/* FULL PROFILE & VPM DASHBOARD VIEW */}
            {activeMenu === 'profile' && (
              <ProfileVpmDashboard isDarkMode={isDarkMode} currentUser={currentUser} />
            )}

            {/* Journey Map Section */}
            {activeMenu === 'journey' && (
              <UserJourneyTimeline isDarkMode={isDarkMode} />
            )}

          </div>
        </div>
      </main>

      {/* PROACTIVE DIGITAL GUARDIAN INTERCEPT MODAL */}
      <HabitSteeringModal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        isDarkMode={isDarkMode}
      />

      {/* NEW USER GOAL & CURRENT CONDITION ASSESSMENT MODAL */}
      <NewUserGoalAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onAssessmentComplete={() => {
          setShowAssessmentModal(false);
        }}
      />

      {/* FLOATING AI CHATBOT BUBBLE */}
      <button
        onClick={() => setShowAIChatInterface(true)}
        className={`fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full text-white shadow-xl border-2 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer ${isDarkMode
          ? 'bg-gradient-to-tr from-indigo-500 via-violet-600 to-teal-400 border-slate-800 shadow-indigo-500/30'
          : 'bg-gradient-to-tr from-teal-400 via-cyan-500 to-indigo-500 border-white shadow-teal-500/25'
          }`}
        title="Launch Synapse AI Assistant Interface"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[9px] font-extrabold text-white">
          1
        </span>
      </button>

      {/* DEDICATED FULL AI INTERFACE OVERLAY */}
      {showAIChatInterface && (
        <div className={`fixed inset-0 z-50 flex flex-col animate-fade-in ${isDarkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-gradient-to-br from-[#F5EFEF] via-[#E8F5F1] to-[#FAFAF9] text-stone-900'
          }`}>

          {/* AI Interface Header */}
          <header className={`p-6 md:px-10 border-b backdrop-blur-md flex items-center justify-between shadow-xs shrink-0 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/80 border-stone-200/60'
            }`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAIChatInterface(false)}
                className={`w-10 h-10 rounded-full border shadow-xs flex items-center justify-center transition cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white' : 'bg-white border-stone-200/60 text-stone-700 hover:text-stone-900'
                  }`}
                title="Return to Workspace"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${isDarkMode ? 'bg-gradient-to-tr from-indigo-500 to-violet-600' : 'bg-gradient-to-tr from-teal-400 to-cyan-500'
                  }`}>
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-wide flex items-center gap-2">
                    <span>SYNAPSE AI INTERFACE</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </h2>
                  <p className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>Neural Self-Compiler Engine v4.2</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClearThread}
                className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-2xs transition cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-stone-200/80 text-stone-600 hover:text-stone-900'
                  }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                <span>Reset Thread</span>
              </button>

              <button
                onClick={() => setShowAIChatInterface(false)}
                className={`w-10 h-10 rounded-full border shadow-xs flex items-center justify-center transition cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-stone-200/60 text-stone-600 hover:text-stone-900'
                  }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* AI Interface Content & Messages */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">

            {/* Quick Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
              <button
                onClick={() => handleSendAiInterface("Analyze My Aspiration Gap")}
                className={`p-4 rounded-2xl border shadow-2xs hover:shadow-md text-left transition flex flex-col justify-between gap-3 group cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-stone-100 hover:border-teal-200'
                  }`}
              >
                <div className={`p-2 rounded-xl w-fit ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-teal-50 text-teal-600'}`}>
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold transition ${isDarkMode ? 'text-slate-200 group-hover:text-indigo-400' : 'text-stone-800 group-hover:text-teal-600'}`}>Aspiration Gap</h4>
                  <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>Diagnose missing skill nodes</p>
                </div>
              </button>

              <button
                onClick={() => handleSendAiInterface("Generate 60-Sec Focus Sprint")}
                className={`p-4 rounded-2xl border shadow-2xs hover:shadow-md text-left transition flex flex-col justify-between gap-3 group cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-stone-100 hover:border-cyan-200'
                  }`}
              >
                <div className={`p-2 rounded-xl w-fit ${isDarkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold transition ${isDarkMode ? 'text-slate-200 group-hover:text-cyan-400' : 'text-stone-800 group-hover:text-cyan-600'}`}>Focus Sprint</h4>
                  <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>Trigger rapid habit momentum</p>
                </div>
              </button>

              <button
                onClick={() => handleSendAiInterface("Simulate 5-Year Trajectory")}
                className={`p-4 rounded-2xl border shadow-2xs hover:shadow-md text-left transition flex flex-col justify-between gap-3 group cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-stone-100 hover:border-indigo-200'
                  }`}
              >
                <div className={`p-2 rounded-xl w-fit ${isDarkMode ? 'bg-violet-500/10 text-violet-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold transition ${isDarkMode ? 'text-slate-200 group-hover:text-indigo-400' : 'text-stone-800 group-hover:text-teal-600'}`}>Trajectory Simulator</h4>
                  <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>Project passive vs active paths</p>
                </div>
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex flex-col gap-4 flex-1">
              {aiInterfaceMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs ${msg.role === 'user' ? 'bg-teal-500' : isDarkMode ? 'bg-indigo-600' : 'bg-gradient-to-tr from-teal-400 to-cyan-500'
                    }`}>
                    {msg.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className={`p-4 rounded-3xl border text-xs md:text-sm leading-relaxed shadow-xs ${msg.role === 'user'
                      ? 'bg-teal-500 text-white border-teal-400 rounded-tr-none'
                      : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none' : 'bg-white border-stone-100 text-stone-800 rounded-tl-none'
                      }`}>
                      {msg.text}
                    </div>

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendAiInterface(sug)}
                            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition shadow-2xs cursor-pointer ${isDarkMode
                              ? 'bg-slate-900 border-slate-800 text-indigo-300 hover:bg-slate-800 hover:border-indigo-500/40'
                              : 'bg-white border-stone-200/80 text-teal-700 hover:bg-teal-50 hover:border-teal-200'
                              }`}
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className={`flex items-center gap-3 text-xs font-mono animate-pulse ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>
                  <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-indigo-400' : 'bg-teal-50 text-teal-500'}`}>
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <span>Synapse Neural Compiler calculating optimal response...</span>
                </div>
              )}
            </div>

          </div>

          {/* AI Interface Input Bar */}
          <div className={`p-6 md:px-12 border-t backdrop-blur-md shrink-0 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/80 border-stone-200/60'
            }`}>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendAiInterface(); }}
              className="max-w-4xl mx-auto flex gap-3"
            >
              <input
                type="text"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                placeholder="Ask Synapse AI anything about your growth, habits, or aspirations..."
                className={`flex-1 border rounded-2xl px-5 py-3.5 text-xs md:text-sm focus:outline-none transition shadow-2xs ${isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500/40'
                  : 'bg-stone-50 border-stone-200/80 text-stone-800 placeholder-stone-400 focus:border-teal-500/50'
                  }`}
              />
              <button
                type="submit"
                className={`px-6 py-3.5 rounded-2xl text-white font-extrabold text-xs md:text-sm transition flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer ${isDarkMode ? 'bg-gradient-to-r from-indigo-500 to-violet-600' : 'bg-gradient-to-r from-teal-400 to-cyan-500'
                  }`}
              >
                <span>Send</span>
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Daily Reflection Modal Panel Overlay */}
      {showReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
          <div className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl animate-slide-up flex flex-col gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-900'
            }`}>
            <div className={`flex justify-between items-center pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-stone-100'}`}>
              <div className="flex items-center gap-2">
                <PenTool className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-teal-500'}`} />
                <h3 className="font-extrabold text-sm tracking-wider">DAILY REFLECTION</h3>
              </div>
              <button
                onClick={() => setShowReflection(false)}
                className={`text-xs font-bold cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-stone-400 hover:text-stone-600'}`}
              >
                Cancel
              </button>
            </div>

            {reflectionSaved ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 animate-fade-in">
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-teal-50 border-teal-200 text-teal-600'
                  }`}>
                  <Check className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold">Reflection Logged!</h4>
                <p className="text-[11px] text-stone-400">Updating profile interest metrics...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveReflection} className="flex flex-col gap-4">

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] uppercase font-bold tracking-wider font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>Current cognitive Mood</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['focused', 'calm', 'exhausted', 'neutral'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setReflectionMood(m)}
                        className={`py-1.5 rounded-xl border text-[10px] font-bold capitalize transition cursor-pointer ${reflectionMood === m
                          ? isDarkMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' : 'bg-teal-500 border-teal-400 text-white shadow-sm'
                          : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                          }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-[10px] uppercase font-bold tracking-wider font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>What did you build/learn today?</label>
                  <textarea
                    required
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="e.g., implemented self-attention matrices, resolved layout render loop leaks."
                    rows={3}
                    className={`border rounded-2xl p-3 text-xs focus:outline-none resize-none transition ${isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600 focus:border-indigo-500/40'
                      : 'bg-stone-50 border-stone-200/80 text-stone-800 placeholder-stone-400 focus:border-teal-500/50'
                      }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 text-white font-extrabold text-xs rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer ${isDarkMode ? 'bg-gradient-to-r from-indigo-500 to-violet-600' : 'bg-gradient-to-r from-teal-400 to-cyan-500'
                    }`}
                >
                  Save Reflection Log
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
