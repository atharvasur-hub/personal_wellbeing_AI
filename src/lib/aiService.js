/**
 * ============================================================
 * SYNAPSE AI CHATBOT ENGINE
 * Priority chain:
 *   1. FastAPI backend (localhost:8000/api/chat)   ← PRIMARY
 *   2. Direct Gemini API (browser)                 ← FALLBACK
 *   3. Smart offline responses                     ← OFFLINE
 * ============================================================
 */
import { GoogleGenAI } from '@google/genai';
import { chatWithBackend } from './backendApi';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const isKeyConfigured =
  GEMINI_API_KEY &&
  GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' &&
  GEMINI_API_KEY.length > 10;

const ai = isKeyConfigured ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const SYSTEM_PROMPT = `
You are Synapse AI — an elite personal growth and wellbeing AI assistant.
Help the user achieve their goals, improve focus, manage habits, and accelerate learning.
Tone: supportive, precise, motivating, and high-tech.
Keep responses to 3-5 sentences unless the user asks for detail.
Always tie advice to the user's stated goals and wellbeing.
`.trim();

/**
 * Generate an AI chatbot response.
 * Tries FastAPI backend → Direct Gemini → Smart offline fallback.
 */
export async function generateAIResponse(userMessage, history = [], userId = null) {

  // ── 1. TRY FASTAPI BACKEND (localhost:8000) ───────────────
  try {
    const backendResult = await chatWithBackend(userMessage, history, userId);
    if (backendResult?.reply) {
      console.log('[Synapse AI] ✅ Responded via FastAPI backend');
      return {
        text: backendResult.reply,
        suggestions: backendResult.suggestions || buildSuggestions(userMessage),
        source: 'backend'
      };
    }
  } catch {
    // Backend offline — proceed to next engine
  }

  // ── 2. DIRECT GEMINI API (browser-side) ──────────────────
  if (ai) {
    try {
      const recentHistory = history.slice(-6);
      const contextBlock = recentHistory
        .map(m => `${m.role === 'user' ? 'User' : 'Synapse AI'}: ${m.text || m.content || ''}`)
        .join('\n');

      const fullPrompt = contextBlock
        ? `${SYSTEM_PROMPT}\n\nConversation so far:\n${contextBlock}\n\nUser: ${userMessage}\nSynapse AI:`
        : `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\nSynapse AI:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: { temperature: 0.7, maxOutputTokens: 400 }
      });

      const text = response.text?.trim();
      if (text) {
        console.log('[Synapse AI] ✅ Responded via direct Gemini API');
        return { text, suggestions: buildSuggestions(userMessage), source: 'gemini' };
      }
    } catch (err) {
      console.warn('[Synapse AI] Gemini API error:', err.message);
    }
  }

  // ── 3. SMART OFFLINE FALLBACK ─────────────────────────────
  console.log('[Synapse AI] ⚠️ Using offline fallback response');
  return buildFallbackResponse(userMessage);
}

function buildSuggestions(prompt) {
  const p = prompt.toLowerCase();
  if (p.match(/focus|distract|productiv/))
    return ['Start a 25-min focus sprint', 'Block social media now', 'Try box breathing'];
  if (p.match(/goal|learn|study|master/))
    return ['Curate 4 resources for me', 'Analyse my aspiration gap', 'Build 7-day roadmap'];
  if (p.match(/tired|sleep|energy|burnout/))
    return ['View sleep protocol', 'Log energy baseline', 'Start recovery sprint'];
  if (p.match(/habit|routine|morning/))
    return ['Build a morning routine', 'Set a daily reminder', 'Track habit streak'];
  return ['Analyse my aspiration gap', 'Generate a focus sprint', 'Curate 4 resources for me'];
}

function buildFallbackResponse(userMessage) {
  const p = userMessage.toLowerCase();

  if (p.match(/^(hi|hello|hey)/))
    return {
      text: "Hello! I'm Synapse AI. I can help with goals, focus, habits, and learning. Start the FastAPI backend (`cd backend && uvicorn main:app --reload`) or add your Gemini API key to unlock live responses. What's your goal today?",
      suggestions: ['How do I start the backend?', 'Tell me my goal', 'Curate 4 resources'],
      source: 'offline'
    };

  if (p.match(/backend|api|fastapi|server/))
    return {
      text: "To start the FastAPI backend: open a new terminal → `cd backend` → `pip install -r requirements.txt` → `uvicorn main:app --reload --port 8000`. Then add your GEMINI_API_KEY to backend/.env. The React app will automatically connect to it.",
      suggestions: ['Show me the endpoints', 'What does the backend do?', 'Get Gemini key'],
      source: 'offline'
    };

  if (p.match(/focus|distract|productiv/))
    return {
      text: "Go to the Focus Room tab, set a manual timer for your sprint, and lock the session. The Digital Guardian will block tab switches and the Escape key — keeping you in a deep work state. Every focused block compounds your trajectory by 3× over passive browsing.",
      suggestions: ['Open Focus Room', 'Start 25-min sprint', 'Try box breathing'],
      source: 'offline'
    };

  if (p.match(/goal|learn|study|master/))
    return {
      text: "Tell me your specific goal and I'll curate 4 pieces of content — a Video, Short, Reel, and Article — calibrated to your exact learning objective. The more specific the goal, the higher the signal-to-noise ratio.",
      suggestions: ['Curate 4 resources for me', 'Analyse my aspiration gap', 'Build 7-day roadmap'],
      source: 'offline'
    };

  if (p.match(/tired|sleep|energy|burnout/))
    return {
      text: "Cognitive recovery is non-negotiable. Prioritise 7-9 hours with consistent sleep and wake times. A 10-minute optic nerve rest after lunch resets your afternoon focus window. Sleep compounds learning retention by 40%.",
      suggestions: ['View sleep protocol', 'Log energy baseline', 'Start recovery sprint'],
      source: 'offline'
    };

  if (p.match(/habit|routine|morning/))
    return {
      text: "The most effective morning protocol: 10 min sunlight → hydrate → 90 min deep work block before any social media. This sequence primes your prefrontal cortex for maximum cognitive output.",
      suggestions: ['Build my morning routine', 'Set daily reminder', 'Track habit streak'],
      source: 'offline'
    };

  return {
    text: "Start the FastAPI backend (`cd backend && uvicorn main:app --reload`) and add your Gemini key to `backend/.env` for full live AI responses. I can help with goals, focus sprints, content curation, and habit steering!",
    suggestions: ['Curate 4 resources for me', 'Open Focus Room', 'Analyse my aspiration gap'],
    source: 'offline'
  };
}
