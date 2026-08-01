/**
 * ============================================================
 * SYNAPSE AI — FastAPI Backend Client
 * All React components use THIS file to talk exclusively to the Python backend.
 *
 * Backend runs at: http://localhost:8000
 * Start it with:  cd backend && uvicorn main:app --reload --port 8000
 * ============================================================
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Generic POST fetch wrapper
async function apiFetch(path, body) {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[BackendAPI] POST ${path} failed:`, err.message);
    return null;
  }
}

// Generic GET fetch wrapper
async function apiGet(path) {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[BackendAPI] GET ${path} failed:`, err.message);
    return null;
  }
}

// Generic DELETE fetch wrapper
async function apiDelete(path) {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[BackendAPI] DELETE ${path} failed:`, err.message);
    return null;
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

// ── PILLAR 1: Chatbot & History ──────────────────────────────
export async function chatWithBackend(message, history = [], userId = 'usr_default') {
  return apiFetch('/api/chat', { message, history, user_id: userId });
}

export async function getChatHistoryFromBackend(userId = 'usr_default') {
  return apiGet(`/api/chat/history?user_id=${encodeURIComponent(userId)}`);
}

export async function clearChatHistoryInBackend(userId = 'usr_default') {
  return apiDelete(`/api/chat/history?user_id=${encodeURIComponent(userId)}`);
}

// ── PILLAR 2: Content Recommendations ────────────────────────
export async function recommendContent(goal, mood = 'focused', userId = 'usr_default') {
  return apiFetch('/api/recommend', { goal, mood, user_id: userId });
}

// ── PILLAR 3: Habit Steering / Digital Guardian ───────────────
export async function checkHabitSteering(activity, durationMinutes, userId = 'usr_default') {
  return apiFetch('/api/habit-check', {
    activity,
    duration_minutes: durationMinutes,
    user_id: userId
  });
}

export async function saveHabitLogToBackend(logData) {
  return apiFetch('/api/habit-logs', logData);
}

export async function getHabitLogsFromBackend(userId = 'usr_default') {
  return apiGet(`/api/habit-logs?user_id=${encodeURIComponent(userId)}`);
}

// ── PILLAR 4: Intent Analysis ─────────────────────────────────
export async function analyzeIntentWithBackend(goal, mood = 'focused') {
  return apiFetch('/api/analyze-intent', { goal, mood });
}

export async function analyzeGoalWithAI(goal, userName = 'User') {
  return apiFetch('/api/analyze-intent', { goal, user_name: userName });
}

// ── PILLAR 5: User Aspiration / Onboarding ────────────────────
export async function saveAspirationToBackend(aspirationData) {
  return apiFetch('/api/aspiration', aspirationData);
}

export async function getAspirationsFromBackend(userId = 'usr_default') {
  return apiGet(`/api/aspiration?user_id=${encodeURIComponent(userId)}`);
}

// ── PILLAR 6: Focus Room Sessions ─────────────────────────────
export async function saveFocusSessionToBackend(sessionData) {
  return apiFetch('/api/focus-sessions', sessionData);
}

export async function getFocusSessionsFromBackend(userId = 'usr_default') {
  return apiGet(`/api/focus-sessions?user_id=${encodeURIComponent(userId)}`);
}

// ── PILLAR 7: Reflections & Journaling ────────────────────────
export async function saveReflectionToBackend(mood, logText, userId = 'usr_default') {
  return apiFetch('/api/reflections', { mood, log_text: logText, user_id: userId });
}

export async function getReflectionsFromBackend(userId = 'usr_default') {
  return apiGet(`/api/reflections?user_id=${encodeURIComponent(userId)}`);
}

// ── PILLAR 8: Auth & Identity Profile ─────────────────────────
export async function registerWithBackend(email, password, displayName = 'Atharva Sur') {
  return apiFetch('/api/auth/register', { email, password, display_name: displayName });
}

export async function loginWithBackend(email, password) {
  return apiFetch('/api/auth/login', { email, password });
}

export async function getUserProfileFromBackend(userId = 'usr_default') {
  return apiGet(`/api/user/profile?user_id=${encodeURIComponent(userId)}`);
}

export async function saveUserProfileToBackend(profileData) {
  return apiFetch('/api/user/profile', profileData);
}

// ── PILLAR 9: Deep Skill Focus & Model Self-Training ──────────
export async function getDeepSkillState(userId = 'usr_default') {
  return apiGet(`/api/deep-skill/state?user_id=${encodeURIComponent(userId)}`);
}

export async function trainDeepSkillModel(skills, condition, aspiration, triggerAction = 'calibration', userId = 'usr_default') {
  return apiFetch('/api/deep-skill/train', {
    user_id: userId,
    skills,
    condition,
    aspiration,
    trigger_action: triggerAction
  });
}

export async function askDeepSkillQA(skill, question, history = [], userId = 'usr_default') {
  return apiFetch('/api/deep-skill/qa', {
    user_id: userId,
    skill,
    question,
    history
  });
}

export async function submitDeepSkillQuizAnswer(skill, question, selectedOption, correctOption, userId = 'usr_default') {
  const result = await apiFetch('/api/deep-skill/submit-answer', {
    user_id: userId,
    skill,
    question,
    selected_option: selectedOption,
    correct_option: correctOption
  });
  if (result) {
    window.dispatchEvent(new CustomEvent('quizSubmitted'));
  }
  return result;
}

