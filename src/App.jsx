import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import AppLayout from './components/AppLayout';
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

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('synapse_auth_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    await signOutUser();
    localStorage.removeItem('synapse_auth_user');
    localStorage.removeItem('synapse_current_user');
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
