import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import AppLayout from './components/AppLayout';
import { getCurrentUser, signOutUser, subscribeToAuthState } from './lib/supabaseClient';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check for logged in user
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
      setLoading(false);
    }
    checkAuth();

    // Subscribe to Google OAuth redirect callbacks & session updates
    const unsubscribe = subscribeToAuthState((userData) => {
      if (userData) {
        setCurrentUser(userData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-mono text-sm">
        Initializing Synapse Google Security Gateway...
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
