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
      await supabase.from('profiles').insert([{
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

// Log In / Sign Up with Google OAuth
export async function signInWithGoogle() {
  if (!supabase) {
    alert("Supabase credentials not configured in .env. Logging in as Demo User.");
    return { user: { email: 'demo@growth.ai', user_metadata: { display_name: 'Google User' } }, error: null };
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

// Get Current Logged In User
export async function getCurrentUser() {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
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

// Fetch Chat History from Supabase
export async function fetchChatHistoryFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase client exception:', err);
    return null;
  }
}

// Save Chat Message to Supabase
export async function saveChatMessageToSupabase(role, text, suggestions = []) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ role, text, suggestions }])
      .select();

    if (error) {
      console.warn('Supabase insert chat error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase save exception:', err);
    return null;
  }
}

// Clear Chat History in Supabase
export async function clearChatHistoryInSupabase() {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.warn('Supabase clear error:', error.message);
  } catch (err) {
    console.warn('Supabase clear exception:', err);
  }
}

// Save Daily Reflection to Supabase
export async function saveReflectionToSupabase(mood, log_text) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('reflections')
      .insert([{ mood, log_text }])
      .select();

    if (error) console.warn('Supabase reflection error:', error.message);
    return data;
  } catch (err) {
    console.warn('Supabase reflection exception:', err);
    return null;
  }
}
