import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import AppLayout from './components/AppLayout';
import { getCurrentUser, signOutUser, subscribeToAuthState } from './lib/supabaseClient';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local session storage fallback for seamless dev experience
    const savedUser = localStorage.getItem('synapse_auth_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.warn('Invalid saved auth user format');
      }
    }

    // 2. Initial check for logged in Supabase user
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('synapse_auth_user', JSON.stringify(user));
      }
      setLoading(false);
    }
    checkAuth();

    // 3. Subscribe to real-time auth changes (Google OAuth redirect & session changes)
    const unsubscribe = subscribeToAuthState((userData) => {
      if (userData) {
        setCurrentUser(userData);
        localStorage.setItem('synapse_auth_user', JSON.stringify(userData));
      } else {
        // If logged out from Supabase
        const currentSaved = localStorage.getItem('synapse_auth_user');
        if (!currentSaved) {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('synapse_auth_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    await signOutUser();
    localStorage.removeItem('synapse_auth_user');
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
      {currentUser ? (
        <AppLayout currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
