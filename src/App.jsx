import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import AppLayout from './components/AppLayout';
import AspirationSetupScreen from './components/AspirationSetupScreen';
import { getCurrentUser, signOutUser, subscribeToAuthState } from './lib/supabaseClient';

const DEFAULT_USER = {
  id: 'usr_default',
  name: 'Atharva Sur',
  email: 'atharva@synapse.ai'
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('synapse_auth_user') || localStorage.getItem('synapse_current_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.warn('Invalid saved auth user format');
    }
    return DEFAULT_USER;
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cache-busting: clear stale media cache entries with empty youtubeId OR old short/reel types
    try {
      const cached = JSON.parse(localStorage.getItem('synapse_curated_media') || '[]');
      const hasStale = cached.some(i =>
        (i.type !== 'article' && (!i.youtubeId || i.youtubeId.length === 0 || i.signalScore === 0)) ||
        i.type === 'short' || i.type === 'reel'
      );
      if (hasStale) {
        localStorage.removeItem('synapse_curated_media');
        console.log('[Synapse] Cleared stale media cache (short/reel types removed).');
      }
    } catch {
      localStorage.removeItem('synapse_curated_media');
    }

    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('synapse_auth_user', JSON.stringify(user));
      }
    }
    checkAuth();

    const unsubscribe = subscribeToAuthState((userData) => {
      if (userData) {
        setCurrentUser(userData);
        localStorage.setItem('synapse_auth_user', JSON.stringify(userData));
      }
    });

    return () => unsubscribe();
  }, []);

  // 'aspiration_setup' state: appears after login if no aspiration saved yet
  const [showAspirationSetup, setShowAspirationSetup] = useState(false);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('synapse_auth_user', JSON.stringify(userData));
    // Show aspiration setup if user hasn't set one
    const hasAspiration = localStorage.getItem('synapse_user_aspiration') || localStorage.getItem('aspiration');
    if (!hasAspiration) {
      setShowAspirationSetup(true);
    }
  };

  const handleAspirationComplete = ({ aspiration }) => {
    setShowAspirationSetup(false);
  };

  const handleLogout = async () => {
    await signOutUser();
    localStorage.removeItem('synapse_auth_user');
    localStorage.removeItem('synapse_current_user');
    localStorage.removeItem('synapse_user_aspiration');
    localStorage.removeItem('aspiration');
    localStorage.removeItem('synapse_user_roadmap');
    localStorage.removeItem('synapse_curated_media');
    localStorage.removeItem('synapse_onboarding_completed');
    setShowAspirationSetup(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Authenticating Synapse Security Gateway...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!currentUser ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : showAspirationSetup ? (
        <AspirationSetupScreen currentUser={currentUser} onComplete={handleAspirationComplete} />
      ) : (
        <AppLayout currentUser={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
