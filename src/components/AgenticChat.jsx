import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles, Brain, Shield, ArrowDown, Trash2 } from 'lucide-react';

// MOCK ADVISORY SYSTEM
const AGENT_PERSONAS = {
  architect: {
    id: 'architect',
    name: 'Skill Architect',
    role: 'Technical Growth & Learning Advisor',
    icon: Brain,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    bubbleColor: 'bg-indigo-950/20 border-indigo-500/20 text-slate-100',
    glowingText: 'shadow-[0_0_15px_rgba(99,102,241,0.2)] border-indigo-500/40',
    avatarBg: 'bg-gradient-to-tr from-indigo-600 to-indigo-400',
    tagline: 'Ready to map your skill graphs and build concrete learning roadmaps.',
    welcomeMessage: "Hello! I am your Skill Architect. Let's design your personal growth pathway. What domain are you targeting today? (e.g., React Performance, System Design, Neural Networks)",
    responses: {
      default: "That's an excellent area to build mastery in. To tackle this, we should decompose it into a 3-stage roadmap: \n1. **Core Fundamentals**: Focus on underlying mental models and syntax.\n2. **Hands-on Assembly**: Build a small isolated project from scratch.\n3. **Optimization & Limits**: Study edge cases, performance trade-offs, and scalability.\n\nWhat is your current comfort level with this topic?",
      react: "React performance optimizing is key. I recommend auditing key metrics:\n- **Preventing re-renders**: Leverage `React.memo` and evaluate stable references with `useCallback`/`useMemo`.\n- **Code splitting**: Implement `React.lazy` and Suspense to slice large JS bundles.\n- **Render audits**: Use React Developer Tools' Profiler to pinpoint slow commits.\n\nLet's design a mock application to profile. Would you like a step-by-step layout?",
      design: "For System Design, focus on building modular resilience:\n- **Decoupling**: Introduce message queues (like RabbitMQ or Kafka) for asynchronous workflows.\n- **Caching**: Implement a read-through Cache (Redis) to relieve pressure on SQL databases.\n- **Scalability**: Deploy load balancers (NGINX/ALB) across multiple availability zones.\n\nWhich specific component of your system is currently the bottleneck?",
      ml: "Building deep learning capabilities starts with solid fundamentals. I suggest:\n1. Re-write forward/backward propagation in pure Python/NumPy to master the math.\n2. Move to PyTorch for automated differentiation and tensor operations.\n3. Train small models on CIFAR-10 or MNIST to study gradient descent behavior.\n\nI can generate a small training loop snippet. Should we start there?"
    }
  },
  guardian: {
    id: 'guardian',
    name: 'Well-Being Guardian',
    role: 'Mindfulness & Deep Work Facilitator',
    icon: Shield,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    bubbleColor: 'bg-emerald-950/20 border-emerald-500/20 text-slate-100',
    glowingText: 'shadow-[0_0_15px_rgba(16,185,129,0.2)] border-emerald-500/40',
    avatarBg: 'bg-gradient-to-tr from-emerald-600 to-emerald-400',
    tagline: 'Guarding your focus and emotional well-being from modern tech depletion.',
    welcomeMessage: "Welcome back. I am your Well-Being Guardian. I'm here to ensure you maintain high cognitive clarity without burnout. How are your energy levels currently?",
    responses: {
      default: "Acknowledged. Sprints of high productivity require conscious breaks. I recommend practicing the **20-20-20 rule**: Every 20 minutes, look at something 20 feet away for 20 seconds to relieve optic nerve stress. Let's do a quick breathing session or tech-free physical stretch. Would you like me to guide you through a 1-minute box breath?",
      tired: "Recognizing fatigue is a sign of high emotional intelligence. When energy levels drop, continuing to push causes compounding cognitive debt. I suggest:\n- **Stand up immediately**: Do a 2-minute dynamic stretch.\n- **Hydrate**: Sip a large glass of cold water.\n- **Dopamine reset**: Step away from all emissive screens for at least 10 minutes.\n\nShall we schedule a 10-minute quiet focus block?",
      stress: "When stress rises, cortisol blocks high-level creative synthesis. Let's ground your system:\n- **Box Breathing**: Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s.\n- **Task Trimming**: Pick the absolute single most important task today and defer the rest.\n- **Physical reset**: Relax your shoulders, un-clench your jaw, and take a long sighing breath.\n\nLet's run a guided box-breathing cycle right now. Ready?",
      focus: "To protect your flow state from distractions, let's configure an 'Agentic Cocoon':\n1. Put your phone in another room or turn on 'Do Not Disturb'.\n2. Close all browser tabs unrelated to your current sprint.\n3. Put on ambient binaural beats (40 Hz gamma waves show focus enhancement).\n\nHow long do you want to sprint for? I will lock out distractions and check in when time is up."
    }
  }
};

import { chatWithBackend } from '../lib/backendApi';

// CUSTOM LIVE / OLLAMA AGENTIC CHAT HOOK
function useMockChat(activeAgent) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const streamIntervalRef = useRef(null);

  // Initialize with agent welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-' + activeAgent.id,
        role: 'assistant',
        content: activeAgent.welcomeMessage,
        createdAt: new Date(),
        agentId: activeAgent.id
      }
    ]);
  }, [activeAgent]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-' + activeAgent.id,
        role: 'assistant',
        content: activeAgent.welcomeMessage,
        createdAt: new Date(),
        agentId: activeAgent.id
      }
    ]);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const promptText = input.trim();
    if (!promptText || isLoading) return;

    const userMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: promptText,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Dynamic template fallback in case backend is loading/offline
    const query = promptText.toLowerCase();
    let responseTemplate = activeAgent.responses.default;
    
    if (activeAgent.id === 'architect') {
      if (query.includes('react') || query.includes('component') || query.includes('hook') || query.includes('frontend')) {
        responseTemplate = activeAgent.responses.react;
      } else if (query.includes('design') || query.includes('system') || query.includes('scale') || query.includes('architect') || query.includes('redis') || query.includes('kafka')) {
        responseTemplate = activeAgent.responses.design;
      } else if (query.includes('ml') || query.includes('machine') || query.includes('network') || query.includes('model') || query.includes('ai') || query.includes('pytorch')) {
        responseTemplate = activeAgent.responses.ml;
      } else if (query.includes('python') || query.includes('fastapi') || query.includes('django') || query.includes('backend') || query.includes('sql') || query.includes('code')) {
        responseTemplate = "🐍 **Python & Backend Mastery Pathway:**\n\n1. **Core Language:** Async I/O (`asyncio`), Type Hints & Generators.\n2. **Frameworks:** FastAPI for async REST APIs & Pydantic validation schemas.\n3. **Databases:** PostgreSQL / Supabase with SQLAlchemy ORM.\n\n*Action Step: Execute a 25-min sprint in Focus Room to practice async endpoints!*";
      } else {
        responseTemplate = `🎯 **Skill Architect Curation Strategy:**\n\nRegarding **"${promptText}"**:\n\n1. **Foundations**: Establish underlying mental models and core syntax.\n2. **Practical Execution**: Build a clean, isolated working module.\n3. **Optimization**: Profile for latency, memory bottlenecks, and scale.\n\n*Check your **Journey Map** to track your interactive skill milestones!*`;
      }
    } else {
      if (query.includes('tired') || query.includes('exhaust') || query.includes('energy') || query.includes('burnout') || query.includes('sleep') || query.includes('fatigue')) {
        responseTemplate = activeAgent.responses.tired;
      } else if (query.includes('stress') || query.includes('anxious') || query.includes('worry') || query.includes('overwhelmed') || query.includes('panic')) {
        responseTemplate = activeAgent.responses.stress;
      } else if (query.includes('focus') || query.includes('distract') || query.includes('flow') || query.includes('sprint') || query.includes('work')) {
        responseTemplate = activeAgent.responses.focus;
      } else {
        responseTemplate = `🌿 **Well-Being Guardian Guidance:**\n\nRegarding **"${promptText}"**:\n\n1. **Pacing Check**: Ensure you alternate 50-minute focus sprints with 10-minute non-screen recovery.\n2. **Visual Reset**: Follow the **20-20-20 rule** to protect your optical nerve health.\n3. **Hydration**: Drink 300ml of cold water to maintain high neural clarity.\n\n*Would you like to start a guided 1-minute box-breathing cycle right now?*`;
      }
    }

    try {
      const historyFormatted = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        text: m.content
      }));

      // Call FastAPI backend — all AI logic handled server-side
      const backendRes = await chatWithBackend(
        `[${activeAgent.name}] ${promptText}`,
        historyFormatted.slice(-6)
      );

      const text = backendRes?.reply;
      if (text) {
        responseTemplate = text;
      }
    } catch (err) {
      console.warn('AI Agent request fallback:', err.message);
    }
    // Speak the response text safely
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(responseTemplate.replace(/[*#_`]/g, ''));
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (speechErr) {
      console.warn('Speech synthesis non-critical error:', speechErr);
      setIsSpeaking(false);
    }

    const assistantMessageId = Math.random().toString(36).substr(2, 9);
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
      agentId: activeAgent.id
    }]);

    setIsLoading(false);

    // Stream the response word by word
    const words = responseTemplate.split(' ');
    let currentWordIndex = 0;
    let streamedContent = '';

    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    streamIntervalRef.current = setInterval(() => {
      if (currentWordIndex < words.length) {
        streamedContent += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: streamedContent }
            : msg
        ));
        currentWordIndex++;
      } else {
        clearInterval(streamIntervalRef.current);
      }
    }, 35);
  };

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    clearChat
  };
}

export default function AgenticChat() {
  const [selectedAgentId, setSelectedAgentId] = useState('architect');
  const activeAgent = AGENT_PERSONAS[selectedAgentId];
  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, clearChat } = useMockChat(activeAgent);
  
  const chatEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Monitor scroll height to show/hide "jump to bottom" button
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const threshold = 150;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    setShowScrollBottomBtn(!isNearBottom);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
  };

  const AgentIcon = activeAgent.icon;

  // High-accuracy Markdown parser for code blocks, inline code, bolding, and bullet lists
  const renderFormattedTextLines = (textChunk) => {
    return textChunk.split('\n').map((line, idx) => {
      let content = line;
      let isBullet = false;

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        content = line.replace(/^[-*]\s+/, '');
        isBullet = true;
      } else if (/^\d+\.\s+/.test(line.trim())) {
        content = line.replace(/^\d+\.\s+/, '');
        isBullet = true;
      }

      // Process inline code `code` and bold **text**
      const inlineCodeParts = content.split(/`(.*?)`/g);
      const parsedText = inlineCodeParts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return (
            <code key={partIdx} className="bg-slate-800 text-emerald-300 font-mono text-xs px-1.5 py-0.5 rounded border border-white/10">
              {part}
            </code>
          );
        }
        const boldParts = part.split(/\*\*(.*?)\*\*/g);
        return boldParts.map((bPart, bIdx) =>
          bIdx % 2 === 1 ? <strong key={bIdx} className="font-bold text-white">{bPart}</strong> : bPart
        );
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex gap-2 ml-4 my-1">
            <span className="text-emerald-400 font-bold">•</span>
            <div className="flex-1 leading-relaxed">{parsedText}</div>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() ? "mb-2 leading-relaxed" : "h-2"}>
          {parsedText}
        </p>
      );
    });
  };

  const renderMessageContent = (text) => {
    if (!text) return null;

    // Check for code blocks ```
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('```')) {
          const match = part.match(/^```(\w+)?\n?([\s\S]*?)```$/);
          const lang = match ? match[1] || '' : '';
          const codeContent = match ? match[2] : part.slice(3, -3);
          return (
            <div key={idx} className="my-3 rounded-xl bg-slate-950 border border-white/10 overflow-hidden font-mono text-xs shadow-lg">
              {lang && (
                <div className="px-3 py-1 bg-white/5 border-b border-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {lang}
                </div>
              )}
              <pre className="p-3 text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                <code>{codeContent.trim()}</code>
              </pre>
            </div>
          );
        }
        return <div key={idx}>{renderFormattedTextLines(part)}</div>;
      });
    }

    return renderFormattedTextLines(text);
  };

  return (
    <div className="h-full flex flex-col bg-brand-card/30 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-brand-dark/40">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition ${activeAgent.color}`}>
            <AgentIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-bold text-sm text-slate-100">
              {activeAgent.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{activeAgent.role}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={clearChat}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Agent Selection Tabs */}
      <div className="grid grid-cols-2 p-1.5 bg-brand-darker/60 gap-1 border-b border-white/5">
        <button
          onClick={() => setSelectedAgentId('architect')}
          className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
            selectedAgentId === 'architect'
              ? 'bg-indigo-500/15 border border-indigo-500/20 text-indigo-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Skill Architect</span>
        </button>
        <button
          onClick={() => setSelectedAgentId('guardian')}
          className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
            selectedAgentId === 'guardian'
              ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Well-Being Guardian</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 select-text scroll-smooth"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              } animate-slide-up`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-md ${
                isUser 
                  ? 'bg-gradient-to-tr from-slate-700 to-slate-500' 
                  : AGENT_PERSONAS[msg.agentId]?.avatarBg || 'bg-emerald-500'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-3 rounded-2xl border text-sm shadow-sm ${
                isUser 
                  ? 'bg-indigo-600/90 border-indigo-500/30 text-white rounded-tr-sm' 
                  : `${AGENT_PERSONAS[msg.agentId]?.bubbleColor || 'bg-brand-card border-white/5'} rounded-tl-sm`
              }`}>
                {isUser ? (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>{renderMessageContent(msg.content)}</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${activeAgent.avatarBg}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className={`p-4 rounded-2xl border rounded-tl-sm text-sm flex items-center gap-1.5 ${activeAgent.bubbleColor}`}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Floating Scroll to Bottom Indicator */}
      {showScrollBottomBtn && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-white hover:text-emerald-400 shadow-lg backdrop-blur transition z-10 animate-bounce"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Quick Prompts Panel */}
      <div className="px-4 py-1.5 bg-brand-dark/20 border-t border-white/5 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {selectedAgentId === 'architect' ? (
          <>
            <button 
              onClick={() => handleQuickPrompt("How to master System Design?")}
              className="text-xs py-1 px-2.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 text-indigo-300 hover:bg-indigo-500/10 transition"
            >
              System Design
            </button>
            <button 
              onClick={() => handleQuickPrompt("Explain React Performance optimization.")}
              className="text-xs py-1 px-2.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 text-indigo-300 hover:bg-indigo-500/10 transition"
            >
              React Performance
            </button>
            <button 
              onClick={() => handleQuickPrompt("How do I learn Machine Learning?")}
              className="text-xs py-1 px-2.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 text-indigo-300 hover:bg-indigo-500/10 transition"
            >
              AI & ML Roadmap
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => handleQuickPrompt("I feel tired and burned out.")}
              className="text-xs py-1 px-2.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10 transition"
            >
              I feel exhausted
            </button>
            <button 
              onClick={() => handleQuickPrompt("How do I reduce my screen-time stress?")}
              className="text-xs py-1 px-2.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10 transition"
            >
              Stress management
            </button>
            <button 
              onClick={() => handleQuickPrompt("Help me focus on my current sprint.")}
              className="text-xs py-1 px-2.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10 transition"
            >
              Deep focus session
            </button>
          </>
        )}
      </div>

      {/* Input Message Area */}
      <form 
        onSubmit={handleSubmit}
        className="p-3 border-t border-white/5 bg-brand-dark/40 flex gap-2 items-center"
      >
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={`Message the ${activeAgent.name}...`}
          rows={1}
          className="flex-1 bg-brand-darker/80 border border-white/5 hover:border-white/10 focus:border-emerald-500/40 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-24 min-h-[38px] transition duration-150"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-2.5 rounded-xl flex items-center justify-center transition shadow-lg ${
            input.trim() && !isLoading 
              ? 'bg-emerald-500 hover:bg-emerald-400 text-brand-darker font-bold transform hover:scale-[1.03] active:scale-[0.97]' 
              : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
