/**
 * ============================================================
 * SYNAPSE AI CHATBOT ENGINE
 * Uses Google Gemini API as primary engine.
 *
 * TO ENABLE LIVE AI:
 *   Open .env and set VITE_GEMINI_API_KEY=your_key_here
 *   Get a free key at: https://aistudio.google.com/app/apikey
 * ============================================================
 */
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize Gemini client only if a real key is present
const isKeyConfigured =
  GEMINI_API_KEY &&
  GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' &&
  GEMINI_API_KEY.length > 10;

const ai = isKeyConfigured ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const SYSTEM_PROMPT = `
You are Synapse AI — an elite personal growth and wellbeing AI assistant.
Your role is to help the user achieve their goals, improve focus, manage habits, and accelerate learning.
Your tone is: supportive, precise, motivating, and high-tech.
Keep responses concise (3-5 sentences max unless the user asks for detail).
Always tie your advice directly to the user's stated goals and wellbeing.
`.trim();

/**
 * Generate a live AI chatbot response.
 * @param {string} userMessage - The user's latest message
 * @param {Array}  history     - Previous messages [{role, text}]
 * @returns {{ text: string, suggestions: string[] }}
 */
export async function generateAIResponse(userMessage, history = []) {
  // ── LIVE GEMINI PATH ──────────────────────────────────────
  if (ai) {
    try {
      // Build conversation context (last 6 messages)
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
        return { text, suggestions: buildSuggestions(userMessage) };
      }
    } catch (err) {
      console.warn('[Synapse AI] Gemini API error:', err.message);
      // Fall through to smart fallback
    }
  }

  // ── SMART FALLBACK (No API key configured) ────────────────
  return buildFallbackResponse(userMessage);
}

// ── Contextual follow-up suggestions ─────────────────────────
function buildSuggestions(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('focus') || p.includes('distract'))
    return ['Start a 25-min focus sprint', 'Block social media now', 'Try box breathing'];
  if (p.includes('goal') || p.includes('learn') || p.includes('skill'))
    return ['Curate 4 resources for me', 'Analyse my aspiration gap', 'Build a 7-day roadmap'];
  if (p.includes('tired') || p.includes('sleep') || p.includes('energy'))
    return ['Start a recovery sprint', 'View sleep protocol', 'Log energy baseline'];
  if (p.includes('habit') || p.includes('routine'))
    return ['Build a morning routine', 'Set a daily reminder', 'Track habit streak'];
  return ['Analyse my aspiration gap', 'Generate a focus sprint', 'Curate 4 resources for me'];
}

// ── Smart offline / no-key fallbacks ─────────────────────────
function buildFallbackResponse(userMessage) {
  const p = userMessage.toLowerCase();

  // Greeting
  if (p.match(/^(hi|hello|hey|what's up)/))
    return {
      text: "Hello! I'm Synapse AI, your growth architect. I'm currently running in offline mode — add your Gemini API key in the `.env` file to unlock live AI responses. What's your goal today?",
      suggestions: ['How do I add my API key?', 'Tell me my goal', 'Curate 4 resources for me']
    };

  // API key question
  if (p.includes('api') || p.includes('key') || p.includes('gemini'))
    return {
      text: "To enable live AI: open the `.env` file in your project root and set `VITE_GEMINI_API_KEY=your_key_here`. Get a free key at https://aistudio.google.com/app/apikey — then restart the dev server with `npm run dev`.",
      suggestions: ['Get Gemini key', 'What can you do with AI?', 'Test after setup']
    };

  // Focus / distraction
  if (p.includes('focus') || p.includes('distract') || p.includes('productive'))
    return {
      text: "Great time to recalibrate! Go to the Focus Room tab, set a manual timer, and lock your session. The digital guardian will block tab switches and the Escape key. Deep work compounds — every 25-min block accelerates your trajectory by 3× passive learning.",
      suggestions: ['Open Focus Room', 'Start 25-min sprint', 'Try box breathing']
    };

  // Goal / learning
  if (p.includes('goal') || p.includes('learn') || p.includes('study') || p.includes('master'))
    return {
      text: "Excellent initiative. Tell me your specific goal and I'll curate 4 pieces of content — a Video, Short, Reel, and Article — calibrated to your exact learning objective. The more specific the goal, the higher the signal-to-noise ratio of the recommendations.",
      suggestions: ['Curate 4 resources for me', 'Analyse my aspiration gap', 'Build 7-day roadmap']
    };

  // Sleep / energy / wellbeing
  if (p.includes('tired') || p.includes('sleep') || p.includes('energy') || p.includes('burnout'))
    return {
      text: "Cognitive recovery is non-negotiable. Prioritise 7-9 hours with consistent sleep and wake times. A 10-minute optic nerve rest (no screens) after lunch resets your afternoon focus window. Neuroscience confirms sleep compounds learning retention by 40%.",
      suggestions: ['View sleep protocol', 'Log energy baseline', 'Start recovery sprint']
    };

  // Habits / routine
  if (p.includes('habit') || p.includes('routine') || p.includes('morning'))
    return {
      text: "Habits are identity architecture. The most effective morning protocol is: 10 min sunlight → hydrate → 90 min deep work block before checking any social media. This sequence primes your prefrontal cortex for maximum output.",
      suggestions: ['Build my morning routine', 'Set daily reminder', 'Track habit streak']
    };

  // Generic fallback
  return {
    text: "I'm processing your input. For the most powerful experience, add your Gemini API key in `.env` (VITE_GEMINI_API_KEY) to unlock live, context-aware responses. In the meantime, I can help you set a focus sprint, curate 4 content items, or analyse your aspiration gap.",
    suggestions: ['Curate 4 resources for me', 'Open Focus Room', 'Analyse my aspiration gap']
  };
}
