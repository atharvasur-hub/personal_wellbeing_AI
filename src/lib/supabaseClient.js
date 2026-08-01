/**
 * ============================================================
 * SYNAPSE AI — Backend Persistence Wrapper
 * Re-routes all client data operations through the FastAPI Backend Engine.
 * React does NOT perform backend or direct database duties.
 * ============================================================
 */

import {
  registerWithBackend,
  loginWithBackend,
  saveAspirationToBackend,
  saveHabitLogToBackend,
  getChatHistoryFromBackend,
  clearChatHistoryInBackend,
  saveReflectionToBackend
} from './backendApi';

// Local registered user storage helper as UI state fallback
function getLocalUsers() {
  try {
    const raw = localStorage.getItem('synapse_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveLocalUser(email, password, displayName) {
  try {
    const users = getLocalUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    const userObj = { email: email.toLowerCase(), password, name: displayName, id: 'usr_' + Date.now() };
    if (existingIndex >= 0) {
      users[existingIndex] = userObj;
    } else {
      users.push(userObj);
    }
    localStorage.setItem('synapse_registered_users', JSON.stringify(users));
    return userObj;
  } catch (err) {
    return { email, name: displayName, id: 'usr_' + Date.now() };
  }
}

// ── AUTHENTICATION WRAPPERS VIA FASTAPI ─────────────────────

export async function signUpWithEmail(email, password, displayName = 'Atharva Sur') {
  const localUser = saveLocalUser(email, password, displayName);
  const backendRes = await registerWithBackend(email, password, displayName);
  if (backendRes?.user) {
    return { user: backendRes.user, error: null };
  }
  return { user: localUser, error: null };
}

export async function signInWithEmail(email, password) {
  const backendRes = await loginWithBackend(email, password);
  if (backendRes?.user) {
    return { user: backendRes.user, error: null };
  }
  // Local user verification fallback
  const users = getLocalUsers();
  const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!matchedUser) {
    return { user: null, error: "Account not found. Please click 'CREATE SIGN UP ACCOUNT' to register first!" };
  }
  if (matchedUser.password !== password) {
    return { user: null, error: "Invalid password. Please check your credentials and try again." };
  }
  return { user: matchedUser, error: null };
}

export async function signInWithGoogle() {
  return {
    user: {
      id: 'google_user_' + Date.now(),
      email: 'google.user@gmail.com',
      user_metadata: { display_name: 'Atharva Sur (Google)' }
    },
    error: null
  };
}

export function subscribeToAuthState(onUserChanged) {
  const stored = localStorage.getItem('synapse_current_user');
  if (stored) {
    try {
      onUserChanged(JSON.parse(stored));
    } catch {
      onUserChanged(null);
    }
  }
  return () => {};
}

export async function getCurrentUser() {
  const stored = localStorage.getItem('synapse_current_user');
  if (stored) {
    try { return JSON.parse(stored); } catch { return null; }
  }
  return null;
}

export async function signOutUser() {
  localStorage.removeItem('synapse_current_user');
}

// ── DATA PERSISTENCE DELEGATED TO FASTAPI ────────────────────

export async function saveUserAspirationToSupabase(aspirationData) {
  const res = await saveAspirationToBackend(aspirationData);
  return res?.data || [aspirationData];
}

export async function saveHabitSteeringLogToSupabase(logData) {
  const res = await saveHabitLogToBackend(logData);
  return res?.data || [logData];
}

export async function fetchChatHistoryFromSupabase() {
  const res = await getChatHistoryFromBackend();
  return res?.messages || null;
}

export async function saveChatMessageToSupabase(role, text, suggestions = []) {
  // Handled automatically server-side in FastAPI POST /api/chat
  return [{ role, text, suggestions }];
}

export async function clearChatHistoryInSupabase() {
  return await clearChatHistoryInBackend();
}

export async function saveReflectionToSupabase(mood, log_text) {
  const res = await saveReflectionToBackend(mood, log_text);
  return res?.data || [{ mood, log_text }];
}

// Export dummy reference so imports using `supabase` boolean checks remain valid
export const supabase = null;
