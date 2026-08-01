import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize client only if valid URL is provided, otherwise export fallback client instance
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// SUPABASE AUTHENTICATION HELPERS
// ==========================================

// Sign Up with Email & Password
export async function signUpWithEmail(email, password, displayName = 'Atharva Sur') {
  if (!supabase) {
    return { user: { email, user_metadata: { display_name: displayName } }, error: null };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });

    if (error) return { user: null, error: error.message };

    // Create entry in public.profiles table if user created successfully
    if (data?.user) {
      await supabase.from('profiles').upsert([{
        user_id: data.user.id,
        display_name: displayName,
        current_role: 'Growth Catalyst • Tier 3'
      }]);
    }

    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}

// Log In with Email & Password
export async function signInWithEmail(email, password) {
  if (!supabase) {
    return { user: { email, user_metadata: { display_name: email.split('@')[0] } }, error: null };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}

// Log In / Sign Up with Google OAuth Account
export async function signInWithGoogle() {
  if (!supabase) {
    return { 
      user: { 
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
        redirectTo: window.location.origin
      }
    });
    
    if (error) return { user: null, error: error.message };
    return { user: data, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}

// Subscribe to Supabase Auth State Changes (Handles Google OAuth Redirect)
export function subscribeToAuthState(onUserChanged) {
  if (!supabase) return () => {};
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = session.user;
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
      
      // Ensure Google profile exists in database
      await supabase.from('profiles').upsert([{
        user_id: user.id,
        display_name: displayName,
        current_role: 'Growth Catalyst • Tier 3'
      }], { onConflict: 'user_id' });

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

// Get Current Logged In User
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

// Log Out
export async function signOutUser() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out error:', err);
  }
}

// ==========================================
// SUPABASE DATABASE HELPERS
// ==========================================

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

    if (error) console.warn('Supabase insert chat error:', error.message);
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
