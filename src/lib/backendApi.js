/**
 * ============================================================
 * SYNAPSE AI — FastAPI Backend Client
 * All React components use THIS file to talk to the Python backend.
 *
 * Backend runs at: http://localhost:8000
 * Start it with:  cd backend && uvicorn main:app --reload --port 8000
 * ============================================================
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Generic fetch wrapper with error handling
async function apiFetch(path, body) {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // 10-second timeout
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[BackendAPI] ${path} failed:`, err.message);
    return null; // Caller handles null as "backend offline"
  }
}

// ── Health check ─────────────────────────────────────────────
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/`, {
      signal: AbortSignal.timeout(3000)
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── PILLAR 1: Chatbot ─────────────────────────────────────────
/**
 * POST /api/chat
 * @param {string} message
 * @param {Array}  history  - [{role, text}]
 * @param {string} userId
 * @returns {{ reply: string, suggestions: string[] } | null}
 */
export async function chatWithBackend(message, history = [], userId = null) {
  return apiFetch('/api/chat', { message, history, user_id: userId });
}

// ── PILLAR 2: Content Recommendations ────────────────────────
/**
 * POST /api/recommend
 * @param {string} goal
 * @param {string} mood
 * @param {string} userId
 * @returns {{ goal, items: ContentItem[], intent_domain } | null}
 */
export async function recommendContent(goal, mood = 'focused', userId = null) {
  return apiFetch('/api/recommend', { goal, mood, user_id: userId });
}

// ── PILLAR 3: Habit Steering / Digital Guardian ───────────────
/**
 * POST /api/habit-check
 * @param {string} activity
 * @param {number} durationMinutes
 * @param {string} userId
 * @returns {{ intercept_required: bool, reason, redirect_suggestion, time_saved_minutes } | null}
 */
export async function checkHabitSteering(activity, durationMinutes, userId = null) {
  return apiFetch('/api/habit-check', {
    activity,
    duration_minutes: durationMinutes,
    user_id: userId
  });
}

// ── PILLAR 4: Intent Analysis ─────────────────────────────────
/**
 * POST /api/analyze-intent
 * @param {string} goal
 * @param {string} mood
 * @returns {{ primary_goal, domain, cognitive_energy_score, focus_priority } | null}
 */
export async function analyzeIntentWithBackend(goal, mood = 'focused') {
  return apiFetch('/api/analyze-intent', { goal, mood });
}

export async function analyzeGoalWithAI(goal, userName = 'User') {
  return apiFetch('/api/analyze-intent', { goal, user_name: userName });
}

