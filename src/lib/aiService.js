/**
 * Synapse AI Chatbot — Frontend Thin Layer
 * All AI logic is handled by FastAPI backend (localhost:8000).
 * This file is a simple pass-through to backendApi.js.
 */
import { chatWithBackend } from './backendApi';

function getSmartFrontendFallback(userMessage) {
  const msg = (userMessage || '').toLowerCase();
  
  const hasWord = (word) => new RegExp(`\\b${word}\\b`, 'i').test(msg);

  if (hasWord('java') && !hasWord('javascript')) {
    return {
      text: "☕ **Java Core & Enterprise Architecture:**\n\n```java\n// Object-Oriented Java Fundamentals\npublic class LearningTask {\n    private String title;\n    private boolean completed;\n\n    public LearningTask(String title) {\n        this.title = title;\n        this.completed = false;\n    }\n\n    public static void main(String[] args) {\n        LearningTask task = new LearningTask(\"Master Java OOP & JVM\");\n        System.out.println(task.title);\n    }\n}\n```\n\n1. **OOP Core:** Encapsulation, Inheritance, Polymorphism, Abstraction.\n2. **JVM & Memory:** Heap vs Stack, Garbage Collection tuning.\n3. **Enterprise Stack:** Spring Boot, REST APIs & JPA/Hibernate.",
      suggestions: ['Java OOP Concepts', 'Spring Boot Setup', 'JVM Memory Tuning']
    };
  }

  if (['python', 'pip', 'django', 'fastapi', 'flask', 'code'].some(hasWord)) {
    return {
      text: "🐍 **Python & Backend Mastery Pathway:**\n\n1. **Core:** Asynchronous I/O (`asyncio`), Generators & Type Hints.\n2. **Frameworks:** FastAPI for high-performance REST APIs & automatic Swagger docs.\n3. **Data & Storage:** Supabase PostgreSQL, SQLite & Pydantic schemas.\n\n*What specific Python module or design pattern are you working on?*",
      suggestions: ['FastAPI setup', 'Async python', 'Database ORM']
    };
  }
  if (['react', 'frontend', 'component', 'hook', 'javascript', 'js'].some(hasWord)) {
    return {
      text: "⚡ **React & Frontend Architecture Blueprint:**\n\n1. **State & Performance:** `useState`, `useReducer`, and `useMemo` for stable memory allocations.\n2. **Component Lifecycle:** `useEffect` dependency hygiene & event listener cleanups.\n3. **Modern Styling:** Tailwind CSS, Framer Motion animations & Vite bundling.\n\n*Would you like a step-by-step code snippet?*",
      suggestions: ['React performance', 'Custom hooks', 'Tailwind layout']
    };
  }
  if (['ml', 'ai', 'pytorch', 'tensorflow', 'transformer', 'llm', 'rag'].some(hasWord)) {
    return {
      text: "🎯 **AI & Deep Learning Mastery Roadmap:**\n\n1. **Foundations:** Matrix math, calculus, NumPy & Pandas.\n2. **Frameworks:** PyTorch Tensors, Autograd & Loss optimization.\n3. **Production AI:** Vector DBs, RAG systems & LLM fine-tuning.\n\n*Check your Journey Map tab for interactive skill milestones!*",
      suggestions: ['AI Roadmap', 'PyTorch tutorial', 'RAG Architecture']
    };
  }
  if (['tired', 'stress', 'burnout', 'rest', 'fatigue'].some(hasWord)) {
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
