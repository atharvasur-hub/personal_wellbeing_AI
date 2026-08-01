/**
 * Synapse AI Chatbot — Frontend Thin Layer
 * All AI logic is handled by FastAPI backend (localhost:8000).
 * This file is a simple pass-through to backendApi.js.
 */
import { chatWithBackend } from './backendApi';

function getSmartFrontendFallback(userMessage) {
  const msg = (userMessage || '').toLowerCase();

  if (msg.includes('python') || msg.includes('fastapi') || msg.includes('django') || msg.includes('code')) {
    return {
      text: "🐍 **Python & Backend Mastery Pathway:**\n\n1. **Core:** Asynchronous I/O (`asyncio`), Generators & Type Hints.\n2. **Frameworks:** FastAPI for high-performance REST APIs & automatic Swagger docs.\n3. **Data & Storage:** Supabase PostgreSQL, SQLite & Pydantic schemas.\n\n*What specific Python module or design pattern are you working on?*",
      suggestions: ['FastAPI setup', 'Async python', 'Database ORM']
    };
  }
  if (msg.includes('react') || msg.includes('frontend') || msg.includes('component') || msg.includes('hook')) {
    return {
      text: "⚡ **React & Frontend Architecture Blueprint:**\n\n1. **State & Performance:** `useState`, `useReducer`, and `useMemo` for stable memory allocations.\n2. **Component Lifecycle:** `useEffect` dependency hygiene & event listener cleanups.\n3. **Modern Styling:** Tailwind CSS, Framer Motion animations & Vite bundling.\n\n*Would you like a step-by-step code snippet?*",
      suggestions: ['React performance', 'Custom hooks', 'Tailwind layout']
    };
  }
  if (msg.includes('ml') || msg.includes('ai') || msg.includes('model') || msg.includes('neural')) {
    return {
      text: "🎯 **AI & Deep Learning Mastery Roadmap:**\n\n1. **Foundations:** Matrix math, calculus, NumPy & Pandas.\n2. **Frameworks:** PyTorch Tensors, Autograd & Loss optimization.\n3. **Production AI:** Vector DBs, RAG systems & LLM fine-tuning.\n\n*Check your Journey Map tab for interactive skill milestones!*",
      suggestions: ['AI Roadmap', 'PyTorch tutorial', 'RAG Architecture']
    };
  }
  if (msg.includes('tired') || msg.includes('stress') || msg.includes('burnout') || msg.includes('rest')) {
    return {
      text: "🌿 **Well-Being & Cognitive Reset:**\n\n1. **20-20-20 Rule:** Look at an object 20 feet away for 20 seconds.\n2. **Box Breathing:** Inhale 4s, hold 4s, exhale 4s, hold 4s.\n3. **Hydrate:** Sip a glass of water and disconnect from emissive screens for 10 mins.\n\n*Shall we launch a 15-minute restorative Focus Sprint block?*",
      suggestions: ['Start Box Breathing', 'Focus Sprint', 'Hydration reminder']
    };
  }

  return {
    text: `Greetings! I am your Synapse AI Growth Architect.\n\nRegarding **"${userMessage}"**:\n\n1. **Target Milestone:** Break this down into foundational concepts and hands-on practice.\n2. **Deep Work Sprint:** Execute a 25-minute focused block to make immediate progress.\n3. **Tracking:** Use your Journey Map and Active Recall modules to measure retention.`,
    suggestions: ['Analyze Aspiration Gap', 'Generate Focus Sprint', 'Open Active Recall']
  };
}

/**
 * Generate a chatbot response via FastAPI backend.
 * @param {string} userMessage
 * @param {Array}  history  [{role, text}]
 * @param {string} userId
 */
export async function generateAIResponse(userMessage, history = [], userId = null) {
  const result = await chatWithBackend(userMessage, history, userId);

  if (result?.reply) {
    return {
      text: result.reply,
      suggestions: result.suggestions || [],
      source: 'fastapi'
    };
  }

  // Smart local engine fallback if backend is offline
  const fallback = getSmartFrontendFallback(userMessage);
  return {
    text: fallback.text,
    suggestions: fallback.suggestions,
    source: 'local_engine'
  };
}
