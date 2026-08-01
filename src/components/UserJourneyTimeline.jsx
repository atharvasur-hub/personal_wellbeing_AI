import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  PlayCircle, 
  Lock, 
  Compass, 
  Trophy, 
  Zap, 
  ChevronRight, 
  Sparkles, 
  RefreshCw,
  Sliders,
  Check,
  RotateCcw,
  Target
} from 'lucide-react';
import { fetchDynamicRoadmapFromBackend } from '../lib/backendApi';

const PRESET_ROLES = [
  "Senior AI Architect",
  "Python Backend Engineer",
  "React & Frontend Developer",
  "Machine Learning Engineer",
  "Java Enterprise Architect",
  "DevOps & Cloud Engineer",
  "Cybersecurity Specialist",
  "Product Manager & UX Specialist"
];

function generateLocalFallbackNodes(aspiration) {
  const role = (aspiration || "Senior AI Architect")
    .replace(/^I want to (become|be) a /i, '')
    .trim();
  const roleLower = role.toLowerCase();

  if (roleLower.includes('python') || roleLower.includes('backend') || roleLower.includes('fastapi') || roleLower.includes('django')) {
    return [
      {
        id: 'node-1',
        title: 'Python Async & Type System Foundation',
        subtitle: 'Phase 1 • Orientation',
        type: 'Video Tutorial',
        duration_mins: 20,
        status: 'completed',
        description: `Master asyncio event loops, Pydantic schemas, and type hinting for ${role} baseline.`
      },
      {
        id: 'node-2',
        title: 'FastAPI REST & Middleware Architecture',
        subtitle: 'Phase 2 • Focus Sprint Check-in',
        type: 'Focus Sprint',
        duration_mins: 30,
        status: 'completed',
        description: 'Build non-blocking REST endpoints with custom CORS, dependency injection, and JWT security.'
      },
      {
        id: 'node-3',
        title: 'PostgreSQL & Supabase Database Optimization',
        subtitle: 'Phase 3 • Active Journey Node',
        type: 'Interactive AI Feed',
        duration_mins: 25,
        status: 'active',
        description: 'Design relational schemas, composite B-tree indexing, and query ORM connection pooling.'
      },
      {
        id: 'node-4',
        title: 'Microservices, Caching & Redis Integration',
        subtitle: 'Phase 4 • System Architecture',
        type: 'Deep Dive Article',
        duration_mins: 45,
        status: 'locked',
        description: 'Implement Redis read-through caching, rate-limiting algorithms, and pub/sub queue patterns.'
      },
      {
        id: 'node-5',
        title: `Mastery Verification & ${role} Audit`,
        subtitle: 'Phase 5 • Final Calibration',
        type: 'Performance Audit',
        duration_mins: 20,
        status: 'locked',
        description: `Execute 10/10 node verification audit and benchmark VPM productivity for ${role}.`
      }
    ];
  }

  if (roleLower.includes('react') || roleLower.includes('frontend') || roleLower.includes('javascript') || roleLower.includes('web')) {
    return [
      {
        id: 'node-1',
        title: 'Modern React & Component Lifecycle Baseline',
        subtitle: 'Phase 1 • Orientation',
        type: 'Video Tutorial',
        duration_mins: 15,
        status: 'completed',
        description: 'Master functional components, props contracts, and strict state immutability.'
      },
      {
        id: 'node-2',
        title: 'State Hygiene & Custom React Hooks',
        subtitle: 'Phase 2 • Focus Sprint Check-in',
        type: 'Focus Sprint',
        duration_mins: 25,
        status: 'completed',
        description: 'Optimize component renders using useCallback, useMemo, and custom reusable hook abstractions.'
      },
      {
        id: 'node-3',
        title: 'Tailwind Design Systems & Glassmorphism UI',
        subtitle: 'Phase 3 • Active Journey Node',
        type: 'Interactive AI Feed',
        duration_mins: 20,
        status: 'active',
        description: 'Build high-signal responsive dashboards with dark modes, CSS grid, and micro-animations.'
      },
      {
        id: 'node-4',
        title: 'Single Page Routing, State Management & Vite',
        subtitle: 'Phase 4 • Frontend Architecture',
        type: 'Deep Dive Article',
        duration_mins: 40,
        status: 'locked',
        description: 'Implement global state contexts, code-splitting lazy loaders, and Vite production bundling.'
      },
      {
        id: 'node-5',
        title: `Frontend Mastery & ${role} Verification`,
        subtitle: 'Phase 5 • Final Calibration',
        type: 'Performance Audit',
        duration_mins: 20,
        status: 'locked',
        description: `Verify UI/UX accessibility standards and audit render performance for ${role}.`
      }
    ];
  }

  if (roleLower.includes('ai') || roleLower.includes('ml') || roleLower.includes('pytorch') || roleLower.includes('data')) {
    return [
      {
        id: 'node-1',
        title: 'Tensor Mathematics & NumPy/Pandas Baseline',
        subtitle: 'Phase 1 • Orientation',
        type: 'Video Tutorial',
        duration_mins: 20,
        status: 'completed',
        description: 'Calibrate matrix multiplication, gradient descent math, and data vectorization skills.'
      },
      {
        id: 'node-2',
        title: 'PyTorch Neural Block & Autograd Pipeline',
        subtitle: 'Phase 2 • Focus Sprint Check-in',
        type: 'Focus Sprint',
        duration_mins: 30,
        status: 'completed',
        description: 'Build modular PyTorch residual layers, loss functions, and backpropagation training loops.'
      },
      {
        id: 'node-3',
        title: 'Vector Databases, Embeddings & RAG Systems',
        subtitle: 'Phase 3 • Active Journey Node',
        type: 'Interactive AI Feed',
        duration_mins: 25,
        status: 'active',
        description: 'Construct high-signal retrieval-augmented generation pipelines using vector embeddings.'
      },
      {
        id: 'node-4',
        title: 'LLM Fine-Tuning & Model Deployment',
        subtitle: 'Phase 4 • System Architecture',
        type: 'Deep Dive Article',
        duration_mins: 45,
        status: 'locked',
        description: 'Quantize neural weights, serve inference models via FastAPI, and monitor latency bounds.'
      },
      {
        id: 'node-5',
        title: `AI Benchmark & ${role} Verification`,
        subtitle: 'Phase 5 • Final Calibration',
        type: 'Performance Audit',
        duration_mins: 20,
        status: 'locked',
        description: `Audit accuracy metrics and verify complete end-to-end pipeline for ${role}.`
      }
    ];
  }

  if (roleLower.includes('java') || roleLower.includes('spring') || roleLower.includes('enterprise')) {
    return [
      {
        id: 'node-1',
        title: 'Java Object-Oriented Fundamentals & Core API',
        subtitle: 'Phase 1 • Orientation',
        type: 'Video Tutorial',
        duration_mins: 20,
        status: 'completed',
        description: 'Establish baseline encapsulation, polymorphism, interfaces, and strong type safety.'
      },
      {
        id: 'node-2',
        title: 'JVM Memory Tuning & Concurrency Streams',
        subtitle: 'Phase 2 • Focus Sprint Check-in',
        type: 'Focus Sprint',
        duration_mins: 30,
        status: 'completed',
        description: 'Optimize Garbage Collection, heap stack allocations, and parallel Stream pipelines.'
      },
      {
        id: 'node-3',
        title: 'Spring Boot Microservices & REST Controllers',
        subtitle: 'Phase 3 • Active Journey Node',
        type: 'Interactive AI Feed',
        duration_mins: 25,
        status: 'active',
        description: 'Build Spring Data JPA repositories, Dependency Injection beans, and Spring Security.'
      },
      {
        id: 'node-4',
        title: 'Distributed Messaging & Kafka Event Streams',
        subtitle: 'Phase 4 • System Architecture',
        type: 'Deep Dive Article',
        duration_mins: 45,
        status: 'locked',
        description: 'Decouple microservices using Apache Kafka event topics and transaction managers.'
      },
      {
        id: 'node-5',
        title: `Enterprise Audit & ${role} Verification`,
        subtitle: 'Phase 5 • Final Calibration',
        type: 'Performance Audit',
        duration_mins: 20,
        status: 'locked',
        description: `Verify 10/10 node mastery and enterprise production standards for ${role}.`
      }
    ];
  }

  // Generic Dynamic Fallback for any role string
  return [
    {
      id: 'node-1',
      title: `Foundational ${role} Baseline & Principles`,
      subtitle: 'Phase 1 • Orientation',
      type: 'Video Tutorial',
      duration_mins: 15,
      status: 'completed',
      description: `Establish core domain metrics and calibrate baseline competency for ${role}.`
    },
    {
      id: 'node-2',
      title: `Deep Focus Sprint & Execution for ${role}`,
      subtitle: 'Phase 2 • Focus Sprint Check-in',
      type: 'Focus Sprint',
      duration_mins: 25,
      status: 'completed',
      description: '25-minute uninterrupted execution block targeting primary skill building.'
    },
    {
      id: 'node-3',
      title: `Identity Graph & Media Curation: ${role}`,
      subtitle: 'Phase 3 • Active Journey Node',
      type: 'Interactive AI Feed',
      duration_mins: 20,
      status: 'active',
      description: `AI-curated high-signal learning resources specifically matching ${role}.`
    },
    {
      id: 'node-4',
      title: `Advanced Architecture & Mastery Matrix: ${role}`,
      subtitle: 'Phase 4 • Locked Skill Matrix',
      type: 'Deep Dive Article',
      duration_mins: 40,
      status: 'locked',
      description: `Master high-level architecture, problem-solving frameworks, and real-world patterns.`
    },
    {
      id: 'node-5',
      title: `Mastery Verification & ${role} Audit`,
      subtitle: 'Phase 5 • Final Calibration',
      type: 'Performance Audit',
      duration_mins: 20,
      status: 'locked',
      description: `Verify 10/10 node mastery and optimize Value Per Minute productivity metric for ${role}.`
    }
  ];
}

export default function UserJourneyTimeline({ milestones, isDarkMode = false }) {
  const [currentAspiration, setCurrentAspiration] = useState(() => {
    return localStorage.getItem('synapse_user_aspiration') || localStorage.getItem('aspiration') || 'Senior AI Architect';
  });

  const [roadmapNodes, setRoadmapNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [activeCheckIn, setActiveCheckIn] = useState(false);

  const cleanRoleName = (currentAspiration || 'Senior AI Architect')
    .replace(/^I want to (become|be) a /i, '')
    .trim();

  // Core function to load or generate dynamic roadmap nodes for any target role
  const loadDynamicRoadmap = useCallback(async (roleName) => {
    setLoading(true);
    const targetRole = roleName || cleanRoleName;

    try {
      // 1. Try Backend dynamic generation
      const res = await fetchDynamicRoadmapFromBackend(targetRole);
      if (res && res.roadmap && Array.isArray(res.roadmap) && res.roadmap.length > 0) {
        setRoadmapNodes(res.roadmap);
        localStorage.setItem('synapse_user_roadmap', JSON.stringify(res.roadmap));
        localStorage.setItem('synapse_user_aspiration', targetRole);
        window.dispatchEvent(new CustomEvent('synapse_roadmap_updated'));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend roadmap fetch fallback:", err.message);
    }

    // 2. Client-side dynamic fallback generator
    const fallbackNodes = generateLocalFallbackNodes(targetRole);
    setRoadmapNodes(fallbackNodes);
    localStorage.setItem('synapse_user_roadmap', JSON.stringify(fallbackNodes));
    localStorage.setItem('synapse_user_aspiration', targetRole);
    window.dispatchEvent(new CustomEvent('synapse_roadmap_updated'));
    setLoading(false);
  }, [cleanRoleName]);

  // Initial load and sync with localStorage
  useEffect(() => {
    const savedRoadmapStr = localStorage.getItem('synapse_user_roadmap');
    const savedAspiration = localStorage.getItem('synapse_user_aspiration') || localStorage.getItem('aspiration') || 'Senior AI Architect';
    
    setCurrentAspiration(savedAspiration);

    if (savedRoadmapStr) {
      try {
        const parsed = JSON.parse(savedRoadmapStr);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setRoadmapNodes(parsed);
          return;
        }
      } catch (e) { }
    }

    // Generate dynamic roadmap if not found
    loadDynamicRoadmap(savedAspiration);
  }, []);

  // Listen to global roadmap updates
  useEffect(() => {
    const handleUpdate = () => {
      const savedAspiration = localStorage.getItem('synapse_user_aspiration') || localStorage.getItem('aspiration') || 'Senior AI Architect';
      setCurrentAspiration(savedAspiration);
      
      const savedRoadmapStr = localStorage.getItem('synapse_user_roadmap');
      if (savedRoadmapStr) {
        try {
          const parsed = JSON.parse(savedRoadmapStr);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            setRoadmapNodes(parsed);
          }
        } catch (e) { }
      }
    };

    window.addEventListener('synapse_roadmap_updated', handleUpdate);
    return () => window.removeEventListener('synapse_roadmap_updated', handleUpdate);
  }, []);

  // Handle role switching
  const handleSelectRole = (newRole) => {
    setCurrentAspiration(newRole);
    setCustomRoleInput('');
    setShowRoleSelector(false);
    loadDynamicRoadmap(newRole);
  };

  const handleCustomRoleSubmit = (e) => {
    e.preventDefault();
    if (!customRoleInput.trim()) return;
    handleSelectRole(customRoleInput.trim());
  };

  // Explicit status updater (Done / Undone / Locked)
  const setNodeStatus = (nodeId, newStatus) => {
    setRoadmapNodes((prevNodes) => {
      const nextNodes = prevNodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, status: newStatus };
        }
        return node;
      });

      localStorage.setItem('synapse_user_roadmap', JSON.stringify(nextNodes));
      window.dispatchEvent(new CustomEvent('synapse_roadmap_updated'));
      return nextNodes;
    });
  };

  // Toggle milestone status (done <-> active <-> locked)
  const handleToggleNodeStatus = (nodeId) => {
    const targetNode = roadmapNodes.find(n => n.id === nodeId);
    if (!targetNode) return;
    const nextStatus = targetNode.status === 'completed' ? 'active' : targetNode.status === 'active' ? 'locked' : 'completed';
    setNodeStatus(nodeId, nextStatus);
  };

  // Calculate progress stats
  const completedCount = roadmapNodes.filter(n => n.status === 'completed').length;
  const totalCount = roadmapNodes.length || 5;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">

      {/* Header Banner */}
      <div className="w-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
              <Compass className="w-5 h-5" />
            </div>
            <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-teal-600'}`}>
              Dynamic AI Career Roadmap
            </span>
          </div>

          <h2 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-slate-100' : 'text-stone-900'}`}>
            <span>Skill Trajectory:</span>
            <span className="text-teal-500 underline decoration-teal-400/40 decoration-wavy underline-offset-4">
              {cleanRoleName}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className={`px-4 py-2.5 rounded-2xl border font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-indigo-300 hover:border-indigo-500/40'
                : 'bg-white border-stone-200 text-teal-700 hover:border-teal-300'
            }`}
          >
            <Sliders className="w-4 h-4 text-teal-500" />
            <span>Customize Goal / Interest</span>
          </button>

          <button
            onClick={() => loadDynamicRoadmap(cleanRoleName)}
            disabled={loading}
            className={`p-2.5 rounded-2xl border shadow-xs transition cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
            title="Regenerate Roadmap Nodes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dynamic Role Switcher Panel */}
      {showRoleSelector && (
        <div className={`w-full mb-8 p-6 rounded-3xl border shadow-lg animate-fade-in ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white/90 border-teal-100 text-stone-800'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-extrabold tracking-wide">Switch Target Interest & Recalibrate Roadmap:</h4>
          </div>

          {/* Role Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => handleSelectRole(role)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-2xs cursor-pointer ${
                  cleanRoleName.toLowerCase() === role.toLowerCase()
                    ? 'bg-teal-500 text-white border-teal-400'
                    : isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/40'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-teal-50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Custom Role Input */}
          <form onSubmit={handleCustomRoleSubmit} className="flex gap-2">
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              placeholder="Or type custom interest (e.g. Cybersecurity Analyst, Cloud Architect)..."
              className={`flex-1 border rounded-2xl px-4 py-2.5 text-xs font-medium focus:outline-none transition ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500/40'
                  : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400 focus:border-teal-400'
              }`}
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-teal-500 text-white font-extrabold text-xs shadow-xs hover:bg-teal-600 transition cursor-pointer"
            >
              Generate Roadmap
            </button>
          </form>
        </div>
      )}

      {/* Progress Bar Card */}
      <div className={`w-full mb-8 p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-stone-800'}`}>
              Roadmap Progression ({completedCount}/{totalCount} Completed)
            </div>
            <div className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>
              {progressPercent}% Phase Mastery Achieved
            </div>
          </div>
        </div>

        <div className="w-full md:w-48 bg-stone-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="w-full py-12 flex flex-col items-center gap-3 text-stone-400 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-500" />
          <span className="text-xs font-mono">Generating dynamic AI roadmap nodes for {cleanRoleName}...</span>
        </div>
      )}

      {/* Vertical Timeline Nodes */}
      {!loading && (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
          {roadmapNodes.map((node, index) => (
            <div key={node.id || index} className="relative flex flex-col items-center w-full">

              {/* Connector Line */}
              {index !== 0 && (
                <div className={`w-1 h-12 my-1 transition-colors duration-500 ${
                  node.status === 'completed'
                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-400'
                    : node.status === 'active'
                    ? 'bg-gradient-to-b from-emerald-400 to-indigo-500 animate-pulse'
                    : isDarkMode ? 'bg-slate-800' : 'bg-stone-200'
                }`} />
              )}

              {/* Node Card */}
              <div 
                className={`w-full p-6 border rounded-3xl transition-all duration-300 group ${
                node.status === 'completed'
                  ? isDarkMode
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'border-emerald-300 bg-emerald-50/60 text-stone-900 shadow-sm'
                  : node.status === 'active'
                  ? isDarkMode
                    ? 'border-indigo-500/60 bg-indigo-950/30 text-slate-100 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-2 ring-indigo-500/30'
                    : 'border-teal-400 bg-teal-50/80 text-stone-900 shadow-md ring-2 ring-teal-400/20'
                  : isDarkMode
                    ? 'border-slate-800/80 bg-slate-900/30 text-slate-500'
                    : 'border-stone-200 bg-stone-100/50 text-stone-400'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        node.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : node.status === 'active'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-stone-500/10 text-stone-400 border-stone-500/20'
                      }`}>
                        {node.status || 'locked'}
                      </span>
                      <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                        {node.type} • {node.duration_mins} mins
                      </span>
                    </div>

                    <h3 className={`text-base font-extrabold tracking-wide ${
                      node.status === 'completed'
                        ? isDarkMode ? 'text-emerald-300' : 'text-emerald-900'
                        : node.status === 'active'
                        ? isDarkMode ? 'text-indigo-300' : 'text-teal-900'
                        : isDarkMode ? 'text-slate-300' : 'text-stone-600'
                    }`}>
                      {node.title}
                    </h3>

                    <p className={`text-xs mt-1.5 leading-relaxed ${
                      isDarkMode ? 'text-slate-400' : 'text-stone-600'
                    }`}>
                      {node.description}
                    </p>
                  </div>

                  {/* Status Indicator Icon & Quick Action */}
                  <div className="shrink-0 mt-1 flex flex-col items-end gap-2">
                    {node.status === 'completed' ? (
                      <button
                        onClick={() => setNodeStatus(node.id, 'active')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-rose-500/10 border border-emerald-500/30 hover:border-rose-500/40 text-emerald-500 hover:text-rose-500 text-xs font-bold transition cursor-pointer group/btn"
                        title="Click to mark as Undone (In Progress)"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-500 group-hover/btn:hidden" />
                        <RotateCcw className="w-4 h-4 hidden group-hover/btn:block text-rose-500" />
                        <span className="group-hover/btn:hidden">Completed</span>
                        <span className="hidden group-hover/btn:inline">Mark Undone</span>
                      </button>
                    ) : node.status === 'active' ? (
                      <button
                        onClick={() => setNodeStatus(node.id, 'completed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 text-white font-bold text-xs shadow-xs hover:bg-teal-600 transition cursor-pointer animate-pulse"
                        title="Click to mark as Done"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark Done</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setNodeStatus(node.id, 'completed')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-teal-500 hover:text-white'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-teal-500 hover:text-white'
                        }`}
                        title="Click to mark as Done"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Explicit Status Selector Buttons */}
                <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 ${
                  isDarkMode ? 'border-slate-800/80' : 'border-stone-200/60'
                }`}>
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-stone-400'}`}>
                    Change Node Status:
                  </span>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setNodeStatus(node.id, 'completed')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        node.status === 'completed'
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-2xs'
                          : isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-emerald-400'
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-emerald-600'
                      }`}
                    >
                      ✓ Completed
                    </button>

                    <button
                      onClick={() => setNodeStatus(node.id, 'active')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        node.status === 'active'
                          ? 'bg-indigo-500 text-white border-indigo-400 shadow-2xs'
                          : isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-indigo-400'
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-indigo-600'
                      }`}
                    >
                      ▶ Active
                    </button>

                    <button
                      onClick={() => setNodeStatus(node.id, 'locked')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        node.status === 'locked'
                          ? 'bg-slate-700 text-white border-slate-600 shadow-2xs'
                          : isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      🔒 Locked
                    </button>
                  </div>
                </div>

                {/* Active Accordion Expansion */}
                {node.status === 'active' && (
                  <div className={`mt-4 pt-3 border-t flex flex-col gap-3 ${isDarkMode ? 'border-indigo-500/20' : 'border-teal-200'}`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveCheckIn(!activeCheckIn); }}
                      className={`w-full py-3 px-5 rounded-2xl font-extrabold text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
                          : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>{activeCheckIn ? 'Check-in Recorded ✓' : 'Check-in & Sync AI Feed'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {activeCheckIn && (
                      <div className={`p-3 rounded-xl text-xs font-mono border animate-fade-in ${
                        isDarkMode ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200' : 'bg-teal-50 border-teal-200 text-teal-900'
                      }`}>
                        🎯 Check-in verified for {cleanRoleName}! Media feed & VPM metrics synced.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { UserJourneyTimeline as JourneyMap };