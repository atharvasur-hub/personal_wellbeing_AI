import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate if real Supabase credentials exist (ignoring placeholder URLs)
const isRealSupabaseConfig = rawSupabaseUrl && 
  rawSupabaseAnonKey && 
  !rawSupabaseUrl.includes('your-supabase-project-id') && 
  !rawSupabaseUrl.includes('your-project-id');

export const supabase = isRealSupabaseConfig 
  ? createClient(rawSupabaseUrl, rawSupabaseAnonKey) 
  : null;

// ==========================================
// SUPABASE AUTHENTICATION HELPERS
// ==========================================

export async function signUpWithEmail(email, password, displayName = 'Atharva Sur') {
  if (!supabase) {
    return { 
      user: { 
        id: 'local_user_' + Date.now(), 
        email, 
        user_metadata: { display_name: displayName } 
      }, 
      error: null 
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });

    if (error) {
      // If error is network related or invalid URL, fallback to local user creation
      if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('URL')) {
        return {
          user: { id: 'user_' + Date.now(), email, user_metadata: { display_name: displayName } },
          error: null
        };
      }
      return { user: null, error: error.message };
    }

    if (data?.user) {
      await supabase.from('profiles').upsert([{
        user_id: data.user.id,
        display_name: displayName,
        current_role: 'Growth Catalyst • Tier 3'
      }], { onConflict: 'user_id' }).catch(() => {});
    }

    return { user: data?.user || { id: 'user_' + Date.now(), email }, error: null };
  } catch (err) {
    // Graceful fallback for network or connection failures
    return { 
      user: { 
        id: 'local_user_' + Date.now(), 
        email, 
        user_metadata: { display_name: displayName } 
      }, 
      error: null 
    };
  }
}

export async function signInWithEmail(email, password) {
  if (!supabase) {
    return { 
      user: { 
        id: 'local_user_' + Date.now(), 
        email, 
        user_metadata: { display_name: email.split('@')[0] } 
      }, 
      error: null 
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('fetch') || error.message.includes('Network')) {
        return {
          user: { id: 'user_' + Date.now(), email, user_metadata: { display_name: email.split('@')[0] } },
          error: null
        };
      }
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  } catch (err) {
    return { 
      user: { 
        id: 'local_user_' + Date.now(), 
        email, 
        user_metadata: { display_name: email.split('@')[0] } 
      }, 
      error: null 
    };
  }
}

export async function signInWithGoogle() {
  if (!supabase) {
    return { 
      user: { 
        id: 'google_local_' + Date.now(),
        email: 'google.user@gmail.com', 
        user_metadata: { display_name: 'Atharva Sur (Google)' } 
      }, 
      error: null 
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { prompt: 'select_account' },
        redirectTo: window.location.origin
      }
    });
    if (error) return { user: null, error: error.message };
    return { user: data, error: null };
  } catch (err) {
    return { 
      user: { 
        id: 'google_local_' + Date.now(),
        email: 'google.user@gmail.com', 
        user_metadata: { display_name: 'Atharva Sur (Google)' } 
      }, 
      error: null 
    };
  }
}

export function subscribeToAuthState(onUserChanged) {
  if (!supabase) return () => {};
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = session.user;
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
      
      await supabase.from('profiles').upsert([{
        user_id: user.id,
        display_name: displayName,
        current_role: 'Growth Catalyst • Tier 3'
      }], { onConflict: 'user_id' }).catch(() => {});

      onUserChanged({
        email: user.email,
        name: displayName,
        id: user.id
      });
    } else {
      onUserChanged(null);
    }
  });

  return () => subscription?.unsubscribe();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
      id: user.id
    };
  } catch (err) {
    return null;
  }
}

export async function signOutUser() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out error:', err);
  }
}

// ==========================================
// ML & PER-USER DATABASE HELPERS
// ==========================================

export async function saveUserAspirationToSupabase(aspirationData) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_aspirations')
      .insert([aspirationData])
      .select();
    if (error) console.warn('Supabase aspiration error:', error.message);
    return data;
  } catch (err) {
    return null;
  }
}

export async function saveHabitSteeringLogToSupabase(logData) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('habit_steering_logs')
      .insert([logData])
      .select();
    if (error) console.warn('Supabase habit log error:', error.message);
    return data;
  } catch (err) {
    return null;
  }
}

export async function fetchChatHistoryFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function saveChatMessageToSupabase(role, text, suggestions = []) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ role, text, suggestions }])
      .select();
    return data;
  } catch (err) {
    return null;
  }
}

export async function clearChatHistoryInSupabase() {
  if (!supabase) return null;
  try {
    await supabase
      .from('chat_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (err) {
    console.warn('Supabase clear exception:', err);
  }
}

export async function saveReflectionToSupabase(mood, log_text) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('reflections')
      .insert([{ mood, log_text }])
      .select();
    return data;
  } catch (err) {
    return null;
  }
}
