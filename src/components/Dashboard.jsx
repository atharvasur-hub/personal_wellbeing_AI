import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpenText, 
  Brain, 
  Shield, 
  Settings, 
  Flame, 
  Compass, 
  Activity, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  BookOpen,
  LogOut,
  Bell
} from 'lucide-react';
import ReaderMode from './ReaderMode';
import AgenticChat from './AgenticChat';
import IdentityGraph from './IdentityGraph';

// MOCK DETAILED ARTICLE DATA
const MOCK_ARTICLES = [
  {
    id: 'habit-stacking',
    title: 'Habit Stacking: Designing Resilient Daily Systems',
    time: 3,
    category: 'life',
    icon: Compass,
    color: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400',
    summary: 'Anchor new cognitive habits directly to existing daily anchors for seamless integration.',
    content: `# Habit Stacking: Designing Resilient Daily Systems

Habit stacking is a powerful strategy to build new behaviors by anchoring them to existing, well-established routines. Originally conceptualized by BJ Fogg and popularized by James Clear in Atomic Habits, this technique leverages the brain's existing synaptic pathways.

## The Cognitive Architecture

Every time you perform an automatic habit (like brushing your teeth or brewing coffee), a dense neural network triggers. Rather than attempting to plant a completely isolated behavior in dry mental soil, you "stack" the new habit directly on top of the established anchor.

> "Neurons that fire together, wire together. Stacking anchors new habits to deep neural tracks."

## The Stacking Formula

The structure is simple:

\`\`\`
After [CURRENT HABIT], I will [NEW HABIT].
\`\`\`

### Step-by-Step Implementation

1. **Inventory Current Anchors**: List everything you do daily without fail (e.g., wake up, open laptop, sit down, brush teeth, turn off lights).
2. **Select micro-habits**: Keep your new target habit tiny (<2 minutes).
3. **Execute immediately**: Reduce friction to zero.

## Example Stacks

- **Focus & Calm**: After I sit at my desk, I will take three deep belly breaths and open my editor.
- **Physical Renewal**: After I close my laptop for the day, I will immediately do 10 pushups.
- **Reflection**: After I crawl into bed, I will think of one micro-win from the day.`
  },
  {
    id: 'meta-learning',
    title: 'Meta-Learning: Deconstructing Complex Fields in 20 Hours',
    time: 4,
    category: 'tech',
    icon: Brain,
    color: 'from-indigo-500/10 to-blue-500/5 border-indigo-500/20 text-indigo-400',
    summary: 'Deconstruct complex concepts using the DiSSS framework to gain 80/20 mastery rapidly.',
    content: `# Meta-Learning: Deconstructing Complex Fields in 20 Hours

Meta-learning is the science of "learning how to learn." When tackling a new programming language, system architecture, or philosophy, the human brain is often overwhelmed by the sheer volume of material. Deconstruction solves this.

## The 4 Steps to Rapid Acquisition (DiSSS)

Popularized by Tim Ferriss, the DiSSS framework allows you to reach a functional 80/20 proficiency in under 20 hours of focused work:

### 1. Deconstruct (D)
Break the skill down into its smallest structural parts. If you are learning React:
- State management
- Hooks lifecycle
- Fiber reconciliation
- Event handling

### 2. Selection (S)
Identify the 20% of the components that produce 80% of the results. In coding, this is understanding conditional logic, core hooks (\`useState\`, \`useEffect\`), and prop flow before learning Server Actions or complex memoization.

### 3. Sequencing (S)
Arrange the selected components in a logical progression. Never learn advanced architecture before you can comfortably deploy a single page.

### 4. Stakes (S)
Create actual accountability stakes (like publishing a blog post or committing daily public code updates) to maintain dopamine drive.

> "Do not read passively. Active retrieval and error correction are the biological catalysts for neuroplasticity."`
  },
  {
    id: 'circadian-architecture',
    title: 'Circadian Architecture: Engineering Deep Sleep Waves',
    time: 3,
    category: 'life',
    icon: Activity,
    color: 'from-pink-500/10 to-rose-500/5 border-pink-500/20 text-pink-400',
    summary: 'Unlock cognitive consolidation by synchronizing light protocols and body temperature.',
    content: `# Circadian Architecture: Engineering Deep Sleep Waves

Sleep is the ultimate cognitive compiler. During slow-wave deep sleep, the glymphatic system flushes metabolic waste from the brain, and short-term memories are consolidated into long-term structures.

## The Light Protocol

The circadian rhythm is governed by the Suprachiasmatic Nucleus (SCN), which is highly responsive to blue light frequencies:

### Morning Lux Anchor
Get 10,000 lux of light in your eyes within 60 minutes of waking. This triggers a cortisol pulse that starts a timer for melatonin release 16 hours later.

### Evening Lux Shield
Block emissive screens and overhead lights after 9:00 PM. Use red-tinted incandescent lights to signal the pineal gland.

## Temperature Architecture

The human body must drop its core temperature by 1-2°F to fall asleep:

- **Warm Showers**: Taking a hot shower 90 minutes before bed causes vasodilation, cooling your core temperature rapidly as heat escapes through your hands and feet.
- **Bedroom Climate**: Lock your bedroom temperature at 65-68°F (18-20°C) for sustained deep sleep stages.

## Recovery Metrics

Tracking Heart Rate Registry (HRV) and deep sleep percentages can help you correlate screen fatigue with nervous system strain. Protect your sleep to protect your code.`
  },
  {
    id: 'stoicism-sprints',
    title: 'Stoicism in Release Sprints: Managing Cognitive Stress',
    time: 4,
    category: 'ethics',
    icon: Shield,
    color: 'from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-400',
    summary: 'Apply Epictetus tools of dichotomy of control and negative visualization to release cycles.',
    content: `# Stoicism in Release Sprints: Managing Cognitive Stress

Modern software engineering is a high-cognitive-load discipline. Sprints, bugs, deployments, and shifting requirements can create constant background anxiety. Stoicism offers an operating system for mental stability under stress.

## 1. The Dichotomy of Control

At the core of Stoic philosophy (from Epictetus) is the separation of what is in your control from what is not:

- **Not in your control**: Bug reports, user feedback, server downtime, project deadlines.
- **In your control**: Your response to bugs, your code structure, your focus blocks, your recovery hygiene.

> "If you are pained by external things, it is not they that disturb you, but your own judgment of them. And it is in your power to wipe out that judgment now." — Marcus Aurelius

## 2. Premeditatio Malorum (Negative Visualization)

Before you launch a release or write a complex feature, spend 5 minutes visualizing what could go wrong:
- The database connection pool exhausts.
- The CSS styles crash on Safari.
- Your deployment gets rolled back.

By simulating failure in advance, you strip it of its emotional shock. You shift from panic to execution: "If the database goes down, our retry mechanism will queue requests."

## 3. The Cognitive Pause

When a build fails right before demo, do not react. Pause. Take a breath. Ask: *Does this threat require emergency action or system analysis?* System analysis always yields faster resolutions than panic.`
  },
  {
    id: 'shader-canvas',
    title: 'The Shader Canvas: Generative Mathematics as Creative Flow',
    time: 5,
    category: 'design',
    icon: Sparkles,
    color: 'from-pink-500/10 to-rose-500/5 border-pink-500/20 text-pink-400',
    summary: 'Deconstruct math formulas and GLSL fragments to build custom rendering scripts.',
    content: `# The Shader Canvas: Generative Mathematics as Creative Flow

Creative coding merges the rigidity of logical algorithms with the fluid expression of visual arts. Using HTML5 Canvas or GLSL shaders, we can build organic designs that feel responsive and alive.

## The Canvas Coordinate System

Every pixel in a 2D canvas is plotted along a grid. By modulating the color values of pixels using mathematical functions, we can generate intricate patterns:

\`\`\`javascript
// A simple radial wave function
const dx = x - centerX;
const dy = y - centerY;
const distance = Math.sqrt(dx * dx + dy * dy);
const brightness = Math.sin(distance * 0.05 - time) * 0.5 + 0.5;
\`\`\`

## Harmonic Resonance

Using trigonometric functions like Sine (\`Math.sin\`) and Cosine (\`Math.cos\`), we can model:
- **Orbital paths**: Circle positioning using angular vectors.
- **Spring oscillations**: Damping structures for physics models.
- **Organic flow fields**: Simulating fluid currents using Perlin noise.

## Integration as Focus

Building generative art operates as a flow-state amplifier. Because visual feedback is instantaneous, errors in math translate to interesting graphical aberrations, encouraging playful iteration and deep focus.`
  }
];

const DOMAINS = [
  { id: 'all', label: 'All Growth', objective: 'Holistic Synthesis', icon: Compass, color: 'text-slate-400 border-slate-500/10' },
  { id: 'tech', label: 'Technical Systems', objective: 'Master Architecture', icon: Brain, color: 'text-indigo-400 border-indigo-500/15' },
  { id: 'life', label: 'Well-Being & Recovery', objective: 'Dopamine Balance', icon: Activity, color: 'text-emerald-400 border-emerald-500/15' },
  { id: 'ethics', label: 'Ethics & Philosophy', objective: 'Logical Alignment', icon: Shield, color: 'text-amber-400 border-amber-500/15' },
  { id: 'design', label: 'Creative & Design', objective: 'Visual Synthesis', icon: Sparkles, color: 'text-pink-400 border-pink-500/15' }
];

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeDomain, setActiveDomain] = useState('all');
  const [activeArticle, setActiveArticle] = useState(null);

  // Statistics Dashboard data
  const stats = [
    { label: 'Cognitive Energy', value: '88%', trend: '+4%', icon: Sparkles, color: 'text-indigo-400' },
    { label: 'Focus Blocks', value: '14.5h', trend: '12 blocks', icon: Flame, color: 'text-emerald-400' },
    { label: 'Mindfulness Sync', value: '92%', trend: 'Optimum', icon: Activity, color: 'text-pink-400' },
    { label: 'Learning Velocity', value: '8.4', trend: 'Nodes +3', icon: TrendingUp, color: 'text-amber-400' }
  ];

  // Filter articles based on active domain navigation
  const filteredArticles = activeDomain === 'all'
    ? MOCK_ARTICLES
    : MOCK_ARTICLES.filter(art => art.category === activeDomain);

  return (
    <div className="min-h-screen bg-brand-darker text-slate-100 flex font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-brand-dark/50 border-r border-white/5 flex flex-col justify-between shrink-0 hidden md:flex">
        
        {/* Main Logo & Navigation */}
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Brain className="w-5 h-5 text-brand-darker font-bold" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-300">
                ANTIGRAVITY
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Growth Agent</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 py-6 flex flex-col gap-1.5">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeMenu === 'dashboard'
                  ? 'bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Core Dashboard</span>
            </button>

            <button
              onClick={() => setActiveMenu('reader')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeMenu === 'reader'
                  ? 'bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <BookOpenText className="w-4 h-4" />
              <span>Growth Library</span>
            </button>

            <button
              onClick={() => setActiveMenu('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeMenu === 'settings'
                  ? 'bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* User profile section */}
        <div className="p-4 border-t border-white/5 bg-brand-dark/20 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[10px] bg-brand-card flex items-center justify-center text-xs font-bold text-slate-100">
                AS
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Atharva Sur</h4>
              <p className="text-[10px] text-slate-500">Tier 3 Growth Catalyst</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 bg-black/40 p-2 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>4 Day Streak</span>
            </div>
            <button className="p-1 hover:text-emerald-400 transition" title="Log Out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="p-4 md:px-8 border-b border-white/5 flex justify-between items-center bg-brand-dark/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              {activeMenu === 'dashboard' && 'Agentic Workspace'}
              {activeMenu === 'reader' && 'Growth Library'}
              {activeMenu === 'settings' && 'App Settings'}
            </h2>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/5 bg-black/30 text-[10px] font-mono text-slate-400">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>SYNAPSE CONNECTION: ACTIVE</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 transition relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </button>
          </div>
        </header>

        {/* Dynamic Growth Domain Navigation Bar */}
        {activeMenu === 'dashboard' && (
          <div className="bg-brand-dark/40 border-b border-white/5 p-4 md:px-8 overflow-x-auto shrink-0 flex items-center gap-4 scrollbar-none">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:block shrink-0 mr-2">
              Focus Objective:
            </div>
            
            <div className="flex items-center gap-3">
              {DOMAINS.map((domain) => {
                const DomIcon = domain.icon;
                const isActive = activeDomain === domain.id;
                
                return (
                  <button
                    key={domain.id}
                    onClick={() => setActiveDomain(domain.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition duration-200 shrink-0 ${
                      isActive 
                        ? 'bg-brand-card border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)] text-white' 
                        : 'bg-black/20 border-white/5 text-slate-400 hover:bg-black/35 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg bg-black/40 border border-white/5 ${domain.color}`}>
                      <DomIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-wide">{domain.label}</div>
                      <div className="text-[9px] text-slate-500 font-medium">{domain.objective}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
          
          {/* Stats Bar */}
          {activeMenu === 'dashboard' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, idx) => {
                const StatIcon = s.icon;
                return (
                  <div 
                    key={idx}
                    className="p-4 bg-brand-card/30 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-white/10 transition"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
                    <div>
                      <span className="text-xs text-slate-400 font-medium tracking-wide block mb-1">{s.label}</span>
                      <span className="text-2xl font-bold tracking-tight text-slate-100">{s.value}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className={`p-2 rounded-xl bg-black/35 border border-white/5 ${s.color}`}>
                        <StatIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{s.trend}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dual Panel Grid (Identity Graph + Agentic Chat) */}
          {activeMenu === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[480px]">
              
              {/* Identity Network Graph (2/3 width) */}
              <div className="xl:col-span-2 flex flex-col h-[520px] xl:h-auto">
                <IdentityGraph 
                  filterCategory={activeDomain}
                  setFilterCategory={setActiveDomain}
                />
              </div>

              {/* Streaming AI Chat Widget (1/3 width) */}
              <div className="flex flex-col h-[520px] xl:h-auto">
                <AgenticChat />
              </div>

            </div>
          )}

          {/* Scraped Growth Articles Library Section */}
          {(activeMenu === 'dashboard' || activeMenu === 'reader') && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-200 tracking-wider">
                    {activeDomain === 'all' 
                      ? 'JINA SCRAPED DIGEST' 
                      : `DIGEST FOR: ${DOMAINS.find(d => d.id === activeDomain)?.label.toUpperCase()}`}
                  </h3>
                </div>
                {activeMenu === 'dashboard' && (
                  <button 
                    onClick={() => setActiveMenu('reader')}
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
                  >
                    <span>View All Library</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Grid of Articles */}
              {filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredArticles.map((article) => {
                    return (
                      <div 
                        key={article.id}
                        className="p-5 bg-brand-card/20 border border-white/5 hover:border-white/10 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 shadow-md group hover:bg-brand-card/35"
                      >
                        <div className="flex flex-col gap-2">
                          {/* Header Details */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                              {DOMAINS.find(d => d.id === article.category)?.label || article.category}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                              {article.time} min read
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-sm text-slate-200 group-hover:text-emerald-400 transition">
                            {article.title}
                          </h4>
                          
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {article.summary}
                          </p>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => setActiveArticle(article)}
                          className="py-2.5 px-4 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-brand-darker transition flex items-center justify-center gap-1.5 w-full mt-2"
                        >
                          <BookOpenText className="w-3.5 h-3.5" />
                          <span>Launch Reader Mode</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-brand-card/10 border border-white/5 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No articles currently indexed in this specific domain.</p>
                </div>
              )}
            </div>
          )}

          {/* Simple Settings View placeholder */}
          {activeMenu === 'settings' && (
            <div className="p-6 bg-brand-card/20 border border-white/5 rounded-2xl max-w-xl animate-fade-in flex flex-col gap-5">
              <h3 className="font-bold text-base text-slate-100">Application Settings</h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">Jina Reader API Keys</span>
                    <span className="text-xs text-slate-500">Configure scraped source processing nodes.</span>
                  </div>
                  <input 
                    type="password" 
                    value="••••••••••••••••••••••••"
                    disabled
                    className="bg-black/40 border border-white/5 rounded-lg p-2 text-xs text-slate-400 text-right w-44" 
                  />
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">Haptic Feedback Simulation</span>
                    <span className="text-xs text-slate-500">Trigger micro-oscillations on dragging graph nodes.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-emerald-500 w-4 h-4 cursor-pointer" />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">Vercel AI SDK Endpoint</span>
                    <span className="text-xs text-slate-500">Synaptic Advisory Board stream routing.</span>
                  </div>
                  <span className="text-xs font-mono text-indigo-400">/api/synthetic-board</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Conditionally rendered ReaderMode overlays */}
      {activeArticle && (
        <ReaderMode 
          title={activeArticle.title}
          content={activeArticle.content}
          onClose={() => setActiveArticle(null)}
        />
      )}
    </div>
  );
}
